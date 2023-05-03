const express = require('express');
const env=require('dotenv');
const path=require('path')
const flash = require('express-flash');
const { connectDatabase, backupDb, restoreDb } = require('./database');

const methodOverride = require('method-override');
const { S3Client,PutObjectCommand } = require("@aws-sdk/client-s3");




const app = express();
env.config();

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 =new S3Client({
  credentials:{
    accessKeyId:accessKey,
    secretAccessKey:secretAccessKey,
  },
  region: bucketRegion
})

connectDatabase()
// backupDb();
// restoreDb();

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.use(express.static(path.join(__dirname,"/public")));

app.set("view engine", "ejs");

app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
    next();
  });


const userRoute=require("./routes/userRoute/userRoute")
app.use("/",userRoute)

const adminRoute = require("./routes/adminRoute/adminRoute");
app.use("/admin/",adminRoute);

app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`);
})