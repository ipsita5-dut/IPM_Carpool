const express=require('express');
const router=express.Router();
const {loginAdmin}=require("../controllers/authController");
const { getPendingDrivers, updateDriverStatus } = require("../controllers/adminController");
const Driver = require('../models/driver-model'); // Import the driver model


router.post("/login",loginAdmin);

router.get("/panel",function(req,res){
    res.send("Hey");
});

router.get('/drivers/pending',getPendingDrivers);
router.put('/drivers/:driverId/status', updateDriverStatus);


module.exports=router;