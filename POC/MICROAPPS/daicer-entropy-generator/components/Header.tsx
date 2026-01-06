
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-bold text-purple-400 tracking-wider">
        Daicer Entropy Engine
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
        A dynamic world simulation for the AI Dungeon Master. Advance time, and watch the world evolve through emergent events and shifting conditions.
      </p>
    </header>
  );
};

export default Header;
