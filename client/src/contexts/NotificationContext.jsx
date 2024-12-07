import React, { createContext, useContext, useState } from 'react';
import { Transition } from '@headlessui/react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Notification Component */}
      <Transition
        show={!!notification}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {notification && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`rounded-lg p-4 ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white shadow-lg`}>
              {notification.message}
            </div>
          </div>
        )}
      </Transition>
    </NotificationContext.Provider>
  );
}; 