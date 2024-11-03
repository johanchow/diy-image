import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { loadJsScript } from './helpers/util';
import { WebHost } from './helpers/config';

window.addEventListener('message', function(event) {
  // 接收来自Uni-app的全局变量
  const globalVariable = event.data;
  console.log('receive message from uniapp: ', globalVariable);
  // alert(globalVariable.userId);
  window.__TRY_ON_CONTEXT__ = {
    userId: globalVariable.userId,
  };
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
setTimeout(async () => {
  await loadJsScript(`//${WebHost}/libs/jweixin-1.4.0.js`);
  loadJsScript(`//${WebHost}/libs/uni.webview.0.1.52.js`);
}, 100);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
