import React, { useState, useEffect } from 'react';
import { Navbar, Container, Image, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaSignOutAlt, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import logo from '../../assets/logo.jpg';

const Navigation: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const handleLogout = async () => {
        try {
            const response = await axios.post("/api/auth/logout");
            if (response.status === 200) {
                if(localStorage.getItem('accessToken'))
                    localStorage.removeItem('accessToken');
                if(localStorage.getItem('refreshToken'))
                    localStorage.removeItem('refreshToken');
                setUser(null);
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
        const fetchUserData = async () => {
            const accessToken = localStorage.getItem('accessToken');
            try {
                const response = await axios.get("/api/auth/me", {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  });
                if (response.status === 200) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <Navbar bg="dark" variant="dark" expand="lg"><Container>Loading...</Container></Navbar>;
    }

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                {/* Logo */}
                <LinkContainer to="/">
                    <Navbar.Brand>
                        <Image src={logo} fluid style={{ width: '60px', height: '40px' }} />
                    </Navbar.Brand>
                </LinkContainer>
            </Container>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
                {user && (
                    <Button variant="outline-light" style={{ marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    onClick={handleLogout}>
                        <FaSignOutAlt style={{ fontSize: '1.5rem' }} />
                        <span>Logout</span>
                    </Button>
                )}
                {user && (user.role === 'SuperAdmin' || user.role === 'DepartmentAdmin') && (
                    <Button variant="outline-light" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    onClick={handlePanel}>
                        <FaEdit style={{ fontSize: '1.5rem' }} />
                        <span>Panel</span>
                    </Button>
                )}
            </div>
        </Navbar>
    );
};

export default Navigation;
