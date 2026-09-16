// Konfigurasi Google OAuth Client untuk Payaman OS
// Masukkan Google Client ID yang dibuat di Google Cloud Console (Web application)
// Authorized JavaScript origins: http://localhost:5173 (atau domain hosting Anda)
export const GOOGLE_CONFIG = {
  clientId:
    import.meta.env?.VITE_GOOGLE_CLIENT_ID ||
    "451104406340-tfvd8ludgknd68lll8l6dj9i2bg5pci8.apps.googleusercontent.com",
};
