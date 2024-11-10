import axios from 'axios';

// API URL'sini environment variable'dan alıyoruz
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000; // Optional: 10-second timeout

// Axios interceptor'ı
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Eğer status 403 ise (Access token geçersizse)
    if (error.response && error.response.status === 403) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
            // Refresh token ile yeni access token al
            const refreshResponse = await axios.post('/api/auth/refresh-token', {
                refreshToken,
            });
            const { accessToken } = refreshResponse.data;
          // Yeni access token'ı localStorage'a kaydet
          localStorage.setItem('accessToken', accessToken);

          // Orijinal isteği yenileyin, Authorization header'ını yeni access token ile güncelle
          error.config.headers['Authorization'] = `Bearer ${accessToken}`;

          // Yeniden isteği gönder
          return axios(error.config);
        } catch (refreshError) {
          console.error('Refresh token işlemi başarısız:', refreshError);
          // Refresh token geçersizse, kullanıcıyı logout yapabiliriz
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // Kullanıcıyı login sayfasına yönlendirebilirsiniz
        }
      }
    }

    // Hata durumunda, hatayı geri gönder
    return Promise.reject(error);
  }
);

export default axios;
