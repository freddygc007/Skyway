const User = require('../model/user')
const {validationResult}=require('express-validator')
const bcrypt = require('bcrypt');
const Product = require('../model/product')
const Category = require('../model/category')
const smscontroller = require("../controller/smsController");
const Banner = require('../model/banner');

exports.cartLoad = async (req, res) => {
    try {
      if (req.session.userLogged) {
        const categories = await Category.find({ deleted: false });
        const userData = await User.findById(req.session.user_id);
        const cartproducts = await userData.populate("cart.item.productId");  
        res.render("cart", {
          loggedIn: req.session.userLogged,
          userData:req.session.name,
          categories: categories,
          cartproducts: cartproducts.cart,
          user:userData
        });
      } else {
        res.render("signin", { access: "you must login to access the service" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };


  exports.addCart = async (req, res) => {
    try {
      if (req.session.userLogged) {
        const productId = req.query.productid;
        const addedfromproductdetails = req.query.productdetails;
        const addedfromproductlist = req.query.productlist;
  
        const categoryid = req.query.categoryid;
  
        const userData = await User.findById(req.session.user_id);
        const productdata = await Product.findById(productId);
        console.log(productdata);
  
        // Check if the product is already in the cart
        const cartItem = userData.cart.item.find((item) =>
          item.productId.equals(productId)
        );
        if(productdata.quantity==0){
          const message = "Sorry!.. product is out of stock";
          const html = `
               <html>
                <head>
                  <script>
                      alert('${message}');
                     window.history.back();
                  </script>
                </head>
               <body></body>
              </html>
               `;
          res.send(html);
        }else if (cartItem) {
          const message = "Product already exists in cart";
          const html = `
               <html>
                <head>
                  <script>
                      alert('${message}');
                     window.history.back();
                  </script>
                </head>
               <body></body>
              </html>
               `;
          res.send(html);
        } else {
          // If the product is not in the cart, add it
          const itemprice = productdata.price;
          userData.cart.item.push({ productId, quantity: 1, price: itemprice });
  
          //calculate total price
          userData.cart.totalPrice += itemprice;
  
          setTimeout(() => {
            userData.save().then(() => {
              if (addedfromproductlist) {
                res.redirect('/shop');
              } else if (addedfromproductdetails) {
                res.redirect(`/viewProduct?id=${productId}`);
              }
            });
          }, 0)
        }
      } else {
        res.render("signin", {
          access: "you must login to access the service",
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  exports.removeFromCart = async (req, res) => {
    try {
      const productId = req.query.productid;
      const userData = await User.findById(req.session.user_id);
      userData.removefromcart(productId);
      res.redirect("/cart");
    } catch (error) {
      console.log(error);
    }
  };
  exports.updateCart = async (req, res) => {
    try {
        let { Quantity, _id } = req.body
        const userData = await User.findById({ _id: req.session.user_id })
        const productData = await Product.findById({ _id: _id })
        const price = productData.price;
        let test = await userData.updateCart(_id, Quantity)
        res.json({ test, price })

    } catch (error) {
        console.log(error)
    }
}
