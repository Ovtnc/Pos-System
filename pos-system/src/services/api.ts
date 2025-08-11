import axios from 'axios';

// API base URL - Node.js backend API endpoint'i
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token eklemek için
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi için
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Ürün interface'i
export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  rating?: number;
  description: string;
  isAvailable: boolean;
  stock?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Kategori interface'i
export interface Category {
  id: string;
  name: string;
  icon?: string;
  count: number;
  description?: string;
}

// Masa interface'i
export interface Table {
  id: number;
  masa_adi: string;
  durum: 'acik' | 'kapali' | 'rezerve';
  acilis_tarihi?: string;
  kapanis_tarihi?: string;
  toplam_tutar: number;
  acan_kullanici_id?: number;
  sube_adi?: string;
}

// Kullanıcı interface'i
export interface User {
  id: number;
  kullanici_adi: string;
  sube_adi: string;
}

// API fonksiyonları
export const productAPI = {
  // Tüm ürünleri getir
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products');
      const products = response.data.products || response.data;
      // Fiyatları sayıya çevir
      return products.map((product: any) => ({
        ...product,
        id: product.id.toString(),
        price: parseFloat(product.price) || 0,
        description: product.name || '',
        isAvailable: true,
        stock: 100
      }));
    } catch (error) {
      console.error('Ürünler getirilemedi:', error);
      // API erişilemezse mock data döndür
      return mockProducts;
    }
  },

  // Kategoriye göre ürünleri getir
  getProductsByCategory: async (categoryId: string | number): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/category/${categoryId}`);
      const products = response.data.products || response.data;
      // Fiyatları sayıya çevir
      return products.map((product: any) => ({
        ...product,
        id: product.id.toString(),
        price: parseFloat(product.price) || 0,
        description: product.name || '',
        isAvailable: true,
        stock: 100
      }));
    } catch (error) {
      console.error('Kategori ürünleri getirilemedi:', error);
      // API erişilemezse mock data'dan filtrele
      return mockProducts.filter(product => product.category === categoryId);
    }
  },

  // Ürün detayını getir
  getProductById: async (productId: string): Promise<Product> => {
    try {
      const response = await api.get(`/products/${productId}`);
      const product = response.data;
      return {
        ...product,
        price: parseFloat(product.price) || 0
      };
    } catch (error) {
      console.error('Ürün detayı getirilemedi:', error);
      throw error;
    }
  },

  // Ürün ara
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Ürün arama hatası:', error);
      throw error;
    }
  },
};

export const categoryAPI = {
  // Tüm kategorileri getir
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/categories');
      const categories = response.data.categories || response.data;
      return categories.map((category: any) => ({
        ...category,
        id: category.id.toString(),
        count: 0 // Backend'ten count gelmiyor, hesaplanacak
      }));
    } catch (error) {
      console.error('Kategoriler getirilemedi:', error);
      // API erişilemezse mock data döndür
      return mockCategories;
    }
  },

  // Kategori detayını getir
  getCategoryById: async (categoryId: string): Promise<Category> => {
    try {
      const response = await api.get(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Kategori detayı getirilemedi:', error);
      throw error;
    }
  },
};

export const dashboardAPI = {
  // Dashboard verilerini getir
  getDashboardData: async (sube?: string): Promise<any> => {
    try {
      console.log('Dashboard API çağrısı:', sube);
      const response = await api.get(`/dashboard${sube ? `?sube=${sube}` : ''}`);
      console.log('Dashboard API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Dashboard verileri getirilemedi:', error);
      // Mock data döndür
      return {
        dailySales: 19625.00,
        weeklySales: 154660.00,
        monthlySales: 193680.00,
        yearlySales: 193680.00,
        totalSales: 193680.00,
        totalTransactions: 703,
        averageMonthly: 12105.00,
        paymentMethods: [
          { odeme_tipi: 'nakit', total: 1150.00 },
          { odeme_tipi: 'kart', total: 18035.00 },
          { odeme_tipi: 'mudavim', total: 440.00 }
        ],
        dailyChartData: []
      };
    }
  },
};

// Masa API fonksiyonları
export const tableAPI = {
  // Tüm masaları getir
  getAllTables: async (userId?: number): Promise<Table[]> => {
    try {
      const url = userId ? `/tables?userId=${userId}` : '/tables';
      const response = await api.get(url);
      return response.data.tables || response.data;
    } catch (error) {
      console.error('Masalar getirilemedi:', error);
      return [];
    }
  },

  // Masa aç
  openTable: async (tableName: string, userId: number): Promise<any> => {
    try {
      const response = await api.post('/tables/open', {
        tableName,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Masa açılamadı:', error);
      throw error;
    }
  },

  // Masa kapat
  closeTable: async (tableId: number): Promise<any> => {
    try {
      const response = await api.post('/tables/close', {
        tableId
      });
      return response.data;
    } catch (error) {
      console.error('Masa kapatılamadı:', error);
      throw error;
    }
  },

  // Masa rezerve et
  reserveTable: async (tableId: number): Promise<any> => {
    try {
      const response = await api.post('/tables/reserve', {
        tableId
      });
      return response.data;
    } catch (error) {
      console.error('Masa rezerve edilemedi:', error);
      throw error;
    }
  },

  // Masa detayını getir
  getTableById: async (tableId: number): Promise<Table> => {
    try {
      const response = await api.get(`/tables/${tableId}`);
      return response.data.table;
    } catch (error) {
      console.error('Masa detayı getirilemedi:', error);
      throw error;
    }
  },
};

// Kullanıcı API fonksiyonları
export const userAPI = {
  // Tüm kullanıcıları getir
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data.users || response.data;
    } catch (error) {
      console.error('Kullanıcılar getirilemedi:', error);
      return [];
    }
  },
};

// Sipariş API fonksiyonları
export const orderAPI = {
  // Sipariş oluştur
  createOrder: async (items: any[], tableId?: number, userId?: number): Promise<any> => {
    try {
      const response = await api.post('/orders', {
        items,
        tableId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Sipariş oluşturulamadı:', error);
      throw error;
    }
  },

  // Masa siparişlerini getir
  getTableOrders: async (tableId: number): Promise<any[]> => {
    try {
      const response = await api.get(`/orders/table/${tableId}`);
      return response.data.orders || response.data;
    } catch (error) {
      console.error('Masa siparişleri getirilemedi:', error);
      return [];
    }
  },

  // Sipariş durumunu güncelle
  updateOrderStatus: async (orderId: number, status: string): Promise<any> => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Sipariş durumu güncellenemedi:', error);
      throw error;
    }
  },
};


// Mock data - API henüz hazır değilse kullanılacak
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Test Ürün 1',
    price: 25.50,
    category: 'Soğuk İçecekler',
    description: 'Test ürün açıklaması',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Test Ürün 2',
    price: 15.00,
    category: 'Sıcak İçecekler',
    description: 'Test ürün açıklaması',
    isAvailable: true,
  },
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Soğuk İçecekler',
    count: 35,
  },
  {
    id: '2',
    name: 'Sıcak İçecekler',
    count: 14,
  },
  {
    id: '3',
    name: 'Yiyecekler',
    count: 10,
  },
  {
    id: '4',
    name: 'Bize Özel',
    count: 7,
  },
  {
    id: '5',
    name: 'Ekstralar',
    count: 3,
  },
  {
    id: '6',
    name: 'Hızlı İşlemler',
    count: 0,
  },
];

export default api;
