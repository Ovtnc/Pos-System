import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Button } from '@mui/material';
import { theme } from './theme';
import Header from './components/Header';
import CategorySidebar from './components/CategorySidebar';
import ProductsSection from './components/ProductsSection';
import Cart from './components/Cart';
import PaymentModal from './components/PaymentModal';
import ReceiptModal from './components/ReceiptModal';
import TablesModal from './components/TablesModal';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import TableCallModal from './components/TableCallModal';
import Reports from './components/Reports';
import Login from './components/Login';

import { Product } from './services/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface SelectedTable {
  id: number;
  name: string;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [tablesModalOpen, setTablesModalOpen] = useState(false);
  const [currentPaymentData, setCurrentPaymentData] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<SelectedTable | null>(null);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [stockManagementOpen, setStockManagementOpen] = useState(false);
  const [tableCallModalOpen, setTableCallModalOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleProductSelect = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(prev => 
        prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems(prev => [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
      }]);
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCheckout = (items: CartItem[], total: number) => {
    if (selectedTable && isTableOpen) {
      // Masa açıksa ödeme al
      setPaymentModalOpen(true);
    } else if (selectedTable && !isTableOpen) {
      // Masa seçili ama açık değilse sipariş ekle
      handleAddOrderToTable(items, total);
    } else {
      // Normal ödeme - direkt ödeme modalını aç
      setPaymentModalOpen(true);
    }
  };

  const handleAddOrderToTable = async (items: CartItem[], total: number) => {
    if (!selectedTable) return;

    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
          tableId: selectedTable.id,
          userId: user?.id || 4,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`${selectedTable.name} masasına sipariş başarıyla eklendi!`);
        setCartItems([]);
        setSelectedTable(null);
        setCartOpen(false);
      } else {
        alert('Sipariş eklenemedi: ' + result.error);
      }
    } catch (error) {
      console.error('Sipariş ekleme hatası:', error);
      alert('Sipariş eklenirken bir hata oluştu');
    }
  };



  const handleTableSelect = (tableId: number, tableName: string) => {
    setSelectedTable({ id: tableId, name: tableName });
    setIsTableOpen(false);
    setCartOpen(true);
  };

  const handleTableOpen = async (tableId: number, tableName: string) => {
    try {
      // Masanın mevcut siparişlerini çek
      const response = await fetch(`http://localhost:3001/api/orders/table/${tableId}`);
      const result = await response.json();
      
      if (result.success && result.orders.length > 0) {
        // Siparişleri sepete ekle
        const cartItems = result.orders.map((item: any) => ({
          id: item.urun_id || item.id,
          name: item.urun_adi,
          price: parseFloat(item.birim_fiyat),
          quantity: item.adet,
          category: 'Masa Siparişi',
        }));
        
        setCartItems(cartItems);
        setSelectedTable({ id: tableId, name: tableName });
        setIsTableOpen(true);
        setCartOpen(true);
      } else {
        alert('Bu masada henüz sipariş bulunmuyor.');
      }
    } catch (error) {
      console.error('Masa açma hatası:', error);
      alert('Masa açılırken bir hata oluştu');
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Sayfa yüklendiğinde kullanıcı kontrolü
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      
      // Eski format kontrolü - subeAdi varsa sube'ye çevir
      if (userData.subeAdi && !userData.sube) {
        userData.sube = userData.subeAdi;
        delete userData.subeAdi;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const handlePaymentComplete = async (paymentMethod: string, amount: number, splitInfo?: any, discountInfo?: any) => {
    try {
      // Backend'e ödeme kaydet
      const response = await fetch('http://localhost:3001/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          amount: amount,
          tableId: selectedTable?.id,
          paymentMethod: paymentMethod,
          userId: user?.id,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Ödeme başarılı, makbuz göster
        setCurrentPaymentData({
          items: splitInfo ? splitInfo.items : cartItems,
          total: amount,
          paymentMethod,
          splitInfo,
          discountInfo,
          receiptNumber: `R${result.paymentId}`,
        });
        setReceiptModalOpen(true);
        
        // Split modunda sadece ödenen ürünleri sepetten çıkar
        if (splitInfo && splitInfo.remainingItems) {
          setCartItems(splitInfo.remainingItems);
        } else {
          // Normal ödemede tüm sepeti temizle
          setCartItems([]);
          // Masa ödemesi yapıldıysa masayı temizle
          if (selectedTable) {
            setSelectedTable(null);
            setIsTableOpen(false);
          }
        }
        setCartOpen(false);
      } else {
        alert('Ödeme kaydedilemedi: ' + result.error);
      }
    } catch (error) {
      console.error('Ödeme hatası:', error);
      alert('Ödeme işlemi sırasında bir hata oluştu');
    }
  };

  const handleReceiptClose = () => {
    setReceiptModalOpen(false);
    setCurrentPaymentData(null);
  };

  // Login sayfasını göster
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }



  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header */}
        <Header 
          onMenuClick={handleMenuClick} 
          onCartClick={() => setCartOpen(true)}
          cartItemCount={cartItems.length}
          onTablesClick={() => setTablesModalOpen(true)}
          onDashboardClick={() => setDashboardOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
        
      
        
        {/* Main Content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Category Sidebar */}
          <CategorySidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onCategorySelect={handleCategorySelect}
          />
          
          {/* Products Section */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: 'background.default',
            minWidth: 0, // Flexbox overflow için gerekli
          }}>
            <ProductsSection
              selectedCategory={selectedCategory}
              onProductSelect={handleProductSelect}
              user={user}
            />
          </Box>
          
          {/* Cart */}
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            selectedTable={selectedTable}
            isTableOpen={isTableOpen}
          />
        </Box>

        {/* Payment Modal */}
        <PaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          items={cartItems}
          total={cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0)}
          user={user}
          onPaymentComplete={handlePaymentComplete}
        />

        {/* Receipt Modal */}
        {currentPaymentData && (
          <ReceiptModal
            open={receiptModalOpen}
            onClose={handleReceiptClose}
            items={currentPaymentData.items}
            total={currentPaymentData.total}
            paymentMethod={currentPaymentData.paymentMethod}
            splitInfo={currentPaymentData.splitInfo}
            discountInfo={currentPaymentData.discountInfo}
            receiptNumber={currentPaymentData.receiptNumber}
          />
        )}

        {/* Tables Modal */}
        <TablesModal
          open={tablesModalOpen}
          onClose={() => setTablesModalOpen(false)}
          onTableSelect={handleTableSelect}
          onTableOpen={handleTableOpen}
          user={user}
        />

        {/* Dashboard */}
        {dashboardOpen && (
          <Dashboard 
            user={user} 
            onBack={() => setDashboardOpen(false)}
            onOrderClick={() => {
              setDashboardOpen(false);
              // Sipariş ekranına yönlendir - burada masalar modalını açabiliriz
              setTablesModalOpen(true);
            }}
            onStockClick={() => {
              setDashboardOpen(false); // Dashboard'ı kapat
              setStockManagementOpen(true); // Stok yönetimini aç
            }}
            onTableCallClick={() => {
              setDashboardOpen(false); // Dashboard'ı kapat
              setTableCallModalOpen(true); // Masa çağır modalını aç
            }}
            onReportsClick={() => {
              setDashboardOpen(false); // Dashboard'ı kapat
              setReportsOpen(true); // Raporlar sayfasını aç
            }}
          />
        )}

        {/* Stock Management */}
        {stockManagementOpen && (
          <StockManagement 
            user={user} 
            onBack={() => setStockManagementOpen(false)}
          />
        )}

        {/* Table Call Modal */}
        <TableCallModal
          open={tableCallModalOpen}
          onClose={() => setTableCallModalOpen(false)}
          user={user}
        />

        {/* Reports */}
        {reportsOpen && (
          <Reports
            user={user}
            onBack={() => setReportsOpen(false)}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
