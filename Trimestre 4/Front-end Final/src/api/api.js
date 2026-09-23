import axios from "axios";

const API = axios.create({
    baseURL : "http://localhost:6000/"
});

export default API;