import React, { useState, useEffect } from 'react';
import { Navbar, Container, Image, Button, Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavbar } from "./NavbarContext";
import axios from 'axios';
import "./Navbar.css"
import logo from '../../assets/logo.jpg';

const Navigation: React.FC = () => {
    const { user, fetchUserData, loading } = useNavbar();

    const handleLogout = async () => {
        try {
            const response = await axios.post("/api/auth/logout");
            if (response.status === 200) {
                if(localStorage.getItem('accessToken'))
                    localStorage.removeItem('accessToken');
                if(localStorage.getItem('refreshToken'))
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

    useEffect(() => {
      fetchUserData();
    }, []);

    if (loading) {
        return <Navbar bg="dark" variant="dark" expand="lg"><Container>Loading...</Container></Navbar>;
    }

    return (
        <Navbar variant="dark" expand="lg " className="navbar shadow">
          <Container>
            {/* Logo */}
            <LinkContainer to="/">
              <Navbar.Brand className="d-flex align-items-center">
                <Image src={logo} fluid id="logo" />
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>GTÜ Staj Takip Sistemi</span>
              </Navbar.Brand>
            </LinkContainer>
    
            {/* Navbar Toggle */}
            {user ? (
              <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-navbar-toggle">
                <span className="toggle-icon">X</span> {/* Toggle metnini değiştir */}
              </Navbar.Toggle>
              ) : (<></>)
            }
    
            {/* Navbar Collapse */}
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto d-flex align-items-center">
                {user ? (
                  <>
                    {/* Welcome Message */}
                    <span className="text-light me-3 mb-2">
                      <strong>{user.username}</strong>
                    </span>
    
                    {/* Admin Panel Button */}
                    {(user.role === "SuperAdmin" || user.role === "DepartmentAdmin") && (
                      <Button
                        variant="outline-light"
                        className="d-flex align-items-center me-3 justify-content-center mb-2"
                        onClick={handlePanel}
                        style={{ width: "150px" }}
                      >
                        Yönetim Paneli
                      </Button>
                    )}

                    {/* Logout Button */}
                    <Button
                      variant="outline-light"
                      className="d-flex align-items-center me-3 justify-content-center mb-2"
                      style={{ width: "150px" }}
                      onClick={handleLogout}
                    >
                     Güvenli Çıkış
                    </Button>
                  </>
                ) : (
                    <></>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      );
};

export default Navigation;
