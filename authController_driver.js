const driverModel = require("../models/driver-model");
const bcrypt = require("bcrypt");
const generateToken = require('../utils/generateToken');
const generateOtp = require('../utils/generateOtp'); // Import the custom OTP function

const nodemailer = require('nodemailer');
const NodeGeocoder = require('node-geocoder');

const RideRequest = require("../models/Ride-request-model");

// Configure the geocoder
const geocoder = NodeGeocoder({
  provider: 'google', // Use 'google' or another provider
  httpAdapter: 'https',
  apiKey: 'AIzaSyDu3n8SgW9peGPFRl5Qe7fYvGdeuk8xzrI', // Replace with your API key
  formatter: null 
});



// Send OTP
module.exports.sendOtp = async function(req, res) {
  let { dEmail } = req.body;
  if (!dEmail) {
    return res.status(400).json({ message: "Email is required" });
  }
  // const otp = otpGenerator.generate(4, { upperCase: false, specialChars: false,digits:true });
  const otp = generateOtp(); // Use the custom OTP generation function

  try {
  
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: 'goid.damid@gmail.com',
        pass: 'mevu fjne aiec aukb',
      },
    });
    const mailOptions = {
      from: 'goid.damid@gmail.com',
      to: dEmail,
      subject: 'Verify your email',
      text:`Your OTP is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Sending OTP to email: ${dEmail}`);

    req.session.otp = otp;
    req.session.otpExpires = new Date(Date.now() + 300000); 

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
};


// Verify OTP
module.exports.verifyOtp = async function(req, res) {
  const { dEmail, otp } = req.body;
  if (!dEmail || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  try {
    if (req.session.otp === otp) {
      req.session.isOtpValid = true;
      res.json({ success: true, message: 'OTP is valid' });
    } else {
      res.json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
};

module.exports.registerDriver = async function(req, res) {
    
  try {
      let { dName,dEmail,dcontact,license, dAddress, latitude,longitude, password ,carType,vehicleNo}= req.body;
  
      if (!dName ||!dEmail || !license || !dcontact || !dAddress || !latitude || !longitude || !password ||!carType||!vehicleNo || !req.files['aadharCard']) {
        return res.status(400).json({ message: "Please provide all required fields" });
      }
  
      dEmail = dEmail.toLowerCase();
      console.log(`Checking for existing rider with email: ${dEmail}`);
  
      let existingDriver_License = await driverModel.findOne({ license });
    
      let existingDriver_Email = await driverModel.findOne({ dEmail });
      let existingDriver_Contact = await driverModel.findOne({ dcontact });
      let existingDriver_vehicleNo = await driverModel.findOne({ vehicleNo });

      let errorMessage = [];

      if (existingDriver_License) errorMessage.push("Driver License");

      if (existingDriver_Email) errorMessage.push("Email");
      if (existingDriver_Contact) errorMessage.push("Phone Number");
      if (existingDriver_vehicleNo) errorMessage.push("Vehicle Registration Number");


      if (errorMessage.length > 0) {
        const message = `${errorMessage.join(" and ")} already in use. Please choose different values.`;
        return res.status(401).json({ message });
      }
  
      if (!req.session.isOtpValid) {
        return res.status(401).json({ message: "Invalid OTP" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      
      let newDriver = await driverModel.create({
        dName,
        dEmail,
        license,
        dcontact,
        dAddress,
        latitude,
        longitude,
        carType,
        password: hashedPassword,
        otp: req.session.otp,
        otpExpires: req.session.otpExpires,
        vehicleNo,
        picture: req.files['profile_pic'] ? `/uploads/${req.files['profile_pic'][0].filename}` : null, 
        aadharCard: req.files['aadharCard'] ? `/uploads/${req.files['aadharCard'][0].filename}` : null, 
        status: 'pending' 

      });
  
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'goid.damid@gmail.com',
            pass: 'mevu fjne aiec aukb',
        },
    });

    const mailOptions = {
      from: 'goid.damid@gmail.com',
      to: 'ipsita424@gmail.com', // Replace with the admin email
      subject: 'New Driver Registration Pending Approval',
      text: `A new driver has registered and is pending approval.\n\nDriver Details:\nName: ${dName}\nEmail: ${dEmail}\nContact: ${dcontact}\nAadhar Card: ${req.files['aadharCard'] ? `/uploads/${req.files['aadharCard'][0].filename}` : 'Not Uploaded'}`,
      attachments: [
          {
              filename: req.files['aadharCard'][0].originalname,
              path: req.files['aadharCard'][0].path 
          }
      ]
  };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: "Driver Details Has Been Sent to Admin Successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };



  module.exports.loginDriver = async function(req, res) {
    try {
        let { dEmail, password } = req.body;
        
        if (!dEmail || !password) {
            return res.status(400).json({ message: "Please provide Driver Email and password" });
        }
        let driver = await driverModel.findOne({ dEmail });
        if (!driver) {
            return res.status(401).json({message: "Driver Email or password incorrect"});
        }
        
        if (driver.status !== 'accepted') {
          return res.status(401).json({ message: "Driver not approved" });
      }

        const isMatch = await bcrypt.compare(password, driver.password);
        if (!isMatch) {
            return res.status(401).json({message:"Driver Email or password incorrect"});
        }

        let token = generateToken(driver);
        res.cookie("token", token,{httpOnly:true,maxAge:120000});
        req.session.driverLoggedIn = true; 
        req.session.user=driver;
        req.session.driverLocation={ latitude: driver.latitude, longitude: driver.longitude };
        res.status(200).json({message:"Login successful"});
        
    } catch (err) {
        console.error("Error during registration:", err);  
        res.status(500).json({message:"Internal Server Error: " + err.message});
        }
};


// Get Pending Ride Requests
module.exports.getPendingRideRequests = async function(req, res) {
  try {
      const driverId = req.session.user._id; 
      const driver = await driverModel.findById(driverId); // Get the driver's details
// Find the accepted ride request for this driver
const acceptedRequest = await RideRequest.findOne({ 
  driverId: driverId, 
  status: 'accepted' 
}).populate('riderId');

const rideRequests = acceptedRequest ? [acceptedRequest] : await RideRequest.find({ 
  status: 'pending', 
  carType: driver.carType,
  driverId: { $ne: driverId } // Exclude requests already accepted by this driver
}).populate('riderId');

      res.render('rideRequests', { rideRequests }); // Render the ride requests view
  } catch (error) {
      console.error("Error fetching ride requests:", error);
      res.status(500).json({ message: "Error fetching ride requests" });
  }
};

// Accept Ride Request
module.exports.acceptRideRequest = async function(req, res) {
  try {
      const rideRequestId = req.params.id;
      const existingRequest = await RideRequest.findById(rideRequestId);

      // Check if the ride request is already accepted
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({ message: "This ride request has already been accepted." });
    }

      // Generate OTP
      const otp = generateOtp(); 

      const updatedRequest = await RideRequest.findByIdAndUpdate(
          rideRequestId, 
          { status: 'accepted', driverId: req.session.user._id,otp }, 
          { new: true }
      ).populate('riderId').populate('driverId');

      // Check if the rider exists and has an email
    if (!updatedRequest.riderId || !updatedRequest.riderId.eEmail) {
      return res.status(400).json({ message: "Rider's email not found." });
    }
    
    const officeLocation = {
      latitude: 22.572790590435996, // Replace with your office latitude
      longitude: 88.43741479531052 // Replace with your office longitude
    };
    const officeAddress = await geocoder.reverse({ lat: officeLocation.latitude, lon: officeLocation.longitude });

    // Retrieve driver details from the session or from the database
    const driverDetails = {
      name: req.session.user.dName,
      phoneNumber: req.session.user.dcontact,
      vehicleNo: req.session.user.vehicleno,    //eta add korlam oi vehicle no ta anar jonno
    };

     // Send OTP to the rider's email
     const riderEmail = updatedRequest.riderId.eEmail; // Assuming riderId has an email field
     const transporter = nodemailer.createTransport({
       host: 'smtp.gmail.com',
       port: 465,
       secure: true, 
       auth: {
         user: 'goid.damid@gmail.com',
         pass: 'mevu fjne aiec aukb',
       },
     });
 
     const mailOptions = {
       from: 'goid.damid@gmail.com',
       to: riderEmail,
       subject: 'Your OTP for Ride Confirmation',
       text:  `
       Dear ${updatedRequest.riderId.eName},
 
       Your OTP for the ride is: ${otp}
       Pickup Address: ${updatedRequest.pickupAddress}
       Destination: ${officeAddress[0].formattedAddress} // Use the formatted address
       Car Type: ${updatedRequest.carType}


       Rider Details:
       - Name: ${updatedRequest.riderId.eName}
       - Phone Number: ${updatedRequest.riderId.contact}
 
       Driver Details:
       - Name: ${driverDetails.name}
       - Phone Number: ${driverDetails.phoneNumber}
       - Vehicle Number: ${driverDetails.vehicleNo}   //eta add korlam vehicle no ta anar jonno

       Thank you for choosing our service!
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Sending OTP to rider's email: ${riderEmail}`);

      await driverModel.findByIdAndUpdate(req.session.user._id, { isAvailable: false }); // Mark driver as unavailable
      res.json({ message: "Ride request accepted, OTP sent to rider's email", updatedRequest });
  } catch (error) {
      console.error("Error accepting ride request:", error);
      res.status(500).json({ message: "Error accepting ride request" });
  }
};


// Cancel Ride Request
module.exports.cancelRideRequest = async function(req, res) {
  try {
      const rideRequestId = req.params.id;
      const rideRequest = await RideRequest.findById(rideRequestId);
      if (!rideRequest) {
          return res.status(404).json({ message: "Ride request not found" });
      }
      // Mark the driver as available again
      await driverModel.findByIdAndUpdate(rideRequest.driverId, { isAvailable: true });
      res.json({ message: "Ride request cancellation acknowledged" });
  } catch (error) {
      console.error("Error cancelling ride request:", error);
      res.status(500).json({ message: "Error cancelling ride request" });
  }
};
