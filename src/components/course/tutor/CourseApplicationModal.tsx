import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Modal, Button } from '@mui/material';
import { ApplicationStatus, changeCourseApplicationStatus } from '../../../dataHandlers/courses/commands/changeCourseApplicationStatus.ts';

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
  applicationStatus: number;
}

interface CourseApplicationModalProps {
  open: boolean;
  onClose: () => void;
  application: CourseApplicationDto | null;
}

const CourseApplicationModal: React.FC<CourseApplicationModalProps> = ({ open, onClose, application }) => {

  const [status, setStatus] = useState<ApplicationStatus>(
    application ? application.applicationStatus as ApplicationStatus : ApplicationStatus.Pending
  );
  const [loading, setLoading] = useState(false);
  const tutorId = localStorage.getItem('userId') || ''; // Get tutor ID from localStorage

  // Use useEffect to update the status based on application data when the component loads or application changes
  useEffect(() => {
    if (application) {
      setStatus(application.applicationStatus as ApplicationStatus);
    }
  }, [application]);

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    setStatus(newStatus);
  };

  const handleSubmitStatus = async () => {
    if (!application) return;
  
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || ''; // Replace with actual token logic
  
      await changeCourseApplicationStatus(
        application.id,
        tutorId,
        status,
        token,
        application.courseId
      );
  
      alert('Status updated successfully!');
      
      // After successful update, close modal
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, backgroundColor: 'white', borderRadius: 2, width: 400, margin: 'auto', mt: 10 }}>
        {application && (
          <>
            <Avatar
              alt={`${application.student.firstName} ${application.student.lastName}`}
              src={`data:image/png;base64,${application.student.photoUrl}`}
              sx={{ width: 56, height: 56, marginBottom: 2 }}
            />
            <Typography variant="h6">
              {application.student.firstName} {application.student.lastName}
            </Typography>
            <Typography>Email: {application.student.email}</Typography>
            <Typography>Username: {application.student.username}</Typography>
            <Typography>Role: {application.student.role}</Typography>
            <Typography>
              Application Created At: {new Date(application.createdAt).toLocaleString()}
            </Typography>
            {application.firstMeetingReques && (
              <Typography>
                First Meeting Request: {new Date(application.firstMeetingReques).toLocaleString()}
              </Typography>
            )}
            {application.studentSideNote && (
              <Typography>Student Side Note: {application.studentSideNote}</Typography>
            )}

            {/* Status Buttons */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant={status === ApplicationStatus.Pending ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: status === ApplicationStatus.Pending ? '#808080' : 'transparent', // Grey for pending
                  color: status === ApplicationStatus.Pending ? 'white' : '#808080', // Grey text for outlined
                }}
                onClick={() => handleStatusChange(ApplicationStatus.Pending)}
              >
                Pending
              </Button>

              <Button
                variant={status === ApplicationStatus.Approved ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: status === ApplicationStatus.Approved ? '#90ee90' : 'transparent', // Light green for accepted
                  color: status === ApplicationStatus.Approved ? 'white' : '#90ee90', // Light green text for outlined
                }}
                onClick={() => handleStatusChange(ApplicationStatus.Approved)}
              >
                Accepted
              </Button>

              <Button
                variant={status === ApplicationStatus.Rejected ? 'contained' : 'outlined'}
                sx={{
                  backgroundColor: status === ApplicationStatus.Rejected ? '#f08080' : 'transparent', // Pale red for declined
                  color: status === ApplicationStatus.Rejected ? 'white' : '#f08080', // Pale red text for outlined
                }}
                onClick={() => handleStatusChange(ApplicationStatus.Rejected)}
              >
                Declined
              </Button>
            </Box>

            {/* Submit Button */}
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitStatus}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Updating...' : 'Submit'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default CourseApplicationModal;
