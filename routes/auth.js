const express=require('express');
const router=express.Router()
const User=require('../models/user')
const {body,validationResult}=require('express-validator')
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken')
const fetchuser=require('../middleware/fetchuser')
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config.env') });

const JWT_SECRET=process.env.JWT_SECRET;

//ROUTE 1: create a user using POST : "/api/auth/createuser" : No login required
router.post('/createuser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('email','Enter a valid email').isEmail(),
    body('password','password is too short').isLength({min:5})
],async(req,res)=>{
    let success=false;
//if there are errors return bad request and the errors
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success,errors:errors.array()});
    }
    //check whether user already exists with the same email
    try {
        let user=await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({success,error:'sorry a user with this email already exists'})
    }
    const salt=await bcrypt.genSalt(10);
    secPass=await bcrypt.hash(req.body.password,salt)
    user =await User.create({
        name:req.body.name,
        email:req.body.email,
        password:secPass,
    });
    const data={
        user:{
            id:user.id
        }
    }
    const authtoken= jwt.sign(data,JWT_SECRET)
    success=true;
    console.log({success,authtoken})
    
    // .then(user=>res.json(user))
    // .catch(err=>{console.log(err)
    // res.json({error:'Please enter a unique value for email',message:err.message})})
    res.json({authtoken})

    } catch (error) {
        console.log(success,error.message)
        res.status(500).send("some error occured")
    }
    
})

//ROUTE 2: authenticate a user using : post "api/auth/login". no login required
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','password cannot be blank').exists(), 
],async(req,res)=>{
    let success=false;
    //if there are errors return bad request and the errors
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {email,password}=req.body;    
    try {
        let user=await User.findOne({email});
        if(!user){
            return res.status(400).json({success,error:"try to login with correct credentials"})
        }
        const passwordCompare=await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({success,error:"try to login with correct credentials part 2"})
        }
        const data={
            user:{
                id:user.id
            }  
        }
        const authtoken=jwt.sign(data,JWT_SECRET);
        success=true;
        res.json({success,authtoken})
    } catch (error) {
        console.log(error.message);
        res.status(500).send("internal server error occured")
    }

})

//ROUTE 3: get loggedin user details using POST : api/auth/getuser. login required
router.post('/getuser',fetchuser,async(req,res)=>{ 
    try {
        let userId=req.user.id
        const user=await User.findById(userId).select("-password")  
        res.send(user)      
    } catch (error) {
        console.log(error.message)
        res.status(500).send("internal server error")
    }
})

module.exports=router