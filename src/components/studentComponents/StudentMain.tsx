import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';
import StudentListOfCourses from '../course/student/StudentListOfCourses.tsx';

const StudentMain: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToCall = () => {
    navigate('/video');
  };

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Student Main
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleNavigateToCall}
        sx={{ padding: '10px 20px', marginTop: '20px', marginBottom: '20px' }}
      >
        Call someone
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <StudentListOfCourses/>
      </Box>
    </Container>
  );
};

export default StudentMain;
