'use client';

import { useEffect, useState } from "react";
import useDataPagination from 'use-data-paginate';
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
  } = useDataPagination<ItemProps, ItemProps[]>({
    data: array,
    // url: "https://api.punkapi.com/v2/beers",
    // pageName: "page",
    // limitName: "per_page",
    page: 2,
    limit: 3,
    // parseData: (data) => data,
    // parseTotalItems: (data: ItemProps[]) => data.length,
    // parseTotalPages: (data: ItemProps[]) => data.length,
  });

  useEffect(() => {
    console.log(data);
  }, [data])

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

