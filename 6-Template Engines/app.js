const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

// const expressHbs = require("express-handlebars");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const errorController = require("./controllers/erros");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// defining the relation in the db
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart); // One user has one cart
Cart.belongsTo(User); // A cart belongs to a user

Cart.belongsToMany(Product, { through: CartItem }); // Cart <-> Products (many-to-many)
Product.belongsToMany(Cart, { through: CartItem }); // via CartItem join table
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

// it sinks the models to the database by creating appropriate tables
sequelize
  // .sync({ force: true })
  .sync()
  .then((result) => {
    // create a dummy user
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "max", email: "dummaytest@gmail.com" });
    }
    return user;
  })
  .then((user) => {
    // console.log(user);
    return user.createCart();
  })
  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
