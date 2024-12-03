import React, { useState } from 'react';
import axios from 'axios';
import { Card, Dropdown, OverlayTrigger, ToggleButton, Tooltip } from 'react-bootstrap';
import { Button, Modal, ListGroup} from 'react-bootstrap';
import { FaCheckCircle, FaSearch, FaTimesCircle } from 'react-icons/fa';
import './Dashboard.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

const Dashboard: React.FC = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredGrade, setFilteredGrade] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false); // Modal'ın gösterilme durumunu tutan state.
  const [filteredSemester, setFilteredSemester] = useState<string | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
  const [showConfirmMessage, setShowConfirmMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSGKUploaded, setIsSGKUploaded] = useState(false); // SGK yüklenme durumu
  const [refetch, setRefetch] = useState<boolean>(false);
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

const filteredInternships = internships.filter(internship => {
  return (
    (internship.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.student.school_id.includes(searchTerm))
  );
});


  useEffect(() => {
    fetchInternships();
  }, [filteredGrade, filteredSemester, refetch]);

  const fetchInternships = async () => {
    try {
      // Construct query parameters
      const params = new URLSearchParams();
      if (filteredGrade !== null) params.append('grade', filteredGrade.toString());
      if (filteredSemester !== null) params.append('semester', filteredSemester);

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

  const handleGradeFilter = (grade: number | null) => {
    setFilteredGrade(grade);
  };

  const handleSemesterFilter = (semester: string | null) => {
    setFilteredSemester(semester);
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

  }, [])

  return (
    <div className="dashboard-container">
      <div className="student-table-container">
        <h2>Öğrenci Arama</h2>
        <input type="text" placeholder="Öğrenci Ara (İsim/Numara)" value={searchTerm} onChange={handleSearchChange} />

        <div className="filters">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-grade" size="sm">
              Sınıf
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilteredGrade(null)}>Hepsi</Dropdown.Item>
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
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilteredSemester(null)}>Hepsi</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilteredSemester('winter')}>2023 Yaz</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilteredSemester('summer')}>2023 Kış</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <table className="table table-bordered border-secondary-subtle">
          <thead>
            <tr>
              <th>İsim</th>
              <th>Soyisim</th>
              <th>Öğrenci Numarası</th>
              <th>Email</th>
              <th>Şirket</th>
              <th>Staj Türü</th>
              <th>Detaylar</th> {/* Modal açma butonu için başlık */}
            </tr>
          </thead>
          <tbody>
          {filteredInternships.map((internship) => (
            <tr key={internship.id}>
              <td>{internship.student.name}</td>
              <td>{internship.student.surname}</td>
              <td>{internship.student.school_id}</td>
              <td>{internship.student.email}</td>
              <td>{internship.company.name}</td>
              <td>{internship.type}</td>
              <td>
              <Button
                className="custom-button"
                onClick={() => handleShowModal(internship)}>
                <FaSearch /> {/* Büyüteç simgesi */}
              </Button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
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

export default Dashboard;