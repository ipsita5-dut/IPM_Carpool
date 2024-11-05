const express=require('express');
const router=express.Router();
const upload = require('../config/multerConfig'); 

const {  viewRideDetails } = require("../controllers/rideReqController");

const {registerDriver,sendOtp,verifyOtp,loginDriver,getPendingRideRequests,acceptRideRequest,cancelRideRequest}=require("../controllers/authController_driver");
router.get("/",function(req,res){
    res.send("Hey it is working!!");
});


router.post("/register", upload.fields([{ name: 'profile_pic' }, { name: 'aadharCard' }]), registerDriver);

router.post("/login",loginDriver);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.get('/show-ride-requests', getPendingRideRequests); 
router.post('/accept-ride/:id', acceptRideRequest);
router.post('/cancel-ride/:id', cancelRideRequest);
router.get('/ride-details/:id', viewRideDetails);

module.exports=router;