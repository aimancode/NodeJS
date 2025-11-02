const fs = require("fs");
const path = require("path");

// creating a class
// Product model (represents a product and handles file storage)
module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  //store an array of products and fetch it
  // save product to products.json file
  save() {
    this.id = Math.random().toString(); // generate simple unique id

    const p = path.join(
      path.dirname(process.mainModule.filename),
      "data",
      "products.json"
    );
    fs.readFile(p, (err, fileContent) => {
      let products = [];

      if (!err) {
        // load existing products
        products = JSON.parse(fileContent);
      }
      products.push(this); // add new product
      fs.writeFile(p, JSON.stringify(products), (err) => {
        // console.log(err);
        // write updated list back to file
      });
    });
    // products.push(this);
  }

  //retrieve all products from file
  static fetchAll(cb) {
    const p = path.join(
      path.dirname(process.mainModule.filename),
      "data",
      "products.json"
    );
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        cb([]); // return empty array if file not found
      }
      cb(JSON.parse(fileContent)); // return stored products
    });
  }
};
