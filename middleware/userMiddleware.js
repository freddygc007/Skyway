const User = require('../model/user');



exports.isLogin = (req,res,next)=>{
    try {
        if(req.session.userLogged){
            //the user has logged in
           next()
        }else{
            res.redirect('/signin');
        }
    } catch (error) {
        console.log(error.message);
        
    }
}

const isLogout = async (req,res,next)=>{
    try {
        
        if(req.session.userLogged){

            res.redirect("/")
            
        }else{
            
            console.log("hi="+req.session.user_id);
            req.session.loggedIn=false
        } 
        next()
        
    } catch (error) {
        console.log(error.message);
        
    }
}

  exports.isBlocked=async (req, res, next) => {
    try {
      if (req.session.user_id) {
        const user = await User.findById( req.session.user_id); 
        if(!user.blocked){
            next()
        } else {
            console.log(user.name+ "is logging out ....")
            req.session.user_id= null;
            req.session.userLogged = null
            res.render("signin",{access:"you have been blocked by administrator"})
            
        }
    }else{
        next();

    }

    } catch (error) {
      console.log(error.message);
      return res.redirect('/login?message=something went wrong');
    }
  };

  exports.ResetPasswordMwre = async(req,res,next)=>{
    try {
      console.log(req.body.phone);
      const name = req.body.name;
      const email =req.body.email;
      const phone = req.body.contactNumber;
  
        req.newUser = {
          name:name,
          email:email,
          contactNumber:phone
        }
        next()
    } catch (error) {
      console.log(error.message);
    }
  }

  exports.insertUser = async(req,res,next)=>{
    try {
      const name = req.body.name;
      const email =req.body.email;
      const phone = req.body.phone;
      const password =req.body.password;
  
      const validate = await User.findOne({$or:[{email:email},{phone:phone}]})
      if(validate){
        res.render("signin",{message:"user already exist"})
      }
       else{
        req.newUser = {
          name:name,
          email:email,
          phone:phone,
          password:password,
        }
        next()
      }
        
    } catch (error) {
      console.log(error.message);
    }
  }