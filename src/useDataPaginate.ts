"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Api from "./api";

const isPaginationWithUrl = (
  obj: any
): obj is PaginationPropsWithUrl<any, any> => obj.hasOwnProperty("url");

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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

interface PaginatedObj<T> {
  [key: string]: T[];
}

interface PaginationProps<R> {
  page: number;
  limit?: number;
  isLoading?: boolean;
  totalItems?: number;
  totalPages?: number;
  parseTotalItems?: (data: R) => number;
  parseTotalPages?: (data: R) => number;
  onPageChange?: (page: number) => void;
}

interface PaginationPropsWithUrl<T, R> extends PaginationProps<R> {
  url: string;
  pageName?: string;
  limitName?: string;
  parseData?: (data: R) => T[];
  data?: never;
}

interface PaginationPropsWithPredefinedData<T, R> extends PaginationProps<R> {
  data: T[];
  url?: never;
  pageName?: never;
  limitName?: never;
  parseData?: never;
  onPageChange?: (page: number) => void;
}

export type IPagination<T, R> =
  | PaginationPropsWithUrl<T, R>
  | PaginationPropsWithPredefinedData<T, R>;

export interface PaginationInstance<T> {
  data: T[];
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  isFirst: boolean;
  isLast: boolean;
  pagesCount: number;
  total: number;
  limit: number;
  totalItems: number;
  loading: boolean;
  error: any;
  next(): void;
  prev(): void;
  first(): void;
  last(): void;
  setPage(page: number): boolean;
  setUrl?(url: string): void;
  setOnChange?(onChange: (page: number) => void): void;
}

const useDataPaginate = <T extends Record<string, any>, R>(
  props: IPagination<T, R>
): PaginationInstance<T> => {
  const {
    page,
    limit = 25,
    data,
    url,
    pageName = "page",
    limitName = "limit",
    isLoading: isDataLoading,
    totalItems: totalItemsProp,
    totalPages: totalPagesProp,
    parseData,
    parseTotalItems,
    parseTotalPages,
    onPageChange,
  } = props;
  const [currentPage, setCurrentPage] = useState<number>(page || 1);
  const [totalItems, setTotalItems] = useState(totalItemsProp ?? 0);
  const [totalPages, setTotalPages] = useState(totalPagesProp ?? 0);
  const [allItems, setAllItems] = useState<PaginatedObj<T>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passedData, setPassedData] = useState<T[] | null>(data ?? null);
  const [error, setError] = useState<any>(null);

  const hasNext = useMemo(
    () => currentPage * limit < totalItems,
    [limit, currentPage, totalItems]
  );
  const hasPrev = useMemo(() => currentPage > 1, [currentPage]);
  const isFirst = useMemo(() => currentPage === 1, [currentPage]);
  const isLast = useMemo(
    () => currentPage * limit >= totalItems,
    [limit, currentPage, totalItems]
  );

  const isCustomGetPage = !!onPageChange ?? false;

  const next = () => {
    setPage(currentPage + 1);
    fetch(currentPage + 1);
  };

  const prev = () => {
    setPage(currentPage - 1);
    fetch(currentPage - 1);
  };

  const first = () => {
    if (!isFirst) {
      setCurrentPage(1);
      fetch(page);
    }
  };

  const last = useCallback(() => {
    if (!isLast) {
      setCurrentPage(totalPages);
      fetch(totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, isLast]);

  const setPage = (page: number): boolean => {
    if (page < 1 || page === currentPage) return false;

    setCurrentPage(page);
    fetch(page);

    return true;
  };

  const countItems = () => {
    let count = 0;

    Object.keys(allItems).forEach((key) => {
      count += (allItems[key] ?? []).length ?? 0;
    });

    return count;
  };

  const isPageExists = useCallback(
    (page: number, data?: PaginatedObj<T>) => {
      const dataPage = page - 1;
      if (!data) return dataPage in allItems && !!allItems[dataPage];

      return dataPage in data && !!data[dataPage];
    },
    [allItems]
  );

  const getPageItems = useCallback(
    (page: number, items?: PaginatedObj<T>) => {
      const data = items ? items : allItems;

      if (!isPageExists(page)) {
        return null;
      }

      return data[page - 1];
    },
    [allItems, isPageExists]
  );

  const setPageItems = (page: number, data: T[]) => {
    setAllItems((prev) => {
      const newData = { ...prev };
      newData[page - 1] = data;

      return newData;
    });
  };

  const customGetPage = (page: number, limit?: number) => {
    if (!onPageChange || isPageExists(page)) return;

    onPageChange(page);
  };

  const fetch = async (page: number) => {
    if (isCustomGetPage) {
      customGetPage(page, limit);

      return;
    }

    if (!isPaginationWithUrl(props)) {
      return null;
    }

    if (url) {
      setIsLoading(true);

      try {
        const data = await Api({
          url: url,
          method: "GET",
          params: {
            [pageName]: page,
            [limitName]: limit,
          },
        });

        let res = data;
        setIsLoading(false);

        if (parseData) {
          res = parseData(data);
        }

        if (!Array.isArray(res)) {
          res = [];
          throw new Error("Data must be an array");
        }

        if (parseTotalItems) {
          const total = parseTotalItems(data);
          setTotalItems(total);
        } else {
          setTotalItems(data.length);
        }

        if (parseTotalPages) {
          const total = parseTotalPages(data);
          setTotalPages(total);

          if (currentPage > total) {
            setCurrentPage(total);
          }
        }

        setPageItems(page, res);
      } catch (err) {
        setIsLoading(false);
        setError(getErrorMessage(err));
      }
    }

    return null;
  };

  const initData = useCallback(() => {
    if (passedData) {
      const res = paginateArray<T>(passedData, limit);

      setAllItems(res);

      let page = currentPage;

      const pageExist = isPageExists(page, res);

      if (!pageExist) {
        page = 1;
      }

      setCurrentPage(page);

      if (!totalItemsProp) setTotalItems(passedData.length);

      if (!totalPagesProp) setTotalPages(Object.keys(res).length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passedData, limit]);

  useEffect(() => {
    if (!passedData) return;

    initData();
  }, [initData, passedData, limit]);

  useEffect(() => {
    fetch(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  useEffect(() => {
    if (!totalItemsProp) return;

    setTotalItems(totalItemsProp);
  }, [totalItemsProp]);

  useEffect(() => {
    if (!totalPagesProp) return;

    setTotalPages(totalPagesProp);
  }, [totalPagesProp]);

  useEffect(() => {
    if (data) {
      setPassedData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (typeof isDataLoading === "boolean") setIsLoading(isDataLoading);
  }, [isDataLoading]);

  const instance: PaginationInstance<T> = {
    data: getPageItems(currentPage) ?? [],
    currentPage,
    hasNext,
    hasPrev,
    isFirst,
    isLast,
    pagesCount: totalPages,
    total: totalItems,
    totalItems: countItems(),
    loading: isLoading,
    error,
    limit,
    next,
    prev,
    first,
    last,
    setPage,
  };

  return instance;
};

export default useDataPaginate;
