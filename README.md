# POS Manager - White-Label Model (SaaS)

This repository serves as a base template for a complete management application for Barbershops, Hair Salons, and Beauty Centers. It was built with a **White-Label** architecture, which means it is ready to be sold, customized, and installed for multiple clients by changing just a few simple settings.

The application is divided into two main areas:
1. **Worker Terminal (Desktop):** A fast, touch-friendly Point of Sale (POS) optimized for counter displays (configurable resolution, defaults to 1024x768).
2. **Owner Dashboard (Mobile/Web):** A PWA styled as a native mobile app featuring real-time revenue updates, team management, and catalog management.

---

## Tech Stack
- **Desktop Engine:** Electron
- **Frontend:** React + Vite + TypeScript
- **Database & Backend:** Supabase (PostgreSQL, Auth, Realtime)

---

## How to configure for a New Client

### 1. Database (Supabase)
1. Create a new project on Supabase.
2. Run the provided SQL script (or your copy of the `workers`, `services`, `products`, `sales`, `sale_items` tables).
3. Create a `.env.local` file in the root of the project with the client's keys:
```env
VITE_SUPABASE_URL=https://client-id.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
```

### 2. Dynamic Customization (Branding)
There is no need to change the main source code to modify colors or features for a client. Everything is centralized in the global configuration file:

 **Edit the file:** `src/renderer/src/config.ts`

```typescript
export const AppConfig = {
  companyName: 'Barbearia do Cliente', // Nome da loja
  localization: {
    currency: '€', // ou 'R$', '$'
    locale: 'pt-PT'
  },
  theme: {
    primaryColor: '#111827', // Cor principal do cliente
    secondaryColor: '#4f46e5', // Cor secundária
    successColor: '#10b981', 
    // ...
  },
  features: {
    enableProducts: false, // Desliga partes do código se o cliente não quiser gestão de produtos
    enableClients: true 
  }
}
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```