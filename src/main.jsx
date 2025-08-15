import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import blzLogo from './assets/images/blz.svg' // Import logo

// Function to update favicon
const updateFavicon = (logoUrl) => {
  // Remove existing favicon
  const existingFavicon = document.querySelector("link[rel*='icon']");
  if (existingFavicon) {
    existingFavicon.remove();
  }

  // Create new favicon link
  const newFavicon = document.createElement('link');
  newFavicon.rel = 'icon';
  newFavicon.type = 'image/svg+xml';
  newFavicon.href = logoUrl;
  
  // Add to head
  document.head.appendChild(newFavicon);
};

// Update favicon when app loads
updateFavicon(blzLogo);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)