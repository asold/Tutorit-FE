import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box, IconButton } from '@mui/material';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { updateGlobalLanguage } from '../../actions/langauge/languageActions.ts';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser } from '../../actions/loginActions/loginAction.ts'; // Import loginUser action
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { activateCallingModal } from '../../actions/videoActions/videoActions.ts';

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
      if(!isLoggedIn){
        // Dispatch loginUser action to restore login state in Redux
        dispatch(loginUser(token, userId));
      }
    }
    else if(!isLoggedIn){
      handleLogout();
    }
  }, [i18n.language, dispatch]);

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    await dispatch(updateGlobalLanguage(lng));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    dispatch(logoutUser());
    navigate('/login'); 
    console.log("Logged out")
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
    <Box sx={{  }}>
      {isLoggedIn && (
        <IconButton
          onClick={() => dispatch(activateCallingModal()) }
          onTouchStart={() => dispatch(activateCallingModal()) }
          sx={{
            backgroundColor: '#6db5a0',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#5a9d8d' },
            borderRadius: '50%', // Fully rounded
            width: '3.5rem',
            height: '3.5rem'
          }}
        >
          <VideoCallIcon fontSize="large" />
        </IconButton>
      )}
    </Box>
  
    {/* Right-aligned Buttons */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
  </Box>
  
  );
};

export default LanguageSwitcher;
