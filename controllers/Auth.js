const route = require("express").Router();
const faculty = require("../models/Faculty");
const student = require("../models/Student");
const admin = require("../models/Admin");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const facejs = require("./Face");

//login handle.....
route.post("/login", async (req, res) => {
  if(!req.body.email) return res.json({ Error: "email Is Empty" })
  else if(!req.body.Password) return res.json({ Error: "Password Is Empty" })

  function success(id, role, Password) {
    if (bcrypt.compareSync(req.body.Password, Password)) {
      const token = jwt.sign(
        { _id: id, role: role },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "1h"
        }
      );

      res.status(200).json({ Success: `${role} Login success`, token: token });
    } else {
      res.json({ Error: `${role} Password Is Worng` });
    }
  }

  try {
    const exist = await student.findOne({ email: req.body.email  } , '_id Password');
    console.log("student", exist);

    if (exist) {

      success(exist._id, "Student", exist.Password);

    } else {

      const exist = await faculty.findOne({ email: req.body.email  } , '_id Password');
      console.log("Faculty", exist);

      if (exist) {

        success(exist._id, "Faculty", exist.Password);

      } else {

        const exist = await admin.findOne({ email: req.body.email  } , '_id Password');
        console.log("admin", exist);

        if (exist) {
          success(exist._id, "Admin", exist.Password);

        } else {
          res.status(400).json({ error: "User Not Found" });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error });
  }
});

//Student regstration...
route.post("/Student", async (req, res) => {
  console.log("body", req.body);
  const {
    name,
    gender,
    fname,
    dob,
    age,
    address,
    imgurl,
    email,
    Password,
    PhNo,
    Standard_id,
    Course_id
  } = req.body;
  const stud = await student.find({ email: email }, "email");
  if (Array.isArray(stud) && stud.length) {
    res.json({ Error: "Email_ID Already Exist" });
  } else {
    const labeledFaceDescriptors = await facejs.loadlabel(imgurl, name, res);

    console.log("image captured", labeledFaceDescriptors);
    if (!labeledFaceDescriptors) {
      res.json({ Error: "no image found" });
    } else {
      const hash = bcrypt.hashSync(Password, 8);
      const savedpost = new student({
        Name: name,
        Gender: gender,
        Fname: fname,
        DOB: dob,
        Age: age,
        Address: JSON.parse(address),
        email: email,
        Img_Path: imgurl,
        PhNo: PhNo,
        Password: hash,
        Face_Data: labeledFaceDescriptors,
        Standard_id,
        Course_id
      })
        .save()
        .then(data => {
          console.log(data);
          res.json({
            Success:
              "Students Regstration Are Complted Now Go to Our EMS Website "
          });
        })
        .catch(error => {
          console.log(error);

          res.json({ Error: error });
        });
    }
  }
});

//Faculty Regstrations....
route.post("/Faculty", async (req, res) => {
  console.log("body", req.body);
  const {
    name,
    gender,
    fname,
    dob,
    age,
    address,
    imgurl,
    email,
    Password,
    PhNo,
    Course_id
  } = req.body;

  const stud = await faculty.find({ email: email }, "email");
  if (Array.isArray(stud) && stud.length) {
    res.json({ error: "Email_ID Already Exist" });
  } else {
    const labeledFaceDescriptors = await facejs.loadlabel(imgurl, name);

    console.log("image captured", labeledFaceDescriptors);
    if (!labeledFaceDescriptors) {
      res.json({ error: "no image found" });
    } else {
      try {
        const hash = bcrypt.hashSync(Password, 8);
        const savedpost = await new faculty({
          Name: name,
          Gender: gender,
          Fname: fname,
          DOB: dob,
          Age: age,
          Address: JSON.parse(address),
          email: email,
          Img_Path: imgurl,
          PhNo: PhNo,
          Password: hash,
          Face_Data: labeledFaceDescriptors,
          Course_id
        }).save();

        console.log("savedpost", savedpost);
        res.json({
          Success:
            "Faculty Regstration Are Complted Now Go to Our EMS Website "
        });
      } catch (error) {
        console.log(error)
        res.json(error);
      }
    }
  }
});

module.exports = route;
