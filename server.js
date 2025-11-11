// backend/server.js - FİNAL CANLI ORTAM KODU

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // KALICI OTURUM İÇİN EKLENDİ
require('dotenv').config();
const connectDB = require('./db/connection');
const uploadCloud = require('./config/cloudinary');

const menuRoutes = require('./routes/menu');
const restaurantRoutes = require('./routes/restaurants');
const authRoutes = require('./routes/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

connectDB();
const app = express();

// Tüm origin'lere izin ver (dikkat: güvenlik etkileri vardır)
const corsOptions = {
  origin: true, // gelen origin'i yansıt
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Render gibi proxy'lerin (vekil sunucuların) arkasında çalışmak için
app.set('trust proxy', 1);

app.use(express.json());

// OTURUM AYARLARI GÜNCELLENDİ
app.use(session({
  secret: 'bu-cok-gizli-bir-anahtar-olmalı-ve-degistirilmeli',
  resave: false,
  saveUninitialized: false,
  // Oturumları "hafıza kaybı yaşayan" RAM yerine, kalıcı MongoDB'ye kaydet
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions' // Oturumların saklanacağı koleksiyonun adı
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',      // Prod'da HTTPS zorunlu
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // Lokal geliştirmede çerezin gönderilebilmesi için
    maxAge: 1000 * 60 * 60 * 24 // 1 gün
  }
}));
// --- GÜNCELLEME SONA ERDİ ---

// --- ROTALAR ---
app.post('/api/upload', uploadCloud.single('image'), (req, res) => {
  if (!req.file) { return res.status(400).json({ message: 'Lütfen bir dosya seçin.' }); }
  res.status(200).json({ secure_url: req.file.path });
});
app.get('/', (req, res) => res.send('Dijital Menü Backend Sunucusu Çalışıyor!'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/restaurants', restaurantRoutes);
// --- ROTALAR SONA ERDİ ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda başarıyla başlatıldı.`));