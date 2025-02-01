import React from "react";

const LoadingAnimation = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-teal-500 to-blue-700">
      {/* Loading Screen Container */}
      <div className="flex flex-col items-center justify-center space-y-12">
        
        {/* "FINEXO" Text with Elegant Animation */}
        <div className="text-container mb-6">
          <h1 className="text-white text-5xl md:text-7xl font-semibold opacity-0 animate-typewriter">
            FINEXO
          </h1>
        </div>

        {/* Elegant Circular Spinner with Pulse */}
        <div className="spinner border-t-4 border-b-4 border-white rounded-full w-32 h-32 animate-spin-smooth mb-8"></div>

        {/* Loading Text with Fade-in and Smooth Transition */}
        <div className="text-container">
          <h2 className="text-white text-lg md:text-2xl font-semibold opacity-0 animate-fade-in">
            Please wait, we're loading...
          </h2>
        </div>

        {/* Progress Bar with Shine Effect */}
        <div className="progress-container w-64 mt-8">
          <div className="progress-bar bg-gray-300 h-2 rounded-full overflow-hidden">
            <div className="progress bg-gradient-to-r from-teal-300 to-blue-500 h-full animate-progress-bar"></div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default LoadingAnimation;
