const express=require('express');
const router=express.Router();
const {loginAdmin}=require("../controllers/authController");
const { getPendingDrivers, updateDriverStatus } = require("../controllers/adminController");


router.post("/login",loginAdmin);

router.get("/panel",function(req,res){
    res.send("Hey");
});

router.get('/driver-details', async (req, res) => {
    try {
        const pendingDrivers = await Driver.find({ status: 'pending' });
        res.render('driver-details', { drivers: pendingDrivers }); 
    } catch (error) {
        console.error('Error fetching pending drivers:', error);
        res.status(500).send('Internal Server Error');
    }

});

router.get('/drivers/pending',getPendingDrivers);
router.put('/drivers/:driverId/status', updateDriverStatus);


module.exports=router;