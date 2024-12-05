export default function LoadingState() {
    return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-white">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-.3s]" />
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-.5s]" />
        </div>
      </div>
    );
  }
  