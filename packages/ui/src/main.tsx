import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { startWatcherSocket } from './utils/socket';
import './styles';
import 'allotment/dist/style.css';

startWatcherSocket();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 增加离开页面确认
window.onbeforeunload = () => {
  return '确定要离开当前页面吗？';
};
