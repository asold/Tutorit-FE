import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { login } from '../actions/loginActions/loginAction.ts';
import { useNavigate } from 'react-router-dom';
import { LoginState } from '../types/loginTypes.ts';
import { useTranslation } from 'react-i18next';
import { Box, Button, TextField, Typography } from '@mui/material';
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
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="90vh">
      <Box display="flex" flexDirection="column" alignItems="center" p={2} border="1px solid #ccc" borderRadius="8px">
        <Typography variant="h2" gutterBottom>
          {t('login')}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2} width="300px">
            <TextField
              label={t('username')}
              variant="outlined"
              fullWidth
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </Box>
          <Box mb={2} width="300px">
            <TextField
              label={t('password')}
              variant="outlined"
              type="password"
              fullWidth
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </Box>
          <Button 
            variant='contained'
            color="primary"
            type="submit"
            fullWidth
          >
            {t('login')}
          </Button>
        </form>
        <Box mt={2}>
          <Button 
            variant="outlined"
            color="info"
            onClick={() => navigate('/register')}
          >
            {t('register')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginComponent;
