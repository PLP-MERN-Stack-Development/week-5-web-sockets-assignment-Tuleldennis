// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

// Send a message (with room, file, image, reactions)
  const sendMessage = (data) => {
    socket.emit('send_message', data);
  };
  // Join a room
  const joinRoom = (roomName) => {
    socket.emit('join_room', roomName);
  };

  // Send a file/image
  const sendFile = (room, file, filename) => {
    socket.emit('send_file', { room, file, filename });
  };

  // React to a message
  const reactMessage = (messageId, reaction) => {
    socket.emit('react_message', { messageId, reaction });
  };

  // Mark message as read
  const readMessage = (messageId, room) => {
    socket.emit('read_message', { messageId, room });
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };
    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };
    // User events
    const onUserList = (userList) => setUsers(userList);
    const onUserJoined = (user) => setMessages((prev) => [
      ...prev,
      { id: Date.now(), system: true, message: `${user.username} joined the chat`, timestamp: new Date().toISOString() },
    ]);
    const onUserLeft = (user) => setMessages((prev) => [
      ...prev,
      { id: Date.now(), system: true, message: `${user.username} left the chat`, timestamp: new Date().toISOString() },
    ]);
    // Typing events
    const onTypingUsers = (users) => setTypingUsers(users);
    // Room events
    const onRoomList = (roomList) => {
      // Optionally handle room list updates
    };
    const onRoomJoined = (roomName) => {
      // Optionally handle room joined
    };
    // Reaction events
    const onMessageReacted = ({ messageId, reactions }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    };
    // Read receipt events
    const onMessageRead = ({ messageId, readBy }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, readBy } : m));
    };
    // Unread count
    const onUnreadCount = (count) => {
      // Optionally handle unread count
    };
    // Notification events
    const onNotify = (data) => {
      // Optionally show browser/sound notification
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('New message', { body: data.message?.message || 'You have a new message!' });
      }
      // Optionally play sound
      if (window && window.document) {
        const audio = new window.Audio('/notification.mp3');
        audio.play().catch(() => {});
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
    socket.on('room_list', onRoomList);
    socket.on('room_joined', onRoomJoined);
    socket.on('message_reacted', onMessageReacted);
    socket.on('message_read', onMessageRead);
    socket.on('unread_count', onUnreadCount);
    socket.on('notify', onNotify);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('room_list', onRoomList);
      socket.off('room_joined', onRoomJoined);
      socket.off('message_reacted', onMessageReacted);
      socket.off('message_read', onMessageRead);
      socket.off('unread_count', onUnreadCount);
      socket.off('notify', onNotify);
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    joinRoom,
    sendFile,
    reactMessage,
    readMessage,
  };
};

export default socket; 