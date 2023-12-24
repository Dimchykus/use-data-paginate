import axios from "axios";

export interface ApiRequestProps {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  params?: any;
  headers?: any;
  responseType?: "json" | "blob";
}

const Api = ({
  url,
  method = "GET",
  data = {},
  params = {},
  headers = {},
  responseType = "json",
}: ApiRequestProps): any =>
  axios
    .get(url, {
      method,
      data,
      params,
      headers,
      responseType,
    })
    .then((response: any) => {
      return response.data;
    })
    .catch((error: any) => {
      throw error;
    });

export default Api;