const express = require("express");

const router = express.Router();

const shopController = require("../controllers/shop");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

// dynamic route: handles request for a single product using its ID
router.get("/products/:productId")

router.get("/cart", shopController.getCart);

router.get("/checkout", shopController.getCheckout);

router.get("/orders", shopController.getOders);



module.exports = router;
