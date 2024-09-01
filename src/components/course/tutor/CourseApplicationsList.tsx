import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Modal, Card, CardContent, Avatar } from '@mui/material';
import { SERVER_ADDRESS } from '../../../common/constants.ts';
import { useParams } from 'react-router-dom';

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
  acceptedByTeacher: number;
}

const CourseApplicationsList: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>(); // Get the course ID from URL params
  const [applications, setApplications] = useState<CourseApplicationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<CourseApplicationDto | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
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
          const data: CourseApplicationDto[] = await response.json();
          setApplications(data);
        } else {
          setError('Failed to fetch course applications.');
        }
      } catch (error) {
        console.error('Error fetching course applications:', error);
        setError('An error occurred while fetching course applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [courseId]);

  const handleViewDetails = (application: CourseApplicationDto) => {
    setSelectedApplication(application);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedApplication(null);
  };

  const handleAcceptApplication = async (applicationId: string) => {
    // Logic to accept application goes here
  };

  const handleDeclineApplication = async (applicationId: string) => {
    // Logic to decline application goes here
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

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ p: 4, backgroundColor: 'white', borderRadius: 2, width: 400, margin: 'auto', mt: 10 }}>
          {selectedApplication && (
            <>
              <Avatar
                alt={`${selectedApplication.student.firstName} ${selectedApplication.student.lastName}`}
                src={`data:image/png;base64,${selectedApplication.student.photoUrl}`}
                sx={{ width: 56, height: 56, marginBottom: 2 }}
              />
              <Typography variant="h6">{selectedApplication.student.firstName} {selectedApplication.student.lastName}</Typography>
              <Typography>Email: {selectedApplication.student.email}</Typography>
              <Typography>Username: {selectedApplication.student.username}</Typography>
              <Typography>Role: {selectedApplication.student.role}</Typography>
              <Typography>Application Created At: {new Date(selectedApplication.createdAt).toLocaleString()}</Typography>
              {selectedApplication.firstMeetingReques && (
                <Typography>First Meeting Request: {new Date(selectedApplication.firstMeetingReques).toLocaleString()}</Typography>
              )}
              {selectedApplication.studentSideNote && (
                <Typography>Student Side Note: {selectedApplication.studentSideNote}</Typography>
              )}

              <Box sx={{ mt: 2 }}>
                {!selectedApplication.acceptedByTeacher ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAcceptApplication(selectedApplication.id)}
                      sx={{ marginRight: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDeclineApplication(selectedApplication.id)}
                    >
                      Decline
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDeclineApplication(selectedApplication.id)}
                  >
                    Decline
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default CourseApplicationsList;
