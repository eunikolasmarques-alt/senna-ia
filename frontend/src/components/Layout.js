import React from 'react';
import Sidebar from '../components/Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;