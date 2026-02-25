export const TypingIndicator = () => {
  return (
    <div className="flex justify-start w-full animate-slide-up">
      <div className="bg-[#C2E8FF]/5 text-[#C2E8FF] px-4 py-3 rounded-2xl shadow-lg mr-12 border border-[#C2E8FF]/20 backdrop-blur-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-[#C2E8FF]/60 rounded-full animate-typing"></div>
          <div className="w-2 h-2 bg-[#C2E8FF]/60 rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-[#C2E8FF]/60 rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};