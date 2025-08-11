import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Drawer,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Restaurant as RestaurantIcon,
  LocalCafe as CoffeeIcon,
  Cake as CakeIcon,
  LocalBar as DrinkIcon,
  Fastfood as FastFoodIcon,
  LocalPizza as PizzaIcon,
} from '@mui/icons-material';
import { categoryAPI, Category } from '../services/api';

interface CategorySidebarProps {
  open: boolean;
  onClose: () => void;
  onCategorySelect: (categoryId: string) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  open,
  onClose,
  onCategorySelect,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kategorileri API'den yükle
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoriesData = await categoryAPI.getAllCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Kategoriler yüklenirken hata:', err);
        setError('Kategoriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategorySelect(categoryId);
    if (isMobile) {
      onClose();
    }
  };

  // Kategori ikonlarını belirle
  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'sıcak içecekler':
        return <CoffeeIcon />;
      case 'soğuk içecekler':
        return <DrinkIcon />;
      case 'yiyecekler':
        return <RestaurantIcon />;
      case 'bize özel':
        return <CakeIcon />;
      case 'ekstralar':
        return <FastFoodIcon />;
      case 'hızlı işlemler':
        return <PizzaIcon />;
      default:
        return <CategoryIcon />;
    }
  };

  const sidebarContent = (
    <Box sx={{ 
      width: { xs: '100vw', sm: 280, md: 240 }, 
      height: '100%', 
      backgroundColor: 'background.paper' 
    }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: theme.palette.primary.main,
          fontWeight: 'bold'
        }}>
          <CategoryIcon />
          Kategoriler
        </Typography>
      </Box>

      {/* Loading durumu */}
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px'
        }}>
          <CircularProgress size={40} sx={{ color: theme.palette.primary.main }} />
        </Box>
      )}

      {/* Hata durumu */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Categories List */}
      {!loading && !error && (
        <List sx={{ p: 0 }}>
          {/* Tüm Ürünler seçeneği */}
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedCategory === ''}
              onClick={() => handleCategoryClick('')}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: selectedCategory === '' ? 'inherit' : theme.palette.primary.main 
              }}>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Tüm Ürünler"
              />
            </ListItemButton>
          </ListItem>
          <Divider />
          
          {/* Kategoriler */}
          {categories.map((category, index) => (
            <React.Fragment key={category.id}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={selectedCategory === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                      },
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                    width: '100%',
                    height:60,
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: selectedCategory === category.id ? 'inherit' : theme.palette.primary.main 
                  }}>
                    {getCategoryIcon(category.name)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={category.name}
                   
                  />
                </ListItemButton>
              </ListItem>
              {index < categories.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default CategorySidebar;
