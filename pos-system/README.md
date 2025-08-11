# POS Ödeme Sistemi

Modern ve responsive bir Point of Sale (POS) ödeme sistemi. TypeScript ve Material-UI kullanılarak geliştirilmiştir.

## 🎨 Tasarım Özellikleri

- **Turuncu Pastel Renk Paleti**: Modern ve göze hoş gelen turuncu pastel tonları
- **Responsive Tasarım**: Mobil, tablet ve masaüstü cihazlarda mükemmel görünüm
- **Modern UI/UX**: Material Design prensipleri ile geliştirilmiş kullanıcı arayüzü
- **Wireframe Uyumlu**: Verilen wireframe tasarımına tam uyumlu

## 🚀 Özellikler

### Header Bölümü
- Logo ve marka kimliği
- Arama çubuğu (E'chorle)
- Şube ailesi butonu
- Sipariş detay butonu
- Mobil responsive menü

### Kategori Sidebar
- Ürün kategorileri listesi
- Kategori bazlı filtreleme
- Mobil drawer desteği
- Seçili kategori vurgulaması

### Ürünler Bölümü
- Grid layout ile ürün kartları
- Ürün görselleri ve detayları
- Fiyat ve değerlendirme bilgileri
- Sepete ekleme fonksiyonu
- Kategori bazlı filtreleme

### Sepet Bölümü
- Sepet içeriği listesi
- Ürün miktarı güncelleme
- Ürün silme
- Fiyat özeti (KDV dahil)
- Ödeme işlemi başlatma

## 🛠️ Teknolojiler

- **React 18**: Modern React hooks ve functional components
- **TypeScript**: Tip güvenliği ve geliştirici deneyimi
- **Material-UI (MUI)**: Hazır UI bileşenleri ve tema sistemi
- **Emotion**: CSS-in-JS styling çözümü

## 📦 Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd pos-system
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm start
```

4. Tarayıcınızda `http://localhost:3000` adresini açın.

## 🏗️ Proje Yapısı

```
src/
├── components/
│   ├── Header.tsx          # Üst menü bileşeni
│   ├── CategorySidebar.tsx # Kategori sidebar
│   ├── ProductsSection.tsx # Ürünler bölümü
│   └── Cart.tsx           # Sepet bileşeni
├── theme.ts               # MUI tema konfigürasyonu
├── App.tsx               # Ana uygulama bileşeni
└── index.tsx             # Uygulama giriş noktası
```

## 🎯 Kullanım

1. **Kategori Seçimi**: Sol sidebar'dan ürün kategorisi seçin
2. **Ürün Ekleme**: Ürün kartlarına tıklayarak sepete ekleyin
3. **Sepet Yönetimi**: Sağ panelden sepet içeriğini yönetin
4. **Ödeme**: "Öde" butonuna tıklayarak ödeme işlemini başlatın

## 📱 Responsive Özellikler

- **Mobil**: Drawer menüler ve optimize edilmiş layout
- **Tablet**: Orta boyut ekranlar için optimize edilmiş grid
- **Masaüstü**: Tam özellikli sidebar ve geniş ürün grid'i

## 🎨 Tema Renkleri

- **Ana Renk**: #FF8A65 (Turuncu pastel)
- **İkincil Renk**: #FFCC02 (Sarı-turuncu)
- **Arka Plan**: #FFF8E1 (Çok açık turuncu)
- **Metin**: #424242 (Koyu gri)

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. İlgili bileşeni `src/components/` klasöründe oluşturun
2. TypeScript interface'lerini tanımlayın
3. MUI bileşenlerini kullanarak UI oluşturun
4. Ana App bileşenine entegre edin

### Tema Güncelleme
`src/theme.ts` dosyasından renk paletini ve bileşen stillerini güncelleyebilirsiniz.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje hakkında sorularınız için issue açabilirsiniz.
