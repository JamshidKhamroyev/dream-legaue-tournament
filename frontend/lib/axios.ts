import axios from "axios";

export const axiosClient = axios.create({
    baseURL: "https://dream-legaue-tournament.onrender.com",
    withCredentials: true
})