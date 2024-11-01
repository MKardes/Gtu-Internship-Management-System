
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:20000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000; // Optional: 10-second timeout

export default axios;
