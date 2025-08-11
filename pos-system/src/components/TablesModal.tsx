import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  useTheme,
  IconButton,
  Paper,
  Chip,
  Divider,
} from '@mui/material';

import {
  Close as CloseIcon,
  Add as AddIcon,
  TableRestaurant as TableIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';

import { tableAPI, Table } from '../services/api';

interface TablesModalProps {
  open: boolean;
  onClose: () => void;
  onTableSelect?: (tableId: number, tableName: string) => void;
  onTableOpen?: (tableId: number, tableName: string) => void;
  user?: any;
}

interface TablesModalProps {
  open: boolean;
  onClose: () => void;
  onTableSelect?: (tableId: number, tableName: string) => void;
  onTableOpen?: (tableId: number, tableName: string) => void;
  user?: any;
}

const TablesModal: React.FC<TablesModalProps> = ({ open, onClose, onTableSelect, onTableOpen, user }) => {
  const theme = useTheme();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [openNewTable, setOpenNewTable] = useState(false);
  const [newTableData, setNewTableData] = useState({
    masaAdi: '',
    userId: 4, // Default user ID
  });

  // Masaları getir
  const fetchTables = async () => {
    setLoading(true);
    try {
      // Kullanıcının ID'sini kullanarak sadece kendi şubesindeki masaları getir
      const tablesData = await tableAPI.getAllTables(user?.id);
      setTables(tablesData);
    } catch (error) {
      console.error('Masalar getirilemedi:', error);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTables();
    }
  }, [open]);

  // Yeni masa aç
  const handleOpenTable = async () => {
    try {
      // Kullanıcının ID'sini kullan
      const result = await tableAPI.openTable(newTableData.masaAdi, user?.id || 4);
      
      if (result.success) {
        setOpenNewTable(false);
        setNewTableData({ masaAdi: '', userId: user?.id || 4 });
        fetchTables();
      } else {
        alert('Masa açılamadı: ' + result.error);
      }
    } catch (error) {
      console.error('Masa açma hatası:', error);
      alert('Masa açılırken bir hata oluştu');
    }
  };

  // Masa kapat
  const handleCloseTable = async (tableId: number) => {
    if (!window.confirm('Bu masayı kapatmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const result = await tableAPI.closeTable(tableId);
      
      if (result.success) {
        fetchTables();
      } else {
        alert('Masa kapatılamadı: ' + result.error);
      }
    } catch (error) {
      console.error('Masa kapatma hatası:', error);
      alert('Masa kapatılırken bir hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acik':
        return 'success';
      case 'kapali':
        return 'default';
      default:
        return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'acik':
        return 'Açık';
      case 'kapali':
        return 'Kapalı';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '70vh',
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
          <TableIcon />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Masa Yönetimi
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
        {/* Yeni Masa Açma Butonu */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNewTable(true)}
            sx={{ 
              backgroundColor: theme.palette.success.main,
              '&:hover': { backgroundColor: theme.palette.success.dark }
            }}
          >
            Yeni Masa Aç
          </Button>
        </Box>

        {/* Yeni Masa Açma Formu */}
        {openNewTable && (
          <Paper sx={{ p: 3, mb: 3, backgroundColor: theme.palette.grey[50] }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Yeni Masa Aç
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                label="Masa Adı"
                value={newTableData.masaAdi}
                onChange={(e) => setNewTableData({ ...newTableData, masaAdi: e.target.value })}
                placeholder="Örn: Masa 1"
                sx={{ flex: { xs: '1 1 100%', sm: '1 1 100%' } }}
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Masa {user?.sube || 'şubenizde'} açılacak
              </Typography>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleOpenTable}
                disabled={!newTableData.masaAdi}
              >
                Masa Aç
              </Button>
              <Button
                variant="outlined"
                onClick={() => setOpenNewTable(false)}
              >
                İptal
              </Button>
            </Box>
          </Paper>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Masalar Listesi */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Aktif Masalar ({tables.filter(t => t.durum === 'acik').length} Açık, {tables.filter(t => t.durum === 'rezerve').length} Rezerve)
        </Typography>

        {loading ? (
          <Typography>Masalar yükleniyor...</Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {tables.map((table) => (
              <Box key={table.id}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    border: table.durum === 'acik' ? `2px solid ${theme.palette.success.main}` : '2px solid transparent',
                    backgroundColor: table.durum === 'acik' ? theme.palette.success.light + '20' : 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {table.masa_adi}
                    </Typography>
                    <Chip
                      label={getStatusText(table.durum)}
                      color={getStatusColor(table.durum) as any}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Şube: {table.sube_adi || user?.sube}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Toplam: ₺{table.toplam_tutar}
                    </Typography>
                  </Box>

                  {table.acilis_tarihi && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(table.acilis_tarihi)}
                      </Typography>
                    </Box>
                  )}

                  {table.durum === 'acik' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ flex: 1 }}
                        onClick={() => {
                          if (onTableSelect) {
                            onTableSelect(table.id, table.masa_adi);
                            onClose();
                          }
                        }}
                      >
                        Sipariş Al
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        sx={{ flex: 1 }}
                        onClick={() => {
                          if (onTableOpen) {
                            onTableOpen(table.id, table.masa_adi);
                            onClose();
                          }
                        }}
                      >
                        Masayı Aç
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ flex: 1 }}
                        onClick={() => handleCloseTable(table.id)}
                      >
                        Kapat
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
          </Box>
        )}

        {tables.length === 0 && !loading && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Henüz masa açılmamış
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ minWidth: 120 }}
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TablesModal;
