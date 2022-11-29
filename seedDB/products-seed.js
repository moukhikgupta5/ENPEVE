const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Product = require("../models/product");
const Category = require("../models/category");
const mongoose = require("mongoose");
const faker = require("faker");
const connectDB = require("./../config/db");
connectDB();

async function seedDB() {
  faker.seed(0);

  //----------------------Ankelets
  const ankelets_titles = [
    "Ankelet1",
    "Ankelet2",
    "Ankelet3",
    "Ankelet4",
    "Ankelet5",
    
  ];
  const ankelets_imgs = [
    "https://drive.google.com/uc?export=view&id=1KyRqG7tpnP8sak1p8Yk9QdZD2-fb9uC8",
    "https://drive.google.com/uc?export=view&id=1FiNCnN1PK5QmrZzObdSNkTNbbkZ68UEq",
    "https://drive.google.com/uc?export=view&id=1SLdItKmmvoengMyhRyc7Inn3wqJkHiQJ",
    "https://drive.google.com/uc?export=view&id=1J33RHsWe0NpqyHtT6q6TgS2i8kBfl6fo",
    "https://drive.google.com/uc?export=view&id=1fgC7rf7GrAvcXGp0rCPLl4EdyxB0oskW",
    ];

  //--------------------Bracelet 
  const bracelet_titles = [
    "Bracelet1",
    "Bracelet2",
    "Bracelet3",
    "Bracelet4",
    "Bracelet5",
    "Bracelet6",
    "Bracelet7",
  ];

  const bracelet_imgs = [
    "https://drive.google.com/uc?export=view&id=1eu9oH3XRTd8EWzxrirw9Cx5AXesyT2wt",
    "https://drive.google.com/uc?export=view&id=1OJoabR-va4WYlKXgjSJORaf9p5fVAhNY",
    "https://drive.google.com/uc?export=view&id=1s1e2whCvMa82dO333aoqDtrzJngDuvFZ",
    "https://drive.google.com/uc?export=view&id=1608TafWAVia8pLNoKWHNGDbVcWu4MvJh",
    "https://drive.google.com/uc?export=view&id=1Wapa_jKAMm6o5B-KwUsx-jeOrzs0Yqp7",
    "https://drive.google.com/uc?export=view&id=1Z3bhxZQvHxDwUdOhVj-QTKHoNC98x2Ae",
    "https://drive.google.com/uc?export=view&id=1kPDvfP0f_WdQNpytKB-boTrpk4sRqf5_",
  ];

  //--------------------earcuffs
  const earcuffs_titles = [
    "Earcuff1",
    "Earcuff2",
    "Earcuff3",
    "Earcuff4",
    "Earcuff5",
  ];

  const earcuffs_imgs = [
    "https://drive.google.com/uc?export=view&id=1PVg3Ma1ivh1QkRvMX2opfAP7Pf29F_QT",
    "https://drive.google.com/uc?export=view&id=1eiTcwhNeqd602I4MxstL5YHgA6Hkmp8Z",
    "https://drive.google.com/uc?export=view&id=1dYbpP3Kya_HauTiZkbgvghP2vnab5DaO",
    "https://drive.google.com/uc?export=view&id=1Zr3OtPrqABvtEhZxlfaYbxzfKY0jl6JQ",
    "https://drive.google.com/uc?export=view&id=1ZMoOrJiK0F5Je4iFa5tW8ozHGLkZFg58",
  ];

  //--------------------earrings 
  const earrings_titles = [
    "Earring1",
    "Earring2",
    "Earring3",
    "Earring4",
    "Earring5",
    "Earring6",
  ];
  const earrings_imgs = [
    "https://drive.google.com/uc?export=view&id=1rSIE5C7qroFVFNQCPFDt5ReDAlrIuosq",
    "https://drive.google.com/uc?export=view&id=1KuWL5pvCiEvHe5spjtosLtHEE_wfHbFf",
    "https://drive.google.com/uc?export=view&id=1PQ-ZdzEWLJ1d9uo6zYEIyxMyqrrRHaFt",
    "https://drive.google.com/uc?export=view&id=1WQRIAD1DK34g3AqxKKtGwkOmSVw8CqSZ",
    "https://drive.google.com/uc?export=view&id=1oqOSn9p4IWGnlvodUVrxS4lSWW-0kg02",
    "https://drive.google.com/uc?export=view&id=1mPWWeI9jOu1n8M8cAhRE5gIx17C_kyze",
  ];

  //--------------------necklace

  const necklace_titles = [
    "Necklace1",
    "Necklace2",
    "Necklace3",
    "Necklace4",
    "Necklace5",
    "Necklace6",
  ];
  const necklace_imgs = [
    "https://drive.google.com/uc?export=view&id=1W3UZEAH-LXaPQO6f-9leICw1_X4cIDH2",
    "https://drive.google.com/uc?export=view&id=18OA167tz4sXkVuF0Xv6nco3muvg4DyQx",
    "https://drive.google.com/uc?export=view&id=1HwPD_7WuU2MPXP69Q_9cLs_RbvzN-6pD",
    "https://drive.google.com/uc?export=view&id=1L78nD3YzNnIlAByF8lO41C1cnIkhUt0y",
    "https://drive.google.com/uc?export=view&id=1x6bokzEw0BBwlBJtusPp2ThsqYGo5iQ1",
    "https://drive.google.com/uc?export=view&id=1oHp9McWGf-DvrsACqdcdUVw0xJmyBKLG",
  ];

  //-----------------------pendants
  const pendants_titles = [
    "Pendant1",
    "Pendant2",
    "Pendant3",
    "Pendant4",
    "Pendant5",
  ];
  const pendants_imgs = [
   "https://drive.google.com/uc?export=view&id=1BFXdVUQyZzzie1_PAtar5JGDvbLWmAZU",
   "https://drive.google.com/uc?export=view&id=1967s-AeV9Es5oodEf0RhvNTDJRg8G37W",
   "https://drive.google.com/uc?export=view&id=14g5p-4DEEomPExv5INNaHz1zG2u7P1t_",
   "https://drive.google.com/uc?export=view&id=1TkyeNTV7ixDG573DfWwpf0KTGrCslcK0",
   "https://drive.google.com/uc?export=view&id=1BqCsjIscGVrBNC9jbfL8G9pv5ASHUeaU",
  ];

 
  
  async function seedProducts(titlesArr, imgsArr, categStr) {
    try {
      const categ = await Category.findOne({ title: categStr });
      for (let i = 0; i < titlesArr.length; i++) {
        let prod = new Product({
          productCode: faker.helpers.replaceSymbolWithNumber("####-##########"),
          title: titlesArr[i],
          imagePath: imgsArr[i],
          description: faker.lorem.paragraph(),
          price: faker.random.number({ min: 10, max: 50 }),
          manufacturer: faker.company.companyName(0),
          available: true,
          category: categ._id,
        });
        await prod.save();
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async function closeDB() {
    console.log("CLOSING CONNECTION");
    await mongoose.disconnect();
  }

  await seedProducts(ankelets_titles, ankelets_imgs, "Ankelets");
  await seedProducts(bracelet_titles, bracelet_imgs, "Bracelets");
  await seedProducts(earcuffs_titles, earcuffs_imgs, "Earcuffs");
  await seedProducts(earrings_titles, earrings_imgs, "Earrings");
  await seedProducts(necklace_titles, necklace_imgs, "Necklace");
  await seedProducts(pendants_titles, pendants_imgs, "Pendant");

  await closeDB();
}

seedDB();
