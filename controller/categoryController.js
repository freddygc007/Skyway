const Product = require('../model/product')
const slugify =require('slugify')
const Category=require('../model/category');  



function createCategories(categories, parentId=null){
    const categoryList=[];
    let category;
    if(parentId ==null){
        category = categories.filter(cat => cat.parentId == undefined);
    }else{
        category = categories.filter(cat => cat.parentId == parentId);
    }

    for(let cate of category){
        categoryList.push({
        _id: cate._id,
        name: cate.name,
        slug: cate.slug,
        delete: cate.delete,
        children: createCategories(categories,cate._id)
        });
    }

    return categoryList;
}


exports.addCategory=async(req,res)=>{

  newName = req.body.name;

  const foundName = await Category.findOne({ name: { $regex: new RegExp(`^${newName}$`, 'i') } });
console.log(foundName);

  if(foundName){
    Category.find({})
    .then((categories) => {
      if (categories) {
        const categoryList = createCategories(categories);
        res.status(200).render('addCategories',{data:categoryList,err:"The category already exists"});
      } else {
        res.status(404).json({ error: "No categories found" });
      }
    })
    .catch((error) => {
      res.redirect('/admin/error')
    });
  }else{
    const categoryObj={
      name: req.body.name,
      slug: slugify(req.body.name),
      delete:"false"
  }

  if(req.body.parentId){
      categoryObj.parentId=req.body.parentId;
  }

  const cat =new Category(categoryObj);
  cat.save()
  .then((category)=>{
      res.status(201).redirect('/admin/collections')
      return console.log(category)})
  .catch((error)=>{return res.redirect('/admin/error')})
  }
};


exports.getCategories = (req, res) => {
    Category.find({})
      .then((categories) => {
        if (categories) {
          const categoryList = createCategories(categories);
          res.status(200).render('collectionList',{data:categoryList,err:""});
        } else {
          res.status(404).json({ error: "No categories found" });
        }
      })
      .catch((error) => {
        res.redirect('/admin/error')
      });
  };

exports.loadAddCategory= async (req,res)=>{
    try {
        Category.find({})
      .then((categories) => {
        if (categories) {
          const categoryList = createCategories(categories);
          res.status(200).render('addCategories',{data:categoryList,err:"" });
        } else {
          res.status(404).json({ error: "No categories found"});
        }
      })
      .catch((error) => {
        res.redirect('/admin/error')
      });
    } catch (error) {
      res.redirect('/admin/error')
    }
}

exports.loadEditCollection = async (req,res)=>{
    try {
        const id = req.query.id;
        const categories = await Category.findById({_id:id});
        const allcollection = await Category.find({});   
        if(categories){
            
           await res.render('editCollection',{data:categories,alldata:allcollection});
        }else{
            res.redirect('/admin/collections')
        }
        
    } catch (error) {
      res.redirect('/admin/error')
    }
}

exports.updateCategory = async(req,res)=>{
    try {
        const id = await req.body.id;
        const categories = await Category.findById({_id:id});
            categories.name = req.body.name;
            if(req.body.parentId){
              categories.parentId = req.body.parentId;
            }else{
              categories.parentId = null
            }
            await categories.save();
            res.redirect('/admin/collections');
        
         } catch (error) {
          res.redirect('/admin/error')
    }
}

exports.deleteCategory = async(req, res) => {
    const id = req.query.id||req.params.id;
    console.log(id);
    try {
      const categories = await Category.findById({_id:id});
      if(categories){
        const products = await Product.find({category:id});
        if(products.length>0){
          categories.delete=!categories.delete
          await categories.save()
          res.redirect('/admin/collections');
        }else{
          const delcategory = await Category.findByIdAndDelete({_id:id});
          res.redirect('/admin/collections');
        }
      }else{
        res.redirect('/admin/error')
      }
    } catch (error) {
      res.redirect('/admin/error')
    }
  }
exports.deleteMainCategory = async(req, res) => {
    const id = req.query.id||req.params.id;
    try {
      const categories = await Category.findById({_id:id});
      const allcategories=await Category.find({})
      const sub=[]
      let j=0
      for(let i=0;i<allcategories.length;i++){
        if(allcategories[i].parentId==id){
          sub[j]=allcategories[i]
          j++;
        }
      }
      
    
      if(sub.length==0){
        categories.delete=!categories.delete
        await categories.save()
        res.redirect('/admin/collections');
      }else{
        res.redirect('/admin/collections');
      }
    } catch (error) {
      res.redirect('/admin/error')
    }
  }
  
// exports.deleteCategory = async(req, res) => {
//     const id = req.query.id;
//     console.log(id);
//     try {
//       const categories = await Category.findByIdAndDelete({_id:id});
//       console.log(categories);
//       if (!categories) {
//         return res.status(404).send("Category not found");
//       }
//       res.redirect('/admin/collections');
//     } catch (error) {
//       res.redirect('/admin/error')
//     }
//   }
  
  