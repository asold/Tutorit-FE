import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, Snackbar, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCourseForm from '../course/AddCourseForm.tsx';
import ListOfCourses from '../course/ListOfCourses.tsx';
import { CourseDto } from '../../types/courseDto.ts';
import { SERVER_ADDRESS } from '../../common/constants.ts';

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
            setError(err.message);
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
            <Button 
                onClick={handleOpen}
                variant="contained"
            >
                Create a New Course
            </Button>
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
            {loading ? <CircularProgress /> : error ? <Typography color="error">{error}</Typography> : <ListOfCourses courses={courses} onDelete={handleDeleteCourse} />}
        </Box>
    );
};

export default TeacherMainPage;
