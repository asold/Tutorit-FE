import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Divider } from '@mui/material';
import StudentListOfCourses from '../course/student/StudentListOfCourses.tsx';
import UserCalendar from '../users/UserCalendar.tsx';  // Import the calendar component

const StudentMain: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToCall = () => {
    navigate('/video');
  };

  return (
    <Container maxWidth="lg" sx={{ textAlign: 'center', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Student Main
      </Typography>
      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleNavigateToCall}
        sx={{ padding: '10px 20px', marginTop: '20px', marginBottom: '20px' }}
      >
        Call someone
      </Button> */}

      {/* List of Courses Section */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <StudentListOfCourses />
      </Box>

      {/* Calendar Section */}
      <Box display="flex" justifyContent="center" sx={{ mt: 4, px: '10%' }}>
        <Box sx={{ width: '80%' }}>
          <Typography variant="h6">Calendar</Typography>
          <Divider sx={{ mb: 2 }} />
          <UserCalendar />
        </Box>
      </Box>
    </Container>
  );
};

export default StudentMain;
