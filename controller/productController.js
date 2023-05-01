const Product = require('../model/product')
const slugify = require('slugify')
const Category = require('../model/category');
const User = require('../model/user')
const fs = require('fs')
const path = require('path');
const mongoose = require('mongoose');





exports.listProducts = async (req, res) => {
  try {
    const product = await Product.find({});
    const categoryList = await Category.find({});
    const products = product.reverse()
    res.render('listProducts', { data: products, categories: categoryList })
  } catch (error) {
    res.redirect('/api/admin/error')
  }
}


exports.createProducts = async (req, res) => {
  let productPictures = []
  if (req.files.length > 0) {
    productPictures = req.files.map(file => {
      return { img: file.filename }
    })
  }
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
    res.status(201).redirect('/api/admin/products')
  } catch (error) {
    res.redirect('/api/admin/error')
  }

}

exports.editProducts = async (req, res) => {
  try {
    const id = req.query.id
    const productone = await Product.findById(id);
    //console.log(productone)
    const categories = await Category.find();
    if (productone) {
      res.render('editProduct', { product: productone, categories: categories, images: productone.productPictures, message: "" });
    } else {
      res.redirect('/admin/products')
    }
  }
  catch (error) {
    res.redirect('/api/admin/error')
  }
}

exports.deleteProduct = async (req, res) => {
  const id = req.query.id||`${req.params.id}`;
  try {
    const product = await Product.findByIdAndDelete({ _id: id });
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.redirect('/api/admin/products');
  } catch (error) {
    res.redirect('/api/admin/error')
  }
}
exports.updateImage = async (req, res) => {
  try {
    let { pId, img } = req.body
    const data = await Product.updateOne(
      { _id: pId },
      { $pull: { productPictures: { img: img } } }
    )
    const filePath = path.join(path.dirname(__dirname), `./public/uploads/${img}`)
    if (!fs.existsSync(filePath)) {
      console.error('Error: /uploads directory does not exist');
      return;
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log(`File ${filePath} does not exist`);
        } else {
          console.error(`Error deleting file ${filePath}: ${err}`);
        }
        return;
      }

      console.log(`File ${filePath} deleted successfully`);
    });

    console.log('Old file deleted successfully');
    const productData = Product.findOne({ _id: pId })
    console.log(productData);
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
    if (req.files.length > 0) {
      const newPictures = req.files.map(file => {
        return { img: file.filename }
      });
      productPictures = [...productPictures, ...newPictures];
    }

    products.name = req.body.name;
    products.description = req.body.description;
    products.price = req.body.price;
    products.productPictures = productPictures,
      products.category = req.body.category;
    products.quantity = req.body.quantity;

    await products.save();
    res.redirect('/api/admin/products');


  } catch (error) {
    res.redirect('/api/admin/error')

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
    res.redirect('/api/admin/error')
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
      productData =[...nonZeroQuantityProducts,...zeroQuantityProducts]

      console.log(productData);
      pageCount = Math.floor(productData.length / limit)
      if (productData.length % limit > 0) {
        pageCount += 1
      }
      console.log(productData.length + ' results found ' + pageCount);
      productData = await Product.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }] }] }).sort({ $natural: -1 }).skip(skip).limit(limit)

      zeroQuantityProducts = productData.filter(product => product.quantity === 0);
      nonZeroQuantityProducts = productData.filter(product => product.quantity !== 0);
      productData =[...nonZeroQuantityProducts,...zeroQuantityProducts]
      
    } else {
      productData = await Product.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }] }] }).sort({ price: sort })

      zeroQuantityProducts = productData.filter(product => product.quantity === 0);
      nonZeroQuantityProducts = productData.filter(product => product.quantity !== 0);
      productData =[...nonZeroQuantityProducts,...zeroQuantityProducts]
      
      pageCount = Math.floor(productData.length / limit)
      if (productData.length % limit > 0) {
        pageCount += 1
      }
      console.log(productData.length + ' results found ' + pageCount);
      productData = await Product.find({ $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }] }] }).sort({ price: sort }).skip(skip).limit(limit)

      zeroQuantityProducts = productData.filter(product => product.quantity === 0);
      nonZeroQuantityProducts = productData.filter(product => product.quantity !== 0);
      productData =[...nonZeroQuantityProducts,...zeroQuantityProducts]
      
    }
    console.log(productData.length + ' results found');
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
  const catid = product.category;
  const category = await Category.findById(catid)
  const allproduct=await Product.find();
  res.status(200).render('productDetails', { userData: req.session.name, loggedIn: req.session.userLogged,allproduct:allproduct, product: product, category: category })
}

