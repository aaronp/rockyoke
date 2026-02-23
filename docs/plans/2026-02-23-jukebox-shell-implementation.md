# JukeboxShell Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace JukeboxFrame with JukeboxShell SVG component and integrate queue display into SignUpWizard.

**Architecture:** Convert JukeboxShell.jsx to TypeScript, update Jukebox page to use new slots (recordPlayer, songRolodex, songQueue), add queue prop to SignUpWizard for inline display, delete old frame components.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion

---

### Task 1: Convert JukeboxShell to TypeScript

**Files:**
- Create: `src/components/jukebox/JukeboxShell.tsx`
- Reference: `src/JukeboxShell.jsx`

**Step 1: Create the TypeScript version**

Create `src/components/jukebox/JukeboxShell.tsx` with the following content:

```tsx
// src/components/jukebox/JukeboxShell.tsx

type Props = {
  recordPlayer?: React.ReactNode;
  songRolodex?: React.ReactNode;
  songQueue?: React.ReactNode;
};

function SlotPlaceholder({ label }: { label: string }) {
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

const VB_W = 800;
const VB_H = 1220;

function SlotOverlay({
  x,
  y,
  w,
  h,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  children: React.ReactNode;
}) {
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

export function JukeboxShell({
  recordPlayer = <SlotPlaceholder label="Record Player" />,
  songRolodex = <SlotPlaceholder label="Song Rolodex" />,
  songQueue = <SlotPlaceholder label="Song Queue" />,
}: Props) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 800 }}>
      {/* Aspect-ratio spacer (800 : 1220) */}
      <div style={{ paddingBottom: `${(VB_H / VB_W) * 100}%` }} />

      {/* SVG decorative shell */}
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
          {/* ARCH PEACH GLOW */}
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

          {/* WOOD */}
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

          {/* ILLUMINATED COLUMNS */}
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

          {/* CHROME */}
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

          {/* GEMS */}
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

          {/* DISPLAY WINDOW */}
          <linearGradient id="jb-displayBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C8C090" />
            <stop offset="50%" stopColor="#989060" />
            <stop offset="100%" stopColor="#686038" />
          </linearGradient>

          {/* BOTTOM ARCH */}
          <linearGradient id="jb-btmArchPeach" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6A3010" />
            <stop offset="25%" stopColor="#D89040" />
            <stop offset="50%" stopColor="#FFD888" />
            <stop offset="75%" stopColor="#D89040" />
            <stop offset="100%" stopColor="#6A3010" />
          </linearGradient>

          {/* ARCH INTERIOR */}
          <radialGradient id="jb-archInterior" cx="50%" cy="85%" r="60%">
            <stop offset="0%" stopColor="#3A1808" />
            <stop offset="100%" stopColor="#0A0402" />
          </radialGradient>

          {/* SONG QUEUE FRAME */}
          <linearGradient id="jb-queueBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1A0C04" />
            <stop offset="100%" stopColor="#0E0602" />
          </linearGradient>

          {/* SELECTOR PANEL */}
          <linearGradient id="jb-metalPanel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3C1C0A" />
            <stop offset="40%" stopColor="#2A1208" />
            <stop offset="100%" stopColor="#1A0806" />
          </linearGradient>

          {/* ORANGE BUTTON */}
          <radialGradient id="jb-orangeBtn" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFE080" />
            <stop offset="50%" stopColor="#E87010" />
            <stop offset="100%" stopColor="#7A3800" />
          </radialGradient>
        </defs>

        {/* CABINET BODY */}
        <rect x="108" y="455" width="584" height="650" rx="14" fill="url(#jb-woodMain)" />

        {/* BASE PLINTH */}
        <rect x="100" y="1102" width="600" height="55" rx="14" fill="url(#jb-woodBase)" />

        {/* FEET */}
        <rect x="120" y="1132" width="52" height="46" rx="12" fill="#100604" />
        <rect x="196" y="1132" width="52" height="46" rx="12" fill="#100604" />
        <rect x="552" y="1132" width="52" height="46" rx="12" fill="#100604" />
        <rect x="628" y="1132" width="52" height="46" rx="12" fill="#100604" />

        {/* ILLUMINATED SIDE COLUMNS */}
        <rect x="196" y="455" width="36" height="646" rx="5" fill="url(#jb-colGlow)" />
        <rect x="568" y="455" width="36" height="646" rx="5" fill="url(#jb-colGlowR)" />

        {/* Column base caps */}
        <rect x="190" y="1078" width="48" height="20" rx="4" fill="url(#jb-chromeH)" />
        <rect x="562" y="1078" width="48" height="20" rx="4" fill="url(#jb-chromeH)" />
        <rect x="190" y="1062" width="48" height="16" rx="3" fill="url(#jb-woodColumn)" />
        <rect x="562" y="1062" width="48" height="16" rx="3" fill="url(#jb-woodColumn)" />
        <rect x="185" y="1042" width="58" height="20" rx="5" fill="url(#jb-woodColumn)" />
        <rect x="557" y="1042" width="58" height="20" rx="5" fill="url(#jb-woodColumn)" />

        {/* MAIN ARCH TUBE */}
        <path
          fillRule="evenodd"
          fill="url(#jb-archPeach)"
          d="M 110 522 L 110 312 A 290 254 0 0 1 690 312 L 690 522 Z
             M 192 522 L 192 364 A 208 246 0 0 1 608 364 L 608 522 Z"
        />
        <path fill="url(#jb-archInterior)" d="M 192 522 L 192 364 A 208 246 0 0 1 608 364 L 608 522 Z" />
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

        {/* LEFT FIN STACKS */}
        <rect x="108" y="354" width="86" height="20" rx="5" fill="url(#jb-chromeH)" />
        <rect x="118" y="376" width="66" height="14" rx="3" fill="url(#jb-redGem)" />
        <rect x="108" y="392" width="86" height="16" rx="4" fill="url(#jb-chromeH)" />
        <rect x="118" y="410" width="66" height="14" rx="3" fill="url(#jb-redGem)" />
        <rect x="108" y="426" width="86" height="16" rx="4" fill="url(#jb-chromeH)" />
        <rect x="118" y="444" width="66" height="14" rx="3" fill="url(#jb-redGem)" />
        <rect x="108" y="460" width="86" height="16" rx="4" fill="url(#jb-chromeH)" />
        <rect x="108" y="478" width="86" height="14" rx="4" fill="url(#jb-chromeHDark)" />
        <rect x="108" y="352" width="12" height="145" rx="3" fill="url(#jb-chromeV)" />
        <rect x="182" y="352" width="12" height="145" rx="3" fill="url(#jb-chromeV)" />

        {/* RIGHT FIN STACKS */}
        <rect x="606" y="354" width="86" height="20" rx="5" fill="url(#jb-chromeH)" />
        <rect x="616" y="376" width="66" height="14" rx="3" fill="url(#jb-redGem)" />
        <rect x="606" y="392" width="86" height="16" rx="4" fill="url(#jb-chromeH)" />
        <rect x="616" y="410" width="66" height="14" rx="3" fill="url(#jb-redGem)" />
        <rect x="606" y="426" width="86" height="16" rx="4" fill="url(#jb-chromeH)" />
        <rect x="616" y="444" width="66" height="14" rx="3" fill="url(#jb-redGem)" />
        <rect x="606" y="460" width="86" height="16" rx="4" fill="url(#jb-chromeH)" />
        <rect x="606" y="478" width="86" height="14" rx="4" fill="url(#jb-chromeHDark)" />
        <rect x="606" y="352" width="12" height="145" rx="3" fill="url(#jb-chromeV)" />
        <rect x="680" y="352" width="12" height="145" rx="3" fill="url(#jb-chromeV)" />

        {/* CHROME CONNECTOR BRACKETS */}
        <rect x="108" y="302" width="96" height="18" rx="5" fill="url(#jb-chromeH)" />
        <rect x="606" y="302" width="86" height="18" rx="5" fill="url(#jb-chromeH)" />

        {/* TITLE BAR */}
        <rect x="296" y="403" width="208" height="20" rx="5" fill="#1E0C04" />
        <rect x="300" y="406" width="200" height="14" rx="3" fill="#4A3010" />
        <circle cx="320" cy="413" r="4" fill="#C89040" />
        <circle cx="340" cy="413" r="4" fill="#C89040" />

        {/* SONG ROLODEX SLOT bezel */}
        <rect x="240" y="425" width="320" height="122" rx="7" fill="url(#jb-chromeH)" />
        <rect x="250" y="433" width="300" height="106" rx="5" fill="url(#jb-displayBg)" />
        <rect x="244" y="428" width="8" height="28" rx="2" fill="url(#jb-redGemSm)" />
        <rect x="548" y="428" width="8" height="28" rx="2" fill="url(#jb-redGemSm)" />

        {/* SELECTOR BUTTON PANEL */}
        <rect x="240" y="553" width="320" height="56" rx="7" fill="url(#jb-metalPanel)" />
        <rect x="240" y="553" width="320" height="5" rx="2" fill="url(#jb-chromeH)" opacity="0.7" />
        <rect x="240" y="604" width="320" height="5" rx="2" fill="url(#jb-chromeH)" opacity="0.5" />
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

        {/* SONG QUEUE SLOT bezel */}
        <rect x="140" y="614" width="520" height="390" rx="9" fill="url(#jb-chromeH)" />
        <rect x="148" y="622" width="504" height="374" rx="7" fill="url(#jb-queueBg)" />
        <rect x="148" y="622" width="504" height="6" rx="3" fill="url(#jb-chromeH)" opacity="0.3" />
        <rect x="148" y="990" width="504" height="4" rx="2" fill="url(#jb-chromeH)" opacity="0.3" />

        {/* BOTTOM DECORATIVE ARCH */}
        <path
          fillRule="evenodd"
          fill="url(#jb-btmArchPeach)"
          d="M 308 1032 L 308 988  A 92 92 0 0 1 492 988  L 492 1032 Z
             M 328 1032 L 328 996  A 72 72 0 0 1 472 996  L 472 1032 Z"
        />
        <path fill="#1A0806" d="M 328 1032 L 328 996 A 72 72 0 0 1 472 996 L 472 1032 Z" />

        {/* DECORATIVE MEDALLION */}
        <circle cx="400" cy="1044" r="55" fill="url(#jb-chromeH)" />
        <circle cx="400" cy="1044" r="44" fill="#1A0806" />
        <path d="M 400 989 L 392 1008 L 400 1004 L 408 1008 Z" fill="url(#jb-chromeV)" />
        <ellipse cx="366" cy="1040" rx="24" ry="10" fill="url(#jb-chromeH)" transform="rotate(-15 366 1040)" />
        <ellipse cx="434" cy="1040" rx="24" ry="10" fill="url(#jb-chromeH)" transform="rotate(15 434 1040)" />
        <path d="M 345 1044 L 355 1038 L 355 1050 Z" fill="url(#jb-chromeV)" />
        <path d="M 455 1044 L 445 1038 L 445 1050 Z" fill="url(#jb-chromeV)" />
        <ellipse cx="400" cy="993" rx="10" ry="12" fill="url(#jb-redGem)" stroke="#880000" strokeWidth="1.5" />
        <ellipse cx="397" cy="989" rx="3.5" ry="4" fill="rgba(255,180,180,0.6)" />
        <circle cx="360" cy="1030" r="6" fill="url(#jb-redGemSm)" />
        <circle cx="440" cy="1030" r="6" fill="url(#jb-redGemSm)" />
        <circle cx="400" cy="1046" r="20" fill="url(#jb-yellowGem)" stroke="#9B7000" strokeWidth="2" />
        <ellipse cx="394" cy="1039" rx="7" ry="9" fill="rgba(255,255,200,0.55)" />
        <circle cx="400" cy="1046" r="24" fill="none" stroke="url(#jb-chromeH)" strokeWidth="4" />

        {/* TOP CHROME FINIAL */}
        <rect x="391" y="72" width="18" height="58" rx="5" fill="url(#jb-chromeV)" />
        <rect x="356" y="90" width="88" height="18" rx="5" fill="url(#jb-chromeH)" />
        <rect x="368" y="112" width="64" height="10" rx="3" fill="url(#jb-chromeHDark)" />
        <rect x="374" y="124" width="52" height="8" rx="3" fill="url(#jb-chromeHDark)" />
        <ellipse cx="400" cy="61" rx="19" ry="23" fill="url(#jb-redGem)" stroke="#660000" strokeWidth="2" />
        <ellipse cx="395" cy="54" rx="6" ry="9" fill="rgba(255,160,160,0.6)" />
        <rect x="348" y="83" width="16" height="30" rx="4" fill="url(#jb-chromeV)" />
        <rect x="436" y="83" width="16" height="30" rx="4" fill="url(#jb-chromeV)" />
        <circle cx="360" cy="96" r="7" fill="url(#jb-redGem)" />
        <circle cx="440" cy="96" r="7" fill="url(#jb-redGem)" />

        {/* CHROME TRIM STRIPS */}
        <rect x="108" y="452" width="584" height="10" rx="4" fill="url(#jb-chromeH)" opacity="0.6" />
        <rect x="108" y="1098" width="584" height="8" rx="3" fill="url(#jb-chromeH)" opacity="0.5" />

        {/* Base centre knob */}
        <circle cx="400" cy="1118" r="9" fill="url(#jb-chromeV)" />
        <circle cx="400" cy="1118" r="5" fill="#1A0808" />
      </svg>

      {/* SLOT 1 — RECORD PLAYER */}
      <SlotOverlay x={205} y={285} w={390} h={232}>
        {recordPlayer}
      </SlotOverlay>

      {/* SLOT 2 — SONG ROLODEX */}
      <SlotOverlay x={250} y={433} w={300} h={106}>
        {songRolodex}
      </SlotOverlay>

      {/* SLOT 3 — SONG QUEUE */}
      <SlotOverlay x={148} y={622} w={504} h={374}>
        {songQueue}
      </SlotOverlay>
    </div>
  );
}
```

**Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/components/jukebox/JukeboxShell.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/jukebox/JukeboxShell.tsx
git commit -m "feat: add JukeboxShell TypeScript component"
```

---

### Task 2: Add queue prop to SignUpWizard

**Files:**
- Modify: `src/components/jukebox/SignUpWizard.tsx`

**Step 1: Update Props type to include queue**

In `src/components/jukebox/SignUpWizard.tsx`, update the Props type:

```tsx
import type { WizardState, Song, QueueEntry } from "@/types/jukebox";

type Props = {
  wizardState: WizardState;
  selectedSong: Song | null;
  lastEntry: QueueEntry | null;
  onStartSignUp: () => void;
  onSubmitName: (name: string) => void;
  onSubmitPayment: () => void;
  onReset: () => void;
  queue: QueueEntry[];  // NEW
};
```

**Step 2: Update component to accept queue prop**

Update the function signature:

```tsx
export function SignUpWizard({
  wizardState,
  selectedSong,
  lastEntry,
  onStartSignUp,
  onSubmitName,
  onSubmitPayment,
  onReset,
  queue,  // NEW
}: Props) {
```

**Step 3: Add queue display in idle state**

Replace the idle state section with:

```tsx
{wizardState === "idle" && (
  <WizardPanel key="idle">
    <p className="text-lg text-amber-100">Pick a song to get started!</p>
    {queue.length > 0 && (
      <div className="mt-4 w-full max-w-xs">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          Up Next
        </p>
        <div className="space-y-1 text-left">
          {queue.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 rounded bg-neutral-800/50 px-2 py-1 text-xs"
            >
              <span className="font-mono text-amber-500">{entry.ticketNumber}</span>
              <span className="truncate text-amber-200">{entry.name}</span>
              <span className="ml-auto truncate text-amber-400/60">{entry.song.title}</span>
            </div>
          ))}
          {queue.length > 5 && (
            <p className="text-center text-xs text-amber-400/50">
              +{queue.length - 5} more
            </p>
          )}
        </div>
      </div>
    )}
  </WizardPanel>
)}
```

**Step 4: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/components/jukebox/SignUpWizard.tsx
git commit -m "feat: add queue prop to SignUpWizard for inline display"
```

---

### Task 3: Update Jukebox page to use JukeboxShell

**Files:**
- Modify: `src/pages/Jukebox.tsx`

**Step 1: Update imports**

Replace:
```tsx
import {
  JukeboxFrame,
  Wurlitzer,
  Rolodex,
  SignUpWizard,
  QueueDisplay,
} from "@/components/jukebox";
```

With:
```tsx
import { JukeboxShell } from "@/components/jukebox/JukeboxShell";
import { Wurlitzer } from "@/components/jukebox/Wurlitzer";
import { Rolodex } from "@/components/jukebox/Rolodex";
import { SignUpWizard } from "@/components/jukebox/SignUpWizard";
```

**Step 2: Replace JukeboxFrame with JukeboxShell**

Replace the entire `<JukeboxFrame ... />` component with:

```tsx
<JukeboxShell
  recordPlayer={
    <Wurlitzer
      triggerPlay={shouldTriggerPlay}
      onPlayComplete={state.onPlayComplete}
      onReset={state.reset}
      showControls={state.wizardState === "idle"}
    />
  }
  songRolodex={
    <Rolodex onSelectSong={state.selectSong} />
  }
  songQueue={
    <SignUpWizard
      wizardState={state.wizardState}
      selectedSong={state.selectedSong}
      lastEntry={state.lastEntry}
      onStartSignUp={state.startSignUp}
      onSubmitName={state.submitName}
      onSubmitPayment={state.submitPayment}
      onReset={state.reset}
      queue={state.queue}
    />
  }
/>
```

**Step 3: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/pages/Jukebox.tsx
git commit -m "feat: switch Jukebox page to use JukeboxShell"
```

---

### Task 4: Update barrel export

**Files:**
- Modify: `src/components/jukebox/index.ts`

**Step 1: Add JukeboxShell export**

Add to the barrel file:
```tsx
export { JukeboxShell } from "./JukeboxShell";
```

**Step 2: Commit**

```bash
git add src/components/jukebox/index.ts
git commit -m "feat: export JukeboxShell from barrel"
```

---

### Task 5: Delete old frame components

**Files:**
- Delete: `src/JukeboxShell.jsx`
- Delete: `src/components/jukebox/JukeboxFrame.tsx`
- Delete: `src/components/jukebox/ArchFrame.tsx`
- Delete: `src/components/jukebox/PanelFrame.tsx`
- Delete: `src/components/jukebox/BaseFrame.tsx`

**Step 1: Remove files**

```bash
rm src/JukeboxShell.jsx
rm src/components/jukebox/JukeboxFrame.tsx
rm src/components/jukebox/ArchFrame.tsx
rm src/components/jukebox/PanelFrame.tsx
rm src/components/jukebox/BaseFrame.tsx
```

**Step 2: Update barrel export to remove old exports**

In `src/components/jukebox/index.ts`, remove:
```tsx
export { JukeboxFrame } from "./JukeboxFrame";
export { ArchFrame } from "./ArchFrame";
export { PanelFrame } from "./PanelFrame";
export { BaseFrame } from "./BaseFrame";
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old frame components"
```

---

### Task 6: Manual verification

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Verify visually**

Open http://localhost:5173/jukebox and verify:
- [ ] Jukebox SVG shell renders with chrome, wood, gems
- [ ] Wurlitzer appears in top arch slot
- [ ] Rolodex appears in middle glass display slot
- [ ] SignUpWizard appears in bottom panel slot
- [ ] Queue entries show inline when in idle state
- [ ] Full sign-up flow works (select song → enter name → Wurlitzer plays → confirmation)

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: adjustments from manual testing"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Convert JukeboxShell to TSX | Create JukeboxShell.tsx |
| 2 | Add queue prop to SignUpWizard | Modify SignUpWizard.tsx |
| 3 | Update Jukebox page | Modify Jukebox.tsx |
| 4 | Update barrel export | Modify index.ts |
| 5 | Delete old components | Remove 5 files |
| 6 | Manual verification | Test in browser |
