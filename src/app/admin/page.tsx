"use client";

import PricingIcon from "@mui/icons-material/AttachMoney";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import ProductsIcon from "@mui/icons-material/Inventory";
import PersonIcon from "@mui/icons-material/Person";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid2 as Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Checkbox,
} from "@mui/material";
import { ThemeProvider } from "../theme/theme";
import React, { useState } from "react";
import Header from "../../components/Header";

const Dashboard = () => {
  // Data for the stats cards
  const statsData = [
    {
      title: "Total User",
      value: "40,689",
      change: "8.5% Up from yesterday",
      trend: "up",
      icon: <PersonIcon sx={{ color: "#9747FF" }} />,
      iconBg: "#F3E8FF",
    },
    {
      title: "Total Order",
      value: "10293",
      change: "1.3% Up from past week",
      trend: "up",
      icon: (
        <Box
          component="span"
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFB800",
          }}
        >
          {" "}
          📦{" "}
        </Box>
      ),
      iconBg: "#FFF8E6",
    },
    {
      title: "Total Sales",
      value: "$89,000",
      change: "4.3% Down from yesterday",
      trend: "down",
      icon: (
        <Box
          component="span"
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#00C48C",
          }}
        >
          {" "}
          📈{" "}
        </Box>
      ),
      iconBg: "#E6F9F1",
    },
    {
      title: "Total Pending",
      value: "2040",
      change: "1.8% Up from yesterday",
      trend: "up",
      icon: (
        <Box
          component="span"
          sx={{
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FF6B6B",
          }}
        >
          {" "}
          ⏱{" "}
        </Box>
      ),
      iconBg: "#FFEEEE",
    },
  ];

  // Data for the table
  const rows = [
    {
      id: 1,
      name: "Jon Snow",
      email: "jon.snow@example.com",
      gender: "Male",
      phone: "123-456-7890",
    },
    {
      id: 2,
      name: "Cersei Lannister",
      email: "cersei.lannister@example.com",
      gender: "Female",
      phone: "123-456-7891",
    },
    {
      id: 3,
      name: "Jaime Lannister",
      email: "jaime.lannister@example.com",
      gender: "Male",
      phone: "123-456-7892",
    },
    {
      id: 4,
      name: "Arya Stark",
      email: "arya.stark@example.com",
      gender: "Female",
      phone: "123-456-7893",
    },
    {
      id: 5,
      name: "Daenerys Targaryen",
      email: "daenerys.targaryen@example.com",
      gender: "Female",
      phone: "123-456-7894",
    },
    {
      id: 6,
      name: "Melisandre",
      email: "melisandre@example.com",
      gender: "Female",
      phone: "123-456-7895",
    },
    {
      id: 7,
      name: "Ferrara Clifford",
      email: "ferrara.clifford@example.com",
      gender: "Male",
      phone: "123-456-7896",
    },
    {
      id: 8,
      name: "Rossini Frances",
      email: "rossini.frances@example.com",
      gender: "Female",
      phone: "123-456-7897",
    },
    {
      id: 9,
      name: "Harvey Roxie",
      email: "harvey.roxie@example.com",
      gender: "Female",
      phone: "123-456-7898",
    },
  ];

  // Table pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle page change
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle selected rows
  const [selected, setSelected] = useState<number[]>([]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Navigation items data
  const navItems = [{ text: "User", icon: <ProductsIcon /> }];

  const pagesItems = [
    { text: "Hotel", icon: <PricingIcon /> },
    { text: "Motel", icon: <CalendarIcon /> },
  ];

  return (
    <ThemeProvider>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Header />
        <Box sx={{ display: "flex", flexGrow: 1, mt: 9 }}>
          {/* Sidebar */}
          <Box
            component="nav"
            sx={{
              width: 175,
              flexShrink: 0,
              bgcolor: "background.paper",
              borderRight: 1,
              borderColor: "divider",
              py: 2,
            }}
          >
            <List component="nav" disablePadding>
              {navItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    sx={{
                      py: 1,
                      px: 2,
                      borderRadius: 0,
                      mb: 0.5,
                      "&:hover": {
                        bgcolor: "grey.100",
                      },
                    }}
                    onClick={() => {}}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: "grey.600" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      slotProps={{ primary: { fontSize: 14 } }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ px: 2, py: 1, display: "block" }}
            >
              PAGES
            </Typography>
            <List component="nav" disablePadding>
              {pagesItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    sx={{
                      py: 1,
                      px: 2,
                      color: "text.primary",
                      borderRadius: 0,
                      mb: 0.5,
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                    onClick={() => {}}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: "grey.600" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      slotProps={{ primary: { fontSize: 14 } }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Main content */}
          <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
            {/* Dashboard Title */}
            <Typography variant="h1" sx={{ mb: 3 }}>
              Dashboard
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {statsData.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    elevation={0}
                    sx={{ bgcolor: "background.paper", height: "100%" }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1" color="text.secondary">
                          {stat.title}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: stat.iconBg,
                          }}
                        >
                          {stat.icon}
                        </Box>
                      </Box>
                      <Typography variant="h2" sx={{ mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {stat.trend === "up" ? (
                          <TrendingUpIcon
                            fontSize="small"
                            sx={{ color: "success.main", mr: 0.5 }}
                          />
                        ) : (
                          <TrendingDownIcon
                            fontSize="small"
                            sx={{ color: "error.main", mr: 0.5 }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          color={
                            stat.trend === "up" ? "success.main" : "error.main"
                          }
                        >
                          {stat.change}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Data Table using standard MUI Table */}
            <Paper sx={{ width: "100%", mb: 4 }}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="user data table">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selected.length > 0 && selected.length < rows.length
                          }
                          checked={
                            rows.length > 0 && selected.length === rows.length
                          }
                          onChange={handleSelectAllClick}
                          slotProps={{
                            input: { "aria-label": "select all users" },
                          }}
                        />
                      </TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Phone</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row) => {
                        const isItemSelected = isSelected(row.id);
                        return (
                          <TableRow
                            hover
                            onClick={(event) => handleClick(event, row.id)}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.id}
                            selected={isItemSelected}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isItemSelected}
                                slotProps={{
                                  input: {
                                    "aria-labelledby": `enhanced-table-checkbox-${row.id}`,
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell component="th" scope="row">
                              {row.id}
                            </TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row.gender}</TableCell>
                            <TableCell>{row.phone}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
