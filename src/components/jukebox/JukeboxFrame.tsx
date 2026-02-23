// src/components/jukebox/JukeboxFrame.tsx
import { ArchFrame } from "./ArchFrame";
import { PanelFrame } from "./PanelFrame";
import { BaseFrame } from "./BaseFrame";

type Props = {
  wurlitzer: React.ReactNode;
  rolodex: React.ReactNode;
  wizard: React.ReactNode;
  queue?: React.ReactNode;
};

export function JukeboxFrame({ wurlitzer, rolodex, wizard, queue }: Props) {
  return (
    <div className="mx-auto w-full max-w-[500px]">
      {/* Outer jukebox shell */}
      <div className="rounded-t-[140px] bg-gradient-to-b from-[#D4A574] via-[#5C3D2E] to-neutral-900 p-1 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
        {/* Top arch section - Wurlitzer */}
        <ArchFrame className="h-[260px]">
          {wurlitzer}
        </ArchFrame>

        {/* Middle section - Rolodex song picker */}
        <div className="mt-3">
          <PanelFrame className="min-h-[200px]">
            {rolodex}
          </PanelFrame>
        </div>

        {/* Bottom section - Sign-up wizard */}
        <div className="mt-3">
          <BaseFrame className="min-h-[120px]">
            {wizard}
          </BaseFrame>
        </div>

        {/* Optional queue display */}
        {queue && (
          <div className="mt-3">
            <BaseFrame className="min-h-[100px]">
              {queue}
            </BaseFrame>
          </div>
        )}
      </div>

      {/* Jukebox base */}
      <div className="h-8 rounded-b-xl bg-gradient-to-b from-neutral-800 to-neutral-950 shadow-lg" />
    </div>
  );
}
