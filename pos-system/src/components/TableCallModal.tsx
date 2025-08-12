import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Phone as PhoneIcon,
  Payment as PaymentIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TableRestaurant as TableIcon
} from '@mui/icons-material';

interface ClosedTable {
  id: number;
  masa_adi: string;
  toplam_tutar: number;
  odeme_tipi: 'nakit' | 'kart' | 'mudavim';
  kapanis_tarihi: string;
  acan_kullanici_adi: string;
  sube_adi: string;
}

interface TableCallModalProps {
  open: boolean;
  onClose: () => void;
  user?: any;
}

const TableCallModal: React.FC<TableCallModalProps> = ({ open, onClose, user }) => {
  const [closedTables, setClosedTables] = useState<ClosedTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTable, setEditingTable] = useState<number | null>(null);
  const [editedPaymentType, setEditedPaymentType] = useState<string>('');
  const [editedAmount, setEditedAmount] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchClosedTables = async () => {
    try {
      setLoading(true);
      console.log('User in TableCallModal:', user); // Debug için
      console.log('User sube_id:', user?.sube_id); // Debug için
      const response = await fetch(`http://localhost:3001/api/tables/closed?date=${new Date().toISOString().split('T')[0]}&subeId=${user?.sube_id || ''}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Fetched tables:', data.tables); // Debug için
          setClosedTables(data.tables);
        }
      }
    } catch (error) {
      console.error('Kapatılan masalar getirilemedi:', error);
      setError('Kapatılan masalar getirilemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchClosedTables();
    }
  }, [open]);

  const handleEditPayment = (table: ClosedTable) => {
    setEditingTable(table.id);
    setEditedPaymentType(table.odeme_tipi);
    setEditedAmount(table.toplam_tutar.toString());
  };

  const handleSavePayment = async (tableId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tables/${tableId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          odeme_tipi: editedPaymentType,
          tutar: parseFloat(editedAmount),
          kullanici_id: user?.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Ödeme bilgileri güncellendi');
        setEditingTable(null);
        fetchClosedTables(); // Listeyi yenile
      } else {
        setError(data.error || 'Güncelleme başarısız');
      }
    } catch (error) {
      setError('Bir hata oluştu');
    }
  };

  const handleCancelEdit = () => {
    setEditingTable(null);
    setEditedPaymentType('');
    setEditedAmount('');
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'nakit': return 'success';
      case 'kart': return 'primary';
      case 'mudavim': return 'warning';
      default: return 'default';
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'nakit': return 'Nakit';
      case 'kart': return 'Kart';
      case 'mudavim': return 'Müdavim';
      default: return type;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PhoneIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Masa Çağırma - Kapatılan Masalar
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
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

        {/* Kapatılan Masalar Tablosu */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
            <TableIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Bugün Kapatılan Masalar ({closedTables.length})
          </Typography>
          
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Masa Adı</TableCell>
                  <TableCell>Toplam Tutar</TableCell>
                  <TableCell>Ödeme Yöntemi</TableCell>
                  <TableCell>Kapanış Saati</TableCell>
                  <TableCell>Açan Kullanıcı</TableCell>
                  <TableCell>Şube</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {closedTables.map((table) => (
                  <TableRow key={table.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {table.masa_adi}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {editingTable === table.id ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editedAmount}
                          onChange={(e) => setEditedAmount(e.target.value)}
                          sx={{ width: 100 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                          ₺{table.toplam_tutar.toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingTable === table.id ? (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={editedPaymentType}
                            onChange={(e) => setEditedPaymentType(e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="nakit">Nakit</MenuItem>
                            <MenuItem value="kart">Kart</MenuItem>
                            <MenuItem value="mudavim">Müdavim</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip
                          label={getPaymentTypeLabel(table.odeme_tipi)}
                          color={getPaymentTypeColor(table.odeme_tipi) as any}
                          size="small"
                          icon={<PaymentIcon />}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(table.kapanis_tarihi).toLocaleString('tr-TR')}
                    </TableCell>
                    <TableCell>{table.acan_kullanici_adi}</TableCell>
                    <TableCell>{table.sube_adi}</TableCell>
                    <TableCell align="center">
                      {editingTable === table.id ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleSavePayment(table.id)}
                            sx={{ color: theme.palette.success.main }}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleCancelEdit}
                            sx={{ color: theme.palette.error.main }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => handleEditPayment(table)}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {closedTables.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Bugün kapatılan masa bulunmuyor
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Özet Bilgiler */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              {closedTables.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kapatılan Masa
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
              ₺{closedTables.reduce((sum, table) => sum + (typeof table.toplam_tutar === 'string' ? parseFloat(table.toplam_tutar) : table.toplam_tutar), 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toplam Ciro
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
              {closedTables.filter(t => t.odeme_tipi === 'mudavim').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Müdavim Ödemesi
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} variant="outlined">
          Kapat
        </Button>
        <Button 
          onClick={fetchClosedTables} 
          variant="contained"
          startIcon={<PhoneIcon />}
        >
          Yenile
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableCallModal;
