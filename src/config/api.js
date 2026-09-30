// Dynamic API Base URL Configuration for Cloudflare Pages, Multi-Device Deployment & Localhost
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // If hosted on Cloudflare Pages or remote server with custom API hostname
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
