import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { login } from '../actions/loginActions/loginAction.ts';
import { useNavigate } from 'react-router-dom';
import { LoginState } from '../types/loginTypes.ts';
import { useTranslation } from 'react-i18next';
import { Box, Button, TextField, Typography } from '@mui/material';



const LoginComponent: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tokenChecked, setTokenChecked] = useState(false);

  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();

  const navigate = useNavigate();
  const token = useSelector((state: LoginState) => state.token);

  useEffect(() => {

   }, [navigate, token]); 

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      dispatch(login(username, password, () => {
          navigate('/video');
      }));

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
