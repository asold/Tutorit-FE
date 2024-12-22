import { Box, Typography, Card, CardContent, Rating, Button, IconButton } from '@mui/material';
import React, { useState } from 'react';
import { CourseDto } from '../../../types/courseDto.ts';
import { SERVER_ADDRESS } from '../../../common/constants.ts';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface ListOfCoursesProps {
    courses: CourseDto[];
    onDelete: (courseId: string) => void;
}

const ListOfCourses: React.FC<ListOfCoursesProps> = ({ courses, onDelete }) => {
    const navigate = useNavigate();
    const [startIndex, setStartIndex] = useState(0);
    const coursesPerPage = 3;

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

    const handleCourseDetails = (courseId: string) => {
        navigate(`/courseDetails/${courseId}`);
    };

    const visibleCourses = courses.slice(startIndex, startIndex + coursesPerPage);

    const handleNext = () => {
        if (startIndex + coursesPerPage < courses.length) {
            setStartIndex(startIndex + coursesPerPage);
        }
    };

    const handlePrevious = () => {
        if (startIndex - coursesPerPage >= 0) {
            setStartIndex(startIndex - coursesPerPage);
        }
    };

    return (
        <Box sx={{ width: '100%', margin: 'auto', mt: 4 }}>
            {/* Navigation buttons */}
            <Box display="flex" justifyContent="space-around" mb={2}>
                <IconButton onClick={handlePrevious} disabled={startIndex === 0}>
                    <ArrowBackIcon />
                </IconButton>
                <IconButton onClick={handleNext} disabled={startIndex + coursesPerPage >= courses.length}>
                    <ArrowForwardIcon />
                </IconButton>
            </Box>

            {/* Display Courses with Center Alignment */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: visibleCourses.length <= 2 ? 'center' : 'center',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                    width: '100%',
                }}
            >
                {visibleCourses.map((course) => (
                    <Card key={course.id} sx={{ width: '30%', minWidth: 250 }}>
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
                                color="primary"
                                onClick={() => handleCourseDetails(course.id)}
                                sx={{ marginTop: 2, marginRight: 1 }}
                            >
                                Course Details
                            </Button>
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
        </Box>

    );
};

export default ListOfCourses;
