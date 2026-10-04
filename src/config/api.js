// Dynamic API Base URL Configuration for Cloudflare Pages, Multi-Device Deployment & Localhost
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Static hosting providers (Cloudflare Pages, Vercel, Netlify, GitHub Pages) without VITE_API_URL set
    if (host.endsWith('.pages.dev') || host.endsWith('.vercel.app') || host.endsWith('.netlify.app') || host.endsWith('.github.io')) {
      return null; // Return null so app defaults to client-side local authentication and offline persistence
    }
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return `${window.location.protocol}//${host}:5000`;
    }
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
