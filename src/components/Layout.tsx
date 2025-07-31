import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-terminal-bg text-cyber-green font-mono flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 mt-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
