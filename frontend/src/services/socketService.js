import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || 'https://photons-healthcareworkers.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(URL);
      
      this.socket.on('connect', () => {
        console.log('Connected to socket server');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user._id) {
            this.socket.emit('join_user_room', user._id);
          }
        }
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
