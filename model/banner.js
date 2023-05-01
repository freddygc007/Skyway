const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    link:{
        type:String,
        required:true
    },
    is_active:{
        type:Boolean,
        default:'true'
      }
})

module.exports = mongoose.model('Banner',bannerSchema)