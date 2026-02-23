'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useStore } from '@/stores/useStore';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const user = useStore((state) => state.user);
  const theme = user?.settings?.theme ?? 'light';
  const onboardingCompleted = user?.onboardingCompleted ?? false;

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth redirect
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/');
    }
  }, [mounted, isAuthenticated, router]);

  // Onboarding redirect
  useEffect(() => {
    if (mounted && isAuthenticated && !onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [mounted, isAuthenticated, onboardingCompleted, router]);

  // Show nothing until hydrated
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8] dark:bg-[#16162A]">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, render nothing (redirect will fire)
  if (!isAuthenticated) {
    return null;
  }

  // If onboarding not completed, render nothing (redirect will fire)
  if (!onboardingCompleted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F5F5F0] dark:bg-[#16162A]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar for mobile */}
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#2A2A40' : '#FFFFFF',
            color: theme === 'dark' ? '#E5E7EB' : '#374151',
            borderRadius: '12px',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #F3F4F6',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        }}
      />
    </div>
  );
}
