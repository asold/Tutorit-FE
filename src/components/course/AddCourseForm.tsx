// AddCourseForm.tsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { CourseDto } from '../../types/courseDto.ts';
import { SERVER_ADDRESS } from '../../common/constants.ts';

interface AddCourseFormProps {
    onSubmit: (course: CourseDto) => void;
    onClose: () => void;
}

interface Course {
    name: string;
    description: string;
    language: string;
    tutorId: string | null;
}

const AddCourseForm: React.FC<AddCourseFormProps> = ({ onSubmit, onClose }) => {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [language, setLanguage] = useState<string>('');

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const course: Course = { name, description, language, tutorId: userId };

        try {
            const response = await fetch(`${SERVER_ADDRESS}/tutorit/Course`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(course),
            });

            if (!response.ok) {
                throw new Error('Failed to add course');
            }

            console.log(response, 'response')

            const newCourse: CourseDto = await response.json();
            onSubmit(newCourse);
            onClose();
        } catch (error) {
            console.error('Error adding course:', error);
        }
    };

    return (
        <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, margin: 'auto' }}
        >
            <Typography variant="h5">Add New Course</Typography>
            <TextField
                label="Course Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <TextField
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <TextField
                label="Language"
                variant="outlined"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
            />
            <Button type="submit" variant="contained" color="primary">
                Add Course
            </Button>
        </Box>
    );
};

export default AddCourseForm;
