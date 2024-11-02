import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Home from './pages/Home/Home';
import SuperAdmin from './pages/SuperAdmin/SuperAdmin';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ConfirmCode from './pages/ConfirmCode/ConfirmCode';
import NewPassword from './pages/NewPassword/NewPassword';
//import Login from "./pages/Login/Login";
// import ResetPassword from './pages/ResetPassword/ResetPassword';
import Navigation from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <Router>
      <Navigation /> {/* Her sayfada gösterilecek navbar */}
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route path="/confirm-code" element={<ConfirmCode />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Diğer tüm hrefleri home yönlendir*/}
          <Route path="*" element={<Home />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
