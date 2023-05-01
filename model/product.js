const mongoose = require ('mongoose');
const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    quantity:{
        type:Number,
        required:true
    },
    Offer:{type:String},
    productPictures:[
        {img:{type:String}}
        ],
    reviews:[
        {
            userId:mongoose.Schema.Types.ObjectId, ref:'User',
            type:String
        }
    ],
    category: {
        type:mongoose.Schema.Types.ObjectId, ref:'Category'
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId, ref:'User'
    },
})

module.exports=mongoose.model('Product',productSchema);