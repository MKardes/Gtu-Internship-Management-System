import React, { useState, useEffect } from "react";
import { Table, Pagination, ListGroup, Form } from "react-bootstrap";
import { FiDownload, FiTrash2 } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./MyReports.css";

const MyReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [activeStudentPage, setActiveStudentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const studentPerPage = 10;

    const getAuthHeader = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/login");
        }
        return {
            Authorization: `Bearer ${token}`,
        };
    };

    // Yönetici Bilgilerini Getir
    const fetchAdminInfo = async () => {
        try {
            const response = await axios.get("/api/department-admin/department-admin", {
                headers: getAuthHeader(),
            });
            setAdminInfo(response.data);
        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error: any) => {
        if (axios.isAxiosError(error) && error.response) {
            setError(error.response.data.message);
        } else {
            setError('Bilinmeyen bir hata oluştu');
        }
    };

  const fetchReports = async () => {
    try {
      const exampleReports = [
        { id: 1, name: "Bilgisayar-Mühendisliği_10.12.2024_2023-2024_midterm-fall.docx" },
        { id: 2, name: "Makine-Mühendisliği_12.12.2024_2023-2024_summer.docx" },
        { id: 3, name: "Elektrik-Mühendisliği_15.01.2024_2023-2024_midterm-spring.docx" },
        { id: 4, name: "İnşaat-Mühendisliği_18.03.2024_2023-2024_midterm-break.docx" },
        { id: 5, name: "Kimya-Mühendisliği_05.05.2023_2022-2023_final-fall.docx" },
        { id: 6, name: "Mekatronik-Mühendisliği_08.06.2023_2022-2023_final-summer.docx" },
        { id: 7, name: "Endüstri-Mühendisliği_11.07.2024_2023-2024_midterm-winter.docx" },
        { id: 8, name: "Yazılım-Mühendisliği_14.08.2024_2023-2024_final-fall.docx" },
        { id: 9, name: "Biyomedikal-Mühendisliği_17.09.2024_2023-2024_midterm-spring.docx" },
        { id: 10, name: "Havacılık-Mühendisliği_20.10.2024_2023-2024_midterm-fall.docx" },
        { id: 11, name: "Denizcilik-Mühendisliği_23.11.2023_2022-2023_final-summer.docx" },
        { id: 12, name: "Petrol-Mühendisliği_26.12.2024_2023-2024_midterm-winter.docx" },
        { id: 13, name: "Çevre-Mühendisliği_29.01.2024_2023-2024_midterm-spring.docx" },
        { id: 14, name: "Jeoloji-Mühendisliği_01.02.2024_2023-2024_midterm-fall.docx" },
        { id: 15, name: "Gıda-Mühendisliği_04.03.2024_2023-2024_midterm-summer.docx" },
      ];

      const reportsWithDetails = exampleReports.map((report) => {
        const parts = report.name.split("_");
        const department = parts[0];
        const datePart = parts[1];
        const academicYear = parts[2];
        const term = parts[3].replace(".docx", "");
        return { ...report, department, date: datePart, academicYear, term };
      });

      setReports(reportsWithDetails);
    } catch (error) {
      console.error("Raporlar alınırken hata oluştu:", error);
    }
  };

  const handleDownload = (report: any) => {
    console.log(`Rapor indiriliyor: ${report.name}`);
    // Backend indirme isteği buraya eklenecek
  };

  const handleDelete = (report: any) => {
    console.log(`Rapor siliniyor: ${report.name}`);
    // Backend silme isteği buraya eklenecek
  };

  useEffect(() => {
    fetchAdminInfo();
    fetchReports();
  }, []);

  const indexOfLastReport = activeStudentPage * studentPerPage;
  const indexOfFirstReport = indexOfLastReport - studentPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / studentPerPage);

  const handleStudentPageChange = (page: number) => {
    setActiveStudentPage(page);
  };

  return (
    <div className="internship-container">
      <div className="student-table-container">
        <h2>Raporlarım</h2>
        <Table striped bordered hover responsive className="fancy-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Bölüm</th>
              <th>Tarih</th>
              <th>Akademik Yıl</th>
              <th>Dönem</th>
              <th>Rapor</th>
            </tr>
          </thead>
          <tbody>
            {currentReports.length > 0 ? (
              currentReports.map((report, index) => (
                <tr key={report.id}>
                  <td>{index + 1 + (activeStudentPage - 1) * studentPerPage}</td>
                  <td>{report.department}</td>
                  <td>{report.date}</td>
                  <td>{report.academicYear}</td>
                  <td>{report.term}</td>
                  <td>
                    <div className="d-flex justify-content-start gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleDownload(report)}
                      >
                        <FiDownload />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(report)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>Henüz bir rapor bulunmamaktadır.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev
          onClick={() => handleStudentPageChange(activeStudentPage - 1)}
          disabled={activeStudentPage === 1}
        />
        {Array.from({ length: totalPages }).map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === activeStudentPage}
            onClick={() => handleStudentPageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => handleStudentPageChange(activeStudentPage + 1)}
          disabled={activeStudentPage === totalPages}
        />
      </Pagination>
    </div>
  );
};

export default MyReports;
