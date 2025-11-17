import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VideoCall } from './components/VideoCall/VideoCall';
import { Home } from './pages/Home';

function App() {
  // In production, get these from your auth system
  const userId = 'user-123'; // Replace with actual user ID
  const userName = 'Dr. Smith'; // Replace with actual user name
  const userType = 'doctor'; // 'doctor' or 'patient'

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/call/:roomId" 
          element={
            <VideoCall 
              userId={userId} 
              userName={userName} 
              userType={userType} 
            />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
