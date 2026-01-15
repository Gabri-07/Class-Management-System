import logo from "../Assets/Landing Logo.png";

export default function AlgeonLoader() {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white">
      <style>{`
        @keyframes algeonBar {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>

      {/* Logo */}
      <img
        src={logo}
        alt="ALGEON Logo"
        className="w-56 md:w-96"
      />

      {/* Loading text */}
      <p className="mt-6 text-indigo-700 font-semibold text-lg tracking-wide">
        Loading...
      </p>

      {/* Progress bar */}
      <div className="mt-5 w-full max-w-md px-6">
        <div className="relative h-3 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full w-28 rounded-full bg-indigo-600"
            style={{ animation: "algeonBar 1.2s linear infinite" }}
          />
        </div>

        {/* Welcome paragraph */}
        <p className="mt-4 text-center text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
          Welcome to <span className="font-semibold text-indigo-600">ALGEON</span>,  
          where algebra meets logical thinking.  
        </p>
      </div>
    </div>
  );
}
