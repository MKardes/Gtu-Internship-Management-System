import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Home from './pages/Home/Home';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
// import ResetPassword from './pages/ResetPassword/ResetPassword';
import Navigation from './components/Navbar/Navbar';

const App: React.FC = () => {
  return (
    <Router>
      <Navigation /> {/* Her sayfada gösterilecek navbar */}
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          { /* Mailden gelen kod için bir yönlendirme daha yapılacak */}
          {/* Diğer tüm hrefleri home yönlendir*/}
          <Route path="*" element={<Home />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
