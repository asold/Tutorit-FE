import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import LoginComponent from './components/LoginComponent.tsx';
import VideoCallPage from './components/videoCalls/VideoCallPage.tsx';
import LanguageSwitcher from './components/language/LanguageSwitcher.tsx';
import PersonalRegistration from './components/registration/PersonalRegistration.tsx';
import UserRegistarion from './components/registration/UserRegistarion.tsx';
import TeacherMainPage from './components/teacherComponents/TeacherMainPage.tsx';
import StudentMain from './components/studentComponents/StudentMain.tsx';
import PrivateRoute from './common/PrivateRoute.tsx';
import TutorCourseDetails from './components/course/tutor/TutorCourseDetails.tsx'
import IncommingCallHandler from './components/videoCalls/globalCall/IncommingCallHandler.tsx'
import CallerReceiverBox from './components/videoCalls/globalCall/CallerReceiverBox.tsx';
function App() {
  return (
    <Router>
      <div>
        <LanguageSwitcher />
        <IncommingCallHandler/>
        <CallerReceiverBox/>

        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/video" element={<PrivateRoute><VideoCallPage /></PrivateRoute>} />
          <Route path="/register" element={<PersonalRegistration />} />
          <Route path="/user-creation" element={<UserRegistarion />} />
          <Route path="/teacher_main" element={<PrivateRoute><TeacherMainPage /></PrivateRoute>} />
          <Route path="/student_main" element={<PrivateRoute><StudentMain /></PrivateRoute>} />
          <Route index element={<Navigate to="/login" />} />
          <Route path="/courseDetails/:courseId" element={<TutorCourseDetails />} /> {/* Add this route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
