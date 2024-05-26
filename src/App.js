import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';

import LoginComponent  from './components/LoginComponent.tsx';
import VideoCallPage from './components/VideoCallPage.tsx';
import LanguageSwitcher from './components/language/LanguageSwitcher.tsx';
import PersonalRegistration from './components/registration/PersonalRegistration.tsx';
import UserRegistarion from './components/registration/UserRegistarion.tsx';

function App() {
  return (
    <Router>
      <div>
        <LanguageSwitcher />
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/video" element={<VideoCallPage />} />
          <Route path="/register" element={<PersonalRegistration />} />
          <Route path="/user-creation" element={<UserRegistarion />} />
          <Route index element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
