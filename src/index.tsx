import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { loadJsScript } from './helpers/util';

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
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

setTimeout(() => {
  loadJsScript('//clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/libs/jweixin-1.4.0.js');
  loadJsScript('//clothing-try-on-1306401232.cos.ap-guangzhou.myqcloud.com/libs/uni.webview.0.1.52.js');
}, 200);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
