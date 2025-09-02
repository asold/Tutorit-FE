import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { login } from '../actions/loginActions/loginAction.ts';
import { useNavigate } from 'react-router-dom';
import { LoginState } from '../types/loginTypes.ts';
import { useTranslation } from 'react-i18next';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { SERVER_ADDRESS } from '../common/constants.ts';

const LoginComponent: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();

  const navigate = useNavigate();
  const token = useSelector((state: LoginState) => state.token);

  useEffect(() => {
    const checkUserRole = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');

      console.log("user id: ",storedUserId)
      console.log("token: ",storedToken)

      if (storedToken && storedUserId) {
        try {
          const response = await fetch(`${SERVER_ADDRESS}/tutorit/User/user_role?userId=${storedUserId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user role');
          }

          const role = await response.text();

          if (role === 'Teacher') {
            navigate('/teacher_main');
          } else if (role === 'Student') {
            navigate('/student_main');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          // Optionally handle the error (e.g., clear localStorage, display a message, etc.)
        }
      }
    };

    checkUserRole();
  }, [navigate]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await dispatch(login(username, password));

    console.log(response, "response");

    if (response === 'Teacher') {
      navigate('/teacher_main');
    }
    if (response === 'Student') {
      navigate('/student_main');
    }
    else{
      alert("Invalid username or password")
    }
  };

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
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2} width="100%">
            <TextField
              label={t('Username')}
              variant="outlined"
              fullWidth
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </Box>
          <Box mb={2} width="100%">
            <TextField
              label={t('Password')}
              variant="outlined"
              type="password"
              fullWidth
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </Box>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{
              backgroundColor: '#6db5a0', 
              color: '#ffffff', 
              py: 1.5, 
              '&:hover': { backgroundColor: '#5a9d8d' }
            }}
            type="submit"
          >
            {t('Login')}
          </Button>
        </form>
        <Box mt={2}>
          <Button 
            variant="text" 
            sx={{
              color: '#6db5a0', 
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => navigate('/register')}
          >
            {t('Register')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
  
};

export default LoginComponent;
