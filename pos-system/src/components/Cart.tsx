import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  Button,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  TableRestaurant as TableRestaurantIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: (items: CartItem[], total: number) => void;
  open: boolean;
  onClose: () => void;
  selectedTable?: { id: number; name: string } | null;
  isTableOpen?: boolean;
}

const Cart: React.FC<CartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  open,
  onClose,
  selectedTable,
  isTableOpen,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Fiyatlar zaten KDV dahil olduğu için KDV eklemiyoruz
  const total = subtotal;

  const cartContent = (
    <Box sx={{ 
      width: isMobile ? '100vw' : { sm: 350, md: 350 },
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'background.paper',
      boxShadow: isMobile ? 'none' : '0 0 20px rgba(0,0,0,0.1)',
      borderLeft: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontWeight: 'bold'
          }}>
            <CartIcon />
            Sepetim
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={items.length}
              size="small"
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            <IconButton
              onClick={onClose}
              sx={{ 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Selected Table Info */}
      {selectedTable && (
        <Box sx={{ 
          p: 2, 
          backgroundColor: isTableOpen 
            ? theme.palette.warning.light + '20'
            : theme.palette.success.light + '20',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="subtitle2" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: isTableOpen 
              ? theme.palette.warning.dark
              : theme.palette.success.dark,
            fontWeight: 'bold'
          }}>
            <TableRestaurantIcon fontSize="small" />
            {selectedTable.name} - {isTableOpen ? 'Ödeme Alınıyor' : 'Sipariş Alınıyor'}
          </Typography>
        </Box>
      )}

      {/* Cart Items */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {items.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            p: 3,
            color: theme.palette.text.secondary
          }}>
            <CartIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Sepetiniz Boş
            </Typography>
            <Typography variant="body2" align="center">
              Ürün eklemek için kategorilerden seçim yapın
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem sx={{ 
                  px: 2, 
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flexGrow: 1,
                    gap: 0.5
                  }}>
                    {/* Ürün Adı */}
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: '0.95rem'
                    }}>
                      {item.name}
                    </Typography>
                    
                    {/* Kategori ve Fiyat */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: 1
                    }}>
                      <Chip 
                        label={item.category}
                        size="small"
                        sx={{ 
                          backgroundColor: theme.palette.secondary.main,
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                          '& .MuiChip-label': {
                            px: 1,
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                        fontSize: '0.9rem'
                      }}>
                        ₺{item.price.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Miktar Kontrolleri */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    ml: 2
                  }}>
                    <IconButton
                      size="small"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      sx={{ 
                        backgroundColor: theme.palette.grey[300],
                        color: theme.palette.text.primary,
                        width: 28,
                        height: 28,
                        '&:hover': { 
                          backgroundColor: theme.palette.grey[400],
                        },
                        '&.Mui-disabled': { 
                          backgroundColor: theme.palette.action.disabled,
                          color: theme.palette.action.disabledBackground
                        }
                      }}
                    >
                      <RemoveIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    
                    <Typography variant="body2" sx={{ 
                      minWidth: 24, 
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {item.quantity}
                    </Typography>
                    
                    <IconButton
                      size="small"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      sx={{ 
                        backgroundColor: theme.palette.primary.light,
                        color: 'white',
                        width: 28,
                        height: 28,
                        '&:hover': { 
                          backgroundColor: theme.palette.primary.main 
                        }
                      }}
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={() => onRemoveItem(item.id)}
                      sx={{ 
                        color: theme.palette.error.main,
                        width: 28,
                        height: 28,
                        '&:hover': { 
                          backgroundColor: theme.palette.error.light + '20'
                        }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < items.length - 1 && (
                  <Divider sx={{ mx: 2 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Summary and Checkout */}
      {items.length > 0 && (
        <Paper sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}>
          {/* Price Summary */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1,
              alignItems: 'center'
            }}>
              <Typography variant="body2" color="text.secondary">
                Toplam (KDV Dahil):
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                ₺{subtotal.toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                Toplam:
              </Typography>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                fontSize: '1.1rem'
              }}>
                ₺{total.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
           
            <Button
              variant="contained"
              startIcon={selectedTable ? (isTableOpen ? <PaymentIcon /> : <TableRestaurantIcon />) : <PaymentIcon />}
              fullWidth
              onClick={() => onCheckout(items, total)}
              sx={{
                backgroundColor: selectedTable 
                  ? (isTableOpen ? theme.palette.warning.main : theme.palette.success.main)
                  : theme.palette.primary.main,
                py: 1.2,
                fontWeight: 'bold',
                '&:hover': { 
                  backgroundColor: selectedTable 
                    ? (isTableOpen ? theme.palette.warning.dark : theme.palette.success.dark)
                    : theme.palette.primary.dark 
                },
              }}
            >
              {selectedTable 
                ? (isTableOpen ? 'Ödeme Al' : 'Masaya Ekle') 
                : 'Öde'
              }
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            width: '100vw',
            maxWidth: '100vw',
          }
        }}
      >
        {cartContent}
      </Drawer>
    );
  }

      return (
    <Box
      sx={{
        width: { md: 350, lg: 350 },
        flexShrink: 0,
        display: { xs: 'none', md: open ? 'block' : 'none' },
      }}
    >
      {cartContent}
    </Box>
  );
};

export default Cart;
