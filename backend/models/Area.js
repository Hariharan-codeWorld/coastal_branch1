const mongoose = require("../db");

const areaSchema = new mongoose.Schema({
    name: String,
    lat: Number,
    lon: Number,
    sensitivity: String
});

module.exports = mongoose.model("Area", areaSchema);