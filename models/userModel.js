// models/userModel.js

const mongoose = require('mongoose');

const uri = "mongodb+srv://manishankar123ms:Mani123@cluster0.zoi3l2c.mongodb.net/PersonDetails?retryWrites=true&w=majority";


mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,

    }).then(() => { console.log("MongoDB Connected Successfully") })
    .catch((error) => {
        console.log(`Not able to connect \n ${error}`)
    });
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['Driver', 'Examiner', 'Admin'], required: true },
    fname: { type: String, default: 'default', required: true },
    lname: { type: String, default: 'default', required: true },
    licenseNo: { type: String, default: 'default', required: true },
    age: { type: Number, default: 0, required: true },
    dob: { type: Date, default: Date.now, required: true },
    carDetails: {
        make: { type: String, default: 'default', required: true },
        model: { type: String, default: 'default', required: true },
        year: { type: Number, default: 0, required: true },
        plateNo: { type: String, default: 'default', required: true },
    },
    appointmentDate: { type: Date }, // Date to store the selected appointment date
    selectedAppointmentTime: { type: String }, // String to store the selected appointment time
    testType: { type: String, enum: ['G2', 'G'], default: 'G2' },
    examinerComment: { type: String, default: '' },
    isPassed: { type: Boolean, default: false },

});

const UserModel = mongoose.model('UserModel', userSchema);

module.exports = UserModel;