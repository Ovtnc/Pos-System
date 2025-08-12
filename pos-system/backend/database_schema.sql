-- Charlie POS System Database Schema (Self Servis Odaklı)

-- Charlie POS System Database Schema (Self Servis Odaklı)
-- Bu dosya pos_system veritabanı için kullanılacak

-- ========================================
-- ŞUBELER (BRANCHES)
-- ========================================
CREATE TABLE subeler (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sube_adi VARCHAR(50) UNIQUE NOT NULL,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- KULLANICILAR (USERS)
-- ========================================
CREATE TABLE kullanicilar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kullanici_adi VARCHAR(50) UNIQUE NOT NULL,
    sifre_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'merkez', 'ozgurluk') NOT NULL,
    sube_id INT NOT NULL,
    sube_adi VARCHAR(50) NOT NULL,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE CASCADE
);

-- ========================================
-- KATEGORİLER (CATEGORIES)
-- ========================================
CREATE TABLE kategoriler (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ad VARCHAR(50) NOT NULL,
    aciklama TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    sube_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE CASCADE
);

-- ========================================
-- ÜRÜNLER (PRODUCTS)
-- ========================================
CREATE TABLE urunler (
    id INT PRIMARY KEY AUTO_INCREMENT,
    isim VARCHAR(100) NOT NULL,
    fiyat DECIMAL(10,2) NOT NULL,
    kategori_id INT,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategoriler(id) ON DELETE SET NULL
);

-- ========================================
-- MASALAR (TABLES)
-- ========================================
CREATE TABLE masalar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    masa_adi VARCHAR(50) NOT NULL,
    sube_id INT NOT NULL,
    durum ENUM('acik', 'kapali', 'rezerve') DEFAULT 'kapali',
    acilis_tarihi DATETIME,
    kapanis_tarihi DATETIME,
    toplam_tutar DECIMAL(10,2) DEFAULT 0.00,
    acan_kullanici_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE CASCADE,
    FOREIGN KEY (acan_kullanici_id) REFERENCES kullanicilar(id) ON DELETE SET NULL
);

-- ========================================
-- SİPARİŞLER (ORDERS)
-- ========================================
CREATE TABLE siparisler (
    id INT PRIMARY KEY AUTO_INCREMENT,
    siparis_no VARCHAR(20) UNIQUE NOT NULL,
    masa_id INT,
    toplam_tutar DECIMAL(10,2) NOT NULL,
    indirim_tutari DECIMAL(10,2) DEFAULT 0.00,
    odenecek_tutar DECIMAL(10,2) NOT NULL,
    durum ENUM('beklemede', 'hazirlaniyor', 'hazir', 'teslim_edildi', 'iptal', 'tamamlandi') DEFAULT 'beklemede',
    siparis_tipi ENUM('masa', 'self') DEFAULT 'self',
    sube_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (masa_id) REFERENCES masalar(id) ON DELETE SET NULL,
    FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE CASCADE
);

-- ========================================
-- SİPARİŞ DETAYLARI (ORDER DETAILS)
-- ========================================
CREATE TABLE siparis_detaylari (
    id INT PRIMARY KEY AUTO_INCREMENT,
    siparis_id INT NOT NULL,
    urun_id INT NOT NULL,
    urun_adi VARCHAR(100) NOT NULL,
    birim_fiyat DECIMAL(10,2) NOT NULL,
    adet INT NOT NULL,
    toplam_fiyat DECIMAL(10,2) NOT NULL,
    durum ENUM('beklemede', 'hazirlaniyor', 'hazir', 'teslim_edildi', 'iptal') DEFAULT 'beklemede',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siparis_id) REFERENCES siparisler(id) ON DELETE CASCADE,
    FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE CASCADE
);

-- ========================================
-- ÖDEMELER (PAYMENTS)
-- ========================================
CREATE TABLE odemeler (
    id INT PRIMARY KEY AUTO_INCREMENT,
    odeme_no VARCHAR(20) UNIQUE NOT NULL,
    siparis_id INT,
    masa_id INT,
    odeme_tipi ENUM('nakit', 'kart', 'mudavim') NOT NULL,
    tutar DECIMAL(10,2) NOT NULL,
    sube_id INT NOT NULL,
    odeme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (siparis_id) REFERENCES siparisler(id) ON DELETE SET NULL,
    FOREIGN KEY (masa_id) REFERENCES masalar(id) ON DELETE SET NULL,
    FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE CASCADE
);

-- ========================================
-- STOK (INVENTORY)
-- ========================================
CREATE TABLE stok (
    id INT PRIMARY KEY AUTO_INCREMENT,
    urun_id INT NOT NULL,
    urun_adi VARCHAR(100) NOT NULL,
    mevcut_stok INT NOT NULL DEFAULT 0,
    minimum_stok INT NOT NULL DEFAULT 0,
    birim VARCHAR(20) DEFAULT 'adet',
    son_guncelleme TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    sube_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE CASCADE,
    FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE CASCADE
);

-- ========================================
-- STOK HAREKETLERİ (INVENTORY MOVEMENTS)
-- ========================================
CREATE TABLE stok_hareketleri (
    id INT PRIMARY KEY AUTO_INCREMENT,
    urun_id INT NOT NULL,
    hareket_tipi ENUM('giris', 'cikis', 'duzeltme') NOT NULL,
    miktar INT NOT NULL,
    onceki_stok INT NOT NULL,
    yeni_stok INT NOT NULL,
    aciklama TEXT,
    sube_id INT NOT NULL,
    kullanici_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE CASCADE,
    FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE CASCADE,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE SET NULL
);

-- ========================================
-- SİSTEM AYARLARI (SYSTEM SETTINGS)
-- ========================================
CREATE TABLE sistem_ayarlari (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ayar_adi VARCHAR(100) UNIQUE NOT NULL,
    ayar_degeri TEXT,
    aciklama TEXT,
    sube_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE CASCADE
);

-- ========================================
-- LOGLAR (LOGS)
-- ========================================
CREATE TABLE sistem_loglari (
    id INT PRIMARY KEY AUTO_INCREMENT,
    kullanici_id INT,
    islem_tipi VARCHAR(50) NOT NULL,
    islem_detayi TEXT,
    ip_adresi VARCHAR(45),
    user_agent TEXT,
    sube_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE SET NULL,
    FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE CASCADE
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX idx_siparisler_tarih ON siparisler(created_at);
CREATE INDEX idx_siparisler_durum ON siparisler(durum);
CREATE INDEX idx_siparisler_masa ON siparisler(masa_id);
CREATE INDEX idx_odemeler_tarih ON odemeler(odeme_tarihi);
CREATE INDEX idx_odemeler_tip ON odemeler(odeme_tipi);
CREATE INDEX idx_masalar_durum ON masalar(durum);
CREATE INDEX idx_urunler_kategori ON urunler(kategori_id);
CREATE INDEX idx_kullanicilar_rol ON kullanicilar(rol);
CREATE INDEX idx_stok_hareketleri_urun ON stok_hareketleri(urun_id);
CREATE INDEX idx_stok_hareketleri_tarih ON stok_hareketleri(created_at);
CREATE INDEX idx_stok_urun ON stok(urun_id);
CREATE INDEX idx_stok_sube ON stok(sube_id);
