## 📦 Installation

- **Using `npm`**
  ```shell
  npm i use-data-paginate
  ```
- **Using `Yarn`**
  ```shell
  yarn add use-data-paginate
  ```

## Why use this lib

1. **Efficient Pagination**: The library provides convenient functions for handling pagination, making it easier to retrieve and display large datasets in a paginated manner. This improves the user experience by reducing load times and optimizing resource usage.
2. **Modular Utilities**: The library offers a collection of modular utility functions that can save you time and effort. These utilities are designed to handle common tasks, such as parsing data or calculating page counts, so you don't have to reinvent the wheel.
3. **Flexibility**: The library is designed to be flexible and adaptable to different data structures and use cases. You can customize and extend the provided utilities to fit the specific requirements of your project.

## ⚙️ Usage

### Defined data

```typescript
import { useState } from "react";
import usePagination from "./hook";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination as MuiPagination,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

interface ItemProps {
  id: number;
  prop: number;
}

const generateArray = (size: number = 10) => {
  const array = new Array(size).fill(null).map((_, index) => ({
    id: Math.random(),
    prop: index + 1,
  }));

  return array;
};

function App() {
  const [array, setArray] = useState<ItemProps[]>(generateArray(50));

  const {
    currentPage,
    hasNext,
    hasPrev,
    isFirst,
    isLast,
    pagesCount,
    loading,
    limit,
    error,
    next,
    prev,
    first,
    last,
    setPage,
    setLimit,
    data,
  } = usePagination<ItemProps, ItemProps[]>({
    data: array,
    page: 2,
    limit: 3,
  });

  return (
    <div className="App">
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="right">Name</TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <Box>
              <CircularProgress />
            </Box>
          ) : (
            <TableBody>
              {data.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="right">{row.prop}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "16px",
          marginBottom: "48px",
          gap: "16px;",
        }}
      >
        <Button onClick={prev} disabled={!hasPrev} variant="contained">
          Prev
        </Button>
        <MuiPagination
          page={currentPage}
          count={pagesCount}
          showFirstButton
          showLastButton
          onChange={(_, page) => setPage(page)}
        />
        <Button onClick={next} disabled={!hasNext} variant="contained">
          Next
        </Button>
        <FormControl>
          <InputLabel id="demo-simple-select-label">Age</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={limit.toString()}
            label="Limit"
            onChange={(event: SelectChangeEvent) => {
              setLimit(parseInt(event.target.value, 10));
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={35}>35</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </div>
  );
}

export default App;
```

### Fetch data

```typescript
import { useState } from "react";
import usePagination from "./hook";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination as MuiPagination,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

interface ItemProps {
  id: number;
  prop: number;
}

interface ResponseProps {
  data: ItemProps[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    count: number;
    totalPages: number;
  };
}

const generateArray = (size: number = 10) => {
  const array = new Array(size).fill(null).map((_, index) => ({
    id: Math.random(),
    prop: index + 1,
  }));

  return array;
};

function App() {
  const [array, setArray] = useState<ItemProps[]>(generateArray(50));

  const {
    currentPage,
    hasNext,
    hasPrev,
    isFirst,
    isLast,
    pagesCount,
    loading,
    limit,
    error,
    next,
    prev,
    first,
    last,
    setPage,
    setLimit,
    data,
  } = usePagination<ItemProps, ItemProps[]>({
    url: "https://api.punkapi.com/v2/beers",
    pageName: "page",
    limitName: "per_page",
    page: 2,
    limit: 3,
    parseData: (data) => data,
    parseTotalItems: (data: ItemProps[]) => data.length,
    parseTotalPages: (data: ItemProps[]) => data.length,
  });

  return (
    <div className="App">
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="right">Name</TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <Box>
              <CircularProgress />
            </Box>
          ) : (
            <TableBody>
              {data.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="right">{row.prop}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "16px",
          marginBottom: "48px",
          gap: "16px;",
        }}
      >
        <Button onClick={prev} disabled={!hasPrev} variant="contained">
          Prev
        </Button>
        <MuiPagination
          page={currentPage}
          count={pagesCount}
          showFirstButton
          showLastButton
          onChange={(_, page) => setPage(page)}
        />
        <Button onClick={next} disabled={!hasNext} variant="contained">
          Next
        </Button>
        <FormControl>
          <InputLabel id="demo-simple-select-label">Age</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={limit.toString()}
            label="Limit"
            onChange={(event: SelectChangeEvent) => {
              setLimit(parseInt(event.target.value, 10));
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={35}>35</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </div>
  );
}

export default App;
```

## Props

| Key             | Default value | Data type | Remarks                                                                                                                                       |
| --------------- | ------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| url             | undefined     | String    | url to fetch pages. To this url _page_ and _limit_ will be appended as query parameters                                                       |
| pageName        | undefined     | String    | Name of the query parameter used to indicate the page number.                                                                                 |
| limitName       | undefined     | String    | Name of the query parameter used to specify the limit (number of items per page) for pagination.                                              |
| page            | 1             | Integer   | Indicates the page number for pagination.                                                                                                     |
| limit           | 25            | Integer   | Specifies the maximum number of items to retrieve per page in a paginated dataset.                                                            |
| parseTotalItems | undefined     | Function  | parseTotalItems is a function used to parse the total number of items from a data structure and returns it as a number. (Optional)            |
| parseTotalPages | undefined     | Function  | parseTotalPages is a function used to calculate the total number of pages based on the total count of items and a given page size. (Optional) |
| parseData       | undefined     | Function  | parseData is a function used to parse an object that contain data                                                                             |
| data            | undefined     | Array     | An array representing the larger dataset to be parsed.                                                                                        |
