import React from 'react';
import { Navbar, Container, Image, Nav, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

const Navigation: React.FC = () => {
    // LocalStorage'dan accessToken kontrolü
    const accessToken = localStorage.getItem('accessToken');
    const navigate = useNavigate();
    // Logout işlemini handle eden işlev
    const handleLogout = async () => {
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
        } catch (error) {
            console.error('An error occurred during logout', error);
        }
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                {/* Logo */}
                <LinkContainer to="/">
                    <Navbar.Brand>
                        <Image src={logo} fluid style={{ width: '60px', height: '40px' }} />
                    </Navbar.Brand>
                </LinkContainer>

                {/* accessToken varsa Logout butonunu göster */}
                {accessToken && (
                    <Nav className="ml-auto">
                        <Button variant="outline-light" onClick={handleLogout}>
                            <FaSignOutAlt /> {/* Logout icon */}
                        </Button>
                    </Nav>
                )}
            </Container>
        </Navbar>
    );
}

export default Navigation;
