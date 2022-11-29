const express = require("express");
const csrf = require("csurf");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Product = require("../models/product");
const Category = require("../models/category");
const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");
const Order = require("../models/order");
const middleware = require("../middleware");
const router = express.Router();
const csrfProtection = csrf();
router.use(csrfProtection);

// GET: home page
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .populate("category");
    // console.log(products)
    res.render("shop/home", { pageName: "Home", products });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});


// GET: add a product to the  wishlist when "Add to wishlist" button is pressed
router.get("/add-to-wishlist/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    // get the correct cart, either from the db, session, or an empty cart.
    let user_wishlist;
    if (req.user) {
      user_wishlist = await Wishlist.findOne({ user: req.user._id });
    }
    let wishlist;
    if (
      (req.user && !user_wishlist && req.session.wishlist) ||
      (!req.user && req.session.wishlist)
    ) {
      wishlist = await new Wishlist(req.session.wishlist);
    } else if (!req.user || !user_wishlist) {
      wishlist = new Wishlist({});
    } else {
      wishlist = user_wishlist;
    }

    // add the product to the cart
    const product = await Product.findById(productId);
    const itemIndex = wishlist.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // if product exists in the cart, update the quantity
      wishlist.items[itemIndex].qty++;
      wishlist.items[itemIndex].price = wishlist.items[itemIndex].qty * product.price;
      wishlist.totalQty++;
      wishlist.totalCost += product.price;
    } else {
      // if product does not exists in cart, find it in the db to retrieve its price and add new item
      wishlist.items.push({
        productId: productId,
        qty: 1,
        price: product.price,
        title: product.title,
        productCode: product.productCode,
      });
      wishlist.totalQty++;
      wishlist.totalCost += product.price;
    }

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      wishlist.user = req.user._id;
      await wishlist.save();
    }
    req.session.wishlist = wishlist;
    req.flash("success", "Item added to the wishlist");
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});


// GET: view wishlist content  
router.get("/wishlist", async (req, res) => {
  try {
    // find the cart, whether in session or in db based on the user state
    let wishlist_user;
    if (req.user) {
      wishlist_user = await Wishlist.findOne({ user: req.user._id });
    }
    // if user is signed in and has cart, load user's cart from the db
    if (req.user && wishlist_user) {
      req.session.cart = wishlist_user;
      return res.render("shop/wishlist", {
        cart: wishlist_user,
        pageName: "Wishlist",
        products: await productsFromCart(wishlist_user),
      });
    }
    // if there is no cart in session and user is not logged in, cart is empty
    if (!req.session.wishlist) {
      return res.render("shop/wishlist", {
        cart: null,
        pageName: "Wishlist",
        products: null,
      });
    }
    // otherwise, load the session's cart
    return res.render("shop/wishlist", {
      cart: req.session.wishlist,
      pageName: "Wishlist",
      products: await productsFromCart(req.session.wishlist),
    });
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

// GET: remove all instances of a single product from the cart
router.get("/removeWish/:id", async function (req, res, next) {
  const productId = req.params.id;
  let wishlist;
  try {
    if (req.user) {
      wishlist = await Wishlist.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      wishlist = await new Wishlist(req.session.cart);
    }
    //fnd the item with productId
    let itemIndex = wishlist.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      //find the product to find its price
      wishlist.totalQty -= wishlist.items[itemIndex].qty;
      wishlist.totalCost -= wishlist.items[itemIndex].price;
      await wishlist.items.remove({ _id: wishlist.items[itemIndex]._id });
    }
    req.session.cart = wishlist;
    //save the cart it only if user is logged in
    if (req.user) {
      await wishlist.save();
    }
    //delete cart if qty is 0
    if (wishlist.totalQty <= 0) {
      req.session.cart = null;
      await Wishlist.findByIdAndRemove(wishlist._id);
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});


// GET: add a product to the shopping cart when "Add to cart" button is pressed
router.get("/add-to-cart/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    // get the correct cart, either from the db, session, or an empty cart.
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
    let cart;
    if (
      (req.user && !user_cart && req.session.cart) ||
      (!req.user && req.session.cart)
    ) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }

    // add the product to the cart
    const product = await Product.findById(productId);
    const itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // if product exists in the cart, update the quantity
      cart.items[itemIndex].qty++;
      cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
      cart.totalQty++;
      cart.totalCost += product.price;
    } else {
      // if product does not exists in cart, find it in the db to retrieve its price and add new item
      cart.items.push({
        productId: productId,
        qty: 1,
        price: product.price,
        title: product.title,
        productCode: product.productCode,
      });
      cart.totalQty++;
      cart.totalCost += product.price;
    }

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }
    req.session.cart = cart;
    req.flash("success", "Item added to the shopping cart");
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

// GET: view shopping cart content  
router.get("/shopping-cart", async (req, res) => {
  try {
    // find the cart, whether in session or in db based on the user state
    let cart_user;
    if (req.user) {
      cart_user = await Cart.findOne({ user: req.user._id });
    }
    // if user is signed in and has cart, load user's cart from the db
    if (req.user && cart_user) {
      req.session.cart = cart_user;
      return res.render("shop/shopping-cart", {
        cart: cart_user,
        pageName: "Shopping Cart",
        products: await productsFromCart(cart_user),
      });
    }
    // if there is no cart in session and user is not logged in, cart is empty
    if (!req.session.cart) {
      return res.render("shop/shopping-cart", {
        cart: null,
        pageName: "Shopping Cart",
        products: null,
      });
    }
    // otherwise, load the session's cart
    return res.render("shop/shopping-cart", {
      cart: req.session.cart,
      pageName: "Shopping Cart",
      products: await productsFromCart(req.session.cart),
    });
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});




// GET: reduce one from an item in the shopping cart
router.get("/reduce/:id", async function (req, res, next) {
  // if a user is logged in, reduce from the user's cart and save
  // else reduce from the session's cart
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }

    // find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      const product = await Product.findById(productId);
      // if product is found, reduce its qty
      cart.items[itemIndex].qty--;
      cart.items[itemIndex].price -= product.price;
      cart.totalQty--;
      cart.totalCost -= product.price;
      // if the item's qty reaches 0, remove it from the cart
      if (cart.items[itemIndex].qty <= 0) {
        await cart.items.remove({ _id: cart.items[itemIndex]._id });
      }
      req.session.cart = cart;
      //save the cart it only if user is logged in
      if (req.user) {
        await cart.save();
      }
      //delete cart if qty is 0
      if (cart.totalQty <= 0) {
        req.session.cart = null;
        await Cart.findByIdAndRemove(cart._id);
      }
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

// GET: remove all instances of a single product from the cart
router.get("/removeAll/:id", async function (req, res, next) {
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    //fnd the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      //find the product to find its price
      cart.totalQty -= cart.items[itemIndex].qty;
      cart.totalCost -= cart.items[itemIndex].price;
      await cart.items.remove({ _id: cart.items[itemIndex]._id });
    }
    req.session.cart = cart;
    //save the cart it only if user is logged in
    if (req.user) {
      await cart.save();
    }
    //delete cart if qty is 0
    if (cart.totalQty <= 0) {
      req.session.cart = null;
      await Cart.findByIdAndRemove(cart._id);
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

// GET: checkout form with csrf token
router.get("/checkout", middleware.isLoggedIn, async (req, res) => {
  const errorMsg = req.flash("error")[0];

  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  //load the cart with the session's cart's id from the db
  var cart = await Cart.findById(req.session.cart._id);

  const errMsg = req.flash("error")[0];
  res.render("shop/checkout", {
    total: cart.totalCost,
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Checkout",
  });
});

// POST: handle checkout logic and payment using Stripe
router.post("/checkout", middleware.isLoggedIn, async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  const cart = await Cart.findById(req.session.cart._id);
  
  const order = new Order({
    user: req.user,
    cart: {
      totalQty: cart.totalQty,
      totalCost: cart.totalCost,
      items: cart.items,
    },
    address: req.body.address,
    paymentId: "COD",
  });
  order.save(async (err, newOrder) => {
    if (err) {
      console.log(err);
      return res.redirect("/checkout");
    }
    // await cart.save();
    await Cart.findByIdAndDelete(cart._id);
    req.flash("success", "Successfully purchased");
    req.session.cart = null;
    res.redirect("/user/profile");
  });
  // stripe.charges.create(
  //   {
  //     amount: cart.totalCost * 100,
  //     currency: "usd",
  //     source: req.body.stripeToken,
  //     description: "Test charge",
  //   },
  //   function (err, charge) {
  //     if (err) {
  //       // req.flash("error", err.message);
  //       console.log(err);
  //       // return res.redirect("/checkout");
  //     }
  //     const order = new Order({
  //       user: req.user,
  //       cart: {
  //         totalQty: cart.totalQty,
  //         totalCost: cart.totalCost,
  //         items: cart.items,
  //       },
  //       address: req.body.address,
  //       paymentId: charge.id,
  //     });
  //     order.save(async (err, newOrder) => {
  //       if (err) {
  //         console.log(err);
  //         return res.redirect("/checkout");
  //       }
  //       await cart.save();
  //       await Cart.findByIdAndDelete(cart._id);
  //       req.flash("success", "Successfully purchased");
  //       req.session.cart = null;
  //       res.redirect("/user/profile");
  //     });
  //   }
  // );
});

// create products array to store the info of each product in the cart
async function productsFromCart(cart) {
  let products = []; // array of objects
  for (const item of cart.items) {
    let foundProduct = (
      await Product.findById(item.productId).populate("category")
    ).toObject();
    foundProduct["qty"] = item.qty;
    foundProduct["totalPrice"] = item.price;
    products.push(foundProduct);
  }
  return products;
}

module.exports = router;
