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
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';

import { productAPI, Product, favoriteAPI } from '../services/api';

interface ProductsSectionProps {
  selectedCategory?: string;
  onProductSelect: (product: Product) => void;
  user?: any;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({
  selectedCategory,
  onProductSelect,
  user,
}) => {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState<{ [key: string]: boolean }>({});

  // Favori ürünleri yükle
  useEffect(() => {
    const loadFavorites = async () => {
      if (user?.id) {
        try {
          const favoritesData = await favoriteAPI.getFavorites(user.id);
          setFavorites(favoritesData.map((fav: any) => fav.urun_id.toString()));
        } catch (error) {
          console.error('Favori ürünler yüklenemedi:', error);
        }
      }
    };

    loadFavorites();
  }, [user?.id]);

  // Ürünleri API'den yükle
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let productsData: Product[];
        if (selectedCategory && selectedCategory.trim() !== '') {
          // Kategoriye göre ürünleri getir
          const url = user?.id ? `${selectedCategory}?userId=${user.id}` : selectedCategory;
          productsData = await productAPI.getProductsByCategory(url);
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
  }, [selectedCategory, user?.id]);

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

  // Favori ekleme/kaldırma fonksiyonu
  const handleFavoriteToggle = async (productId: string) => {
    if (!user?.id) return;

    setFavoriteLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      if (favorites.includes(productId)) {
        // Favorilerden kaldır
        await favoriteAPI.removeFavorite(user.id, productId);
        setFavorites(prev => prev.filter(id => id !== productId));
      } else {
        // Favorilere ekle
        await favoriteAPI.addFavorite(user.id, productId);
        setFavorites(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error('Favori işlemi başarısız:', error);
    } finally {
      setFavoriteLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

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
              height: { xs: 140, sm: 150, md: 160, lg: 160 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: { xs: 1.5, sm: 2 },
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: 'none',
              borderRadius: 3,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                '& .add-button': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'scale(1.05)',
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: '3px 3px 0 0',
              }
            }}
            onClick={() => onProductSelect(product)}
          >
            {/* Favori Butonu */}
            {user?.id && (
              <Box sx={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}>
                <Tooltip title={favorites.includes(product.id) ? 'Favorilerden kaldır' : 'Favorilere ekle'}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(product.id);
                    }}
                    disabled={favoriteLoading[product.id]}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(8px)',
                      color: favorites.includes(product.id) ? theme.palette.error.main : theme.palette.grey[500],
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        color: favorites.includes(product.id) ? theme.palette.error.dark : theme.palette.primary.main,
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                      width: 28,
                      height: 28,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    {favorites.includes(product.id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Ürün Adı */}
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                textAlign: 'center',
                mb: 1,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                pr: user?.id ? 3 : 0,
                minHeight: { xs: '2.6rem', sm: '2.8rem', md: '3rem' },
              }}
            >
              {product.name}
            </Typography>
            
            {/* Fiyat */}
            <Typography 
              variant="h5" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                textAlign: 'center',
                mb: 2,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              ₺{product.price.toFixed(2)}
            </Typography>
            
            {/* Sepete Ekle Butonu */}
            <Button
              variant="outlined"
              className="add-button"
              size="medium"
              sx={{ 
                border: `2px solid ${theme.palette.primary.main}`,
                borderRadius: 3,
                py: { xs: 0.5, sm: 0.75 },
                px: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                color: theme.palette.primary.main,
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                '&:active': {
                  transform: 'translateY(0) scale(0.98)',
                }
              }}
            >
              + Ekle
            </Button>
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
