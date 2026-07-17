'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Sidebar from '../sidebar/Sidebar';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useAuthGuard } from '@/common/guard/authGuard';
import dynamic from 'next/dynamic';
import Header from '../header/header';
import Footer from '../footer/footer';

const Sidebar = dynamic(() => import('../sidebar/sidebar'), { ssr: false });

export default function LayoutClient({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const noLayoutRoutes = ['/login', '/register', '/notFound'];
  const hideLayout = noLayoutRoutes.includes(pathname);

  const { loading } = useAuthGuard(hideLayout);

  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen flex flex-col bg-[#eaedf7]">
      {!hideLayout ? (
        token && (
          <>
            {/* <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} /> */}
            <div className="flex flex-1 min-w-0 transition-all duration-300">
              <Sidebar ontoggle={toggleSidebar} />
              <main
                className={`min-w-0 overflow-x-hidden transition-all duration-300 p-4 ${
                  isSidebarOpen
                    ? 'ml-[260px]'
                    : 'ml-[80px]'
                }`}
                style={{ width: isSidebarOpen ? 'calc(100% - 260px)' : 'calc(100% - 80px)' }}
              >
                {children}
                {/* <Footer/> */}
              </main>
            </div>
          </>
        )
      ) : (
        children
      )}
    </div>
  );
}
