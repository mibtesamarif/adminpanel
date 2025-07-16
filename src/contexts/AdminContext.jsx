import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Default configuration data
const defaultConfig = {
  shopInfo: {
    name: "CBD Shop Premium",
    description: "Votre boutique CBD de confiance",
    logo: "🌿",
    logoUrl: "",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    textColor: "#ffffff",
    backgroundColor: "#ffffff",
    backgroundImage: ""
  },
  contactInfo: {
    orderLink: "https://wa.me/33123456789",
    orderText: "Commandez maintenant",
    email: "contact@cbdshop.fr",
    phone: "+33 1 23 45 67 89"
  },
  socialMediaLinks: [
    {
      id: 1,
      name: "Instagram",
      emoji: "📸",
      url: "https://instagram.com/cbdshop",
      color: "#E4405F"
    },
    {
      id: 2,
      name: "Facebook",
      emoji: "📘",
      url: "https://facebook.com/cbdshop",
      color: "#1877F2"
    },
    {
      id: 3,
      name: "WhatsApp",
      emoji: "💬",
      url: "https://wa.me/33123456789",
      color: "#25D366"
    }
  ],
  categories: [
    {
      id: 1,
      name: "Huiles",
      emoji: "💧",
      description: "Huiles CBD de qualité premium"
    },
    {
      id: 2,
      name: "Fleurs",
      emoji: "🌸",
      description: "Fleurs CBD séchées naturelles"
    },
    {
      id: 3,
      name: "Résines",
      emoji: "🟤",
      description: "Résines CBD artisanales"
    },
    {
      id: 4,
      name: "Boutique",
      emoji: "🌾",
      description: "Produits exclusifs CBD"
    },
    {
      id: 5,
      name: "Farm",
      emoji: "🏡",
      description: "Produits CBD de nos fermes partenaires"
    }
  ],
  farms: [
    {
      id: 1,
      name: "Mountain",
      emoji: "🏔️",
      description: "Produits CBD de la ferme Mountain"
    },
    {
      id: 2,
      name: "Valley",
      emoji: "🏞️",
      description: "Produits CBD de la ferme Valley"
    },
    {
      id: 3,
      name: "Forest",
      emoji: "🌲",
      description: "Produits CBD de la ferme Forest"
    },
    {
      id: 4,
      name: "Riverside",
      emoji: "🌊",
      description: "Produits CBD de la ferme Riverside"
    }
  ],
  pages: [
    {
      id: 1,
      name: "Accueil",
      href: "/",
      isDefault: true
    },
    {
      id: 2,
      name: "Produits",
      href: "/produits",
      isDefault: true
    },
    {
      id: 3,
      name: "Contact",
      href: "/contact",
      isDefault: true
    },
    {
      id: 4,
      name: "Réseaux Sociaux",
      href: "/reseaux-sociaux",
      isDefault: true
    }
  ],
  products: [
    {
      id: 1,
      name: "Huile CBD",
      description: "Huile de CBD premium, extraction CO2 supercritique.",
      image: "https://images.unsplash.com/photo-1587736793948-7b6b17f06c8d?w=400&h=400&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1587736793948-7b6b17f06c8d?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1587736793948-7b6b17f06c8d?w=500&h=500&fit=crop"
      ],
      video: "",
      category: "Huiles",
      variants: [
        { name: "10%", price: 29.90, size: "10ml" },
        { name: "15%", price: 39.90, size: "10ml" },
        { name: "20%", price: 49.90, size: "10ml" }
      ],
      orderLink: "https://wa.me/33123456789",
      popular: true
    },
    // Add more products...
  ],
  adminSettings: {
    categoriesTabName: "Catégories",
    farmsTabName: "Fermes",
    categoriesButtonText: "Catégories",
    farmsButtonText: "Fermes"
  },
  pageContent: {
    homepage: {
      heroTitle: "Produits CBD Premium",
      heroSubtitle: "Découvrez notre sélection de produits CBD de qualité supérieure",
      heroButtonText: "Voir nos produits",
      sectionTitle: "Nos Produits Populaires",
      categoriesLabel: "Types de produits",
      farmLabel: "Boutique",
      allCategoriesLabel: "Tous nos produits",
      farmProductsLabel: "Produits exclusifs"
    },
    contact: {
      title: "Contactez-nous",
      subtitle: "Nous sommes là pour vous aider",
      description: "Pour toute commande ou question, contactez-nous directement via notre plateforme de commande."
    },
    socialMedia: {
      title: "Suivez-nous sur les réseaux sociaux",
      subtitle: "Restez connecté avec nous pour les dernières actualités et offres exclusives"
    },
    footer: {
      copyrightText: "© 2024 CBD Shop Premium. Tous droits réservés."
    },
    products: {
      filterTitle: "Filtrer par catégorie",
      popularText: "Populaire",
      detailsText: "Voir détails",
      orderText: "Commander maintenant",
      pageTitle: "Nos Produits",
      pageSubtitle: "Découvrez notre gamme complète de produits CBD"
    }
  }
};

export const AdminProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(false);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('admin_config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Error parsing saved config:', error);
      }
    }
  }, []);

  // Save config to localStorage whenever it changes
  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('admin_config', JSON.stringify(newConfig));
  };

  // Helper function to get next ID
  const getNextId = (items) => {
    if (items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
  };

  // Products CRUD operations
  const addProduct = async (product) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const newProduct = {
        ...product,
        id: getNextId(config.products),
        createdAt: new Date().toISOString()
      };
      
      const newConfig = {
        ...config,
        products: [...config.products, newProduct]
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true, product: newProduct };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to add product' };
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProducts = config.products.map(product =>
        product.id === id ? { ...product, ...updates, updatedAt: new Date().toISOString() } : product
      );
      
      const newConfig = {
        ...config,
        products: updatedProducts
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to update product' };
    }
  };

  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredProducts = config.products.filter(product => product.id !== id);
      
      const newConfig = {
        ...config,
        products: filteredProducts
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to delete product' };
    }
  };

  // Categories CRUD operations
  const addCategory = async (category) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCategory = {
        ...category,
        id: getNextId(config.categories)
      };
      
      const newConfig = {
        ...config,
        categories: [...config.categories, newCategory]
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true, category: newCategory };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to add category' };
    }
  };

  const updateCategory = async (id, updates) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedCategories = config.categories.map(category =>
        category.id === id ? { ...category, ...updates } : category
      );
      
      const newConfig = {
        ...config,
        categories: updatedCategories
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to update category' };
    }
  };

  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredCategories = config.categories.filter(category => category.id !== id);
      
      const newConfig = {
        ...config,
        categories: filteredCategories
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to delete category' };
    }
  };

  // Farms CRUD operations
  const addFarm = async (farm) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newFarm = {
        ...farm,
        id: getNextId(config.farms)
      };
      
      const newConfig = {
        ...config,
        farms: [...config.farms, newFarm]
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true, farm: newFarm };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to add farm' };
    }
  };

  const updateFarm = async (id, updates) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedFarms = config.farms.map(farm =>
        farm.id === id ? { ...farm, ...updates } : farm
      );
      
      const newConfig = {
        ...config,
        farms: updatedFarms
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to update farm' };
    }
  };

  const deleteFarm = async (id) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredFarms = config.farms.filter(farm => farm.id !== id);
      
      const newConfig = {
        ...config,
        farms: filteredFarms
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to delete farm' };
    }
  };

  // Social Media CRUD operations
  const addSocialMedia = async (social) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSocial = {
        ...social,
        id: getNextId(config.socialMediaLinks)
      };
      
      const newConfig = {
        ...config,
        socialMediaLinks: [...config.socialMediaLinks, newSocial]
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true, social: newSocial };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to add social media' };
    }
  };

  const updateSocialMedia = async (id, updates) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedSocials = config.socialMediaLinks.map(social =>
        social.id === id ? { ...social, ...updates } : social
      );
      
      const newConfig = {
        ...config,
        socialMediaLinks: updatedSocials
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to update social media' };
    }
  };

  const deleteSocialMedia = async (id) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredSocials = config.socialMediaLinks.filter(social => social.id !== id);
      
      const newConfig = {
        ...config,
        socialMediaLinks: filteredSocials
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to delete social media' };
    }
  };

  // Shop settings update
  const updateShopSettings = async (settings) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newConfig = {
        ...config,
        ...settings
      };
      
      saveConfig(newConfig);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Failed to update shop settings' };
    }
  };

  const value = {
    config,
    loading,
    // Products
    addProduct,
    updateProduct,
    deleteProduct,
    // Categories
    addCategory,
    updateCategory,
    deleteCategory,
    // Farms
    addFarm,
    updateFarm,
    deleteFarm,
    // Social Media
    addSocialMedia,
    updateSocialMedia,
    deleteSocialMedia,
    // Shop Settings
    updateShopSettings
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};