import React from "react";

const ComingSoon: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-4">
      <h1 className="text-5xl font-bold mb-4">Coming Soon</h1>
      <p className="text-lg mb-6">We're working hard to bring something amazing to you. Stay tuned!</p>
      <a href="/" className="text-xl text-gray-300 hover:text-white transition duration-300">
        Back to Home
      </a>
    </div>
  );
};

export default ComingSoon;
