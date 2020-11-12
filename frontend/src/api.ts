import axios, { AxiosResponse, AxiosError } from "axios";
import { getToken, clearToken } from "./modules/auth";

export const api = axios.create({
  baseURL: createBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      clearToken();
    }

    return Promise.reject(err);
  }
);

function createBaseUrl() {
  // eslint-disable-next-line no-restricted-globals
  const { protocol, hostname, port } = location;

  if (process.env.NODE_ENV === "development") {
    return `${protocol}//${hostname}:3000/`;
  }

  return `${protocol}//${hostname}:${port}/`;
}
