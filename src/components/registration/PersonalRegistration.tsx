import React, { useState } from 'react';
import { Avatar, Box, Button, Grid, TextField, Typography, CircularProgress } from '@mui/material';
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
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box display="flex" flexDirection="column" alignItems="center" p={2} border="1px solid #ccc" borderRadius="8px">
          <Typography variant="h2" gutterBottom>
            Who Are You?
          </Typography>
          <form>
            <Box display="flex" flexDirection="column" alignItems="center" mb={1} width="100%">
              <Box mb={1} width="300px">
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Box>
              <Box mb={1} width="300px">
                <TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Box>
              <Box mb={1} width="300px">
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
              <Box mb={1} textAlign="center">
                <Button
                  variant="contained"
                  component="label"
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
              </Box>
              <Typography variant="body1" mt={2}>
                Or Choose an Avatar
              </Typography>
              <Box display="flex" justifyContent="center" mt={2}>
                <Grid container spacing={1}>
                  <Grid item>
                    <Avatar
                      onClick={() => handleAvatarSelect('/icons/astronaut.png')}
                      src={photoUrl === '/icons/astronaut.png' ? photoUrl : undefined}
                      sx={{ width: 56, height: 56, cursor: 'pointer' }}
                    >
                      <AccountCircleIcon />
                    </Avatar>
                  </Grid>
                  <Grid item>
                    <Avatar
                      onClick={() => handleAvatarSelect('/icons/teenager.png')}
                      src={photoUrl === '/icons/teenager.png' ? photoUrl : undefined}
                      sx={{ width: 56, height: 56, cursor: 'pointer' }}
                    >
                      <FaceIcon />
                    </Avatar>
                  </Grid>
                  <Grid item>
                    <Avatar
                      onClick={() => handleAvatarSelect('/icons/unicorn.png')}
                      src={photoUrl === '/icons/unicorn.png' ? photoUrl : undefined}
                      sx={{ width: 56, height: 56, cursor: 'pointer' }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            {photoUrl && !photoUrl.startsWith('/icons') && (
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: 300, height: 100 }}>
                <Avatar src={photoUrl} sx={{ width: 100, height: 100 }} />
              </Box>
            )}
          </form>
        </Box>
        {isFormComplete && (
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const userDto = { firstName, lastName, email, photoUrl };
                localStorage.setItem('userDto', JSON.stringify(userDto));
                navigate('/user-creation');
              }}
            >
              Next
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PersonalRegistration;
