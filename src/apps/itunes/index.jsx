import { useITunes } from './useITunes.js'
import { itunesService } from './itunesService.js'
import AppIconGraphic from '../../components/common/AppIconGraphic.jsx'

function EqualizerBars({ isPlaying }) {
  return (
    <div className="flex items-end gap-0.5 h-3">
      <span
        className={`w-0.5 bg-[var(--os-fg)] ${
          isPlaying ? 'animate-pulse h-3' : 'h-1'
        }`}
      />
      <span
        className={`w-0.5 bg-[var(--os-fg)] ${
          isPlaying ? 'animate-bounce h-2.5' : 'h-1.5'
        }`}
      />
      <span
        className={`w-0.5 bg-[var(--os-fg)] ${
          isPlaying ? 'animate-pulse h-3.5' : 'h-2'
        }`}
      />
      <span
        className={`w-0.5 bg-[var(--os-fg)] ${
          isPlaying ? 'animate-bounce h-2' : 'h-1'
        }`}
      />
    </div>
  )
}

export default function ITunesApp() {
  const {
    genres,
    activeGenreId,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    selectGenre,
    songs,
    isLoading,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    playTrack,
    togglePlayPause,
    handleNextTrack,
    handlePrevTrack,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  } = useITunes()

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg)] text-[var(--os-fg)] font-mono text-xs select-none">
      {/* Top LCD & Control Deck */}
      <div className="p-2.5 border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] flex flex-col md:flex-row items-center gap-3">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrevTrack}
            title="Previous Track"
            className="w-8 h-8 border-2 border-[var(--os-border)] flex items-center justify-center font-bold hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 transition-none cursor-default shadow-[1px_1px_0px_var(--os-shadow)]"
          >
            ◀◀
          </button>
          <button
            type="button"
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-9 h-8 border-2 border-[var(--os-border)] bg-[var(--os-fg)] text-[var(--os-bg)] flex items-center justify-center font-black text-sm hover:opacity-90 active:scale-95 transition-none cursor-default shadow-[1px_1px_0px_var(--os-shadow)]"
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            onClick={handleNextTrack}
            title="Next Track"
            className="w-8 h-8 border-2 border-[var(--os-border)] flex items-center justify-center font-bold hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 transition-none cursor-default shadow-[1px_1px_0px_var(--os-shadow)]"
          >
            ▶▶
          </button>
        </div>

        {/* Vintage LCD Display Window */}
        <div className="flex-1 min-w-0 w-full border-2 border-[var(--os-border)] p-2 bg-[var(--os-bg)] shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {currentTrack ? (
                <>
                  <EqualizerBars isPlaying={isPlaying} />
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate">
                      {currentTrack.title}
                    </div>
                    <div className="text-[10px] opacity-75 truncate">
                      {currentTrack.artist} — {currentTrack.album}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[11px] opacity-60 italic">
                  iTunes • Select a song to start playback
                </div>
              )}
            </div>

            <div className="text-right shrink-0 text-[10px] opacity-80">
              {itunesService.formatSeconds(currentTime)} /{' '}
              {itunesService.formatSeconds(duration || 30)}
            </div>
          </div>

          {/* Seek Progress Bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={duration || 30}
              step="0.5"
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--os-fg)]/20 accent-[var(--os-fg)] cursor-pointer"
            />
          </div>
        </div>

        {/* Volume & Modes Section */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="text-[10px] font-bold opacity-80 hover:opacity-100"
            >
              {isMuted || volume === 0 ? 'MUT' : 'VOL'}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(Number(e.target.value))}
              className="w-16 h-1.5 bg-[var(--os-fg)]/20 accent-[var(--os-fg)] cursor-pointer"
            />
          </div>

          <div className="flex items-center border border-[var(--os-border)] divide-x divide-[var(--os-border)]">
            <button
              type="button"
              onClick={toggleShuffle}
              title={`Shuffle: ${isShuffle ? 'ON' : 'OFF'}`}
              className={`px-1.5 py-0.5 text-[10px] font-bold ${
                isShuffle
                  ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                  : 'hover:bg-[var(--os-fg)]/15'
              }`}
            >
              ⇄
            </button>
            <button
              type="button"
              onClick={toggleRepeat}
              title={`Repeat: ${isRepeat ? 'ON' : 'OFF'}`}
              className={`px-1.5 py-0.5 text-[10px] font-bold ${
                isRepeat
                  ? 'bg-[var(--os-fg)] text-[var(--os-bg)]'
                  : 'hover:bg-[var(--os-fg)]/15'
              }`}
            >
              ↻
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar Subheader */}
      <div className="px-3 py-1.5 border-b border-[var(--os-border)] bg-[var(--os-bg)] flex items-center justify-between gap-2">
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex items-center gap-2 max-w-md"
        >
          <span className="text-[10px] font-bold opacity-60">Find:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artists, songs, or albums..."
            className="w-full px-2 py-0.5 text-xs bg-[var(--os-bg)] border border-[var(--os-border)] focus:outline-none focus:ring-1 focus:ring-[var(--os-fg)] font-mono text-[var(--os-fg)]"
          />
          <button
            type="submit"
            className="px-2.5 py-0.5 text-[11px] font-bold border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="text-[10px] opacity-60">
          Source: Free iTunes API (30s Previews)
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Playlist / Category Sidebar */}
        <aside className="w-40 md:w-48 border-r-2 border-[var(--os-border)] bg-[var(--os-bg)] overflow-y-auto p-2 space-y-1 shrink-0">
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-60 px-2 py-1">
            Playlists
          </div>
          {genres.map((genre) => {
            const isSelected = activeGenreId === genre.id
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => selectGenre(genre.id)}
                className={`w-full flex items-center gap-1.5 px-2 py-1 text-left text-xs font-mono cursor-default ${
                  isSelected
                    ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                    : 'hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]'
                }`}
              >
                <AppIconGraphic iconType="itunes" className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{genre.title}</span>
              </button>
            )
          })}
        </aside>

        {/* Right Song List Table */}
        <main className="flex-1 overflow-y-auto bg-[var(--os-bg)]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center p-6 text-center text-xs opacity-70">
              <div className="space-y-2">
                <div className="w-5 h-5 border-2 border-[var(--os-fg)] border-t-transparent rounded-full animate-spin mx-auto" />
                <div>Loading tracks from iTunes...</div>
              </div>
            </div>
          ) : songs.length === 0 ? (
            <div className="h-full flex items-center justify-center p-6 text-center text-xs opacity-60">
              No tracks found. Try another search query.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[var(--os-fg)] text-[var(--os-bg)] font-bold text-[11px] border-b border-[var(--os-border)] z-10">
                <tr>
                  <th className="py-1 px-2.5 w-10 text-center">#</th>
                  <th className="py-1 px-2">Title</th>
                  <th className="py-1 px-2">Artist</th>
                  <th className="py-1 px-2 hidden md:table-cell">Album</th>
                  <th className="py-1 px-2 hidden sm:table-cell w-16">Year</th>
                  <th className="py-1 px-2.5 w-16 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--os-border)]/20">
                {songs.map((song, index) => {
                  const isCurrent = currentTrack?.id === song.id
                  return (
                    <tr
                      key={song.id}
                      onClick={() => playTrack(song)}
                      className={`cursor-default group ${
                        isCurrent
                          ? 'bg-[var(--os-fg)] text-[var(--os-bg)] font-bold'
                          : 'hover:bg-[var(--os-fg)]/10'
                      }`}
                    >
                      <td className="py-1.5 px-2.5 text-center text-[10px] opacity-70">
                        {isCurrent ? (
                          <span>{isPlaying ? '▶' : '❚❚'}</span>
                        ) : (
                          index + 1
                        )}
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="flex items-center gap-2">
                          {song.artworkUrl && (
                            <img
                              src={song.artworkUrl}
                              alt=""
                              className="w-5 h-5 object-cover border border-[var(--os-border)]"
                            />
                          )}
                          <span className="truncate">{song.title}</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-2 truncate opacity-90">
                        {song.artist}
                      </td>
                      <td className="py-1.5 px-2 hidden md:table-cell truncate opacity-75">
                        {song.album}
                      </td>
                      <td className="py-1.5 px-2 hidden sm:table-cell text-[10px] opacity-60">
                        {song.releaseYear}
                      </td>
                      <td className="py-1.5 px-2.5 text-right opacity-80">
                        {itunesService.formatDuration(song.durationMs)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </main>
      </div>

      {/* Bottom Status Footer */}
      <footer className="px-3 py-1 border-t-2 border-[var(--os-border)] bg-[var(--os-bg)] flex justify-between items-center text-[10px] opacity-70">
        <span>
          {songs.length} {songs.length === 1 ? 'song' : 'songs'} listed
        </span>
        <span>Payaman iTunes Player v1.0</span>
      </footer>
    </div>
  )
}
