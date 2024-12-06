import React, { useState, useEffect } from 'react';
import { Navbar, Container, Image, Button, Nav, Dropdown, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavbar } from "./NavbarContext";
import axios from 'axios';
import "./Navbar.css"
import logo from '../../assets/logo.jpg';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
    const { user, fetchUserData, loading } = useNavbar();
    const [showMenu, setShowMenu] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false); // State for the overlay

    const handleLogout = async () => {
        try {
            const response = await axios.post("/api/auth/logout");
            if (response.status === 200) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                fetchUserData();
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handlePanel = () => {
        if (user.role === 'SuperAdmin') {
            window.location.href = '/super-admin';
        } else if (user.role === 'DepartmentAdmin') {
            window.location.href = '/department-admin';
        }
    }

    const handleInternshipSearch = () => {
        window.location.href = '/internship-search';
    }

    const handleStudentEvoluation = () => {
        window.location.href = '/student-grade';
    }

    const handleReport = () => {
        window.location.href = '/report';
    }

    const handleMyReports = () => {
        window.location.href = '/my-reports';
    }

    const toggleOverlay = () => {
        setShowOverlay(!showOverlay);
    }

    useEffect(() => {
      fetchUserData();
    }, []);

    if (loading) {
        return <Navbar bg="dark" variant="dark" expand="lg"><Container>Loading...</Container></Navbar>;
    }

    return (
        <>
          {/* Overlay when toggle is clicked */}
          {showOverlay && (
            <div className="overlay" onClick={toggleOverlay}>
               <div className="overlay-content" onClick={e => e.stopPropagation()}>
                    <LinkContainer to="/internship-search">
                        <Button variant="outline-light" className="overlay-button" onClick={handleInternshipSearch}>Öğrenci Ara</Button>
                    </LinkContainer>
                    <LinkContainer to="/student-grade">
                        <Button variant="outline-light" className="overlay-button" onClick={handleStudentEvoluation}>Öğrenci Notlandırma</Button>
                    </LinkContainer>
                    {(user.role !== "SuperAdmin") && (
                      <LinkContainer to="/report">
                          <Button variant="outline-light" className="overlay-button" onClick={handleReport}>Rapor Al</Button>
                      </LinkContainer>
                    )}
                    {(user.role !== "SuperAdmin") && (
                      <LinkContainer to="/my-reports">
                          <Button variant="outline-light" className="overlay-button" onClick={handleMyReports}>Raporlarım</Button>
                      </LinkContainer>
                    )}
                    {(user.role === "SuperAdmin" || user.role === "DepartmentAdmin") && (
                        <LinkContainer to={user.role === "SuperAdmin" ? "/super-admin" : "/department-admin"}>
                            <Button variant="outline-light" className="overlay-button" onClick={handlePanel}>Yönetim Paneli</Button>
                        </LinkContainer>
                    )}
                    <LinkContainer to="/">
                        <Button variant="outline-light" className="overlay-button" onClick={handleLogout}>Güvenli Çıkış</Button>
                    </LinkContainer>
                </div>
            </div>
          )}
          
          <Navbar variant="dark" expand="lg" className="navbar shadow">
            <Container>
              {/* Logo */}
              <LinkContainer to="/">
                <Navbar.Brand className="d-flex align-items-center">
                  <Image src={logo} fluid id="logo" />
                  <span className='navbar-name'>GTÜ Staj Takip Sistemi</span>
                </Navbar.Brand>
              </LinkContainer>
        
              {/* Navbar Toggle */}
              {user && (
                <Navbar.Toggle
                  aria-controls="basic-navbar-nav"
                  className="custom-navbar-toggle"
                  onClick={toggleOverlay}
                >
                    <span className="toggle-icon">≡</span>
                </Navbar.Toggle>
              )}
        
              {/* Navbar Collapse */}
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto d-flex align-items-center">
                  {user ? (
                    <>
                      {/* Buttons and Links */}
                      <LinkContainer to="/internship-search">
                        <Button variant="outline-light" className="me-3" onClick={handleInternshipSearch}>Öğrenci Ara</Button>
                      </LinkContainer>
                      <LinkContainer to="/student-grade">
                        <Button variant="outline-light" className="me-3" onClick={handleStudentEvoluation}>Öğrenci Notlandırma</Button>
                      </LinkContainer>
                      <LinkContainer to="/report">
                        <Button variant="outline-light" className="me-3" onClick={handleReport}>Rapor Al</Button>
                      </LinkContainer>
                      <LinkContainer to="/my-reports">
                        <Button variant="outline-light" className="me-3" onClick={handleMyReports}>Raporlarım</Button>
                      </LinkContainer>
                    </>
                  ) : null}

                  {/* User Dropdown */}
                  {user && (
                    <Dropdown align="end" show={showMenu} onToggle={() => setShowMenu(!showMenu)} drop="down">
                      <Dropdown.Toggle variant="outline-light">{user.username}</Dropdown.Toggle>
                      <Dropdown.Menu>
                        {(user.role === "SuperAdmin" || user.role === "DepartmentAdmin") && (
                          <Dropdown.Item onClick={handlePanel}>Yönetim Paneli</Dropdown.Item>
                        )}
                        <Dropdown.Item onClick={handleLogout}>Güvenli Çıkış</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </>
    );
};

export default Navigation;
