const fs = require("fs");
const path = require("path");

const Cart = require("./cart");

// Product model (represents a product and handles file storage)

// path to products.json file
const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "products.json"
);

// helper function to read products from file
const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      // If file doesn't exist or an error happens,
      // we call the callback with an empty array instead of crashing the app
      cb([]);
    } else {
      // If file is read successfully, parse JSON data
      // and pass the products array into the callback function
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  // save a new product to the file
  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        //find the existing product index
        const existingProductIndex = products.findIndex(
          (prod) => prod.id === this.id
        );
        // replace in the index array
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        // write the info to the file
        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(err); // log error if writing fails
        });
      } else {
        // create simple unique product id
        this.id = Math.random().toString();
        products.push(this); // add current product to existing products
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err); // log error if writing fails
        });
      }
    });
  }

  static deleteById(id) {
    getProductsFromFile((products) => {
      // extracting the product before removing it
      const product = products.find((prod) => prod.id === id);
      const updatedProducts = products.filter((prod) => prod.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  // fetch all products from file
  static fetchAll(cb) {
    // pass the callback to getProductsFromFile.
    // means once products are loaded, `cb(products)` will be executed.
    getProductsFromFile(cb);
  }

  // find a product by its ID
  static findById(id, cb) {
    // `cb` here will run AFTER products are loaded from file,
    // because getProductsFromFile is asynchronous.
    getProductsFromFile((products) => {
      // Once data is available, we find the matching product
      const product = products.find((p) => p.id === id);

      // Then we call the callback and give it the result
      // (so the place that called findById gets the product)
      cb(product);
    });
  }
};
