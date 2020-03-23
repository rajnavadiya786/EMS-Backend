const route = require("express").Router();
const student = require("../../models/Student");
const role = require("../../middleware/Role");


route.get("/",role, async (req, res) => {
  try {
    const students = await student
      .find({})
      .select("-Face_Data")
      .populate(["Standard_id", "Course_id"]);
    res.send(students);
  } catch (err) {
    res.json(err);
  }
});


route.delete("/", role, async (req, res) => {
  const { _id } = req.query;
  if (!_id) return res.json({ Error: "_id is Required to Delete" });
  try {
    const savedpost = await student.deleteOne({ _id });

    if (savedpost.n)
      return res
        .status(200)
        .json({ Success: `${req.baseUrl.split("/")[2]} Are Deleted` });

    res
      .status(400)
      .json({ Error: `${req.baseUrl.split("/")[2]} Are Not Deleted` });
  } catch (error) {
    res.json({ Error: error.message });
  }
});

route.put("/", role, async (req, res) => {
  try {
    const savedpost = await student.findOneAndUpdate(
      { _id: req.body._id },
      { $set: { ...req.body } }
    );

    if (savedpost)
      return res
        .status(200)
        .json({ Success: `${req.baseUrl.split("/")[2]} Are Updated` });

    return res
      .status(400)
      .json({ Error: `${req.baseUrl.split("/")[2]} Are Not Updated` });
  } catch (error) {
    res.json({ Error: error.message });
  }
});

module.exports = route;
