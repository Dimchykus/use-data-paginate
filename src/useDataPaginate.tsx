"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { Api } from "./axios";
import useIsMount from "./utils/useMount";
import paginateArray from "./utils/paginatArray";
import { isPaginationWithUrl } from "./utils/checkType";
import arraysEqual from "./utils/compare";

export interface PaginatedObj<T> {
  [key: string]: T[];
}

export interface PaginationProps<T, R> {
  page: number;
  limit?: number;
  parseTotalItems?: (data: R) => number;
  parseTotalPages?: (data: R) => number;
}

export interface PaginationPropsWithUrl<T, R> extends PaginationProps<T, R> {
  url: string;
  pageName?: string;
  limitName?: string;
  parseData?: (data: R) => T[];
  data?: never;
}

export interface PaginationPropsWithPredefinedData<T, R>
  extends PaginationProps<T, R> {
  data: T[];
  url?: never;
  pageName?: never;
  limitName?: never;
  parseData?: never;
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
  fetchedCount: number;
  loading: boolean;
  error: any;
  next(): void;
  prev(): void;
  first(): void;
  last(): void;
  setPage(page: number): boolean;
  setLimit(limit: number): void;
  setUrl?(url: string): void;
  setOnChange?(onChange: (page: number) => void): void;
}

const useDataPaginate = <T extends Record<string, any>, R>(props: IPagination<T, R>): PaginationInstance<T> => {
  const {
    page,
    limit,
    data,
    url,
    pageName = "page",
    limitName = 'limit',
    parseData,
    parseTotalItems,
    parseTotalPages,
  } = props;
  const [currentPage, setCurrentPage] = useState(page ?? 1);
  const [currentLimit, setCurrentLimit] = useState(limit ?? 25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [displayingData, setDisplayingData] = useState<T[]>([]);
  const [allItems, setAllItems] = useState<PaginatedObj<T>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passedData, setPassedData] = useState<T[]>(data ?? []);
  const [error, setError] = useState<any>(null);

  const hasNext = useMemo(() => currentPage * currentLimit < totalItems, [currentLimit, currentPage, totalItems]);
  const hasPrev = useMemo(() => currentPage > 1, [currentPage]);
  const isFirst = useMemo(() => currentPage === 1, [currentPage]);
  const isLast = useMemo(() => currentPage * currentLimit >= totalItems, [currentLimit, currentPage, totalItems]);

  const next = () => {
    if (hasNext) {
      setCurrentPage((prev) => prev + 1);
      fetch(currentPage + 1);
    }
  };

  const prev = () => {
    if (hasPrev) {
      setCurrentPage((prev) => prev - 1);
      fetch(currentPage - 1);
    }
  };

  const first = () => {
    if (!isFirst) {
      setCurrentPage(1);
    }
  };

  const last = () => {
    if (!isLast && limit) {
      setCurrentPage(Math.ceil(totalItems / limit));
    }
  };

  const setPage = (page: number): boolean => {
    if (page < 1 || (limit && page > Math.ceil(totalItems / limit)))
      return false;

    setCurrentPage(page);
    fetch(page);

    return true;
  };

  const setLimit = (limit: number) => {
    if (limit < 1) return;
    setCurrentLimit(limit);
  };

  const countItems = () => {
    let count = 0;

    Object.keys(allItems).forEach((key) => {
      count += allItems[key].length;
    });

    return count;
  };

  const getPageItems = (page: number, items?: PaginatedObj<T>) => {
    const data = items ? items : allItems

    if (!isPageExists(page, allItems)) {
      return null;
    }

    return data[page - 1];
  };

  const isPageExists = (page: number, data?: PaginatedObj<T>) => {
    if (!data) return allItems[page]?.length !== 0 || !!allItems[page];

    return data[page]?.length !== 0 || !!data[page];
  };

  const setPageItems = (page: number, data: T[]) => {
    setAllItems((prev) => {
      const newData = { ...prev };
      newData[page] = data;

      return newData;
    });
  };

  const fetch = (
    page: number,
    limit?: number,
    params?: { initial?: boolean; noCheckExisting?: boolean }
  ) => {
    const loadedPage = getPageItems(page);

    if (loadedPage && !params?.noCheckExisting) {
      setDisplayingData(loadedPage);
      setIsLoading(false);
      return;
    }

    if (!isPaginationWithUrl(props)) {
      return null;
    }

    if (url) {
      setIsLoading(true);

      Api({
        url: url,
        method: "GET",
        params: {
          [pageName]: page,
          [limitName]: limit || currentLimit,
        },
      })
        .then((data) => {
          let res = data;
          setIsLoading(false);

          if (parseData) {
            res = parseData(data);
          }

          if (!Array.isArray(res)) {
            res = [];
            new Error("Data must be an array");
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

          if (params?.initial) {
            setPageItems(1, res);
            setDisplayingData(res);

            return;
          }

          setDisplayingData(res);
          setPageItems(page, res);
        })
        .catch((err) => {
          setIsLoading(false);
          setError(err);
        });
    }
  };

  const initData = useCallback(() => {
    if (passedData) {

      const res = paginateArray<T>(passedData, currentLimit);
      setAllItems(res)

      const pageItems = getPageItems(currentPage, allItems);

      setTotalItems(passedData.length);

      const pages = parseInt(Object.keys(allItems)[Object.keys(allItems).length - 1], 10);

      if (!Number.isNaN(pages)) { setTotalPages(pages + 1); }
      if (pageItems) { setDisplayingData(pageItems); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passedData]);

  useEffect(() => {
    fetch(currentPage, undefined, { initial: true });
  }, []);

  useEffect(() => {
    initData();
  }, [initData, passedData]);


  const updateDataDependency = useMemo(() => {
    return arraysEqual(passedData, data ?? []);
  }, [passedData, data])

  useEffect(() => {
    if (data) {
      setPassedData(data);
    }
  }, [updateDataDependency]);

  useIsMount(() => {
    setAllItems({});
    setDisplayingData([]);

    if (data) {
      initData();
      return;
    }

    const page = Math.ceil(totalItems / currentLimit);

    if (currentPage > page) {
      setCurrentPage(page);
    }

    fetch(page, currentLimit, { noCheckExisting: true });
  }, [currentLimit]);

  const instance: PaginationInstance<T> = {
    data: displayingData,
    currentPage,
    hasNext,
    hasPrev,
    isFirst,
    isLast,
    pagesCount: totalPages,
    total: totalItems,
    fetchedCount: countItems(),
    loading: isLoading,
    error,
    limit: currentLimit,
    next,
    prev,
    first,
    last,
    setPage,
    setLimit,
  };

  return instance;
};

export default useDataPaginate;
