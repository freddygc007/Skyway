const express = require('express');
const env=require('dotenv');
const path=require('path')
const flash = require('express-flash');
const { connectDatabase, backupDb, restoreDb } = require('./database');

const methodOverride = require('method-override');




const app = express();
env.config();
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
app.use("/api/",userRoute)

const adminRoute = require("./routes/adminRoute/adminRoute");
app.use("/api/admin",adminRoute);

app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`);
})