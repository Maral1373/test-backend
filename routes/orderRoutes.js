const express = require("express");
const User = require("../models/User");
const { checkToken } = require("../middleware/checkToken");

const router = express.Router();

router.post("/", checkToken, (req, res) => {
  User.findById(req.user.id).then((foundUser) => {
    foundUser.orders = foundUser.orders.concat(req.body.order);
    foundUser.save((r) => res.status(200).send(r));
  });
});

module.exports = router;
