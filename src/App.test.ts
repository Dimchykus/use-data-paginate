"use client";
import { renderHook, waitFor } from "@testing-library/react";
import useDataPaginate, { PaginationInstance } from "./useDataPaginate";
import { act } from "@testing-library/react-hooks";
import axios from "axios";
import { useState } from "react";

jest.mock("axios");

const dataMock = [
  {
    name: "Item 1",
    description: "Description 1",
    price: 100,
  },
  {
    name: "Item 2",
    description: "Description 2",
    price: 200,
  },
  {
    name: "Item 3",
    description: "Description 3",
    price: 300,
  },
  {
    name: "Item 4",
    description: "Description 4",
    price: 400,
  },
  {
    name: "Item 5",
    description: "Description 5",
    price: 500,
  },
  {
    name: "Item 6",
    description: "Description 6",
    price: 600,
  },
  {
    name: "Item 7",
    description: "Description 7",
    price: 700,
  },
  {
    name: "Item 8",
    description: "Description 8",
    price: 800,
  },
  {
    name: "Item 9",
    description: "Description 9",
    price: 900,
  },
  {
    name: "Item 10",
    description: "Description 10",
    price: 1000,
  },
];

describe("pagination hook - predefined data", () => {
  test("switch page", () => {
    const items = dataMock;

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        data: items,
        page: 1,
        limit: 2,
      })
    );

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.data).toEqual([
      {
        name: "Item 3",
        description: "Description 3",
        price: 300,
      },
      {
        name: "Item 4",
        description: "Description 4",
        price: 400,
      },
    ]);
  });

  test("check data after page switch", async () => {
    const items = dataMock;

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        data: items,
        page: 1,
        limit: 2,
      })
    );

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.data).toEqual([
      {
        name: "Item 3",
        description: "Description 3",
        price: 300,
      },
      {
        name: "Item 4",
        description: "Description 4",
        price: 400,
      },
    ]);
  });

  test("prev page", async () => {
    const items = dataMock;

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        data: items,
        page: 1,
        limit: 2,
      })
    );

    act(() => {
      result.current.setPage(2);
    });

    act(() => {
      result.current.prev();
    });

    expect(result.current.currentPage).toBe(1);
  });

  test("next page", async () => {
    const items = dataMock;

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        data: items,
        page: 1,
        limit: 2,
      })
    );

    act(() => {
      result.current.next();
    });
    act(() => {
      result.current.next();
    });
    act(() => {
      result.current.next();
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(4);
    });
  });

  test("switch page with dynamic data", () => {
    const { result, rerender } = renderHook(
      ({ data, page, limit }) =>
        useDataPaginate({
          data,
          page,
          limit,
        }),
      {
        initialProps: {
          data: dataMock,
          page: 1,
          limit: 2,
        },
      }
    );

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.data).toEqual([
      {
        name: "Item 3",
        description: "Description 3",
        price: 300,
      },
      {
        name: "Item 4",
        description: "Description 4",
        price: 400,
      },
    ]);

    // Update the mocked data
    const updatedDataMock = [
      {
        name: "Updated Item 1",
        description: "Updated Description 1",
        price: 110,
      },
      // ... (update other items as needed)
    ];

    rerender({
      data: updatedDataMock,
      page: 1,
      limit: 2,
    });

    // Assert that the page remains the same after updating data
    expect(result.current.currentPage).toBe(1);

    // Assert that the data reflects the updated data
    expect(result.current.data).toEqual([
      {
        name: "Updated Item 1",
        description: "Updated Description 1",
        price: 110,
      },
    ]);
  });

  test("first page", async () => {
    const items = dataMock;

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        data: items,
        page: 3,
        limit: 2,
      })
    );

    act(() => {
      result.current.first();
    });

    expect(result.current.data).toEqual([
      {
        name: "Item 1",
        description: "Description 1",
        price: 100,
      },
      {
        name: "Item 2",
        description: "Description 2",
        price: 200,
      },
    ]);
  });

  test("last page", async () => {
    const items = dataMock;

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        data: items,
        page: 2,
        limit: 2,
      })
    );

    act(() => {
      result.current.last();
    });

    expect(result.current.currentPage).toBe(5);

    expect(result.current.data).toEqual([
      {
        name: "Item 9",
        description: "Description 9",
        price: 900,
      },
      {
        name: "Item 10",
        description: "Description 10",
        price: 1000,
      },
    ]);
  });

  test("pages count", async () => {
    const items = dataMock;

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        data: items,
        page: 2,
        limit: 2,
      })
    );

    act(() => {
      result.current.last();
    });

    expect(result.current.pagesCount).toBe(5);
    expect(result.current.total).toBe(10);
  });

  test("has next-prev", async () => {
    const items = dataMock;

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        data: items,
        page: 1,
        limit: 2,
      })
    );

    expect(result.current.hasNext).toBe(true);
    expect(result.current.hasPrev).toBe(false);

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.hasNext).toBe(true);
    expect(result.current.hasPrev).toBe(true);

    act(() => {
      result.current.last();
    });

    expect(result.current.hasNext).toBe(false);
    expect(result.current.hasPrev).toBe(true);
    expect(result.current.total).toBe(10);
  });

  test("is first-last", async () => {
    const items = dataMock;

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        data: items,
        page: 1,
        limit: 2,
      })
    );

    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.isFirst).toBe(false);
    expect(result.current.isLast).toBe(false);

    act(() => {
      result.current.last();
    });

    expect(result.current.isFirst).toBe(false);
    expect(result.current.isLast).toBe(true);
  });

  test("set not existing page", async () => {
    const items = dataMock;

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        data: items,
        page: 1,
        limit: 2,
      })
    );

    act(() => {
      result.current.setPage(99);
    });

    expect(result.current.currentPage).toBe(99);

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.setPage(-2);
    });

    expect(result.current.currentPage).toBe(2);
  });
});

describe("fetch data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("get first page", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          name: "Item 1",
          description: "Description 1",
          price: 100,
        },
        {
          name: "Item 2",
          description: "Description 2",
          price: 200,
        },
      ],
    });

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        page: 1,
        limit: 2,
        url: "http://localhost:3000/api/items",
      })
    );

    await waitFor(() => {
      expect(axios.get).toBeCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          name: "Item 1",
          description: "Description 1",
          price: 100,
        },
        {
          name: "Item 2",
          description: "Description 2",
          price: 200,
        },
      ]);
    });
  });

  test("update limit", async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            name: "Item 1",
            description: "Description 1",
            price: 100,
          },
          {
            name: "Item 2",
            description: "Description 2",
            price: 200,
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            name: "Item 5",
            description: "Description 5",
            price: 500,
          },
          {
            name: "Item 6",
            description: "Description 6",
            price: 600,
          },
        ],
      })
      .mockResolvedValueOnce({
        data: [
          {
            name: "Item 9",
            description: "Description 9",
            price: 900,
          },
          {
            name: "Item 10",
            description: "Description 10",
            price: 1000,
          },
        ],
      });

    const { result: stateResult } = renderHook(() => useState(2));

    const { result, rerender } = renderHook<PaginationInstance<any>, any>(
      ({ page, limit, url }) =>
        useDataPaginate({
          page,
          limit,
          url,
        }),
      {
        initialProps: {
          page: 1,
          limit: stateResult.current[0],
          url: "http://localhost:3000/api/items",
        },
      }
    );

    await waitFor(() => {
      expect(axios.get).toBeCalledTimes(1);
    });

    await waitFor(() => {
      expect(stateResult.current[0]).toBe(2);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          name: "Item 1",
          description: "Description 1",
          price: 100,
        },
        {
          name: "Item 2",
          description: "Description 2",
          price: 200,
        },
      ]);
    });

    act(() => {
      result.current.setPage(3);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          name: "Item 5",
          description: "Description 5",
          price: 500,
        },
        {
          name: "Item 6",
          description: "Description 6",
          price: 600,
        },
      ]);
    });

    act(() => {
      stateResult.current[1](4);
    });

    rerender({
      page: 3,
      limit: stateResult.current[0],
      url: "http://localhost:3000/api/items",
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          name: "Item 9",
          description: "Description 9",
          price: 900,
        },
        {
          name: "Item 10",
          description: "Description 10",
          price: 1000,
        },
      ]);
    });
  });

  test("get second page", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: [
        {
          name: "Item 3",
          description: "Description 3",
          price: 300,
        },
        {
          name: "Item 4",
          description: "Description 4",
          price: 400,
        },
      ],
    });

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        page: 2,
        limit: 2,
        url: "http://localhost:3000/api/items",
      })
    );

    await waitFor(() => {
      expect(axios.get).toBeCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.currentPage).toBe(2);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          name: "Item 3",
          description: "Description 3",
          price: 300,
        },
        {
          name: "Item 4",
          description: "Description 4",
          price: 400,
        },
      ]);
    });

    await waitFor(() => {
      expect(result.current.total).toBe(2);
    });
  });

  test("not array returned", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: {
        name: "Item 3",
        description: "Description 3",
        price: 300,
      },
    });

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        page: 1,
        limit: 2,
        url: "http://localhost:3000/api/items",
      })
    );

    await waitFor(() => {
      expect(axios.get).toBeCalledTimes(1);
    });
    await waitFor(() => {
      expect(result.current.error).toBe("Data must be an array");
    });
    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });

  test("parse data and total items", async () => {
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          array: [
            {
              name: "Item 1",
              description: "Description 1",
              price: 100,
            },
            {
              name: "Item 2",
              description: "Description 2",
              price: 200,
            },
            {
              name: "Item 3",
              description: "Description 3",
              price: 300,
            },
          ],
          pagination: {
            totalItems: 10,
            totalPages: 5,
            limit: 2,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          array: [
            {
              name: "Item 7",
              description: "Description 7",
              price: 700,
            },
            {
              name: "Item 8",
              description: "Description 8",
              price: 800,
            },
            {
              name: "Item 9",
              description: "Description 9",
              price: 900,
            },
          ],
          pagination: {
            totalItems: 10,
            totalPages: 5,
            limit: 2,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          array: [
            {
              name: "Item 10",
              description: "Description 10",
              price: 1000,
            },
          ],
          pagination: {
            totalItems: 10,
            totalPages: 5,
            limit: 2,
          },
        },
      });

    const { result } = renderHook<PaginationInstance<any>, any>(() =>
      useDataPaginate({
        url: "http://localhost:4000/data/",
        page: 1,
        limit: 3,
        limitName: "per_page",
        pageName: "page",
        parseData: (data: any) => data.array,
        parseTotalItems: (data: any) => data.pagination.totalItems,
        parseTotalPages: (data: any) => data.pagination.totalPages,
      })
    );

    await waitFor(() => {
      expect(axios.get).toBeCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          name: "Item 1",
          description: "Description 1",
          price: 100,
        },
        {
          name: "Item 2",
          description: "Description 2",
          price: 200,
        },
        {
          name: "Item 3",
          description: "Description 3",
          price: 300,
        },
      ]);
    });

    act(() => {
      result.current.setPage(3);
    });

    await waitFor(() => {
      expect(axios.get).toBeCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          name: "Item 7",
          description: "Description 7",
          price: 700,
        },
        {
          name: "Item 8",
          description: "Description 8",
          price: 800,
        },
        {
          name: "Item 9",
          description: "Description 9",
          price: 900,
        },
      ]);
    });

    await act(() => {
      result.current.last();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          name: "Item 10",
          description: "Description 10",
          price: 1000,
        },
      ]);
    });

    await waitFor(() => {
      expect(axios.get).toBeCalledTimes(3);
    });

    await waitFor(() => {
      expect(result.current.total).toBe(10);
    });

    await waitFor(() => {
      expect(result.current.limit).toBe(3);
    });
  });
});

describe("custom fetch data - with redux", () => {
  test("change page", async () => {
    const { result: stateResult } = renderHook(() =>
      useState([
        {
          name: "Item 1",
          description: "Description 1",
          price: 100,
        },
        {
          name: "Item 2",
          description: "Description 2",
          price: 200,
        },
        {
          name: "Item 3",
          description: "Description 3",
          price: 300,
        },
      ])
    );

    const { result, rerender } = renderHook<PaginationInstance<any>, any>(
      ({ page, limit, data, onPageChange }) =>
        useDataPaginate({
          page,
          limit,
          data,
          onPageChange,
        }),
      {
        initialProps: {
          page: 1,
          limit: 3,
          data: stateResult.current[0],
          onPageChange: (page: number) => {
            if (page === 2) {
              act(() => {
                stateResult.current[1]([
                  {
                    name: "Item 1",
                    description: "Description 1",
                    price: 100,
                  },
                  {
                    name: "Item 2",
                    description: "Description 2",
                    price: 200,
                  },
                  {
                    name: "Item 3",
                    description: "Description 3",
                    price: 300,
                  },
                  {
                    name: "Item 4",
                    description: "Description 4",
                    price: 400,
                  },
                  {
                    name: "Item 5",
                    description: "Description 5",
                    price: 500,
                  },
                  {
                    name: "Item 6",
                    description: "Description 6",
                    price: 600,
                  },
                ]);
              });

              return;
            }
          },
        },
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          name: "Item 1",
          description: "Description 1",
          price: 100,
        },
        {
          name: "Item 2",
          description: "Description 2",
          price: 200,
        },
        {
          name: "Item 3",
          description: "Description 3",
          price: 300,
        },
      ]);
    });

    act(() => {
      result.current.setPage(2);
    });

    rerender({
      page: 2,
      limit: 4,
      data: stateResult.current[0],
      onPageChange: (page: number) => {
        if (page === 2) {
          act(() => {
            stateResult.current[1]([
              {
                name: "Item 1",
                description: "Description 1",
                price: 100,
              },
              {
                name: "Item 2",
                description: "Description 2",
                price: 200,
              },
              {
                name: "Item 3",
                description: "Description 3",
                price: 300,
              },
              {
                name: "Item 4",
                description: "Description 4",
                price: 400,
              },
              {
                name: "Item 5",
                description: "Description 5",
                price: 500,
              },
              {
                name: "Item 6",
                description: "Description 6",
                price: 600,
              },
            ]);
          });

          return;
        }
      },
    });

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(stateResult.current[0]).toEqual([
        {
          name: "Item 1",
          description: "Description 1",
          price: 100,
        },
        {
          name: "Item 2",
          description: "Description 2",
          price: 200,
        },
        {
          name: "Item 3",
          description: "Description 3",
          price: 300,
        },
        {
          name: "Item 4",
          description: "Description 4",
          price: 400,
        },
        {
          name: "Item 5",
          description: "Description 5",
          price: 500,
        },
        {
          name: "Item 6",
          description: "Description 6",
          price: 600,
        },
      ]);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          name: "Item 5",
          description: "Description 5",
          price: 500,
        },
        {
          name: "Item 6",
          description: "Description 6",
          price: 600,
        },
      ]);
    });

    await waitFor(() => {
      expect(result.current.limit).toBe(4);
    });
    await waitFor(() => {
      expect(result.current.total).toBe(6);
    });
  });
});
