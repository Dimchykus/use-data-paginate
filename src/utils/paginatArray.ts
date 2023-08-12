import { PaginatedObj } from "../useDataPaginate";

const paginateArray = <T>(array: any, itemsPerPage: number) => {
  const totalPages = Math.ceil(array.length / itemsPerPage);
  const paginatedObject: PaginatedObj<T> = {};

  for (let page = 0; page < totalPages; page++) {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedObject[page] = array.slice(startIndex, endIndex);
  }

  return paginatedObject;
};

export default paginateArray;
