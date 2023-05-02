const Coupon=require('../model/coupon')


  
  exports.couponPageLoad= async(req,res)=>{
    const coupons=await Coupon.find({});
    console.log(coupons);
    res.status(200).render('couponPage',{coupon:coupons});
  }


  exports.addCoupon= async(req,res)=>{
    try {
      const { code, discount, expirydate, minPurchase, maxDiscount} =req.body;
  
      let coupons = await Coupon.findOne({ code });
      if (coupons) {
        return res.status(400).json({ errors: [{ msg: 'Coupon already exists' }] });
      }else{

        const expiryDates = new Date(expirydate);
        // get the year, month, and day as strings
        const year = expiryDates.getFullYear().toString();
        const month = (expiryDates.getMonth() + 1).toString().padStart(2, '0'); // add leading zero if needed
        const day = expiryDates.getDate().toString().padStart(2, '0'); // add leading zero if needed
        // format the date as "yyyy-mm-dd"
        const formattedDate = `${day}-${month}-${year}`;
        console.log(formattedDate);


        const newcoupon = new Coupon({
          code:code,
          discount:discount,
          expirydate:formattedDate,
          minPurchase:minPurchase,
          maxDiscount:maxDiscount,
          createdDate: new Date(),
          isActive:true
        });
    
        await newcoupon.save();
    
        res.redirect('/admin/coupon');
      } 
      }
  
      catch (err) {
        console.log(err);
        res.redirect('/admin/error')
      }
  }

  exports.deleteCoupon = async(req,res)=>{
    const id=req.params.id
    try {
        const coupon = await Coupon.findByIdAndDelete({_id:id});
        if (!coupon) {
            return res.status(404).send("Product not found");
          }
        res.redirect('/admin/coupon');
  }
  catch(error){
    res.redirect('/admin/error')
  }
}

exports.LoadEditCoupon = async(req,res)=>{
  try {
      const id=req.query.id
      const edcoupon = await Coupon.findById({_id:id});
      expiryDate=edcoupon.expirydate;
      const day = expiryDate.split("-")[0];
      const month = expiryDate.split("-")[1];
      const year = expiryDate.split("-")[2];
      const formattedDate = `${year}-${month}-${day}`;

      res.status(200).render('editCoupon',{coupon:edcoupon,date:formattedDate})
      } catch (error) {
      res.redirect('/admin/error')
  }
}
exports.updateCoupon = async(req,res)=>{
  try {
      const id=req.body.id
      const edcoupon = await Coupon.findById({_id:id});
      if(edcoupon){
        const { code, discount, expirydate, minPurchase, maxDiscount} =req.body;
          edcoupon.code = code;
          edcoupon.discount = discount;
          edcoupon.expirydate = expirydate;
          edcoupon.minPurchase = minPurchase;
          edcoupon.maxDiscount = maxDiscount;
          await edcoupon.save();
          res.redirect('/admin/coupon');
      }else{
        return res.status(404).json({ errors: [{ msg: 'Coupon not found' }] });
      }
       } catch (error) {
        console.log(error);
        // res.redirect('/admin/error')
  }
}

