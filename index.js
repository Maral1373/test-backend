require("dotenv").config();

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const seed = require("./seeds/products");

const publicPath = path.join(__dirname, "..", "frontend", "public");
const port = process.env.PORT || 5000;

const app = express();

let connectionRetries = 0;

const connectWithRetry = () => {
  console.log("CONNECTING TO DB...");

  mongoose
    .connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
      console.log("CONNECTED TO DB!");
      clearTimeout(connectWithRetry);
    })
    .catch((err) => {
      console.log(err);

      connectionRetries++;

      if (connectionRetries <= 4) {
        setTimeout(connectWithRetry, 5000);
      } else {
        clearTimeout(connectWithRetry);
      }
    });
};

connectWithRetry();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  bodyParser.json({
    limit: "10MB",
    type: "application/json",
  })
);
app.use(express.static(publicPath));

app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.get("/seed", (req, res) => {
  seed();
  res.send("success");
});
app.listen(port, () => console.log(`SERVER NOW RUNNING ON PORT ${port}...`));
