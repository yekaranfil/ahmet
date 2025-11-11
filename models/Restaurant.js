// models/Restaurant.js
const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // YENİ EKLENDİ: Bu restoranın sahibinin ID'sini burada tutacağız.
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Bu ID'nin User modeline ait olduğunu belirtir.
  }
}, {
  timestamps: true
});

// Aynı kullanıcının aynı isimde iki restoran açmasını engellemek için birleşik index
RestaurantSchema.index({ name: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);