import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  useTheme,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

import { productAPI, Product } from '../services/api';

interface ProductsSectionProps {
  selectedCategory?: string;
  onProductSelect: (product: Product) => void;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({
  selectedCategory,
  onProductSelect,
}) => {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Ürünleri API'den yükle
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let productsData: Product[];
        if (selectedCategory && selectedCategory.trim() !== '') {
          // Kategoriye göre ürünleri getir
          productsData = await productAPI.getProductsByCategory(selectedCategory);
        } else {
          // Tüm ürünleri getir
          productsData = await productAPI.getAllProducts();
        }
        
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        console.error('Ürünler yüklenirken hata:', err);
        setError('Ürünler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  // Arama fonksiyonu
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Loading durumu
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        p: 2
      }}>
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
      {/* Section Header */}
      <Box sx={{ 
        mb: { xs: 2, sm: 2.5, md: 3 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
          mb: 2
        }}>
          <Typography variant="h4" sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
          }}>
            {selectedCategory ? selectedCategory : 'Tüm Ürünler'}
          </Typography>
          <Typography variant="body1" sx={{ 
            color: theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            ({filteredProducts.length} ürün)
          </Typography>
        </Box>

        {/* Arama Çubuğu */}
        <TextField
          placeholder="Ürün ara..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.grey[300],
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
          sx={{
            width: '100%',
            maxWidth: 400,
            mb: 2
          }}
        />
      </Box>

      {/* Products Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
          xl: 'repeat(5, 1fr)'
        },
        gap: { xs: 1.5, sm: 2, md: 2, lg: 2 }
      }}>
        {filteredProducts.map((product) => (
          <Card 
            key={product.id}
            sx={{ 
              height: { xs: 160, sm: 170, md: 180, lg: 180 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: { xs: 1.5, sm: 2 },
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
              },
              cursor: 'pointer',
              backgroundColor: 'white',
            }}
            onClick={() => onProductSelect(product)}
          >
            <Box>
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  textAlign: 'center',
                  mb: 1,
                  lineHeight: 1.2,
                }}
              >
                {product.name}
              </Typography>
            </Box>
            
            <Typography 
              variant="h5" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                textAlign: 'center',
              }}
            >
              ₺{product.price.toFixed(2)}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 'auto'
            }}>
              <Button
                variant="contained"
                size="medium"
                sx={{ 
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',  
                  width: '100%',
                  height: '100%',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                  py: { xs: 0.5, sm: 0.75, md: 1 },
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onProductSelect(product);
                }}
              >
                Ekle
              </Button>
            </Box>
          </Card>
        ))}
      </Box>

      {products.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          color: theme.palette.text.secondary 
        }}>
          <Typography variant="h6">
            Bu kategoride ürün bulunamadı
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductsSection;
