const express = require("express");
const bodyParser = require("body-parser");
const Cart = require("../models/Cart");
const { checkToken } = require("../middleware/checkToken");

const router = express.Router();
const jsonParser = bodyParser.json();

router.post("/", checkToken, (req, res) => {
  const user = req.user;
  const item = {
    product: req.body.product,
    quantity: req.body.quantity,
  };

  Cart.findOne({ user: user }).then((foundCart) => {
    if (foundCart) {
      let products = foundCart.items.map((item) => item.product + "");
      if (products.includes(item.product)) {
        Cart.findOneAndUpdate(
          {
            user: user,
            items: {
              $elemMatch: { product: item.product },
            },
          },
          {
            $inc: { "items.$.quantity": item.quantity },
          }
        )
          .exec()
          .then(res.send);
      } else {
        foundCart.items.push(item);
        foundCart.save().then(res.send);
      }
    } else {
      Cart.create({
        user: user,
        items: [item],
      }).then(res.send);
    }
  });
});

router.get("/", checkToken, (req, res) => {
  Cart.findOne({ user: req.user.id })
    .populate("items.product")
    .exec((err, cart) => {
      if (!cart) {
        return res.status(404).send(null);
      }

      res.status(200).send(cart);
    });
});

router.put("/", checkToken, jsonParser, (req, res) => {
  Cart.findById(req.body.cartId).then((foundCart) => {
    foundCart.items = foundCart.items.filter(
      (item) => item._id != req.body.itemId
    );
    foundCart.save(res.send);
  });
});

router.delete("/", checkToken, (req, res) => {
  Cart.findByIdAndRemove(req.query.id)
    .then((result) => res.status(200).send({ result, queryId: req.query.id }))
    .catch((error) => res.status(400).send({ error, queryId: req.query.id }));
});

module.exports = router;
