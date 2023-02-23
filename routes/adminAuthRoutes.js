const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

const router = express.Router();

const generateToken = (data) => {
  return jwt.sign(data, process.env.PRIVATE_KEY);
};

router.post("/register", async ({ body }, res) => {
  const { username, password, email, key } = body;

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

router.post("/login", async ({ body }, res) => {
  const { email, password } = body;

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
    res.status(500).send({ message: err });
  }
});

module.exports = router;
