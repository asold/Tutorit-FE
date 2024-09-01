import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { useParams } from 'react-router-dom';
import { CourseDto } from '../../../types/courseDto.ts';
import { SERVER_ADDRESS } from '../../../common/constants.ts';
import CourseApplicationsList from './CourseApplicationsList.tsx'; // Import the CourseApplicationsList component

const TutorCourseDetails: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>(); // Get the course ID from URL params
    const [course, setCourse] = useState<CourseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const token = localStorage.getItem('token');

                console.log("Course Id:", courseId);
                console.log("User Token:", token);

                const response = await fetch(`${SERVER_ADDRESS}/tutorit/Teacher/course_details?courseId=${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data: CourseDto = await response.json();
                    setCourse(data);
                } else {
                    setError('Failed to fetch course details.');
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
                setError('An error occurred while fetching course details.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!course) {
        return <Typography color="error">No course details available.</Typography>;
    }

    return (
        <Box>
            {/* Display course details similar to the layout in your sketch */}
            <Card sx={{ marginBottom: 2, backgroundImage: `url(${course.image})`, backgroundSize: 'cover', color: 'white' }}>
                <CardContent>
                    <Typography variant="h4" contentEditable sx={{ display: 'inline-block', marginRight: 2 }}>
                        {course.name}
                    </Typography>
                    <Typography variant="body1" contentEditable sx={{ display: 'inline-block', marginRight: 2 }}>
                        {course.language}
                    </Typography>
                    <Typography variant="h5" sx={{ position: 'absolute', right: 16, top: 16 }}>
                        {course.rating.toFixed(1)}
                    </Typography>
                </CardContent>
            </Card>

            <Box display="flex">
                <Box flex={1}>
                    <Typography variant="h6">List of Applications</Typography>
                    {/* Replace the placeholder with the actual component */}
                    <CourseApplicationsList />
                </Box>
                <Box flex={2}>
                    <Typography variant="h6">Calendar (monthly)</Typography>
                    {/* Placeholder for Calendar component */}
                </Box>
            </Box>
        </Box>
    );
};

export default TutorCourseDetails;
