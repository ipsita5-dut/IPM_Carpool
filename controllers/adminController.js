const Driver = require("../models/driver-model");

module.exports.getPendingDrivers = async function(req, res) {
    try {
        const pendingDrivers = await Driver.find({ status: 'pending' });
        res.status(200).json(pendingDrivers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports.updateDriverStatus = async function(req, res) {
    const { driverId } = req.params;
    const { status } = req.body; 

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const driver = await Driver.findByIdAndUpdate(driverId, { status }, { new: true });
        if (!driver) return res.status(404).json({ message: "Driver not found" });
        res.status(200).json({ message: `Driver ${status} successfully`, driver });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
