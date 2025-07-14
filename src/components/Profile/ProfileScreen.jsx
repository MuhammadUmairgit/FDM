import { useState, useEffect, useMemo } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Modal,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  LinearProgress,
  Chip,
  Badge,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  CameraAlt,
  Logout,
  AdminPanelSettings,
  Person,
  VerifiedUser,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig";
import {
  doc,
  onSnapshot,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import MobileDrawer from "./MobileApp/MobileDrawer";
import MobileAppBar from "./MobileApp/MobileAppBar";
import MobileBottomNav from "./MobileApp/MobileBottomNav";
import { useAuth } from "../Auth/AuthContext";
import AdminTools from "./AdminTools/AdminTools";

const ADMIN_CREDENTIALS = {
  email: "admin@inventory.com",
  password: "Admin@123",
};

const StatsCard = ({ icon, title, value, color, onClick }) => {
  return (
    <Card
      sx={{
        p: 2,
        textAlign: "center",
        bgcolor: `${color}.main`,
        color: "white",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s",
        "&:hover": {
          transform: onClick ? "translateY(-4px)" : "none",
          boxShadow: onClick ? 3 : 1,
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        {icon}
      </Box>
      <Typography variant="h6">{value}</Typography>
      <Typography variant="body2">{title}</Typography>
    </Card>
  );
};

const CategoryModal = ({ open, onClose, categories, onCategorySelect }) => {
  const theme = useTheme();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 500,
          maxHeight: "80vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">All Categories</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {categories.map((category) => (
            <ListItem
              key={category}
              button
              onClick={() => onCategorySelect(category)}
              sx={{
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <CategoryIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={category} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Modal>
  );
};

const ItemsByCategoryModal = ({ open, onClose, category, items }) => {
  const theme = useTheme();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 800,
          maxHeight: "80vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Items in Category: {category}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        {items.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center" }}>
            No items found in this category
          </Typography>
        ) : (
          <List>
            {items.map((item) => (
              <ListItem key={item.id}>
                <ListItemAvatar>
                  <Avatar src={item.image}>
                    <InventoryIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Qty: {item.quantity} | ${item.price}
                      </Typography>
                      {item.quantity <= 0 && (
                        <Chip
                          label="Out of Stock"
                          size="small"
                          color="error"
                          sx={{ ml: 1 }}
                        />
                      )}
                      {item.quantity > 0 &&
                        item.quantity <= (item.safetyStock || 10) && (
                          <Chip
                            label="Low Stock"
                            size="small"
                            color="warning"
                            sx={{ ml: 1 }}
                          />
                        )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Modal>
  );
};

const UserProfile = ({ userData, isAdmin }) => {
  const theme = useTheme();
  const { currentUser, logout } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [showCategoryItemsModal, setShowCategoryItemsModal] = useState(false);

  useEffect(() => {
    const fetchInventoryData = async () => {
      if (!currentUser) return;

      setLoadingStats(true);
      try {
        // Fetch inventory items
        const inventoryQuery = query(
          collection(db, "inventory"),
          where("userId", "==", currentUser.uid)
        );
        const inventorySnapshot = await getDocs(inventoryQuery);

        let total = 0;
        let lowStock = 0;
        let outOfStock = 0;
        let totalValue = 0;
        const categorySet = new Set();
        const items = [];

        inventorySnapshot.forEach((doc) => {
          const item = doc.data();
          total++;
          totalValue +=
            (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);

          if (item.category) {
            categorySet.add(item.category);
          }

          items.push({
            id: doc.id,
            ...item,
          });

          if (item.quantity <= 0) {
            outOfStock++;
          } else if (item.quantity <= (item.safetyStock || 10)) {
            lowStock++;
          }
        });

        setInventoryStats({
          totalItems: total,
          lowStockItems: lowStock,
          outOfStockItems: outOfStock,
          totalValue: totalValue.toFixed(2),
          allItems: items,
        });

        setCategories(Array.from(categorySet));
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchInventoryData();
  }, [currentUser]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    const itemsInCategory =
      inventoryStats?.allItems.filter((item) => item.category === category) ||
      [];
    setCategoryItems(itemsInCategory);
    setShowCategoryItemsModal(true);
    setShowCategoriesModal(false);
  };

  const stats = [
    {
      icon: <InventoryIcon fontSize="large" />,
      title: "Products",
      value: loadingStats ? "..." : inventoryStats?.totalItems.toLocaleString(),
      color: "primary",
    },
    {
      icon: <CategoryIcon fontSize="large" />,
      title: "Categories",
      value: loadingStats ? "..." : categories.length,
      color: "primary",
      onClick: () => setShowCategoriesModal(true),
    },
    {
      icon: <WarningIcon fontSize="large" />,
      title: "Low Stock",
      value: loadingStats
        ? "..."
        : inventoryStats?.lowStockItems.toLocaleString(),
      color: "warning",
    },
    {
      icon: <ErrorIcon fontSize="large" />,
      title: "Out of Stock",
      value: loadingStats
        ? "..."
        : inventoryStats?.outOfStockItems.toLocaleString(),
      color: "error",
    },
    {
      icon: <MoneyIcon fontSize="large" />,
      title: "Total Value",
      value: loadingStats ? "..." : `${inventoryStats?.totalValue}`,
      color: "success",
    },
  ];

  return (
    <>
      <Card sx={{ mb: 3, borderRadius: { xs: 0, sm: 2 } }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
            }}
          >
            {/* Profile Picture */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <label htmlFor="profile-picture-upload">
                    <IconButton component="span" size="small">
                      <CameraAlt fontSize="small" />
                    </IconButton>
                  </label>
                }
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar
                    src={userData?.photoURL}
                    sx={{
                      width: 120,
                      height: 120,
                      boxShadow: 3,
                    }}
                  />
                </motion.div>
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </Badge>

              {isUploading && (
                <Box sx={{ width: "100%", mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                  />
                  <Typography
                    variant="caption"
                    display="block"
                    textAlign="center"
                  >
                    {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </Box>

            {/* User Info */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom>
                {userData?.displayName || userData?.email}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={isAdmin ? "Administrator" : "User"}
                  color={isAdmin ? "secondary" : "default"}
                  size="small"
                  sx={{
                    mb: 2,
                    boxShadow: 1,
                  }}
                  icon={
                    isAdmin ? (
                      <AdminPanelSettings fontSize="small" />
                    ) : (
                      <Person fontSize="small" />
                    )
                  }
                />
                {isAdmin && (
                  <VerifiedUser
                    color="secondary"
                    fontSize="small"
                    sx={{
                      filter: "drop-shadow(0 0 4px rgba(0, 0, 0, 0.1))",
                    }}
                  />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                Member since:{" "}
                {userData?.createdAt?.toDate
                  ? userData.createdAt.toDate().toLocaleDateString()
                  : "N/A"}
              </Typography>

              <Button
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={logout}
                sx={{
                  mt: 2,
                  boxShadow: 1,
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                  transition: "transform 0.2s",
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <motion.div
              whileHover={{
                scale: 1.02,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
              transition={{ duration: 0.2 }}
            >
              <StatsCard
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                color={stat.color}
                onClick={stat.onClick}
              />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Category Modal */}
      <CategoryModal
        open={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        categories={categories}
        onCategorySelect={handleCategoryClick}
      />

      {/* Items by Category Modal */}
      <ItemsByCategoryModal
        open={showCategoryItemsModal}
        onClose={() => setShowCategoryItemsModal(false)}
        category={selectedCategory}
        items={categoryItems}
      />
    </>
  );
};

const ProfileScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { currentUser, switchUser } = useAuth();

  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.email === ADMIN_CREDENTIALS.email ||
      userData?.role === "admin" ||
      userData?.isAdmin
    );
  }, [currentUser, userData]);

  const handleReturnToAdmin = async () => {
    try {
      await switchUser(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    } catch (error) {
      console.error("Error returning to admin:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.email === ADMIN_CREDENTIALS.email) {
      const adminData = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: "Admin",
        photoURL: currentUser.photoURL,
        role: "admin",
        isAdmin: true,
        createdAt: new Date(),
      };
      setUserData(adminData);
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData({
          ...data,
          isAdmin:
            data.role === "admin" || data.email === ADMIN_CREDENTIALS.email,
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  if (!userData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {currentUser && currentUser.email !== ADMIN_CREDENTIALS.email && (
        <Button
          variant="contained"
          onClick={handleReturnToAdmin}
          startIcon={<AdminPanelSettings />}
          sx={{
            position: "fixed",
            bottom: isMobile ? 80 : 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          Return to Admin
        </Button>
      )}
      <Box
        sx={{
          p: isMobile ? 0 : 3,
          pb: isMobile ? "80px" : 3,
          bgcolor: "background.default",
          minHeight: "100vh",
          color: "text.primary",
        }}
      >
        {isMobile && (
          <MobileAppBar
            toggleDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            userData={userData}
          />
        )}

        <MobileDrawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          userData={userData}
          isAdmin={isAdmin}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 3,
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: activeTab === 0 ? "block" : isMobile ? "none" : "block",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <UserProfile userData={userData} isAdmin={isAdmin} />
            </motion.div>
          </Box>

          {isAdmin && (
            <Box
              sx={{
                flex: isMobile ? 1 : 0.5,
                minWidth: isMobile ? "100%" : 350,
                display:
                  activeTab === 1 ? "block" : isMobile ? "none" : "block",
              }}
            >
              <AdminTools userData={userData} />
            </Box>
          )}
        </Box>

        {isMobile && (
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
          />
        )}
      </Box>
    </>
  );
};

export default ProfileScreen;
