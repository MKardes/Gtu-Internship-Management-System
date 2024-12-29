import React, { useState } from 'react';
import axios from 'axios';
import { Card, Dropdown, OverlayTrigger, Pagination, ToggleButton, Tooltip } from 'react-bootstrap';
import { Button, Modal, ListGroup, Table } from 'react-bootstrap';
import { FaCheckCircle, FaSearch, FaTimesCircle } from 'react-icons/fa';
import './InternshipSearch.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Option = {
  value: number;
  name: string;
  id?: string;
}

enum InternshipStates {
  Begin = "begin",
  ReportReceived = "report_received",
  ReportApproved = "report_approved",
  Completed = "completed",
  Failed = "failed"
}

const StateConversions = {
  "begin": "Staj Süreci Başladı",
  "report_received": "Staj Raporu Alındı",
  "report_approved": "Staj Rapor Onaylandı",
  "completed": "Staj Tamamlandı",
  "failed": "Staj Başarısız",
}

const nums = [1, 2, 3, 4]

const InternshipSearch: React.FC = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredGrade, setFilteredGrade] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false); // Modal'ın gösterilme durumunu tutan state.
  const [filteredSemester, setFilteredSemester] = useState<Option | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
  const [showConfirmMessage, setShowConfirmMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSGKUploaded, setIsSGKUploaded] = useState(false); // SGK yüklenme durumu
  const [refetch, setRefetch] = useState<boolean>(false);
  const [activeStudentPage, setActiveStudentPage] = useState(1);
  const [years, setYears] = useState<Option[]>();
  const studentPerPage = 10;
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
  }, [filteredGrade, filteredSemester, refetch]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Modal'ı açma fonksiyonu
  const handleShowModal = (internship: any) => {
    setSelectedInternship(internship);
    setShowModal(true);
  };

  // Modal'ı kapatma fonksiyonu
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleToggle = async () => {
    try {
      if (!isSGKUploaded) {
        // Eğer SGK yüklü değilse, direkt "Yüklendi" olarak işaretle
        await axios.put(`/api/internships/${selectedInternship.id}/state`, {
          is_sgk_uploaded: true
        }, {
          headers: getAuthHeader(),
        })
        setRefetch(!refetch);
        setIsSGKUploaded(true);
      } else if (showConfirmMessage) {
        // Eğer onay mesajı gösterilmişse ve tekrar tıklanırsa "Yüklenmedi" durumuna geç
        await axios.put(`/api/internships/${selectedInternship.id}/state`, {
          is_sgk_uploaded: false
        }, {
          headers: getAuthHeader(),
        })
        setRefetch(!refetch);
        setIsSGKUploaded(false);
        setShowConfirmMessage(false); // Onay mesajını sıfırla
      } else {
        // İlk tıklamada onay mesajını göster
        setShowConfirmMessage(true);
        setTimeout(() => setShowConfirmMessage(false), 3000); // 3 saniye sonra otomatik gizle
        handleConfirmModalOpen(); // Onay modal'ını aç
      }
    } catch (e) {
      console.error(e)
    }
  };

  const handleConfirmModalOpen = () => {
    setShowConfirmModal(true); // Confirmation modal'ını aç
  };
  
  const handleConfirmModalClose = () => {
    setShowConfirmModal(false); // Confirmation modal'ını kapat
  };
  
  const handleConfirmRemove = async () => {
    await axios.put(`/api/internships/${selectedInternship.id}/state`, {
      is_sgk_uploaded: false
    }, {
      headers: getAuthHeader(),
    })
    setRefetch(!refetch);
    setIsSGKUploaded(false); // SGK yüklemesini kaldır
    setShowConfirmModal(false); // Confirmation modal'ını kapat
  };

  const handleNextStep = (internshipId: number) => {
    setInternships((prevInternships) =>
      prevInternships.map((internship) => {
        if (internship.id === internshipId) {
          // Sıradaki aşamayı belirle
          const currentState = internship.state;
          const nextState = getNextState(currentState);
          return { ...internship, state: nextState }; // Durumu güncelle
        }
        return internship;
      })
    );
  };
  // Bir sonraki durumu döndüren yardımcı fonksiyon
  const getNextState = (currentState: InternshipStates): InternshipStates => {
    switch (currentState) {
      case InternshipStates.Begin:
        return InternshipStates.ReportReceived;
      case InternshipStates.ReportReceived:
        return InternshipStates.ReportApproved;
      case InternshipStates.ReportApproved:
        return InternshipStates.Completed;
      default:
        return currentState; // Eğer son durumdaysa değişiklik yapma
    }
  };

  const isStateDone = (state: InternshipStates, deg: number) => {
    switch (deg) {
      case 1:
        return "Tamamlandı";
      case 2:
        if (state === InternshipStates.Begin){
          return '-'
        }
        return "Tamamlandı";
      case 3:
        if (state === InternshipStates.Begin || state === InternshipStates.ReportReceived){
          return '-'
        }
        return "Tamamlandı";
      case 4:
        if (state === InternshipStates.Failed){
          return 'Başarısız'
        }
        if (state === InternshipStates.Completed){
          return 'Tamamlandı'
        }
        return "-";
    }
  }

  useEffect(() => {
    if(selectedInternship){
      setIsSGKUploaded(selectedInternship.is_sgk_uploaded);
    }
  }, [selectedInternship])

  useEffect(() => {
    getYears();
  }, [])

  return (
    <div className="internship-container">
      <div className="student-table-container">
        <h2>Staj Arama</h2>
        <input type="text" placeholder="Öğrenci Ara (İsim/Numara)" value={searchTerm} onChange={handleSearchChange} />

        <div className="filters">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-grade" size="sm">
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

          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-semester" size="sm">
              Dönem
            </Dropdown.Toggle>
            {(years && years.length > 0) ? (
              <Dropdown.Menu>
                {years.map( (e: any) => (
                  <Dropdown.Item key={e.value} onClick={() => setFilteredSemester(e)}>{e.name}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            ): null
            }
          </Dropdown>
        </div>
        <div className='table-responsive'>
          <Table striped bordered hover size='sm' className='mt-4 fancy-table'>
            <thead>
              <tr>
                <th className='internship-table-writtings text-center'>İsim</th>
                <th className='internship-table-writtings text-center'>Soyisim</th>
                <th className='internship-table-writtings text-center'>Öğrenci Numarası</th>
                <th className='internship-table-writtings text-center'>Şirket</th>
                <th className='internship-table-writtings text-center'>Staj Türü</th>
                <th className='internship-table-writtings text-center'>Detaylar</th>
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
                  <td className='internship-table-writtings text-center justify-content-center'>
                    <Button className='custom-button' onClick={() => handleShowModal(internship)}>
                      <FaSearch />
                    </Button>
                  </td>
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
    {/* Modal component */}
      <Modal size="lg" dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title" show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
          </Modal.Header>
          <Modal.Body>
            {selectedInternship && (
              <>
                {/* Öğrenci Bilgileri Kutusu */}
                <Card className="mb-4">
                <Card.Header>Öğrenci Bilgileri</Card.Header>
                    <Card.Body>
                        <p><strong>İsim:</strong> {selectedInternship.student.name}</p>
                        <p><strong>Soyisim:</strong> {selectedInternship.student.surname}</p>
                        <p><strong>Öğrenci Numarası:</strong> {selectedInternship.student.school_id}</p>
                        <p><strong>Email:</strong> {selectedInternship.student.email}</p>
                        <p><strong>Staj Türü:</strong> {selectedInternship.type}</p>
                    </Card.Body>
                </Card>

                {/* Staj Aşamaları Kutusu */}
            <Card className="mb-4">
              <Card.Body>
                <Card.Title className="text-center">{selectedInternship.company.name}</Card.Title>
                <p className="text-center">
                  <strong>İletişim:</strong> {selectedInternship.mentor.name} {selectedInternship.mentor.surname} (Supervisor), Tel: {selectedInternship.mentor.phone_number}
                </p>
                  <Card className="mb-4">
                    <Card.Header style={{ backgroundColor: "#cce5ff"}}>Staj Aşamaları</Card.Header>
                    <ListGroup>
                      {nums.map((e: any) => (
                        <ListGroup.Item>
                          <div style={{display: "flex"}}>
                            <strong>Durum {e} - </strong>
                            <p>{isStateDone(selectedInternship.state, e)}</p>
                            <div className='flex'>
                              {isStateDone(selectedInternship.state, e) === 'Tamamlandı' ?
                                <FaCheckCircle className="ms-2 text-success" />
                              : isStateDone(selectedInternship.state, e) === 'Başarısız' ?
                                <FaTimesCircle className="ms-2 text-red-600" />
                              : null
                              }
                            </div>
                          </div>
                        </ListGroup.Item>
                        ))
                      }
                    </ListGroup>
                  </Card>
                <p>
                  <div className="d-flex align-items-center">
                    <strong className="me-3">SGK Raporu:</strong> {/* Sağ tarafa boşluk ekledik */}
                    <div style={{ position: "relative", display: "inline-block" }}></div>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="button-tooltip">
                          {isSGKUploaded 
                            ? "SGK yüklendi. Kaldırmak için tıklayın."
                            : "SGK yüklenmedi. Yüklemek için tıklayın."}
                        </Tooltip>
                      }
                    >
                      <ToggleButton
                        className="px-2 items-center justify-center"
                        id="toggle-check"
                        type="checkbox"
                        variant={isSGKUploaded ? "outline-success" : "outline-danger"}
                        checked={isSGKUploaded}
                        size='sm'
                        value="1"
                        onClick={handleToggle}
                      >
                        {isSGKUploaded ? (
                          <FaCheckCircle className="me-1" style={{ fontSize: "0.9rem" }} />
                        ) : (
                          <FaTimesCircle className="me-1" style={{ fontSize: "0.9rem" }} />
                        )}
                        <span style={{ fontSize: "0.85rem" }}>
                          {isSGKUploaded ? "Yüklendi" : "Yüklenmedi"}
                        </span>
                      </ToggleButton>
                    </OverlayTrigger>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <strong className="me-3">Durum:</strong>
                    <span>{StateConversions[selectedInternship.state as keyof typeof StateConversions]}</span>
                  </div>
                </p>
                </Card.Body>
                </Card>
                {/* Burada daha fazla öğrenci bilgisi ekleyebilirsiniz */}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Kapat
            </Button>
          </Modal.Footer>
        </Modal>

        {/* SGK kaldırma onay modali */}
        <Modal show={showConfirmModal} onHide={handleConfirmModalClose}>
        <Modal.Header closeButton>
            <Modal.Title>Onay Gerekli</Modal.Title>
        </Modal.Header>
        <Modal.Body>SGK yüklemesini kaldırmak istediğinizden emin misiniz?</Modal.Body>
        <Modal.Footer >
            <div style={{  display: "flex", gap: "10px" }}>
                <Button variant="secondary" onClick={handleConfirmModalClose}>
                Vazgeç
                </Button>
                <Button variant="danger" onClick={handleConfirmRemove}>
                Kaldır
                </Button>
            </div>
        </Modal.Footer>
        </Modal>
    </div>
  );
};

export default InternshipSearch;