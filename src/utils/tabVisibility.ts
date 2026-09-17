/**
 * Utility for handling browser tab visibility and favicon switching
 * "ومن يغادر احد المنصة حول اسم التبويب الى السيطرة تفتقدك وغير لوغو التبويب عند المغادرة لجعله نفس لوغو المنصة"
 */

// Platform logo SVG encoded as Data URI (CPU / Control Engineering circuit chip with blue gradient)
export const PLATFORM_LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Background with rounded corners matching platform branding -->
  <rect width="64" height="64" rx="15" fill="url(#grad)" filter="url(#glow)"/>
  
  <!-- Outer circuit pins -->
  <path d="M22 6v6 M32 6v6 M42 6v6 M22 52v6 M32 52v6 M42 52v6 M6 22h6 M6 32h6 M6 42h6 M52 22h6 M52 32h6 M52 42h6" 
        stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round"/>
        
  <!-- CPU chip outer border -->
  <rect x="16" y="16" width="32" height="32" rx="6" fill="#0f172a" stroke="#60a5fa" stroke-width="2.5"/>
  
  <!-- Internal Core with Control & Automation loop symbol -->
  <rect x="23" y="23" width="18" height="18" rx="3" fill="#1e3a8a" stroke="#38bdf8" stroke-width="1.5"/>
  
  <!-- Central circuit nodes -->
  <circle cx="28" cy="28" r="2" fill="#38bdf8"/>
  <circle cx="36" cy="28" r="2" fill="#38bdf8"/>
  <circle cx="28" cy="36" r="2" fill="#38bdf8"/>
  <circle cx="36" cy="36" r="2" fill="#38bdf8"/>
  <line x1="28" y1="28" x2="36" y2="36" stroke="#93c5fd" stroke-width="1.5"/>
  <line x1="36" y1="28" x2="28" y2="36" stroke="#93c5fd" stroke-width="1.5"/>
</svg>
`)}`;

// Away logo SVG (Platform logo with "السيطرة تفتقدك" badge / indicator)
export const PLATFORM_AWAY_LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="gradAway" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="50%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
  </defs>
  <!-- Main platform logo body -->
  <rect width="64" height="64" rx="15" fill="url(#gradAway)"/>
  
  <!-- Outer circuit pins -->
  <path d="M22 6v6 M32 6v6 M42 6v6 M22 52v6 M32 52v6 M42 52v6 M6 22h6 M6 32h6 M6 42h6 M52 22h6 M52 32h6 M52 42h6" 
        stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/>
        
  <!-- CPU chip outer border -->
  <rect x="16" y="16" width="32" height="32" rx="6" fill="#0b1329" stroke="#93c5fd" stroke-width="2.5"/>
  
  <!-- Internal Core with Control & Automation loop symbol -->
  <rect x="23" y="23" width="18" height="18" rx="3" fill="#1e293b" stroke="#60a5fa" stroke-width="1.5"/>
  
  <!-- Central circuit nodes -->
  <circle cx="28" cy="28" r="2" fill="#60a5fa"/>
  <circle cx="36" cy="28" r="2" fill="#60a5fa"/>
  <circle cx="28" cy="36" r="2" fill="#60a5fa"/>
  <circle cx="36" cy="36" r="2" fill="#60a5fa"/>
  <line x1="28" y1="28" x2="36" y2="36" stroke="#93c5fd" stroke-width="1.5"/>
  <line x1="36" y1="28" x2="28" y2="36" stroke="#93c5fd" stroke-width="1.5"/>
  
  <!-- Attention badge: Heart / Missing you dot -->
  <circle cx="50" cy="14" r="10" fill="#ef4444" stroke="#ffffff" stroke-width="2.5"/>
  <path d="M50 11.5 c-1.2-1.5-3.5-0.5-3.5 1.2 c0 1.6 3.5 4.3 3.5 4.3 s3.5-2.7 3.5-4.3 c0-1.7-2.3-2.7-3.5-1.2 z" fill="#ffffff"/>
</svg>
`)}`;

/**
 * Sets the browser favicon link element
 */
export function setFavicon(url: string) {
  try {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = url;
  } catch {
    // Ignore in non-DOM environments
  }
}
