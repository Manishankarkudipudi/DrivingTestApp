const mongoose = require("mongoose");

const uri = "mongodb+srv://manishankar123ms:Mani123@cluster0.zoi3l2c.mongodb.net/PersonDetails?retryWrites=true&w=majority";

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected Successfully");
  })
  .catch((error) => {
    console.log(`Not able to connect \n ${error}`);
  });

const licenseSchema = mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  licenseNo: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  carDetails: {
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    plateNo: {
      type: String,
      required: true,
    },
  },
});

const licenseModel = mongoose.model("g2", licenseSchema);

module.exports = licenseModel;
