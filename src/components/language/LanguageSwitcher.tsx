import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { updateGlobalLanguage } from '../../actions/langauge/languageActions.ts';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser } from '../../actions/loginActions/loginAction.ts'; // Import loginUser action

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();
  const navigate = useNavigate();
  
  // Use Redux to get the login state
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  useEffect(() => {
    // Sync language change in i18n to global state
    const language = i18n.language;
    dispatch(updateGlobalLanguage(language));

    // Check if token and userId are present in localStorage on page load
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      // Dispatch loginUser action to restore login state in Redux
      dispatch(loginUser(token, userId));
    }
  }, [i18n.language, dispatch]);

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    await dispatch(updateGlobalLanguage(lng));
  };

  const handleLogout = () => {
    // Remove token and userId from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    dispatch(logoutUser()); // Dispatch logout to update Redux state
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
