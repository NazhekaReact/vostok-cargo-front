import axios from "axios";

const api = axios.create({
  baseURL: "http://10.202.4.249:5051",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
