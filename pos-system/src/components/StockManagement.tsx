import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Inventory as InventoryIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon
} from '@mui/icons-material';

interface StockItem {
  id: number;
  urun_id: number;
  urun_adi: string;
  mevcut_stok: number;
  minimum_stok: number;
  birim: string;
  son_guncelleme: string;
  fiyat: number;
  kategori_adi: string;
}

interface StockMovement {
  id: number;
  hareket_tipi: 'giris' | 'cikis' | 'transfer';
  miktar: number;
  onceki_stok: number;
  yeni_stok: number;
  aciklama: string;
  created_at: string;
  urun_adi: string;
  sube_adi?: string;
  kullanici_adi?: string;
}

interface StockManagementProps {
  user?: any;
  onBack: () => void;
}

const StockManagement: React.FC<StockManagementProps> = ({ user, onBack }) => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [miktar, setMiktar] = useState('');
  const [hareketTipi, setHareketTipi] = useState<'giris' | 'cikis'>('giris');
  const [aciklama, setAciklama] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [criticalStockModalOpen, setCriticalStockModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchStock = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/stock');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStock(data.stock);
        }
      }
    } catch (error) {
      console.error('Stok verileri getirilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stock/movements');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMovements(data.movements);
        }
      }
    } catch (error) {
      console.error('Stok hareketleri getirilemedi:', error);
    }
  };

  useEffect(() => {
    fetchStock();
    fetchMovements();
  }, []);

  const handleStockUpdate = async () => {
    if (!selectedItem || !miktar || !aciklama) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/stock/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          miktar: parseInt(miktar),
          hareket_tipi: hareketTipi,
          aciklama,
          sube_id: user?.sube_id || 1,
          kullanici_id: user?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Stok başarıyla güncellendi');
        setOpenDialog(false);
        setMiktar('');
        setAciklama('');
        setSelectedItem(null);
        fetchStock();
        fetchMovements();
      } else {
        setError(data.error || 'Stok güncellenemedi');
      }
    } catch (error) {
      setError('Bir hata oluştu');
    }
  };

  const getStockStatus = (item: StockItem) => {
    if (item.mevcut_stok <= 0) {
      return { color: 'error', text: 'Stok Yok', icon: <WarningIcon /> };
    } else if (item.mevcut_stok <= item.minimum_stok) {
      return { color: 'warning', text: 'Kritik Stok', icon: <WarningIcon /> };
    } else {
      return { color: 'success', text: 'Normal', icon: <CheckCircleIcon /> };
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'giris': return 'success';
      case 'cikis': return 'error';
      case 'transfer': return 'info';
      default: return 'default';
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Arama fonksiyonu
  const filteredStock = stock.filter(item =>
    item.urun_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kategori_adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Arama yapıldığında ilk sayfaya dön
  };

  // Kritik stok kontrolü
  const criticalStockItems = stock.filter(item => 
    item.mevcut_stok <= item.minimum_stok || item.mevcut_stok <= 0
  );

  const hasCriticalStock = criticalStockItems.length > 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography variant="h6" color="text.secondary">
          Stok verileri yükleniyor...
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
            <InventoryIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                Stok Takip
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.sube || 'Merkez'} Şubesi
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={() => { fetchStock(); fetchMovements(); }}
            sx={{ color: '#666' }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Navigation */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mb: 2 }}
          >
            Geri Dön
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Kritik Stok Uyarısı */}
        {hasCriticalStock && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
            icon={<WarningIcon />}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  ⚠️ Kritik Stok Uyarısı
                </Typography>
                <Typography variant="body2">
                  {criticalStockItems.length} ürün kritik stok seviyesinde veya stokta yok!
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {criticalStockItems.slice(0, 3).map((item) => (
                  <Chip
                    key={item.id}
                    label={`${item.urun_adi} (${item.mevcut_stok})`}
                    size="small"
                    color={item.mevcut_stok <= 0 ? 'error' : 'warning'}
                    variant="outlined"
                  />
                ))}
                {criticalStockItems.length > 3 && (
                  <Chip
                    label={`+${criticalStockItems.length - 3} daha`}
                    size="small"
                    color="warning"
                    variant="outlined"
                    onClick={() => setCriticalStockModalOpen(true)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'warning.light',
                        color: 'warning.contrastText'
                      }
                    }}
                  />
                )}
              </Box>
            </Box>
          </Alert>
        )}

        {/* Stok Listesi */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
              <InventoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Stok Listesi ({filteredStock.length} ürün)
            </Typography>
            
            {/* Arama Kutusu */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ürün adı veya kategori ile arama yapın..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>
            
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün Adı</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell align="right">Mevcut Stok</TableCell>
                    <TableCell align="right">Min. Stok</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">Fiyat</TableCell>
                    <TableCell align="center">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm ? `"${searchTerm}" için sonuç bulunamadı` : 'Stok verisi bulunmuyor'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStock.map((item) => {
                      const status = getStockStatus(item);
                      return (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.urun_adi}</TableCell>
                          <TableCell>{item.kategori_adi}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.mevcut_stok} {item.birim}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{item.minimum_stok}</TableCell>
                          <TableCell>
                            <Chip
                              icon={status.icon}
                              label={status.text}
                              color={status.color as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">₺{(item.fiyat ? parseFloat(String(item.fiyat)) : 0).toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedItem(item);
                                setOpenDialog(true);
                              }}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <AddIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Stok Hareketleri */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Son Stok Hareketleri
            </Typography>
            
            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Ürün</TableCell>
                    <TableCell>Hareket</TableCell>
                    <TableCell align="right">Miktar</TableCell>
                    <TableCell align="right">Önceki</TableCell>
                    <TableCell align="right">Yeni</TableCell>
                    <TableCell>Şube</TableCell>
                    <TableCell>Açıklama</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((movement) => (
                    <TableRow key={movement.id} hover>
                      <TableCell>
                        {new Date(movement.created_at).toLocaleString('tr-TR')}
                      </TableCell>
                      <TableCell>{movement.urun_adi || 'Bilinmeyen Ürün'}</TableCell>
                      <TableCell>
                        <Chip
                          label={movement.hareket_tipi === 'giris' ? 'Giriş' : 'Çıkış'}
                          color={getMovementColor(movement.hareket_tipi) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{movement.miktar}</TableCell>
                      <TableCell align="right">{movement.onceki_stok}</TableCell>
                      <TableCell align="right">{movement.yeni_stok}</TableCell>
                      <TableCell>{movement.sube_adi || 'Merkez'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {movement.aciklama || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={Math.min(movements.length, 50)}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Sayfa başına:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
              />
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Stok Güncelleme Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Stok Güncelle - {selectedItem?.urun_adi}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Hareket Tipi</InputLabel>
              <Select
                value={hareketTipi}
                onChange={(e) => setHareketTipi(e.target.value as 'giris' | 'cikis')}
                label="Hareket Tipi"
              >
                <MenuItem value="giris">Stok Girişi</MenuItem>
                <MenuItem value="cikis">Stok Çıkışı</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Miktar"
              type="number"
              value={miktar}
              onChange={(e) => setMiktar(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Açıklama"
              multiline
              rows={3}
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Stok hareketi açıklaması..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button onClick={handleStockUpdate} variant="contained">
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kritik Stok Detay Modal */}
      <Dialog open={criticalStockModalOpen} onClose={() => setCriticalStockModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}>
          <WarningIcon sx={{ color: 'warning.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Kritik Stok Detayları
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Toplam <strong>{criticalStockItems.length}</strong> ürün kritik stok seviyesinde veya stokta yok.
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ürün Adı</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell align="right">Mevcut Stok</TableCell>
                  <TableCell align="right">Min. Stok</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">Fiyat</TableCell>
                  <TableCell align="center">İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criticalStockItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.urun_adi}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.kategori_adi}</TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            color: item.mevcut_stok <= 0 ? 'error.main' : 'warning.main'
                          }}
                        >
                          {item.mevcut_stok} {item.birim}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{item.minimum_stok}</TableCell>
                      <TableCell>
                        <Chip
                          icon={status.icon}
                          label={status.text}
                          color={status.color as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">₺{(item.fiyat ? parseFloat(String(item.fiyat)) : 0).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedItem(item);
                            setOpenDialog(true);
                            setCriticalStockModalOpen(false);
                          }}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <AddIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setCriticalStockModalOpen(false)} variant="outlined">
            Kapat
          </Button>
          <Button 
            onClick={() => {
              setCriticalStockModalOpen(false);
              // Tüm kritik ürünleri seç ve stok güncelleme modalını aç
              if (criticalStockItems.length > 0) {
                setSelectedItem(criticalStockItems[0]);
                setOpenDialog(true);
              }
            }} 
            variant="contained"
            color="warning"
          >
            Hızlı Stok Girişi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockManagement;
