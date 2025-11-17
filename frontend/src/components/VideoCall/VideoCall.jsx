import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import { VideoStream } from './VideoStream';
import { VideoControls } from './VideoControls';
import { ChatPanel } from './ChatPanel';
import { WaitingRoom } from './WaitingRoom';
import { AlertCircle } from 'lucide-react';

export const VideoCall = ({ userId, userName, userType }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [hasRemoteUser, setHasRemoteUser] = useState(false);

  // Debug logging
  console.log('VideoCall render:', {
    userId,
    userName,
    userType,
    roomId,
    hasRemoteUser,
    isConnected,
    socketId: socket?.id
  });

  const {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    connectionState,
    error,
    remoteUserInfo,
    setRemoteUserInfo,
    initializeMedia,
    createPeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    cleanup
  } = useWebRTC(socket, roomId, userId, userType, userName);

  // Initialize media and join room
  useEffect(() => {
    if (!socket || !isConnected) return;

    const init = async () => {
      try {
        const stream = await initializeMedia();
        createPeerConnection(stream);

        socket.emit('join-room', {
          roomId,
          userId,
          userType,
          userName
        });
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    init();
  }, [socket, isConnected, roomId, userId, userType, userName]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('room-users', (users) => {
      console.log('📋 Current users in room:', users);
      console.log('📋 My userId:', userId);
      console.log('📋 Users count:', users.length);
      if (users.length > 1) {
        console.log('✅ Multiple users detected, setting hasRemoteUser = true');
        setHasRemoteUser(true);
        const otherUser = users.find(u => u.userId !== userId);
        if (otherUser) {
          console.log('✅ Found other user:', otherUser);
          setRemoteUserInfo(otherUser);
        }
      } else {
        console.log('⏳ Only one user in room, waiting...');
      }
    });

    socket.on('user-joined', ({ socketId, userId: joinedUserId, userType: joinedUserType, userName: joinedUserName }) => {
      console.log('👤 User joined:', joinedUserName);
      console.log('👤 Joined userId:', joinedUserId);
      console.log('👤 My userId:', userId);
      console.log('👤 Are they different?', joinedUserId !== userId);
      
      if (joinedUserId !== userId) {
        console.log('✅ Different user! Setting hasRemoteUser = true');
        setHasRemoteUser(true);
        setRemoteUserInfo({ socketId, userId: joinedUserId, userType: joinedUserType, userName: joinedUserName });
        setCallStartTime(new Date());
        
        // Create offer for the new user
        setTimeout(() => {
          console.log('📞 Creating offer for:', socketId);
          createOffer(socketId);
        }, 1000);
      } else {
        console.log('⚠️ Same user, ignoring');
      }
    });
    socket.on('offer', async ({ offer, socketId }) => {
      console.log('Received offer from:', socketId);
      await handleOffer(offer, socketId);
      setCallStartTime(new Date());
    });

    socket.on('answer', async ({ answer }) => {
      console.log('Received answer');
      await handleAnswer(answer);
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      await handleIceCandidate(candidate);
    });

    socket.on('user-left', ({ userName: leftUserName }) => {
      console.log('User left:', leftUserName);
      setHasRemoteUser(false);
      setRemoteUserInfo(null);
    });

    socket.on('screen-share-toggle', ({ isSharing, userName: sharingUserName }) => {
      console.log(`${sharingUserName} ${isSharing ? 'started' : 'stopped'} screen sharing`);
    });

    return () => {
      socket.off('room-users');
      socket.off('user-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-left');
      socket.off('screen-share-toggle');
    };
  }, [socket, userId, createOffer, handleOffer, handleAnswer, handleIceCandidate]);

  // Call duration timer
  useEffect(() => {
    if (!callStartTime) return;

    const interval = setInterval(() => {
      const duration = Math.floor((new Date() - callStartTime) / 1000);
      setCallDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.emit('leave-call', { roomId, userId });
      }
      cleanup();
    };
  }, [socket, roomId, userId, cleanup]);

  const handleEndCall = () => {
    if (socket) {
      socket.emit('leave-call', { roomId, userId });
    }
    cleanup();
    navigate('/');
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-semibold text-white">Error</h3>
          </div>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!hasRemoteUser) {
    return <WaitingRoom userName={userName} userType={userType} />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-semibold">Video Call</h2>
            <p className="text-gray-400 text-sm">Room: {roomId}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm">
                {connectionState === 'connected' ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            {callStartTime && (
              <div className="text-white text-sm font-mono">
                {formatDuration(callDuration)}
              </div>
            )}
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Remote Video */}
          <div className="relative">
            <VideoStream
              stream={remoteStream}
              isLocal={false}
              userName={remoteUserInfo?.userName}
              userType={remoteUserInfo?.userType}
              isMuted={false}
              isVideoOff={!remoteStream}
            />
          </div>

          {/* Local Video */}
          <div className="relative">
            <VideoStream
              stream={localStream}
              isLocal={true}
              userName={userName}
              userType={userType}
              isMuted={isAudioMuted}
              isVideoOff={isVideoOff}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="p-6">
          <VideoControls
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
            onEndCall={handleEndCall}
            onToggleChat={() => setShowChat(!showChat)}
          />
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <ChatPanel
          socket={socket}
          roomId={roomId}
          userName={userName}
          userType={userType}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};
