import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { VideoCall } from './components/VideoCall/VideoCall';
import { Home } from './pages/Home';

// Wrapper component to handle URL parameters
function VideoCallWrapper() {
  const [searchParams] = useSearchParams();
  
  // Get user info from URL parameters or generate random for testing
  const userId = searchParams.get('userId') || `user-${Math.random().toString(36).substr(2, 9)}`;
  const userName = searchParams.get('userName') || `User ${Math.floor(Math.random() * 1000)}`;
  const userType = searchParams.get('userType') || (Math.random() > 0.5 ? 'doctor' : 'patient');
  
  return (
    <VideoCall 
      userId={userId} 
      userName={userName} 
      userType={userType} 
    />
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/call/:roomId" element={<VideoCallWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;
