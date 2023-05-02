exports.isAdminLogin =async (req,res,next)=>{
    try {
        if(req.session.userLogged==true){
            next()
            console.log('userlogged true');

        }else{
            console.log('userlogged false');

            res.redirect('/admin/login');
        }
    } catch (error) {
        console.log(error.message);
    }
}


