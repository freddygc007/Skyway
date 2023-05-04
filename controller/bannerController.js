const User = require('../model/user')
const Banner = require('../model/banner')


exports.loadBanner = async (req, res) => {
  try {
    const banners = await Banner.find()
    res.render("banner", { banner: banners,message:"" });
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadAddBanner = async (req, res) => {
  try {
    res.render("addBanner");
  } catch (error) {
    console.log(error.message);
  }
}

exports.addBanner = async (req, res) => {
  if (req.files.length != 0) {
    try {
      const bannerDetails = new Banner({
        name: req.body.name,
        image: req.files.map((x) => x.filename),
        description: req.body.description,
        link: req.body.link
      });
      const bannerData = await bannerDetails.save();
      if (bannerData) {
        res.redirect("/admin/banner");
      }
    } catch (error) {
      console.log(error.message);
    }
  } else {
    const bannerData = await Banner.find();
    const userData = await User.find();
    res.render("addBanner", { admin: userData, banners: bannerData, message: "file should be image" })
  }
}

exports.deleteBanner = async (req, res) => {
  const id = req.params.id
  try {
    const Ban = await Banner.findByIdAndDelete({ _id: id });
    if (!Ban) {
      return res.status(404).send("Product not found");
    }
    res.redirect('/admin/banner');
  } catch (error) {
    res.redirect('/admin/error')
  }
}

exports.blockBanner = async (req, res) => {
  const id = req.params.id
  var flag = 0
  try {
    const disBanner = await Banner.findById({ _id: id });
    const allBanner = await Banner.find({})
    for (key of allBanner) {
      if (key.is_active==true) {
        flag = 1;
        break;
      }
    }
    console.log(flag==1);
    if (flag == 1) {
      if(disBanner.is_active){
        disBanner.is_active=false;
        const upBanner = await disBanner.save();
        res.redirect('/admin/banner');

      }else{
        res.render("banner", { banner: allBanner,message:"Please disable the active banner" });

      }
    } else if(flag==0){
      console.log('flag0');
      console.log('dis' + disBanner.is_active);
      disBanner.is_active = !disBanner.is_active;
      console.log('dis' + disBanner.is_active);
      const upBanner = await disBanner.save();
      if (upBanner) {
        res.redirect('/admin/banner');
      } else {
        console.log('difdf');
        res.redirect('/admin/error')
      }
    }

  } catch (error) {
    console.log(error);
    res.redirect('/admin/error')
  }
}

exports.editModifyBanner = async (req, res) => {
  const disBanner = await Banner.findById({ _id: req.body.id });
  let productPictures = disBanner.image
  if (req.files.length != 0) {
    try {
      let img = []
      img = req.files.map((x) => x.filename);
      productPictures = [...productPictures, ...img];
      const bannerData = await Banner.findByIdAndUpdate({ _id: req.body.id }, {
        $set: {
          name: req.body.name,
          image: productPictures,
          description: req.body.description,
          link: req.body.link
        },
      }
      );
      console.log('dhti');
      res.redirect("/admin/banner")
    } catch (error) {
      console.log(error.message);
    }
  } else {
    const userData = await User.find();
    const bannerData = await Banner.find()
    res.render("editBanner", { admin: userData, banner: bannerData, message: "file should be image!!" })
  }
};

exports.loadEditBanner = async (req, res) => {
  try {
    const id = req.query.id
    const editbanner = await Banner.findById({ _id: id });
    res.render("editBanner", { banner: editbanner });
  } catch (error) {
    console.log(error.message);
  }
}