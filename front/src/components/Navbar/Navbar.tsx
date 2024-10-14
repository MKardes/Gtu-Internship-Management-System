import React from 'react';
import { Navbar, Container, Image } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import logo from '../../assets/logo.jpg';

const Navigation: React.FC = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand>
                        <Image src={logo} fluid style={{ width: '60px', height: '40px' }} />
                    </Navbar.Brand>
                </LinkContainer>
            </Container>
        </Navbar>
    );
}

export default Navigation;
