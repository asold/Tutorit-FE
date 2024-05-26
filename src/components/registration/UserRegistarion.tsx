import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography, CircularProgress } from '@mui/material';
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
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Box display="flex" flexDirection="column" alignItems="center" p={2} border="1px solid #ccc" borderRadius="8px">
        <Typography variant="h2" gutterBottom>
          Register
        </Typography>
        <form>
          <Box display="flex" flexDirection="column" alignItems="center" mb={1} width="100%">
            <Box mb={1} width="300px">
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
            <Box mb={1} width="300px">
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
            <Box mb={1} width="300px">
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
            <Box mb={1} display="flex" flexDirection="column" alignItems="center" width="300px">
              <FormControl component="fieldset">
                <Typography variant="h6" gutterBottom textAlign="center">
                  Role
                </Typography>
                <RadioGroup value={role} onChange={handleRoleChange}>
                  <FormControlLabel value="1" control={<Radio />} label="Student" />
                  <FormControlLabel value="0" control={<Radio />} label="Teacher" />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
          <Box mt={2} textAlign="center">

            <Button
              variant="contained"
              color="primary"
              disabled={!isFormComplete}

              onClick={() => {
                dispatch(register( username, password, role,() => {
                  navigate('/login');
                }));
              }}
            >
              Register
          </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default UserRegistration;
