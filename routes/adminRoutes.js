const express = require("express");
const _ = require("lodash");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Product = require("../models/Product");
const { checkTokenAdmin } = require("../middleware/checkTokenAdmin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

const generateToken = (data) => {
  return jwt.sign(data, process.env.PRIVATE_KEY);
};

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

router.post("/auth/register", async ({ body }, res) => {
  const { username, password, email, key } = body;
  console.log("body", body);

  try {
    if (key !== process.env.PRIVATE_KEY) {
      return res.status(400).send({ message: "Private key required" });
    }
    if (!username) {
      return res.status(400).send({ message: "username required" });
    }

    const user = await Admin.findOne({ username }).exec();

    if (user) {
      return res.status(409).send({ message: "Admin already exists" });
    }

    const newAdminData = {
      username,
      email,
    };

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    newAdminData.password = hash;
    newAdminData.token = generateToken(username);

    const newAdmin = new Admin(newAdminData);
    const createdAdmin = await newAdmin.save();

    res.status(201).send({ ...createdAdmin.toJSON() });
  } catch (err) {
    res.status(500).send({ message: err });
  }
});

router.post("/auth/login", async ({ body }, res) => {
  const { email, password } = body;
  console.log(body);

  try {
    const existingAdmin = await Admin.findOne({ email }).exec();

    if (!existingAdmin) {
      return res.status(401).send({ message: "No user found" });
    }

    const correctPassword = await bcrypt.compare(
      password,
      existingAdmin.password
    );

    if (!correctPassword) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    return res.status(200).send({ ...existingAdmin.toJSON() });
  } catch (err) {
    console.log("error", err);
    res.status(500).send({ message: err });
  }
});

router.get("/orders", checkTokenAdmin, (req, res) => {
  let orders = [];
  User.find({})
    .then((users) => {
      users.forEach((user) => {
        const { _id, email, firstName, lastName, address, phone } = user;
        orders = orders.concat(
          user.orders.map((order) => ({
            ...order,
            user: {
              _id,
              email,
              firstName,
              lastName,
              address,
              phone,
            },
          }))
        );
      });
    })
    .then(() => res.status(200).send(orders));
});

router.get("/users", checkTokenAdmin, (req, res) => {
  User.find({})
    .then((users) =>
      users.map((user) => _.omit(user.toJSON(), ["token", "password"]))
    )
    .then((results) => res.status(200).send(results));
});

router.post("/products", checkTokenAdmin, (req, res) => {
  console.log(req.body);
  Product.create(req.body).then((results) => {
    console.log(results);
    res.send(results);
  });
});

module.exports = router;
