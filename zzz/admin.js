const User = require('../model/user')
const bcrypt = require('bcrypt')
const Product = require('../model/product')
const shortid = require('shortid')
const slugify =require('slugify')
const Category=require('../model/category');  
const mongoose = require('mongoose');
const Coupon=require('../model/coupon')
const { name } = require('ejs')
const Banner = require('../model/banner')



exports.adminSignIn= async(req,res)=>{
    try{
        const email =req.body.email
        const password= req.body.password

        const userData = await User.findOne({email:email})
        if(userData){
            console.log(userData);
            const passwordmatch = await bcrypt.compare(password,userData.hash_password)
            if(passwordmatch){
                console.log('login sucessful');
                if(userData.role=="admin"){
                req.session.admin_id = userData.id;
                req.session.userLogged = true;
            
                res.redirect('/admin/dashboard');
                
                }else{
                    res.render("adminSignin",{message:"Authorisation Required"})
                }
            }else{
                res.render("adminSignin",{message:"password is incorrect"})

            }
        }else{
            res.render("adminSignin",{message:"email or password are incorrect"})
        }
    }
    catch (error) {
      res.redirect('/admin/error')
        
    }

}


exports.loadAdminLogin= async(req,res)=>{
    try {
        if(req.session.userLogged){
            res.redirect("/admin/dashboard")
        }else{
            res.render('adminSignin')
        }
    } catch (error) {
      res.redirect('/admin/error')
    }

}
exports.loadDashboard= async(req,res)=>{
    try {
        if(req.session.userLogged){
            res.render('dashboard')
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
      res.redirect('/admin/error')
    }

}

exports.adminlogout = async(req,res)=>{
    try{
        req.session.admin_id =null
        console.log(req.session.admin_id)
    
    req.session.userLogged=false
    console.log( req.session.adminlogged);
    res.redirect("/admin/login")
} catch(error){
  res.redirect('/admin/error')
}
}

exports.listUser =  async(req,res)=>{
    try {
        const userData = await User.find({role:'user'});
        res.render('userList',{users:userData})
    } catch (error) {
      res.redirect('/admin/error')
    }
}

exports.blockUser = async(req,res)=>{
    try{
      const id = req.query.id
      const user = await User.findById({_id:id})
      if(user){
        user.blocked=!user.blocked
        await user.save()
        console.log(user);
        res.redirect("/admin/users")
      }else{
        res.status(404).json({message: "user not found"})
      }
  
    }
    catch (error) {
      res.redirect('/admin/error')
  }
  
  
  }
exports.loadPorductAdd=(req,res)=>{
    try {
        Category.find({})
      .then((categories) => {
        if (categories) {
          res.status(200).render('addProducts',{data:categories});
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

function createCategories(categories, parentId=null){
    const categoryList=[];
    let category;
    if(parentId ==null){
        category = categories.filter(cat => cat.parentId == undefined);
    }else{
        category = categories.filter(cat => cat.parentId == parentId);
    }

    for(let cate of category){
        categoryList.push({
        _id: cate._id,
        name: cate.name,
        slug: cate.slug,
        delete: cate.delete,
        children: createCategories(categories,cate._id)
        });
    }

    return categoryList;
}

exports.listProducts =  async(req,res)=>{
    try {
        const product = await Product.find({});
        console.log(product);
        const categoryList = await Category.find({});
        const products=product.reverse()
        res.render('listProducts',{data:products,categories:categoryList})
    } catch (error) {
      res.redirect('/admin/error')
    }
}



exports.addCategory=async(req,res)=>{

  newName = req.body.name;

  const foundName = await Category.findOne({ name: { $regex: new RegExp(`^${newName}$`, 'i') } });
console.log(foundName);

  if(foundName){
    Category.find({})
    .then((categories) => {
      if (categories) {
        const categoryList = createCategories(categories);
        res.status(200).render('addCategories',{data:categoryList,err:"The category already exists"});
      } else {
        res.status(404).json({ error: "No categories found" });
      }
    })
    .catch((error) => {
      res.redirect('/admin/error')
    });
  }else{
    const categoryObj={
      name: req.body.name,
      slug: slugify(req.body.name),
      delete:"false"
  }

  if(req.body.parentId){
      categoryObj.parentId=req.body.parentId;
  }

  const cat =new Category(categoryObj);
  cat.save()
  .then((category)=>{
      res.status(201).redirect('/admin/collections')
      return console.log(category)})
  .catch((error)=>{return res.redirect('/admin/error')})
  }
};


exports.getCategories = (req, res) => {
    Category.find({})
      .then((categories) => {
        if (categories) {
          const categoryList = createCategories(categories);
          console.log(categoryList);
          res.status(200).render('collectionList',{data:categoryList,err:""});
        } else {
          res.status(404).json({ error: "No categories found" });
        }
      })
      .catch((error) => {
        cres.redirect('/admin/error')
      });
  };

exports.loadAddCategory= async (req,res)=>{
    try {
        Category.find({})
      .then((categories) => {
        if (categories) {
          const categoryList = createCategories(categories);
          res.status(200).render('addCategories',{data:categoryList,err:"" });
        } else {
          res.status(404).json({ error: "No categories found"});
        }
      })
      .catch((error) => {
        res.redirect('/admin/error')
      });
    } catch (error) {
      res.redirect('/admin/error')
    }
}

exports.loadEditCollection = async (req,res)=>{
    try {
        const id = req.query.id;
        const categories = await Category.findById({_id:id});
        const allcollection = await Category.find({});   
        if(categories){
            
           await res.render('editCollection',{data:categories,alldata:allcollection});
        }else{
            res.redirect('/admin/collections')
        }
        
    } catch (error) {
      res.redirect('/admin/error')
    }
}

exports.updateCategory = async(req,res)=>{
    try {
        const id = await req.body.id;
        console.log(id);
        const categories = await Category.findById({_id:id});
            categories.name = req.body.name;
            categories.parentId = req.body.parentId;
            await categories.save();
            res.redirect('/admin/collections');
        
         } catch (error) {
          res.redirect('/admin/error')
    }
}

exports.deleteCategory = async(req, res) => {
    const id = req.query.id;
    console.log(id);
    try {
      const categories = await Category.findById({_id:id});
      if(categories){
        const products = await Product.find({category:id});
          console.log('before product');
          console.log(products);
        if(products.length>0){
          console.log('hai');
          categories.delete=!categories.delete
          await categories.save()
          res.redirect('/admin/collections');
        }else{
          const delcategory = await Category.findByIdAndDelete({_id:id});
          console.log('delcategory');
          res.redirect('/admin/collections');
        }
      }else{
        res.redirect('/admin/error')
      }
    } catch (error) {
      res.redirect('/admin/error')
    }
  }
  
// exports.deleteCategory = async(req, res) => {
//     const id = req.query.id;
//     console.log(id);
//     try {
//       const categories = await Category.findByIdAndDelete({_id:id});
//       console.log(categories);
//       if (!categories) {
//         return res.status(404).send("Category not found");
//       }
//       res.redirect('/admin/collections');
//     } catch (error) {
//       res.redirect('/admin/error')
//     }
//   }
  
  
  exports.createProducts= async (req,res)=>{
      let productPictures=[]      
      if(req.files.length>0){
          productPictures=req.files.map(file =>{
              return {img: file.filename}
          })
      }
      console.log('Create product ethi');
      const {
          name,price,description,category,quantity
      }=req.body
  
      const product = new Product({
          name:name,
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
        res.redirect('/admin/error')
      }
    
  }

  exports.editProducts=async(req,res)=>{
    try{
        const id = req.query.id
        const productone = await Product.findById(id);
        //console.log(productone)
        const categories = await Category.find();
        console.log(productone.category);
        if(productone){
          res.render('editProduct',{product:productone,categories:categories,images:productone.productPictures,message:""});
      }else{
          res.redirect('/admin/products')
      }
        }
      catch(error){
        res.redirect('/admin/error')
      }
  }

  exports.deleteProduct=async (req,res)=>{
    const id=req.query.id
    console.log(id);
    try {
        const product = await Product.findByIdAndDelete({_id:id});
        console.log(product);
        if (!product) {
            return res.status(404).send("Product not found");
          }
        res.redirect('/admin/products');
    } catch (error) {
      res.redirect('/admin/error')
    }
  }

  exports.updateProduct = async(req,res)=>{
      try {
        const id=req.body.id
        const products = await Product.findById({_id:id});
        let productPictures=products.productPictures
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

            await products.save();
            res.redirect('/admin/products');


      } catch (error) {
        res.redirect('/admin/error')

      }

  }
  
  exports.couponPageLoad= async(req,res)=>{
    const coupons=await Coupon.find({});
    console.log(coupons);
    res.status(200).render('couponPage',{coupon:coupons});
  }


  exports.addCoupon= async(req,res)=>{
    console.log(req.body);
    try {
      const { code, discount, expirydate, minPurchase, maxDiscount} =req.body;
  
      let coupons = await Coupon.findOne({ code });
      if (coupons) {
        return res.status(400).json({ errors: [{ msg: 'Coupon already exists' }] });
      }else{

        const expiryDates = new Date(expirydate);
        // get the year, month, and day as strings
        const year = expiryDates.getFullYear().toString();
        const month = (expiryDates.getMonth() + 1).toString().padStart(2, '0'); // add leading zero if needed
        const day = expiryDates.getDate().toString().padStart(2, '0'); // add leading zero if needed
        // format the date as "yyyy-mm-dd"
        const formattedDate = `${day}-${month}-${year}`;
        console.log(formattedDate);


        const newcoupon = new Coupon({
          code:code,
          discount:discount,
          expirydate:formattedDate,
          minPurchase:minPurchase,
          maxDiscount:maxDiscount,
          createdDate: new Date(),
          isActive:true
        });
    
        await newcoupon.save();
    
        res.redirect('/admin/coupon');
      } 
      }
  
      catch (err) {
        console.log(err);
        res.redirect('/admin/error')
      }
  }

  exports.deleteCoupon = async(req,res)=>{
    const id=req.query.id
    console.log(id);
    try {
        const coupon = await Coupon.findByIdAndDelete({_id:id});
        console.log(coupon);
        if (!coupon) {
            return res.status(404).send("Product not found");
          }
        res.redirect('/admin/coupon');
  }
  catch(error){
    res.redirect('/admin/error')
  }
}

exports.loadErr=(req,res)=>{
  res.render('error')
}

exports.LoadEditCoupon = async(req,res)=>{
  try {
      const id=req.query.id
      const edcoupon = await Coupon.findById({_id:id});
      console.log(edcoupon.expirydate);

      expiryDate=edcoupon.expirydate;
      const day = expiryDate.split("-")[0];
      const month = expiryDate.split("-")[1];
      const year = expiryDate.split("-")[2];
      const formattedDate = `${year}-${month}-${day}`;
      console.log(formattedDate);


      res.status(200).render('editCoupon',{coupon:edcoupon,date:formattedDate})
      } catch (error) {
      res.redirect('/admin/error')
  }
}
exports.updateCoupon = async(req,res)=>{
  try {
      const id=req.body.id
      console.log(id);
      const edcoupon = await Coupon.findById({_id:id});
      console.log(edcoupon);
      if(edcoupon){
        const { code, discount, expirydate, minPurchase, maxDiscount} =req.body;
          edcoupon.code = code;
          edcoupon.discount = discount;
          edcoupon.expirydate = expirydate;
          edcoupon.minPurchase = minPurchase;
          edcoupon.maxDiscount = maxDiscount;
          await edcoupon.save();
          res.redirect('/admin/coupon');
      }else{
        return res.status(404).json({ errors: [{ msg: 'Coupon not found' }] });
      }
       } catch (error) {
        console.log(error);
        // res.redirect('/admin/error')
  }
}



//-------------- Banner --------------//

exports.loadBanner = async (req, res) => {
  try {
    const banners = await Banner.find()
    console.log(banners);
    res.render("banner",{ banner: banners });
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadAddBanner = async (req, res) => {
  try {
    console.log('loadAddBanner ethi');
    res.render("addBanner");
  } catch (error) {
    console.log(error.message);
  }
}

exports.addBanner=async(req,res)=>{
  if (req.files.length != 0) {
    try {
      const bannerDetails = new Banner({
        name: req.body.name,
        image: req.files.map((x) => x.filename),
        description: req.body.description,
        link:req.body.link
      });
      const bannerData = await bannerDetails.save();
      if (bannerData) {
        res.redirect("/admin/banner");
      }
    } catch (error) {
      console.log(error.message);
    }
  } else {
    const bannerData = await banner.find();
    const userData = await User.find();
    res.render("addBanner", { admin: userData, banners: bannerData, message: "file should be image" })
  }
}

exports.deleteBanner=async(req,res)=>{
  const id=req.query.id
  try {
    const Ban = await Banner.findByIdAndDelete({_id:id});
    if (!Ban) {
      return res.status(404).send("Product not found");
    }
  res.redirect('/admin/banner');
} catch (error) {
  res.redirect('/admin/error')
}
}

exports.blockBanner = async(req,res)=>{
  const id=req.query.id
  try {
    const disBanner = await Banner.findById({_id:id});
    console.log(disBanner);
    disBanner.is_active=!disBanner.is_active;
    const upBanner = await disBanner.save();
    if(upBanner){
      res.redirect('/admin/banner');
    }else{
      res.redirect('/admin/error')
    }
  } catch (error) {
    res.redirect('/admin/error')
  }
}