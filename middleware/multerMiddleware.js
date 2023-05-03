const multer=require('multer');
const path =require('path');
const shortid=require('shortid')

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join(path.dirname(__dirname),'./public/uploads'))
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//       cb(null, shortid.generate()+"-"+file.originalname)
//     }
//   })
//   exports.upload = multer({
//     storage: storage,fileFilter: function (params, file, callback) {
//     if (file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/webp") {
//       callback(null, true)
//     } else {
//       console.log('only jpg, png & webp file supported !');
//       callback(null, false)
// }
// }})



const storage= multer.memoryStorage();
exports.upload = multer({storage:storage})