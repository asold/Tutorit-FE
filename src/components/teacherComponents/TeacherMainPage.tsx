import { Box, Button } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherMainPage: React.FC = () => {

    const navigate = useNavigate();


    return(
        <Box>
            <h1>Teacher Main Page</h1>
            <Button 
                onClick={()=>navigate('')}
                >
                Create a New Course
            </Button>
        </Box>
    )
};
