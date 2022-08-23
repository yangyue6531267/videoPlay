import axios from "axios";

const httpClient = axios.create({
  timeout: 5000,
});

export default httpClient;
