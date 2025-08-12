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



// Stok tablosu oluşturma endpoint'i
app.post('/api/stock/create-table', async (req, res) => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS stok (
        id INT AUTO_INCREMENT PRIMARY KEY,
        urun_id INT NULL,
        urun_adi VARCHAR(100) NOT NULL,
        mevcut_stok INT NOT NULL DEFAULT 0,
        minimum_stok INT NOT NULL DEFAULT 10,
        birim VARCHAR(20) NOT NULL DEFAULT 'adet',
        son_guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Stok hareketleri tablosu
    await db.execute(`
      CREATE TABLE IF NOT EXISTS stok_hareketleri (
        id INT AUTO_INCREMENT PRIMARY KEY,
        urun_id INT NOT NULL,
        hareket_tipi ENUM('giris', 'cikis', 'transfer') NOT NULL,
        miktar INT NOT NULL,
        onceki_stok INT NOT NULL,
        yeni_stok INT NOT NULL,
        aciklama TEXT,
        sube_id INT,
        kullanici_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE CASCADE,
        FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE SET NULL,
        FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE SET NULL
      )
    `);

    res.json({ success: true, message: 'Stok tabloları oluşturuldu' });
  } catch (error) {
    console.error('Stok tablosu oluşturma hatası:', error);
    res.status(500).json({ success: false, error: 'Stok tabloları oluşturulamadı' });
  }
});

// Stok tablosuna örnek veriler ekleme endpoint'i
app.post('/api/stock/seed', async (req, res) => {
  try {
    // Önce tabloları sil ve yeniden oluştur
    await db.execute('DROP TABLE IF EXISTS stok_hareketleri');
    await db.execute('DROP TABLE IF EXISTS stok');
    
    // Stok tablosunu yeniden oluştur
    await db.execute(`
      CREATE TABLE stok (
        id INT AUTO_INCREMENT PRIMARY KEY,
        urun_id INT NULL,
        urun_adi VARCHAR(100) NOT NULL,
        mevcut_stok INT NOT NULL DEFAULT 0,
        minimum_stok INT NOT NULL DEFAULT 10,
        birim VARCHAR(20) NOT NULL DEFAULT 'adet',
        son_guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Stok hareketleri tablosunu yeniden oluştur
    await db.execute(`
      CREATE TABLE stok_hareketleri (
        id INT AUTO_INCREMENT PRIMARY KEY,
        urun_id INT NULL,
        hareket_tipi ENUM('giris', 'cikis', 'transfer') NOT NULL,
        miktar INT NOT NULL,
        onceki_stok INT NOT NULL,
        yeni_stok INT NOT NULL,
        aciklama TEXT,
        sube_id INT,
        kullanici_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Varsayılan kategori ekle
    await db.execute(`
      INSERT INTO kategoriler (ad, aciklama, sube_id)
      VALUES (?, ?, ?)
    `, ['Malzemeler', 'Kafe malzemeleri', 1]);

    

    // Her malzeme için stok kaydı oluştur
    for (const item of cafeItems) {
      const currentStock = Math.floor(Math.random() * 100) + 10; // 10-110 arası rastgele stok
      
      // Önce ürünü ekle
      const [productResult] = await db.execute(`
        INSERT INTO urunler (isim, fiyat, kategori_id)
        VALUES (?, ?, ?)
      `, [item.name, 0, 1]); // kategori_id 1 varsayılan olarak
      
      const urunId = productResult.insertId;
      
      // Sonra stok kaydını oluştur
      await db.execute(`
        INSERT INTO stok (urun_id, urun_adi, mevcut_stok, minimum_stok, birim, sube_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [urunId, item.name, currentStock, item.min, item.unit, 1]); // sube_id 1 varsayılan olarak
      
      // Örnek stok hareketleri ekle
      const oncekiStok = currentStock - 10;
      const yeniStok = currentStock;
      
      // Giriş hareketi
      await db.execute(`
        INSERT INTO stok_hareketleri 
        (urun_id, hareket_tipi, miktar, onceki_stok, yeni_stok, aciklama, sube_id, kullanici_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [urunId, 'giris', 10, oncekiStok, yeniStok, 'İlk stok girişi', 1, 1]);
      
      // Çıkış hareketi
      const cikisOnceki = yeniStok;
      const cikisYeni = yeniStok - 5;
      await db.execute(`
        INSERT INTO stok_hareketleri 
        (urun_id, hareket_tipi, miktar, onceki_stok, yeni_stok, aciklama, sube_id, kullanici_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [urunId, 'cikis', 5, cikisOnceki, cikisYeni, 'Örnek çıkış', 1, 1]);
    }

    res.json({ success: true, message: 'Kafe malzemeleri stok tablosuna eklendi' });
  } catch (error) {
    console.error('Stok seed hatası:', error);
    res.status(500).json({ success: false, error: 'Stok verileri eklenemedi' });
  }
});

// Stok listesi endpoint'i
app.get('/api/stock', async (req, res) => {
  try {
    const [stock] = await db.execute(`
      SELECT 
        s.id,
        s.urun_id,
        s.urun_adi,
        s.mevcut_stok,
        s.minimum_stok,
        s.birim,
        s.son_guncelleme,
        COALESCE(u.fiyat, 0) as fiyat,
        COALESCE(k.ad, 'Malzeme') as kategori_adi
      FROM stok s
      LEFT JOIN urunler u ON s.urun_id = u.id
      LEFT JOIN kategoriler k ON u.kategori_id = k.id
      ORDER BY s.urun_adi
    `);

    res.json({ success: true, stock: stock });
  } catch (error) {
    console.error('Stok listesi hatası:', error);
    res.status(500).json({ success: false, error: 'Stok listesi getirilemedi' });
  }
});

// Stok güncelleme endpoint'i
app.put('/api/stock/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { miktar, hareket_tipi, aciklama, sube_id, kullanici_id } = req.body;

    // Mevcut stok bilgisini al
    const [currentStock] = await db.execute(`
      SELECT mevcut_stok, urun_id, urun_adi FROM stok WHERE id = ?
    `, [id]);

    if (currentStock.length === 0) {
      return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
    }

    const onceki_stok = currentStock[0].mevcut_stok;
    let yeni_stok = onceki_stok;

    // Stok hesaplama
    if (hareket_tipi === 'giris') {
      yeni_stok = onceki_stok + miktar;
    } else if (hareket_tipi === 'cikis') {
      yeni_stok = onceki_stok - miktar;
      if (yeni_stok < 0) {
        return res.status(400).json({ success: false, error: 'Yetersiz stok' });
      }
    }

    // Stok güncelle
    await db.execute(`
      UPDATE stok 
      SET mevcut_stok = ?, son_guncelleme = NOW()
      WHERE id = ?
    `, [yeni_stok, id]);

    // Stok hareketi kaydet
    await db.execute(`
      INSERT INTO stok_hareketleri 
      (urun_id, hareket_tipi, miktar, onceki_stok, yeni_stok, aciklama, sube_id, kullanici_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, hareket_tipi, miktar, onceki_stok, yeni_stok, aciklama, sube_id, kullanici_id]);

    res.json({ 
      success: true, 
      message: 'Stok güncellendi',
      yeni_stok: yeni_stok
    });
  } catch (error) {
    console.error('Stok güncelleme hatası:', error);
    res.status(500).json({ success: false, error: 'Stok güncellenemedi' });
  }
});

// Stok hareketleri endpoint'i
app.get('/api/stock/movements', async (req, res) => {
  try {
    const [movements] = await db.execute(`
      SELECT 
        sh.id,
        sh.hareket_tipi,
        sh.miktar,
        sh.onceki_stok,
        sh.yeni_stok,
        sh.aciklama,
        sh.created_at,
        s.urun_adi,
        sub.sube_adi,
        k.kullanici_adi
      FROM stok_hareketleri sh
      LEFT JOIN stok s ON sh.urun_id = s.id
      LEFT JOIN subeler sub ON sh.sube_id = sub.id
      LEFT JOIN kullanicilar k ON sh.kullanici_id = k.id
      ORDER BY sh.created_at DESC
      LIMIT 50
    `);

    res.json({ 
      success: true, 
      movements: movements,
      total: movements.length,
      maxRecords: 50
    });
  } catch (error) {
    console.error('Stok hareketleri hatası:', error);
    res.status(500).json({ success: false, error: 'Stok hareketleri getirilemedi' });
  }
});

// Dashboard endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const { subeId } = req.query;
    const branchId = subeId ? parseInt(subeId) : 1;

    // Günlük satışlar
    const [dailySales] = await db.execute(`
      SELECT 
        COALESCE(SUM(tutar), 0) as total_sales,
        COUNT(*) as transaction_count
      FROM odemeler 
      WHERE DATE(odeme_tarihi) = CURDATE() 
      AND sube_id = ?
    `, [branchId]);

    // Haftalık satışlar
    const [weeklySales] = await db.execute(`
      SELECT 
        COALESCE(SUM(tutar), 0) as total_sales,
        COUNT(*) as transaction_count
      FROM odemeler 
      WHERE YEARWEEK(odeme_tarihi) = YEARWEEK(NOW()) 
      AND sube_id = ?
    `, [branchId]);

    // Aylık satışlar
    const [monthlySales] = await db.execute(`
      SELECT 
        COALESCE(SUM(tutar), 0) as total_sales,
        COUNT(*) as transaction_count
      FROM odemeler 
      WHERE YEAR(odeme_tarihi) = YEAR(NOW()) 
      AND MONTH(odeme_tarihi) = MONTH(NOW())
      AND sube_id = ?
    `, [branchId]);

    // Yıllık satışlar
    const [yearlySales] = await db.execute(`
      SELECT 
        COALESCE(SUM(tutar), 0) as total_sales,
        COUNT(*) as transaction_count
      FROM odemeler 
      WHERE YEAR(odeme_tarihi) = YEAR(NOW())
      AND sube_id = ?
    `, [branchId]);

    // Ödeme yöntemlerine göre bugünkü satışlar
    const [paymentMethods] = await db.execute(`
      SELECT 
        odeme_tipi,
        COALESCE(SUM(tutar), 0) as total_amount
      FROM odemeler 
      WHERE DATE(odeme_tarihi) = CURDATE() 
      AND sube_id = ?
      GROUP BY odeme_tipi
    `, [branchId]);

    // Son 10 satış
    const [recentSales] = await db.execute(`
      SELECT 
        id,
        odeme_no,
        tutar,
        odeme_tipi,
        odeme_tarihi as created_at
      FROM odemeler 
      WHERE sube_id = ?
      ORDER BY odeme_tarihi DESC
      LIMIT 10
    `, [branchId]);

    // Bu ayın günlük satış analizi
    const [dailySalesThisMonth] = await db.execute(`
      SELECT 
        DATE(odeme_tarihi) as date,
        COALESCE(SUM(tutar), 0) as total_sales,
        COUNT(*) as transaction_count
      FROM odemeler 
      WHERE YEAR(odeme_tarihi) = YEAR(NOW()) 
      AND MONTH(odeme_tarihi) = MONTH(NOW())
      AND sube_id = ?
      GROUP BY DATE(odeme_tarihi)
      ORDER BY date
    `, [branchId]);

    // En çok satan ürünler
    const [topProducts] = await db.execute(`
      SELECT 
        u.isim as product_name,
        SUM(sd.adet) as total_quantity,
        SUM(sd.toplam_fiyat) as total_revenue
      FROM siparis_detaylari sd
      JOIN siparisler s ON sd.siparis_id = s.id
      JOIN urunler u ON sd.urun_id = u.id
      WHERE MONTH(s.created_at) = MONTH(NOW())
      AND YEAR(s.created_at) = YEAR(NOW())
      AND s.sube_id = ?
      GROUP BY u.id, u.isim
      ORDER BY total_quantity DESC
      LIMIT 10
    `, [branchId]);

    // Günlük saatlik satış (bugün)
    const [hourlySalesToday] = await db.execute(`
      SELECT 
        HOUR(odeme_tarihi) as hour,
        COALESCE(SUM(tutar), 0) as total_sales,
        COUNT(*) as transaction_count
      FROM odemeler 
      WHERE DATE(odeme_tarihi) = CURDATE() 
      AND sube_id = ?
      GROUP BY HOUR(odeme_tarihi)
      ORDER BY hour
    `, [branchId]);

    // Ödeme türleri dağılımı (bu ay)
    const [paymentTypeDistribution] = await db.execute(`
      SELECT 
        odeme_tipi,
        COUNT(*) as count,
        COALESCE(SUM(tutar), 0) as total_amount
      FROM odemeler 
      WHERE YEAR(odeme_tarihi) = YEAR(NOW()) 
      AND MONTH(odeme_tarihi) = MONTH(NOW())
      AND sube_id = ?
      GROUP BY odeme_tipi
    `, [branchId]);

    // Ödeme yöntemlerini düzenle
    const paymentDetails = {
      nakit_satis: 0,
      kart_satis: 0,
      mudavim_satis: 0
    };

    paymentMethods.forEach((payment) => {
      switch (payment.odeme_tipi) {
        case 'nakit':
          paymentDetails.nakit_satis = payment.total_amount;
          break;
        case 'kart':
          paymentDetails.kart_satis = payment.total_amount;
          break;
        case 'mudavim':
          paymentDetails.mudavim_satis = payment.total_amount;
          break;
      }
    });

    res.json({
      success: true,
      dailySales: dailySales[0]?.total_sales || 0,
      dailyTransactions: dailySales[0]?.transaction_count || 0,
      weeklySales: weeklySales[0]?.total_sales || 0,
      weeklyTransactions: weeklySales[0]?.transaction_count || 0,
      monthlySales: monthlySales[0]?.total_sales || 0,
      monthlyTransactions: monthlySales[0]?.transaction_count || 0,
      yearlySales: yearlySales[0]?.total_sales || 0,
      yearlyTransactions: yearlySales[0]?.transaction_count || 0,
      paymentDetails: paymentDetails,
      recentSales: recentSales || [],
      dailySalesThisMonth: dailySalesThisMonth || [],
      topProducts: topProducts || [],
      hourlySalesToday: hourlySalesToday || [],
      paymentTypeDistribution: paymentTypeDistribution || []
    });

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Dashboard verileri getirilemedi' 
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
      SELECT id, kullanici_adi, sube_adi, sube_id
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

// Create test users
app.post('/api/users/create-test', async (req, res) => {
  try {
    const crypto = require('crypto');
    
    // Merkez kullanıcısı
    const merkezPassword = crypto.createHash('sha256').update('password').digest('hex');
    await db.execute(`
      INSERT INTO kullanicilar (kullanici_adi, sifre_hash, rol, sube_id, sube_adi)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE sifre_hash = ?
    `, ['merkez_user', merkezPassword, 'admin', 1, 'Merkez', merkezPassword]);

    // Özgürlük kullanıcısı
    const ozgurlukPassword = crypto.createHash('sha256').update('ozgurluk').digest('hex');
    await db.execute(`
      INSERT INTO kullanicilar (kullanici_adi, sifre_hash, rol, sube_id, sube_adi)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE sifre_hash = ?
    `, ['ozgurluk_user', ozgurlukPassword, 'admin', 2, 'Özgürlük', ozgurlukPassword]);

    res.json({
      success: true,
      message: 'Test kullanıcıları oluşturuldu'
    });
  } catch (error) {
    console.error('Create test users error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Test kullanıcıları oluşturulamadı' 
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
        sube_id: user.sube_id,
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
    const { items, amount, tableId, paymentMethod, userId } = req.body;
    
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

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Kullanıcı ID gerekli' 
      });
    }

    // Kullanıcının şube bilgisini al
    const [users] = await db.execute(`
      SELECT sube_id
      FROM kullanicilar
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Kullanıcı bulunamadı' 
      });
    }

    const subeId = users[0].sube_id;

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
      VALUES (?, ?, ?, ?)
    `, [odemeNo, amount, odemeTipi, subeId]);

    const odemeId = paymentResult.insertId;

    // Sipariş kaydı
    const siparisNo = `SP${Date.now()}`;
    const [orderResult] = await db.execute(`
      INSERT INTO siparisler (siparis_no, masa_id, toplam_tutar, odenecek_tutar, durum, siparis_tipi, sube_id)
      VALUES (?, ?, ?, ?, 'tamamlandi', 'self', ?)
    `, [siparisNo, tableId || null, amount, amount, subeId]);

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

// Kapatılan masaları listele (odemeler tablosundan)
app.get('/api/tables/closed', async (req, res) => {
  try {
    const { date, subeId } = req.query;
    const queryDate = date || new Date().toISOString().split('T')[0];
    
    // Şube filtresi
    const subeFilter = subeId ? 'AND o.sube_id = ?' : '';
    const params = subeId ? [queryDate, subeId] : [queryDate];
    
    // Ödemeler tablosundaki verileri çek
    const [payments] = await db.execute(`
      SELECT 
        o.id,
        o.odeme_no,
        o.tutar as toplam_tutar,
        o.odeme_tipi,
        o.odeme_tarihi as kapanis_tarihi,
        'Bilinmeyen' as acan_kullanici_adi,
        COALESCE(s.sube_adi, 'Merkez') as sube_adi,
        COALESCE(m.masa_adi, CONCAT('Ödeme ', o.odeme_no)) as masa_adi
      FROM odemeler o
      LEFT JOIN subeler s ON o.sube_id = s.id
      LEFT JOIN masalar m ON o.masa_id = m.id
      WHERE DATE(o.odeme_tarihi) = ? ${subeFilter}
      ORDER BY o.odeme_tarihi DESC
    `, params);
    
    res.json({
      success: true,
      tables: payments
    });
  } catch (error) {
    console.error('Closed tables fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Kapatılan masalar getirilemedi: ' + error.message
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
    const { subeId } = req.query;
    
    // Şube filtresi
    const subeFilter = subeId ? 'WHERE sube_id = ?' : '';
    const params = subeId ? [subeId] : [];
    
    const [payments] = await db.execute(`
      SELECT id, odeme_no, tutar, odeme_tipi, odeme_tarihi
      FROM odemeler
      ${subeFilter}
      ORDER BY odeme_tarihi DESC
      LIMIT 10
    `, params);
    
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

// Masa ödeme bilgilerini güncelle
app.put('/api/tables/:tableId/payment', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { odeme_tipi, tutar, kullanici_id } = req.body;
    
    if (!odeme_tipi || !tutar) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ödeme tipi ve tutar gerekli' 
      });
    }

    // Ödeme kaydını güncelle
    await db.execute(`
      UPDATE odemeler 
      SET odeme_tipi = ?, tutar = ?, odeme_tarihi = NOW()
      WHERE id = ?
    `, [odeme_tipi, tutar, tableId]);
    
    res.json({
      success: true,
      message: 'Masa ödeme bilgileri güncellendi'
    });
    
  } catch (error) {
    console.error('Table payment update error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Masa ödeme bilgileri güncellenemedi' 
    });
  }
});

// Raporlar API endpoint'leri

// Tarih aralığına göre ciro raporu
app.get('/api/reports/revenue', async (req, res) => {
  try {
    const { startDate, endDate, subeId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Başlangıç ve bitiş tarihi gerekli' 
      });
    }

    // Şube filtresi
    const subeFilter = subeId ? 'AND sube_id = ?' : '';
    const params = subeId ? [startDate, endDate, subeId] : [startDate, endDate];

    // Toplam ciro
    const [totalRevenue] = await db.execute(`
      SELECT 
        SUM(tutar) as toplam_ciro,
        COUNT(*) as toplam_islem
      FROM odemeler 
      WHERE DATE(odeme_tarihi) BETWEEN ? AND ? ${subeFilter}
    `, params);

    // Ödeme tipine göre ciro
    const [paymentTypeRevenue] = await db.execute(`
      SELECT 
        odeme_tipi,
        SUM(tutar) as toplam_tutar,
        COUNT(*) as islem_sayisi
      FROM odemeler 
      WHERE DATE(odeme_tarihi) BETWEEN ? AND ? ${subeFilter}
      GROUP BY odeme_tipi
      ORDER BY toplam_tutar DESC
    `, params);

    // Günlük ciro
    const [dailyRevenue] = await db.execute(`
      SELECT 
        DATE(odeme_tarihi) as tarih,
        SUM(tutar) as gunluk_ciro,
        COUNT(*) as islem_sayisi
      FROM odemeler 
      WHERE DATE(odeme_tarihi) BETWEEN ? AND ? ${subeFilter}
      GROUP BY DATE(odeme_tarihi)
      ORDER BY tarih
    `, params);

    // Saatlik ciro (bugün için)
    const hourlyParams = subeId ? [subeId] : [];
    const [hourlyRevenue] = await db.execute(`
      SELECT 
        HOUR(odeme_tarihi) as saat,
        SUM(tutar) as saatlik_ciro,
        COUNT(*) as islem_sayisi
      FROM odemeler 
      WHERE DATE(odeme_tarihi) = CURDATE() ${subeId ? 'AND sube_id = ?' : ''}
      GROUP BY HOUR(odeme_tarihi)
      ORDER BY saat
    `, hourlyParams);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0] || { toplam_ciro: 0, toplam_islem: 0 },
        paymentTypeRevenue: paymentTypeRevenue,
        dailyRevenue: dailyRevenue,
        hourlyRevenue: hourlyRevenue
      }
    });
    
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ciro raporu getirilemedi' 
    });
  }
});

// Detaylı satış raporu
app.get('/api/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate, subeId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Başlangıç ve bitiş tarihi gerekli' 
      });
    }

    // Şube filtresi
    const subeFilter = subeId ? 'AND s.sube_id = ?' : '';
    const params = subeId ? [startDate, endDate, subeId] : [startDate, endDate];

    // En çok satılan ürünler
    const [topProducts] = await db.execute(`
      SELECT 
        sd.urun_adi,
        SUM(sd.adet) as toplam_adet,
        SUM(sd.toplam_fiyat) as toplam_tutar,
        COUNT(DISTINCT s.id) as siparis_sayisi
      FROM siparis_detaylari sd
      JOIN siparisler s ON sd.siparis_id = s.id
      WHERE DATE(s.created_at) BETWEEN ? AND ? ${subeFilter}
      GROUP BY sd.urun_adi
      ORDER BY toplam_adet DESC
      LIMIT 10
    `, params);

    // Kategori bazında satış
    const [categorySales] = await db.execute(`
      SELECT 
        k.ad as kategori_adi,
        SUM(sd.toplam_fiyat) as toplam_tutar,
        SUM(sd.adet) as toplam_adet
      FROM siparis_detaylari sd
      JOIN siparisler s ON sd.siparis_id = s.id
      JOIN urunler u ON sd.urun_id = u.id
      JOIN kategoriler k ON u.kategori_id = k.id
      WHERE DATE(s.created_at) BETWEEN ? AND ? ${subeFilter}
      GROUP BY k.id, k.ad
      ORDER BY toplam_tutar DESC
    `, params);

    res.json({
      success: true,
      data: {
        topProducts: topProducts,
        categorySales: categorySales
      }
    });
    
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Satış raporu getirilemedi' 
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
