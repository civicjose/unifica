import axios from 'axios';

//const API_URL = 'http://localhost:4000/api/auth';
const API_URL = '/api/auth';


const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

const authService = {
  login,
};

export default authService;