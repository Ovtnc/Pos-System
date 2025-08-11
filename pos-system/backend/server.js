require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection - MAMP default settings
let db;

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306, // MAMP MySQL port
      user: 'root',
      password: 'root', // MAMP default password
      database: 'pos_system',
      charset: 'utf8mb4'
    });
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Initialize database connection
const initDatabase = async () => {
  try {
    db = await createConnection();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: db ? 'Connected' : 'Disconnected'
  });
});

// Database schema check
app.get('/api/schema/odemeler', async (req, res) => {
  try {
    const [columns] = await db.execute('DESCRIBE odemeler');
    res.json({
      success: true,
      columns: columns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/schema/siparisler', async (req, res) => {
  try {
    const [columns] = await db.execute('DESCRIBE siparisler');
    res.json({
      success: true,
      columns: columns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/schema/siparis_detaylari', async (req, res) => {
  try {
    const [columns] = await db.execute('DESCRIBE siparis_detaylari');
    res.json({
      success: true,
      columns: columns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/schema/masalar', async (req, res) => {
  try {
    const [columns] = await db.execute('DESCRIBE masalar');
    res.json({
      success: true,
      columns: columns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/schema/kullanicilar', async (req, res) => {
  try {
    const [columns] = await db.execute('DESCRIBE kullanicilar');
    res.json({
      success: true,
      columns: columns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Favori ürünler tablosunu oluştur
app.post('/api/favorites/create-table', async (req, res) => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS favori_urunler (
        id INT AUTO_INCREMENT PRIMARY KEY,
        urun_id INT NOT NULL,
        kullanici_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE CASCADE,
        FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorite (urun_id, kullanici_id)
      )
    `);
    res.json({
      success: true,
      message: 'Favori ürünler tablosu oluşturuldu'
    });
  } catch (error) {
    console.error('Favori tablosu oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Favori ürünleri getir
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [favorites] = await db.execute(`
      SELECT f.id, f.urun_id, u.isim as urun_adi, u.fiyat, u.kategori_id, k.ad as kategori_adi
      FROM favori_urunler f
      JOIN urunler u ON f.urun_id = u.id
      JOIN kategoriler k ON u.kategori_id = k.id
      WHERE f.kullanici_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      favorites: favorites
    });
  } catch (error) {
    console.error('Favori ürünler getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Favori ürünler getirilemedi'
    });
  }
});

// Favori ürün ekle
app.post('/api/favorites/add', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı ID ve ürün ID gerekli'
      });
    }

    await db.execute(`
      INSERT INTO favori_urunler (urun_id, kullanici_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
    `, [productId, userId]);

    res.json({
      success: true,
      message: 'Ürün favorilere eklendi'
    });
  } catch (error) {
    console.error('Favori ekleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Favori eklenemedi'
    });
  }
});

// Favori ürün kaldır
app.delete('/api/favorites/remove', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        error: 'Kullanıcı ID ve ürün ID gerekli'
      });
    }

    await db.execute(`
      DELETE FROM favori_urunler 
      WHERE urun_id = ? AND kullanici_id = ?
    `, [productId, userId]);

    res.json({
      success: true,
      message: 'Ürün favorilerden kaldırıldı'
    });
  } catch (error) {
    console.error('Favori kaldırma hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Favori kaldırılamadı'
    });
  }
});

app.get('/api/schema/kategoriler', async (req, res) => {
  try {
    const [columns] = await db.execute('DESCRIBE kategoriler');
    res.json({
      success: true,
      columns: columns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/schema/subeler', async (req, res) => {
  try {
    const [columns] = await db.execute('DESCRIBE subeler');
    res.json({
      success: true,
      columns: columns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



app.get('/api/subeler', async (req, res) => {
  try {
    const [subeler] = await db.execute(`
      SELECT id, sube_adi, adres, telefon
      FROM subeler
      ORDER BY sube_adi
    `);

    res.json({
      success: true,
      subeler: subeler
    });
  } catch (error) {
    console.error('Subeler fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Şubeler getirilemedi' 
    });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id, kullanici_adi, sube_adi
      FROM kullanicilar
      ORDER BY kullanici_adi
    `);

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Kullanıcılar getirilemedi' 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kullanıcı adı ve şifre gerekli' 
      });
    }

    const [users] = await db.execute(`
      SELECT k.id, k.kullanici_adi, 'admin' as rol, k.sube_id, k.sube_adi, k.sifre_hash
      FROM kullanicilar k
      WHERE k.kullanici_adi = ?
    `, [username]);

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Geçersiz kullanıcı adı veya şifre' 
      });
    }

    const user = users[0];
    
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const isPasswordValid = hashedPassword === user.sifre_hash;
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Geçersiz kullanıcı adı veya şifre' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.kullanici_adi,
        name: user.kullanici_adi,
        role: user.rol,
        subeId: user.sube_id,
        sube: user.sube_adi
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Giriş yapılamadı' 
    });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await db.execute(`
      SELECT u.id, u.isim as name, u.fiyat as price, u.kategori_id, k.ad as category
      FROM urunler u
      LEFT JOIN kategoriler k ON u.kategori_id = k.id
      WHERE u.aktif = 1
      ORDER BY u.isim
    `);

    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ürünler getirilemedi' 
    });
  }
});

// Get products by category
app.get('/api/products/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { userId } = req.query;
    
    let products;
    
    if (categoryId === '6') { // Hızlı İşlemler kategorisi
      if (userId) {
        // Favori ürünleri getir
        const [favorites] = await db.execute(`
          SELECT u.id, u.isim as name, u.fiyat as price, u.kategori_id, k.ad as category, 'favorite' as type
          FROM favori_urunler f
          JOIN urunler u ON f.urun_id = u.id
          JOIN kategoriler k ON u.kategori_id = k.id
          WHERE f.kullanici_id = ?
          ORDER BY f.created_at DESC
        `, [userId]);
        
        products = favorites;
      } else {
        // Kullanıcı giriş yapmamışsa boş liste
        products = [];
      }
    } else {
      // Normal kategori ürünleri
      const [categoryProducts] = await db.execute(`
        SELECT u.id, u.isim as name, u.fiyat as price, u.kategori_id, k.ad as category, 'normal' as type
        FROM urunler u
        LEFT JOIN kategoriler k ON u.kategori_id = k.id
        WHERE u.kategori_id = ? AND u.aktif = 1
        ORDER BY u.isim
      `, [categoryId]);
      
      products = categoryProducts;
    }

    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Category products fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Kategori ürünleri getirilemedi' 
    });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT id, ad as name
      FROM kategoriler
      ORDER BY 
        CASE ad
          WHEN 'Hızlı İşlemler' THEN 1
          WHEN 'Sıcak İçecekler' THEN 2
          WHEN 'Soğuk İçecekler' THEN 3
          WHEN 'Yiyecekler' THEN 4
          WHEN 'Bize Özel' THEN 5
          WHEN 'Ekstralar' THEN 6
          ELSE 7
        END
    `);

    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Kategoriler getirilemedi' 
    });
  }
});

// Payment endpoint
app.post('/api/payments', async (req, res) => {
  try {
    const { items, amount, tableId, paymentMethod } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ürün listesi gerekli' 
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Geçerli tutar gerekli' 
      });
    }

    // Ödeme tipini dönüştür
    let odemeTipi = 'nakit';
    switch (paymentMethod) {
      case 'cash':
        odemeTipi = 'nakit';
        break;
      case 'card':
        odemeTipi = 'kart';
        break;
      case 'customer':
        odemeTipi = 'mudavim';
        break;
      default:
        odemeTipi = 'nakit';
    }

    // Ödeme kaydı
    const odemeNo = `OD${Date.now()}`;
    const [paymentResult] = await db.execute(`
      INSERT INTO odemeler (odeme_no, tutar, odeme_tipi, sube_id)
      VALUES (?, ?, ?, 1)
    `, [odemeNo, amount, odemeTipi]);

    const odemeId = paymentResult.insertId;

    // Sipariş kaydı
    const siparisNo = `SP${Date.now()}`;
    const [orderResult] = await db.execute(`
      INSERT INTO siparisler (siparis_no, masa_id, toplam_tutar, odenecek_tutar, durum, siparis_tipi, sube_id)
      VALUES (?, ?, ?, ?, 'tamamlandi', 'self', 1)
    `, [siparisNo, tableId || null, amount, amount]);

    const siparisId = orderResult.insertId;

    // Sipariş detayları
    for (const item of items) {
      await db.execute(`
        INSERT INTO siparis_detaylari (siparis_id, urun_id, urun_adi, adet, birim_fiyat, toplam_fiyat)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [siparisId, item.id, item.name, item.quantity, item.price, item.price * item.quantity]);
    }

    // Masa güncelleme (eğer masa varsa)
    if (tableId) {
      await db.execute(`
        UPDATE masalar 
        SET durum = 'kapali', kapanis_tarihi = NOW(), toplam_tutar = toplam_tutar + ?, updated_at = NOW()
        WHERE id = ?
      `, [amount, tableId]);
    }

    res.json({
      success: true,
      message: 'Ödeme başarıyla kaydedildi',
      odemeId: odemeId,
      siparisId: siparisId
    });

  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ödeme kaydedilemedi: ' + error.message 
    });
  }
});

// Masa endpoint'leri

// Aktif masaları getir (açık ve rezerve) - kullanıcının şubesine göre
app.get('/api/tables', async (req, res) => {
  try {
    const { userId } = req.query;
    
    let query = `
      SELECT m.id, m.masa_adi, m.durum, m.acilis_tarihi, m.toplam_tutar, m.acan_kullanici_id, k.sube_adi
      FROM masalar m
      LEFT JOIN kullanicilar k ON m.acan_kullanici_id = k.id
      WHERE m.durum IN ('acik', 'rezerve')
    `;
    
    let params = [];
    
    // Eğer userId verilmişse, o kullanıcının şubesindeki masaları getir
    if (userId) {
      query += ` AND m.sube_id = (SELECT sube_id FROM kullanicilar WHERE id = ?)`;
      params.push(userId);
    }
    
    query += ` ORDER BY m.masa_adi`;
    
    const [tables] = await db.execute(query, params);

    res.json({
      success: true,
      tables: tables
    });
  } catch (error) {
    console.error('Tables fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Masalar getirilemedi' 
    });
  }
});

// Tüm masaları getir (kapalı dahil)
app.get('/api/tables/all', async (req, res) => {
  try {
    const [tables] = await db.execute(`
      SELECT id, masa_adi, durum, acilis_tarihi, kapanis_tarihi, toplam_tutar, acan_kullanici_id
      FROM masalar
      ORDER BY masa_adi
    `);

    res.json({
      success: true,
      tables: tables
    });
  } catch (error) {
    console.error('All tables fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Masalar getirilemedi' 
    });
  }
});

// Masa aç
app.post('/api/tables/open', async (req, res) => {
  try {
    const { tableName, userId } = req.body;
    
    if (!tableName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Masa adı gerekli' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kullanıcı ID gerekli' 
      });
    }

    // Kullanıcının şube bilgisini al
    const [users] = await db.execute(`
      SELECT sube_id, sube_adi
      FROM kullanicilar
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kullanıcı bulunamadı' 
      });
    }

    const user = users[0];

    // Masa açma - kullanıcının şubesine göre
    const [result] = await db.execute(`
      INSERT INTO masalar (masa_adi, durum, acilis_tarihi, toplam_tutar, acan_kullanici_id, sube_id)
      VALUES (?, 'acik', NOW(), 0.00, ?, ?)
    `, [tableName, userId, user.sube_id]);

    const tableId = result.insertId;

    res.json({
      success: true,
      message: 'Masa başarıyla açıldı',
      tableId: tableId,
      tableName: tableName,
      subeId: user.sube_id,
      subeAdi: user.sube_adi
    });

  } catch (error) {
    console.error('Table open error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Masa açılamadı: ' + error.message 
    });
  }
});

// Masa kapat
app.post('/api/tables/close', async (req, res) => {
  try {
    const { tableId } = req.body;
    
    if (!tableId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Masa ID gerekli' 
      });
    }

    // Masa kapatma
    await db.execute(`
      UPDATE masalar 
      SET durum = 'kapali', kapanis_tarihi = NOW()
      WHERE id = ?
    `, [tableId]);

    res.json({
      success: true,
      message: 'Masa başarıyla kapatıldı',
      tableId: tableId
    });

  } catch (error) {
    console.error('Table close error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Masa kapatılamadı: ' + error.message 
    });
  }
});

// Masa rezerve et
app.post('/api/tables/reserve', async (req, res) => {
  try {
    const { tableId } = req.body;
    
    if (!tableId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Masa ID gerekli' 
      });
    }

    // Masa rezerve etme
    await db.execute(`
      UPDATE masalar 
      SET durum = 'rezerve'
      WHERE id = ?
    `, [tableId]);

    res.json({
      success: true,
      message: 'Masa başarıyla rezerve edildi',
      tableId: tableId
    });

  } catch (error) {
    console.error('Table reserve error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Masa rezerve edilemedi: ' + error.message 
    });
  }
});

// Masa detayını getir
app.get('/api/tables/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const [tables] = await db.execute(`
      SELECT id, masa_adi, durum, acilis_tarihi, kapanis_tarihi, toplam_tutar, acan_kullanici_id
      FROM masalar
      WHERE id = ?
    `, [tableId]);

    if (tables.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Masa bulunamadı' 
      });
    }

    res.json({
      success: true,
      table: tables[0]
    });

  } catch (error) {
    console.error('Table detail error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Masa detayı getirilemedi' 
    });
  }
});

// Sipariş endpoint'leri

// Sipariş oluştur
app.post('/api/orders', async (req, res) => {
  try {
    const { items, tableId, userId } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ürün listesi gerekli' 
      });
    }

    // Toplam tutarı hesapla
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Sipariş kaydı
    const siparisNo = `SP${Date.now()}`;
    const [orderResult] = await db.execute(`
      INSERT INTO siparisler (siparis_no, masa_id, toplam_tutar, odenecek_tutar, durum, siparis_tipi, sube_id)
      VALUES (?, ?, ?, ?, 'beklemede', 'masa', 1)
    `, [siparisNo, tableId || null, totalAmount, totalAmount]);

    const siparisId = orderResult.insertId;

    // Sipariş detayları
    for (const item of items) {
      await db.execute(`
        INSERT INTO siparis_detaylari (siparis_id, urun_id, urun_adi, adet, birim_fiyat, toplam_fiyat)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [siparisId, item.id, item.name, item.quantity, item.price, item.price * item.quantity]);
    }

    // Masa güncelleme (eğer masa varsa)
    if (tableId) {
      await db.execute(`
        UPDATE masalar 
        SET toplam_tutar = toplam_tutar + ?, updated_at = NOW()
        WHERE id = ?
      `, [totalAmount, tableId]);
    }

    res.json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      siparisId: siparisId,
      siparisNo: siparisNo,
      totalAmount: totalAmount
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Sipariş oluşturulamadı: ' + error.message 
    });
  }
});

// Masa siparişlerini getir
app.get('/api/orders/table/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    
    const [orders] = await db.execute(`
      SELECT s.id, s.siparis_no, s.toplam_tutar, s.durum, s.created_at,
             sd.urun_adi, sd.adet, sd.birim_fiyat, sd.toplam_fiyat
      FROM siparisler s
      LEFT JOIN siparis_detaylari sd ON s.id = sd.siparis_id
      WHERE s.masa_id = ? AND s.durum != 'tamamlandi'
      ORDER BY s.created_at DESC
    `, [tableId]);

    res.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Table orders fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Masa siparişleri getirilemedi' 
    });
  }
});

// Sipariş durumunu güncelle
app.put('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Durum gerekli' 
      });
    }

    await db.execute(`
      UPDATE siparisler 
      SET durum = ?, updated_at = NOW()
      WHERE id = ?
    `, [status, orderId]);

    res.json({
      success: true,
      message: 'Sipariş durumu güncellendi'
    });

  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Sipariş durumu güncellenemedi' 
    });
  }
});

// Ödemeleri listele
app.get('/api/payments', async (req, res) => {
  try {
    const [payments] = await db.execute(`
      SELECT id, odeme_no, tutar, odeme_tipi, odeme_tarihi
      FROM odemeler
      ORDER BY odeme_tarihi DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error('Payments fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ödemeler getirilemedi' 
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Bir şeyler ters gitti!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initDatabase();
});
