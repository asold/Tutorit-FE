import React from 'react';
import { createRoot } from 'react-dom/client';  
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers/rootReducer.ts';  
import { Provider } from 'react-redux';
import {thunk} from 'redux-thunk';  
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n.js';  
import 'slick-carousel/slick/slick.css'; // Import Slick CSS
import 'slick-carousel/slick/slick-theme.css'; // Import Slick theme CSS

const store = createStore(rootReducer, applyMiddleware(thunk));

const rootElement = document.getElementById('root');

const theme = createTheme({
  palette: {
    mode: 'light', // Add this line to explicitly set the mode
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
            <App />
        </I18nextProvider>
      </ThemeProvider>
    </Provider>
  );
} else {
  console.error('Failed to find the root element');
}

reportWebVitals();
