const Product = require('../model/product')
const slugify = require('slugify')
const Category = require('../model/category');
const User = require('../model/user')
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs')
const { createReadStream } = require('fs')


const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// AWS Upload start

// const { S3Client,PutObjectCommand} = require("@aws-sdk/client-s3");
const env = require('dotenv');
const crypto = require('crypto');

env.config();

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const S3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion
})


// AWS Upload Ends



exports.listProducts = async (req, res) => {
  try {
    const product = await Product.find({});
    for (prod of product) {
      const images = prod.productPictures
      console.log(images);
      for (items of images) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: items.img,
        }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        items.img = url
        console.log(items.img);
      }
    }
    const categoryList = await Category.find({});
    const products = product.reverse()
    console.log(products.productPictures);
    res.render('listProducts', { data: products, categories: categoryList })
  } catch (error) {
    console.log(error);
    res.redirect('/admin/error')
  }
}


exports.createProducts = async (req, res) => {
  let productPictures = []
  // if (req.files.length > 0) {
  //   productPictures = req.files.map(file => {
  //     return { img: file.filename }
  //   })
  // }
  if (req.files.length > 0) {
    for (var i = 0; i < req.files.length; i++) {
      var file = req.files[i];
      const filename = randomImageName()
      productPictures.push({ img: filename });
      console.log(file);
      const params = {
        Bucket: bucketName,
        Key: filename,
        Body: file.buffer,
        ContentType: file.minetype,
      }
      const command = new PutObjectCommand(params)
      await S3.send(command)
      console.log('send');
    }
  }
  console.log(productPictures);
  const {
    name, price, description, category, quantity
  } = req.body

  const product = new Product({
    name: name,
    slug: slugify(name),
    price,
    quantity,
    description,
    productPictures,
    category
    //   ,
    //   createdBy: req.user._id
  })

  try {
    const savedProduct = await product.save()
    res.status(201).redirect('/admin/products')
  } catch (error) {
    console.log(error);
    res.redirect('/admin/error')
  }

}

exports.editProducts = async (req, res) => {
  try {
    const id = req.query.id
    const productone = await Product.findById(id);

    const proimages = productone.productPictures
  for (items of proimages) {
    const getObjectParams = {
      Bucket: bucketName,
      Key: items.img,
    }
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
    items.img = url
  }
    //console.log(productone)
    const categories = await Category.find();
    if (productone) {
      res.render('editProduct', { product: productone, categories: categories, images: productone.productPictures, message: "" });
    } else {
      res.redirect('/admin/products')
    }
  }
  catch (error) {
    res.redirect('/admin/error')
  }
}


exports.deleteProduct = async (req, res) => {
  const id = req.query.id || `${req.params.id}`;
  try {
    const productData = await Product.findById({ _id: id });
    images = productData.productPictures;
    console.log(images);

    for (img of images) {
      const deleteParams = {
        Bucket: bucketName,
        Key: img.img,
      }
      const command = new DeleteObjectCommand(deleteParams)
      await S3.send(command)
    }
    const product = await Product.findByIdAndDelete({ _id: id });
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.redirect('/admin/products');
  } catch (error) {
    console.log(error);
    res.redirect('/admin/error')
  }
}
exports.updateImage = async (req, res) => {
  try {
    let { pId, img } = req.body
    const prod = Product.findOne({ _id: pId })
    const splitStr = img.substr(52, 64);
    images = splitStr;
      const deleteParams = {
        Bucket: bucketName,
        Key: images,
      }
      const command = new DeleteObjectCommand(deleteParams)
      await S3.send(command)
    const data = await Product.updateOne(
      { _id: pId },
      { $pull: { productPictures: { img: splitStr } } }
    )
    const productData = Product.findOne({ _id: pId })
    res.send({ newImage: productData.productPictures.img });
  } catch (error) {
    console.log(error.message);
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const id = req.body.id
    const products = await Product.findById({ _id: id });
    let productPictures = products.productPictures
    const newPictures = [];
    if (req.files.length > 0) {
      // const newPictures = req.files.map(file => {
      //   return { img: file.filename }
      // });
      for (var i = 0; i < req.files.length; i++) {
        var file = req.files[i];
        const filename = randomImageName()
        newPictures.push({ img: filename });
        const params = {
          Bucket: bucketName,
          Key: filename,
          Body: file.buffer,
          ContentType: file.minetype,
        }
        const command = new PutObjectCommand(params)
        await S3.send(command)
        console.log('send');
      }
    }
    productPictures = [...productPictures, ...newPictures];

    products.name = req.body.name;
    products.description = req.body.description;
    products.price = req.body.price;
    products.productPictures = productPictures,
    products.category = req.body.category;
    products.quantity = req.body.quantity;

    await products.save();
    res.redirect('/admin/products');


  } catch (error) {
    console.log(error);
    res.redirect('/admin/error')

  }

}


exports.loadPorductAdd = (req, res) => {
  try {
    Category.find({})
      .then((categories) => {
        if (categories) {
          res.status(200).render('addProducts', { data: categories });
        } else {
          res.status(404).json({ error: "No categories found" });
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json({ error });
      });
  } catch (error) {
    res.redirect('/admin/error')
  }
}


exports.loadShop = async (req, res) => {
  console.log('skskks');

  try {
    const categoryData = await Category.find()
    let { search, sort, category, limit, page, ajax, } = req.query
    if (!search) {
      search = ''
    }
    skip = 0
    if (!limit) {
      limit = 9
    }
    if (!page) {
      page = 0
    }
    skip = page * limit
    let arr = []
    if (category) {
      let n = 0;
      for (i = 0; i < category.length; i++) {
        if (categoryData._id = category[i]) {
          arr[n] = category[i];
          n++;
        }
      }
    } else {
      category = []
      arr = categoryData.map((x) => x._id)
    }
    if (sort == 0) {
      productData = await Product.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }] }] }).sort({ $natural: -1 })

      var zeroQuantityProducts = productData.filter(product => product.quantity === 0);
      var nonZeroQuantityProducts = productData.filter(product => product.quantity !== 0);
      productData = [...nonZeroQuantityProducts, ...zeroQuantityProducts]

      console.log(productData);
      pageCount = Math.floor(productData.length / limit)
      if (productData.length % limit > 0) {
        pageCount += 1
      }
      console.log(productData.length + ' results found ' + pageCount);
      productData = await Product.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }] }] }).sort({ $natural: -1 }).skip(skip).limit(limit)

      zeroQuantityProducts = productData.filter(product => product.quantity === 0);
      nonZeroQuantityProducts = productData.filter(product => product.quantity !== 0);
      productData = [...nonZeroQuantityProducts, ...zeroQuantityProducts]

    } else {
      productData = await Product.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }] }] }).sort({ price: sort })

      zeroQuantityProducts = productData.filter(product => product.quantity === 0);
      nonZeroQuantityProducts = productData.filter(product => product.quantity !== 0);
      productData = [...nonZeroQuantityProducts, ...zeroQuantityProducts]

      pageCount = Math.floor(productData.length / limit)
      if (productData.length % limit > 0) {
        pageCount += 1
      }
      console.log(productData.length + ' results found ' + pageCount);
      productData = await Product.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }] }] }).sort({ price: sort }).skip(skip).limit(limit)

      zeroQuantityProducts = productData.filter(product => product.quantity === 0);
      nonZeroQuantityProducts = productData.filter(product => product.quantity !== 0);
      productData = [...nonZeroQuantityProducts, ...zeroQuantityProducts]

    }
    console.log(productData.length + ' results found');


    for (prod of productData) {
      const images = prod.productPictures
      console.log(images);
      for (items of images) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: items.img,
        }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        items.img = url
        console.log(items.img);
      }
    }


    if (req.session.user) { session = req.session.user } else session = false
    if (pageCount == 0) { pageCount = 1 }
    if (ajax) {
      res.json({ products: productData, pageCount, page })
    } else {
      res.render('shop', { userData: req.session.name, loggedIn: req.session.userLogged, user: session, product: productData, category: categoryData, val: search, selected: category, order: sort, limit: limit, pageCount, page })
    }
  } catch (error) {
    console.log(error.message);
  }
}



exports.loadProductDetails = async (req, res) => {
  const id = req.query.id;
  const product = await Product.findById(id);

  const proimages = product.productPictures
  for (items of proimages) {
    const getObjectParams = {
      Bucket: bucketName,
      Key: items.img,
    }
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
    items.img = url
  }

  const catid = product.category;
  const category = await Category.findById(catid)
  const allproduct = await Product.find();
  for (prod of allproduct) {
    const images = prod.productPictures
    for (items of images) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: items.img,
      }
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
      items.img = url
    }
  }

  res.status(200).render('productDetails', { userData: req.session.name, loggedIn: req.session.userLogged, allproduct: allproduct, product: product, category: category })
}

