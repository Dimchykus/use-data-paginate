"use client"

import { renderHook } from '@testing-library/react-hooks'
import useDataPaginate from './useDataPaginate';

const generateArray = (size: number) => {
  const array = new Array(size).fill(null).map((_, index) => ({
    id: Math.random(),
    prop: index + 1,
  }));

  return array;
};

interface ItemProps {
  id: number;
  prop: number;
}

test('return data length', () => {
  const view = renderHook(() => useDataPaginate<ItemProps, ItemProps[]>({
    data: generateArray(10),
    page: 2,
    limit: 3,
  }));
  const { data } = view.result.current;
  expect(data.length).toBe(3);
});

test('return data', async () => {
  const view = renderHook(() => useDataPaginate<ItemProps, ItemProps[]>({
    data: generateArray(20),
    page: 1,
    limit: 10,
  }));
  const { currentPage,
    hasNext,
    hasPrev,
    isFirst,
    isLast,
    pagesCount,
    total,
    fetchedCount,
    loading,
    error,
    limit,
  } = view.result.current;

  expect(currentPage).toBe(1);
  expect(hasNext).toBe(true);
  expect(isFirst).toBe(true);
  expect(hasPrev).toBe(false);
  expect(isLast).toBe(false);
  expect(pagesCount).toBe(2);
  expect(total).toBe(20);
  expect(fetchedCount).toBe(20);
  expect(error).toBe(null);
  expect(loading).toBe(false);
  expect(limit).toBe(10);
});