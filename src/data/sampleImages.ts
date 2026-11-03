/**
 * Curated Showcase Examples for AI Image Authenticity Testing
 * Provides immediate pre-loaded images across diverse scenarios:
 * 1. Diffusion Portrait (Midjourney v6 style)
 * 2. Authentic DSLR Wildlife/Nature (Canon EOS R5)
 * 3. Surreal Architectural Generation (DALL-E 3)
 * 4. Compressed Ambiguous Social Media Capture (Testing Inconclusive mode)
 */

export interface SampleImageItem {
  id: string;
  title: string;
  category: 'AI Generated' | 'Real Photograph' | 'Ambiguous / Test';
  description: string;
  expectedVerdict: 'Likely AI Generated' | 'Likely Real Photograph' | 'Inconclusive';
  fileName: string;
  mimeType: string;
  dataUrl: string;
  indicators: string[];
}

function encodeSvgToBase64(svgStr: string): string {
  try {
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgStr)))}`;
    }
  } catch (e) {}
  return `data:image/svg+xml;base64,${Buffer.from(svgStr).toString('base64')}`;
}

// Generate realistic SVG image representations
function createSampleSvg(type: 'portrait_ai' | 'dslr_real' | 'arch_ai' | 'ambiguous_photo'): string {
  let svg = '';
  if (type === 'portrait_ai') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <radialGradient id="aiSkin" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#fed7aa"/>
          <stop offset="60%" stop-color="#fbb473"/>
          <stop offset="100%" stop-color="#e07d38"/>
        </radialGradient>
        <linearGradient id="aiBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b"/>
          <stop offset="50%" stop-color="#4338ca"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="neonLight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.8"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#aiBg)"/>
      <circle cx="200" cy="200" r="180" fill="#f43f5e" opacity="0.15"/>
      <circle cx="600" cy="600" r="220" fill="#06b6d4" opacity="0.15"/>
      
      <!-- Synthetic Portrait Features: Ultra-smooth gradient skin, complex hair strands, irregular catchlights -->
      <path d="M 280 700 C 280 540 340 500 400 500 C 460 500 520 540 520 700 Z" fill="#1e293b"/>
      <path d="M 330 380 Q 400 450 470 380 Q 450 250 400 240 Q 350 250 330 380 Z" fill="url(#aiSkin)"/>
      <ellipse cx="400" cy="460" rx="35" ry="50" fill="url(#aiSkin)"/>
      
      <!-- Eyes with typical diffusion asymmetric catchlights -->
      <ellipse cx="370" cy="335" rx="14" ry="9" fill="#ffffff"/>
      <circle cx="370" cy="335" r="6" fill="#0f766e"/>
      <circle cx="368" cy="333" r="2.5" fill="#ffffff"/>
      <circle cx="372" cy="336" r="1" fill="#ffffff"/>

      <ellipse cx="430" cy="335" rx="14" ry="9" fill="#ffffff"/>
      <circle cx="430" cy="335" r="6" fill="#0f766e"/>
      <circle cx="433" cy="334" r="3" fill="#ffffff"/>

      <!-- Stylized lips and hair with latent smoothing -->
      <path d="M 382 390 Q 400 398 418 390 Q 400 406 382 390 Z" fill="#e11d48" opacity="0.85"/>
      <path d="M 310 320 C 310 180 490 180 490 320 C 530 400 510 500 500 560 C 470 480 470 370 450 340 C 410 300 390 300 350 340 C 330 380 320 500 300 560 Z" fill="#020617"/>
      
      <text x="400" y="750" fill="#94a3b8" font-size="14" text-anchor="middle" font-family="sans-serif">Synthetic Midjourney v6 Study • Latent Diffusion Specimen</text>
    </svg>`;
    return encodeSvgToBase64(svg);
  }

  if (type === 'dslr_real') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="60%" stop-color="#bae6fd"/>
          <stop offset="100%" stop-color="#fed7aa"/>
        </linearGradient>
        <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#skyGrad)"/>
      <circle cx="620" cy="180" r="45" fill="#fffbeb" opacity="0.9"/>
      <circle cx="620" cy="180" r="90" fill="#fef08a" opacity="0.3"/>
      
      <polygon points="50,420 220,240 380,430" fill="url(#mountainGrad)" opacity="0.6"/>
      <polygon points="280,430 460,200 640,430" fill="url(#mountainGrad)" opacity="0.85"/>
      <polygon points="480,450 680,260 820,450" fill="url(#mountainGrad)"/>
      <polygon points="120,450 310,310 500,450" fill="#0f172a"/>
      
      <rect y="420" width="800" height="180" fill="#0369a1" opacity="0.85"/>
      <ellipse cx="620" cy="460" rx="30" ry="10" fill="#fef08a" opacity="0.4"/>
      
      <text x="400" y="580" fill="#f8fafc" font-size="12" text-anchor="middle" font-family="sans-serif">Canon EOS R5 • 24-70mm f/2.8L at 50mm, 1/250s, ISO 100</text>
    </svg>`;
    return encodeSvgToBase64(svg);
  }

  if (type === 'arch_ai') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="neonSky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="60%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#4c0519"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#neonSky)"/>
      <polygon points="200,750 200,280 340,160 480,240 480,750" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <polygon points="340,160 520,120 620,220 480,240" fill="#334155" stroke="#818cf8" stroke-width="1.5"/>
      <polygon points="480,240 620,220 620,700 480,750" fill="#0f172a" stroke="#ec4899" stroke-width="1.5"/>
      
      <path d="M 220 750 Q 280 400 340 500 Q 400 600 460 750" fill="none" stroke="#22d3ee" stroke-width="4"/>
      <path d="M 240 750 Q 290 420 340 515 Q 390 610 440 750" fill="none" stroke="#e879f9" stroke-width="3"/>
      
      <path d="M 340 160 Q 320 80 340 40 Q 360 80 340 160" fill="#f43f5e"/>
      <circle cx="340" cy="35" r="8" fill="#fef08a"/>
      <text x="400" y="780" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="sans-serif">DALL-E 3 Architecture • Vanishing Point & Geometry Discrepancies</text>
    </svg>`;
    return encodeSvgToBase64(svg);
  }

  // ambiguous_photo
  svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="#64748b"/>
    <rect x="50" y="50" width="500" height="500" fill="#475569" stroke="#334155" stroke-width="8"/>
    <circle cx="300" cy="260" r="110" fill="#94a3b8" opacity="0.6"/>
    <path d="M 120 500 C 200 380 400 380 480 500 Z" fill="#334155"/>
    <line x1="0" y1="150" x2="600" y2="150" stroke="#1e293b" stroke-dasharray="16,16" opacity="0.3"/>
    <line x1="0" y1="300" x2="600" y2="300" stroke="#1e293b" stroke-dasharray="16,16" opacity="0.3"/>
    <line x1="0" y1="450" x2="600" y2="450" stroke="#1e293b" stroke-dasharray="16,16" opacity="0.3"/>
    <text x="300" y="550" fill="#cbd5e1" font-size="12" text-anchor="middle" font-family="sans-serif">Heavily Compressed Low-Res Social Capture (Ambiguous Signal)</text>
  </svg>`;
  return encodeSvgToBase64(svg);
}

export const SAMPLE_SHOWCASE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-ai-portrait',
    title: 'Midjourney v6 Cyberpunk Portrait',
    category: 'AI Generated',
    description: 'High-aesthetic portrait featuring hyper-smooth epidermal texture, mismatched eye reflections, and typical diffusion hair synthesis.',
    expectedVerdict: 'Likely AI Generated',
    fileName: 'midjourney_v6_portrait_specimen.png',
    mimeType: 'image/png',
    dataUrl: createSampleSvg('portrait_ai'),
    indicators: [
      'Subsurface scattering lacks physical dermal layer micro-wrinkles',
      'Irregular catchlights in pupils indicating non-physical light geometry',
      'Hair strands fuse together without individual follicle root continuity',
    ],
  },
  {
    id: 'sample-real-dslr',
    title: 'Canon EOS R5 Alpine Lake',
    category: 'Real Photograph',
    description: 'Genuine camera capture with physical optical depth of field, real sensor noise distribution, and consistent directional sunlight.',
    expectedVerdict: 'Likely Real Photograph',
    fileName: 'canon_eos_r5_landscape.jpg',
    mimeType: 'image/jpeg',
    dataUrl: createSampleSvg('dslr_real'),
    indicators: [
      'Authentic uniform optical chromatic dispersion across high-contrast edges',
      'Physically consistent Fresnel water reflections matching angle of incidence',
      'Natural Gaussian sensor noise distribution',
    ],
  },
  {
    id: 'sample-ai-arch',
    title: 'DALL-E 3 Surreal Cyber Architecture',
    category: 'AI Generated',
    description: 'Complex architectural scene with non-Euclidean vanishing points, impossible structural load geometries, and synthetic lighting.',
    expectedVerdict: 'Likely AI Generated',
    fileName: 'dalle3_cyber_architecture.png',
    mimeType: 'image/png',
    dataUrl: createSampleSvg('arch_ai'),
    indicators: [
      'Conflicting perspective vanishing points between structural columns',
      'Impossible spiral spire defying structural load-bearing mechanics',
      'Uniform procedural edge sharpener artifacts',
    ],
  },
  {
    id: 'sample-ambiguous',
    title: 'Low-Resolution Compressed Capture',
    category: 'Ambiguous / Test',
    description: 'Heavily compressed social media thumbnail where 8x8 DCT JPEG blocking masks fine forensic micro-textures.',
    expectedVerdict: 'Inconclusive',
    fileName: 'recompressed_social_capture.jpg',
    mimeType: 'image/jpeg',
    dataUrl: createSampleSvg('ambiguous_photo'),
    indicators: [
      'Excessive DCT block quantization obscuring sensor noise and pore detail',
      'Insufficient spatial frequency resolution to determine generative origin',
      'Scientific standards require marking this case as Inconclusive',
    ],
  },
];
