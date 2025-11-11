// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Her email adresi benzersiz olmalı
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  }
});

// Kullanıcıyı veritabanına kaydetmeden HEMEN ÖNCE bu fonksiyon çalışacak
UserSchema.pre('save', async function (next) {
  // Eğer şifre alanı değiştirilmediyse (örn: email güncelleniyorsa) tekrar hash'leme
  if (!this.isModified('password')) {
    return next();
  }
  // Şifreyi hash'le
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);