export function PetSpriteGraphics({
  species,
  state = 'idle',
  direction = 'right',
  walkStep = 0,
  idleTick = 0,
  className = 'w-12 h-12',
}) {
  const isFlipped = direction === 'left'
  const stepMod = walkStep % 4
  const idleMod = idleTick % 4

  const renderSprite = () => {
    switch (species) {
      case 'cat': {
        // --- 1. NEKO CAT (32x32 High-Readability Retro Pixel Art) ---
        if (state === 'sleeping') {
          return (
            <g>
              {/* White Solid Body (Loaf) */}
              <g fill="var(--os-bg)">
                <rect x="5" y="14" width="22" height="11" />
                <rect x="7" y="12" width="18" height="14" />
                <rect x="19" y="10" width="7" height="5" />
                <rect x="3" y="16" width="25" height="8" />
              </g>

              {/* Black Pixel Border & Detail */}
              <g fill="currentColor">
                {/* Body Outline */}
                <rect x="7" y="11" width="12" height="1" />
                <rect x="19" y="9" width="5" height="1" />
                <rect x="24" y="10" width="2" height="1" />
                <rect x="26" y="11" width="2" height="3" />
                <rect x="28" y="14" width="1" height="8" />
                <rect x="27" y="22" width="1" height="2" />
                <rect x="6" y="25" width="21" height="1" />
                <rect x="4" y="24" width="2" height="1" />
                <rect x="2" y="16" width="1" height="8" />
                <rect x="3" y="14" width="2" height="2" />
                <rect x="5" y="12" width="2" height="2" />

                {/* Pointy Cat Ear */}
                <rect x="20" y="6" width="2" height="3" />
                <rect x="22" y="5" width="2" height="2" />
                <rect x="24" y="7" width="1" height="3" />

                {/* Sleeping Eye */}
                <rect x="21" y="14" width="4" height="1" />
                <rect x="20" y="15" width="1" height="1" />
                <rect x="25" y="15" width="1" height="1" />

                {/* Nose & Whiskers */}
                <rect x="27" y="16" width="1" height="1" />
                <rect x="26" y="18" width="3" height="1" />

                {/* Curled Tail Wrapped Around Body */}
                <rect x="2" y="18" width="2" height="2" />
                <rect x="4" y="20" width="6" height="2" />

                {/* Floating Zzz */}
                <rect x="25" y="4" width="4" height="1" />
                <rect x="27" y="5" width="2" height="1" />
                <rect x="25" y="6" width="4" height="1" />
              </g>
            </g>
          )
        }

        // Active / Walking / Idle Cat (32x32 Side View)
        const tailY = state === 'walking' ? (stepMod < 2 ? 4 : 6) : (idleMod < 2 ? 5 : 7)
        const bodyBob = state === 'walking' && stepMod % 2 === 1 ? -1 : 0

        return (
          <g transform={`translate(0, ${bodyBob})`}>
            {/* White Body Base */}
            <g fill="var(--os-bg)">
              {/* Head */}
              <rect x="18" y="6" width="9" height="10" />
              <rect x="17" y="8" width="11" height="7" />
              <rect x="27" y="10" width="3" height="4" />

              {/* Body */}
              <rect x="6" y="10" width="15" height="10" />
              <rect x="8" y="8" width="12" height="13" />

              {/* Legs */}
              {state === 'walking' ? (
                stepMod === 0 ? (
                  <>
                    <rect x="7" y="20" width="4" height="6" />
                    <rect x="19" y="20" width="4" height="6" />
                  </>
                ) : stepMod === 1 ? (
                  <>
                    <rect x="9" y="20" width="4" height="5" />
                    <rect x="21" y="20" width="4" height="6" />
                  </>
                ) : stepMod === 2 ? (
                  <>
                    <rect x="5" y="20" width="4" height="6" />
                    <rect x="17" y="20" width="4" height="6" />
                  </>
                ) : (
                  <>
                    <rect x="7" y="20" width="4" height="6" />
                    <rect x="19" y="20" width="4" height="5" />
                  </>
                )
              ) : (
                <>
                  <rect x="7" y="20" width="4" height="6" />
                  <rect x="18" y="20" width="4" height="6" />
                </>
              )}
            </g>

            {/* Black Outline & Details */}
            <g fill="currentColor">
              {/* Pointy Ears */}
              <rect x="18" y="2" width="2" height="4" />
              <rect x="20" y="4" width="2" height="3" />
              <rect x="23" y="4" width="2" height="4" />
              <rect x="22" y="2" width="1" height="2" />

              {/* Head Outline */}
              <rect x="19" y="5" width="4" height="1" />
              <rect x="25" y="6" width="3" height="2" />
              <rect x="28" y="8" width="2" height="2" />
              <rect x="30" y="10" width="1" height="4" />
              <rect x="28" y="14" width="2" height="2" />
              <rect x="26" y="16" width="2" height="1" />

              {/* Cat Eye */}
              {state === 'playing' ? (
                <>
                  <rect x="22" y="8" width="4" height="1" />
                  <rect x="24" y="9" width="2" height="1" />
                </>
              ) : (
                <>
                  <rect x="22" y="8" width="3" height="4" />
                  <rect x="22" y="8" width="1" height="1" fill="var(--os-bg)" />
                  <rect x="23" y="11" width="1" height="1" fill="var(--os-bg)" />
                </>
              )}

              {/* Nose & Whiskers */}
              <rect x="29" y="11" width="2" height="1" />
              <rect x="27" y="13" width="3" height="1" />
              <rect x="30" y="12" width="2" height="1" />
              <rect x="30" y="14" width="2" height="1" />

              {/* Back & Chest Line */}
              <rect x="8" y="7" width="10" height="1" />
              <rect x="5" y="8" width="3" height="2" />
              <rect x="4" y="10" width="2" height="8" />
              <rect x="6" y="18" width="2" height="2" />
              <rect x="11" y="19" width="7" height="1" />

              {/* S-Curved Animated Tail */}
              <rect x="4" y={tailY + 4} width="2" height="3" />
              <rect x="2" y={tailY + 2} width="2" height="4" />
              <rect x="1" y={tailY} width="2" height="3" />
              <rect x="2" y={tailY - 1} width="2" height="2" />

              {/* 4 Paws / Step Lines */}
              {state === 'walking' ? (
                stepMod === 0 ? (
                  <>
                    <rect x="6" y="20" width="1" height="6" />
                    <rect x="10" y="20" width="1" height="6" />
                    <rect x="7" y="26" width="4" height="1" />
                    <rect x="18" y="20" width="1" height="6" />
                    <rect x="22" y="20" width="1" height="6" />
                    <rect x="19" y="26" width="4" height="1" />
                  </>
                ) : stepMod === 1 ? (
                  <>
                    <rect x="8" y="20" width="1" height="5" />
                    <rect x="12" y="20" width="1" height="5" />
                    <rect x="9" y="25" width="4" height="1" />
                    <rect x="20" y="20" width="1" height="6" />
                    <rect x="24" y="20" width="1" height="6" />
                    <rect x="21" y="26" width="4" height="1" />
                  </>
                ) : stepMod === 2 ? (
                  <>
                    <rect x="4" y="20" width="1" height="6" />
                    <rect x="8" y="20" width="1" height="6" />
                    <rect x="5" y="26" width="4" height="1" />
                    <rect x="16" y="20" width="1" height="6" />
                    <rect x="20" y="20" width="1" height="6" />
                    <rect x="17" y="26" width="4" height="1" />
                  </>
                ) : (
                  <>
                    <rect x="6" y="20" width="1" height="6" />
                    <rect x="10" y="20" width="1" height="6" />
                    <rect x="7" y="26" width="4" height="1" />
                    <rect x="18" y="20" width="1" height="5" />
                    <rect x="22" y="20" width="1" height="5" />
                    <rect x="19" y="25" width="4" height="1" />
                  </>
                )
              ) : (
                <>
                  <rect x="6" y="20" width="1" height="6" />
                  <rect x="10" y="20" width="1" height="6" />
                  <rect x="7" y="26" width="4" height="1" />
                  <rect x="17" y="20" width="1" height="6" />
                  <rect x="21" y="20" width="1" height="6" />
                  <rect x="18" y="26" width="4" height="1" />
                </>
              )}
            </g>
          </g>
        )
      }

      case 'dog': {
        // --- 2. SHIBA DOG (32x32 High-Readability Retro Pixel Art) ---
        const tailSpin = state === 'walking' || state === 'playing' ? (stepMod % 2 === 0 ? -1 : 1) : (idleMod % 2 === 0 ? 0 : 1)
        const sniffY = state === 'idle' && idleMod === 2 ? 1 : 0

        return (
          <g transform={`translate(0, ${sniffY})`}>
            {/* White Body Base */}
            <g fill="var(--os-bg)">
              <rect x="18" y="6" width="9" height="9" />
              <rect x="26" y="9" width="4" height="5" />
              <rect x="7" y="9" width="14" height="10" />
              <rect x="8" y="7" width="12" height="13" />
              <rect x="7" y="19" width="4" height="7" />
              <rect x="18" y="19" width="4" height="7" />
            </g>

            {/* Black Outline & Features */}
            <g fill="currentColor">
              {/* Pointy Shiba Ears */}
              <rect x="17" y="2" width="2" height="4" />
              <rect x="19" y="1" width="2" height="3" />
              <rect x="21" y="4" width="2" height="3" />

              {/* Head Top & Snout */}
              <rect x="21" y="5" width="6" height="1" />
              <rect x="27" y="6" width="2" height="3" />
              <rect x="29" y="9" width="2" height="3" />
              <rect x="31" y="10" width="1" height="3" />
              <rect x="29" y="13" width="2" height="2" />
              <rect x="27" y="15" width="2" height="1" />

              {/* Black Nose */}
              <rect x="30" y="10" width="2" height="2" />

              {/* Eye & Brow */}
              <rect x="22" y="8" width="3" height="3" />
              <rect x="22" y="8" width="1" height="1" fill="var(--os-bg)" />
              <rect x="21" y="6" width="2" height="1" />

              {/* Playing Tongue */}
              {state === 'playing' && (
                <rect x="28" y="15" width="3" height="2" />
              )}

              {/* Back Line & Chest */}
              <rect x="8" y="7" width="10" height="1" />
              <rect x="5" y="8" width="3" height="2" />
              <rect x="4" y="10" width="2" height="8" />
              <rect x="11" y="18" width="7" height="1" />

              {/* Curly Shiba Tail */}
              <rect x="4" y={5 + tailSpin} width="3" height="3" />
              <rect x="2" y={7 + tailSpin} width="3" height="3" />
              <rect x="5" y={3 + tailSpin} width="4" height="2" />
              <rect x="7" y={5 + tailSpin} width="2" height="2" />

              {/* Trot Legs */}
              {state === 'walking' && stepMod % 2 === 1 ? (
                <>
                  <rect x="6" y="19" width="1" height="6" />
                  <rect x="10" y="19" width="1" height="6" />
                  <rect x="7" y="25" width="4" height="1" />
                  <rect x="20" y="19" width="1" height="7" />
                  <rect x="24" y="19" width="1" height="7" />
                  <rect x="21" y="26" width="4" height="1" />
                </>
              ) : (
                <>
                  <rect x="6" y="19" width="1" height="7" />
                  <rect x="10" y="19" width="1" height="7" />
                  <rect x="7" y="26" width="4" height="1" />
                  <rect x="17" y="19" width="1" height="7" />
                  <rect x="21" y="19" width="1" height="7" />
                  <rect x="18" y="26" width="4" height="1" />
                </>
              )}
            </g>
          </g>
        )
      }

      case 'duck': {
        // --- 3. QUACKY DUCK (32x32 High-Readability Retro Pixel Art) ---
        const waddleTilt = state === 'walking' ? (stepMod % 2 === 0 ? -1 : 1) : 0
        const wingFlap = state === 'playing' || (state === 'walking' && stepMod % 2 === 1) ? -1 : 0

        return (
          <g transform={`rotate(${waddleTilt * 3} 16 16)`}>
            {/* White Body Base */}
            <g fill="var(--os-bg)">
              <rect x="16" y="4" width="9" height="9" />
              <rect x="5" y="11" width="16" height="11" />
              <rect x="7" y="9" width="13" height="13" />
              <rect x="2" y="11" width="4" height="4" />
              <rect x="8" y="22" width="5" height="5" />
              <rect x="15" y="22" width="5" height="5" />
            </g>

            {/* Black Outline & Details */}
            <g fill="currentColor">
              {/* Duck Head */}
              <rect x="16" y="3" width="8" height="1" />
              <rect x="14" y="4" width="2" height="8" />
              <rect x="24" y="4" width="2" height="4" />

              {/* Long Duck Bill */}
              <rect x="24" y="8" width="7" height="3" />
              <rect x="26" y="9" width="4" height="1" fill="var(--os-bg)" />

              {/* Eye */}
              {state === 'sleeping' ? (
                <rect x="19" y="7" width="4" height="1" />
              ) : (
                <>
                  <rect x="19" y="6" width="3" height="3" />
                  <rect x="19" y="6" width="1" height="1" fill="var(--os-bg)" />
                </>
              )}

              {/* Body Outline */}
              <rect x="7" y="9" width="8" height="1" />
              <rect x="4" y="10" width="3" height="2" />
              <rect x="1" y="11" width="3" height="4" />
              <rect x="3" y="15" width="2" height="7" />
              <rect x="5" y="21" width="15" height="1" />
              <rect x="20" y="13" width="2" height="8" />

              {/* Flapping Wing */}
              <rect x="8" y={13 + wingFlap} width="8" height="2" />
              <rect x="7" y={15 + wingFlap} width="7" height="2" />

              {/* Webbed Feet */}
              {state === 'walking' && stepMod % 2 === 1 ? (
                <>
                  <rect x="7" y="22" width="2" height="4" />
                  <rect x="6" y="26" width="6" height="2" />
                  <rect x="16" y="22" width="2" height="3" />
                  <rect x="15" y="25" width="6" height="2" />
                </>
              ) : (
                <>
                  <rect x="8" y="22" width="2" height="4" />
                  <rect x="7" y="26" width="6" height="2" />
                  <rect x="15" y="22" width="2" height="4" />
                  <rect x="14" y="26" width="6" height="2" />
                </>
              )}
            </g>
          </g>
        )
      }

      case 'frog': {
        // --- 4. HOPPER FROG (32x32 High-Readability Retro Pixel Art) ---
        const isLeaping = state === 'walking' && stepMod % 2 === 1
        const leapY = isLeaping ? -3 : 0
        const throatPuff = state === 'idle' && idleMod === 2 ? 2 : 0

        return (
          <g transform={`translate(0, ${leapY})`}>
            {/* White Body Base */}
            <g fill="var(--os-bg)">
              <rect x="18" y="5" width="6" height="6" />
              <rect x="7" y="9" width="18" height="12" />
              <rect x="5" y="11" width="21" height="9" />
              {throatPuff > 0 && <rect x="25" y="14" width="4" height="4" />}
            </g>

            {/* Black Outline & Features */}
            <g fill="currentColor">
              {/* Bulging Eye */}
              <rect x="18" y="4" width="6" height="1" />
              <rect x="16" y="5" width="2" height="5" />
              <rect x="24" y="5" width="2" height="4" />
              <rect x="19" y="6" width="4" height="4" />
              <rect x="19" y="6" width="1" height="1" fill="var(--os-bg)" />

              {/* Head & Wide Mouth */}
              <rect x="24" y="9" width="4" height="2" />
              <rect x="28" y="11" width="2" height="5" />
              <rect x="20" y="15" width="8" height="1" />
              <rect x="26" y="16" width="2" height="2" />

              {/* Arched Frog Back */}
              <rect x="8" y="7" width="9" height="2" />
              <rect x="5" y="9" width="3" height="3" />
              <rect x="3" y="12" width="2" height="7" />

              {/* Legs (Folded vs Leap) */}
              {isLeaping ? (
                <>
                  {/* Extended Back Leg in Leap */}
                  <rect x="1" y="17" width="8" height="2" />
                  <rect x="1" y="19" width="5" height="2" />
                  <rect x="20" y="21" width="2" height="4" />
                  <rect x="20" y="25" width="5" height="2" />
                </>
              ) : (
                <>
                  {/* Folded Z-Legs */}
                  <rect x="5" y="16" width="6" height="2" />
                  <rect x="3" y="18" width="3" height="4" />
                  <rect x="4" y="22" width="8" height="2" />
                  {/* Webbed Foot Base */}
                  <rect x="3" y="24" width="10" height="2" />
                  {/* Front Foot */}
                  <rect x="20" y="19" width="2" height="5" />
                  <rect x="19" y="24" width="6" height="2" />
                </>
              )}
            </g>
          </g>
        )
      }

      case 'hamster':
      default: {
        // --- 5. PUFFY HAMSTER (32x32 High-Readability Retro Pixel Art) ---
        const nibbleTick = (state === 'idle' || state === 'eating') && idleMod % 2 === 0 ? -1 : 0
        const scurryLeg = state === 'walking' ? (stepMod % 2 === 0 ? 1 : -1) : 0

        return (
          <g>
            {/* White Body Base */}
            <g fill="var(--os-bg)">
              <rect x="5" y="9" width="22" height="13" />
              <rect x="7" y="7" width="18" height="16" />
              <rect x="24" y="11" width="4" height="7" />
              <rect x="7" y="22" width="4" height="4" />
              <rect x="19" y="22" width="4" height="4" />
            </g>

            {/* Black Outline & Features */}
            <g fill="currentColor">
              {/* Round Ear */}
              <rect x="15" y="3" width="5" height="1" />
              <rect x="13" y="4" width="2" height="4" />
              <rect x="20" y="4" width="2" height="4" />
              <rect x="16" y="5" width="2" height="2" />

              {/* Head & Puffy Cheek */}
              <rect x="20" y="6" width="5" height="2" />
              <rect x="25" y="8" width="2" height="3" />
              <rect x="27" y="11" width="2" height="5" />
              <rect x="25" y="16" width="3" height="2" />

              {/* Sparkling Eye */}
              {state === 'sleeping' ? (
                <rect x="21" y="11" width="4" height="1" />
              ) : (
                <>
                  <rect x="20" y="9" width="4" height="4" />
                  <rect x="20" y="9" width="2" height="2" fill="var(--os-bg)" />
                  <rect x="23" y="12" width="1" height="1" fill="var(--os-bg)" />
                </>
              )}

              {/* Nose & Whiskers */}
              <rect x="28" y="13" width="2" height="2" />
              <rect x="29" y="15" width="2" height="1" />

              {/* Paws Holding Sunflower Seed */}
              <rect x="22" y={17 + nibbleTick} width="4" height="2" />
              <rect x="23" y={19 + nibbleTick} width="2" height="2" />

              {/* Round Chubby Back & Stub Tail */}
              <rect x="7" y="7" width="8" height="1" />
              <rect x="4" y="8" width="3" height="2" />
              <rect x="2" y="10" width="2" height="9" />
              <rect x="1" y="14" width="2" height="3" />
              <rect x="4" y="19" width="3" height="2" />
              <rect x="6" y="21" width="15" height="1" />

              {/* Tiny Scurrying Feet */}
              <rect x={7 + scurryLeg} y="22" width="1" height="4" />
              <rect x={11 + scurryLeg} y="22" width="1" height="4" />
              <rect x={7 + scurryLeg} y="26" width="5" height="1" />
              <rect x={18 - scurryLeg} y="22" width="1" height="4" />
              <rect x={22 - scurryLeg} y="22" width="1" height="4" />
              <rect x={18 - scurryLeg} y="26" width="5" height="1" />
            </g>
          </g>
        )
      }
    }
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform ${className}`}
      style={{
        transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      <svg
        viewBox="0 0 32 32"
        shapeRendering="crispEdges"
        className="w-full h-full stroke-none overflow-visible"
        aria-hidden="true"
      >
        {renderSprite()}
      </svg>
    </div>
  )
}
