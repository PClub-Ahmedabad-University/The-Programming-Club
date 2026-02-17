"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { toast, Toaster } from "react-hot-toast";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

const dummyData = {
  name: "Coding Warrior",
  role: "Co-Leader",
  clan: "Cyber Knights",
  battles: [
    { round: 1, solved: 4, rank: 12 },
    { round: 2, solved: 6, rank: 5 },
    { round: 3, solved: 5, rank: 8 },
    { round: 4, solved: 8, rank: 3 },
  ],
  totalSolved: 23,
  topRank: 3,
  clanPoints: 1250,
  team: "Giants",
};

const teamThemes = {
  Barbarians: { primary: "#EAB308", glow: "rgba(234,179,8,0.5)", glowSoft: "rgba(234,179,8,0.15)", label: "Brutality", particleColor: "#EAB308" },
  Pekkas:     { primary: "#A855F7", glow: "rgba(168,85,247,0.5)", glowSoft: "rgba(168,85,247,0.15)", label: "Steel",    particleColor: "#A855F7" },
  Wizards:    { primary: "#3B82F6", glow: "rgba(59,130,246,0.5)", glowSoft: "rgba(59,130,246,0.15)", label: "Magic",    particleColor: "#3B82F6" },
  Giants:     { primary: "#EF4444", glow: "rgba(239,68,68,0.5)",  glowSoft: "rgba(239,68,68,0.15)",  label: "Force",    particleColor: "#EF4444" },
};

const teamImages = {
  Barbarians: "/barbarian.png",
  Pekkas: "/pekka.jpg",
  Wizards: "/wizard.png",
  Giants: "/giant.jpg",
};

const Emblems = {
  Barbarians: (color) => (
    <svg viewBox="0 0 100 100" className="w-20 h-20" style={{ filter: `drop-shadow(0 0 16px ${color})` }}>
      <path d="M20,80 L30,90 L90,30 L80,20 Z" fill={color} />
      <path d="M15,75 L25,85 L35,95 L25,85 Z" fill={color} opacity="0.6" />
      <rect x="20" y="70" width="15" height="15" fill="#1a1a1a" transform="rotate(-45 27.5 77.5)" />
      <path d="M50,5 L55,20 L70,20 L58,29 L63,44 L50,35 L37,44 L42,29 L30,20 L45,20 Z" fill={color} opacity="0.8" />
    </svg>
  ),
  Pekkas: (color) => (
    <svg viewBox="0 0 100 100" className="w-20 h-20" style={{ filter: `drop-shadow(0 0 16px ${color})` }}>
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill={color} opacity="0.2" />
      <path d="M50,10 L30,50 L50,50 L40,90 L70,40 L50,40 L60,10 Z" fill={color} />
      <circle cx="50" cy="38" r="6" fill="#fff" opacity="0.9" />
      <circle cx="50" cy="38" r="3" fill={color} />
    </svg>
  ),
  Wizards: (color) => (
    <svg viewBox="0 0 100 100" className="w-20 h-20" style={{ filter: `drop-shadow(0 0 16px ${color})` }}>
      <path d="M50,5 L60,35 L90,35 L67,55 L75,85 L50,68 L25,85 L33,55 L10,35 L40,35 Z" fill={color} opacity="0.25" />
      <path d="M50,10 C30,40 30,70 50,90 C70,70 70,40 50,10" fill={color} />
      <path d="M40,50 Q50,30 60,50 Q50,70 40,50" fill="white" opacity="0.7" />
      <circle cx="50" cy="50" r="4" fill="white" opacity="0.9" />
    </svg>
  ),
  Giants: (color) => (
    <svg viewBox="0 0 100 100" className="w-20 h-20" style={{ filter: `drop-shadow(0 0 16px ${color})` }}>
      <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill={color} opacity="0.2" />
      <rect x="28" y="22" width="44" height="56" rx="3" fill={color} />
      <path d="M38,37 L62,37 M38,52 L62,52 M38,67 L62,67" stroke="rgba(0,0,0,0.4)" strokeWidth="4" strokeLinecap="round" />
      <rect x="28" y="22" width="44" height="12" rx="3" fill="rgba(255,255,255,0.15)" />
    </svg>
  ),
};

const Particles = ({ color, count = 20 }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animDuration: `${3 + Math.random() * 5}s`,
    animDelay: `${Math.random() * 5}s`,
    size: `${1 + Math.random() * 2}px`,
    opacity: 0.2 + Math.random() * 0.5,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div key={p.id} className="absolute bottom-0 rounded-full"
          style={{ left: p.left, width: p.size, height: p.size, backgroundColor: color, opacity: p.opacity, animation: `floatUp ${p.animDuration} ${p.animDelay} infinite linear` }}
        />
      ))}
    </div>
  );
};

const MusicButton = ({ isPlaying, onToggle, theme }) => (
  <button onClick={onToggle} title={isPlaying ? "Mute" : "Unmute"} className="transition-opacity hover:opacity-100 opacity-50" style={{ color: theme.primary }}>
    {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
  </button>
);

const ReplayButton = ({ onReplay, theme }) => (
  <button onClick={onReplay} title="Replay" className="transition-opacity hover:opacity-100 opacity-50" style={{ color: theme.primary }}>
    <RotateCcw size={16} />
  </button>
);

// ── RAID TRANSITION ──────────────────────────────────────────────────────────
const RaidTransition = ({ theme, onComplete }) => {
  const overlayRef  = useRef(null);
  const swordRef    = useRef(null);
  const ring1Ref    = useRef(null);
  const ring2Ref    = useRef(null);
  const ring3Ref    = useRef(null);
  const flashRef    = useRef(null);
  const textRef     = useRef(null);
  const starsRef    = useRef([]);
  const blackoutRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ onComplete });

    // 1. Flash white
    tl.fromTo(flashRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.08, ease: "none" }
    )
    .to(flashRef.current, { opacity: 0, duration: 0.25, ease: "power2.out" });

    // 2. Sword slam in from above — scale + blur
    tl.fromTo(swordRef.current,
      { y: -180, scale: 0.3, opacity: 0, filter: "blur(20px)", rotate: -15 },
      { y: 0,    scale: 1,   opacity: 1, filter: "blur(0px)",  rotate: 0,
        duration: 0.45, ease: "expo.out" },
      "-=0.1"
    );

    // 3. Shockwave rings burst outward simultaneously
    tl.fromTo(
      [ring1Ref.current, ring2Ref.current, ring3Ref.current],
      { scale: 0, opacity: 0.8 },
      { scale: 6, opacity: 0, duration: 1.0, ease: "expo.out", stagger: 0.12 },
      "-=0.1"
    );

    // 4. Scattered star sparks fly out
    tl.fromTo(
      starsRef.current,
      { scale: 0, opacity: 1, x: 0, y: 0 },
      {
        scale: 1, opacity: 0,
        x: (i) => Math.cos((i / starsRef.current.length) * Math.PI * 2) * (80 + Math.random() * 60),
        y: (i) => Math.sin((i / starsRef.current.length) * Math.PI * 2) * (80 + Math.random() * 60),
        duration: 0.7, ease: "expo.out", stagger: 0.03,
      },
      "<"
    );

    // 5. "RAID BEGINS" text slams in
    tl.fromTo(textRef.current,
      { y: 30, opacity: 0, scale: 0.7, filter: "blur(10px)" },
      { y: 0,  opacity: 1, scale: 1,   filter: "blur(0px)",
        duration: 0.4, ease: "expo.out" },
      "-=0.4"
    );

    // 6. Hold for a beat
    tl.to({}, { duration: 0.55 });

    // 7. Sword + text scale up and blur out
    tl.to([swordRef.current, textRef.current], {
      scale: 2, opacity: 0, filter: "blur(30px)",
      duration: 0.35, ease: "power2.in",
    });

    // 8. Blackout slams in
    tl.fromTo(blackoutRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "none" },
      "-=0.1"
    );

    // 9. Hold on black, then done
    tl.to({}, { duration: 0.15 });

  }, []);

  const starCount = 12;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" style={{ background: "#000" }}>
      {/* Full white flash */}
      <div ref={flashRef} className="absolute inset-0 opacity-0" style={{ backgroundColor: theme.primary }} />

      {/* Shockwave rings */}
      {[ring1Ref, ring2Ref, ring3Ref].map((ref, i) => (
        <div key={i} ref={ref} className="absolute rounded-full opacity-0"
          style={{
            width: 120, height: 120,
            border: `${3 - i}px solid ${theme.primary}`,
            boxShadow: `0 0 20px ${theme.glow}`,
            marginLeft: -60, marginTop: -60,
          }}
        />
      ))}

      {/* Spark stars */}
      {Array.from({ length: starCount }).map((_, i) => (
        <div key={i} ref={(el) => (starsRef.current[i] = el)}
          className="absolute text-lg opacity-0"
          style={{ color: theme.primary, filter: `drop-shadow(0 0 6px ${theme.primary})`, fontSize: i % 3 === 0 ? "1.2rem" : "0.7rem" }}
        >
          {i % 2 === 0 ? "✦" : "★"}
        </div>
      ))}

      {/* Sword / clash icon */}
      <div ref={swordRef} className="absolute flex flex-col items-center opacity-0" style={{ filter: `drop-shadow(0 0 40px ${theme.primary})` }}>
        <div className="font-clash font-black italic text-[8rem] leading-none select-none" style={{ color: theme.primary }}>⚔</div>
      </div>

      {/* "RAID BEGINS" label */}
      <div ref={textRef} className="absolute opacity-0 text-center" style={{ top: "57%" }}>
        <p className="font-clash font-black uppercase tracking-[0.6em] text-lg" style={{ color: theme.primary }}>Raid Begins</p>
        <div className="h-[1px] mt-1" style={{ background: `linear-gradient(to right, transparent, ${theme.primary}, transparent)` }} />
      </div>

      {/* Final blackout layer */}
      <div ref={blackoutRef} className="absolute inset-0 opacity-0" style={{ background: "#030303" }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const TOTAL_SLIDES = 6;
const SLIDE_DURATION = 8;

const Wrapped = () => {
  const [phase, setPhase] = useState("landing"); // "landing" | "transition" | "show"
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isPlaying, setIsPlaying]     = useState(true);
  const [finished, setFinished]       = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const containerRef = useRef(null);
  const progressRef  = useRef(null);
  const slidesRef    = useRef([]);
  const tlRef        = useRef(null);
  const audioRef     = useRef(null);

  const theme = teamThemes[dummyData.team];

  useEffect(() => {
    const audio = new Audio("/coc_music.wav");
    audio.loop = true;
    audio.volume = 0.7;
    audio.oncanplaythrough = () => setAudioLoaded(true);
    audioRef.current = audio;
    return () => { audio.pause(); audioRef.current = null; };
  }, []);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.play().catch(() => {}); }
    setIsPlaying((p) => !p);
  }, [isPlaying]);

  const buildTimeline = useCallback(() => {
    const tl = gsap.timeline({
      onUpdate: () => {
        if (progressRef.current) gsap.set(progressRef.current, { scaleX: tl.progress() });
      },
      onComplete: () => setFinished(true),
    });
    tlRef.current = tl;

    slidesRef.current.forEach((slide, index) => {
      if (!slide) return;
      const reveals   = slide.querySelectorAll(".reveal");
      const bigNum    = slide.querySelector(".big-num");
      const swordEl   = slide.querySelector(".sword-anim");
      const bgLetter  = slide.querySelector(".bg-letter");

      tl.add(`slide-${index}`)
        .set(slide, { display: "flex", opacity: 0, y: 30 })
        .to(slide, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", onStart: () => setCurrentSlide(index) });

      if (bgLetter) {
        tl.fromTo(bgLetter,
          { scale: 0.4, opacity: 0, filter: "blur(40px)" },
          { scale: 1, opacity: 0.06, filter: "blur(0px)", duration: 1.1, ease: "expo.out" },
          "-=0.3"
        );
      }

      if (swordEl) tl.fromTo(swordEl, { scaleX: 0, opacity: 0, transformOrigin: "left center" }, { scaleX: 1, opacity: 1, duration: 0.6, ease: "expo.out" }, "-=0.4");
      if (bigNum)  tl.fromTo(bigNum,  { scale: 2.5, opacity: 0, filter: "blur(30px)", rotate: -8 }, { scale: 1, opacity: 1, filter: "blur(0px)", rotate: 0, duration: 1, ease: "expo.out" }, "-=0.3");

      tl.fromTo(reveals,
        { y: 50, opacity: 0, scale: 0.92, filter: "blur(10px)" },
        { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 1, stagger: 0.16, ease: "expo.out" },
        bgLetter ? ">" : "-=0.5"
      );

      if (index < TOTAL_SLIDES - 1) {
        tl.to({}, { duration: SLIDE_DURATION - 2.5 })
          .to(slide, { opacity: 0, y: -40, scale: 0.97, filter: "blur(15px)", duration: 0.7, ease: "power2.inOut" })
          .set(slide, { display: "none" });
      } else {
        tl.to({}, { duration: SLIDE_DURATION - 2.5 });
      }
    });
  }, []);

  useEffect(() => {
    if (phase !== "show") return;
    const ctx = gsap.context(() => { buildTimeline(); }, containerRef);
    return () => ctx.revert();
  }, [phase, buildTimeline]);

  // Called when user clicks "Engage Archives"
  const handleEngage = () => {
    if (!audioLoaded) return;
    // Start audio immediately on click for the transition ambience
    if (audioRef.current) audioRef.current.play().catch(() => {});
    setPhase("transition");
  };

  // Called when RaidTransition finishes
  const handleTransitionDone = () => {
    setPhase("show");
    setFinished(false);
  };

  const replay = () => {
    setFinished(false);
    setCurrentSlide(0);
    if (tlRef.current) { tlRef.current.kill(); tlRef.current = null; }
    slidesRef.current.forEach((s) => { if (s) gsap.set(s, { display: "none", opacity: 0, y: 0, scale: 1, filter: "blur(0px)" }); });
    if (progressRef.current) gsap.set(progressRef.current, { scaleX: 0 });
    setTimeout(() => { gsap.context(() => { buildTimeline(); }, containerRef); }, 50);
    if (audioRef.current && isPlaying) audioRef.current.play().catch(() => {});
  };

  const seekSlide = (index) => {
    if (!tlRef.current) return;
    const label = `slide-${index}`;
    if (tlRef.current.getLabelTime(label) !== -1) {
      tlRef.current.seek(label);
      setCurrentSlide(index);
      if (index < TOTAL_SLIDES - 1) setFinished(false);
    }
  };

  const next = () => { if (currentSlide < TOTAL_SLIDES - 1) seekSlide(currentSlide + 1); };
  const prev = () => { if (currentSlide > 0) seekSlide(currentSlide - 1); };

  // ─── LANDING ────────────────────────────────────────────────────────────────
  if (phase === "landing") {
    return (
      <>
        <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: "#050505", fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${theme.glowSoft} 0%, transparent 70%)` }} />
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)" }} />
          <Particles color={theme.particleColor} count={25} />

          <div className="z-10 text-center px-8">
            <div className="relative mb-4">
              <h1 className="font-clash text-[3rem] md:text-[6rem] font-black uppercase leading-none tracking-tighter"
                style={{ color: "white", textShadow: `0 0 80px ${theme.glow}`, animation: "glitch 6s infinite" }}>
                COC 4.0
              </h1>
              <h2 className="font-clash text-[3rem] md:text-[6rem] font-black uppercase leading-none tracking-tighter"
                style={{ color: theme.primary, textShadow: `0 0 60px ${theme.glow}` }}>
                WRAPPED
              </h2>
            </div>

            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="h-[1px] w-20" style={{ background: `linear-gradient(to right, transparent, ${theme.primary})` }} />
              <span style={{ color: theme.primary, fontSize: "1rem" }}>⚔</span>
              <div className="h-[1px] w-20" style={{ background: `linear-gradient(to left, transparent, ${theme.primary})` }} />
            </div>

            <div className="inline-flex items-center gap-3 mb-10 px-5 py-2.5 border rounded-full backdrop-blur-sm"
              style={{ borderColor: `${theme.primary}30`, backgroundColor: `${theme.primary}08` }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: theme.primary, boxShadow: `0 0 6px ${theme.primary}` }} />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/60">Clan {dummyData.team}</span>
            </div>

            <div>
              <button
                onClick={handleEngage}
                disabled={!audioLoaded}
                className="relative group overflow-hidden px-12 py-4 font-black text-[10px] tracking-[0.6em] uppercase transition-all duration-500"
                style={{ border: `2px solid ${theme.primary}`, color: audioLoaded ? theme.primary : `${theme.primary}50`, backgroundColor: audioLoaded ? `${theme.primary}10` : "transparent", cursor: audioLoaded ? "pointer" : "wait" }}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: theme.primary }} />
                <span className="relative">{audioLoaded ? "▶  Engage Archives" : "◌  Initializing..."}</span>
              </button>
            </div>
          </div>
        </div>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
          @keyframes glitch { 0%,94%,100%{transform:translate(0);} 95%{transform:translate(-3px,1px);} 97%{transform:translate(3px,-1px);} }
          @keyframes floatUp { 0%{transform:translateY(100vh);opacity:0;} 10%{opacity:.8;} 90%{opacity:.2;} 100%{transform:translateY(-10vh);opacity:0;} }
        `}</style>
      </>
    );
  }

  // ─── TRANSITION ──────────────────────────────────────────────────────────────
  if (phase === "transition") {
    return (
      <>
        <RaidTransition theme={theme} onComplete={handleTransitionDone} />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
          @keyframes floatUp { 0%{transform:translateY(100vh);opacity:0;} 10%{opacity:.8;} 90%{opacity:.2;} 100%{transform:translateY(-10vh);opacity:0;} }
        `}</style>
      </>
    );
  }

  // ─── MAIN SHOW ───────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="h-screen w-screen text-white overflow-hidden relative" style={{ background: "#030303", fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}>
      <div className="absolute inset-0 transition-all duration-1000 pointer-events-none" style={{ background: `radial-gradient(ellipse at ${currentSlide % 2 === 0 ? "30% 40%" : "70% 60%"}, ${theme.glowSoft} 0%, transparent 60%)` }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)" }} />
      <Particles color={theme.particleColor} count={15} />

      {/* ── HUD ── */}
      <div className="absolute top-0 left-0 right-0 z-50 p-5 flex flex-col gap-2.5">
        <div className="h-[2px] w-full bg-white/5 relative overflow-hidden rounded-full">
          <div ref={progressRef} className="absolute inset-0 origin-left scale-x-0 rounded-full"
            style={{ background: `linear-gradient(90deg, ${theme.primary}88, ${theme.primary}, ${theme.primary}88)`, boxShadow: `0 0 10px ${theme.glow}` }} />
        </div>
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                <button key={i} onClick={() => seekSlide(i)} className="rounded-full transition-all duration-300"
                  style={{ width: i === currentSlide ? 18 : 5, height: 5, backgroundColor: i === currentSlide ? theme.primary : `${theme.primary}30`, boxShadow: i === currentSlide ? `0 0 6px ${theme.glow}` : "none" }} />
              ))}
            </div>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">Battle Log</span>
          </div>
          <div className="flex items-center gap-4">
            {finished && <ReplayButton onReplay={replay} theme={theme} />}
            <MusicButton isPlaying={isPlaying} onToggle={toggleMusic} theme={theme} />
            <span className="text-xs font-black italic tracking-widest" style={{ color: theme.primary }}>PHASE 0{currentSlide + 1}</span>
          </div>
        </div>
      </div>

      {/* Navigation zones */}
      <div className="absolute inset-0 z-40 flex">
        <div className="h-full w-1/4 cursor-w-resize" onClick={prev} />
        <div className="h-full w-3/4 cursor-e-resize" onClick={next} />
      </div>

      {/* ── SLIDES ── */}
      <div className="relative h-full w-full flex items-center justify-center p-8">

        {/* SLIDE 1: INTRO */}
        <div ref={(el) => (slidesRef.current[0] = el)} className="absolute inset-0 hidden flex-col items-center justify-center text-center gap-5">
          <div className="absolute left-8 top-1/2 -translate-y-1/2 w-[2px] h-32 opacity-30" style={{ background: `linear-gradient(to bottom, transparent, ${theme.primary}, transparent)` }} />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-[2px] h-32 opacity-30" style={{ background: `linear-gradient(to bottom, transparent, ${theme.primary}, transparent)` }} />
          <p className="reveal font-clash text-lg font-black uppercase" style={{ color: `${theme.primary}70` }}>⚔ The Chronicle Of ⚔</p>
          <h1 className="reveal font-clash text-[3.5rem] md:text-[6rem] font-black italic tracking-tighter leading-none uppercase"
            style={{ color: "white", textShadow: `0 0 60px ${theme.glow}, 0 4px 0 ${theme.primary}40` }}>
            {dummyData.name}
          </h1>
          <div className="sword-anim h-[2px] w-36 rounded-full" style={{ backgroundColor: theme.primary, boxShadow: `0 0 16px ${theme.glow}` }} />
          <div className="reveal flex items-center gap-5 text-[9px] font-black tracking-[0.5em] uppercase text-white/30">
            <span>{dummyData.role}</span>
            <span style={{ color: theme.primary }}>·</span>
            <span>{dummyData.clan}</span>
            <span style={{ color: theme.primary }}>·</span>
            <span style={{ color: theme.primary }}>Division {dummyData.team}</span>
          </div>
        </div>

        {/* SLIDE 2: TEAM */}
        <div ref={(el) => (slidesRef.current[1] = el)} className="absolute inset-0 hidden flex-col items-center justify-center gap-6 text-center">
          <img src={teamImages[dummyData.team]} className="bg-letter absolute pointer-events-none select-none opacity-0 w-[80vw] max-h-[70vh] object-contain" alt="" />
          <div className="space-y-2">
            <p className="reveal text-[9px] font-black tracking-[0.8em] uppercase text-white/30">Forged in the ranks of</p>
            <h2 className="reveal font-clash text-[3rem] md:text-[6rem] font-black italic tracking-tighter uppercase leading-none"
              style={{ color: theme.primary, textShadow: `0 0 60px ${theme.glow}` }}>
              CLAN<br />{dummyData.team}
            </h2>
            <p className="reveal text-[10px] font-black tracking-[0.6em] uppercase" style={{ color: `${theme.primary}60` }}>{theme.label} · Season 4</p>
          </div>
          <div className="reveal flex items-center gap-5 pt-5 border-t text-[9px] font-black tracking-widest uppercase" style={{ borderColor: `${theme.primary}20` }}>
            <span className="text-white/20">Clan</span>
            <span style={{ color: theme.primary }}>{dummyData.clan}</span>
            <span className="text-white/20">Role</span>
            <span className="text-white">{dummyData.role}</span>
          </div>
        </div>

        {/* SLIDE 3: PERFORMANCE */}
        <div ref={(el) => (slidesRef.current[2] = el)} className="absolute inset-0 hidden flex-col items-center justify-center gap-6 text-center">
          <h2 className="reveal font-clash text-[10px] font-black tracking-[0.8em] text-white/20 uppercase">⚔ Conquests Recorded ⚔</h2>
          <div className="relative">
            <span className="absolute inset-0 flex items-center justify-center font-clash text-[18vw] font-black italic leading-none tracking-tighter opacity-[0.05]" style={{ color: theme.primary }}>{dummyData.totalSolved}</span>
            <span className="big-num relative font-clash text-[16vw] font-black italic leading-none tracking-tighter" style={{ color: theme.primary, textShadow: `0 0 80px ${theme.glow}` }}>{dummyData.totalSolved}</span>
          </div>
          <p className="reveal text-[10px] font-black tracking-[0.6em] uppercase text-white/30">Problems Destroyed</p>
          <div className="reveal flex gap-3 md:gap-6">
            {dummyData.battles.map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-2 px-3 py-3 border" style={{ borderColor: `${theme.primary}20`, backgroundColor: `${theme.primary}05` }}>
                <div className="w-[2px] h-12 bg-white/5 relative overflow-hidden">
                  <div className="absolute bottom-0 w-full" style={{ height: `${(b.solved / 10) * 100}%`, backgroundColor: theme.primary, boxShadow: `0 0 8px ${theme.glow}` }} />
                </div>
                <span className="font-clash text-xl font-black italic text-white">{b.solved}</span>
                <span className="text-[7px] font-black text-white/30 tracking-widest">R0{b.round}</span>
                <span className="text-[7px] font-black tracking-wider" style={{ color: `${theme.primary}80` }}>#{b.rank}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SLIDE 4: THE PEAK */}
        <div ref={(el) => (slidesRef.current[3] = el)} className="absolute inset-0 hidden flex-col items-center justify-center gap-5 text-center">
          <p className="reveal text-[9px] font-black tracking-[1.2em] uppercase" style={{ color: `${theme.primary}60` }}>✦ Highest Honor Achieved ✦</p>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center font-clash text-[18vw] font-black italic leading-none tracking-tighter opacity-[0.04]" style={{ color: theme.primary }}>#{dummyData.topRank}</div>
            <h2 className="big-num relative font-clash font-black italic leading-none"
              style={{ fontSize: "clamp(4rem, 16vw, 16rem)", color: theme.primary, textShadow: `0 0 100px ${theme.glow}, 0 0 200px ${theme.glow}` }}>
              #{dummyData.topRank}
            </h2>
          </div>
          <div className="reveal space-y-2">
            <p className="font-clash text-xl md:text-3xl font-black italic tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Grandmaster Standing</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((s) => (<span key={s} className="text-xl" style={{ color: theme.primary, filter: `drop-shadow(0 0 6px ${theme.primary})` }}>★</span>))}
            </div>
          </div>
          <div className="reveal w-56 space-y-1.5">
            <div className="flex justify-between text-[7px] font-black tracking-widest text-white/20 uppercase">
              <span>Season Progress</span><span style={{ color: theme.primary }}>100%</span>
            </div>
            <div className="h-[5px] bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "100%", background: `linear-gradient(90deg, ${theme.primary}80, ${theme.primary})`, boxShadow: `0 0 10px ${theme.glow}` }} />
            </div>
          </div>
        </div>

        {/* SLIDE 5: SUMMARY CARD */}
        <div ref={(el) => (slidesRef.current[4] = el)} className="absolute inset-0 hidden flex-col items-center justify-center gap-6 text-center">
          <div className="reveal w-full max-w-xs relative" style={{ background: "linear-gradient(145deg, #0a0a0a, #111)", border: `1px solid ${theme.primary}20`, boxShadow: `0 0 50px ${theme.primary}12, inset 0 0 30px ${theme.primary}05` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`, boxShadow: `0 0 16px ${theme.glow}` }} />
            {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((pos, i) => (
              <div key={i} className={`absolute ${pos} w-4 h-4`} style={{ borderColor: theme.primary }} />
            ))}
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className="text-left space-y-0.5">
                  <p className="text-[7px] font-black text-white/20 uppercase tracking-widest">Warrior Record</p>
                  <p className="font-clash text-2xl font-black italic leading-none uppercase" style={{ textShadow: `0 0 16px ${theme.glow}` }}>{dummyData.name}</p>
                  <p className="text-[8px] font-black tracking-widest uppercase" style={{ color: `${theme.primary}70` }}>{dummyData.role} · {dummyData.clan}</p>
                </div>
                {Emblems[dummyData.team](theme.primary)}
              </div>
              <div className="h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${theme.primary}40, transparent)` }} />
              <div className="grid grid-cols-3 gap-3 text-left">
                {[{ label: "Division", value: dummyData.team, accent: true }, { label: "Top Rank", value: `#${dummyData.topRank}`, accent: false }, { label: "Solved", value: dummyData.totalSolved, accent: false }].map((stat, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[7px] font-black text-white/20 uppercase tracking-widest">{stat.label}</p>
                    <p className="font-clash text-lg font-black italic uppercase leading-none" style={{ color: stat.accent ? theme.primary : "white" }}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <p className="text-[7px] font-black text-white/20 uppercase tracking-widest text-left">Battle Log</p>
                <div className="flex gap-1 items-end h-7">
                  {dummyData.battles.map((b, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: `${(b.solved / 10) * 100}%`, backgroundColor: theme.primary, opacity: 0.4 + (b.solved / 10) * 0.6, boxShadow: `0 0 4px ${theme.glow}` }} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => toast.success("⚔ Warrior Profile Exported!", { style: { background: "#000", color: theme.primary, border: `1px solid ${theme.primary}40`, borderRadius: "0", fontSize: "10px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.2em" } })}
                className="w-full py-4 font-clash font-black uppercase text-[9px] tracking-[0.5em] transition-all duration-300 relative overflow-hidden group"
                style={{ backgroundColor: theme.primary, color: "#000" }}
              >
                <span className="relative z-10">⚔ Export Profile</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
              </button>
            </div>
          </div>
          <p className="reveal text-[8px] font-black text-white/15 uppercase tracking-[0.8em]">Ahmedabad University · Programming Club · COC 4.0</p>
        </div>

        {/* SLIDE 6: FAREWELL */}
        <div ref={(el) => (slidesRef.current[5] = el)} className="absolute inset-0 hidden flex-col items-center justify-center text-center gap-8 px-8">
          <div className="reveal flex items-center justify-center gap-5">
            <div className="h-[1px] w-16" style={{ background: `linear-gradient(to right, transparent, ${theme.primary}60)` }} />
            <span style={{ color: theme.primary, fontSize: "1.5rem", filter: `drop-shadow(0 0 10px ${theme.primary})` }}>⚔</span>
            <div className="h-[1px] w-16" style={{ background: `linear-gradient(to left, transparent, ${theme.primary}60)` }} />
          </div>
          <div className="reveal max-w-3xl space-y-1">
            <p className="font-clash text-3xl md:text-5xl font-black italic leading-tight uppercase tracking-tight"
              style={{ color: "white", textShadow: `0 0 80px ${theme.glow}, 0 2px 0 ${theme.primary}30` }}>
              Meet you on the{" "}
              <span style={{ color: theme.primary, textShadow: `0 0 40px ${theme.glow}` }}>battlefield</span>{" "}
              next season,
            </p>
            <p className="font-clash text-3xl md:text-5xl font-black italic leading-tight uppercase tracking-tight"
              style={{ color: theme.primary, textShadow: `0 0 60px ${theme.glow}` }}>
              warriors.
            </p>
          </div>
          <div className="reveal flex flex-col items-center gap-2.5">
            <div className="h-[1px] w-28" style={{ background: `linear-gradient(to right, transparent, ${theme.primary}40, transparent)` }} />
            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.8em]">Ahmedabad University · Programming Club · COC 4.0</p>
          </div>
        </div>

      </div>

      <Toaster position="bottom-center" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes floatUp { 0%{transform:translateY(100vh) scale(1);opacity:0;} 10%{opacity:.8;} 90%{opacity:.2;} 100%{transform:translateY(-10vh) scale(.3);opacity:0;} }
        @keyframes glitch { 0%,94%,100%{transform:translate(0);} 95%{transform:translate(-3px,1px);} 97%{transform:translate(3px,-1px);} }
      `}</style>
    </div>
  );
};

export default Wrapped;