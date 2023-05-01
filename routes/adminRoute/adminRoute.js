const express = require("express")
const adminRoute = express()
const env=require('dotenv');
const session = require("express-session")
const config = require("../../config/config") 
const { adminSignIn, loadAdminLogin, loadDashboard, listUser, blockUser, adminlogout, loadErr } = require("../../controller/adminController")
const { loadBanner, loadAddBanner, addBanner, deleteBanner, blockBanner, editModifyBanner, loadEditBanner } = require("../../controller/bannerController")
const { addCategory, getCategories, loadEditCollection, deleteCategory, updateCategory, loadAddCategory, deleteMainCategory } = require("../../controller/categoryController")
const { couponPageLoad, addCoupon, LoadEditCoupon, updateCoupon, deleteCoupon } = require("../../controller/couponController")
const { listProducts, loadPorductAdd, createProducts, editProducts, updateProduct, deleteProduct, updateImage } = require("../../controller/productController")
const { isAdminLogin } = require("../../middleware/adminMiddleware")
const { upload } = require("../../middleware/multerMiddleware");
const { loadOrders, viewOrderDetails, updateStatus, adminViewOrderDetails, sortOrder } = require("../../controller/orderController");
const methodOverride = require('method-override');

adminRoute.use(methodOverride('_method'));


 env.config()

adminRoute.use(session({secret:process.env.SECRET,
    resave: true,
    saveUninitialized: true}))

adminRoute.set("views", "./views/admin");
adminRoute.set("view engine", "ejs");

adminRoute.get('/login',loadAdminLogin)
adminRoute.post('/login',adminSignIn);
adminRoute.get('/dashboard',isAdminLogin,loadDashboard);

adminRoute.get('/users',isAdminLogin,listUser)
adminRoute.put('/block/:id',isAdminLogin,blockUser)


adminRoute.get('/products',isAdminLogin,listProducts)
adminRoute.get('/addproduct',isAdminLogin,loadPorductAdd)
adminRoute.post('/createproduct',upload.array('productPicture'),createProducts);
adminRoute.get('/editproduct',isAdminLogin,editProducts)
adminRoute.post('/updateImage',isAdminLogin,updateImage)
adminRoute.put('/editproduct',isAdminLogin,upload.array('productPicture'),updateProduct)
adminRoute.delete('/deleteproduct/:id',isAdminLogin,deleteProduct)



adminRoute.get('/collections',isAdminLogin,getCategories);
adminRoute.get('/editcollection',isAdminLogin,loadEditCollection); 
adminRoute.delete('/deletecollection/:id',isAdminLogin,deleteCategory); 
adminRoute.delete('/deletemaincollection/:id',isAdminLogin,deleteMainCategory); 
adminRoute.put('/editcollection',isAdminLogin,updateCategory);
adminRoute.get('/category/addcategory',isAdminLogin,loadAddCategory);
adminRoute.post('/category/addcategory',isAdminLogin,addCategory);




adminRoute.get('/error',loadErr);


adminRoute.get('/coupon',isAdminLogin,couponPageLoad);
adminRoute.post('/coupon',isAdminLogin,addCoupon);
adminRoute.get('/editcoupon',isAdminLogin,LoadEditCoupon );
adminRoute.put('/editcoupon',isAdminLogin,updateCoupon );
adminRoute.delete('/deletecoupon/:id',isAdminLogin,deleteCoupon);


adminRoute.get('/orders',isAdminLogin,loadOrders);
adminRoute.get('/loadOrderDetails',isAdminLogin,adminViewOrderDetails);
adminRoute.put('/updateStatus',isAdminLogin,updateStatus);
adminRoute.post('/updateOrder',isAdminLogin,sortOrder);



// Banner Route
adminRoute.get('/banner',isAdminLogin,loadBanner)
adminRoute.get('/addbanner',isAdminLogin,loadAddBanner)
adminRoute.post('/createbanner',isAdminLogin,upload.array('image'),addBanner)
adminRoute.delete('/deletebanner/:id',isAdminLogin,deleteBanner)
adminRoute.put('/blockbanner/:id',isAdminLogin,blockBanner)
adminRoute.get('/editbanner',isAdminLogin,loadEditBanner)
adminRoute.put('/editbanner',isAdminLogin,upload.array('image'),editModifyBanner)



adminRoute.get('/logout',isAdminLogin,adminlogout);

module.exports = adminRoute;
