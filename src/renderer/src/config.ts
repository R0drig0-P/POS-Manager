export const AppConfig = {
  appName: 'Gestor POS',
  companyName: 'Barbearia Principal', // Change to your client's name
  companyDetails: {
    nif: '999 999 999',
    address: 'Rua Principal, 123, Lisboa',
    phone: '+351 912 345 678'
  },
  localization: {
    currency: '€', // Can be changed to 'R$', '$', etc.
    locale: 'pt-PT' // To format dates and times correctly
  },
  display: {
    width: 1024, // Configurable resolution width
    height: 768  // Configurable resolution height
  },
  theme: {
    primaryColor: '#111827', // Primary color (Hotbars, Main Buttons)
    secondaryColor: '#4f46e5', // Secondary color (Admin Button, Highlights)
    successColor: '#10b981', // Green (Register Sale)
    dangerColor: '#ef4444', // Red (Delete, Close)
    backgroundColor: '#f3f4f6', // App background
    surfaceColor: '#ffffff' // White cards background
  },
  features: {
    enableProducts: true, // Set to 'true' if the client sells products
    enableClients: true // Set to 'true' to enable client profiles
  },
  defaults: {
    commissionServices: 50, // Default % when adding a new worker
    commissionProducts: 20 // Default % for products
  }
}