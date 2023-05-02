const User = require('../model/user')
const bcrypt = require('bcrypt')
const Product = require('../model/product')
const orders = require('../model/order')




exports.adminSignIn= async(req,res)=>{
    try{
        const email =req.body.email
        const password= req.body.password

        const userData = await User.findOne({email:email})
        if(userData){
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
// exports.loadDashboard= async(req,res)=>{
//     try {
//         if(req.session.userLogged){
//             res.render('dashboard')
//         }else{
//             res.redirect('/admin/login')
//         }
//     } catch (error) {
//       res.redirect('/admin/error')
//     }

// }
exports.loadDashboard = async (req, res) => {
  try {
    const products = await Product.find()
    let pds = [], qty = []
    products.map(x => {
      pds = [...pds, x.name]
      qty = [...qty, x.quantity]
    })
    const arr = [];
    const order = await orders.find().populate('products.item.productId');
    for (let orders of order) {
      for (let product of orders.products.item) {
        const index = arr.findIndex(obj => obj.product == product.productId.name);
        if (index !== -1) {
          arr[index].qty += product.qty;
        } else {
          arr.push({ product: product.productId.name, qty: product.qty });
        }
      }
    }
    const key1 = [];
    const key2 = [];
    arr.forEach(obj => {
      key1.push(obj.product);
      key2.push(obj.qty);
    });
    const sales = key2.reduce((value, number) => {
      return value + number;
    }, 0)
    let totalRevenue =0
    for(let orders of order){
       totalRevenue += orders.products.totalPrice;
     }
    const userData = await User.findById({ _id: req.session.admin_id });
    const recorders = await orders.find({})
    const users=await User.find({})
    res.render("dashboard", { admin: userData, key1, key2, pds, qty, sales,totalRevenue,users,recorders});
  } catch (error) {
    console.log(error.message);
  }
};

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
      const id = req.params.id;
      console.log(id);
      const user = await User.findById({_id:id})
      if(user){
        user.blocked=!user.blocked
        console.log(user.blocked);
        await user.save()
        res.redirect("/admin/users")
      }else{
        res.status(404).json({message: "user not found"})
      }
    }
    catch (error) {
      res.redirect('/admin/error')
  }
  }


exports.loadErr=(req,res)=>{
  res.render('error')
}
