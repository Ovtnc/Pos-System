# POS System Backend API

Bu backend, React POS sisteminiz için MySQL veritabanından veri çeken REST API'sidir.

## 🚀 Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
cd backend
npm install
```

2. **Environment dosyasını oluşturun:**
```bash
cp env.example .env
```

3. **Veritabanı ayarlarını yapın:**
`.env` dosyasını düzenleyerek veritabanı bilgilerinizi girin:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database_name
DB_PORT=3306
```

4. **Sunucuyu başlatın:**
```bash
npm run dev
```

## 📊 Veritabanı Yapısı

### Products Tablosu
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    stock INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Categories Tablosu
```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### Ürünler
- `GET /api/products` - Tüm ürünleri getir
- `GET /api/products/:id` - Ürün detayını getir
- `GET /api/products/category/:categoryId` - Kategoriye göre ürünleri getir
- `GET /api/products/search/:query` - Ürün ara

### Kategoriler
- `GET /api/categories` - Tüm kategorileri getir
- `GET /api/categories/:id` - Kategori detayını getir

### Sistem
- `GET /api/health` - Sistem durumu kontrolü

## 🔧 Özellikler

- **MySQL2**: Promise-based MySQL bağlantısı
- **CORS**: Cross-origin istekleri için
- **Helmet**: Güvenlik başlıkları
- **Rate Limiting**: API koruması
- **Error Handling**: Kapsamlı hata yönetimi
- **Environment Variables**: Güvenli konfigürasyon

## 🎯 Kullanım

Backend çalıştıktan sonra React uygulamanızda API URL'ini güncelleyin:

```javascript
// src/services/api.ts
const API_BASE_URL = 'http://localhost:3001/api';
```

## 🛠️ Geliştirme

```bash
# Development modunda çalıştır
npm run dev

# Production build
npm start
```

## 📝 Notlar

- Veritabanı bağlantısı başarısız olursa API hata döner
- Tüm endpoint'ler JSON formatında yanıt verir
- Rate limiting: 15 dakikada 100 istek
- CORS tüm origin'lere açık (production'da kısıtlayın)
