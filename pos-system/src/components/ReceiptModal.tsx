import React from 'react';
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
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  splitInfo?: any;
  discountInfo?: any;
  receiptNumber: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  open,
  onClose,
  items,
  total,
  paymentMethod,
  splitInfo,
  discountInfo,
  receiptNumber,
}) => {
  const theme = useTheme();


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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // PDF indirme işlemi burada yapılacak
    console.log('PDF indiriliyor...');
  };

  const handleShare = () => {
    // Paylaşım işlemi burada yapılacak
    console.log('Paylaşılıyor...');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: theme.palette.success.main,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Ödeme Başarılı!
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Paper sx={{ p: 3, backgroundColor: theme.palette.grey[50] }}>
         

          {/* Ürünler */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Sipariş Detayı
            </Typography>
            {items.map((item) => (
              <Box key={item.id} sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 1,
                fontSize: '0.9rem'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.quantity} adet x ₺{(item.price || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ₺{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Fiyat Özeti */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Ara Toplam:
              </Typography>
              <Typography variant="body2">
                ₺{(discountInfo?.originalTotal || total || 0).toFixed(2)}
              </Typography>
            </Box>
            
            {discountInfo?.discountAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  İndirim:
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.success.main }}>
                  -₺{(discountInfo.discountAmount || 0).toFixed(2)}
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
                ₺{(total || 0).toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Ödeme Bilgileri */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Ödeme Bilgileri
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Ödeme Yöntemi:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {getPaymentMethodText(paymentMethod)}
              </Typography>
            </Box>
            {splitInfo && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Bölünen Tutar:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₺{(splitInfo.amount || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Kalan Tutar:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₺{(splitInfo.remainingAmount || 0).toFixed(2)}
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Teşekkür Mesajı */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              Teşekkürler!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tekrar bekleriz.
            </Typography>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ 
            minWidth: 120,
            backgroundColor: theme.palette.success.main,
            '&:hover': { backgroundColor: theme.palette.success.dark }
          }}
        >
          Tamam
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptModal;
