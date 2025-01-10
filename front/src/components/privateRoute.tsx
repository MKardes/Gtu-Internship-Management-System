import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

interface PrivateRouteProps {
  element: React.ReactNode;
  requiredRole?: string;
  [key: string]: any;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, requiredRole, ...rest }) => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");


  useEffect(() => {
    const fetchUserRole = async () => {
      if (accessToken) {
        try {
          const response = await axios.get("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setUserRole(response.data.user.role);
        } catch (error) {
          setUserRole(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [accessToken]);

  if (!accessToken && !refreshToken) {
    return <Navigate to="/login" />;
  }


  if (loading) {
    return <div>Loading...</div>; // Yükleniyor durumu
  }

  // Eğer bir role gerekiyorsa ve role uyumsuzsa, login sayfasına yönlendiriyoruz
  if (requiredRole && userRole !== requiredRole) {
    console.log(userRole)
    if(userRole === "SuperAdmin")
      return <Navigate to="/super-admin" />;
    else
      return <Navigate to="/dashboard" />;
  }

  // Tüm kontroller geçerse, protected route'u render ediyoruz
  return <>{element}</>;
};

export default PrivateRoute;
