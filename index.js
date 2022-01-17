const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");


app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "abcd",
  database: "recipe",
});

db.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + db.threadId);
});
app.get("/recipes", (req, res) => {

  db.query("SELECT * FROM recipes", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/edit/:id", (req, resp) => {
  const { id } = req.params;
  const { name, instructions, ingredients } = req.body
  console.log(ingredients)
  let sql
  if (!instructions) {

    sql = `UPDATE recipes SET name=? WHERE id= ?`;
    db.query(sql, [name, id], function (err, data) {
      if (err) throw err;
      console.log(data.affectedRows + " record(s) updated");
    });
  }
  else {
    sql = `UPDATE recipes SET name=? WHERE id= ?`;
    db.query(sql, [name, id], function (err, data) {
      if (err) throw err;
      console.log(data.affectedRows + " record(s) updated");
    });
    db.query(`UPDATE recipes SET instructions=? WHERE id= ?`, [instructions, id], (err, data) => {
      if (err) resp.send(err)
    })
    db.query(`UPDATE recipes SET ingredients=? WHERE id=?`, [JSON.stringify(ingredients), id], (err, data) => {
      console.log(err, data)
    })

  }
  db.query("SELECT * FROM recipes", (err, result) => {
    if (err) {
      console.log(err)
    } else {
      resp.send(result)
    }
  })

})
app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  let sql = `DELETE FROM recipes WHERE id = ?`;
  // delete from the recipes table an item which has the id equal to the id that we got from the req paramaters
  db.query(sql, id, (error, results, fields) => {
    if (error)
      return console.error(error.message);
    else {
      //select teh remaining recipe after deleting the one we wanted to delete
      db.query("SELECT * FROM recipes", (err, result) => {
        if (err) {
          console.log(err)
        } else {
          res.send(result)
        }
      })
    }

    // console.log('Deleted Row(s):', results.affectedRows);
  });
})

app.post("/create", (req, res) => {
  const name = req.body.name;
  const instructions = req.body.instructions;
  const ingredients = req.body.ingredients;
  const isGlutenFree = req.body.isGlutenFree
  if (!name || !instructions || ingredients.length == 0) {
    res.send({ success: false, message: "Invalid Input" })
    return
  }

  console.log("name:", name, "instructions:", instructions, "ingredints", ingredients, "is Gluten Free:", isGlutenFree);

  db.query(
    "INSERT INTO recipes (name, instructions,ingredients,isGlutenFree) VALUES (?,?,?,?)",
    [name, instructions, JSON.stringify(ingredients), isGlutenFree],
    (err, result) => {
      if (err) {
        console.log(err, "in error block");
      } else {
        console.log(result)
        db.query("SELECT * FROM recipes", (err, result) => {
          if (err) {
            console.log(err)
          } else {
            res.send(result)
          }
        })
      }
    }
  );

});


app.listen(3001, () => {
  console.log("Server running on port 3001");
});