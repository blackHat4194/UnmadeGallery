/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const ResinArtImage = ({
  type,
  alt,
  className = 'w-full h-full',
  showShimmer = true
}) => {
  return (
    <div
      className={`relative overflow-hidden select-none bg-[#F7F3EA] flex items-center justify-center ${className}`}
      role="img"
      aria-label={alt}
    >
      {/* Dynamic Resin Artwork Canvas */}
      {type === 'floral-crystal' && (
        <svg viewBox="0 0 400 400" className="w-full h-full object-cover">
          <defs>
            <radialGradient id="floralGlow" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#F7F3EA" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E8DFD0" stopOpacity="0.95" />
            </radialGradient>
            <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2C98F" />
              <stop offset="50%" stopColor="#C6A15B" />
              <stop offset="100%" stopColor="#8A6827" />
            </linearGradient>
            <filter id="resinDropShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#29231F" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Textured studio surface */}
          <rect width="400" height="400" fill="#F4EFE6" />
          <circle cx="200" cy="200" r="170" fill="#EAE2D4" opacity="0.5" />

          {/* Cast Shadow */}
          <ellipse cx="200" cy="330" rx="90" ry="22" fill="#29231F" opacity="0.14" />

          {/* Crystalline Teardrop / Cabochon Pendant Body */}
          <g filter="url(#resinDropShadow)">
            <path
              d="M200,60 C265,150 290,240 255,295 C220,350 180,350 145,295 C110,240 135,150 200,60 Z"
              fill="url(#floralGlow)"
              stroke="url(#goldRim)"
              strokeWidth="4"
            />
          </g>

          {/* 18k Gold Plated Bail & Loop */}
          <circle cx="200" cy="50" r="16" fill="none" stroke="url(#goldRim)" strokeWidth="5" />
          <path d="M195,40 L205,40 L200,60 Z" fill="url(#goldRim)" />

          {/* Suspended 24K Gold Leaf Flakes inside resin */}
          <g fill="#D8B167" opacity="0.88">
            <polygon points="175,190 182,185 186,192 180,198 172,194" />
            <polygon points="215,160 224,158 220,166 212,165" />
            <polygon points="190,250 197,244 204,248 198,255 192,253" />
            <polygon points="230,225 238,228 235,236 226,233" />
            <polygon points="160,230 168,226 166,234 158,235" />
            <circle cx="185" cy="140" r="2.5" />
            <circle cx="218" cy="280" r="3" />
            <circle cx="170" cy="270" r="2" />
          </g>

          {/* Botanical Inclusions: Real Preserved Baby's Breath & Stems */}
          <g stroke="#6B705C" strokeWidth="2" strokeLinecap="round" opacity="0.9">
            <path d="M198,290 Q200,220 195,160" />
            <path d="M198,240 Q180,210 170,190" />
            <path d="M196,215 Q215,190 225,175" />
            <path d="M175,200 Q160,185 155,170" />
          </g>

          {/* Preserved White & Cream Flower Florets */}
          <g fill="#FFFFFA" stroke="#D1C7B7" strokeWidth="0.8">
            <circle cx="195" cy="155" r="5" />
            <circle cx="190" cy="155" r="4.5" />
            <circle cx="200" cy="155" r="4.5" />
            <circle cx="195" cy="150" r="4.5" />
            <circle cx="195" cy="160" r="4.5" />
            <circle cx="195" cy="155" r="1.5" fill="#E2C98F" />

            <circle cx="170" cy="188" r="4.5" />
            <circle cx="165" cy="188" r="4" />
            <circle cx="175" cy="188" r="4" />
            <circle cx="170" cy="183" r="4" />
            <circle cx="170" cy="193" r="4" />
            <circle cx="170" cy="188" r="1.5" fill="#E2C98F" />

            <circle cx="225" cy="172" r="5" />
            <circle cx="220" cy="172" r="4.5" />
            <circle cx="230" cy="172" r="4.5" />
            <circle cx="225" cy="167" r="4.5" />
            <circle cx="225" cy="177" r="4.5" />
            <circle cx="225" cy="172" r="1.5" fill="#E2C98F" />

            <circle cx="155" cy="168" r="3" />
            <circle cx="185" cy="225" r="3.5" />
            <circle cx="210" cy="215" r="3" />
          </g>

          {/* Curvature & Glass Specular Highlight */}
          <path
            d="M175,100 C155,145 140,210 150,270"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.65"
          />
          <path
            d="M185,90 C175,115 168,145 168,170"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
      )}

      {type === 'emerald-gold' && (
        <svg viewBox="0 0 400 400" className="w-full h-full object-cover">
          <defs>
            <radialGradient id="emeraldBase" cx="45%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#2A7B62" />
              <stop offset="50%" stopColor="#164B3B" />
              <stop offset="90%" stopColor="#0B2B21" />
              <stop offset="100%" stopColor="#071E17" />
            </radialGradient>
            <linearGradient id="goldVein" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#F3DFAB" />
              <stop offset="40%" stopColor="#C6A15B" />
              <stop offset="70%" stopColor="#E8C87A" />
              <stop offset="100%" stopColor="#967228" />
            </linearGradient>
          </defs>

          <rect width="400" height="400" fill="#F3EDE3" />
          <ellipse cx="200" cy="335" rx="110" ry="25" fill="#29231F" opacity="0.18" />

          <g>
            <circle cx="200" cy="190" r="115" fill="url(#emeraldBase)" stroke="#C6A15B" strokeWidth="3" />
            <circle cx="200" cy="190" r="55" fill="#F3EDE3" stroke="#967228" strokeWidth="2" />
          </g>

          <path
            d="M110,140 C140,110 180,180 230,120 C270,80 300,160 310,210 C270,260 210,200 160,250 C120,290 100,200 110,140 Z"
            fill="#1E614D"
            opacity="0.65"
          />
          <path
            d="M130,220 C170,200 190,260 240,240 C280,220 290,270 280,290 C230,310 170,280 130,220 Z"
            fill="#09241B"
            opacity="0.75"
          />

          <g stroke="url(#goldVein)" fill="none" strokeLinecap="round">
            <path d="M125,160 Q170,145 195,190 T265,140" strokeWidth="4.5" />
            <path d="M140,240 Q180,270 230,230 T285,250" strokeWidth="3.5" />
            <path d="M170,115 Q210,130 250,105" strokeWidth="2" />
          </g>

          <g fill="#FFDF85">
            <circle cx="150" cy="170" r="3" />
            <circle cx="180" cy="155" r="2" />
            <circle cx="220" cy="175" r="2.5" />
            <circle cx="250" cy="150" r="3.5" />
            <circle cx="270" cy="190" r="2" />
            <circle cx="160" cy="235" r="3" />
            <circle cx="210" cy="265" r="2.5" />
            <circle cx="260" cy="245" r="3" />
            <circle cx="130" cy="200" r="1.8" />
          </g>

          <rect x="194" y="60" width="12" height="18" rx="3" fill="#D4AF37" />
          <circle cx="200" cy="69" r="3" fill="#29231F" />

          <path
            d="M135,120 A95,95 0 0,1 265,120"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      )}

      {type === 'keepsake-pyramid' && (
        <svg viewBox="0 0 400 400" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="pyrFaceLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#F5EFE6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#E2D4C0" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="pyrFaceRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EFE5D5" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#D9C9B2" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#BEAB91" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="roseCore" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#A81D33" />
              <stop offset="45%" stopColor="#750E1F" />
              <stop offset="85%" stopColor="#4A0511" />
              <stop offset="100%" stopColor="#2D0108" />
            </radialGradient>
          </defs>

          <rect width="400" height="400" fill="#F6F1EA" />
          <polygon points="120,320 200,340 340,320 280,300" fill="#29231F" opacity="0.22" />

          <polygon points="80,310 200,335 320,310 200,285" fill="#3D2B1F" />
          <polygon points="80,310 200,335 200,345 80,320" fill="#2B1E15" />
          <polygon points="200,335 320,310 320,320 200,345" fill="#4E3727" />

          <g id="encasedRose">
            <path d="M190,265 C185,250 170,255 185,275" fill="#2E4A2A" />
            <path d="M210,265 C215,250 230,255 215,275" fill="#2E4A2A" />

            <ellipse cx="200" cy="245" rx="36" ry="30" fill="url(#roseCore)" />
            <path d="M168,235 C175,210 200,210 205,230 C190,245 175,250 168,235 Z" fill="#991B2F" />
            <path d="M232,235 C225,210 200,210 195,230 C210,245 225,250 232,235 Z" fill="#881527" />
            <path d="M180,255 C190,265 210,265 220,255 C210,245 190,245 180,255 Z" fill="#BD253C" />

            <circle cx="200" cy="235" r="14" fill="#690C1A" />
            <path d="M195,230 C198,225 205,225 205,232 C205,238 194,238 194,232" fill="none" stroke="#BD253C" strokeWidth="2.5" />
          </g>

          <g fill="#DDBB72" opacity="0.9">
            <polygon points="170,285 178,280 175,290" />
            <polygon points="220,282 228,278 225,288" />
            <polygon points="195,292 205,288 202,298" />
            <circle cx="160" cy="288" r="2.5" />
            <circle cx="240" cy="285" r="3" />
            <circle cx="180" cy="295" r="2" />
            <circle cx="215" cy="295" r="2.5" />
          </g>

          <polygon
            points="200,85 85,305 200,325"
            fill="url(#pyrFaceLeft)"
            stroke="#EAE0D0"
            strokeWidth="1.5"
          />
          <polygon
            points="200,85 200,325 315,305"
            fill="url(#pyrFaceRight)"
            stroke="#D6C4AD"
            strokeWidth="1.5"
          />

          <line x1="200" y1="85" x2="200" y2="325" stroke="#FFFFFF" strokeWidth="3" opacity="0.75" />
          <line x1="200" y1="85" x2="85" y2="305" stroke="#FFFFFF" strokeWidth="2" opacity="0.85" />
          <circle cx="200" cy="85" r="4" fill="#FFFFFF" opacity="0.95" />
        </svg>
      )}

      {type === 'golden-amber' && (
        <svg viewBox="0 0 400 400" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="amberGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#F7DF94" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#E2A63B" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#A86518" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#6E3E0C" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="brassCap" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5DF9E" />
              <stop offset="50%" stopColor="#C6A15B" />
              <stop offset="100%" stopColor="#7E5F22" />
            </linearGradient>
          </defs>

          <rect width="400" height="400" fill="#F8F3EA" />
          <ellipse cx="200" cy="350" rx="75" ry="18" fill="#29231F" opacity="0.12" />

          <g>
            <path
              d="M140,160 C140,110 170,90 200,90 C230,90 260,110 260,160 L260,310 C260,320 250,330 240,330 L160,330 C150,330 140,320 140,310 Z"
              fill="url(#amberGrad)"
              stroke="url(#brassCap)"
              strokeWidth="3"
            />
          </g>

          <g fill="#FFF1B8" opacity="0.85">
            <path d="M170,140 Q190,160 185,185 T215,220 L210,230 Q180,200 175,160 Z" />
            <path d="M220,130 Q240,150 235,175 T240,240 L232,245 Q225,180 215,140 Z" />
            <polygon points="180,260 195,250 200,265 185,275" />
            <circle cx="170" cy="210" r="3" />
            <circle cx="230" cy="270" r="2.5" />
            <circle cx="190" cy="300" r="2" />
          </g>

          <path d="M130,95 C130,75 160,65 200,65 C240,65 270,75 270,95 Z" fill="url(#brassCap)" />
          <circle cx="200" cy="50" r="14" fill="none" stroke="url(#brassCap)" strokeWidth="4" />
          <line x1="155" y1="120" x2="155" y2="300" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        </svg>
      )}

      {type === 'botanical-teardrop' && (
        <svg viewBox="0 0 400 400" className="w-full h-full object-cover">
          <defs>
            <radialGradient id="periwinkleGlow" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#F5F3FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#DDD8EE" stopOpacity="0.9" />
            </radialGradient>
            <linearGradient id="goldBezel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ECD29A" />
              <stop offset="50%" stopColor="#C6A15B" />
              <stop offset="100%" stopColor="#8A6827" />
            </linearGradient>
          </defs>

          <rect width="400" height="400" fill="#F5EFE7" />
          <circle cx="200" cy="200" r="105" fill="none" stroke="url(#goldBezel)" strokeWidth="8" />
          <circle cx="200" cy="200" r="101" fill="url(#periwinkleGlow)" />

          <ellipse cx="200" cy="330" rx="90" ry="18" fill="#29231F" opacity="0.12" />

          <g id="hydrangeaFloret">
            <path d="M200,200 C170,150 180,120 200,120 C220,120 230,150 200,200 Z" fill="#7B88C4" opacity="0.82" />
            <path d="M200,200 C250,170 280,180 280,200 C280,220 250,230 200,200 Z" fill="#8C98D4" opacity="0.85" />
            <path d="M200,200 C230,250 220,280 200,280 C180,280 170,250 200,200 Z" fill="#7582BF" opacity="0.82" />
            <path d="M200,200 C150,230 120,220 120,200 C120,180 150,170 200,200 Z" fill="#9BA6DD" opacity="0.8" />
            <circle cx="200" cy="200" r="5" fill="#E8C87A" stroke="#C6A15B" strokeWidth="1" />
          </g>

          <g fill="#D8B167">
            <circle cx="160" cy="155" r="2.5" />
            <circle cx="240" cy="160" r="3" />
            <circle cx="165" cy="245" r="2" />
            <circle cx="235" cy="240" r="2.5" />
            <circle cx="200" cy="140" r="1.5" />
          </g>

          <path d="M140,150 A75,75 0 0,1 250,140" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.65" />
        </svg>
      )}

      {type === 'pressed-rose' && (
        <svg viewBox="0 0 400 400" className="w-full h-full object-cover">
          <defs>
            <radialGradient id="ringOvalGlow" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#F9F6F0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E2D7C5" stopOpacity="0.95" />
            </radialGradient>
            <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8D19B" />
              <stop offset="50%" stopColor="#C6A15B" />
              <stop offset="100%" stopColor="#8C6A28" />
            </linearGradient>
          </defs>

          <rect width="400" height="400" fill="#F7F2EB" />
          <ellipse cx="200" cy="330" rx="80" ry="16" fill="#29231F" opacity="0.14" />

          <ellipse cx="200" cy="190" rx="90" ry="110" fill="url(#ringOvalGlow)" stroke="url(#goldRing)" strokeWidth="8" />

          <g stroke="#918776" strokeWidth="1.5" strokeLinecap="round">
            <path d="M200,270 L200,160" />
            <path d="M200,200 L160,165" />
            <path d="M200,200 L240,165" />
            <path d="M200,180 L175,145" />
            <path d="M200,180 L225,145" />
          </g>

          <g fill="#FFFFFF" stroke="#D9D0C3" strokeWidth="0.8">
            <circle cx="200" cy="145" r="3.5" />
            <circle cx="160" cy="160" r="3.5" />
            <circle cx="240" cy="160" r="3.5" />
            <circle cx="175" cy="140" r="3" />
            <circle cx="225" cy="140" r="3" />
            <circle cx="190" cy="130" r="2.8" />
            <circle cx="210" cy="130" r="2.8" />
          </g>

          <g fill="#C6A15B">
            <circle cx="180" cy="220" r="2" />
            <circle cx="220" cy="210" r="2.5" />
            <circle cx="195" cy="240" r="1.8" />
            <polygon points="205,230 212,225 210,234" />
          </g>

          <path d="M110,190 C70,190 70,240 110,260" fill="none" stroke="url(#goldRing)" strokeWidth="6" />
          <path d="M290,190 C330,190 330,240 290,260" fill="none" stroke="url(#goldRing)" strokeWidth="6" />

          <path d="M150,140 A60,75 0 0,1 250,140" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </svg>
      )}

      {type === 'monstera-leaf' && (
        <svg viewBox="0 0 400 400" className="w-full h-full object-cover">
          <defs>
            <radialGradient id="wallMedallion" cx="40%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#F5EFE4" stopOpacity="0.85" />
              <stop offset="75%" stopColor="#1B5543" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0F382B" />
            </radialGradient>
            <linearGradient id="brassFrame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2C98F" />
              <stop offset="50%" stopColor="#C6A15B" />
              <stop offset="100%" stopColor="#805F23" />
            </linearGradient>
          </defs>

          <rect width="400" height="400" fill="#F4EDE2" />
          <circle cx="200" cy="200" r="130" fill="url(#wallMedallion)" stroke="url(#brassFrame)" strokeWidth="7" />

          <g fill="#2D6A4F" opacity="0.85">
            <path d="M200,95 C140,110 130,200 170,280 C185,290 200,290 200,95 Z" />
            <path d="M200,95 C260,110 270,200 230,280 C215,290 200,290 200,95 Z" />
          </g>

          <g fill="#1B5543">
            <ellipse cx="165" cy="180" rx="8" ry="16" transform="rotate(-30 165 180)" />
            <ellipse cx="235" cy="180" rx="8" ry="16" transform="rotate(30 235 180)" />
            <ellipse cx="175" cy="225" rx="6" ry="14" transform="rotate(-40 175 225)" />
            <ellipse cx="225" cy="225" rx="6" ry="14" transform="rotate(40 225 225)" />
          </g>

          <path d="M195,80 Q215,160 190,240 T210,320" fill="none" stroke="#E5C378" strokeWidth="4" />
          <circle cx="200" cy="65" r="12" fill="none" stroke="url(#brassFrame)" strokeWidth="4" />
        </svg>
      )}

      {/* Fallback default if artwork type not matched */}
      {![
        'floral-crystal',
        'emerald-gold',
        'keepsake-pyramid',
        'golden-amber',
        'botanical-teardrop',
        'pressed-rose',
        'monstera-leaf'
      ].includes(type) && (
        <svg viewBox="0 0 400 400" className="w-full h-full object-cover">
          <rect width="400" height="400" fill="#F4EFE6" />
          <circle cx="200" cy="200" r="110" fill="#164B3B" opacity="0.8" />
          <circle cx="200" cy="200" r="70" fill="#C6A15B" opacity="0.5" />
          <text x="200" y="205" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontFamily="var(--font-serif)">
            UNMADE GALLERY
          </text>
        </svg>
      )}

      {/* Subtle Shimmer Light Sweep on hover */}
      {showShimmer && <div className="resin-shimmer-effect absolute inset-0 pointer-events-none" />}
    </div>
  );
};
