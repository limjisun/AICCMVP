import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Monitoring from './pages/Monitoring';
import Consultation from './pages/Consultation';
import Keywords from './pages/Keywords';
import './styles/main.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 페이지 (MainLayout 밖) */}
        <Route path="/login" element={<Login />} />

        {/* 메인 페이지들 (MainLayout 안) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Monitoring />} />
          <Route path="consultation" element={<Consultation />} />
          <Route path="keywords" element={<Keywords />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
