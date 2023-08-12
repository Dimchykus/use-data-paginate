import axios from "axios";

export interface ApiRequestProps {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  params?: any;
  headers?: any;
  responseType?: "json" | "blob";
}

export const Api = ({
  url,
  method = "GET",
  data = {},
  params = {},
  headers = {},
  responseType = "json",
}: ApiRequestProps) =>
  axios
    .get(url, {
      method,
      data,
      params,
      headers,
      responseType,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
