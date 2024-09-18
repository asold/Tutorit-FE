import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, TextField, Card, CardContent, Avatar } from '@mui/material';
import { SERVER_ADDRESS } from '../../../common/constants.ts';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import FillCourseApplicationForm from './FillCourseApplicationForm.tsx';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { applyForCourse } from '../../../actions/course/courseActions.ts';

interface CourseAppliedStatus {
  courseId: string;
  applicationStatus: number; // 0: Pending, 1: Accepted, 2: Declined
}

interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  rating: number;
  language: string;
  tutor: Tutor;
  labels: string[];
}

const StudentListOfCourses: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const appliedCourses = useSelector((state: any) => state.courseList as CourseAppliedStatus[]);
  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();
  let token = useSelector((state: any) => state.auth.token);
  const language = useSelector((state: any) => state.globalLanguage.language);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_ADDRESS}/tutorit/Course/guest_courses?language=${language}`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      setCourses(data);

      // Fetch application statuses once courses are loaded
      await fetchApplicationStatuses(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationStatuses = async (courses: Course[]) => {
    token = localStorage.getItem('token');
    const encodedToken = encodeURIComponent(token);

    for (const course of courses) {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${SERVER_ADDRESS}/tutorit/Student/application_status?courseId=${course.id}&userId=${userId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const status = await response.json(); // Assuming status is a number (0: Pending, 1: Accepted, 2: Declined)

        // Dispatch action to update the Redux state with the course status
        if (status === 0 || status === 1 || status === 2) {
          await dispatch(applyForCourse(course.id, status)); // You may need to adjust the action to store the status
        }
      } catch (error) {
        console.error(`Failed to fetch status for course ${course.id}:`, error);
      }
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [language]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleApply = (courseId: string) => {
    setSelectedCourseId(courseId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourseId(null);
  };

  return (
    <Container>
      <Box sx={{ marginBottom: '20px', textAlign: 'center' }}>
        <TextField
          label={t('Language')}
          variant="outlined"
          value={language}
          onChange={handleLanguageChange}
          sx={{ marginBottom: '20px' }}
        />
      </Box>
      {loading ? (
        <Typography>{t('Loading courses...')}</Typography>
      ) : error ? (
        <Typography color="error">{t('Failed to load courses')}</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {courses.map((course) => {
            const appliedStatus = appliedCourses.find(appliedCourse => appliedCourse.courseId === course.id);

            let statusText = 'Apply for course';
            let buttonColor = '#007bff'; // Default blue for apply
            let isButtonDisabled = false;
            
            if (appliedStatus) {
              switch (appliedStatus.applicationStatus) {
                case 0: // Pending
                statusText = 'Awaiting approval';
                buttonColor = '#007bff'; // Blue color for pending
                isButtonDisabled = true;
                break;
              case 1: // Accepted
                statusText = 'Accepted by teacher';
                buttonColor = '#28a745'; // Green color for accepted
                isButtonDisabled = true;
                break;
              case 2: // Declined
                statusText = 'Declined by teacher';
                buttonColor = '#dc3545'; // Red color for declined
                isButtonDisabled = true;
                break;
              }
            }
            return (
              <Card
                key={course.id}
                sx={{
                  width: '100%',
                  maxWidth: '600px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6">{course.name}</Typography>
                  <Typography>
                    <strong>{t('Rating')}:</strong> {course.rating}
                  </Typography>
                  <Typography>
                    <strong>{t('Description')}:</strong> {course.description}
                  </Typography>
                  <Typography>
                    <strong>{t('Language')}:</strong> {course.language}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleApply(course.id)}
                    disabled={isButtonDisabled}
                    style={{ 
                      marginTop: '10px', 
                      backgroundColor: buttonColor, 
                      color: '#ffffff', // Ensure text color is white for contrast
                      cursor: isButtonDisabled ? 'not-allowed' : 'pointer', // Show "not-allowed" cursor for disabled button
                    }}
                  >
                    {statusText}
                  </Button>
                </CardContent>
                <Box sx={{ textAlign: 'center', marginLeft: '20px' }}>
                  <Avatar
                    src={course.tutor.photoUrl}
                    alt={`${course.tutor.firstName} ${course.tutor.lastName}`}
                    sx={{ width: 80, height: 80 }}
                  />
                  <Typography>{`${course.tutor.firstName} ${course.tutor.lastName}`}</Typography>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
      <FillCourseApplicationForm
        open={openDialog}
        onClose={handleCloseDialog}
        courseId={selectedCourseId}
        token={token}
        onSuccess={() => { /* Optionally refetch or update the state */ }}
      />
    </Container>
  );
};

export default StudentListOfCourses;
