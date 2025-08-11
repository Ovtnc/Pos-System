import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  useTheme,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  TextField,
  Chip,
} from '@mui/material';
import {
  CreditCard as CardIcon,
  AttachMoney as CashIcon,
  Person as CustomerIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
  AccountTree as SplitIcon,
} from '@mui/icons-material';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  user?: any;
  onPaymentComplete: (paymentMethod: string, amount: number, splitInfo?: any, discountInfo?: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  items,
  total,
  user,
  onPaymentComplete,
}) => {
  const theme = useTheme();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [selectedItemsForSplit, setSelectedItemsForSplit] = useState<string[]>([]);
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'amount'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  
  // İndirim hesaplama
  const getDiscountAmount = () => {
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    } else if (discountType === 'amount') {
      return Math.min(discountValue, subtotal); // İndirim toplam tutardan fazla olamaz
    }
    return 0;
  };
  
  const discountAmount = getDiscountAmount();
  const finalTotal = subtotal - discountAmount;

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      alert('Lütfen bir ödeme yöntemi seçin');
      return;
    }

    let splitInfo = undefined;
    let paymentAmount = finalTotal;

    if (isSplitMode && selectedItemsForSplit.length > 0) {
      const splitItems = items.filter(item => selectedItemsForSplit.includes(item.id));
      const splitAmount = splitItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
      
      // Sadece seçilen ürünlerin tutarını öde
      paymentAmount = splitAmount;
      
      splitInfo = {
        items: splitItems,
        amount: splitAmount,
        remainingItems: items.filter(item => !selectedItemsForSplit.includes(item.id)),
        remainingAmount: finalTotal - splitAmount,
      };
    }

    onPaymentComplete(selectedPaymentMethod, paymentAmount, splitInfo, {
      discountType,
      discountValue,
      discountAmount,
      originalTotal: subtotal
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedPaymentMethod('');
    setIsSplitMode(false);
    setSelectedItemsForSplit([]);
    setDiscountType('none');
    setDiscountValue(0);
  };

  const handleSplitToggle = () => {
    setIsSplitMode(!isSplitMode);
    if (!isSplitMode) {
      setSelectedItemsForSplit([]);
    }
  };

  const handleItemSelection = (itemId: string) => {
    setSelectedItemsForSplit(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getSelectedItemsTotal = () => {
    const selectedItems = items.filter(item => selectedItemsForSplit.includes(item.id));
    return selectedItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  };

  const getRemainingItemsTotal = () => {
    const remainingItems = items.filter(item => !selectedItemsForSplit.includes(item.id));
    return remainingItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card':
        return 'Kredi Kartı';
      case 'cash':
        return 'Nakit';
      case 'customer':
        return 'Müdavim Hesabı';
      default:
        return method;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '50vh',
        },
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Ödeme İşlemi
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Sol taraf - Ödeme yöntemleri */}
          <Box sx={{ flex: 1, p: 3 }}>
            {/* Ödeme Yöntemi Seçimi */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Ödeme Yöntemi Seçin
            </Typography>
            
            {/* Aktif Şube Bilgisi */}
            {user && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Ödeme şu şubeye kaydedilecek:
                </Typography>
                <Chip 
                  label={user.sube === 'merkez' ? 'Ana Şube' : user.sube}
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <Button
                variant={selectedPaymentMethod === 'card' ? "contained" : "outlined"}
                startIcon={<CardIcon />}
                onClick={() => handlePaymentMethodSelect('card')}
                sx={{ 
                  flex: 1, 
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  fontSize: '1.1rem'
                }}
              >
                <Typography variant="h5">Kart</Typography>
                <Typography variant="caption">Kredi/Debit Kart</Typography>
              </Button>
              
              <Button
                variant={selectedPaymentMethod === 'cash' ? "contained" : "outlined"}
                startIcon={<CashIcon />}
                onClick={() => handlePaymentMethodSelect('cash')}
                sx={{ 
                  flex: 1, 
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  fontSize: '1.1rem'
                }}
              >
                <Typography variant="h5">Nakit</Typography>
                <Typography variant="caption">Peşin Ödeme</Typography>
              </Button>
              
              <Button
                variant={selectedPaymentMethod === 'customer' ? "contained" : "outlined"}
                startIcon={<CustomerIcon />}
                onClick={() => handlePaymentMethodSelect('customer')}
                sx={{ 
                  flex: 1, 
                  py: 3,
                  flexDirection: 'column',
                  gap: 1,
                  fontSize: '1.1rem'
                }}
              >
                <Typography variant="h5">Müdavim</Typography>
                <Typography variant="caption">Hesap Aç</Typography>
              </Button>
            </Box>

            {/* Seçilen Ödeme Yöntemi Bilgisi */}
            {selectedPaymentMethod && (
              <Paper sx={{ p: 2, backgroundColor: theme.palette.success.light, mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                  Seçilen Ödeme Yöntemi: {getPaymentMethodText(selectedPaymentMethod)}
                </Typography>
              </Paper>
            )}

            {/* İndirim Alanları */}
            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                İndirim Uygula
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant={discountType === 'none' ? "contained" : "outlined"}
                  onClick={() => setDiscountType('none')}
                  sx={{ flex: 1 }}
                >
                  İndirim Yok
                </Button>
                <Button
                  variant={discountType === 'percentage' ? "contained" : "outlined"}
                  onClick={() => setDiscountType('percentage')}
                  sx={{ flex: 1 }}
                >
                  % İndirim
                </Button>
                <Button
                  variant={discountType === 'amount' ? "contained" : "outlined"}
                  onClick={() => setDiscountType('amount')}
                  sx={{ flex: 1 }}
                >
                  TL İndirim
                </Button>
              </Box>

              {(discountType === 'percentage' || discountType === 'amount') && (
                <TextField
                  fullWidth
                  type="number"
                  label={discountType === 'percentage' ? 'İndirim Yüzdesi (%)' : 'İndirim Tutarı (₺)'}
                  value={discountValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscountValue(Number(e.target.value))}
                  inputProps={{
                    min: 0,
                    max: discountType === 'percentage' ? 100 : subtotal,
                    step: discountType === 'percentage' ? 1 : 0.01
                  }}
                  sx={{ mb: 2 }}
                />
              )}

              {discountAmount > 0 && (
                <Paper sx={{ p: 2, backgroundColor: theme.palette.warning.light }}>
                  <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
                    İndirim Tutarı: ₺{discountAmount.toFixed(2)}
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Adisyon Bölme */}
            <Box sx={{ mt: 4 }}>
              <Button
                variant={isSplitMode ? "contained" : "outlined"}
                startIcon={<SplitIcon />}
                onClick={handleSplitToggle}
                fullWidth
                sx={{ mb: 2, py: 1.5 }}
              >
                Adisyon Böl
              </Button>

              {isSplitMode && (
                <Box sx={{ p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Hangi ürünleri ayrı ödemek istiyorsunuz?
                  </Typography>
                  <List dense>
                    {items.map((item) => (
                      <ListItem key={item.id} sx={{ px: 0 }}>
                        <Checkbox
                          checked={selectedItemsForSplit.includes(item.id)}
                          onChange={() => handleItemSelection(item.id)}
                        />
                        <ListItemText
                          primary={item.name}
                          secondary={`${item.quantity} adet x ₺${item.price.toFixed(2)}`}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            ₺{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  
                  {selectedItemsForSplit.length > 0 && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Seçili Ürünler Toplamı: ₺{getSelectedItemsTotal().toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Kalan Ürünler: ₺{getRemainingItemsTotal().toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* Sağ taraf - Özet */}
          <Box sx={{ 
            width: 300, 
            backgroundColor: theme.palette.grey[50],
            p: 3,
            borderLeft: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Sipariş Özeti
            </Typography>

            {/* Ürünler */}
            <Box sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
              {items.map((item) => (
                <Box key={item.id} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 1,
                  fontSize: '0.9rem'
                }}>
                  <Typography variant="body2">
                    {item.name} x{item.quantity}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₺{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Fiyat özeti */}
            <Box sx={{ space: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Ara Toplam:
                </Typography>
                <Typography variant="body2">
                  ₺{subtotal.toFixed(2)}
                </Typography>
              </Box>
              
              {discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    İndirim:
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.success.main }}>
                    -₺{discountAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Toplam:
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.primary.main
                }}>
                  ₺{finalTotal.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {isSplitMode && selectedItemsForSplit.length > 0 && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Bölünen Tutar
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.secondary.main
                }}>
                  ₺{getSelectedItemsTotal().toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedItemsForSplit.length} ürün seçildi
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ minWidth: 120 }}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handlePayment}
          startIcon={<PaymentIcon />}
          disabled={!selectedPaymentMethod}
          sx={{ 
            minWidth: 120,
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark }
          }}
        >
          Ödemeyi Tamamla
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
