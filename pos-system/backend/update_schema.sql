-- Update database schema for stock movements fix

-- Add missing columns to stok_hareketleri table
ALTER TABLE stok_hareketleri 
ADD COLUMN hareket_tipi ENUM('giris', 'cikis', 'duzeltme') NOT NULL DEFAULT 'giris' AFTER urun_id,
ADD COLUMN aciklama TEXT AFTER yeni_stok,
ADD COLUMN sube_id INT NOT NULL DEFAULT 1 AFTER aciklama,
ADD COLUMN kullanici_id INT AFTER sube_id,
ADD FOREIGN KEY (sube_id) REFERENCES subeler(id) ON DELETE CASCADE,
ADD FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE SET NULL;

-- Remove the stok_limiti column that's not needed
ALTER TABLE stok_hareketleri DROP COLUMN stok_limiti;

-- Create stok table if it doesn't exist
CREATE TABLE IF NOT EXISTS stok (
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stok_hareketleri_tarih ON stok_hareketleri(created_at);
CREATE INDEX IF NOT EXISTS idx_stok_urun ON stok(urun_id);
CREATE INDEX IF NOT EXISTS idx_stok_sube ON stok(sube_id);
