import React from 'react';
import { createRoot } from 'react-dom/client';  
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers/rootReducer.ts';  
import { Provider } from 'react-redux';
import {thunk} from 'redux-thunk';  

const store = createStore(rootReducer, applyMiddleware(thunk));

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );
} else {
  console.error('Failed to find the root element');
}

reportWebVitals();
