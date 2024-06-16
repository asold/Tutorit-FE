import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, Snackbar } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCourseForm from '../course/AddCourseForm.tsx';

const TeacherMainPage: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    const displaySuccessMessage = () => {
        setSnackbarOpen(true);
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleSnackbarClose = () => setSnackbarOpen(false);

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
                    <AddCourseForm onSubmit={displaySuccessMessage} onClose={handleClose} />
                </DialogContent>
            </Dialog>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    Course added successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherMainPage;
