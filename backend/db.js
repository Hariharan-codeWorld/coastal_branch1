const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/floodDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

module.exports = mongoose;