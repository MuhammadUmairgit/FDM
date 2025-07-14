import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReceiptIcon from "@mui/icons-material/Receipt";

import { Link, useLocation, matchPath, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  styled,
  alpha,
  Avatar,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  BarChart as AnalyticsIcon,
  Palette as ThemeIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  Backup as BackupIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Constants
const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 72;
const DRAWER_HEADER_HEIGHT = 80;
const USER_PANEL_HEIGHT = 88;

// Styled Components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    position: "fixed",
    height: "100vh",
    overflowY: "auto",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    "&::-webkit-scrollbar": {
      width: "0.4em",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.primary.main,
      borderRadius: "20px",
    },
  },
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 2),
  height: DRAWER_HEADER_HEIGHT,
  minHeight: `${DRAWER_HEADER_HEIGHT}px !important`,
  position: "sticky",
  top: 0,
  zIndex: 1,
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.text.primary,
  width: "100%",
  display: "block",
}));

const NavItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1.5),
  padding: theme.spacing(1, 1.5),
  transition: theme.transitions.create(["background-color", "transform"], {
    duration: theme.transitions.duration.shortest,
  }),
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
  },
  "&.Mui-selected:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "translateX(4px)",
  },
}));

const SubNavItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.25, 0, 0.25, 4),
  padding: theme.spacing(1, 1.5, 1, 3),
  transition: theme.transitions.create(["background-color", "transform"], {
    duration: theme.transitions.duration.shortest,
  }),
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
  },
  "&.Mui-selected:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "translateX(4px)",
  },
}));

const UserPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  height: USER_PANEL_HEIGHT,
  position: "sticky",
  bottom: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
}));

// Navigation items
const navItems = [
  { text: "Home", icon: <HomeIcon />, path: "/" },
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  // { text: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
  { text: "Orders", icon: <OrdersIcon />, path: "/orders" },
  { text: "Khata Book", icon: <ReceiptIcon />, path: "/khata" },
  // { text: "Khata Book", path: "/khata" },
  { text: "Customers", icon: <CustomersIcon />, path: "/customers" },
  { text: "Analytics", icon: <AnalyticsIcon />, path: "/analytics" },
  {
    text: "Settings",
    icon: <SettingsIcon />,
    path: "/settings",
    subItems: [
      { text: "Appearance", icon: <ThemeIcon />, path: "/settings/appearance" },
      {
        text: "Notifications",
        icon: <NotificationsIcon />,
        path: "/settings/notifications",
      },
      { text: "Language", icon: <LanguageIcon />, path: "/settings/language" },
      { text: "Security", icon: <SecurityIcon />, path: "/settings/security" },
      { text: "Account", icon: <AccountIcon />, path: "/settings/account" },
      { text: "Backup", icon: <BackupIcon />, path: "/settings/backup" },
      { text: "About", icon: <InfoIcon />, path: "/settings/about" },
    ],
  },
];

const secondaryItems = [
  { text: "Theme", icon: <ThemeIcon />, path: "/theme" },
  { text: "Logout", icon: <LogoutIcon />, path: "/auth" },
];

const AnimatedDrawer = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);
  const [userData, setUserData] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  // Fetch user data on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null);
      }
    });
    return unsubscribe;
  }, []);

  // Memoized active path check
  const isActive = useCallback(
    (path) => path && matchPath({ path, end: false }, location.pathname),
    [location.pathname]
  );

  // Auto-close drawer on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleDrawerToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const toggleSubMenu = useCallback((itemText) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemText]: !prev[itemText],
    }));
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [navigate]);

  // Calculate content height for scrollable area
  const contentHeight = useMemo(() => {
    return `calc(100vh - ${DRAWER_HEADER_HEIGHT + USER_PANEL_HEIGHT}px)`;
  }, []);

  // Modified secondary items with logout handler
  const modifiedSecondaryItems = useMemo(() => {
    return secondaryItems.map((item) => {
      if (item.text === "Logout") {
        return {
          ...item,
          onClick: handleLogout,
          path: null,
        };
      }
      return item;
    });
  }, [handleLogout]);

  // Render navigation items
  const renderNavItem = useCallback(
    (item) => {
      const hasSubItems = item.subItems && item.subItems.length > 0;
      const isExpanded = expandedItems[item.text] || false;
      const isSelected =
        isActive(item.path) ||
        (hasSubItems &&
          item.subItems.some((subItem) => isActive(subItem.path)));

      const handleClick = () => {
        if (hasSubItems) {
          toggleSubMenu(item.text);
        } else if (item.onClick) {
          item.onClick();
        }
      };

      return (
        <React.Fragment key={item.text}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <StyledLink to={hasSubItems || item.onClick ? "#" : item.path}>
              <NavItem selected={isSelected} onClick={handleClick}>
                <Tooltip title={!open ? item.text : ""} placement="right">
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 0,
                      justifyContent: "center",
                      color: isSelected
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </Tooltip>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                        }}
                      />
                      {hasSubItems &&
                        open &&
                        (isExpanded ? <ExpandLess /> : <ExpandMore />)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </NavItem>
            </StyledLink>
          </motion.div>

          {hasSubItems && (
            <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.subItems.map((subItem) => (
                  <motion.div
                    key={subItem.text}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <StyledLink to={subItem.path}>
                      <SubNavItem selected={isActive(subItem.path)}>
                        <Tooltip
                          title={!open ? subItem.text : ""}
                          placement="right"
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 2 : 0,
                              justifyContent: "center",
                              color: isActive(subItem.path)
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
                            }}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                        </Tooltip>
                        <AnimatePresence>
                          {open && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ListItemText
                                primary={subItem.text}
                                primaryTypographyProps={{
                                  fontWeight: isActive(subItem.path)
                                    ? 600
                                    : 500,
                                  fontSize: "0.875rem",
                                  color: isActive(subItem.path)
                                    ? theme.palette.primary.main
                                    : theme.palette.text.primary,
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </SubNavItem>
                    </StyledLink>
                  </motion.div>
                ))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    },
    [isActive, open, expandedItems, toggleSubMenu, theme]
  );

  // Get user initials for avatar
  const getUserInitials = useMemo(() => {
    if (!userData) return "U";
    const name = userData.displayName || userData.email;
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  }, [userData]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Mobile Drawer (Overlay) */}
      {isMobile && (
        <StyledDrawer
          variant="temporary"
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxShadow: theme.shadows[16],
            },
          }}
        >
          <DrawerHeader>
            <Box sx={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  color: theme.palette.primary.contrastText,
                }}
              >
                <HomeIcon />
              </Avatar>
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                InventoryPro
              </Typography>
            </Box>
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeftIcon />
            </IconButton>
          </DrawerHeader>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ height: contentHeight, overflowY: "auto" }}>
            <List sx={{ px: 1 }}>{navItems.map(renderNavItem)}</List>
            <Divider sx={{ my: 1 }} />
            <List sx={{ px: 1 }}>
              {modifiedSecondaryItems.map(renderNavItem)}
            </List>
          </Box>
          {userData && (
            <UserPanel>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                }}
              >
                {getUserInitials}
              </Avatar>
              {open && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {userData?.displayName || "User"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {userData?.email || "user@example.com"}
                  </Typography>
                </Box>
              )}
            </UserPanel>
          )}
        </StyledDrawer>
      )}

      {/* Desktop Drawer (Permanent) */}
      {!isMobile && (
        <StyledDrawer
          variant="permanent"
          sx={{
            width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
              overflowX: "hidden",
              boxShadow: theme.shadows[1],
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <DrawerHeader>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      color: theme.palette.primary.contrastText,
                    }}
                  >
                    <HomeIcon />
                  </Avatar>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                  >
                    InventoryPro
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>

            <Tooltip title={open ? "Collapse" : "Expand"}>
              <IconButton
                onClick={handleDrawerToggle}
                sx={{
                  backgroundColor: theme.palette.action.hover,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </Tooltip>
          </DrawerHeader>

          <Divider sx={{ my: 1 }} />

          <Box
            sx={{
              height: contentHeight,
              overflowY: open ? "auto" : "hidden",
              overflowX: "hidden",
            }}
          >
            <List sx={{ px: 1 }}>{navItems.map(renderNavItem)}</List>
            <Divider sx={{ my: 1 }} />
            <List sx={{ px: 1 }}>
              {modifiedSecondaryItems.map(renderNavItem)}
            </List>
          </Box>

          {userData && (
            <UserPanel>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                }}
              >
                {getUserInitials}
              </Avatar>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: theme.spacing(0.5),
                      width: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      noWrap
                      sx={{ maxWidth: "100%" }}
                    >
                      {userData?.displayName || "User"}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ maxWidth: "100%" }}
                    >
                      {userData?.email || "user@example.com"}
                    </Typography>
                  </motion.div>
                )}
              </AnimatePresence>
            </UserPanel>
          )}
        </StyledDrawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            xs: "100%",
            md: `calc(100% - ${open ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`,
          },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: theme.palette.background.default,
        }}
      >
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: theme.zIndex.drawer + 1,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Content */}
        {children}
      </Box>
    </Box>
  );
};

export default React.memo(AnimatedDrawer);
