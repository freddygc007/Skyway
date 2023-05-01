const express = require("express")
const userRoute = express()
const env=require('dotenv');
const session = require("express-session")
const config = require("../../config/config") 
const { signIn, signUp, loadLogin, loadHome, loadRegister, logoutuser, loadForgetPassword, loadEnterOtp, forgotPassword, resendOtp, forgotOtp, newpasswordAdd, otpSend, verifySignInOtp, loadLoginWithOtp, checkoutLoad, confirmationLoad, loadProfile, addAddress, deleteAddress, editAddress, UpdateAddress, editUser, editUserUpdate, applyCoupon, addAddressch, loadContact } = require("../../controller/userController")
const { isLogin, isBlocked, ResetPasswordMwre } = require("../../middleware/userMiddleware")
const { validateSigninRequest, validateSignupRequest } = require("../../validator/validator")
const { cartLoad, addCart, removeFromCart, updateCart } = require("../../controller/cartController")
const { loadShop, loadProductDetails } = require("../../controller/productController");
const { placeOrder, cancelOrder, viewOrderDetails, loadOrderSuccess, retunOrder } = require("../../controller/orderController");
const { loadWishlist, addWishlist, addToCartremovefromwishlist, deleteWishlist } = require("../../controller/wishlistController");

env.config()

userRoute.use(session({secret:process.env.SECRET,
    resave: true,
    saveUninitialized: true}))

userRoute.set("views", "./views/user");
userRoute.set("view engine", "ejs");


userRoute.get('/signin',loadLogin)
userRoute.get('/signup',loadRegister)
userRoute.post('/signin',validateSigninRequest,signIn);
userRoute.post('/signup',validateSignupRequest,signUp);
userRoute.get('/logout',logoutuser)
userRoute.get('/otplogin',loadLoginWithOtp)
userRoute.post('/otpverify',otpSend)
userRoute.post('/verifysignin',verifySignInOtp)


//To load Forget Password ejs
userRoute.get('/forgetpassword',loadForgetPassword)

//To load Otp Page and Send Otp and Save Otp in session
userRoute.post('/forgetpassword',forgotPassword)

//To load New Password Page and verifying both otp
userRoute.post('/forgetotp',forgotOtp)

//To resend Otp
userRoute.post('/resendotp',ResetPasswordMwre,resendOtp)


userRoute.post('/newpasswordadd',ResetPasswordMwre,newpasswordAdd)


userRoute.get('/contact',isBlocked,loadContact)
userRoute.get('/',isBlocked,loadHome)
userRoute.get('/home',isBlocked,loadHome)
userRoute.get('/shop',isBlocked,loadShop)
userRoute.get('/viewProduct',isBlocked,loadProductDetails)

userRoute.get('/cart',isLogin,isBlocked,cartLoad)
userRoute.get('/addcart',isLogin,isBlocked,addCart)
userRoute.post('/updatecart',isLogin,isBlocked,updateCart)
userRoute.get('/removecart',isLogin,isBlocked,removeFromCart)


userRoute.get('/wishlist',isLogin,isBlocked,loadWishlist)
userRoute.get('/addWishlist',isLogin,isBlocked,addWishlist)
userRoute.get('/adCartremoveWishlist',isLogin,isBlocked,addToCartremovefromwishlist)
userRoute.get('/deleteWishlist',isLogin,isBlocked,deleteWishlist)


userRoute.get('/checkout',isLogin,isBlocked,checkoutLoad)
userRoute.post('/applyCoupon',isLogin,isBlocked,applyCoupon)

userRoute.get('/onlinePayment',isLogin,isBlocked,loadOrderSuccess)
userRoute.post('/placeorder',isLogin,isBlocked,placeOrder)
userRoute.get('/cancelorder',isLogin,isBlocked,cancelOrder)
userRoute.get('/vieworder',isLogin,isBlocked,viewOrderDetails)
userRoute.get('/returnorder',isLogin,isBlocked,retunOrder)

userRoute.get('/profile',isLogin,isBlocked,loadProfile)
userRoute.get('/editUser',isLogin,isBlocked,editUser)
userRoute.post('/editUser',isLogin,isBlocked,editUserUpdate)
userRoute.post('/addAddress',isLogin,isBlocked,addAddress)
userRoute.post('/addAddressch',isLogin,isBlocked,addAddressch)
userRoute.get('/delete',isLogin,isBlocked,deleteAddress)
userRoute.get('/editaddress',isLogin,isBlocked,editAddress)
userRoute.post('/editaddress',isLogin,isBlocked,UpdateAddress)


module.exports = userRoute;