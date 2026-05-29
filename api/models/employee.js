const mongoose = require("mongoose");
const { jsVersion } = require("react-native-reanimated/lib/typescript/platform-specific/jsVersion");
const { addIgnorePatterns } = require("react-native/types_generated/Libraries/LogBox/Data/LogBoxData");

const employeeSchema = new mongoose.Schema({
  employeeId:{
    type: String,
    required: true,
    unique: true
  },
  employeeName: {
    type: String,
    required: true,
  },
 designation: {
    type: String,
    required: true,
 },
 jsVersion: {
    type: String,
     required: true,
 },
 dateOfBirth: {
    type: String,
     required: true,
 },
 salary: {
    type: Number,
     required: true,
 },
 activeEmployee: {
    type: Boolean,
     required: true,
 },
 phoneNumber: {
    type: String,
     required: true,
},
address:{
    type: String,
     required: true,
},
createdAt: {
    type: Date,
    default: Date.now,
}
});

module.exports = mongoose.model("Employee", employeeSchema);
