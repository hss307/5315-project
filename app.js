require("dotenv").config();
const express = require("express");
const { body, query,validationResult } = require("express-validator");
const { engine } = require("express-handlebars");
const db = require("./db");
const app = express();
const jwtToken = require("jsonwebtoken")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json
const handlebars = require("handlebars");
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const port = process.env.PORT || 3000;

// Set up Handlebars
const zeroToText = (value) => {
  return value === 0 ? "zero" : value;
};

app.engine('hbs', engine({
  extname: '.hbs',
  helpers: {
      zeroToText: zeroToText, // Register custom helper
      eq: function (arg1, arg2) { return arg1 === arg2; } // Register eq helper
  },
  handlebars: allowInsecurePrototypeAccess(handlebars)
}));
app.set('view engine','.hbs');

// Middleware to parse JSON request bodies
app.use(express.json());

// Initialize the database connection
async function initializeDatabase() {
  try {
    await db.initialize(
      "mongodb+srv://hssikand111:Bullet%40350@cluster0.o5ezd2b.mongodb.net/5315-project"
    );
    console.log("Database initialized successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
}

initializeDatabase();

function token(req, res, next) {
  const bearerHeader = req.headers ["authorization"];
  console.log('bearerHeader==> ',bearerHeader)
  if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      req.token = bearerToken;

      jwtToken.verify(req.token, process.env.SECRETKEY, (err, decoded) => {
          if (err) {
              return res.sendStatus(401);
          }
          console.log(decoded);
          next();
      });
  } else {
      return res.sendStatus(401);
}
}
// Define the routes
app.post(
  "/api/addRestaurants",
  [
    body("name").isString(),
    body("borough").isString(),
    body("cuisine").isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newRestaurant = await db.addNewRestaurant(req.body);
      res.status(201).json(newRestaurant);
    } catch (err) {
      res.status(500).json({ error: "Error creating restaurant" });
    }
  }
);
app.get('/api/restaurants', (req, res) => {
  res.render('form', { title: 'Restaurant Form' });
});

app.post("/api/restaurants", async (req, res) => {
  const { page, perPage, borough } = req.body;
  try {
    const restaurants = await db.getAllRestaurants(page, perPage, borough);
    res.render("restaurants", {
      title: "Restaurant Data",
      restaurants: restaurants,
    });
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/restaurants/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const restaurant = await db.getRestaurantById(id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: "Error fetching restaurant" });
  }
});

app.post('/login',(req,res) => {
  const { username, password } = req.body;
  if(username==='harman' && password === 'hss123'){
    const token = jwtToken.sign({username:username}, process.env.SECERETKEY);
    res.cookie('token',token,{httpOnly:true});
    res.json({message:'login Successfull',Token:token});
  }
  else{
    res.status(401).json({message:'Invalid Credentials'})
  }
});

app.put(
  "/api/restaurants/:id",token,
  async (req, res) => {
    const { id } = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await db.updateRestaurantById(req.body, id);
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      res.json({ message: "Restaurant updated successfully" });
    } catch (err) {
      res.status(500).json({ error: "Error updating restaurant" });
    }
  }
);

app.delete("/api/restaurants/:id",token, async (req, res) => {
  const rId  = req.params.id;
  try {
    const deletedRestaurant = await db.deleteRestaurantById(rId);
    if (!deletedRestaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted successfully' });
} catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ message: 'Internal Server Error' });
}
});