"use client";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import React, { useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const Header = () => {
  // State để quản lý menu dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Xử lý khi click vào IconButton
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Xử lý khi đóng menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1, height: 70 }}>
      <AppBar position="fixed" color="default" elevation={0}>
        <Toolbar
          variant="dense"
          sx={{ minHeight: 70, justifyContent: "space-between" }}
        >
          {/* Left side - Logo and search */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h6"
              color="primary"
              fontWeight="bold"
              sx={{ mr: 4 }}
            >
              FinTrip
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "grey.100",
                borderRadius: 2,
                px: 2,
                py: 0.5,
              }}
            >
              <SearchIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <input
                placeholder="Search..."
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "14px",
                  width: "200px",
                }}
              />
            </Box>
          </Box>

          {/* Right side - Notifications, Language, User */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Badge badgeContent={2} color="error" sx={{ mr: 2 }}>
              <NotificationsIcon color="action" />
            </Badge>
            <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
              <Box
                component="img"
                src="https://flagcdn.com/w20/gb.png"
                alt="English"
                sx={{ mr: 1, width: 20, height: 15 }}
              />
              <Typography variant="body2" sx={{ mr: 0.5 }}>
                English
              </Typography>
              <KeyboardArrowDownIcon fontSize="small" />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src="https://randomuser.me/api/portraits/women/44.jpg"
                sx={{ width: 32, height: 32 }}
              />
              <Box sx={{ ml: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  Thoi Dai
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Admin
                </Typography>
              </Box>
              <IconButton
                onClick={handleClick}
                id="user-menu-button"
                aria-controls={open ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                sx={{ ml: 0.5 }}
              >
                <KeyboardArrowDownIcon fontSize="small" />
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "user-menu-button",
                }}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
