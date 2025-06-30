import React from 'react';
import store from './src/store';
import {Provider} from 'react-redux';
import App from './App';

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default AppWrapper;
