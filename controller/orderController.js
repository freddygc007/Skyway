const order = require('../model/order');
const products = require('../model/product');
const User = require('../model/user')
const address = require('../model/address')
const RazorPay = require("razorpay");
require("dotenv").config();


// admin

exports.loadOrders = async (req, res) => {
    try {

        const allorders = await order.find({}).populate("userId").sort({ $natural: -1 });
        const userData = await User.findById({ _id: req.session.admin_id });
        res.render("orderlist", { admin: userData, orders: allorders, orderDetail: allorders });
    } catch (error) {
        console.log(error.message);
    }
}
exports.adminViewOrderDetails = async (req, res) => {
    try {
        const id = req.query.id;
        const orders = await order.findById({ _id: id });
        const details = await orders.populate('products.item.productId')
        res.render("orderdetails.ejs", { orders: details });
    } catch (error) {
        console.log(error.message);
    }
}

exports.updateStatus = async (req, res) => {
    try {
        const status = req.body.status;
        const orderId = req.body.orderId;
        const orderDetails = await order.findByIdAndUpdate({ _id: orderId }, { $set: { status: status } })
        if ((status == "cancelled") && orderDetails.payment.method !== "COD") {
            userDetails = await User.findOne({ _id: orderDetails.userId });
            const walletData = userDetails.wallet;
            userData = await User.updateOne({ _id: orderDetails.userId }, { $set: { wallet: walletData + orderDetails.payment.amount } })
        }
        if (status == "cancelled") {
            const productData = await products.find()
            const orderData = await order.findById({ _id: orderId });
            for (let key of orderData.products.item) {
                for (let prod of productData) {
                    if (new String(prod._id).trim() == new String(key.productId).trim()) {
                        prod.quantity = prod.quantity + key.qty
                        await prod.save()
                    }
                }
            }
        }
        res.redirect("/admin/orders")
    } catch (error) {

    }
}
exports.sortOrder = async (req, res) => {
    let { start, end } = req.body
    console.log(start, end);
    const allOrders = await order.find({
      createdAt: { $gte: start, $lte: end }
    }).populate("userId");
    res.send({ orderDetail: allOrders });
  }

// user


let Norder;
exports.placeOrder = async (req, res) => {
    try {
        nAddress = await address.findOne({ _id: req.body.address });
        const userData = await User.findOne({ _id: req.session.user_id })
        if (req.body.coupon) {
            var offercoupon = req.body.coupon
        } else {
            var offercoupon = ""
        }
        Norder = new order({
            userId: req.session.user_id,
            userName: userData.name,
            address: nAddress,
            payment: {
                method: req.body.payment,
                amount: req.body.cost,
            },
            offer: offercoupon,
            products: userData.cart,
        })
        if (req.body.payment == "COD") {
            await Norder.save();
            const productData = await products.find()
            for (let key of userData.cart.item) {
                for (let prod of productData) {

                    if (new String(prod._id).trim() == new String(key.productId._id).trim()) {
                        prod.quantity = prod.quantity - key.qty
                        await prod.save()
                    }
                }
            }
            await User.updateOne({ _id: req.session.user_id }, { $unset: { cart: 1 } })
            res.render("confirmation", { userData: req.session.user, loggedIn: req.session.userLogged, order: Norder })

        } else if (req.body.payment == "wallet") {
            console.log("123");
            let walletAmount = parseInt(req.body.walamount);
            let totalAmount = parseInt(req.body.cost)
            req.session.totalWallet = walletAmount;
            console.log(req.session.totalWallet);
            if (walletAmount >= totalAmount) {
                console.log("asdfdgadgadg");
                await Norder.save();
                let userWallet = await User.findOne({ _id: req.session.user_id })
                let minusAmt = userWallet.wallet - req.body.cost;
                let minuswalAmt = await User.updateOne({ _id: req.session.user_id }, { $set: { wallet: minusAmt } })
                console.log(minuswalAmt);
                await User.updateOne({ _id: req.session.user_id }, { $unset: { cart: 1 } })

                const productData = await products.find()
                for (let key of userData.cart.item) {
                    for (let prod of productData) {

                        if (new String(prod._id).trim() == new String(key.productId._id).trim()) {
                            prod.quantity = prod.quantity - key.qty
                            await prod.save()
                        }
                    }
                }

                res.render("orderSuccess", { user: req.session.user })
                } else {
                    var instance = new RazorPay({
                        key_id: process.env.key_id,
                        key_secret: process.env.key_secret
                    })
                    let razorpayOrder = await instance.orders.create({
                        amount: req.body.cost * 100,
                        currency: 'INR',
                        receipt: Norder._id.toString()
                    })
    
                    console.log('order Order created', razorpayOrder);
                    const productData = await products.find()
                    for (let key of userData.cart.item) {
                        for (let prod of productData) {
    
                            if (new String(prod._id).trim() == new String(key.productId._id).trim()) {
                                prod.quantity = prod.quantity - key.qty
                                await prod.save()
                            }
                        }
                    }
                }
            } else {
            var instance = new RazorPay({
                key_id: process.env.key_id,
                key_secret: process.env.key_secret
            })
            let razorpayOrder = await instance.orders.create({
                amount: req.body.cost * 100,
                currency: 'INR',
                receipt: Norder._id.toString()
            })
            //   console.log('order Order created', razorpayOrder);
            paymentDetails = razorpayOrder;
            //   console.log(Norder+"asfasfasdfdsf");

            const productData = await products.find()
            for (let key of userData.cart.item) {
                for (let prod of productData) {
                    if (new String(prod._id).trim() == new String(key.productId._id).trim()) {
                        prod.quantity = prod.quantity - key.qty
                        await prod.save()
                    }
                }
            }
            res.render("confirmPayment", {
                userId: req.session.user_id,
                order_id: razorpayOrder.id,
                total: req.body.amount,
                session: req.session,
                key_id: process.env.key_id,
                user: userData,
                orders: Norder,
                orderId: Norder._id.toString(),

            });
        }

    } catch (error) {
        console.log(error.message);
    }
}

exports.loadOrderSuccess = async (req, res) => {
    try {
        Norder.payment.method = "Online"
        Norder.paymentDetails.reciept = paymentDetails.receipt;
        Norder.paymentDetails.status = paymentDetails.status;
        Norder.paymentDetails.createdAt = paymentDetails.created_at;
        let minuswalAmt = await User.updateOne({ _id: req.session.user_id }, { $set: { wallet: 0 } });
        await Norder.save();
        await User.updateOne({ _id: req.session.user_id }, { $unset: { cart: 1 } })
        const data = req.session.totalWallet
        res.render("confirmation", { userData: req.session.user, loggedIn: req.session.userLogged, order: Norder })

    } catch (error) {
        console.log(error.message);
    }
}

exports.cancelOrder = async (req, res) => {
    try {
        const id = req.query.id;
        const orderDetails = await order.findById({ _id: id });
        let state = "cancelled"
        await order.findByIdAndUpdate({ _id: id }, { $set: { status: "cancelled" } })
        if (state == "cancelled") {
            const productData = await products.find()
            const orderData = await order.findById({ _id: id });

            for (let key of orderData.products.item) {
                for (let prod of productData) {
                    if (new String(prod._id).trim() == new String(key.productId).trim()) {
                        prod.quantity = prod.quantity + key.qty
                        await prod.save()
                    }
                }
            }
        }
        if (state == "cancelled" && orderDetails.payment.method != "COD") {
            userDetails = await User.findOne({ _id: orderDetails.userId });
            const walletData = userDetails.wallet;
            userData = await User.updateOne({ _id: orderDetails.userId }, { $set: { wallet: walletData + orderDetails.payment.amount } })


        }
        res.redirect("/profile")
    } catch (error) {
        console.log(error.message);
    }
}

exports.viewOrderDetails = async (req, res) => {
    try {
        const id = req.query.id;
        const users = req.session.user_id
        const orderDetails = await order.findById({ _id: id });
        const addres = await address.findById({ _id: users })
        await orderDetails.populate('products.item.productId')
        res.render("orderdetails", { userData: req.session.name, loggedIn: req.session.userLogged, user: req.session.user, orders: orderDetails });
    } catch (error) {

    }
}

exports.retunOrder = async (req, res) => {
    try {
        const id = req.query.id;
        const users = req.session.user_id
        const orderDetails = await order.findById({ _id: id });
        const addres = await address.findById({ _id: users })
        const cancel = await order.findByIdAndUpdate({ _id: id }, { $set: { status: "returned" } })
        await orderDetails.populate('products.item.productId')
        let state = "returned";
        if (state == "returned") {
            const productData = await products.find()
            const orderData = await order.findById({ _id: id });
            for (let key of orderData.products.item) {
                for (let prod of productData) {
                    if (new String(prod._id).trim() == new String(key.productId).trim()) {
                        prod.quantity = prod.quantity + key.qty
                        await prod.save()
                    }
                }
            }
        }
        if (state == "returned" && orderDetails.payment.method != "COD") {
            userDetails = await User.findOne({ _id: orderDetails.userId });
            const walletData = userDetails.wallet;
            const amt = parseFloat(orderDetails.payment.amount);
            if (isNaN(amt)) {
                console.log('Invalid wallet amount');
            }
            userData = await User.updateOne({ _id: req.session.user_id }, { $set: { wallet: walletData + amt } })
        }
        res.redirect("/profile")
    } catch (error) {
        console.log(error.message);
    }
}