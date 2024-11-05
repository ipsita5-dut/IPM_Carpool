
const express = require('express');
const router = express.Router();
const { getRideOptions, bookRide, getRideConfirmation, cancelRide, getMyBookings } = require("../controllers/rideReqController");
const authController = require("../controllers/authController");

router.get("/", function(req, res) {
    res.send("Hey it is working!");
});

router.get('/ride-options', getRideOptions);

router.post('/search-ride', bookRide);
router.get('/get-rider-data', authController.getRiderData);
router.get('/get-home-location', authController.getHomeLocation);
//router.get('/ride-details/:rideRequestId', getRideDetails); // New route for ride details
router.get('/ride-confirmation/:rideRequestId', getRideConfirmation);
router.post('/cancel-ride',cancelRide);
router.get('/my-bookings', getMyBookings); 
// router.post('/notify-rider', notifyRider);

