const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  neighborhood: { type: String, required: true },
  address: { type: String, required: true },
  priceRange: { type: String, required: true },
  ratings: { type: Number, required: true },
  reviewCount: { type: Number, required: true },
  restaurant_id: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Restaurant", restaurantSchema);