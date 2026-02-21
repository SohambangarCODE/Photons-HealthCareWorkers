import { createContext, useEffect, useState } from 'react';
import socketService from '../services/socketService';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = socketService.connect();
    setSocket(socketInstance);

    return () => {
      socketService.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
