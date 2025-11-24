import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Monitoring from './pages/Monitoring';
import Consultation from './pages/Consultation';
import Keywords from './pages/Keywords';
import './styles/main.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
