import React, { useState } from 'react';
import axios from 'axios';
import { Dropdown, Pagination, Row, ToggleButton, Tooltip, Col } from 'react-bootstrap';
import { Button, Modal, Table } from 'react-bootstrap';
import { FaCheckCircle, FaSearch, FaTimesCircle } from 'react-icons/fa';
import './StudentGrade.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Option } from '../InternshipSearch/InternshipSearch';
import { TbMailUp } from "react-icons/tb";
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';

enum InternshipStates {
  Completed = "completed",
  Failed = "failed"
}

const StateConversions = {
  "completed": "Staj Tamamlandı",
  "failed": "Staj Başarısız",
}

const nums = [1, 2, 3, 4]

const StudentGrade: React.FC = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredGrade, setFilteredGrade] = useState<number | null>(null);
  const [filteredSemester, setFilteredSemester] = useState<Option | null>(null);
  const [activeStudentPage, setActiveStudentPage] = useState(1);
  const [years, setYears] = useState<Option[]>();
  const [showMailModal, setShowMailModal] = useState(false);
  const [selectedInternshipForMail, setSelectedInternshipForMail] = useState<any | null>(null);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState('');
  const studentPerPage = 10;
  const navigate = useNavigate();

  const clearFilter = (filterType: string) => {
    if (filterType === 'grade') setFilteredGrade(null);
    if (filterType === 'semester') setFilteredSemester(null);
  };


  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        navigate("/login");
    }
    return {
        Authorization: `Bearer ${token}`,
    };
};

const getYears = async () => {
  try {
    const res = await axios.get(`/api/terms`, {
      headers: getAuthHeader()
    });
    const termData = res.data
                          .sort((a: any, b: any) => b.name.localeCompare(a.name))
                          .map((e: any, index: number) => ({
                              name: e.name,
                              value: index + 1,
                          }));

    termData.unshift({
      name: "Tümü",
      value: 0,
    })
    setYears(termData);
  } catch (e) {
    console.error(e)
  }
}

const filteredInternships = internships.filter(internship => {
  return (
    (internship.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.student.school_id.includes(searchTerm))
  );
});

  const indexOfLastStudent = activeStudentPage * studentPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentPerPage;
  const currentStudents = filteredInternships.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalUserPages = Math.ceil(filteredInternships.length / studentPerPage);
  const handleStudentPageChange = (page: number) => setActiveStudentPage(page);

  useEffect(() => {
    fetchInternships();
  }, [filteredGrade, filteredSemester]);

  const fetchInternships = async () => {
    try {
      // Construct query parameters
      const params = new URLSearchParams();
      if (filteredGrade !== null) params.append('grade', filteredGrade.toString());
      if (filteredSemester !== null && filteredSemester.name !== 'Tümü') params.append('semester', filteredSemester.name);

      const response = await axios.get(`/api/internships?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      setInternships(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseError = () => setShowError(false);

  const handleMailSend = async () => {
    if (!selectedInternshipForMail || !emailSubject || !emailBody) {
      setError('Lütfen tüm alanları doldurunuz!');
      setShowError(true); // Alert'i görünür hale getir
      return;
    }
  
    console.log(selectedInternshipForMail.student.email)
    const emailData = {
      email: selectedInternshipForMail.student.email, // Öğrenci mail adresi
      subject: emailSubject,
      message: emailBody,
    };
  
    try {
      await axios.post('/api/send-mail', emailData, {
        headers: getAuthHeader(),
      });
      handleMailModalClose();
      setEmailSubject(''); // Input'u sıfırla
      setEmailBody('');
    } catch (error) {
      console.error("Mail gönderme hatası:", error);
      setError("Mail gönderilirken bir hata oluştu.")
      setShowError(true);
    }
  };
  
  

  const handleStatusChange = async (event: React.ChangeEvent<HTMLInputElement>, id : any) => {
    const selectedValue = event.target.id;

    let newState: InternshipStates;
    if (selectedValue === "flexRadioDefault1") {
      newState = InternshipStates.Completed;
    } else if (selectedValue === "flexRadioDefault2") {
      newState = InternshipStates.Failed;
    } else {
      return; // Geçersiz değer, işlem yapılmıyor
    }
  
    try {
      await axios.put(`/api/internships/${id}/state`, {
        state: newState,
      }, {
        headers: getAuthHeader(),
      });
      //setIsStatusChanged(true);
      //setRefetch(!refetch);
      setInternships((prevInternships) => 
        prevInternships.map((internship) =>
          internship.id === id ? { ...internship, state: newState } : internship
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleMailModalOpen = (internship: any) => {
    setSelectedInternshipForMail(internship);
    setShowMailModal(true);
  };
  
  const handleMailModalClose = () => {
    setShowMailModal(false);
    setSelectedInternshipForMail(null);
  };

  useEffect(() => {
    getYears();
  }, [])

  return (
    <div className="internship-container">
      <div className="student-table-container">
        <h2>Öğrenci Notlandırma</h2>
        <input type="text" placeholder="Öğrenci Ara (İsim/Numara)" value={searchTerm} onChange={handleSearchChange} />
        <Row className="mb-3 align-items-center">
          <Col xs="auto" className="dropdown-col">
            {/* Sınıf Dropdown */}
            <Dropdown className="me-2">
              <Dropdown.Toggle variant="success" id="dropdown-grade" size="sm" className="custom-dropdown">
                Sınıf
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilteredGrade(null)}>Tümü</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilteredGrade(1)}>1. Sınıf</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilteredGrade(2)}>2. Sınıf</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilteredGrade(3)}>3. Sınıf</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilteredGrade(4)}>4. Sınıf</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>

          <Col xs="auto" className="dropdown-col">
            {/* Dönem Dropdown */}
            <Dropdown className="me-2">
              <Dropdown.Toggle variant="success" id="dropdown-semester" size="sm" className="custom-dropdown">
                Dönem
              </Dropdown.Toggle>
              {years && years.length > 0 && (
                <Dropdown.Menu>
                  {years.map((e: any) => (
                    <Dropdown.Item key={e.value} onClick={() => setFilteredSemester(e)}>
                      {e.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              )}
            </Dropdown>
          </Col>

          <Col xs="auto" className="badge-col">
            {/* Filtre Badge'leri */}
            {filteredGrade !== null && (
              <div className="custom-badge" onClick={() => clearFilter('grade')}>
                {filteredGrade}. Sınıf
                <FaTimesCircle className="close-icon" />
              </div>
            )}
          </Col>

          <Col xs="auto" className="badge-col">
            {filteredSemester !== null && filteredSemester.name !== "Tümü" && (
              <div className="custom-badge" onClick={() => clearFilter('semester')}>
                {filteredSemester.name}
                <FaTimesCircle className="close-icon" />
              </div>
            )}
          </Col>
        </Row>

        <div className='table-responsive'>
          <Table striped bordered hover size='sm' className='mt-4 fancy-table'>
            <thead>
              <tr>
                <th className='internship-table-writtings text-center'>İsim</th>
                <th className='internship-table-writtings text-center'>Soyisim</th>
                <th className='internship-table-writtings text-center'>Öğrenci Numarası</th>
                <th className='internship-table-writtings text-center'>Şirket</th>
                <th className='internship-table-writtings text-center'>Staj Türü</th>
                <th className='internship-table-writtings text-center'>Başlangıç Tarihi</th>
                <th className='internship-table-writtings text-center'>Bitiş Tarihi</th>
                <th className='internship-table-writtings text-center'>Mail Gönder</th>
                <th className='internship-table-writtings text-center'>Staj Durumu</th>
              </tr>
            </thead>

            <tbody>
              {currentStudents.map((internship) => (
                <tr key={internship.id}>
                  <td className='internship-table-writtings text-center'>{internship.student.name}</td>
                  <td className='internship-table-writtings text-center'>{internship.student.surname}</td>
                  <td className='internship-table-writtings text-center'>{internship.student.school_id}</td>
                  <td className='internship-table-writtings text-center'>{internship.company.name}</td>
                  <td className='internship-table-writtings text-center'>{internship.type}</td>
                  <td className='internship-table-writtings text-center'>{internship.begin_date}</td>
                  <td className='internship-table-writtings text-center'>{internship.end_date}</td>
                  <td className='internship-table-writtings text-center'>
                    <Button className='custom-button' onClick={() => handleMailModalOpen(internship)}>
                      <TbMailUp />
                    </Button>
                  </td>
                  <td className='internship-table-writtings text-center justify-content-center'>
                    <div className="form-check" style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        className={`form-check-input ${internship.state === InternshipStates.Completed ? 'bg-success' : ''}`}
                        type="radio" 
                        checked={internship.state == InternshipStates.Completed} 
                        name={`internshipState-${internship.id}`} 
                        id="flexRadioDefault1" 
                        onChange={((e :any) => { handleStatusChange(e, internship.id);})}
                        style={{ transform: 'scale(1.2)', marginLeft: '2px', marginRight: '2px'}}/>
                      <label className="form-check-label" style={{ color: 'black', fontSize: '14px', marginLeft: '4px', fontWeight: 'normal' }} >
                        Tamamlandı
                      </label>
                    </div>
                    <div className="form-check" style={{ display: 'flex', alignItems: 'center' }}>
                      <input 
                        className={`form-check-input ${internship.state === InternshipStates.Failed ? 'bg-danger' : ''}`}
                        type="radio" 
                        checked={internship.state == InternshipStates.Failed} 
                        name={`internshipState-${internship.id}`} 
                        id="flexRadioDefault2" 
                        onChange={((e :any) => { handleStatusChange(e, internship.id);})} 
                        style={{ transform: 'scale(1.2)', marginLeft: '2px', marginRight: '2px'}}/>
                      <label className="form-check-label" style={{ color: 'black', fontSize: '14px', marginLeft: '4px', fontWeight: 'normal'}} >
                        Başarısız
                      </label>
                    </div>
                  </td>
                  <Modal className="custom-modal" show={showMailModal} onHide={handleMailModalClose} >
                    <Modal.Header closeButton>
                      <Modal.Title>
                        Mail Gönder
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      {showError && (
                        <ErrorAlert
                          show={showError}
                          onClose={handleCloseError}
                          message={error}
                        />
                      )}
                      {selectedInternshipForMail && (
                        <div>
                          <p>
                            <strong>Öğrenci:</strong> {selectedInternshipForMail.student.name}{' '}
                            {selectedInternshipForMail.student.surname}
                          </p>
                          <p>
                            <strong>Öğrenci Numarası:</strong> {selectedInternshipForMail.student.school_id}
                          </p>
                          <p>
                            <strong>Mail:</strong> {selectedInternshipForMail.student.email}
                          </p>
                          <form>
                            <div className="form-group">
                              <label htmlFor="emailSubject">Konu</label>
                              <input
                                type="text"
                                className="form-control"
                                id="emailSubject"
                                placeholder="Konu"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)} // State güncelle
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="emailBody">Mesaj</label>
                              <textarea
                                className="form-control"
                                id="emailBody"
                                rows={4}
                                placeholder="Mesaj"
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)} // State güncelle
                              ></textarea>
                            </div>
                          </form>
                        </div>
                      )}
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleMailModalClose}>
                        Kapat
                      </Button>
                      <Button variant="primary" onClick={handleMailSend}>
                        
                        Gönder
                      </Button>

                    </Modal.Footer>
                  </Modal>

                </tr>
              ))}
            </tbody>

          </Table>
        </div>
      </div>
      <Pagination className='internship-search-pagination fancy-pagination justify-content-center mt-4'>
        {/* Sol Ok */}
        <Pagination.Prev
          onClick={() => handleStudentPageChange(activeStudentPage - 1)}
          disabled={activeStudentPage === 1}
        />
        {/* Sayfa Numaraları */}
        {Array.from({ length: Math.min(3, totalUserPages) }).map((_, index) => {
          const startPage = Math.max(1, activeStudentPage - 1); // Aktif sayfanın bir öncesi
          const page = startPage + index; // Gösterilecek sayfaları dinamik ol
          if (page > totalUserPages) return null; // Toplam sayfa sayısından büyükse
          return (
              <Pagination.Item
                  key={page}
                  active={page === activeStudentPage} // Aktif sayfa ise stil uygula
                  onClick={() => handleStudentPageChange(page)}
              >
                  {page}
              </Pagination.Item>
          );
        })}
        {/* Sağ Ok */}
        <Pagination.Next
          onClick={() => handleStudentPageChange(activeStudentPage + 1)}
          disabled={activeStudentPage === totalUserPages}
        />
      </Pagination>
    </div>
  );
};

export default StudentGrade;