import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { SERVER_ADDRESS } from '../../../common/constants.ts';
import { useParams } from 'react-router-dom';
import CourseApplicationModal from './CourseApplicationModal.tsx';

// Define the CourseApplicationDto and UserDto types
interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  email: string;
  username: string;
  role: string;
}

interface CourseApplicationDto {
  id: string;
  student: UserDto;
  studentSideNote?: string;
  createdAt: string;
  firstMeetingReques: string;
  courseId: string;
  applicationStatus:number;

}

const CourseApplicationsList: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>(); // Get the course ID from URL params
  const [applications, setApplications] = useState<CourseApplicationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<CourseApplicationDto | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);



  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER_ADDRESS}/tutorit/Course/course_applications?courseId=${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    
      if (response.ok) {
        const responseText = await response.text(); // Read the response as text first
        
        if (responseText) {
          // If responseText is not empty, parse it as JSON
          const data: CourseApplicationDto[] = JSON.parse(responseText);
          setApplications(data);
        } else {
          // Handle empty response body
          setApplications([]); // Set an empty array if there are no applications
        }
      } else {
        setError(`Failed to fetch course applications. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching course applications:', error);
      setError('An error occurred while fetching course applications.');
    } finally {
      setLoading(false);
    }
    
  };

  useEffect(() => {
    fetchApplications();
  }, [courseId]);

  const handleViewDetails = (application: CourseApplicationDto) => {
    setSelectedApplication(application);
    setModalOpen(true);
  };

  const handleCloseModal = async () => {
    setModalOpen(false);
    setSelectedApplication(null);
    fetchApplications();
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6">Course Applications</Typography>
      {applications.map((application) => (
        <Card key={application.id} sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="body1">
              Student: {application.student.firstName} {application.student.lastName} applied for the course on {new Date(application.createdAt).toLocaleString()}.
            </Typography>
            <Button variant="outlined" onClick={() => handleViewDetails(application)}>
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}

      <CourseApplicationModal
        open={modalOpen}
        onClose={handleCloseModal}
        application={selectedApplication}
      />
    </Box>
  );
};

export default CourseApplicationsList;
