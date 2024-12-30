import React, { useState, useEffect } from "react";
import { Table, Pagination, ListGroup, Form } from "react-bootstrap";
import { FiDownload, FiTrash2 } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./MyReports.css";
import { TermConversions } from "../Dashboard/Dashboard";

const MyReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [activeStudentPage, setActiveStudentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [refetch, setRefetch] = useState<boolean>(false);
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
    
    // Raporları Getir
    const fetchReports = async () => {
        try {
            const response = await axios.get("/api/reports", {
              headers: getAuthHeader(),
            });

            setReports(response.data.map((e: any) => ({
              ...e,
              term: TermConversions[e.term as keyof typeof TermConversions]
            })));

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

  const handleDownload = (report: any) => {
    console.log(`Rapor indiriliyor: ${report.name}`);
    // Backend indirme isteği buraya eklenecek
  };

  const handleDelete = async (report: any) => {
    try {
      await axios.delete(`/api/report/${report.file}`, {
        headers: getAuthHeader(),
      });
      setRefetch(!refetch);

  } catch (error) {
      handleError(error);
  }
  };

  useEffect(() => {
    fetchReports();
  }, [refetch]);

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
              <th>Akademik Yıl</th>
              <th>Dönem</th>
              <th>Tarih</th>
              <th>Rapor</th>
            </tr>
          </thead>
          <tbody>
            {currentReports.length > 0 ? (
              currentReports.map((report, index) => (
                <tr key={report.id}>
                  <td>{index + 1 + (activeStudentPage - 1) * studentPerPage}</td>
                  <td>{report.academicYear}</td>
                  <td>{report.term}</td>
                  <td>{report.date}</td>
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
