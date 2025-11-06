1. getAddProduct Controller
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

🔹 What does this function do?

This controller loads the "Add Product" page in the admin section.
It renders a template (edit-product.ejs) where the admin can fill a form to create a new product.

🔹 Why is it implemented this way?
Reason	Explanation
Reuses same template for Add & Edit	Instead of having 2 separate views, one template is used for both actions.
Passes editing: false	The view needs to know if it's in add mode or edit mode. This boolean controls form behavior.
Renders server-side view	Using res.render() to send a dynamic HTML page with data from controller.
🔹 How it works step by step

A request hits the route (ex: /admin/add-product)

This controller runs

It calls res.render()

The view admin/edit-product.ejs is rendered

Variables sent to view:

pageTitle → "Add Product"

path → for nav highlighting

editing → false (so the form acts as "create new")

🔹 Key Concepts Involved
Concept	Meaning
MVC pattern	Controller handles logic, view handles UI, model handles data
Server-side rendering (SSR)	HTML is generated on the server using a template engine
Template variables	Values passed to view to control UI behavior

2. postAddProduct Controller
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;

  const product = new Product(null, title, imageUrl, description, price);
  product.save();
  res.redirect("/");
};

🔹 What does this function do?

This function handles the form submission when a new product is added.
It takes the incoming data, creates a Product object, saves it to file, and redirects to the homepage.

🔹 Why is it implemented this way?
Reason	Explanation
Reading req.body	Form data is sent via POST request, so req.body contains input fields
Creating new Product(...)	Controller does not store data — it delegates to the model
id = null	The model will detect that this is a new product and auto-generate an id
product.save()	Business/data logic stays in the model, not controller
res.redirect("/")	After saving, user is redirected to product list
🔹 How it works step-by-step

User submits “Add Product” form

Body-parser middleware parses input → req.body

Controller extracts form fields:

title

imageUrl

description

price

A new Product instance is created

.save() is called

save() writes data into products.json

User is redirected to homepage /

🔹 Model Interaction

✅ Controller does not handle storage
✅ Model (Product) takes full responsibility

new Product(null, ...)
⬇
save() checks: “Does product already have an id?”
⬇
Since id is null, model treats it as new product
⬇
Writes it to products.json

🔹 Key Concepts
Concept	Meaning
POST request handling	Used for submitting data to server
Thin controller / fat model	Controller delegates saving to model
Separation of concerns	Controller doesn’t know how product is saved
✅ Summary

postAddProduct() takes form input → creates a new product → saves via model → redirects.


getEditProduct Controller
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId, (product) => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
    });
  });
};

🔹 What does this function do?

Loads the Edit Product page with the product data pre-filled.

🔹 Why is it implemented this way?
Reason	Explanation
req.query.edit	Edit mode is activated only if ?edit=true is present
req.params.productId	Product id is extracted from URL (/products/:productId)
findById(id, cb)	Model fetches product asynchronously, so callback is needed
Uses same view (edit-product) as add product	One template, two behaviors (add/edit)
🔹 How it works step-by-step

User clicks “Edit” button → hits URL /admin/edit-product/:productId?edit=true

Controller checks if edit=true

If not → redirects (prevents accidental load)

Extracts product id from URL params

Calls Product.findById()

If product exists → renders form with data filled in

Passes:

editing: true to switch form behavior

product data to show in inputs

🔹 Model Interaction

Product.findById(prodId, callback)
⬇
Reads products.json
⬇
Finds product by id
⬇
Calls callback with product object

🔹 Key Concepts
Concept	Meaning
Route parameters	/edit-product/:productId
Query strings	?edit=true
Asynchronous file reading	Model uses callback to return product later
View reuse	Same template used for both add & edit
✅ Summary

This controller loads the form in edit mode and pre-fills it with product data by fetching it from the model.

✅ 4. postEditProduct Controller
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const updatedProduct = new Product(
    prodId,
    updatedTitle,
    updatedPrice,
    updatedImageUrl,
    updatedDescription
  );

  updatedProduct.save();
  res.redirect("/admin/products");
};

🔹 What does this function do?

Handles submission of the Edit Product form, updates the existing product in file.

🔹 Why is it implemented this way?
Reason	Explanation
Reuses .save()	Same method handles both add and update
Sends prodId instead of null	Model recognizes existing product and overwrites it
Redirects to admin product list	Shows updated version immediately
🔹 How it works step-by-step

Edit form is submitted via POST

Controller reads updated values

Creates new Product object with same id

Calls save() again

Model replaces old product inside products.json

Redirects to /admin/products

🔹 Model Interaction

save() checks:

if (this.id exists) → update existing
else → create new


So here, because prodId is passed → update happens.

✅ Summary

This controller takes edited data and passes it to the model, which updates the file.


5. getProduct Controller
exports.getProduct = (req, res, next) => {
  const products = Product.fetchAll((products) => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  });
};

🔹 What does this function do?

Loads and displays all products in the admin product list page.

🔹 Why is it implemented this way?
Reason	Explanation
Uses Product.fetchAll(cb)	Because product data is stored async in a file, so callback is required
Controller doesn't access file directly	It delegates data logic to model
Renders admin/products.ejs	View displays all stored products
🔹 How it works step-by-step

Admin visits /admin/products

Controller calls Product.fetchAll(callback)

Model reads products.json file asynchronously

Callback returns array of products

Controller renders view admin/products.ejs

Sends data prods: products to template

🔹 Model Interaction

fetchAll(cb) does:

fs.readFile(..., (err, data) => {
   cb(JSON.parse(data))
})


So controller waits until callback is executed.

🔹 Key Concepts
Concept	Meaning
Asynchronous data fetch	Controller does not wait, callback is used
MVC separation	Controller = logic, Model = data, View = UI
Template rendering	Products array is passed to view
✅ Summary

This controller fetches all products from the model and renders them in the admin product list.

✅ 6. postDeleteProduct Controller
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId);
  res.redirect("/admin/products");
};

🔹 What does this function do?

Deletes a product from storage (JSON file) and removes it from the cart if it exists there.

🔹 Why is it implemented this way?
Reason	Explanation
Uses POST instead of GET	DELETE action should not be triggered by a link
Calls Product.deleteById(id)	Controller doesn’t handle file logic
Cart update done in model automatically	Removes related product from shopping cart too
🔹 How it works step-by-step

Admin clicks "Delete" button → form sends POST request

Controller gets productId from req.body

Calls Product.deleteById(prodId)

Model removes product from products.json

Also updates Cart file to remove deleted product

Controller redirects to /admin/products

🔹 Model Interaction

deleteById() filters out product from file

Calls Cart.deleteProduct(id, price) so cart data stays valid

✅ Summary

This controller deletes a product both from the product file and the cart file, then refreshes the admin list.

✅ Now: Full Product Model Breakdown

(You said "explain everything" — so now we go deep)

🔍 Product Model Overview

The Product model is responsible for:

Feature	Explanation
Storing products	in data/products.json file
Creating new products	.save() (no id → new product)
Updating existing products	.save() (has id → update instead of add)
Fetching all products	.fetchAll(cb)
Fetching product by id	.findById(id, cb)
Deleting product	.deleteById(id)

It does not render views or handle routes — only data logic.

✅ Helper function: getProductsFromFile()
const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

What it does:

Reads products.json asynchronously and returns its contents via callback.

Why callback?

Because fs.readFile() is async → cannot return immediately.

Key Point:

If file does not exist → returns empty array instead of crashing app.

✅ save() Method
save() {
  getProductsFromFile((products) => {
    if (this.id) { ... } else { ... }
  });
}

What it does:

If id exists → update existing product

If id is null → add new product

Why?

One function handles both CREATE + UPDATE → DRY (don’t repeat yourself)

New product flow:
this.id = Math.random().toString();
products.push(this);
fs.writeFile(products.json, ...)

Update product flow:
find product index in array
replace it with `this`
write updated array back to file

✅ fetchAll(cb) Method
static fetchAll(cb) {
  getProductsFromFile(cb);
}

What it does:

Reads all products and returns them through callback.

Why callback?

Because reading file is async.

✅ findById(id, cb) Method
static findById(id, cb) {
  getProductsFromFile((products) => {
    const product = products.find(p => p.id === id);
    cb(product);
  });
}

What it does:

Finds one product in the array by its id.

✅ deleteById(id) Method
static deleteById(id) {
  getProductsFromFile((products) => {
    const product = products.find(prod => prod.id === id);
    const updatedProducts = products.filter(prod => prod.id !== id);
    fs.writeFile(..., () => {
      Cart.deleteProduct(id, product.price);
    });
  });
}

What it does:

✅ Removes product from JSON
✅ Also removes product from Cart

Why delete from cart?

Because otherwise cart would still contain products that no longer exist.

✅ BONUS: Why callback instead of promises?

Because this code is from an early stage of Node learning course (before promises & async/await were introduced).

✅ BONUS: Why file storage instead of database?
Reason	Explanation
Simplicity	Used for teaching basics
No DB setup required	No MySQL / MongoDB yet
Easy to see how data is written	Debug-friendly
Later this project evolves to real DB	First JSON, then SQL, then Sequelize, then MongoDB

✅ BONUS: Full MVC Flow Summary
BROWSER FORM SUBMIT
     ↓ (POST request)
ROUTE (Express router)
     ↓
CONTROLLER (collects input, delegates to model)
     ↓
MODEL (saves product to file)
     ↓
CONTROLLER redirects
     ↓
VIEW renders updated UI
