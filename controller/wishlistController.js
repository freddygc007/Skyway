const User = require('../model/user');
const products = require("../model/product");

exports.loadWishlist = async (req, res) => {
    try {
        userSession = req.session
        if (userSession.user_id) {
            const userData = await User.findById({ _id: userSession.user_id })
            const completeUser = await userData.populate('wishlist.item.productId')
            res.render('wishlist', { loggedIn: req.session.userLogged, userData:req.session.name, wishlistProducts: completeUser.wishlist })

        } else {
            res.redirect('/signin')
        }
    } catch (error) {
        console.log(error.message);
    }
}

exports.addWishlist = async (req, res) => {
    const productId = req.query.productid;
    console.log('productId'+productId);
    userSession = req.session
    if (req.session.user_id) {

        const userData = await User.findById({ _id: req.session.user_id })
        const productData = await products.findById({ _id: productId })
        userData.addToWishlist(productData)
        res.redirect('/shop')
    } else {
        res.redirect('/signin')
    }
}

exports.addToCartremovefromwishlist = async (req, res) => {
    try {
        userSession = req.session.user_id;
        if (userSession) {
            const productId = req.query.id;
            const details = await products.findOne({ _id: productId })
            const product = await products.find({ category: details.category});
            const userData = await User.findById({ _id: userSession})
            const productData = await products.findById({ _id: productId})
            userSession = req.session.user_id
            const userDatas = await User.findById({ _id: req.session.user_id })
            if(details.quantity==0){
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
              }else{
            userDatas.addToCart(productData)
            res.redirect('/wishlist')
        }
        } else {
            res.redirect('/signin')
        }
    } catch (error) {
        console.log(error.message)
    }
}

exports.deleteWishlist = async (req, res) => {
    const productId = req.query.id
    userSession = req.session.user_id
    const userData = await User.findById({ _id: req.session.user_id })
    userData.removefromWishlist(productId)
    res.redirect('/wishlist')
}
