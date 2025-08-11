
import React from "react";

const LoadingOverlay = ({ message = "Generating..." }: { message?: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
