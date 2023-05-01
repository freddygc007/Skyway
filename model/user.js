const mongoose = require('mongoose');
const bcrypt=require('bcrypt');
const product = require('./product');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        min:3,
        max:20
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    hash_password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    blocked:{
        type:Boolean,
        default:'false'
    },
    contactNumber:{
        type:String
    },
    profilePicture:{
        type:String
    },
    cart:{
        item:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'Product',
                required:true
            },
            qty:{
                type:Number,
                default:1
            },
            price:{
                type:Number
            }
        }],
        totalPrice:{
            type:Number,
            default:0
        }
    },
    wishlist:{
        item:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'Product',
                required:true
            },
            price:{
                type:Number
            },
            totalPrice:{
                type:Number
            }
        }]
    },
    wallet: {
        type: Number,
    }
},{timestamps:true});


userSchema.methods.removefromCart = async function (productId) {
    const cart = this.cart
    const isExisting = cart.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
    if (isExisting >= 0) {
        const prod = await product.findById(productId)
        cart.totalPrice -= prod.price * cart.item[isExisting].qty
        cart.item.splice(isExisting, 1)
        console.log("User in schema:", this);
        return this.save()
    }
}

userSchema.virtual('password')
.set(function(password){
    if (!password) {
        return;
    }
    this.hash_password = bcrypt.hashSync(password,10);
});

userSchema.methods = {
    authenticate  : function(password){
        return bcrypt.compareSync(password,this.hash_password);
    }
}
userSchema.methods.updateCart = async function (id, qty) {
    const cart = this.cart
    const Product = await product.findById(id)
    const index = cart.item.findIndex(objInItems => {
        return new String(objInItems.productId).trim() == new String(Product._id).trim()
    })
    console.log('qty'+ qty);
    if (qty > cart.item[index].qty) {
        cart.item[index].qty += 1
        cart.totalPrice += Product.price
    } else if (qty < cart.item[index].qty) {
        cart.item[index].qty -= 1
        cart.totalPrice -= Product.price
    } else {

    } console.log(cart.totalPrice);
    this.save()
    return cart.totalPrice
}

userSchema.methods.removefromcart =async function (productId){
    const cart = this.cart
    console.log('productId in userjs '+productId);
    const isExisting = cart.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
    console.log('isExisting'+isExisting);
    if(isExisting >= 0){
        const prod = await product.findById(productId)
        console.log(prod);
        cart.totalPrice -= prod.price * cart.item[isExisting].qty
        cart.item.splice(isExisting,1)
       // console.log("User in schema:",this);
        return this.save()
    }
}

userSchema.methods.addToWishlist = function (product) {
    const wishlist = this.wishlist
    const isExisting = wishlist.item.findIndex(objInItems => {
        return new String(objInItems.productId).trim() == new String(product._id).trim()
    })
    if (isExisting >= 0) {

    } else {
        wishlist.item.push({
            productId: product._id,
            price: product.price
        })
    }
    return this.save()
}

userSchema.methods.addToCart = async function (product) {
    const wishlist = this.wishlist
    const isExist = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(product._id).trim())
    if (isExist >= 0) {
        wishlist.item.splice(isExist, 1)
    }
    const cart = this.cart
    const isExisting = cart.item.findIndex(objInItems => {
        return new String(objInItems.productId).trim() == new String(product._id).trim()
    })
    console.log(isExisting);
    if (isExisting >= 0) {
        cart.item[isExisting].qty += 1
    } else {
        cart.item.push({
            productId: product._id,
            qty: 1, price: product.price
        })
    }
    cart.totalPrice += product.price
    console.log("User in schema:", this);
    return this.save()
}

userSchema.methods.removefromWishlist = async function (productId) {
    const wishlist = this.wishlist
    const isExisting = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
    if (isExisting >= 0) {
        const prod = await product.findById(productId)
        wishlist.item.splice(isExisting, 1)
        return this.save()
    }

}

module.exports=mongoose.model('User',userSchema);