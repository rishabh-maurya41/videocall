import { useEffect, useRef } from 'react';

export const VideoStream = ({ stream, isLocal, userName, userType, isMuted, isVideoOff }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {userName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white font-medium">{userName}</p>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full">
        <span className="text-white text-sm font-medium">
          {userName} {isLocal && '(You)'}
        </span>
        {isMuted && (
          <span className="ml-2 text-red-400 text-xs">🔇 Muted</span>
        )}
      </div>

      <div className="absolute top-4 right-4">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          userType === 'doctor' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {userType === 'doctor' ? 'Doctor' : 'Patient'}
        </span>
      </div>
    </div>
  );
};
