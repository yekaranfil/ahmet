// routes/menu.js
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// YENİ ÜRÜN OLUŞTURMA (Otomatik order ataması eklendi)
router.post('/add', async (req, res) => {
  try {
    const { name, description, price, category, restaurantId, imageUrl } = req.body;

    // O restorandaki en son ürünün order değerini bul
    const lastItem = await MenuItem.findOne({ restaurantId }).sort({ order: -1 });
    const newOrder = lastItem ? lastItem.order + 1 : 0;

    const newItem = new MenuItem({ name, description, price, category, restaurantId, imageUrl, order: newOrder });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: 'Ürün eklenirken bir hata oluştu.', error: error.message });
  }
});

// BİR RESTORANA AİT TÜM ÜRÜNLERİ LİSTELEME (Sıralama eklendi)
router.get('/:restaurantId', async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ restaurantId: req.params.restaurantId }).sort({ order: 1 }); // order'a göre artan sıralama
        res.status(200).json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Menü alınırken bir hata oluştu.', error: error.message });
    }
});

// YENİ ROUTE: MENÜ ÖĞELERİNİ YENİDEN SIRALAMA
router.put('/reorder', async (req, res) => {
    const { orderedIds } = req.body;
    try {
      // Gelen ID listesindeki her bir ürünün order'ını, listedeki pozisyonuna göre (index) güncelle
      const updatePromises = orderedIds.map((id, index) =>
        MenuItem.findByIdAndUpdate(id, { order: index })
      );
      await Promise.all(updatePromises); // Tüm güncelleme işlemlerinin bitmesini bekle
      res.status(200).json({ message: 'Sıralama başarıyla güncellendi.' });
    } catch (error) {
      console.error('Sıralama Hatası:', error);
      res.status(500).json({ message: 'Sıralama güncellenirken bir hata oluştu.' });
    }
});

// BİR ÜRÜNÜ GÜNCELLEME (Değişiklik yok)
router.put('/:itemId', async (req, res) => {
    try {
        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Güncellenecek ürün bulunamadı.' });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: 'Ürün güncellenirken bir hata oluştu.', error: error.message });
    }
});

// BİR ÜRÜNÜ SİLME (Değişiklik yok)
router.delete('/:itemId', async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.itemId);
        if (!deletedItem) return res.status(404).json({ message: 'Silinecek ürün bulunamadı.' });
        res.status(200).json({ message: 'Ürün başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ message: 'Ürün silinirken bir hata oluştu.', error: error.message });
    }
});

module.exports = router;