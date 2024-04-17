const mongoose = require("mongoose");
const Restaurant = require('./model/restaurant')

// Define the Restaurant schema
// const restaurantSchema = new mongoose.Schema({
//   name: String,
//   borough: String,
//   cuisine: String,
//   // Add other fields as needed
// });


async function initialize(connectionString) {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}

async function addNewRestaurant(data) {
  const restaurant = new Restaurant(data);
  await restaurant.save();
  return restaurant;
}

const getAllRestaurants = async(page, perPage, borough) => {
  const query = {};
  if (borough) {
    console.log('borough',borough)
    query.borough = borough;
  }
  const restaurants = Restaurant.find(query)
    .skip((page - 1) * perPage)
    .limit(perPage)
    .sort({ restaurant_id: 1 });
  return restaurants;
}

async function getRestaurantById(id) {
  const restaurant = await Restaurant.findById(id);
  return restaurant;
}

async function updateRestaurantById(data, id) {
  const result = await Restaurant.findByIdAndUpdate({_id:id}, data, { new: true });
  return result;
}

async function deleteRestaurantById(id) {
  const result = await Restaurant.findByIdAndDelete({_id:id});
  return result;
}

module.exports = {
  initialize,
  addNewRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantById,
  deleteRestaurantById,
};