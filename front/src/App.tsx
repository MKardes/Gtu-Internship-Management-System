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
import { NavbarProvider } from "./components/Navbar/NavbarContext";
import Navigation from "./components/Navbar/Navbar";
//import Dashboard from './pages/Dashboard/Dashboard';
import PrivateRoute from './components/privateRoute';
import DepartmentAdmin from './pages/DepartmentAdmin/DepartmentAdmin';
import Dashboard from './pages/Dashboard/Dashboard';
import DashboardActual from './pages/DashboardActual/DashboardActual';

const App: React.FC = () => {
  return (
    <Router>
      <NavbarProvider> {/* Her sayfada gösterilecek navbar */}
        <Navigation />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/super-admin"
            element={
              <PrivateRoute element={<SuperAdmin />} requiredRole="SuperAdmin" />
            }
            />
          <Route
            path = "/department-admin"
            element = {
              <PrivateRoute element = {<DepartmentAdmin />} requiredRole = "DepartmentAdmin" />
            }
            />
          <Route 
            path = "/dashboard"
            element = {
              <PrivateRoute element = {<Dashboard />} />
            }
            />
          <Route 
            path = "/dashboard-actual"
            element = {
              <PrivateRoute element = {<DashboardActual />} />
            }
            />
          <Route path="/confirm-code" element={<ConfirmCode />} />
          <Route path="/new-password" element={<NewPassword />} />
          {/* Diğer tüm hrefleri home yönlendir*/}
          <Route path="*" element={<Home />} />
        </Routes>
      </Container>
      </NavbarProvider>
    </Router>
  );
}

export default App;
