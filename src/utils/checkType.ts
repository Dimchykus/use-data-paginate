import {
  IPagination,
  PaginationPropsWithPredefinedData,
  PaginationPropsWithUrl,
} from "../useDataPaginate";

export const isPaginationWithUrl = (
  object: IPagination<any, any>
): object is PaginationPropsWithUrl<any, any> => "url" in object;

export const isPaginationWithData = (
  object: IPagination<any, any>
): object is PaginationPropsWithPredefinedData<any, any> => "data" in object;
