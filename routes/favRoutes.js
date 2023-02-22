const express = require("express");
const User = require("../models/User");
const { checkToken } = require("../middleware/checkToken");

const router = express.Router();

router.post("/", checkToken, (req, res) => {
  User.findById(req.user.id).then((foundUser) => {
    if (foundUser.favorites.includes(req.body.product)) {
      res.status(200).send();
    } else {
      foundUser.favorites = [...foundUser.favorites, req.body.product];
      foundUser.save((r) => res.status(200).send(r));
    }
  });
});

router.delete("/", checkToken, (req, res) => {
  User.findById(req.user.id).then((foundUser) => {
    console.log("req.query.id", req.query.id);
    foundUser.favorites = foundUser.favorites.filter(
      (fav) => fav !== req.query.id
    );
    foundUser.save((r) => res.status(200).send(r));
  });
});

module.exports = router;
