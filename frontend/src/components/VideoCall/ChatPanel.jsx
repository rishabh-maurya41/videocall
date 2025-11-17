import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';

export const ChatPanel = ({ socket, roomId, userName, userType, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    socket.emit('chat-message', {
      roomId,
      message: inputMessage,
      userName,
      userType
    });

    setInputMessage('');
  };

  return (
    <div className="w-80 h-full bg-gray-800 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">Chat</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              msg.userName === userName ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium ${
                msg.userType === 'doctor' ? 'text-blue-400' : 'text-green-400'
              }`}>
                {msg.userName}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg ${
              msg.userName === userName
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-white'
            }`}>
              <p className="text-sm">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
};
