// models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: false },
  price: { type: Number, required: true },
  category: { type: String, required: true, trim: true },
  restaurantId: { type: String, required: true },
  imageUrl: { type: String, required: false },
  // YENİ ALAN EKLENDİ: Ürünün menüdeki sırasını tutacak.
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);