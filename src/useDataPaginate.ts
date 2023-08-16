"use client"

import { DependencyList, EffectCallback, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Api from "./axios";

const isPaginationWithUrl = (obj: any): obj is PaginationPropsWithUrl<any, any> => obj.hasOwnProperty("url");

const paginateArray = <T,>(array: any, itemsPerPage: number) => {
  const totalPages = Math.ceil(array.length / itemsPerPage);
  const paginatedObject: PaginatedObj<T> = {};

  for (let page = 0; page < totalPages; page++) {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedObject[page] = array.slice(startIndex, endIndex);
  }

  return paginatedObject;
};


const useIsMount = (callback: EffectCallback, dependencies: DependencyList) => {
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return isFirstRenderRef.current;
};


const objectsEqual = <T extends Record<string, any>>(o1: T, o2: T) =>
  Object.keys(o1).length === Object.keys(o2).length &&
  Object.keys(o1).every((p: keyof T) => o1[p] === o2[p]);

const arraysEqual = <T extends Record<string, any>>(array1: T[], array2: T[]) =>
  array1.length === array2.length && array1.every((item: T, id: number) => objectsEqual(item, array2[id] ?? {}));

interface PaginatedObj<T> {
  [key: string]: T[];
}

interface PaginationProps<R> {
  page: number;
  limit?: number;
  parseTotalItems?: (data: R) => number;
  parseTotalPages?: (data: R) => number;
}

interface PaginationPropsWithUrl<T, R> extends PaginationProps<R> {
  url: string;
  pageName?: string;
  limitName?: string;
  parseData?: (data: R) => T[];
  data?: never;
}

interface PaginationPropsWithPredefinedData<T, R>
  extends PaginationProps<R> {
  data: T[];
  url?: never;
  pageName?: never;
  limitName?: never;
  parseData?: never;
}

type IPagination<T, R> =
  | PaginationPropsWithUrl<T, R>
  | PaginationPropsWithPredefinedData<T, R>;

interface PaginationInstance<T> {
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
      count += (allItems[key] ?? []).length ?? 0;
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
        .then((data: any) => {
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
        .catch((err: any) => {
          setIsLoading(false);
          setError(err);
        });
    }

    return null;
  };

  const initData = useCallback(() => {
    if (passedData) {

      const res = paginateArray<T>(passedData, currentLimit);
      setAllItems(res)

      const pageItems = getPageItems(currentPage, allItems);

      setTotalItems(passedData.length);

      const pages = parseInt(Object.keys(allItems)[Object.keys(allItems).length - 1] ?? '', 10);

      if (!Number.isNaN(pages)) { setTotalPages(pages + 1); }
      if (pageItems) { setDisplayingData(pageItems); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passedData]);

  useEffect(() => {
    fetch(currentPage, undefined, { initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
