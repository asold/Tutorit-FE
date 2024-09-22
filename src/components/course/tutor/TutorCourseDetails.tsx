import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, Divider } from '@mui/material';
import { useParams } from 'react-router-dom';
import { CourseDto } from '../../../types/courseDto.ts';
import { SERVER_ADDRESS } from '../../../common/constants.ts';
import CourseApplicationsList from './CourseApplicationsList.tsx';
import UserCalendar from '../../users/UserCalendar.tsx'; // Import the UserCalendar component

const TutorCourseDetails: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<CourseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const token = localStorage.getItem('token');

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
            <Card sx={{ marginBottom: 2, backgroundImage: `url(${course.image})`, backgroundSize: 'cover', color: 'white' }}>
                <CardContent>
                    <Typography variant="h5">{course.name}</Typography>
                    <Typography variant="body1">{course.description}</Typography>
                </CardContent>
            </Card>

            <Box display="flex" sx={{ width: '100%', mt: 2 }}>
                {/* Left Column: List of Applications */}
                <Box flex={1} sx={{ pr: 2 }}>
                    <Typography variant="h6">List of Applications</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <CourseApplicationsList />
                </Box>

                {/* Divider between the two columns */}
                <Divider orientation="vertical" flexItem />

                {/* Right Column: Calendar */}
                <Box flex={2} sx={{ pl: 2 }}>
                    <Typography variant="h6">Calendar</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <UserCalendar selectedCourse={courseId} />
                </Box>
            </Box>
        </Box>
    );
};

export default TutorCourseDetails;
