
const mongoose=require("mongoose");

const driverSchema=mongoose.Schema({
    dName:{
        type:String,
        required:true
    },
    
    dcontact:{
        type:Number,
        required:true
    },
    
    license:{
        type:String,
        required:true
    },

    dAddress:{
        type:String,
        required:true
    },
    dEmail:{
        type:String,
        required:true,
        unique:true
    },
    isAvailable: {
        type: Boolean,
        default: true
      },
      carType: { // New field for car type
        type: String,
        required: true // Make it required if necessary
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    password:String,
    picture: {
        type: String,
        default: null,
        required: false

      },    
    otp:String,
    timestamp:Number,
    vehicleNo:{
        type:String,
        required:true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected','accepted'],
        default: 'pending'
    },
    aadharCard: {
        type: String,
        required: true
    },

isAvailableNextday: { // New field for availability next day
    type: Boolean,
    required: true
   }

    
});

const Driver=mongoose.model("Driver",driverSchema);

module.exports=Driver;