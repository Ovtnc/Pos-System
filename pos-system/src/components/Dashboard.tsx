import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  CardGiftcard as GiftIcon,
  Security as SecurityIcon,
  Money as MoneyIcon,
  CreditCard as CardIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardData {
  dailySales: string | number;
  dailyTransactions: number;
  weeklySales: string | number;
  weeklyTransactions: number;
  monthlySales: string | number;
  monthlyTransactions: number;
  yearlySales: string | number;
  yearlyTransactions: number;
  paymentDetails: {
    nakit_satis: string | number;
    kart_satis: string | number;
    mudavim_satis: string | number;
  };
  recentSales?: Array<{
    id: number;
    odeme_no: string;
    tutar: string | number;
    odeme_tipi: string;
    created_at: string;
  }>;
  dailySalesThisMonth?: Array<{
    date: string;
    total_sales: string | number;
    transaction_count: number;
  }>;
  topProducts?: Array<{
    product_name: string;
    total_quantity: number;
    total_revenue: string | number;
  }>;
  hourlySalesToday?: Array<{
    hour: number;
    total_sales: string | number;
    transaction_count: number;
  }>;
  paymentTypeDistribution?: Array<{
    odeme_tipi: string;
    count: number;
    total_amount: string | number;
  }>;
}

interface DashboardProps {
  user?: any;
  onBack: () => void;
  onOrderClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onBack, onOrderClick }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    dailySales: 0,
    dailyTransactions: 0,
    weeklySales: 0,
    weeklyTransactions: 0,
    monthlySales: 0,
    monthlyTransactions: 0,
    yearlySales: 0,
    yearlyTransactions: 0,
    paymentDetails: {
      nakit_satis: 0,
      kart_satis: 0,
      mudavim_satis: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/dashboard?sube=${user?.sube || 'merkez'}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data);
        } else {
          console.error('Dashboard veri hatası:', data.error);
        }
      }
    } catch (error) {
      console.error('Dashboard verileri getirilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const salesCards = [
    {
      title: 'Günlük Satış',
      value: `₺${parseFloat(String(dashboardData.dailySales || 0)).toLocaleString()}`,
      subtitle: `${dashboardData.dailyTransactions || 0} işlem`,
      icon: <ReceiptIcon />,
      color: '#FF6B35',
    },
    {
      title: 'Haftalık Satış',
      value: `₺${parseFloat(String(dashboardData.weeklySales || 0)).toLocaleString()}`,
      subtitle: `${dashboardData.weeklyTransactions || 0} işlem`,
      icon: <RefreshIcon />,
      color: '#2E3B55',
    },
    {
      title: 'Aylık Satış',
      value: `₺${parseFloat(String(dashboardData.monthlySales || 0)).toLocaleString()}`,
      subtitle: `${dashboardData.monthlyTransactions || 0} işlem`,
      icon: <GiftIcon />,
      color: '#4ECDC4',
    },
    {
      title: 'Yıllık Satış',
      value: `₺${parseFloat(String(dashboardData.yearlySales || 0)).toLocaleString()}`,
      subtitle: `${dashboardData.yearlyTransactions || 0} işlem`,
      icon: <SecurityIcon />,
      color: '#45B7D1',
    },
  ];

  const paymentCards = [
    {
      title: 'Nakit Ödemeler',
      value: `₺${parseFloat(String(dashboardData.paymentDetails?.nakit_satis || 0)).toLocaleString()}`,
      change: 'Bugün',
      icon: <MoneyIcon />,
      iconColor: '#4ECDC4',
    },
    {
      title: 'Kart Ödemeleri',
      value: `₺${parseFloat(String(dashboardData.paymentDetails?.kart_satis || 0)).toLocaleString()}`,
      change: 'Bugün',
      icon: <CardIcon />,
      iconColor: '#95E1D3',
    },
    {
      title: 'Müdavim Ödemeleri',
      value: `₺${parseFloat(String(dashboardData.paymentDetails?.mudavim_satis || 0)).toLocaleString()}`,
      change: 'Bugün',
      icon: <PersonIcon />,
      iconColor: '#FF6B35',
    },
  ];

  // Günlük satış analizi grafik verisi
  const dailySalesData = {
    labels: dashboardData.dailySalesThisMonth?.map(item => 
      new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    ) || [],
    datasets: [
      {
        label: 'Günlük Satış (₺)',
        data: dashboardData.dailySalesThisMonth?.map(item => parseFloat(String(item.total_sales))) || [],
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  // En çok satan ürünler grafik verisi
  const topProductsData = {
    labels: dashboardData.topProducts?.map(item => item.product_name) || [],
    datasets: [
      {
        label: 'Satış Adedi',
        data: dashboardData.topProducts?.map(item => item.total_quantity) || [],
        backgroundColor: [
          '#FF6B35',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4',
          '#FFEAA7',
          '#DDA0DD',
          '#98D8C8',
          '#F7DC6F',
          '#BB8FCE',
          '#85C1E9'
        ],
        borderWidth: 0,
        borderRadius: 4,
      }
    ]
  };

  // Saatlik satış grafik verisi
  const hourlySalesData = {
    labels: dashboardData.hourlySalesToday?.map(item => `${item.hour}:00`) || [],
    datasets: [
      {
        label: 'Saatlik Satış (₺)',
        data: dashboardData.hourlySalesToday?.map(item => parseFloat(String(item.total_sales))) || [],
        backgroundColor: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.dark,
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  };

  // Ödeme türleri dağılımı grafik verisi
  const paymentTypeData = {
    labels: dashboardData.paymentTypeDistribution?.map(item => {
      switch(item.odeme_tipi) {
        case 'nakit': return 'Nakit';
        case 'kart': return 'Kart';
        case 'mudavim': return 'Müdavim';
        default: return item.odeme_tipi;
      }
    }) || [],
    datasets: [
      {
        data: dashboardData.paymentTypeDistribution?.map(item => parseFloat(String(item.total_amount))) || [],
        backgroundColor: [
          '#4ECDC4',
          '#95E1D3',
          '#FF6B35'
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 4,
      }
    ]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography variant="h6" color="text.secondary">
          Veriler yükleniyor...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: isMobile ? '100%' : 280,
          bgcolor: '#fff',
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'relative',
          zIndex: isMobile ? 1300 : 1
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#4ECDC4', width: 40, height: 40 }}>
              CHARLIE
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.sube || 'Merkez'} Şubesi
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={fetchDashboardData}
            disabled={loading}
            sx={{ 
              color: '#666',
              '&:hover': { 
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                color: theme.palette.primary.main
              }
            }}
          >
            <RefreshIcon sx={{ 
              transform: loading ? 'rotate(360deg)' : 'none',
              transition: loading ? 'transform 1s linear infinite' : 'none'
            }} />
          </IconButton>
        </Box>

        {/* Navigation Menu */}
        <Box sx={{ flex: 1, p: 2 }}>
          <List>
            <ListItem 
              component="button"
              onClick={onBack} 
              sx={{ 
                borderRadius: 2, 
                mb: 1, 
                width: '100%', 
                textAlign: 'left',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemIcon>
                <ArrowBackIcon sx={{ color: '#666' }} />
              </ListItemIcon>
              <ListItemText primary="Ana Sayfa" />
            </ListItem>
            <ListItem 
              component="button"
              onClick={onOrderClick} 
              sx={{ 
                borderRadius: 2, 
                mb: 1, 
                width: '100%', 
                textAlign: 'left',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemIcon>
                <ShoppingCartIcon sx={{ color: '#666' }} />
              </ListItemIcon>
              <ListItemText primary="Sipariş Ver" />
            </ListItem>
          </List>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* Sales Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          {salesCards.map((card, index) => (
            <Card key={index} sx={{ 
              height: '100%', 
              background: `linear-gradient(135deg, ${card.color}15, ${card.color}05)`,
              border: `1px solid ${card.color}20`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${card.color}30`,
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${card.color}20`,
                    color: card.color,
                    mr: 2
                  }}>
                    {React.cloneElement(card.icon, { sx: { fontSize: 24 } })}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                      {card.title}
                    </Typography>
                    {card.subtitle && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {card.subtitle}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Payment Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          {paymentCards.map((card, index) => (
            <Card key={index} sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #fff, #fafafa)',
              border: '1px solid #e0e0e0',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${card.iconColor}20`,
                    color: card.iconColor,
                    mr: 2
                  }}>
                    {React.cloneElement(card.icon, { sx: { fontSize: 28 } })}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {card.change}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

                {/* Grafikler Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Bu Ayın Günlük Satış Analizi */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fff, #fafafa)',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3, display: 'flex', alignItems: 'center' }}>
                <LineChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Bu Ayın Günlük Satış Analizi
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={dailySalesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₺' + value.toLocaleString();
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* En Çok Satan Ürünler */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fff, #fafafa)',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3, display: 'flex', alignItems: 'center' }}>
                <BarChartIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                En Çok Satan Ürünler
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={topProductsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* İkinci Grafik Satırı */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {/* Günlük Saatlik Satış */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fff, #fafafa)',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3, display: 'flex', alignItems: 'center' }}>
                <BarChartIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                Günlük Saatlik Satış
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={hourlySalesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₺' + value.toLocaleString();
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Ödeme Türleri Dağılımı */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fff, #fafafa)',
            border: '1px solid #e0e0e0',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3, display: 'flex', alignItems: 'center' }}>
                <PieChartIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                Ödeme Türleri Dağılımı
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Doughnut 
                  data={paymentTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
