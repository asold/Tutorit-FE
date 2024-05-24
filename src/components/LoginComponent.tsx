import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { login } from '../actions/loginActions/loginAction.ts';
import { useNavigate } from 'react-router-dom';
import { LoginState } from '../types/loginTypes.ts';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';



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
    <div>
      <h2>{t('login')}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">{t('username')}:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">{t('password')}:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <br/>
        <Button 
          variant='contained'
          type="submit">Login
        </Button>
      </form>
      <br/>
      <Button 
        variant="contained"
        onClick={() => navigate('/register')}>{t('register')}
      </Button>
    </div>
  );
};

export default LoginComponent;
