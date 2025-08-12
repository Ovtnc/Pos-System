import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import { format } from 'date-fns';


interface ReportsProps {
  user: any;
  onBack: () => void;
}

interface RevenueData {
  totalRevenue: {
    toplam_ciro: number;
    toplam_islem: number;
  };
  paymentTypeRevenue: Array<{
    odeme_tipi: string;
    toplam_tutar: number;
    islem_sayisi: number;
  }>;
  dailyRevenue: Array<{
    tarih: string;
    gunluk_ciro: number;
    islem_sayisi: number;
  }>;
  hourlyRevenue: Array<{
    saat: number;
    saatlik_ciro: number;
    islem_sayisi: number;
  }>;
}

interface SalesData {
  topProducts: Array<{
    urun_adi: string;
    toplam_adet: number;
    toplam_tutar: number;
    siparis_sayisi: number;
  }>;
  categorySales: Array<{
    kategori_adi: string;
    toplam_tutar: number;
    toplam_adet: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Reports: React.FC<ReportsProps> = ({ user, onBack }) => {
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      // Ciro raporu
      const revenueResponse = await fetch(
        `http://localhost:3001/api/reports/revenue?startDate=${startDateStr}&endDate=${endDateStr}&subeId=${user?.sube_id || ''}`
      );
      const revenueResult = await revenueResponse.json();

      if (revenueResult.success) {
        setRevenueData(revenueResult.data);
      }

      // Satış raporu
      const salesResponse = await fetch(
        `http://localhost:3001/api/reports/sales?startDate=${startDateStr}&endDate=${endDateStr}&subeId=${user?.sube_id || ''}`
      );
      const salesResult = await salesResponse.json();

      if (salesResult.success) {
        setSalesData(salesResult.data);
      }

    } catch (error) {
      setError('Raporlar yüklenirken hata oluştu');
      console.error('Reports fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getPaymentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      nakit: 'Nakit',
      kart: 'Kart',
      mudavim: 'Müdavim'
    };
    return labels[type] || type;
  };

  const getPaymentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      nakit: '#4CAF50',
      kart: '#2196F3',
      mudavim: '#FF9800'
    };
    return colors[type] || '#666';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button variant="outlined" onClick={onBack} sx={{ mr: 2 }}>
            ← Geri
          </Button>
          <Typography variant="h4" component="h1">
            Raporlar
          </Typography>
        </Box>

        {/* Tarih Seçimi */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tarih Aralığı Seçin
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <DatePicker
              label="Başlangıç Tarihi"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="Bitiş Tarihi"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button
              variant="contained"
              onClick={fetchReports}
              disabled={loading || !startDate || !endDate}
            >
              {loading ? <CircularProgress size={20} /> : 'Raporu Getir'}
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {revenueData && (
          <>
            {/* Toplam Ciro Özeti */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Ciro
                  </Typography>
                  <Typography variant="h4" component="div">
                    ₺{revenueData.totalRevenue.toplam_ciro?.toLocaleString() || '0'}
                  </Typography>
                  <Typography color="textSecondary">
                    {revenueData.totalRevenue.toplam_islem || 0} işlem
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Ortalama İşlem Tutarı
                  </Typography>
                  <Typography variant="h4" component="div">
                    ₺{revenueData.totalRevenue.toplam_islem > 0 
                      ? (revenueData.totalRevenue.toplam_ciro / revenueData.totalRevenue.toplam_islem).toFixed(2)
                      : '0'}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Ödeme Tipi Dağılımı */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ödeme Tipi Dağılımı
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueData.paymentTypeRevenue}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ odeme_tipi, toplam_tutar }) => 
                        `${getPaymentTypeLabel(odeme_tipi)}: ₺${toplam_tutar.toLocaleString()}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="toplam_tutar"
                    >
                      {revenueData.paymentTypeRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getPaymentTypeColor(entry.odeme_tipi)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₺${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Günlük Ciro Trendi
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="tarih" 
                      tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => `₺${Number(value).toLocaleString()}`}
                      labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gunluk_ciro" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Günlük Ciro"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Box>

            {/* Saatlik Ciro (Bugün) */}
            {revenueData.hourlyRevenue.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Bugünkü Saatlik Ciro
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData.hourlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="saat" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₺${Number(value).toLocaleString()}`} />
                    <Bar dataKey="saatlik_ciro" fill="#8884d8" name="Saatlik Ciro" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            )}
          </>
        )}

        {salesData && (
          <>
            {/* En Çok Satılan Ürünler */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                En Çok Satılan Ürünler
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ürün Adı</TableCell>
                      <TableCell align="right">Toplam Adet</TableCell>
                      <TableCell align="right">Toplam Tutar</TableCell>
                      <TableCell align="right">Sipariş Sayısı</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.urun_adi}</TableCell>
                        <TableCell align="right">{product.toplam_adet}</TableCell>
                        <TableCell align="right">₺{product.toplam_tutar.toLocaleString()}</TableCell>
                        <TableCell align="right">{product.siparis_sayisi}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Kategori Bazında Satış */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Kategori Bazında Satış
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData.categorySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kategori_adi" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₺${Number(value).toLocaleString()}`} />
                  <Bar dataKey="toplam_tutar" fill="#82ca9d" name="Toplam Tutar" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Reports;
