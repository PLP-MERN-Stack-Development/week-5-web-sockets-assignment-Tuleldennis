
import React, { useState } from 'react';
import { useSocket } from '../socket/socket';

const ChatApp = () => {
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');
  const [joined, setJoined] = useState(false);
  const [typing, setTyping] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [privateInput, setPrivateInput] = useState('');
  const [privateMessages, setPrivateMessages] = useState({});
  const [room, setRoom] = useState('global');
  const [newRoom, setNewRoom] = useState('');
  const [rooms, setRooms] = useState(['global']);
  const {
    isConnected,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping: setTypingStatus,
  } = useSocket();

  const handleJoin = () => {
    if (username.trim()) {
      connect(username);
      setJoined(true);
    }
  };

  const handleRoomChange = (roomName) => {
    setRoom(roomName);
    setSelectedUser(null);
  };

  const handleCreateRoom = () => {
    if (newRoom.trim() && !rooms.includes(newRoom.trim())) {
      setRooms([...rooms, newRoom.trim()]);
      setRoom(newRoom.trim());
      setNewRoom('');
      setSelectedUser(null);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ message: input, room });
      setInput('');
      setTyping(false);
      setTypingStatus(false);
    }
  };

  const handlePrivateSend = (e) => {
    e.preventDefault();
    if (privateInput.trim() && selectedUser) {
      sendPrivateMessage(selectedUser.id, privateInput);
      setPrivateMessages((prev) => ({
        ...prev,
        [selectedUser.id]: [
          ...(prev[selectedUser.id] || []),
          { sender: username, message: privateInput, timestamp: new Date().toISOString() },
        ],
      }));
      setPrivateInput('');
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!typing) {
      setTyping(true);
      setTypingStatus(true);
    }
    if (e.target.value === '') {
      setTyping(false);
      setTypingStatus(false);
    }
  };

  return (
    <div className="chat-app" style={{ maxWidth: 900, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8, display: 'flex', gap: 24 }}>
      {!joined ? (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h2>Join Chat</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ padding: 8, width: '80%' }}
          />
          <br /><br />
          <button onClick={handleJoin} style={{ padding: '8px 24px' }}>Join</button>
        </div>
      ) : (
        <>
          {/* Sidebar for users and rooms */}
          <div style={{ minWidth: 200, borderRight: '1px solid #eee', paddingRight: 16 }}>
            <div style={{ marginBottom: 24 }}>
              <strong>Rooms</strong>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {rooms.map(r => (
                  <li key={r}>
                    <button onClick={() => handleRoomChange(r)} style={{ background: r === room ? '#007bff' : '#eee', color: r === room ? '#fff' : '#333', border: 'none', padding: '4px 12px', borderRadius: 4, margin: '2px 0', width: '100%', textAlign: 'left' }}>{r}</button>
                  </li>
                ))}
              </ul>
              <input type="text" value={newRoom} onChange={e => setNewRoom(e.target.value)} placeholder="New room..." style={{ width: '100%', marginTop: 8, padding: 4 }} />
              <button onClick={handleCreateRoom} style={{ width: '100%', marginTop: 4, padding: 4 }}>Create Room</button>
            </div>
            <div>
              <strong>Online Users</strong>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.filter(u => u.username !== username).map(u => (
                  <li key={u.id}>
                    <button onClick={() => setSelectedUser(u)} style={{ background: selectedUser?.id === u.id ? '#007bff' : '#eee', color: selectedUser?.id === u.id ? '#fff' : '#333', border: 'none', padding: '4px 12px', borderRadius: 4, margin: '2px 0', width: '100%', textAlign: 'left' }}>{u.username}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Main chat area */}
          <div style={{ flex: 1 }}>
            {!selectedUser ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <strong>Room:</strong> {room}
                </div>
                <div style={{ height: 250, overflowY: 'auto', border: '1px solid #eee', padding: 8, marginBottom: 16, background: '#fafafa' }}>
                  {messages.filter(msg => (msg.room || 'global') === room).map((msg, idx) => (
                    <div key={msg.id || idx} style={{ marginBottom: 8 }}>
                      <span style={{ color: '#007bff' }}>{msg.sender || 'Anonymous'}</span>:
                      <span style={{ marginLeft: 8 }}>{msg.message}</span>
                      <span style={{ float: 'right', color: '#888', fontSize: 12 }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</span>
                    </div>
                  ))}
                  {typingUsers.length > 0 && (
                    <div style={{ color: '#888', fontStyle: 'italic' }}>
                      {typingUsers.join(', ')} typing...
                    </div>
                  )}
                </div>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onBlur={() => { setTyping(false); setTypingStatus(false); }}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: 8 }}
                    disabled={!isConnected}
                  />
                  <button type="submit" style={{ padding: '8px 16px' }} disabled={!isConnected || !input.trim()}>Send</button>
                  <button type="button" onClick={disconnect} style={{ padding: '8px 16px', background: '#f44336', color: '#fff' }}>Leave</button>
                </form>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <strong>Private chat with:</strong> {selectedUser.username}
                </div>
                <div style={{ height: 250, overflowY: 'auto', border: '1px solid #eee', padding: 8, marginBottom: 16, background: '#fafafa' }}>
                  {(privateMessages[selectedUser.id] || []).map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: 8 }}>
                      <span style={{ color: msg.sender === username ? '#007bff' : '#333' }}>{msg.sender}</span>:
                      <span style={{ marginLeft: 8 }}>{msg.message}</span>
                      <span style={{ float: 'right', color: '#888', fontSize: 12 }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handlePrivateSend} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={privateInput}
                    onChange={e => setPrivateInput(e.target.value)}
                    placeholder="Type a private message..."
                    style={{ flex: 1, padding: 8 }}
                    disabled={!isConnected}
                  />
                  <button type="submit" style={{ padding: '8px 16px' }} disabled={!isConnected || !privateInput.trim()}>Send</button>
                  <button type="button" onClick={() => setSelectedUser(null)} style={{ padding: '8px 16px', background: '#888', color: '#fff' }}>Back</button>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatApp;
