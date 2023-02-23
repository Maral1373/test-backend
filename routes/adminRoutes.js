const express = require("express");
const _ = require("lodash");
const Admin = require("../models/Admin");
const { checkTokenAdmin } = require("../middleware/checkTokenAdmin");

const router = express.Router();

router.get("/", checkTokenAdmin, (req, res) => {
  res.status(200).send(req.user);
});

router.put("/", checkTokenAdmin, async ({ body, user }, res) => {
  const { email, address, phone, firstName, lastName } = body;

  try {
    const foundAdmin = await Admin.findById(user.id).exec();

    await foundAdmin.replaceOne({
      ..._.omit(foundAdmin.toJSON(), ["id"]),
      email: email || foundAdmin.email,
      address: address || foundAdmin.address,
      phone: phone || foundAdmin.phone,
      firstName: firstName || foundAdmin.firstName,
      lastName: lastName || foundAdmin.lastName,
    });

    return res.status(200).send({ message: "Admin updated" });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
});

module.exports = router;
