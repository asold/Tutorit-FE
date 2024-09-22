import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Grid, Paper, Button, ToggleButton, ToggleButtonGroup, IconButton } from '@mui/material';
import { SERVER_ADDRESS } from '../../common/constants.ts';
import { AppointmentDto } from '../../types/appointmentDto.ts';
import { format, getDaysInMonth, startOfMonth, addDays, isSameDay, isSameWeek, startOfWeek, getDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useSelector } from 'react-redux';

interface UserCalendarProps {
    selectedCourse?: string; // Make selectedCourse optional
}

const UserCalendar: React.FC<UserCalendarProps> = ({ selectedCourse }) => {
    const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month'); // Toggle between month/week views
    const [loading, setLoading] = useState<boolean>(true);

    const userId = localStorage.getItem('userId');
    const updatedApplicationStatus = useSelector((state: any) => state.applicationStatus.applicationStatus);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                // Construct the URL dynamically based on whether selectedCourse is provided
                let url = `${SERVER_ADDRESS}/tutorit/Appointments/get_appointments?userId=${userId}`;
                
                if (selectedCourse) {
                    url += `&courseId=${selectedCourse}`;
                }

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data: AppointmentDto[] = await response.json();
                    setAppointments(data);
                } else {
                    console.error('Failed to fetch appointments.');
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [userId, selectedCourse, updatedApplicationStatus]);

    const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newViewMode: 'month' | 'week') => {
        if (newViewMode !== null) {
            setViewMode(newViewMode);
        }
    };

    const handlePrevious = () => {
        setSelectedDate(viewMode === 'month' ? subMonths(selectedDate, 1) : subWeeks(selectedDate, 1));
    };

    const handleNext = () => {
        setSelectedDate(viewMode === 'month' ? addMonths(selectedDate, 1) : addWeeks(selectedDate, 1));
    };

    const getAppointmentsForDay = (date: Date) => {
        return appointments.filter(appointment => isSameDay(new Date(appointment.startTime), date));
    };

    const isCurrentWeek = (date: Date) => {
        return isSameWeek(date, new Date(), { weekStartsOn: 1 });
    };

    const renderDayBox = (date: Date) => {
        const dayAppointments = getAppointmentsForDay(date);
        const isCurrentWeekFlag = isCurrentWeek(date);

        return (
            <Paper
                key={date.toDateString()}
                sx={{
                    height: 120,
                    p: 1,
                    border: isCurrentWeekFlag ? '2px solid #00008B' : 'none', // Highlight current week
                }}
            >
                <Typography variant="body2">{format(date, 'MMM d')}</Typography>
                {dayAppointments.map((appointment) => (
                    <Button
                        key={appointment.id}
                        fullWidth
                        sx={{
                            backgroundColor: appointment.acceptedByOwner ? '#008000' : '#D3D3D3',
                            color: '#fff',
                            p: 1,
                            mb: 0.5,
                        }}
                        onClick={() => {
                            // Open Modal (future implementation)
                            console.log(`Clicked on appointment: ${appointment.id}`);
                        }}
                    >
                        <Typography variant="caption">
                            {new Date(appointment.startTime).toLocaleTimeString()}
                        </Typography>
                    </Button>
                ))}
                {dayAppointments.length === 0 && <Typography variant="body2">No appointments</Typography>}
            </Paper>
        );
    };

    const renderMonthView = () => {
        const daysInMonth = getDaysInMonth(selectedDate);
        const startOfMonthDate = startOfMonth(selectedDate);
        const startDayOfWeek = getDay(startOfMonthDate); // Day of the week the 1st falls on
        const days: JSX.Element[] = [];

        // Add blank days for previous month if the month doesn't start on Sunday
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(<Box key={`empty-${i}`} sx={{ height: 120 }} />);
        }

        // Add days for the current month
        for (let i = 0; i < daysInMonth; i++) {
            days.push(renderDayBox(addDays(startOfMonthDate, i)));
        }

        return (
            <Grid container spacing={1}>
                {days.map((day, index) => (
                    <Grid item xs={12 / 7} key={index}>
                        {day}
                    </Grid>
                ))}
            </Grid>
        );
    };

    const renderWeekView = () => {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Get the start of the current week
        const days: JSX.Element[] = [];

        for (let i = 0; i < 7; i++) {
            days.push(renderDayBox(addDays(weekStart, i)));
        }

        return (
            <Grid container spacing={1}>
                {days.map((day, index) => (
                    <Grid item xs={12 / 7} key={index}>
                        {day}
                    </Grid>
                ))}
            </Grid>
        );
    };

    useEffect(() => {
        if (viewMode === 'week') {
            setSelectedDate(new Date()); // Automatically jump to the current week
        }
    }, [viewMode]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: '100%' }}>
            {/* Navigation Buttons for Month/Week */}
            <Box display="flex" justifyContent="space-between" sx={{ width: '100%', mb: 2 }}>
                <IconButton onClick={handlePrevious}>
                    <ArrowBackIcon />
                </IconButton>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    aria-label="view mode"
                >
                    <ToggleButton value="month" aria-label="month view">
                        Month View
                    </ToggleButton>
                    <ToggleButton value="week" aria-label="week view">
                        Week View
                    </ToggleButton>
                </ToggleButtonGroup>
                <IconButton onClick={handleNext}>
                    <ArrowForwardIcon />
                </IconButton>
            </Box>
            {viewMode === 'month' ? renderMonthView() : renderWeekView()}
        </Box>
    );
};

export default UserCalendar;
