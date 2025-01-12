import React, { useState, useEffect } from 'react';
import { Navbar, Container, Image, Button, Nav, Dropdown, Modal } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavbar } from "./NavbarContext";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Navbar.css"
import logo from '../../assets/logo.jpg';
import { BsFillCalendar2DateFill } from 'react-icons/bs';
import { IoMdAddCircleOutline } from 'react-icons/io';
import Chart from '../../pages/Dashboard/Chart';
import ChartFilter from '../../pages/Dashboard/ChartFilter';

type Option = {
  value: number;
  name: string;
  id?: string;
}

const Navigation: React.FC = () => {
    const { user, fetchUserData, loading } = useNavbar();
    const [showMenu, setShowMenu] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false); // State for the overlay
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showTermModal, setShowTermModal] = useState<boolean>(false);
    const [dates, setDates] = useState<string[]>(new Array(8));
    const [selectedName, setSelectedName] = useState('');
    const [fetchYear, setFetchYear] = useState<boolean>(false);
    const [termDetails, setTermDetails] = useState<any[]>();
    const [years, setYears] = useState<Option[]>();
    const [termsSelectedYear, setTermsSelectedYear] = useState<Option>();
    const [firstSelectedYear, setFirstSelectedYear] = useState<Option>(); 
    const [secondSelectedYear, setSecondSelectedYear] = useState<Option>();
    
    const navigate = useNavigate();

    const getAuthHeader = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
          navigate("/login");
      }
      return {
          Authorization: `Bearer ${token}`,
      };
    };

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

    const getYears = async () => {
      try {
        const res = await axios.get(`/api/terms`, {
          headers: getAuthHeader()
        });
        setTermDetails(res.data);
        setYears(res.data
                      .sort((a: any, b: any) => b.name.localeCompare(a.name))
                      .map((e: any, index: number) => ({
                          name: e.name,
                          value: index + 1,
                      })))
        setFirstSelectedYear(res.data[0] ?? undefined);
        setSecondSelectedYear(res.data[0] ?? undefined);
        setTermsSelectedYear(res.data[0] ?? undefined);
      } catch (e) {
        setYears([]);
        setFirstSelectedYear(undefined);
        setSecondSelectedYear(undefined);
      }
    }

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

    const handleShowTermModal = () => {
      setShowTermModal(true);
    };
  
    const handleCloseTermModal = () => {
      setShowTermModal(false);
    };
  
    const handleShowModal = () => {
      setShowModal(true);
    };
  
    const handleCloseModal = () => {
      setDates(new Array(8));
      setSelectedName('')
      setShowModal(false);
    };

    const handleApprove = async () => {
      try {
        await axios.post(`/api/term`, {
          name: selectedName,
          midterm_fall_begin: dates[0],
          midterm_fall_end: dates[1],
          midterm_break_begin: dates[2],
          midterm_break_end: dates[3],
          midterm_spring_begin: dates[4],
          midterm_spring_end: dates[5],
          summer_begin: dates[6],
          summer_end: dates[7],
        }, {
          headers: getAuthHeader(),
        })
        setFetchYear(!fetchYear)
      }
      catch (e) {
      }
      handleCloseModal()
    };

    const handleNameChange = (e: any) => {
      setSelectedName(e.target.value);
    };
  
    const handleDateChange = (e: any, i: number) => {
      const updatedDates = [...dates];
      updatedDates[i] = e.target.value;
      setDates(updatedDates);
    };

    const formatTermDate = (i: number) => {
      const foundTerm = termDetails?.find((e:any)=>(e.name === termsSelectedYear?.name));
      if (foundTerm) {
        let specifiedTermDate: Date;
        switch (i) {
          case 0:
            specifiedTermDate = foundTerm.midterm_fall_begin;
            break;
          case 1:
            specifiedTermDate = foundTerm.midterm_fall_end;
            break;
          case 2:
            specifiedTermDate = foundTerm.midterm_break_begin;
            break;
          case 3:
            specifiedTermDate = foundTerm.midterm_break_end;
            break;
          case 4:
            specifiedTermDate = foundTerm.midterm_spring_begin;
            break;
          case 5:
            specifiedTermDate = foundTerm.midterm_spring_end;
            break;
          case 6:
            specifiedTermDate = foundTerm.summer_begin;
            break;
          case 7:
            specifiedTermDate = foundTerm.summer_end;
            break;
          default:
            return "";
        }
        if (specifiedTermDate) {
          return ((new Date(specifiedTermDate)).toLocaleDateString());
        }
      }
  
      return "";
    }

    useEffect(() => {
      fetchUserData();
    }, []);

    useEffect(() => {
      if (user){
        getYears();
      }
      }, [fetchYear, user]);

    if (loading) {
        return <Navbar bg="dark" variant="dark" expand="lg"><Container>Loading...</Container></Navbar>;
    }

    return (  
      <>
          {/* Overlay when toggle is clicked */}
          {showOverlay && user && (
            <div className="overlay" onClick={toggleOverlay}>
               <div className="overlay-content" onClick={e => e.stopPropagation()}>
                    {user.role == 'SuperAdmin' &&
                      <Button variant="outline-light" className="overlay-button" onClick={handleShowTermModal}>Dönem Tarihleri</Button>
                    }
                    {user.role == 'SuperAdmin' &&
                      <Button variant="outline-light" className="overlay-button" onClick={handleShowModal}>Dönem Oluştur</Button>
                    }
                    {user.role !== 'SuperAdmin' &&
                      <LinkContainer to="/internship-search">
                        <Button variant="outline-light" className="overlay-button" onClick={handleInternshipSearch}>Öğrenci Ara</Button>
                      </LinkContainer>
                    }
                    {user.role !== 'SuperAdmin' &&
                      <LinkContainer to="/student-grade">
                        <Button variant="outline-light" className="overlay-button" onClick={handleStudentEvoluation}>Öğrenci Notlandır</Button>
                      </LinkContainer>
                    }
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
              <LinkContainer to={"/"}>
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
                      {user.role == 'SuperAdmin' &&
                        <div className='w-300px me-3'>
                          <Button variant="outline-light" onClick={handleShowTermModal}>Dönem Tarihleri</Button>
                        </div>
                      }
                      {user.role == 'SuperAdmin' &&
                        <div className='w-300px me-3'>
                          <Button variant="outline-light" onClick={handleShowModal}>Dönem Oluştur</Button>
                        </div>
                      }
                      {user.role !== 'SuperAdmin' &&
                        <LinkContainer to="/internship-search">
                          <Button variant="outline-light" className="me-3" onClick={handleInternshipSearch}>Öğrenci Ara</Button>
                        </LinkContainer>
                      }
                      {user.role !== 'SuperAdmin' &&
                        <LinkContainer to="/student-grade">
                          <Button variant="outline-light" className="me-3" onClick={handleStudentEvoluation}>Öğrenci Notlandır</Button>
                        </LinkContainer>
                      }
                      {(user.role !== "SuperAdmin") &&
                        <LinkContainer to="/report">
                          <Button variant="outline-light" className="me-3" onClick={handleReport}>Rapor Al</Button>
                        </LinkContainer>
                      }
                      {(user.role !== "SuperAdmin") &&
                        <LinkContainer to="/my-reports">
                          <Button variant="outline-light" className="me-3" onClick={handleMyReports}>Raporlarım</Button>
                        </LinkContainer>
                      }
                    </>
                  ) : null}

                  {/* User Dropdown */}
                  {user && (
                    <Dropdown align="end" show={showMenu} onToggle={() => setShowMenu(!showMenu)} drop="down" className='dropdown-class'>
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

          <Modal 
          size="lg"
          show={showTermModal} 
          onHide={handleCloseTermModal}>
          <Modal.Header closeButton>
              <Modal.Title>Dönem Tarihleri</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{padding: "8px 16px 8px 16px"}}>
            {termDetails ? 
              <div className='grid-cols-2'>
                <div className="row align-items-center">
                  <div className="col-4 col-lg-8" style={{padding: "0px 10px "}}>
                    <ChartFilter 
                      options={years}
                      onChange={(e: any) => {setTermsSelectedYear(years?.find((op: Option) => (op.value === Number(e.target.value))))}}
                    />
                  </div>
                </div>
                <div className="row mt-2 align-items-center border-top border-1">
                  <label className='mt-2 col-4' htmlFor="string">Akademik Yıl</label>
                  <div className="mt-2 col-4 col-lg-8 text-nowrap fw-semibold">
                    {termsSelectedYear?.name}
                  </div>
                </div>
                <div className="row mt-2">
                  <label className='col-4' htmlFor="date">Dönem İçi Güz:</label>
                  <div className='d-flex gap-2 col-4 col-lg-8'>
                    <span className="w-100">{formatTermDate(0)}</span>
                    <span className="w-100">{formatTermDate(1)}</span>
                  </div>
                </div>
                <div className="row mt-2">
                  <label className='col-4' htmlFor="date">Ara Dönem:</label>
                  <div className='d-flex gap-2 col-4 col-lg-8'>
                    <span className="w-100">{formatTermDate(2)}</span>
                    <span className="w-100">{formatTermDate(3)}</span>
                  </div>
                </div>
                <div className="row mt-2">
                  <label className='col-4' htmlFor="date">Dönem İçi Bahar:</label>
                  <div className='d-flex gap-2 col-4 col-lg-8'>
                    <span className="w-100">{formatTermDate(4)}</span>
                    <span className="w-100">{formatTermDate(5)}</span>
                  </div>
                </div>
                <div className="row mt-2">
                  <label className='col-4' htmlFor="date">Yaz:</label>
                  <div className='d-flex gap-2 col-4 col-lg-8'>
                    <span className="w-100">{formatTermDate(6)}</span>
                    <span className="w-100">{formatTermDate(7)}</span>
                  </div>
                </div>
              </div>
            : <p>Veri Getirilemedi</p>}
            </Modal.Body>
          <Modal.Footer >
            <div></div>
          </Modal.Footer>
        </Modal>
        <Modal 
          size="lg"
          show={showModal} 
          onHide={handleCloseModal}>
          <Modal.Header closeButton>
              <Modal.Title>Dönem Tarihi Düzenleme</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <div className='grid-cols-2'>
                <div className="row mt-2 align-items-center">
                  <label className='col-4' htmlFor="string">Akademik Yıl</label>
                  <div className='d-flex gap-2 col-4 col-lg-8'>
                    <input placeholder='20xx-20xx' className='w-100' type="text" id="text" value={selectedName} onChange={handleNameChange}/>
                  </div>
                </div>
                <div className="row">
                  <label className='col-4' htmlFor="date">Dönem İçi Güz:</label>
                  <div className='d-flex gap-2 col-4 col-lg-8'>
                    <input className="w-100" type="date" id="date" value={dates[0]} onChange={(e:any) => {handleDateChange(e, 0)}}/>
                    <input className="w-100" type="date" id="date" value={dates[1]} onChange={(e:any) => {handleDateChange(e, 1)}}/>
                  </div>
                </div>
                <div className="row mt-2">
                  <label className='col-4' htmlFor="date">Ara Dönem:</label>
                  <div className='d-flex gap-2 col-4 col-lg-8'>
                    <input className="w-100" type="date" id="date" value={dates[2]} onChange={(e:any) => {handleDateChange(e, 2)}}/>
                    <input className="w-100" type="date" id="date" value={dates[3]} onChange={(e:any) => {handleDateChange(e, 3)}}/>
                  </div>
                </div>
                <div className="row mt-2">
                  <label className='col-4' htmlFor="date">Dönem İçi Bahar:</label>
                  <div className='d-flex gap-2 col-4 col-lg-8'>
                    <input className="w-100" type="date" id="date" value={dates[4]} onChange={(e:any) => {handleDateChange(e, 4)}}/>
                    <input className="w-100" type="date" id="date" value={dates[5]} onChange={(e:any) => {handleDateChange(e, 5)}}/>
                  </div>
                </div>
                <div className="row mt-2">
                  <label className='col-4' htmlFor="date">Yaz:</label>
                  <div className='d-flex gap-2 col-4 col-lg-8'>
                    <input className="w-100" type="date" id="date" value={dates[6]} onChange={(e:any) => {handleDateChange(e, 6)}}/>
                    <input className="w-100" type="date" id="date" value={dates[7]} onChange={(e:any) => {handleDateChange(e, 7)}}/>
                  </div>
                </div>
              </div>
          </Modal.Body>
          <Modal.Footer >
            <div style={{  display: "flex", gap: "10px" }}>
              <Button variant="secondary" onClick={handleCloseModal}>
              Vazgeç
              </Button>
              <Button variant="success" onClick={handleApprove}>
              Onayla
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
        </>
    );
};

export default Navigation;
