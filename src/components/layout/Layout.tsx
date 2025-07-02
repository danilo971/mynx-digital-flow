
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import PaymentNotification from '@/components/ui/payment-notification';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPaymentNotification, setShowPaymentNotification] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Payment notification at the top */}
      {showPaymentNotification && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <PaymentNotification onClose={() => setShowPaymentNotification(false)} />
        </div>
      )}
      
      {/* Sidebar for desktop */}
      <div className={`hidden md:block ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <Sidebar collapsed={!sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      
      {/* Mobile sidebar with overlay */}
      {sidebarOpen && (
        <div className="md:hidden">
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={toggleSidebar}
          ></div>
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ ease: "easeOut", duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-30 w-64"
          >
            <Sidebar collapsed={false} toggleSidebar={toggleSidebar} />
          </motion.div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <div className={`${showPaymentNotification ? 'mt-16' : ''}`}>
          <Navbar toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="animate-enter">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
