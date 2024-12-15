import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, CircularProgress, Paper } from '@mui/material';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useDispatch } from 'react-redux';
import {  register } from '../../actions/registration/registrationActions.ts';
import { useNavigate } from 'react-router-dom';
import useUsernameValidation from '../../hooks/useUsernameValidation.ts';

const UserRegistration: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [role, setRole] = useState('');

  const { isUsernameValid, isChecking, error } = useUsernameValidation(username);

  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();
  const navigate = useNavigate();

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRole((event.target as HTMLInputElement).value);
  };

  const isFormComplete = username && password && repeatPassword && role && password === repeatPassword && isUsernameValid;

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
          Register
        </Typography>
        <form>
          <Box mb={2} width="100%">
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              error={!!error}
              helperText={error}
            />
            {isChecking && <CircularProgress size={24} />}
          </Box>
          <Box mb={2} width="100%">
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>
          <Box mb={2} width="100%">
            <TextField
              label="Repeat Password"
              variant="outlined"
              type="password"
              fullWidth
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
              error={repeatPassword !== password}
              helperText={repeatPassword !== password ? 'Passwords do not match' : ''}
            />
          </Box>
          <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
            <Typography variant="body1" gutterBottom textAlign="center">
              Role
            </Typography>
            <RadioGroup value={role} onChange={handleRoleChange}>
              <FormControlLabel value="1" control={<Radio />} label="Student" />
              <FormControlLabel value="0" control={<Radio />} label="Teacher" />
            </RadioGroup>
          </FormControl>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{
              backgroundColor: '#6db5a0', 
              color: '#ffffff', 
              py: 1.5, 
              '&:hover': { backgroundColor: '#5a9d8d' }
            }}
            onClick={() => {
              dispatch(register(username, password, role, () => {
                navigate('/login');
              }));
            }}
          >
            Register
          </Button>
        </form>
      </Paper>
    </Box>
  );
  
};

export default UserRegistration;
