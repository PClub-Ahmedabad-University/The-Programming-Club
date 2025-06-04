import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar p-4 rounded-md mb-4 flex justify-between items-center glassmorphism">
      <h2 className="text-2xl font-semibold neon-accent">Navbar</h2>
      <div className="flex items-center">
        <img
          src="/logo.png" 
          alt="User Avatar"
          className="w-8 h-8 rounded-full mr-4"
        />
        <span className="mr-4 neon-accent">John Doe</span> {/* Replace with actual user name */}
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Notifications
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
