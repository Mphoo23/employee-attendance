const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 8000;
const Employee = require("./models/employee.js");
const Attendance = require("./models/attendence.js");

app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://mayzunphoo_db_user:mayzunphoo_db_user@cluster0.txkdile.mongodb.net"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error);
  });
app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post("/add-employee", async (req, res) => {
  try {
    const {
      employeeName,
      employeeId,
      designation,
      phoneNumber,
      dateOfBirth,
      joiningDate,
      activeEmployee,
      salary,
      address,
    } = req.body;
    const newEmployee = new Employee({
      employeeName,
      employeeId,
      designation,
      phoneNumber,
      dateOfBirth,
      joiningDate,
      activeEmployee,
      salary,
      address,
    });

    await newEmployee.save();
    res
      .status(201)
      .json({ message: "Employee saved successfully", employee: newEmployee });
  } catch (error) {
    console.log("Error creating an employee", error);
    res.status(500).json({ message: "Failed to add employee" });
  }
});

app.get("/employees",async (req,res) => {
  try {
    const employees = await Employee.find()
    res.status(200).json(employees)
  } catch (error) {
    res.status(500).json({message:"Failed to retrieve all the employees"})
  }
})