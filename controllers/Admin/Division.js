const route = require("express").Router();
const Division = require("../../models/Division");
const role = require("../../middleware/Role");

route.get("/", async (req, res) => {
  try {
    const savedpost = await Division.find({}).populate(['Course_ID','Std_ID']);
    res.json(savedpost);
  } catch (err) {
    res.json(err);
  }
});

route.post("/",role, async (req, res) => {
  try {
    await new Division({
      ...req.body
    }).save();

    res.json({
      Success: `${req.baseUrl.split("/")[2]} Are Suucessfully Created`
    });
  } catch (error) {
    res.json({ Error: error.message });
  }
});

route.put("/",role, async (req, res) => {
  try {
    const savedpost = await Division.findOneAndUpdate(
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

route.delete("/",role, async (req, res) => {

  const { _id } = req.query;

  if (!_id) return res.json({ Error: "_id is Required to Delete" });
  try {
    const savedpost = await Division.deleteOne({ _id });

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

module.exports = route;
