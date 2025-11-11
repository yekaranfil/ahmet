// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary hesap bilgilerini kullanarak yapılandırma
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Yüklenen resimlerin Cloudinary'de hangi klasörde saklanacağını ve formatını belirleme
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'dijital-menu', // Resimlerin saklanacağı klasör adı
    allowed_formats: ['jpeg', 'png', 'jpg']
  }
});

// Multer'ı yapılandırılmış Cloudinary depolaması ile kullanıma hazır hale getirme
const uploadCloud = multer({ storage });

module.exports = uploadCloud;