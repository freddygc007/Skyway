const User = require('../model/user')
const {validationResult}=require('express-validator')
const bcrypt = require('bcrypt');
const Product = require('../model/product')
const Category = require('../model/category')
const smscontroller = require("../controller/smsController");
const Banner = require('../model/banner');
const mongoose = require('mongoose');
const address = require('../model/address');
const ObjectId = require('mongoose').Types.ObjectId;
const coupon = require('../model/coupon');
const order = require('../model/order');



exports.signUp = async(req,res,next)=>{
    try {
      const name = req.body.name;
      const email =req.body.email;
      const password =req.body.password;
      const contactNumber = req.body.contactNumber;
  
      const validate = await User.findOne({$or:[{email:email},{contactNumber:contactNumber}]})
      if(validate){
        console.log("user already exist");
        res.render("signup",{message:"user already exist"})
      }
       else{
        const hash_password = await bcrypt.hash(req.body.password,10)

        req.newUser = {
          name:name,
          email:email,
          contactNumber:contactNumber,
          hash_password:hash_password
        }

            const user = new User({
                name:name,
                email:email,
                contactNumber:contactNumber,
                hash_password:hash_password,
                role:"user",
                blocked:"false"
              })
          await user.save().then(()=>console.log("registration successfull"))

          const userData = await User.findOne({email:email})
                req.session.user_id = userData.id;
                req.session.name = userData.name;
                req.session.userLogged = true;    
            res.redirect("home")
      }
    } catch (error) {
      console.log(error.message);
    }
  }

exports.signIn= async(req,res)=>{
    try{
        const email =req.body.email
        const password= req.body.password

        const userData = await User.findOne({email:email})
        if(userData){
            console.log(userData);
            const passwordmatch = await bcrypt.compare(password,userData.hash_password)
            if(passwordmatch && userData.role=="user"){
                console.log('login sucessful');
                if(userData.blocked==false){
                req.session.user_id = userData.id;
                req.session.name = userData.name;
                req.session.userLogged = true; 
            
                res.redirect('/api/home');
                
                }else{
                    console.log("you have been blocked by admin");
                    res.render("signin",{access:"you have been blocked by admin"})
                }
            }else{
                console.log('password is incorrect');
                res.render("signin",{access:"password is incorrect"})
                

            }
        }else{
            console.log("email or password are incorrect");
            res.render("signin",{access:"email or password are incorrect"})
        }
    }
    catch (error) {
        console.log(error.message);
        
    }

}

exports.verifySignInOtp=async(req,res)=>{
    try{
        const phone = req.body.contactNumber;
        const userData = await User.findOne({contactNumber:phone});
        if(userData){
            const userotp= req.body.otp
        const serverotp= req.session.otp
        console.log(userotp)
        if(userotp == serverotp){
            console.log('login sucessful');
            if(userData.blocked==false){
            req.session.user_id = userData.id;
            req.session.name = userData.name;
            req.session.userLogged = true; 
        
            res.redirect('/api/home');
            
            }else{
                console.log("you have been blocked by admin");
                res.render("signin",{access:"you have been blocked by admin"})
            }
        }else{
            console.log('otp Incorrect');
            res.render("signin",{access:"Incorrect Otp"})
        }
        }else{
            console.log("email or password are incorrect");
            res.render("signin",{access:"Cant find the user"})
        }
    }
    catch (error) {
        console.log(error.message);
        
    }
}

exports.loadLogin= async(req,res)=>{
    const message = req.flash('message')[0] || '';
    try {
        if(req.session.userLogged){
            res.redirect("/api/home")
        }else{
            res.render('signin',{access:""})
        }
    } catch (error) {
        console.log(error.message);
    }

}
exports.loadRegister= async(req,res)=>{
    try {
        if(req.session.userLogged){
            res.redirect("/api/home")
        }else{
            res.render('signup')
        }
    } catch (error) {
        console.log(error.message);
    }

}

exports.loadHome= async (req,res)=>{
    const banner=await Banner.find({});
    const product=await Product.find();
    res.status(200).render('home',{userData:req.session.name,loggedIn:req.session.userLogged,banner:banner,product:product});
    }

exports.logoutuser= async(req,res)=>{ 
    try {
        
        req.session.user_id = "";
        req.session.userLogged = null
        res.redirect("/api/home")
        

     } catch (error) {
        console.log(error.message);
    }

}

exports.loadLoginWithOtp= async(req,res)=>{
    try {
        
        res.status(200).render('loginWithOtp')
    } catch (error) {
        
    }
}
exports.loadForgetPassword= async(req,res)=>{
    try {
        
        res.status(200).render('forgetPasswordPhLoad')
    } catch (error) {
        
    }
}

exports.forgotPassword = async(req,res)=>{
    try {
        const phone = req.body.phone
        const userData = await User.findOne({contactNumber:phone});
        if(userData){
        const otp= await smscontroller.sendMessage(phone)
        req.session.otp =otp
        console.log(req.session.otp)
        res.render("otp",{otp:otp,userData:userData,message:""})
        }else{
            res.render('signin',{access:"Can't find the user"})
        }
         
    }
    catch(error){
      console.log(error.message)
  }
  }


exports.otpSend = async(req,res)=>{
    try {
        const phone = req.body.phone
        const userData = await User.findOne({contactNumber:phone});
        if(userData){
        const otp= await smscontroller.sendMessage(phone)
        req.session.otp =otp
        console.log(req.session.otp)
        res.render("otpsignin",{otp:otp,userData:userData,message:""})
        }else{
            res.render('signin',{access:"Can't find the user"})
        }
         
    }
    catch(error){
      console.log(error.message)
  }
  }

  exports.forgotOtp=async(req,res)=>{
    try{
        const phone = req.body.contactNumber;
        const userData = await User.findOne({contactNumber:phone});
        const userotp= req.body.otp
        const serverotp= req.session.otp
        if(userotp == serverotp){
          const password= req.body.password
            res.render("newPassword",{oldpassword:password,userData:userData})
        }else{
            console.log("otp not match");
            res.render("otp",{otp:"",userData:userData,message:"invalid OTP"})
        }
    } catch(error){
        console.log(error.message)
    }
}

exports.resendOtp = async (req, res) => {
    try {
      const serData = req.newUser;
      const userData = await User.findOne({email:serData.email})

      // Check if userData exists and has phone property
      if (!userData || !userData.contactNumber) {
        throw new Error('Invalid user data');
      }
      const phone = userData.contactNumber;
  
      // generate a new OTP and store it in the session
      const newotp = await smscontroller.sendMessage(phone);
      req.session.otp = newotp;
  
      // send the new OTP to the user's email or phone number
      console.log(req.session.otp);
      res.status(200).render('otp', {otp:newotp, userData: userData, message:""});
      } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Something went wrong.' });
    }
  };


  exports.newpasswordAdd = async (req, res) => {
    try {
        const npassword = req.body.password;
        console.log(npassword);
        const phone= req.body.phone;
        const userData = await User.findOne({contactNumber:phone});
        if(!userData){
            console.log('not user');
            return res.status(401).json({ message: 'Invalid credentials' });
        }else{
            userData.set({password:npassword});
            await userData.save()
            res.render('signin',{access:'Password Changed Successfully'})
        }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

exports.loadContact=async(req,res)=>{
    try {
        res.render("contact",{loggedIn: req.session.userLogged,userData:req.session.name})
    } catch (error) {
        
    }
}

//   Cart load

exports.checkoutLoad=async(req,res)=>{
    try {
        const couponData = await coupon.find();
        const userData = req.session.user_id;
        const addresss = await address.find({ userId: userData })
        const userDetails = await User.findById({ _id: req.session.user_id})
        const completeUser = await userDetails.populate('cart.item.productId')
        res.render("checkout", { loggedIn: req.session.userLogged,userData:req.session.name, address: addresss, checkoutdetails: completeUser.cart, coupon: couponData, discount: req.query.coupon,val:10,user:userDetails});
    } catch (error) {
        console.log(error.message);
    }
}
exports.applyCoupon = async (req, res) => {
    try {
        const totalprice = req.body.totalValue;
        userdata = await User.findById({ _id: req.session.user_id });
        offerdata = await coupon.findOne({ code: req.body.coupon });
        if (offerdata) {
            const date1 = new Date(offerdata.expirydate);
            const date2 = new Date(Date.now());
            if (date1.getTime() > date2.getTime()) {
                if(offerdata.usedby){
                    if (offerdata.usedby.includes(req.session.user_id)) {
                        messag = 'coupon already used'
                        console.log(messag);
                    } else {
                        console.log(userdata.cart.totalPrice, offerdata.maxDiscount, offerdata.minPurchase);
                        if (userdata.cart.totalPrice >= offerdata.minPurchase) {
                            // await coupon.updateOne({ name: offerdata.name }, { $push: { usedBy: userdata._id } });
                            disc = (offerdata.discount * totalprice) / 100;
                            if (disc > offerdata.maxDiscount) {
                               disc = offerdata.maxDiscount
                               }
                            res.send({ offerdata, disc, state: 1 })
                        } else {
                            messag = 'cannot apply'
                            res.send({ messag, state: 0 })
                        }
                    }
                }else {
                    if (userdata.cart.totalPrice >= offerdata.minPurchase) {
                        // await coupon.updateOne({ name: offerdata.name }, { $push: { usedBy: userdata._id } });
                        disc = (offerdata.discount * totalprice) / 100;
                        if (disc > offerdata.maxDiscount) {
                           disc = offerdata.maxDiscount
                           }
                        res.send({ offerdata, disc, state: 1 })
                    } else {
                        messag = 'cannot apply'
                        res.send({ messag, state: 0 })
                    }
                }
                
            } else {
                messag = 'coupon Expired'
                res.send({ messag, state: 0 })
            }
        } else {
            messag = 'coupon not found'
            res.send({ messag, state: 0 })
        }
        res.send({ messag, state: 0 })
    }
  
    catch (error) {
        console.log(error.message);
    }
  }


exports.loadProfile= async(req,res)=>{
    try {
        const usid = req.session.user_id;
        const user = await User.findOne({ _id: usid });
        const adid = await address.find({ userId: usid })
        const addressData = await address.find({ userId: usid })
        const orderData = await order.find({ userId: usid }).sort({ createdAt: -1 }).populate("products.item.productId");
        res.render("profile", { userData:req.session.name,loggedIn:req.session.userLogged,user: req.session.user, userAddress: adid, userD: user, address: addressData, order: orderData })
    } catch (error) {
        console.log(error.message);
    }
}
exports.addAddress=async(req,res)=>{
    try {
        userSession = req.session
        const nAddress = await new address({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            country: req.body.country,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            mobile: req.body.mno,
            userId: userSession.user_id
        })
        const newAddress = await nAddress.save();
        if (newAddress) {
            res.redirect("/api/profile");
        }
    } catch (error) {

    }
}
exports.addAddressch=async(req,res)=>{
    try {
        userSession = req.session
        const nAddress = await new address({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            country: req.body.country,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            mobile: req.body.mno,
            userId: userSession.user_id
        })
        const newAddress = await nAddress.save();
        if (newAddress) {
            res.redirect("/api/checkout");
        }
    } catch (error) {

    }
}

exports.deleteAddress = async (req, res) => {
    try {
        const id = req.query.id;
        const Address = await address.deleteOne({ _id: id });
        if (Address) {
            res.redirect("/api/profile");
        }
    } catch (error) {
        console.log(error.message);
    }
}

exports.editAddress = async (req, res) => {
    try {
        const id = req.query.id;
        const addres = await address.findOne({ _id: id })
        res.render("editaddress", {  userData:req.session.name,loggedIn:req.session.userLogged,user: req.session.user, address: addres });
    } catch (error) {
        console.log(error.message);
    }
}

exports.UpdateAddress = async (req, res) => {
    try {
        const id = req.body.id;
        console.log(req.body);
        console.log(id);
        const upadteAddres = await address.updateOne({ _id: id }, {
            $set: {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                country: req.body.country,
                address: req.body.address,
                city: req.body.city,
                zip: req.body.zip,
                mobile: req.body.mno
            }
        })
        console.log(upadteAddres);
        res.redirect("/api/profile")
    } catch (error) {
        console.log(error.message);
    }
}

exports.editUser = async (req, res) => {
    try {
        const currentUser = req.session.user_id;
        const findUser = await User.findOne({ _id: currentUser });
        res.render("editUser", { userData:req.session.name,loggedIn:req.session.userLogged,user: findUser });

    } catch (error) {
        console.log(error.message);
    }
}

exports.editUserUpdate = async (req, res) => {
    try {
        await User.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                contactNumber: req.body.number
            }
        })
        res.redirect("/api/profile")
    } catch (error) {
        console.log(error.message);
    }
}