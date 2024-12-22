import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, Snackbar, CircularProgress, Typography, Divider, Fab } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseDto } from '../../types/courseDto.ts';
import { SERVER_ADDRESS } from '../../common/constants.ts';
import AddCourseForm from '../course/tutor/AddCourseForm.tsx';
import ListOfCourses from '../course/tutor/ListOfCourses.tsx';
import UserCalendar from '../users/UserCalendar.tsx';  // Import the UserCalendar component
import AddIcon from '@mui/icons-material/Add';

const TeacherMainPage: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [courses, setCourses] = useState<CourseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const displaySuccessMessage = () => {
        setSnackbarOpen(true);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleSnackbarClose = () => setSnackbarOpen(false);

    const tutorId = localStorage.getItem('userId');

    const navigateToCall = () => {
        navigate('/video');
    };

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${SERVER_ADDRESS}/tutorit/Course/${tutorId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }

            const data = await response.json();
            setCourses(data);
        } catch (err) {
            console.error(err);
            // setError(err.message);
            fetchCourses();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [tutorId]);

    const handleAddCourse = (newCourse: CourseDto) => {
        setCourses((prevCourses) => [...prevCourses, newCourse]);
        displaySuccessMessage();
    };

    const handleDeleteCourse = (courseId: string) => {
        setCourses((prevCourses) => prevCourses.filter(course => course.id !== courseId));
    };

    return (
        <Box>
            <h1>Teacher Main Page</h1>
            <Box
                display= 'flex' 
                flex-direction={{xs: 'column', md: 'row'}}
                justifyContent="flex-start"
                alignItems="center"
                width={{ xs: '100%', md: '50%' }}
                paddingLeft={{ xs: 0, md: 2 }}
                marginLeft={0}
                gap={2}
            >
                <Fab
                    sx={{
                        backgroundColor: '#6db5a0', 
                        color: '#ffffff', 
                        py: 1.5, 
                        '&:hover': { backgroundColor: '#5a9d8d' }
                    }}
                    title = "Create a New Course"
                    onClick={handleOpen}
                >
                    <AddIcon/>
                </Fab>
                <Button 
                    sx={{
                        backgroundColor: '#6db5a0', 
                        color: '#ffffff', 
                        py: 1.5, 
                        '&:hover': { backgroundColor: '#5a9d8d' }
                    }}
                    onClick={navigateToCall}
                    variant="contained"
                >
                    Make a Video Call    
                </Button>
            </Box>
            
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogContent>
                    <AddCourseForm onSubmit={handleAddCourse} onClose={handleClose} />
                </DialogContent>
            </Dialog>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    Course added successfully!
                </Alert>
            </Snackbar>

            {/* Horizontal Scrolling Carousel for Courses */}
            {/* {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <ListOfCourses courses={courses} onDelete={handleDeleteCourse} />
            )} */}

            <Box
                title="Courses"
                display="flex"
                justifyContent={courses.length <= 2 ? 'center' : 'flex-start'}
                alignItems="center"
                overflow={courses.length > 2 ? 'auto' : 'visible'}
                gap={2}
                width="100%"
                padding={2}
            >
                <ListOfCourses 
                    courses={courses} 
                    onDelete={handleDeleteCourse} 
                />
            </Box>

            {/* Adjust Calendar Size and Centering */}
            <Box display="flex" justifyContent="center" sx={{ mt: 4, px: '10%' }}>
                <Box sx={{ width: '80%' }}>
                    <Typography variant="h6">Calendar</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <UserCalendar />
                </Box>
            </Box>
        </Box>
    );
};

export default TeacherMainPage;
