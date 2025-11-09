const getDb = require("../util/database").getDb;

const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }
  addToCart(product) {
    // Find if the product already exists in the user's cart
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    // Copy existing cart items so we can modify them safely
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      // If the product already exists, increase its quantity by 1
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      // If product does not exist in the cart, add it as a new entry
      updatedCartItems.push({
        productId: new ObjectId(product._id), // store product ID reference
        quantity: newQuantity, // initial quantity is 1
      });
    }

    // Create a new cart object with the updated items array
    const updatedCart = {
      items: updatedCartItems,
    };

    // Get database connection
    const db = getDb();

    // Update the user's cart in the database (replace old cart with new one)
    return db.collection("users").updateOne(
      { _id: new ObjectId(this._id) },
      { $set: { cart: updatedCart } } // MongoDB $set replaces the cart field
    );
  }

  getCart() {
    const db = getDb();

    // Extract all product IDs from the user's cart items
    const productIds = this.cart.items.map((i) => i.productId);

    // Find all products in the 'products' collection that match the cart product IDs
    // '$in' checks if the product _id is inside the array of productIds
    return db
      .collection("products")
      .find({ _id: { $in: productIds } }) // fetch only those products that are in the user's cart
      .toArray()
      .then((products) => {
        // Combine each product with its corresponding quantity from the cart
        return products.map((p) => {
          return {
            ...p, // spread all product details
            quantity: this.cart.items.find((i) => {
              // find the matching product in the cart
              return i.productId.toString() === p._id.toString();
            }).quantity, // attach the quantity value from the cart
          };
        });
      })
      .catch((err) => console.log(err)); // log any errors that occur
  }

  deleteItemFromCart(productId) {
    // Create a new array without the product that matches the given productId
    const updatedCartItems = this.cart.items.filter((item) => {
      // Compare both as strings (ObjectId vs string mismatch fix)
      return item.productId.toString() !== productId.toString();
    });

    //  Get a reference to the MongoDB database
    const db = getDb();

    // Update the user's cart by replacing the old items with the filtered ones
    return db.collection("users").updateOne(
      { _id: new ObjectId(this._id) }, // find the user by their ID
      { $set: { cart: { items: updatedCartItems } } } // set the new cart items
    );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name,
          },
        };
        return db.collection("orders").insertOne(order);
      })

      .then((result) => {
        this.cart = { item: [] };
        // Update the user's cart by replacing the old items with the filtered ones
        return db.collection("users").updateOne(
          { _id: new ObjectId(this._id) }, // find the user by their ID
          { $set: { cart: { items: [] } } } // set the new cart items
        );
      })
      .catch((err) => console.log(err)``);
  }

  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new ObjectId(this._id) })
      .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }) // find a single document
      .then((user) => {
        return user; // ✅ return the found user to the caller
      })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
