import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Avatar, Box, Button, Grid, TextField, Typography } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FaceIcon from '@mui/icons-material/Face';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from "react-router-dom";
import { addPersonalInfo } from "../../actions/registration/registrationActions.ts";
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

const PersonalRegistration: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');

  const navigate = useNavigate();
  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (icon: string) => {
    setPhoto(icon);
  };

  const isFormComplete = firstName && lastName && email && photo;

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
                />
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
                      src={photo === '/icons/astronaut.png' ? photo : undefined}
                      sx={{ width: 56, height: 56, cursor: 'pointer' }}
                    >
                      <AccountCircleIcon />
                    </Avatar>
                  </Grid>
                  <Grid item>
                    <Avatar
                      onClick={() => handleAvatarSelect('/icons/teenager.png')}
                      src={photo === '/icons/teenager.png' ? photo : undefined}
                      sx={{ width: 56, height: 56, cursor: 'pointer' }}
                    >
                      <FaceIcon />
                    </Avatar>
                  </Grid>
                  <Grid item>
                    <Avatar
                      onClick={() => handleAvatarSelect('/icons/unicorn.png')}
                      src={photo === '/icons/unicorn.png' ? photo : undefined}
                      sx={{ width: 56, height: 56, cursor: 'pointer' }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            {photo && !photo.startsWith('/icons') && (
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: 300, height: 100 }}>
                <Avatar src={photo} sx={{ width: 100, height: 100 }} />
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
                dispatch(addPersonalInfo(firstName, lastName, email, photo, () => {
                  navigate('/user-creation');
                }));
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
