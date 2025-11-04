const path = require("path");
const fs = require("fs");
const { json } = require("body-parser");
const { console } = require("inspector");

// build the full path to cart.json file (used to read and write cart data)
const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // 1 Read existing cart data from the file
    // this reads the cart.json file asynchronously to get the current cart state
    fs.readFile(p, (err, fileContent) => {
      // default empty cart structure (used when file doesn't exist or is empty)
      let cart = { products: [], totalPrice: 0 };

      // if no error, parse the JSON data and use the existing cart data
      if (!err) {
        cart = JSON.parse(fileContent);
      }

      // 2 Find if the product already exists in the cart
      // .findIndex() returns the index of the product that matches the given id
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );

      // extract the existing product from the cart array
      const existingProduct = cart.products[existingProductIndex];

      // temporary variable to hold the updated or new product
      let updatedProduct;

      // 3 Update cart depending on whether the product exists
      if (existingProduct) {
        // if product already exists, clone it and increase its quantity by 1
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;

        // replace the old product entry in the products array with the updated one
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        // if product is not in the cart, create a new product object
        updatedProduct = { id: id, qty: 1 };

        // add the new product to the existing cart's product list
        cart.products = [...cart.products, updatedProduct];
      }

      // 4 Update the total price of the cart
      // convert productPrice to a number using unary +, then add it to totalPrice
      cart.totalPrice = cart.totalPrice + +productPrice;

      // 5 Write updated cart data back to the file
      // stringify the updated cart object and overwrite cart.json with new data
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err); // log error if writing to file fails
      });
    });
  }
  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      }
      const updatedCart = { ...JSON.parse(fileContent) };
      const product = updatedCart.products.find((prod) => prod.id === id);
      if (!product) {
        return;
      }
      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter(
        (prod) => prod.id !== id
      );
      updatedCart.totalPrice =
        updatedCart.totalPrice - productPrice * productQty;
      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.log(err); // log error if writing to file fails
      });
    });
  }
  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
