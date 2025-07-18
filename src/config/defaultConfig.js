// src/config/defaultConfig.js
export const getDefaultConfig = () => ({
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
  socialMediaLinks: [],
  categories: [],
  farms: [],
  pages: [],
  products: [],
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
});