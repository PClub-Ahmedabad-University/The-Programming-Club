const OpeningSoonTape = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-auto">
    {/* Overlay to block all clicks */}
    <div className="absolute inset-0 bg-transparent pointer-events-auto" />
    {/* Tapes */}
    <div className="absolute left-[-60px] top-[15vh] w-[200vw] h-8 md:h-12 bg-green-600 text-white font-bold text-lg md:text-2xl flex items-center justify-center rotate-[-20deg] shadow-lg opacity-95 select-none pointer-events-none" style={{ letterSpacing: "0.2em" }}>
      OPENING SOON &nbsp; • &nbsp; OPENING SOON &nbsp; • &nbsp; OPENING SOON
    </div>
    <div className="absolute left-[-60px] top-[30vh] w-[200vw] h-8 md:h-12 bg-green-600 text-white font-bold text-lg md:text-2xl flex items-center justify-center rotate-[-20deg] shadow-lg opacity-95 select-none pointer-events-none" style={{ letterSpacing: "0.2em" }}>
      OPENING SOON &nbsp; • &nbsp; OPENING SOON &nbsp; • &nbsp; OPENING SOON
    </div>
    <div className="absolute left-[-60px] top-[45vh] w-[200vw] h-8 md:h-12 bg-green-600 text-white font-bold text-lg md:text-2xl flex items-center justify-center rotate-[-20deg] shadow-lg opacity-95 select-none pointer-events-none" style={{ letterSpacing: "0.2em" }}>
      OPENING SOON &nbsp; • &nbsp; OPENING SOON &nbsp; • &nbsp; OPENING SOON
    </div>
    <div className="absolute left-[-60px] top-[60vh] w-[200vw] h-8 md:h-12 bg-green-600 text-white font-bold text-lg md:text-2xl flex items-center justify-center rotate-[-20deg] shadow-lg opacity-95 select-none pointer-events-none" style={{ letterSpacing: "0.2em" }}>
      OPENING SOON &nbsp; • &nbsp; OPENING SOON &nbsp; • &nbsp; OPENING SOON
    </div>
    <div className="absolute left-[-60px] top-[75vh] w-[200vw] h-8 md:h-12 bg-green-600 text-white font-bold text-lg md:text-2xl flex items-center justify-center rotate-[-20deg] shadow-lg opacity-95 select-none pointer-events-none" style={{ letterSpacing: "0.2em" }}>
      OPENING SOON &nbsp; • &nbsp; OPENING SOON &nbsp; • &nbsp; OPENING SOON
    </div>
  </div>
);

export default OpeningSoonTape;