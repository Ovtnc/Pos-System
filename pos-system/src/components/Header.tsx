import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Store as StoreIcon,
  Receipt as ReceiptIcon,
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  TableRestaurant as TableIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

interface HeaderProps {
  onMenuClick?: () => void;
  onCartClick?: () => void;
  cartItemCount?: number;
  onTablesClick?: () => void;
  onDashboardClick?: () => void;

  user?: any;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  onCartClick, 
  cartItemCount = 0, 
  onTablesClick, 
  onDashboardClick, 
  user, 
  onLogout 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Sol taraf - Logo ve Menü */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={onMenuClick}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StoreIcon sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
             Charlie Coffee
            </Typography>
          </Box>
        </Box>



        {/* Sağ taraf - Kullanıcı Bilgileri, Şube Ailesi, Sipariş Detay ve Sepet */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Kullanıcı Bilgileri */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Typography variant="body2" sx={{ color: 'white', mb: 0.5 }}>
                  Aktif Şube:
                </Typography>
                <Chip 
                  label={user.sube === 'merkez' ? 'Merkez Şube' : (user.sube || 'Bilinmiyor')}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
              <Button
                variant="text"
                size="small"
                onClick={onLogout}
                sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Çıkış
              </Button>
            </Box>
          )}

        

          <Button
            variant="contained"
            startIcon={<DashboardIcon />}
            onClick={onDashboardClick}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            Panel
          </Button>

          <Button
            variant="contained"
            startIcon={<TableIcon />}
            onClick={onTablesClick}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            Masalar
          </Button>





         

          {/* Sepet Butonu */}
          <IconButton
            color="inherit"
            onClick={onCartClick}
            sx={{ 
              position: 'relative',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <CartIcon />
            {cartItemCount > 0 && (
              <Box sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: theme.palette.error.main,
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}>
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </Box>
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
