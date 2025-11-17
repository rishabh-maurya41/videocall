import { Loader2 } from 'lucide-react';

export const WaitingRoom = ({ userName, userType }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="text-center">
        <div className="mb-8">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Waiting for {userType === 'doctor' ? 'patient' : 'doctor'} to join...
        </h2>
        <p className="text-gray-300 mb-8">
          You're in the waiting room. The call will start automatically when the other participant joins.
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
          <p className="text-white mb-2">You're joining as:</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {userName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">{userName}</p>
              <p className={`text-sm ${
                userType === 'doctor' ? 'text-blue-300' : 'text-green-300'
              }`}>
                {userType === 'doctor' ? 'Doctor' : 'Patient'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
