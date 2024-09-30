import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

window.addEventListener('message', function(event) {
  // 接收来自Uni-app的全局变量
  const globalVariable = event.data;
  console.log('receive message from uniapp: ', globalVariable);
  window.__TRY_ON_CONTEXT__ = {
    userId: globalVariable.userId,
  };
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
