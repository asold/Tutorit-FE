import { Box, Typography, Card, CardContent, Rating, CircularProgress, Button } from '@mui/material';
import React from 'react';
import { CourseDto } from '../../types/courseDto.ts';
import { SERVER_ADDRESS } from '../../common/constants.ts';

interface ListOfCoursesProps {
    courses: CourseDto[];
    onDelete: (courseId: string) => void;
}

const ListOfCourses: React.FC<ListOfCoursesProps> = ({ courses, onDelete }) => {
    const handleDelete = async (courseId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${SERVER_ADDRESS}/tutorit/Course/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete course: ${errorText}`);
            }

            onDelete(courseId);
        } catch (error) {
            console.error('Error deleting course:', error.message);
        }
    };

    return (
        <Box>
            {courses.map((course) => (
                <Card key={course.id} sx={{ marginBottom: 2 }}>
                    <CardContent>
                        <Typography variant="h5">{course.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {course.description}
                        </Typography>
                        <Rating value={course.rating} readOnly precision={0.5} />
                        <Typography variant="body2">Language: {course.language}</Typography>
                        <Typography variant="body2">Tutor: {course.tutor.fullName}</Typography>
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            onClick={() => handleDelete(course.id)}
                            sx={{ marginTop: 2 }}
                        >
                            Delete
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default ListOfCourses;
