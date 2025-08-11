import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  CardGiftcard as GiftIcon,
  Security as SecurityIcon,
  Money as MoneyIcon,
  CreditCard as CardIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

interface DashboardData {
  dailySales: number;
  dailyTransactions: number;
  weeklySales: number;
  weeklyTransactions: number;
  monthlySales: number;
  monthlyTransactions: number;
  yearlySales: number;
  yearlyTransactions: number;
  paymentDetails: {
    nakit_satis: number;
    kart_satis: number;
    mudavim_satis: number;
  };
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
        setDashboardData(data);
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
      value: `₺${dashboardData.dailySales?.toLocaleString() || '0'}`,
      subtitle: `${dashboardData.dailyTransactions || 0} işlem`,
      icon: <ReceiptIcon />,
      color: '#FF6B35',
    },
    {
      title: 'Haftalık Satış',
      value: `₺${dashboardData.weeklySales?.toLocaleString() || '0'}`,
      subtitle: `${dashboardData.weeklyTransactions || 0} işlem`,
      icon: <RefreshIcon />,
      color: '#2E3B55',
    },
    {
      title: 'Aylık Satış',
      value: `₺${dashboardData.monthlySales?.toLocaleString() || '0'}`,
      subtitle: `${dashboardData.monthlyTransactions || 0} işlem`,
      icon: <GiftIcon />,
      color: '#4ECDC4',
    },
    {
      title: 'Yıllık Satış',
      value: `₺${dashboardData.yearlySales?.toLocaleString() || '0'}`,
      subtitle: `${dashboardData.yearlyTransactions || 0} işlem`,
      icon: <SecurityIcon />,
      color: '#45B7D1',
    },
  ];

  const paymentCards = [
    {
      title: 'Nakit Ödemeler',
      value: `₺${dashboardData.paymentDetails?.nakit_satis?.toLocaleString() || '0'}`,
      change: 'Bugün',
      icon: <MoneyIcon />,
      iconColor: '#4ECDC4',
    },
    {
      title: 'Kart Ödemeleri',
      value: `₺${dashboardData.paymentDetails?.kart_satis?.toLocaleString() || '0'}`,
      change: 'Bugün',
      icon: <CardIcon />,
      iconColor: '#95E1D3',
    },
    {
      title: 'Müdavim Ödemeleri',
      value: `₺${dashboardData.paymentDetails?.mudavim_satis?.toLocaleString() || '0'}`,
      change: 'Bugün',
      icon: <PersonIcon />,
      iconColor: '#FF6B35',
    },
  ];

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
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
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
      </Box>
    </Box>
  );
};

export default Dashboard;
