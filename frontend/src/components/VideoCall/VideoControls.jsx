import { Mic, MicOff, Video, VideoOff, Phone, Monitor, MessageSquare } from 'lucide-react';

export const VideoControls = ({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onToggleChat
}) => {
  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-gray-800 rounded-lg">
      <button
        onClick={onToggleAudio}
        className={`p-4 rounded-full transition-all ${
          isAudioMuted 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gray-700 hover:bg-gray-600'
        }`}
        title={isAudioMuted ? 'Unmute' : 'Mute'}
      >
        {isAudioMuted ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>

      <button
        onClick={onToggleVideo}
        className={`p-4 rounded-full transition-all ${
          isVideoOff 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gray-700 hover:bg-gray-600'
        }`}
        title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {isVideoOff ? (
          <VideoOff className="w-6 h-6 text-white" />
        ) : (
          <Video className="w-6 h-6 text-white" />
        )}
      </button>

      <button
        onClick={onToggleScreenShare}
        className={`p-4 rounded-full transition-all ${
          isScreenSharing 
            ? 'bg-blue-500 hover:bg-blue-600' 
            : 'bg-gray-700 hover:bg-gray-600'
        }`}
        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        <Monitor className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={onToggleChat}
        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
        title="Toggle chat"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={onEndCall}
        className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
        title="End call"
      >
        <Phone className="w-6 h-6 text-white transform rotate-135" />
      </button>
    </div>
  );
};
