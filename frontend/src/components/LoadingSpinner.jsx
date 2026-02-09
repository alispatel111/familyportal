const LoadingSpinner = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f8fafc]">
      {/* Background Ambient Glow (Softer for Light Mode) */}
      <div className="absolute h-80 w-80 bg-blue-400/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute h-64 w-64 bg-indigo-300/10 rounded-full blur-[80px] animate-pulse bottom-20 right-20"></div>
      
      <div className="relative flex flex-col items-center gap-6 p-10 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)]">
        
        {/* Advanced Spinner Design - White Theme Edition */}
        <div className="relative flex items-center justify-center">
          {/* Outer Ring (Dashed) */}
          <div className="h-20 w-20 rounded-full border-2 border-dashed border-blue-200 animate-[spin_8s_linear_infinite]"></div>
          
          {/* Middle Glowing Ring (Gradient Stroke) */}
          <div className="absolute h-16 w-16 animate-spin rounded-full border-t-2 border-r-2 border-blue-500 border-l-transparent border-b-transparent shadow-[0_0_20px_rgba(59,130,246,0.15)]"></div>
          
          {/* Inner Pulsing Core */}
          <div className="absolute h-6 w-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
        </div>

        {/* Text with Shimmer - Enhanced for Light Theme */}
        <div className="space-y-3 text-center">
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 font-bold text-xl tracking-[0.2em] uppercase pl-[0.2em]">
            Processing
          </h2>
          
          {/* Progress bar with a smoother flow */}
          <div className="relative w-40 h-[3px] bg-slate-200 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>

        {/* Status Subtext */}
        <p className="text-slate-400 text-xs font-semibold tracking-widest animate-pulse">
          Please wait a moment
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;