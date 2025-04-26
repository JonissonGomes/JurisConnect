
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from "@/components/ui/toaster";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
