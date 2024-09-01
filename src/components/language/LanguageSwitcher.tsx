import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useDispatch } from 'react-redux';
import { updateGlobalLanguage } from '../../actions/langauge/languageActions.ts';
import { useNavigate } from 'react-router-dom';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const language = i18n.language;
    dispatch(updateGlobalLanguage(language));

    // Check if token and userId are present in localStorage
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [i18n.language, dispatch]);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      setIsLoggedIn(!!(token && userId));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    await dispatch(updateGlobalLanguage(lng));
  };

  const handleLogout = () => {
    // Remove token and userId from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
      <Button onClick={() => changeLanguage('en')}>English</Button>
      <Button onClick={() => changeLanguage('ro')}>Română</Button>
      {isLoggedIn && (
        <Button
          onClick={handleLogout}
          variant="contained"
          color="secondary"
          sx={{ ml: 2, fontWeight: 'bold', color: 'white' }}
        >
          Logout
        </Button>
      )}
    </Box>
  );
};

export default LanguageSwitcher;
