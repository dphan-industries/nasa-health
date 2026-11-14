"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function MoveTheMoon() {
  const [playing, setPlaying] = useState(false);
  const [session, setSession] = useState(0);
  const launch = useRef<HTMLButtonElement>(null);
  const [fullscreenNote, setFullscreenNote] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!playing) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [playing]);
  function expand() {
    if (document.fullscreenElement) return;
    const fallback = () =>
      setFullscreenNote(
        "Full-window mode is active. Install Deep Space Health on your home screen to hide browser controls.",
      );
    if (stage.current?.requestFullscreen)
      void stage.current.requestFullscreen().catch(fallback);
    else fallback();
  }
  function close() {
    if (document.fullscreenElement === stage.current)
      void document.exitFullscreen().catch(() => {});
    dialog.current?.close();
    setPlaying(false);
    setFullscreenNote("");
    launch.current?.focus();
  }
  return (
    <section className="panel moon-room">
      <div className="eyebrow">RECREATION · OFFLINE GAME</div>
      <h2>Move the Moon</h2>
      <p>
        Game artwork, audio, shop, and local scores are bundled here for offline
        play.
      </p>
      <p id="moon-controls">
        Drag around Earth to move the Moon and block incoming asteroids. Click
        the game to focus it; left / right arrow keys move the Moon, and Space
        or Escape pauses. Peace mode is available through the game’s Earth
        interaction. Sound starts muted; use the game’s sound controls to enable
        it.
      </p>
      <button
        ref={launch}
        className="primary"
        onClick={() => {
          dialog.current?.showModal();
          setPlaying(true);
        }}
      >
        Play full screen
      </button>
      <div className="moon-launch">
        <Image
          unoptimized
          src="/games/move-the-moon/preview.png"
          alt="Move the Moon Earth artwork"
          width="150"
          height="150"
        />
        <h3>Game controls</h3>
        <p>Drag with your finger or mouse. Play in portrait or landscape.</p>
      </div>
      <dialog
        ref={dialog}
        className="moon-dialog"
        aria-label="Move the Moon player"
        onCancel={(event) => event.preventDefault()}
      >
        <div ref={stage} className="moon-stage">
          <div className="moon-toolbar">
            <strong>Move the Moon</strong>
            <div className="moon-toolbar-actions">
              <button className="secondary" onClick={expand}>
                Full screen
              </button>
              <button
                className="secondary"
                onClick={() => {
                  if (
                    window.confirm(
                      "Restart? Your current run ends; saved progress stays on this device.",
                    )
                  )
                    setSession((s) => s + 1);
                }}
              >
                Restart
              </button>
              <button className="primary" onClick={close}>
                Close game
              </button>
            </div>
          </div>
          {fullscreenNote && (
            <p className="moon-fullscreen-note" role="status">
              {fullscreenNote}
            </p>
          )}
          {playing && (
            <iframe
              key={session}
              className="moon-fullscreen-frame"
              title="Move the Moon game"
              src="/games/move-the-moon"
              allowFullScreen
              aria-describedby="moon-controls"
            />
          )}
        </div>
      </dialog>
      <p className="fine-print">
        Closing the game ends the current run. Scores, coins, and equipped items
        save locally in this browser; progress from the original PC or phone
        game is not imported. Offline play is available after OFFLINE READY
        appears. Install Deep Space Health on your home screen to play without browser
        controls.
      </p>
    </section>
  );
}
