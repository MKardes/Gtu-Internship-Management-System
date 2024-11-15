import React, { useState } from 'react';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import './Dashboard.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredGrade, setFilteredGrade] = useState<number | null>(null);
  const [filteredSemester, setFilteredSemester] = useState<string | null>(null);
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

const fiteredInternships = internships.filter(internship => {
  return (
    (internship.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.student.school_id.includes(searchTerm)));
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
    setFilteredGrade(null);
  };

  const handleSemesterFilter = (semester: string | null) => {
    setFilteredSemester(semester);
  };

  return (
    <div className="dashboard-container">
      <div className="student-table-container">
        <h2>Öğrenci Arama</h2>
        <input type="text" placeholder="Öğrenci Ara (İsim/Numara)" value={searchTerm} onChange={handleSearchChange} />

        <div className="filters">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-grade" size="sm">
              Sınıf Filtrele
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
              Dönem Filtrele
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilteredSemester(null)}>Hepsi</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilteredSemester('winter')}>2023 Yaz</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilteredSemester('summer')}>2023 Kış</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <table>
          <thead>
            <tr>
              <th>İsim</th>
              <th>Soyisim</th>
              <th>Öğrenci Numarası</th>
              <th>Email</th>
              <th>Şirket</th>
            </tr>
          </thead>
          <tbody>
          {fiteredInternships.map((internship) => (
            <tr key={internship.id}>
              <td>{internship.student.name}</td>
              <td>{internship.student.surname}</td>
                <td>{internship.student.school_id}</td>
                <td>{internship.student.email}</td>
                <td>{internship.company.name}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;