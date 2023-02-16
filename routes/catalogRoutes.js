const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", (req, res) => {
  Product.find({}).then((foundProduct) => {
    res.send(foundProduct);
  });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  Product.findById(id).then((foundProduct) => {
    res.send(foundProduct);
  });
});

module.exports = router;
