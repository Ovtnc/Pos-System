# NewCharlie POS System

Modern bir Point of Sale (POS) sistemi. React frontend ve Node.js backend ile geliştirilmiştir.

## 🚀 Özellikler

- **Kullanıcı Yönetimi**: Şube bazlı kullanıcı girişi
- **Ürün Kategorileri**: Kategorilere göre ürün filtreleme
- **Masa Yönetimi**: Masa açma, kapatma ve sipariş alma
- **Ödeme İşlemleri**: Nakit, kart ve müdavim hesabı ödemeleri
- **Sipariş Takibi**: Masa bazlı sipariş yönetimi
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu

## 📁 Proje Yapısı

```
NewCharlie/
├── pos-system/
│   ├── backend/           # Node.js + Express API
│   │   ├── server.js      # Ana server dosyası
│   │   ├── package.json   # Backend dependencies
│   │   └── README.md      # Backend dokümantasyonu
│   ├── src/               # React frontend
│   │   ├── components/    # React bileşenleri
│   │   ├── services/      # API servisleri
│   │   └── App.tsx        # Ana uygulama bileşeni
│   ├── public/            # Statik dosyalar
│   └── package.json       # Frontend dependencies
└── README.md              # Bu dosya
```

## 🛠️ Teknolojiler

### Frontend
- **React 18** - UI framework
- **TypeScript** - Tip güvenliği
- **Material-UI (MUI)** - UI component library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Veritabanı
- **mysql2** - MySQL driver

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- MySQL (MAMP önerilir)
- npm veya yarn

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/okanvatanci/NewCharlie-POS.git
cd NewCharlie-POS
```

### 2. Backend kurulumu
```bash
cd pos-system/backend
npm install
```

### 3. Veritabanı kurulumu
- MAMP'ı başlatın
- phpMyAdmin'de `pos_system` veritabanını oluşturun
- `database_schema.sql` dosyasını import edin

### 4. Backend konfigürasyonu
```bash
cp env.example .env
# .env dosyasını düzenleyin
```

### 5. Frontend kurulumu
```bash
cd ../
npm install
```

## 🏃‍♂️ Çalıştırma

### Backend'i başlatın
```bash
cd pos-system/backend
npm start
# veya
node server.js
```

### Frontend'i başlatın
```bash
cd pos-system
npm start
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📊 Veritabanı Şeması

### Ana Tablolar
- `kullanicilar` - Kullanıcı bilgileri
- `kategoriler` - Ürün kategorileri
- `urunler` - Ürün bilgileri
- `masalar` - Masa durumları
- `siparisler` - Sipariş kayıtları
- `siparis_detaylari` - Sipariş detayları
- `odemeler` - Ödeme kayıtları
- `subeler` - Şube bilgileri

## 🔐 Kullanıcı Girişi

Varsayılan kullanıcılar:
- **Merkez**: `merkez_user` / `merkez`
- **Özgürlük**: `ozgurluk_user` / `ozgurluk`

## 📱 Kullanım

1. **Giriş Yapın**: Kullanıcı adı ve şifre ile giriş yapın
2. **Kategori Seçin**: Sol menüden kategori seçin
3. **Ürün Ekleme**: Ürünlere tıklayarak sepete ekleyin
4. **Masa Yönetimi**: Masalar sekmesinden masa açın/kapatın
5. **Ödeme**: Sepetten ödeme işlemini tamamlayın

## 🔧 API Endpoints

### Kullanıcı İşlemleri
- `POST /api/auth/login` - Kullanıcı girişi

### Ürün İşlemleri
- `GET /api/products` - Tüm ürünler
- `GET /api/products/category/:id` - Kategoriye göre ürünler
- `GET /api/categories` - Kategoriler

### Masa İşlemleri
- `GET /api/tables` - Aktif masalar
- `POST /api/tables/open` - Masa açma
- `POST /api/tables/close` - Masa kapatma

### Sipariş İşlemleri
- `POST /api/orders` - Sipariş oluşturma
- `GET /api/orders/table/:id` - Masa siparişleri

### Ödeme İşlemleri
- `POST /api/payments` - Ödeme alma

## 🎨 Kategori Sıralaması

1. **Tüm Ürünler**
2. **Hızlı İşlemler**
3. **Sıcak İçecekler**
4. **Soğuk İçecekler**
5. **Yiyecekler**
6. **Bize Özel**
7. **Ekstralar**

## 🐛 Sorun Giderme

### Backend bağlantı hatası
- MAMP'ın çalıştığından emin olun
- MySQL port ayarlarını kontrol edin (varsayılan: 8889)

### Frontend hataları
- Node modules'ı yeniden yükleyin: `npm install`
- Cache'i temizleyin: `npm start -- --reset-cache`

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje Sahibi: Okan Vatanci
- GitHub: [@okanvatanci](https://github.com/okanvatanci)

---

**Not**: Bu proje geliştirme aşamasındadır ve sürekli güncellenmektedir.
