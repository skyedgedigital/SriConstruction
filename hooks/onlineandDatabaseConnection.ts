import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import handleDBConnection from '@/lib/database';
import { ApiResponse } from '@/interfaces/APIresponses.interface';

const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof window !== 'undefined' ? navigator.onLine : false);
  const [dbConnectionStatus, setDbConnectionStatus] = useState<
    ApiResponse<any>
  >({
    success: false,
    status: 500,
    message: 'Database connection not checked yet.',
    data: null,
    error: null,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => {
        setIsOnline(true);
        toast.success('Back online!');
      };

      const handleOffline = () => {
        setIsOnline(false);
        toast.error('No internet connection. Please check your connection.');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Initial check for online status
      if (!window.navigator.onLine) {
        handleOffline();
      }

      // Cleanup event listeners on component unmount
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    const checkDBConnection = async () => {
      const res = await handleDBConnection();
      setDbConnectionStatus(res);
      if (!res.success) {
        toast.error(`Database connection issue: ${res.message}`);
      }
    };

    // Initial check for database connection
    checkDBConnection();

    // Set an interval to check the database connection every 5 minutes
    const intervalId = setInterval(checkDBConnection, 2 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return { isOnline, dbConnectionStatus };
};

export default useConnectionStatus;
