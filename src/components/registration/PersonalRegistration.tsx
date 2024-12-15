import React, { useState } from 'react';
import { Avatar, Box, Button, Grid, TextField, Typography, CircularProgress, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FaceIcon from '@mui/icons-material/Face';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import useEmailValidation from '../../hooks/useEmailValidation.ts';

const PersonalRegistration: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const { isEmailValid, isChecking, error } = useEmailValidation(email);

  const navigate = useNavigate();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (icon: string) => {
    setPhotoUrl(icon);
  };

  const isFormComplete = firstName && lastName && email && photoUrl && isEmailValid;

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh" 
      sx={{ backgroundColor: '#fafafa' }}
    >
      <Paper 
        elevation={3} 
        sx={{
          p: 4, 
          maxWidth: '400px', 
          textAlign: 'center', 
          borderRadius: '16px', 
          backgroundColor: '#ffffff'
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ color: '#333333', fontWeight: '500' }}
        >
          Who Are You?
        </Typography>
        <form>
          <Box mb={2} width="100%">
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Box>
          <Box mb={2} width="100%">
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Box>
          <Box mb={2} width="100%">
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={!!error}
              helperText={error}
            />
            {isChecking && <CircularProgress size={24} />}
          </Box>
          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: '#6db5a0', 
              color: '#ffffff', 
              py: 1, 
              '&:hover': { backgroundColor: '#5a9d8d' }
            }}
            startIcon={<CloudUploadIcon />}
          >
            Upload Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoUpload}
            />
          </Button>
          <Typography variant="body1" mt={2} sx={{ color: '#333333' }}>
            Or Choose an Avatar
          </Typography>
          <Box display="flex" justifyContent="center" mt={2}>
            <Grid container spacing={1}>
              <Grid item>
                <Avatar
                  onClick={() => handleAvatarSelect('/icons/astronaut.png')}
                  src={photoUrl === '/icons/astronaut.png' ? photoUrl : undefined}
                  sx={{
                    width: 56, 
                    height: 56, 
                    cursor: 'pointer', 
                    backgroundColor: photoUrl === '/icons/astronaut.png' ? '#6db5a0' : '#f5f5f5',
                    color: photoUrl === '/icons/astronaut.png' ? '#ffffff' : undefined
                  }}
                >
                  <AccountCircleIcon />
                </Avatar>
              </Grid>
              <Grid item>
                <Avatar
                  onClick={() => handleAvatarSelect('/icons/teenager.png')}
                  src={photoUrl === '/icons/teenager.png' ? photoUrl : undefined}
                  sx={{
                    width: 56, 
                    height: 56, 
                    cursor: 'pointer', 
                    backgroundColor: photoUrl === '/icons/teenager.png' ? '#6db5a0' : '#f5f5f5',
                    color: photoUrl === '/icons/teenager.png' ? '#ffffff' : undefined
                  }}
                >
                  <FaceIcon />
                </Avatar>
              </Grid>
              <Grid item>
                <Avatar
                  onClick={() => handleAvatarSelect('/icons/unicorn.png')}
                  src={photoUrl === '/icons/unicorn.png' ? photoUrl : undefined}
                  sx={{
                    width: 56, 
                    height: 56, 
                    cursor: 'pointer', 
                    backgroundColor: photoUrl === '/icons/unicorn.png' ? '#6db5a0' : '#f5f5f5',
                    color: photoUrl === '/icons/unicorn.png' ? '#ffffff' : undefined
                  }}
                >
                  <PersonIcon />
                </Avatar>
              </Grid>
            </Grid>
          </Box>
          {isFormComplete && (
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#6db5a0', 
                color: '#ffffff', 
                mt: 3, 
                py: 1.5, 
                '&:hover': { backgroundColor: '#5a9d8d' }
              }}
              onClick={() => {
                const userDto = { firstName, lastName, email, photoUrl };
                localStorage.setItem('userDto', JSON.stringify(userDto));
                navigate('/user-creation');
              }}
            >
              Next
            </Button>
          )}
        </form>
      </Paper>
    </Box>
  );
  
};

export default PersonalRegistration;
