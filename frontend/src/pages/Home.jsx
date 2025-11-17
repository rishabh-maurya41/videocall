import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';

export const Home = () => {
  const [appointmentId, setAppointmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const createMeeting = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
       const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/create-meeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointmentId || `appt-${Date.now()}`,
          doctorId: 'doctor-123',
          patientId: 'patient-456',
          scheduledTime: new Date()
        })
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/call/${data.data.roomId}`);
      } else {
        setError(data.message || 'Failed to create meeting');
      }
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const joinMeeting = (e) => {
    e.preventDefault();
    if (appointmentId) {
      navigate(`/call/room-${appointmentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Telehealth Video Call
          </h1>
          <p className="text-gray-600">
            Connect with your doctor or patient securely
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={createMeeting} className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment ID (optional)
            </label>
            <input
              type="text"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              placeholder="Enter appointment ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create New Meeting'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <form onSubmit={joinMeeting}>
          <button
            type="submit"
            disabled={!appointmentId || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Join Existing Meeting
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ HD Video & Audio</li>
            <li>✓ Screen Sharing</li>
            <li>✓ In-call Chat</li>
            <li>✓ Secure & Private</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
