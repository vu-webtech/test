const sqlite3 = require("sqlite3");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


const HTTP_PORT = 8000;
app.listen(HTTP_PORT, () => {
  console.log("Server is listening on port " + HTTP_PORT);
});

const db = new sqlite3.Database("./products_database.db", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    db.run(
      "CREATE TABLE products( \
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
            product NVARCHAR(20)  NOT NULL,\
            origin NVARCHAR(20)  NOT NULL,\
            best_before_date NVARCHAR(20),\
            amount NVARCHAR(100),\
            image NVARCHAR(100)\
        )",
      (err) => {
        if (err) {
          console.log("Table already exists.");
        }
      }
    );
  }
});

app.get("/products", (req, res, next) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.log(`[${new Date()}] - successfully retrieved all products`);
    res.status(200).json({ rows }.rows);
  });
});

app.post("/products/", (req, res, next) => {
  var reqBody = req.body;
  db.run(
    "INSERT INTO products (product, origin, best_before_date, amount, image) VALUES (?,?,?,?,?)",
    [
      reqBody.product,
      reqBody.origin,
      reqBody.best_before_date,
      reqBody.amount,
      reqBody.image,
    ],
    function (err, result) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      console.log(`[${new Date()}] - successfully created product with newly id ${this.lastID}`);
      res.status(201).json({
        id: this.lastID,
      });
    }
  );
});

app.put("/products/", (req, res, next) => {
  var reqBody = req.body;
  db.run(
    `UPDATE products set product = ?, origin = ?, best_before_date = ?, amount = ?, image = ? WHERE id = ?`,
    [
      reqBody.product,
      reqBody.origin,
      reqBody.best_before_date,
      reqBody.amount,
      reqBody.image,
      reqBody.id,
    ],
    function (err, result) {
      if (err) {
        res.status(400).json({ error: res.message });
        return;
      }

      // if the update could be executed properly, 'changes' property would be at least 1.∏
      if (this.changes === 0) {
        res.status(404).json({ error: res.message });
        return;
      }

      console.log(`[${new Date()}] - successfully updated product with id ${reqBody.id}`);
      res.status(204).json({ updatedID: this.changes });
    }
  );
});

app.delete("/products/:id", (req, res, next) => {
  db.run(`DELETE FROM products WHERE id = ?`, req.params.id, function (
    err,
    result
  ) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }

    // if the update could be executed properly, 'changes' property would be at least 1.∏
    if (this.changes === 0) {
      res.status(404).json({ error: res.message });
      return;
    }
    console.log(`[${new Date()}] - successfully deleted product with id ${this.lastID}`);
    res.status(204).json({ deletedID: this.lastID });
  });
});

app.delete("/products/", (req, res, next) => {
  db.run(`DELETE FROM products`, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }

    // if the update could be executed properly, 'changes' property would be at least 1.∏
    if (this.changes === 0) {
      res.status(404).json({ error: res.message });
      return;
    }

    // always revert to these 2 products like in the original api.
    let insert =
      "INSERT INTO products (product, origin, best_before_date, amount, image) VALUES (?,?,?,?,?)";
    db.run(insert, [
      "Apples",
      "The Netherlands",
      "November 2019",
      "100kg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Apples.jpg/512px-Apples.jpg",
    ]);
    db.run(insert, [
      "Bananas",
      "India",
      "February 2019",
      "120kg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bananas.jpg/640px-Bananas.jpg",
    ]);

    console.log(`[${new Date()}] - successfully reset products database`);
    res.status(204).json({});
  });
});
