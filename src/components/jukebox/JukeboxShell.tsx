/**
 * JukeboxShell
 *
 * Decorative jukebox casing that hosts three swappable UI components.
 * Drop your components in via props — the SVG shell is purely presentational.
 *
 * Slot layout (top -> bottom):
 *   1. recordPlayer  — the large arch opening (spinning record visualiser, etc.)
 *   2. songRolodex   — the glass display window (song-selection rolodex / carousel)
 *   3. songQueue     — the tall lower panel (queue list, history, etc.)
 *
 * Usage:
 *   <JukeboxShell
 *     recordPlayer={<MySpinningRecord />}
 *     songRolodex={<MyRolodex />}
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
}

interface JukeboxShellProps {
  recordPlayer?: React.ReactNode;
  songRolodex?: React.ReactNode;
  songQueue?: React.ReactNode;
}

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
// All x/y/w/h values are in the SVG's viewBox units (0 0 800 1220).
// We convert to percentages so the layout scales with any container size.
// ---------------------------------------------------------------------------
const VB_W = 800;
const VB_H = 1220;

function SlotOverlay({
  x,
  y,
  w,
  h,
  children,
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
  songQueue = <SlotPlaceholder label="Song Queue" />,
}: JukeboxShellProps): React.ReactElement {
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
            Spans full arch outer width x=108->692, top y=455 -> base y=1105 */}
        <rect
          x="108"
          y="455"
          width="584"
          height="650"
          rx="14"
          fill="url(#jb-woodMain)"
        />

        {/* -- BASE PLINTH -- */}
        <rect
          x="100"
          y="1102"
          width="600"
          height="55"
          rx="14"
          fill="url(#jb-woodBase)"
        />

        {/* -- FEET -- */}
        <rect x="120" y="1132" width="52" height="46" rx="12" fill="#100604" />
        <rect x="196" y="1132" width="52" height="46" rx="12" fill="#100604" />
        <rect x="552" y="1132" width="52" height="46" rx="12" fill="#100604" />
        <rect x="628" y="1132" width="52" height="46" rx="12" fill="#100604" />

        {/* -- ILLUMINATED SIDE COLUMNS (full cabinet height) -- */}
        <rect
          x="196"
          y="455"
          width="36"
          height="646"
          rx="5"
          fill="url(#jb-colGlow)"
        />
        <rect
          x="568"
          y="455"
          width="36"
          height="646"
          rx="5"
          fill="url(#jb-colGlowR)"
        />

        {/* Column base caps */}
        <rect
          x="190"
          y="1078"
          width="48"
          height="20"
          rx="4"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="562"
          y="1078"
          width="48"
          height="20"
          rx="4"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="190"
          y="1062"
          width="48"
          height="16"
          rx="3"
          fill="url(#jb-woodColumn)"
        />
        <rect
          x="562"
          y="1062"
          width="48"
          height="16"
          rx="3"
          fill="url(#jb-woodColumn)"
        />
        <rect
          x="185"
          y="1042"
          width="58"
          height="20"
          rx="5"
          fill="url(#jb-woodColumn)"
        />
        <rect
          x="557"
          y="1042"
          width="58"
          height="20"
          rx="5"
          fill="url(#jb-woodColumn)"
        />

        {/* -- MAIN ARCH TUBE -- */}
        <path
          fillRule="evenodd"
          fill="url(#jb-archPeach)"
          d="M 110 522 L 110 312 A 290 254 0 0 1 690 312 L 690 522 Z
             M 192 522 L 192 364 A 208 246 0 0 1 608 364 L 608 522 Z"
        />
        {/* Arch interior (dark -- record player slot sits above this) */}
        <path
          fill="url(#jb-archInterior)"
          d="M 192 522 L 192 364 A 208 246 0 0 1 608 364 L 608 522 Z"
        />
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
          d="M 110 522 L 110 312 A 290 254 0 0 1 690 312 L 690 522"
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

        {/* -- TITLE BAR -- */}
        <rect x="296" y="403" width="208" height="20" rx="5" fill="#1E0C04" />
        <rect x="300" y="406" width="200" height="14" rx="3" fill="#4A3010" />
        <circle cx="320" cy="413" r="4" fill="#C89040" />
        <circle cx="340" cy="413" r="4" fill="#C89040" />

        {/* -- SONG ROLODEX SLOT -- glass display window bezel
            Slot covers: x=250 y=433 w=300 h=106
            The chrome bezel is drawn here; the slot overlay sits inside it. */}
        <rect
          x="240"
          y="425"
          width="320"
          height="122"
          rx="7"
          fill="url(#jb-chromeH)"
        />
        {/* Slot background (replaced by SongRolodex component) */}
        <rect
          x="250"
          y="433"
          width="300"
          height="106"
          rx="5"
          fill="url(#jb-displayBg)"
        />
        {/* Corner indicator lights */}
        <rect
          x="244"
          y="428"
          width="8"
          height="28"
          rx="2"
          fill="url(#jb-redGemSm)"
        />
        <rect
          x="548"
          y="428"
          width="8"
          height="28"
          rx="2"
          fill="url(#jb-redGemSm)"
        />

        {/* -- SELECTOR BUTTON PANEL -- */}
        <rect
          x="240"
          y="553"
          width="320"
          height="56"
          rx="7"
          fill="url(#jb-metalPanel)"
        />
        <rect
          x="240"
          y="553"
          width="320"
          height="5"
          rx="2"
          fill="url(#jb-chromeH)"
          opacity="0.7"
        />
        <rect
          x="240"
          y="604"
          width="320"
          height="5"
          rx="2"
          fill="url(#jb-chromeH)"
          opacity="0.5"
        />
        <circle cx="267" cy="581" r="9" fill="url(#jb-redGem)" />
        <circle cx="291" cy="581" r="8.5" fill="url(#jb-orangeBtn)" />
        <circle cx="315" cy="581" r="8.5" fill="url(#jb-orangeBtn)" />
        <circle cx="339" cy="581" r="8.5" fill="url(#jb-orangeBtn)" />
        <circle cx="363" cy="581" r="8.5" fill="url(#jb-orangeBtn)" />
        <circle cx="387" cy="581" r="8.5" fill="url(#jb-orangeBtn)" />
        <circle cx="411" cy="581" r="8.5" fill="url(#jb-orangeBtn)" />
        <circle cx="435" cy="581" r="8.5" fill="url(#jb-orangeBtn)" />
        <circle cx="459" cy="581" r="8.5" fill="url(#jb-orangeBtn)" />
        <circle cx="483" cy="581" r="8.5" fill="url(#jb-orangeBtn)" />
        <circle cx="507" cy="581" r="8.5" fill="url(#jb-orangeBtn)" />
        <circle cx="531" cy="581" r="9" fill="url(#jb-redGem)" />

        {/* -- SONG QUEUE SLOT -- chrome-bezelled panel
            Slot covers: x=148 y=626 w=504 h=362  */}
        <rect
          x="140"
          y="614"
          width="520"
          height="390"
          rx="9"
          fill="url(#jb-chromeH)"
        />
        <rect
          x="148"
          y="622"
          width="504"
          height="374"
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
          y="990"
          width="504"
          height="4"
          rx="2"
          fill="url(#jb-chromeH)"
          opacity="0.3"
        />

        {/* -- BOTTOM DECORATIVE ARCH (shifted +248px from original) -- */}
        <path
          fillRule="evenodd"
          fill="url(#jb-btmArchPeach)"
          d="M 308 1032 L 308 988  A 92 92 0 0 1 492 988  L 492 1032 Z
             M 328 1032 L 328 996  A 72 72 0 0 1 472 996  L 472 1032 Z"
        />
        <path
          fill="#1A0806"
          d="M 328 1032 L 328 996 A 72 72 0 0 1 472 996 L 472 1032 Z"
        />

        {/* -- DECORATIVE MEDALLION (shifted +248px) -- */}
        <circle cx="400" cy="1044" r="55" fill="url(#jb-chromeH)" />
        <circle cx="400" cy="1044" r="44" fill="#1A0806" />
        <path
          d="M 400 989 L 392 1008 L 400 1004 L 408 1008 Z"
          fill="url(#jb-chromeV)"
        />
        <ellipse
          cx="366"
          cy="1040"
          rx="24"
          ry="10"
          fill="url(#jb-chromeH)"
          transform="rotate(-15 366 1040)"
        />
        <ellipse
          cx="434"
          cy="1040"
          rx="24"
          ry="10"
          fill="url(#jb-chromeH)"
          transform="rotate(15 434 1040)"
        />
        <path
          d="M 345 1044 L 355 1038 L 355 1050 Z"
          fill="url(#jb-chromeV)"
        />
        <path
          d="M 455 1044 L 445 1038 L 445 1050 Z"
          fill="url(#jb-chromeV)"
        />
        <ellipse
          cx="400"
          cy="993"
          rx="10"
          ry="12"
          fill="url(#jb-redGem)"
          stroke="#880000"
          strokeWidth="1.5"
        />
        <ellipse
          cx="397"
          cy="989"
          rx="3.5"
          ry="4"
          fill="rgba(255,180,180,0.6)"
        />
        <circle cx="360" cy="1030" r="6" fill="url(#jb-redGemSm)" />
        <circle cx="440" cy="1030" r="6" fill="url(#jb-redGemSm)" />
        <circle
          cx="400"
          cy="1046"
          r="20"
          fill="url(#jb-yellowGem)"
          stroke="#9B7000"
          strokeWidth="2"
        />
        <ellipse
          cx="394"
          cy="1039"
          rx="7"
          ry="9"
          fill="rgba(255,255,200,0.55)"
        />
        <circle
          cx="400"
          cy="1046"
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
        <rect
          x="108"
          y="1098"
          width="584"
          height="8"
          rx="3"
          fill="url(#jb-chromeH)"
          opacity="0.5"
        />

        {/* Base centre knob */}
        <circle cx="400" cy="1118" r="9" fill="url(#jb-chromeV)" />
        <circle cx="400" cy="1118" r="5" fill="#1A0808" />
      </svg>

      {/* ================================================================
          SLOT 1 -- RECORD PLAYER
          Positioned inside the arch interior opening.
          The arch inner curve peaks at ~y=276; the opening runs to y=522.
          Slot box: x=205 y=285 w=390 h=140 (in SVG coords)
          Reduced height to avoid overlapping the song rolodex slot below.
          ================================================================ */}
      <SlotOverlay x={205} y={285} w={390} h={140}>
        {recordPlayer}
      </SlotOverlay>

      {/* ================================================================
          SLOT 2 -- SONG ROLODEX
          Positioned over the glass display window (inside chrome bezel).
          Extended to include navigation buttons area below.
          Slot box: x=250 y=433 w=300 h={106+60} (in SVG coords)
          ================================================================ */}
      <SlotOverlay x={250} y={433} w={300} h={166}>
        {songRolodex}
      </SlotOverlay>

      {/* ================================================================
          SLOT 3 -- SONG QUEUE
          Positioned inside the large lower panel bezel.
          Slot box: x=148 y=622 w=504 h=374 (in SVG coords)
          ================================================================ */}
      <SlotOverlay x={148} y={622} w={504} h={374}>
        {songQueue}
      </SlotOverlay>
    </div>
  );
}

export default JukeboxShell;
