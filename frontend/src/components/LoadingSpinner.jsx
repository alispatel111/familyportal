const LoadingSpinner = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40">
      <div className="flex flex-col items-center gap-5 p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-2 border border-white/20">
        {/* Main spinner with gradient and pulse effect */}
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-500 border-r-indigo-400 transition-all duration-500 hover:scale-110 hover:border-t-blue-600 hover:border-r-indigo-500 shadow-md"></div>
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-blue-200/40"></div>
          <div className="absolute inset-2 h-12 w-12 animate-pulse rounded-full bg-blue-100/20"></div>
        </div>
        
        {/* Animated dots with sequential fade effect */}
        <p className="text-base font-medium text-slate-700 flex items-center">
          <span className="tracking-wide">Loading</span>
          <span className="flex ml-1">
            <span className="opacity-0 animate-[fade_1.5s_infinite]">.</span>
            <span className="opacity-0 animate-[fade_1.5s_infinite_0.2s]">.</span>
            <span className="opacity-0 animate-[fade_1.5s_infinite_0.4s]">.</span>
          </span>
        </p>
        
        {/* Subtle progress indicator */}
        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
          <div className="h-full w-1/3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-[slide_2s_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;  