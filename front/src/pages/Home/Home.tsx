import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import Logo from "../../assets/logo.jpg";
import ErrorAlert from "../../components/ErrorAlert/ErrorAlert";

const Home: React.FC = () => {
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Eğer token varsa ve token geçerliyse dashboard sayfasına yönlendir
    const token = localStorage.getItem("token");
    if (token) {
      alert("Boş buradayım");
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    await delay(500);

    // Şimdilik bu şekilde buradan backend'e istek atılacak
    if (inputUsername !== "admin" || inputPassword !== "admin") {
      setShow(true);
    } else {
      localStorage.setItem("token", "dummy-jwt-token");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <div className="sign-in__wrapper">
      <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <img
          className="img-thumbnail mx-auto d-block mb-2"
          src={Logo}
          alt="logo"
        />
        <div className="h4 mb-2 text-center">GTU Staj Takip Sistemi</div>
        {/* ErrorAlert component'i */}
        <ErrorAlert
          show={show}
          onClose={() => setShow(false)}
          message="Kullanıcı adı veya şifre hatalı!"
        />
        <Form.Group className="mb-2" controlId="username">
          <Form.Label>Kullanıcı Adı</Form.Label>
          <Form.Control
            type="text"
            value={inputUsername}
            placeholder="Kullanıcı Adı"
            onChange={(e) => setInputUsername(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="password">
          <Form.Label>Şifre</Form.Label>
          <Form.Control
            type="password"
            value={inputPassword}
            placeholder="Şifre"
            onChange={(e) => setInputPassword(e.target.value)}
            required
          />
        </Form.Group>
        {!loading ? (
          <Button className="w-100" variant="primary" type="submit">
            Giriş Yap
          </Button>
        ) : (
          <Button className="w-100" variant="primary" type="submit" disabled>
            Yükleniyor...
          </Button>
        )}
        <div className="d-grid justify-content-end">
          <Button className="text-muted px-0" variant="link">
            <Link to="/forgot-password">Parolamı Unuttum</Link>
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Home;
