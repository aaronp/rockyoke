/**
 * JukeboxShell
 *
 * Decorative jukebox casing that hosts four swappable UI components.
 * Drop your components in via props — the SVG shell is purely presentational.
 *
 * Slot layout (top -> bottom):
 *   1. recordPlayer  — the large arch opening (spinning record visualiser, etc.)
 *   2. songRolodex   — the glass display window (song-selection rolodex / carousel)
 *   3. buttonPanel   — the button area below the rolodex (selection buttons, etc.)
 *   4. songQueue     — the tall lower panel (queue list, history, etc.)
 *
 * Usage:
 *   <JukeboxShell
 *     recordPlayer={<MySpinningRecord />}
 *     songRolodex={<MyRolodex />}
 *     buttonPanel={<MyButtonPanel />}
 *     songQueue={<MySongQueue />}
 *   />
 *
 * All slots are optional — a clearly-labelled placeholder is shown when omitted.
 */

import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SlotPlaceholderProps {
  label: string;
}

interface SlotOverlayProps {
  x: number;
  y: number;
  w: number;
  h: number;
  children: React.ReactNode;
  zIndex?: number;
}

interface JukeboxShellProps {
  recordPlayer?: React.ReactNode;
  songRolodex?: React.ReactNode;
  buttonPanel?: React.ReactNode;
  songQueue?: React.ReactNode;
  variant?: "large" | "small";
}

// Slot positions for different variants (in SVG viewBox coordinates)
const SLOT_POSITIONS = {
  large: {
    recordPlayer: { x: 192, y: 100, w: 416, h: 320 },
    songRolodex: { x: 240, y: 433, w: 320, h: 106 },
    buttonPanel: { x: 200, y: 553, w: 400, h: 56 },
    songQueue: { x: 148, y: 622, w: 504, h: 174 },
  },
  small: {
    recordPlayer: { x: 192, y: 100, w: 416, h: 280 },  // Shorter to make room
    songRolodex: { x: 200, y: 393, w: 400, h: 150 },   // Wider and taller, moved up
    buttonPanel: { x: 200, y: 553, w: 400, h: 56 },
    songQueue: { x: 148, y: 622, w: 504, h: 174 },
  },
} as const;

// ---------------------------------------------------------------------------
// Slot placeholder shown when no component is provided
// ---------------------------------------------------------------------------
function SlotPlaceholder({ label }: SlotPlaceholderProps): React.ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "2px dashed rgba(255,200,80,0.55)",
        borderRadius: 6,
        background: "rgba(0,0,0,0.35)",
        boxSizing: "border-box",
        gap: 6,
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "clamp(9px, 1.2vw, 13px)",
          color: "rgba(255,200,80,0.8)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textAlign: "center",
          padding: "0 8px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "clamp(7px, 0.9vw, 10px)",
          color: "rgba(255,200,80,0.45)",
          fontFamily: "monospace",
        }}
      >
        — drop component here —
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slot overlay positioned in SVG-coordinate space
//
// All x/y/w/h values are in the SVG's viewBox units (0 0 800 1020).
// We convert to percentages so the layout scales with any container size.
// ---------------------------------------------------------------------------
const VB_W = 800;
const VB_H = 1020;

function SlotOverlay({
  x,
  y,
  w,
  h,
  children,
  zIndex,
}: SlotOverlayProps): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: `${(x / VB_W) * 100}%`,
        top: `${(y / VB_H) * 100}%`,
        width: `${(w / VB_W) * 100}%`,
        height: `${(h / VB_H) * 100}%`,
        overflow: "hidden",
        zIndex,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main shell
// ---------------------------------------------------------------------------
export function JukeboxShell({
  recordPlayer = <SlotPlaceholder label="Record Player" />,
  songRolodex = <SlotPlaceholder label="Song Rolodex" />,
  buttonPanel = <SlotPlaceholder label="Button Panel" />,
  songQueue = <SlotPlaceholder label="Song Queue" />,
  variant = "large",
}: JukeboxShellProps): React.ReactElement {
  const slots = SLOT_POSITIONS[variant];
  return (
    /*
     * Outer wrapper: fixed width OR fluid — set width in the parent.
     * The paddingBottom trick gives the div the exact aspect ratio of the
     * SVG viewBox so the absolute-positioned slots always align perfectly.
     */
    <div style={{ position: "relative", width: "100%", maxWidth: 800 }}>
      {/* Aspect-ratio spacer (800 : 1220) */}
      <div style={{ paddingBottom: `${(VB_H / VB_W) * 100}%` }} />

      {/* -- SVG decorative shell (pointer-events none so slots receive clicks) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* -- ARCH PEACH GLOW -- */}
          <linearGradient id="jb-archPeach" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5C2408" />
            <stop offset="10%" stopColor="#A85A20" />
            <stop offset="22%" stopColor="#E8A050" />
            <stop offset="38%" stopColor="#F8D898" />
            <stop offset="50%" stopColor="#FFF0D0" />
            <stop offset="62%" stopColor="#F8D898" />
            <stop offset="78%" stopColor="#E8A050" />
            <stop offset="90%" stopColor="#A85A20" />
            <stop offset="100%" stopColor="#5C2408" />
          </linearGradient>

          {/* -- WOOD -- */}
          <linearGradient id="jb-woodMain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#130601" />
            <stop offset="6%" stopColor="#2E1206" />
            <stop offset="18%" stopColor="#4A2010" />
            <stop offset="50%" stopColor="#522514" />
            <stop offset="82%" stopColor="#4A2010" />
            <stop offset="94%" stopColor="#2E1206" />
            <stop offset="100%" stopColor="#130601" />
          </linearGradient>
          <linearGradient id="jb-woodBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3A1808" />
            <stop offset="100%" stopColor="#180804" />
          </linearGradient>
          <linearGradient id="jb-woodColumn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#251005" />
            <stop offset="30%" stopColor="#4A2010" />
            <stop offset="50%" stopColor="#5A2A16" />
            <stop offset="70%" stopColor="#4A2010" />
            <stop offset="100%" stopColor="#251005" />
          </linearGradient>

          {/* -- ILLUMINATED COLUMNS -- */}
          <linearGradient id="jb-colGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A2008" />
            <stop offset="20%" stopColor="#C88030" />
            <stop offset="50%" stopColor="#FFD880" />
            <stop offset="80%" stopColor="#C88030" />
            <stop offset="100%" stopColor="#4A2008" />
          </linearGradient>
          <linearGradient id="jb-colGlowR" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4A2008" />
            <stop offset="20%" stopColor="#C88030" />
            <stop offset="50%" stopColor="#FFD880" />
            <stop offset="80%" stopColor="#C88030" />
            <stop offset="100%" stopColor="#4A2008" />
          </linearGradient>

          {/* -- CHROME -- */}
          <linearGradient id="jb-chromeV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F0F0F0" />
            <stop offset="30%" stopColor="#C8C8C8" />
            <stop offset="60%" stopColor="#909090" />
            <stop offset="100%" stopColor="#D0D0D0" />
          </linearGradient>
          <linearGradient id="jb-chromeH" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#808080" />
            <stop offset="20%" stopColor="#D8D8D8" />
            <stop offset="50%" stopColor="#F8F8F8" />
            <stop offset="80%" stopColor="#D8D8D8" />
            <stop offset="100%" stopColor="#808080" />
          </linearGradient>
          <linearGradient id="jb-chromeHDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#606060" />
            <stop offset="30%" stopColor="#B0B0B0" />
            <stop offset="50%" stopColor="#D0D0D0" />
            <stop offset="70%" stopColor="#B0B0B0" />
            <stop offset="100%" stopColor="#606060" />
          </linearGradient>

          {/* -- GEMS -- */}
          <radialGradient id="jb-redGem" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FF8080" />
            <stop offset="45%" stopColor="#CC0000" />
            <stop offset="100%" stopColor="#550000" />
          </radialGradient>
          <radialGradient id="jb-redGemSm" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FF9090" />
            <stop offset="45%" stopColor="#DD1010" />
            <stop offset="100%" stopColor="#660000" />
          </radialGradient>
          <radialGradient id="jb-yellowGem" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFA0" />
            <stop offset="45%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#7A5800" />
          </radialGradient>

          {/* -- DISPLAY WINDOW -- */}
          <linearGradient id="jb-displayBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C8C090" />
            <stop offset="50%" stopColor="#989060" />
            <stop offset="100%" stopColor="#686038" />
          </linearGradient>

          {/* -- BOTTOM ARCH -- */}
          <linearGradient
            id="jb-btmArchPeach"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#6A3010" />
            <stop offset="25%" stopColor="#D89040" />
            <stop offset="50%" stopColor="#FFD888" />
            <stop offset="75%" stopColor="#D89040" />
            <stop offset="100%" stopColor="#6A3010" />
          </linearGradient>

          {/* -- ARCH INTERIOR -- */}
          <radialGradient id="jb-archInterior" cx="50%" cy="85%" r="60%">
            <stop offset="0%" stopColor="#3A1808" />
            <stop offset="100%" stopColor="#0A0402" />
          </radialGradient>

          {/* -- SONG QUEUE FRAME -- */}
          <linearGradient id="jb-queueBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A0C04" />
            <stop offset="100%" stopColor="#0E0602" />
          </linearGradient>

          {/* -- SELECTOR PANEL -- */}
          <linearGradient id="jb-metalPanel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3C1C0A" />
            <stop offset="40%" stopColor="#2A1208" />
            <stop offset="100%" stopColor="#1A0806" />
          </linearGradient>

          {/* -- ORANGE BUTTON -- */}
          <radialGradient id="jb-orangeBtn" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFE080" />
            <stop offset="50%" stopColor="#E87010" />
            <stop offset="100%" stopColor="#7A3800" />
          </radialGradient>
        </defs>

        {/* -- CABINET BODY --
            Spans full arch outer width x=108->692, top y=455 -> base y=920 */}
        <rect
          x="108"
          y="455"
          width="584"
          height="465"
          rx="14"
          fill="url(#jb-woodMain)"
        />

        {/* -- BASE PLINTH -- */}
        <rect
          x="100"
          y="920"
          width="600"
          height="55"
          rx="14"
          fill="url(#jb-woodBase)"
        />

        {/* -- BASE CHROME TRIM (rendered early so medallion overlaps it) -- */}
        <rect
          x="108"
          y="915"
          width="584"
          height="8"
          rx="3"
          fill="url(#jb-chromeH)"
          opacity="0.5"
        />

        {/* -- FEET -- */}
        <rect x="120" y="960" width="52" height="46" rx="12" fill="#100604" />
        <rect x="196" y="960" width="52" height="46" rx="12" fill="#100604" />
        <rect x="552" y="960" width="52" height="46" rx="12" fill="#100604" />
        <rect x="628" y="960" width="52" height="46" rx="12" fill="#100604" />

        {/* -- ILLUMINATED SIDE COLUMNS (full cabinet height) -- */}
        <rect
          x="196"
          y="455"
          width="36"
          height="460"
          rx="5"
          fill="url(#jb-colGlow)"
        />
        <rect
          x="568"
          y="455"
          width="36"
          height="460"
          rx="5"
          fill="url(#jb-colGlowR)"
        />

        {/* Column base caps */}
        <rect
          x="190"
          y="898"
          width="48"
          height="20"
          rx="4"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="562"
          y="898"
          width="48"
          height="20"
          rx="4"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="190"
          y="882"
          width="48"
          height="16"
          rx="3"
          fill="url(#jb-woodColumn)"
        />
        <rect
          x="562"
          y="882"
          width="48"
          height="16"
          rx="3"
          fill="url(#jb-woodColumn)"
        />
        <rect
          x="185"
          y="862"
          width="58"
          height="20"
          rx="5"
          fill="url(#jb-woodColumn)"
        />
        <rect
          x="557"
          y="862"
          width="58"
          height="20"
          rx="5"
          fill="url(#jb-woodColumn)"
        />

        {/* -- MAIN ARCH TUBE -- */}
        <path
          fillRule="evenodd"
          fill="url(#jb-archPeach)"
          d="M 110 905 L 110 312 A 290 254 0 0 1 690 312 L 690 905 Z
             M 192 905 L 192 364 A 208 246 0 0 1 608 364 L 608 905 Z"
        />
        {/* Arch interior - transparent to show record player behind */}
        <path
          fill="none"
          stroke="#FFF0D0"
          strokeWidth="3"
          opacity="0.6"
          d="M 192 522 L 192 364 A 208 246 0 0 1 608 364 L 608 522"
        />
        <path
          fill="none"
          stroke="#3C1808"
          strokeWidth="2"
          opacity="0.7"
          d="M 110 905 L 110 312 A 290 254 0 0 1 690 312 L 690 905"
        />

        {/* -- LEFT FIN STACKS (on top of cabinet housing) -- */}
        <rect
          x="108"
          y="354"
          width="86"
          height="20"
          rx="5"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="118"
          y="376"
          width="66"
          height="14"
          rx="3"
          fill="url(#jb-redGem)"
        />
        <rect
          x="108"
          y="392"
          width="86"
          height="16"
          rx="4"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="118"
          y="410"
          width="66"
          height="14"
          rx="3"
          fill="url(#jb-redGem)"
        />
        <rect
          x="108"
          y="426"
          width="86"
          height="16"
          rx="4"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="118"
          y="444"
          width="66"
          height="14"
          rx="3"
          fill="url(#jb-redGem)"
        />
        <rect
          x="108"
          y="460"
          width="86"
          height="16"
          rx="4"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="108"
          y="478"
          width="86"
          height="14"
          rx="4"
          fill="url(#jb-chromeHDark)"
        />
        <rect
          x="108"
          y="352"
          width="12"
          height="145"
          rx="3"
          fill="url(#jb-chromeV)"
        />
        <rect
          x="182"
          y="352"
          width="12"
          height="145"
          rx="3"
          fill="url(#jb-chromeV)"
        />

        {/* -- RIGHT FIN STACKS -- */}
        <rect
          x="606"
          y="354"
          width="86"
          height="20"
          rx="5"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="616"
          y="376"
          width="66"
          height="14"
          rx="3"
          fill="url(#jb-redGem)"
        />
        <rect
          x="606"
          y="392"
          width="86"
          height="16"
          rx="4"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="616"
          y="410"
          width="66"
          height="14"
          rx="3"
          fill="url(#jb-redGem)"
        />
        <rect
          x="606"
          y="426"
          width="86"
          height="16"
          rx="4"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="616"
          y="444"
          width="66"
          height="14"
          rx="3"
          fill="url(#jb-redGem)"
        />
        <rect
          x="606"
          y="460"
          width="86"
          height="16"
          rx="4"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="606"
          y="478"
          width="86"
          height="14"
          rx="4"
          fill="url(#jb-chromeHDark)"
        />
        <rect
          x="606"
          y="352"
          width="12"
          height="145"
          rx="3"
          fill="url(#jb-chromeV)"
        />
        <rect
          x="680"
          y="352"
          width="12"
          height="145"
          rx="3"
          fill="url(#jb-chromeV)"
        />

        {/* -- CHROME CONNECTOR BRACKETS -- */}
        <rect
          x="108"
          y="302"
          width="96"
          height="18"
          rx="5"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="606"
          y="302"
          width="86"
          height="18"
          rx="5"
          fill="url(#jb-chromeH)"
        />

        {/* -- SONG ROLODEX SLOT -- glass display window bezel */}
        <rect
          x="232"
          y="425"
          width="336"
          height="122"
          rx="7"
          fill="url(#jb-chromeH)"
        />
        {/* Slot background (replaced by SongRolodex component) */}
        <rect
          x="240"
          y="433"
          width="320"
          height="106"
          rx="5"
          fill="url(#jb-displayBg)"
        />

        {/* -- SELECTOR BUTTON PANEL -- */}
        <rect
          x="200"
          y="553"
          width="400"
          height="56"
          rx="7"
          fill="url(#jb-metalPanel)"
        />
        <rect
          x="200"
          y="553"
          width="400"
          height="5"
          rx="2"
          fill="url(#jb-chromeH)"
          opacity="0.7"
        />
        <rect
          x="200"
          y="604"
          width="400"
          height="5"
          rx="2"
          fill="url(#jb-chromeH)"
          opacity="0.5"
        />
        {/* Decorative circles removed - ButtonPanel component now occupies this area */}

        {/* -- SONG QUEUE SLOT -- chrome-bezelled panel
            Slot covers: x=148 y=626 w=504 h=162  */}
        <rect
          x="140"
          y="614"
          width="520"
          height="190"
          rx="9"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="148"
          y="622"
          width="504"
          height="174"
          rx="7"
          fill="url(#jb-queueBg)"
        />
        {/* Subtle inner rim */}
        <rect
          x="148"
          y="622"
          width="504"
          height="6"
          rx="3"
          fill="url(#jb-chromeH)"
          opacity="0.3"
        />
        <rect
          x="148"
          y="790"
          width="504"
          height="4"
          rx="2"
          fill="url(#jb-chromeH)"
          opacity="0.3"
        />

        {/* -- BOTTOM DECORATIVE ARCH -- */}
        <path
          fillRule="evenodd"
          fill="url(#jb-btmArchPeach)"
          d="M 308 915 L 308 871  A 92 92 0 0 1 492 871  L 492 915 Z
             M 328 915 L 328 879  A 72 72 0 0 1 472 879  L 472 915 Z"
        />
        <path
          fill="#1A0806"
          d="M 328 915 L 328 879 A 72 72 0 0 1 472 879 L 472 915 Z"
        />

        {/* -- DECORATIVE MEDALLION -- */}
        <circle cx="400" cy="904" r="55" fill="url(#jb-chromeH)" />
        <circle cx="400" cy="904" r="44" fill="#1A0806" />
        <path
          d="M 400 849 L 392 868 L 400 864 L 408 868 Z"
          fill="url(#jb-chromeV)"
        />
        <ellipse
          cx="366"
          cy="900"
          rx="24"
          ry="10"
          fill="url(#jb-chromeH)"
          transform="rotate(-15 366 900)"
        />
        <ellipse
          cx="434"
          cy="900"
          rx="24"
          ry="10"
          fill="url(#jb-chromeH)"
          transform="rotate(15 434 900)"
        />
        <path
          d="M 345 904 L 355 898 L 355 910 Z"
          fill="url(#jb-chromeV)"
        />
        <path
          d="M 455 904 L 445 898 L 445 910 Z"
          fill="url(#jb-chromeV)"
        />
        <ellipse
          cx="400"
          cy="853"
          rx="10"
          ry="12"
          fill="url(#jb-redGem)"
          stroke="#880000"
          strokeWidth="1.5"
        />
        <ellipse
          cx="397"
          cy="849"
          rx="3.5"
          ry="4"
          fill="rgba(255,180,180,0.6)"
        />
        <circle cx="360" cy="890" r="6" fill="url(#jb-redGemSm)" />
        <circle cx="440" cy="890" r="6" fill="url(#jb-redGemSm)" />
        <circle
          cx="400"
          cy="906"
          r="20"
          fill="url(#jb-yellowGem)"
          stroke="#9B7000"
          strokeWidth="2"
        />
        <ellipse
          cx="394"
          cy="899"
          rx="7"
          ry="9"
          fill="rgba(255,255,200,0.55)"
        />
        <circle
          cx="400"
          cy="906"
          r="24"
          fill="none"
          stroke="url(#jb-chromeH)"
          strokeWidth="4"
        />

        {/* -- TOP CHROME FINIAL -- */}
        <rect
          x="391"
          y="72"
          width="18"
          height="58"
          rx="5"
          fill="url(#jb-chromeV)"
        />
        <rect
          x="356"
          y="90"
          width="88"
          height="18"
          rx="5"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="368"
          y="112"
          width="64"
          height="10"
          rx="3"
          fill="url(#jb-chromeHDark)"
        />
        <rect
          x="374"
          y="124"
          width="52"
          height="8"
          rx="3"
          fill="url(#jb-chromeHDark)"
        />
        <ellipse
          cx="400"
          cy="61"
          rx="19"
          ry="23"
          fill="url(#jb-redGem)"
          stroke="#660000"
          strokeWidth="2"
        />
        <ellipse
          cx="395"
          cy="54"
          rx="6"
          ry="9"
          fill="rgba(255,160,160,0.6)"
        />
        <rect
          x="348"
          y="83"
          width="16"
          height="30"
          rx="4"
          fill="url(#jb-chromeV)"
        />
        <rect
          x="436"
          y="83"
          width="16"
          height="30"
          rx="4"
          fill="url(#jb-chromeV)"
        />
        <circle cx="360" cy="96" r="7" fill="url(#jb-redGem)" />
        <circle cx="440" cy="96" r="7" fill="url(#jb-redGem)" />

        {/* -- CHROME TRIM STRIPS -- */}
        <rect
          x="108"
          y="452"
          width="584"
          height="10"
          rx="4"
          fill="url(#jb-chromeH)"
          opacity="0.6"
        />
        {/* Base centre knob */}
        <circle cx="400" cy="948" r="9" fill="url(#jb-chromeV)" />
        <circle cx="400" cy="948" r="5" fill="#1A0808" />
      </svg>

      {/* ================================================================
          SLOT 1 -- RECORD PLAYER (z-index 1 to appear behind the housing)
          ================================================================ */}
      <SlotOverlay x={slots.recordPlayer.x} y={slots.recordPlayer.y} w={slots.recordPlayer.w} h={slots.recordPlayer.h} zIndex={1}>
        {recordPlayer}
      </SlotOverlay>

      {/* ================================================================
          SLOT 2 -- SONG ROLODEX
          ================================================================ */}
      <SlotOverlay x={slots.songRolodex.x} y={slots.songRolodex.y} w={slots.songRolodex.w} h={slots.songRolodex.h} zIndex={3}>
        {songRolodex}
      </SlotOverlay>

      {/* ================================================================
          SLOT 3 -- BUTTON PANEL
          ================================================================ */}
      <SlotOverlay x={slots.buttonPanel.x} y={slots.buttonPanel.y} w={slots.buttonPanel.w} h={slots.buttonPanel.h} zIndex={3}>
        {buttonPanel}
      </SlotOverlay>

      {/* ================================================================
          SLOT 4 -- SONG QUEUE
          ================================================================ */}
      <SlotOverlay x={slots.songQueue.x} y={slots.songQueue.y} w={slots.songQueue.w} h={slots.songQueue.h} zIndex={3}>
        {songQueue}
      </SlotOverlay>

      {/* ================================================================
          BOTTOM ARCH OVERLAY
          Rendered on top of the song queue to prevent content clipping.
          ================================================================ */}
      <div
        style={{
          position: "absolute",
          left: `${(280 / VB_W) * 100}%`,
          top: `${(840 / VB_H) * 100}%`,
          width: `${(240 / VB_W) * 100}%`,
          height: `${(90 / VB_H) * 100}%`,
          pointerEvents: "none",
          zIndex: 4,
        }}
      >
        <svg
          viewBox="280 840 240 90"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="arch-btmArchPeach" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E8C4A0" />
              <stop offset="100%" stopColor="#B8956C" />
            </linearGradient>
            <linearGradient id="arch-chromeH" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9A9A9A" />
              <stop offset="35%" stopColor="#F5F5F5" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#F0F0F0" />
              <stop offset="100%" stopColor="#8A8A8A" />
            </linearGradient>
            <linearGradient id="arch-chromeV" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A0A0A0" />
              <stop offset="30%" stopColor="#F8F8F8" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#E8E8E8" />
              <stop offset="100%" stopColor="#909090" />
            </linearGradient>
            <radialGradient id="arch-redGem" cx="40%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FF6666" />
              <stop offset="50%" stopColor="#CC0000" />
              <stop offset="100%" stopColor="#660000" />
            </radialGradient>
            <radialGradient id="arch-redGemSm" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FF6666" />
              <stop offset="60%" stopColor="#CC0000" />
              <stop offset="100%" stopColor="#550000" />
            </radialGradient>
            <radialGradient id="arch-yellowGem" cx="40%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="40%" stopColor="#FFCC00" />
              <stop offset="100%" stopColor="#996600" />
            </radialGradient>
          </defs>
          {/* Bottom decorative arch */}
          <path
            fillRule="evenodd"
            fill="url(#arch-btmArchPeach)"
            d="M 308 915 L 308 871  A 92 92 0 0 1 492 871  L 492 915 Z
               M 328 915 L 328 879  A 72 72 0 0 1 472 879  L 472 915 Z"
          />
          <path
            fill="#1A0806"
            d="M 328 915 L 328 879 A 72 72 0 0 1 472 879 L 472 915 Z"
          />
          {/* Decorative medallion */}
          <circle cx="400" cy="904" r="55" fill="url(#arch-chromeH)" />
          <circle cx="400" cy="904" r="44" fill="#1A0806" />
          <path
            d="M 400 849 L 392 868 L 400 864 L 408 868 Z"
            fill="url(#arch-chromeV)"
          />
          <ellipse
            cx="366"
            cy="900"
            rx="24"
            ry="10"
            fill="url(#arch-chromeH)"
            transform="rotate(-15 366 900)"
          />
          <ellipse
            cx="434"
            cy="900"
            rx="24"
            ry="10"
            fill="url(#arch-chromeH)"
            transform="rotate(15 434 900)"
          />
          <path
            d="M 345 904 L 355 898 L 355 910 Z"
            fill="url(#arch-chromeV)"
          />
          <path
            d="M 455 904 L 445 898 L 445 910 Z"
            fill="url(#arch-chromeV)"
          />
          <ellipse
            cx="400"
            cy="853"
            rx="10"
            ry="12"
            fill="url(#arch-redGem)"
            stroke="#880000"
            strokeWidth="1.5"
          />
          <ellipse
            cx="397"
            cy="849"
            rx="3.5"
            ry="4"
            fill="rgba(255,180,180,0.6)"
          />
          <circle cx="360" cy="890" r="6" fill="url(#arch-redGemSm)" />
          <circle cx="440" cy="890" r="6" fill="url(#arch-redGemSm)" />
          <circle
            cx="400"
            cy="906"
            r="20"
            fill="url(#arch-yellowGem)"
            stroke="#9B7000"
            strokeWidth="2"
          />
          <ellipse
            cx="394"
            cy="899"
            rx="7"
            ry="9"
            fill="rgba(255,255,200,0.55)"
          />
          <circle
            cx="400"
            cy="906"
            r="24"
            fill="none"
            stroke="url(#arch-chromeH)"
            strokeWidth="4"
          />
        </svg>
      </div>
    </div>
  );
}

export default JukeboxShell;
