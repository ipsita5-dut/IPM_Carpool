const express=require('express');
const router=express.Router();
const {registerRider,loginUser,logoutUser,sendOtp,verifyOtp,getHomeLocation}=require("../controllers/authController");
router.get("/",function(req,res){
    res.send("Hey it is working!!");
});


const upload = require('../config/multerConfig'); 
router.get('/logout',logoutUser);
router.post("/register", upload.single('profile_pic'), registerRider);
router.post("/login",loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get('/home-location', getHomeLocation); 

module.exports=router;