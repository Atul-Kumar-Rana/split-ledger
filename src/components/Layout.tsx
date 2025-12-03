import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
