// middleware/isAuth.js
module.exports = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Yetkiniz yok. Lütfen giriş yapın.' });
  }
  next(); // Eğer kullanıcı giriş yapmışsa, isteğin devam etmesine izin ver
};