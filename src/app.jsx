import React, { useEffect, useRef, useState } from "react";

const songs = [
  {
    title: "Hawa Hawai",
    artist: "Kavita Krishnamurti",
    file: "/songs/song2.mp3",
  },
  {
    title: "Song 3",
    artist: "Unknown Artist",
    file: "/songs/song3.mp3",
  },
  {
    title: "Song 4",
    artist: "Unknown Artist",
    file: "/songs/song4.mp3",
  },
];

export default function App() {
  const audioRef = useRef(null);

  const [currentSong, setCurrentSong] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const song = songs[currentSong];

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setProgress(0);

    if (playing) {
      audio.play().catch(() => {
        setPlaying(false);
      });
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    if (playing) {
      audio.play().catch(() => {
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [playing]);

  const togglePlay = () => {
    setPlaying((prev) => !prev);
  };

  const previousSong = () => {
    setCurrentSong((prev) =>
      prev === 0 ? songs.length - 1 : prev - 1
    );
    setPlaying(true);
  };

  const nextSong = () => {
    setCurrentSong((prev) =>
      prev === songs.length - 1 ? 0 : prev + 1
    );
    setPlaying(true);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio) return;

    setProgress(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;

    if (!audio) return;

    setDuration(audio.duration || 0);
  };

  const handleEnded = () => {
    setCurrentSong((prev) =>
      prev === songs.length - 1 ? 0 : prev + 1
    );
    setPlaying(true);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;

    if (!audio) return;

    const value = Number(e.target.value);

    audio.currentTime = value;
    setProgress(value);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="app">

      {/* TITLE */}
      <header className="header">
        <h1>ट्रक वाला</h1>
        <div className="title-decoration"></div>
      </header>

      {/* TOP CONTROLS */}
      <div className="top-controls">

        <button
          className="playlist-btn"
          onClick={() => setShowPlaylist(true)}
        >
          ☰ Playlist
        </button>

        <div className="horn">
          🔊 हॉर्न ओके प्लीज
          <span>horn ok pleaseee</span>
        </div>

      </div>

      {/* TRUCK */}
      <section className="truck-section">

        <div className="truck">

          {/* TRAILER */}
          <div className="trailer">

            <div className="trailer-roof"></div>

            <div className="trailer-body">

              <div className="trailer-lines"></div>

              <div className="trailer-panels">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

            </div>

          </div>

          {/* CAB */}
          <div className="cab">

            <div className="cab-roof"></div>

            <div className="cab-window"></div>

            <div className="cab-door">
              <div className="door-handle"></div>
            </div>

            <div className="headlight"></div>

            <div className="bumper"></div>

          </div>

          {/* WHEELS */}
          <div className="wheel wheel-1">
            <div className="wheel-center"></div>
          </div>

          <div className="wheel wheel-2">
            <div className="wheel-center"></div>
          </div>

          <div className="wheel wheel-3">
            <div className="wheel-center"></div>
          </div>

          <div className="wheel wheel-4">
            <div className="wheel-center"></div>
          </div>

        </div>

      </section>

      {/* SONG TITLE */}
      <div className="now-playing-title">
        <strong>{song.title}</strong>
        <span>↔</span>
      </div>

      {/* PLAYER */}
      <section className="player">

        <div className="album-icon">
          🎵
        </div>

        <div className="song-info">
          <div className="song-name">
            {song.title}
          </div>

          <div className="artist">
            {song.artist}
          </div>
        </div>

        <div className="controls">

          <button onClick={previousSong} title="Previous">
            ⏮
          </button>

          <button
            className="play-button"
            onClick={togglePlay}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? "Ⅱ" : "▶"}
          </button>

          <button onClick={nextSong} title="Next">
            ⏭
          </button>

          <button
            onClick={() => setShowPlaylist(true)}
            title="Playlist"
          >
            ☷
          </button>

        </div>

        <div className="progress-area">

          <span>{formatTime(progress)}</span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress}
            onChange={handleSeek}
          />

          <span>{formatTime(duration)}</span>

        </div>

        {/* ONLY ONE AUDIO ELEMENT */}
        <audio
          ref={audioRef}
          src={song.file}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />

      </section>

      {/* PLAYLIST */}
      {showPlaylist && (
        <div className="playlist-overlay">

          <aside className="playlist">

            <div className="playlist-header">
              <h2>Playlist</h2>

              <button
                className="close-btn"
                onClick={() => setShowPlaylist(false)}
              >
                ×
              </button>
            </div>

            <div className="playlist-list">

              {songs.map((item, index) => (
                <button
                  key={item.file}
                  className={
                    index === currentSong
                      ? "playlist-item active"
                      : "playlist-item"
                  }
                  onClick={() => {
                    setCurrentSong(index);
                    setPlaying(true);
                  }}
                >
                  <span className="number">
                    {index + 1}.
                  </span>

                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.artist}</small>
                  </span>
                </button>
              ))}

            </div>

          </aside>

        </div>
      )}

    </div>
  );
}