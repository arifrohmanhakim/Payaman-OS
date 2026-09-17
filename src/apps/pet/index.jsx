import { useState } from 'react'
import { PET_SPECIES, PET_TREATS, PET_TOYS } from './petData.js'
import { PetSpriteGraphics } from './PetSprites.jsx'
import { useDesktopPet } from './useDesktopPet.js'

export default function DesktopPetApp() {
  const {
    petState,
    currentSpecies,
    setPetId,
    toggleVisibility,
    toggleAutoWander,
    toggleSoundEffects,
    feedPet,
    playWithPet,
    toggleSleep,
    patPet,
  } = useDesktopPet()

  const [activeTab, setActiveTab] = useState('care') // 'care' | 'species' | 'settings'

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg)] text-[var(--os-fg)] font-mono text-xs select-none">
      {/* Top Pet Hero Showcase Banner */}
      <div className="p-3.5 border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-16 h-16 border-2 border-[var(--os-border)] bg-[var(--os-fg)]/5 flex items-center justify-center p-1 shrink-0 shadow-[2px_2px_0px_var(--os-shadow)]">
            <PetSpriteGraphics
              species={petState.petId}
              state={petState.actionState}
              className="w-14 h-14 text-[var(--os-fg)]"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black tracking-tight truncate">
                {currentSpecies.name}
              </h2>
              <span className="text-[10px] px-1.5 py-0.2 border border-[var(--os-border)] font-bold bg-[var(--os-fg)]/10">
                {petState.actionState.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] opacity-70 mt-0.5 truncate">
              {currentSpecies.subtitle}
            </p>
            <p className="text-[10px] opacity-50 mt-0.5">
              Favorite: {currentSpecies.favoriteFood}
            </p>
          </div>
        </div>

        {/* Quick Cuddle Action */}
        <button
          type="button"
          onClick={patPet}
          className="px-3 py-1.5 bg-[var(--os-fg)] text-[var(--os-bg)] font-bold text-xs hover:opacity-90 active:scale-95 border border-[var(--os-border)] shrink-0 shadow-[2px_2px_0px_var(--os-shadow)] cursor-pointer"
        >
          ❤️ Pet Me!
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[11px]">
        {[
          { id: 'care', label: '🐾 Pet Care' },
          { id: 'species', label: '🐶 Species Chooser' },
          { id: 'settings', label: '⚙️ Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 px-2 font-bold text-center border-r last:border-r-0 border-[var(--os-border)] cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[var(--os-bg)]">
        {/* Tab 1: Pet Care & Interaction */}
        {activeTab === 'care' && (
          <div className="space-y-3.5">
            {/* Status Vitals Progress Bars */}
            <div className="border-2 border-[var(--os-border)] p-3 bg-[var(--os-bg)] space-y-2.5 shadow-[2px_2px_0px_var(--os-shadow)]">
              <div className="text-[10px] uppercase font-black tracking-wider opacity-60">
                Companion Vitals &amp; Mood
              </div>

              {/* Happiness */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold">Happiness &amp; Affection</span>
                  <span className="font-mono font-bold">{petState.happiness}%</span>
                </div>
                <div className="h-2.5 w-full border border-[var(--os-border)] bg-[var(--os-bg)] p-0.5">
                  <div
                    className="h-full bg-[var(--os-fg)] transition-all duration-300"
                    style={{ width: `${petState.happiness}%` }}
                  />
                </div>
              </div>

              {/* Hunger */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold">Fullness / Satiation</span>
                  <span className="font-mono font-bold">{petState.hunger}%</span>
                </div>
                <div className="h-2.5 w-full border border-[var(--os-border)] bg-[var(--os-bg)] p-0.5">
                  <div
                    className="h-full bg-[var(--os-fg)] transition-all duration-300"
                    style={{ width: `${petState.hunger}%` }}
                  />
                </div>
              </div>

              {/* Energy */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold">Energy Level</span>
                  <span className="font-mono font-bold">{petState.energy}%</span>
                </div>
                <div className="h-2.5 w-full border border-[var(--os-border)] bg-[var(--os-bg)] p-0.5">
                  <div
                    className="h-full bg-[var(--os-fg)] transition-all duration-300"
                    style={{ width: `${petState.energy}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Treats Box */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                Feed Tasty Treats
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {PET_TREATS.map((treat) => (
                  <button
                    key={treat.id}
                    type="button"
                    onClick={() => feedPet(treat)}
                    className="p-2 border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 text-left transition-colors cursor-pointer shadow-[1px_1px_0px_var(--os-shadow)]"
                  >
                    <div className="text-base">{treat.icon}</div>
                    <div className="font-bold text-[11px] truncate mt-0.5">{treat.name}</div>
                    <div className="text-[9px] opacity-60">+{treat.nutrition} Fullness</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Play Toys Box */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                Play With Toys
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PET_TOYS.map((toy) => (
                  <button
                    key={toy.id}
                    type="button"
                    onClick={() => playWithPet(toy)}
                    className="p-2 border border-[var(--os-border)] bg-[var(--os-bg)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 text-center transition-colors cursor-pointer shadow-[1px_1px_0px_var(--os-shadow)]"
                  >
                    <div className="text-base">{toy.icon}</div>
                    <div className="font-bold text-[10px] truncate mt-0.5">{toy.name}</div>
                    <div className="text-[9px] opacity-60">+{toy.fun} Fun</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rest / Sleep Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={toggleSleep}
                className="w-full py-2 border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] font-bold text-xs hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 transition-all shadow-[2px_2px_0px_var(--os-shadow)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{petState.actionState === 'sleeping' ? '☀️ Wake Up Pet' : '💤 Put Pet to Sleep'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Species Chooser */}
        {activeTab === 'species' && (
          <div className="space-y-2.5">
            <div className="text-[11px] opacity-75">
              Select your favorite animated desktop companion:
            </div>

            <div className="space-y-2">
              {PET_SPECIES.map((species) => {
                const isSelected = petState.petId === species.id
                return (
                  <div
                    key={species.id}
                    onClick={() => setPetId(species.id)}
                    className={`border-2 border-[var(--os-border)] p-2.5 flex items-center justify-between cursor-pointer transition-all shadow-[2px_2px_0px_var(--os-shadow)] ${
                      isSelected
                        ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                        : 'bg-[var(--os-bg)] hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 border border-current flex items-center justify-center p-0.5 shrink-0 bg-transparent">
                        <PetSpriteGraphics
                          species={species.id}
                          className="w-10 h-10"
                        />
                      </div>
                      <div>
                        <div className="font-black text-xs flex items-center gap-1.5">
                          <span>{species.name}</span>
                          <span className="text-sm">{species.icon}</span>
                        </div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          {species.subtitle}
                        </div>
                        <div className="text-[9px] opacity-65">
                          Fav: {species.favoriteFood}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {isSelected ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 border border-current">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold opacity-70">
                          Choose ↵
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="border border-[var(--os-border)] p-3 bg-[var(--os-bg)] space-y-3 shadow-[1px_1px_0px_var(--os-shadow)]">
              <div className="text-[11px] font-black uppercase tracking-wider opacity-70">
                Desktop Behavior Controls
              </div>

              {/* Toggle Desktop Sprite */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs">Show Pet on Desktop</div>
                  <div className="text-[10px] opacity-60">
                    Display floating interactive pet sprite
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleVisibility()}
                  className={`px-3 py-1 font-bold text-xs border border-[var(--os-border)] cursor-pointer ${
                    petState.isVisible
                      ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                      : 'bg-[var(--os-bg)] text-[var(--os-fg)] opacity-50'
                  }`}
                >
                  {petState.isVisible ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Toggle Auto Wander */}
              <div className="flex items-center justify-between border-t border-[var(--os-border)]/40 pt-2.5">
                <div>
                  <div className="font-bold text-xs">Auto-Wandering</div>
                  <div className="text-[10px] opacity-60">
                    Allow companion to walk around the desktop
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleAutoWander}
                  className={`px-3 py-1 font-bold text-xs border border-[var(--os-border)] cursor-pointer ${
                    petState.autoWander
                      ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                      : 'bg-[var(--os-bg)] text-[var(--os-fg)] opacity-50'
                  }`}
                >
                  {petState.autoWander ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Toggle Sound FX */}
              <div className="flex items-center justify-between border-t border-[var(--os-border)]/40 pt-2.5">
                <div>
                  <div className="font-bold text-xs">Sound Effects &amp; Chimes</div>
                  <div className="text-[10px] opacity-60">
                    Play cute chiptune barks and purrs
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleSoundEffects}
                  className={`px-3 py-1 font-bold text-xs border border-[var(--os-border)] cursor-pointer ${
                    petState.soundEffects
                      ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                      : 'bg-[var(--os-bg)] text-[var(--os-fg)] opacity-50'
                  }`}
                >
                  {petState.soundEffects ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Hint Note */}
            <div className="p-2.5 border border-dashed border-[var(--os-border)] text-[10px] opacity-75 bg-[var(--os-fg)]/5">
              💡 <strong>Pro-tip:</strong> You can also access pet controls directly from the top menu bar icon anytime!
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1 border-t-2 border-[var(--os-border)] bg-[var(--os-bg)] flex justify-between items-center text-[10px] opacity-70">
        <span>Desktop Pet Companion • Payaman OS</span>
        <span>Version 1.0</span>
      </div>
    </div>
  )
}
