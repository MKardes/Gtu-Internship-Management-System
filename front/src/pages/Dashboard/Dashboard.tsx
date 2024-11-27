import React, { useState } from 'react';
import axios from 'axios';
import { Dropdown, ToggleButton } from 'react-bootstrap';
import { Button, Modal } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import './Dashboard.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

enum InternshipStates {
  Begin = "begin",
  ReportReceived = "report_received",
  ReportApproved = "report_approved",
  Completed = "completed"
}

const StateConversions = {
  "begin": "Staj Süreci Başladı",
  "report_received": "Staj Raporu Alındı",
  "report_approved": "Staj Rapor Onaylandı",
  "completed": "Staj Tamamlandı",
}

const Dashboard: React.FC = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredGrade, setFilteredGrade] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false); // Modal'ın gösterilme durumunu tutan state.
  const [filteredSemester, setFilteredSemester] = useState<string | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<any | null>(null);
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
  }, [filteredGrade, filteredSemester]);

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
            <Modal.Title>Öğrenci Detayları</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedInternship && (
              <>
                <p><strong>İsim:</strong> {selectedInternship.student.name}</p>
                <p><strong>Soyisim:</strong> {selectedInternship.student.surname}</p>
                <p><strong>Öğrenci Numarası:</strong> {selectedInternship.student.school_id}</p>
                <p><strong>Email:</strong> {selectedInternship.student.email}</p>
                <p><strong>Şirket:</strong> {selectedInternship.company.name}</p>
                <p><strong>Staj Durumu:</strong> {StateConversions[selectedInternship.state as InternshipStates]}</p>
                <p>
                  <div className='items-center justify-center'>
                    <strong>SGK Raporu:</strong> 
                    <ToggleButton
                      className="px-2 items-center justify-center"
                      id="toggle-check"
                      type="checkbox"
                      variant="outline-success"
                      checked={true}
                      size='lg'
                      value="1"
                      // onChange={(e) => setChecked(e.currentTarget.checked)}
                    ></ToggleButton>
                  </div>
                </p>
                
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
    </div>
  );
};

export default Dashboard;