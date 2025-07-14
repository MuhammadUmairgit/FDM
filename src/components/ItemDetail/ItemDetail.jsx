import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Paper,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Fade,
  Grow,
  Slide,
  Zoom,
  Chip,
  Tooltip,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon,
  Warning as WarningIcon,
  AttachMoney as AttachMoneyIcon,
  Numbers as NumbersIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  PriceCheck as PriceCheckIcon,
  Tag as TagIcon,
  Code as CodeIcon,
  ContentCopy as ContentCopyIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  MonetizationOn as CostIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const AnimatedCard = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay * 0.1 }}
  >
    {children}
  </motion.div>
);

const PulseOnUpdate = ({ children, value }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <motion.div
      animate={{
        scale: isAnimating ? [1, 1.05, 1] : 1,
        transition: { duration: 0.5 },
      }}
    >
      {children}
    </motion.div>
  );
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

const ItemDetailScreen = () => {
  const { id } = useParams();
  const location = useLocation();
  const { themeMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  const [item, setItem] = React.useState({
    ...(location.state?.item || {}),
    price: location.state?.item?.price || 0,
    quantity: location.state?.item?.quantity || 0,
    cost: location.state?.item?.cost || 0,
    safetyStock: location.state?.item?.safetyStock || 0,
    code: location.state?.item?.code || "",
    name: location.state?.item?.name || "",
    category: location.state?.item?.category || "",
  });
  const [quantityDelta, setQuantityDelta] = React.useState("");
  const [priceDelta, setPriceDelta] = React.useState("");
  const [safetyStock, setSafetyStock] = React.useState("");
  const [costDelta, setCostDelta] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [categories, setCategories] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [categoryAnchorEl, setCategoryAnchorEl] = React.useState(null);
  const [newCategory, setNewCategory] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const openCategoryMenu = Boolean(categoryAnchorEl);

  // Fetch item details if not passed in state
  const { isLoading: itemLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      if (!item?.id) {
        const docRef = doc(db, "inventory", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const itemData = {
            id: docSnap.id,
            price: docSnap.data().price || 0,
            quantity: docSnap.data().quantity || 0,
            cost: docSnap.data().cost || 0,
            safetyStock: docSnap.data().safetyStock || 0,
            code: docSnap.data().code || "",
            name: docSnap.data().name || "",
            category: docSnap.data().category || "",
            ...docSnap.data(),
          };
          setItem(itemData);
          setSafetyStock(itemData.safetyStock?.toString() || "");
          setSelectedCategory(itemData.category || "");
          setCostDelta(itemData.cost?.toString() || "");
          return itemData;
        }
        throw new Error("Item not found");
      }
      return item;
    },

    enabled: !item?.id,
    onError: () => {
      showSnackbar("Item not found", "error");
      navigate("/inventory");
    },
  });

  // Fetch categories
  const { isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const loadedCategories = querySnapshot.docs.map((doc) => doc.data().name);
      setCategories(loadedCategories);
      return loadedCategories;
    },

    onError: () => {
      showSnackbar("Error loading categories", "error");
    },
    initialData: [],
  });

  React.useEffect(() => {
    if (item) {
      setSafetyStock(item.safetyStock?.toString() || "");
      setSelectedCategory(item.category || "");
      setCostDelta(item.cost?.toString() || "");
    }
  }, [item]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const updateItemMutation = useMutation({
    mutationFn: async (updatedItem) => {
      const itemRef = doc(db, "inventory", updatedItem.id);
      await updateDoc(itemRef, updatedItem);
      return updatedItem;
    },

    onSuccess: async (updatedItem) => {
      await queryClient.invalidateQueries(["inventory"]);
      const currentInventory = queryClient.getQueryData(["inventory"]) || [];
      queryClient.setQueryData(["inventory"], (oldData) =>
        Array.isArray(oldData)
          ? oldData.map((item) =>
              item.id === updatedItem.id ? updatedItem : item
            )
          : [updatedItem]
      );
      showSnackbar("Item updated successfully!");
      navigate("/inventory");
    },
    onError: (error) => {
      showSnackbar(`Failed to update item: ${error.message}`, "error");
    },
    onSettled: () => {
      setLoading(false);
    },
  });
  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      const itemRef = doc(db, "inventory", id);
      await deleteDoc(itemRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory"]);
      showSnackbar("Item deleted successfully!");
      navigate("/inventory");
    },
    onError: () => {
      showSnackbar("Failed to delete item. Please try again.", "error");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSave = async () => {
    const parsedQuantityDelta = parseInt(quantityDelta) || 0;
    const parsedPriceDelta = parseFloat(priceDelta) || 0;
    const parsedSafetyStock = parseInt(safetyStock) || 0;
    const parsedCostDelta = parseFloat(costDelta) || 0;

    const newQuantity = (item.quantity || 0) + parsedQuantityDelta;
    const newPrice = (item.price || 0) + parsedPriceDelta;
    const newCost = parsedCostDelta; // Use the direct value for cost

    if (newQuantity < 0) {
      showSnackbar("Quantity cannot be negative", "error");
      return;
    }

    const updatedItem = {
      ...item,
      quantity: newQuantity,
      price: parseFloat(newPrice.toFixed(2)),
      cost: parseFloat(newCost.toFixed(2)),
      safetyStock: parsedSafetyStock,
      category: selectedCategory,
    };

    setLoading(true);
    updateItemMutation.mutate(updatedItem);
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    setLoading(true);
    deleteItemMutation.mutate();
  };

  const addCategoryMutation = useMutation({
    mutationFn: async (categoryName) => {
      await addDoc(collection(db, "categories"), {
        name: categoryName.trim(),
        createdAt: new Date(),
      });
      return categoryName.trim();
    },
    onSuccess: (newCategory) => {
      setCategories((prev) => [...prev, newCategory]);
      setSelectedCategory(newCategory);
      setNewCategory("");
      setCategoryAnchorEl(null);
      showSnackbar("Category added successfully!");
    },
    onError: () => {
      showSnackbar("Failed to add category. Please try again.", "error");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryName) => {
      const querySnapshot = await getDocs(
        query(collection(db, "categories"), where("name", "==", categoryName))
      );

      if (!querySnapshot.empty) {
        await deleteDoc(querySnapshot.docs[0].ref);
      }
      return categoryName;
    },
    onSuccess: (deletedCategory) => {
      setCategories((prev) => prev.filter((cat) => cat !== deletedCategory));
      if (selectedCategory === deletedCategory) {
        setSelectedCategory("");
      }
      showSnackbar("Category deleted successfully!");
    },
    onError: () => {
      showSnackbar("Failed to delete category. Please try again.", "error");
    },
  });

  const addNewCategory = () => {
    if (newCategory.trim() === "") return;
    addCategoryMutation.mutate(newCategory);
  };

  const deleteCategory = (categoryName) => {
    deleteCategoryMutation.mutate(categoryName);
  };

  if (itemLoading || !item?.id) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Slide direction="right" in={true} mountOnEnter unmountOnExit>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {item.name}
            </Typography>
          </Box>
        </Slide>

        <IconButton onClick={() => toggleTheme()} color="inherit">
          {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Fade in={true} timeout={500}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 4,
            background:
              themeMode === "dark"
                ? "linear-gradient(145deg, #1a1a1a, #2d2d2d)"
                : "linear-gradient(145deg, #f5f7fa, #ffffff)",
          }}
        >
          <AnimatedCard delay={0}>
            <Card
              sx={{
                mb: 4,
                background:
                  themeMode === "dark"
                    ? "linear-gradient(135deg, rgba(63,81,181,0.2) 0%, rgba(63,81,181,0.1) 100%)"
                    : "linear-gradient(135deg, rgba(63,81,181,0.1) 0%, rgba(63,81,181,0.05) 100%)",
                borderLeft: "4px solid #3F51B5",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(63,81,181,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 25px rgba(63,81,181,0.2)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CodeIcon sx={{ mr: 1.5, color: "#3F51B5" }} />
                    <Typography variant="subtitle1">Item Code</Typography>
                  </Box>
                  <Tooltip title="Copy to clipboard" arrow>
                    <IconButton
                      size="small"
                      onClick={() => {
                        copyToClipboard(item.code);
                        showSnackbar("Code copied to clipboard!");
                      }}
                      sx={{ color: "#3F51B5" }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: "#3F51B5", letterSpacing: 1 }}
                >
                  {item.code}
                </Typography>
                <Chip
                  label="Unique Identifier"
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: "rgba(63,81,181,0.1)",
                    color: "#3F51B5",
                  }}
                />
              </CardContent>
            </Card>
          </AnimatedCard>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Quantity Card */}
            <Grid item xs={12} md={4}>
              <AnimatedCard delay={1}>
                <PulseOnUpdate value={item.quantity}>
                  <Card
                    sx={{
                      height: "100%",
                      minHeight: 200, // Set a fixed minimum height
                      display: "flex",
                      flexDirection: "column",
                      background:
                        themeMode === "dark"
                          ? "linear-gradient(135deg, rgba(110,69,226,0.2) 0%, rgba(110,69,226,0.1) 100%)"
                          : "linear-gradient(135deg, rgba(110,69,226,0.1) 0%, rgba(110,69,226,0.05) 100%)",
                      borderLeft: "4px solid #6E45E2",
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(110,69,226,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 25px rgba(110,69,226,0.2)",
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          color: "text.secondary",
                        }}
                      >
                        <InventoryIcon sx={{ mr: 1.5, color: "#6E45E2" }} />
                        <Typography variant="subtitle1">Quantity</Typography>
                      </Box>
                      <motion.div
                        key={`quantity-${item.quantity}`}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Typography
                          variant="h3"
                          sx={{ fontWeight: 800, color: "#6E45E2" }}
                        >
                          {item.quantity}
                        </Typography>
                      </motion.div>
                      {item.safetyStock && (
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", mt: 1 }}
                        >
                          Safety stock: {item.safetyStock}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </PulseOnUpdate>
              </AnimatedCard>
            </Grid>

            {/* Price Card */}
            <Grid item xs={12} md={4}>
              <AnimatedCard delay={2}>
                <PulseOnUpdate value={item.price}>
                  <Card
                    sx={{
                      height: "100%",
                      minHeight: 200, // Same fixed minimum height
                      display: "flex",
                      flexDirection: "column",
                      background:
                        themeMode === "dark"
                          ? "linear-gradient(135deg, rgba(76,175,80,0.2) 0%, rgba(76,175,80,0.1) 100%)"
                          : "linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.05) 100%)",
                      borderLeft: "4px solid #4CAF50",
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(76,175,80,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 25px rgba(76,175,80,0.2)",
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          color: "text.secondary",
                        }}
                      >
                        <PriceCheckIcon sx={{ mr: 1.5, color: "#4CAF50" }} />
                        <Typography variant="subtitle1">Price</Typography>
                      </Box>
                      <motion.div
                        key={`price-${item.price}`}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Typography
                          variant="h3"
                          sx={{ fontWeight: 800, color: "#4CAF50" }}
                        >
                          {(item.price || 0).toFixed(2)}
                        </Typography>
                      </motion.div>
                      {/* Add empty space to match height */}
                      <Box sx={{ height: 24 }}></Box>
                    </CardContent>
                  </Card>
                </PulseOnUpdate>
              </AnimatedCard>
            </Grid>

            {/* Cost Card */}
            <Grid item xs={12} md={4}>
              <AnimatedCard delay={3}>
                <PulseOnUpdate value={item.cost}>
                  <Card
                    sx={{
                      height: "100%",
                      minHeight: 200, // Same fixed minimum height
                      display: "flex",
                      flexDirection: "column",
                      background:
                        themeMode === "dark"
                          ? "linear-gradient(135deg, rgba(255,152,0,0.2) 0%, rgba(255,152,0,0.1) 100%)"
                          : "linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,152,0,0.05) 100%)",
                      borderLeft: "4px solid #FF9800",
                      borderRadius: 3,
                      boxShadow: "0 4px 20px rgba(255,152,0,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 25px rgba(255,152,0,0.2)",
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          color: "text.secondary",
                        }}
                      >
                        <Typography sx={{ mr: 1.5, color: "#FF9800" }}>
                          ₨
                        </Typography>
                        <Typography variant="subtitle1">Cost</Typography>
                      </Box>
                      <motion.div
                        key={`cost-${item.cost}`}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Typography
                          variant="h3"
                          sx={{ fontWeight: 800, color: "#FF9800" }}
                        >
                          {(item.cost || 0).toFixed(2)}
                        </Typography>
                      </motion.div>
                      {item.price && item.cost && (
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", mt: 1 }}
                        >
                          Margin: ${(item.price - item.cost).toFixed(2)} (
                          {(
                            ((item.price - item.cost) / item.price) *
                            100
                          ).toFixed(2)}
                          %)
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </PulseOnUpdate>
              </AnimatedCard>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: "divider" }} />

          <Grow in={true} timeout={800}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Category Management
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CategoryIcon />}
                endIcon={
                  openCategoryMenu ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                onClick={(e) => setCategoryAnchorEl(e.currentTarget)}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                {selectedCategory || "Select Category"}
              </Button>

              <Menu
                anchorEl={categoryAnchorEl}
                open={openCategoryMenu}
                onClose={() => setCategoryAnchorEl(null)}
                PaperProps={{
                  sx: {
                    width: 300,
                    maxHeight: 400,
                    p: 1,
                    borderRadius: 3,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    backgroundColor:
                      themeMode === "dark" ? "#2d2d2d" : "#ffffff",
                  },
                }}
              >
                <Box sx={{ p: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add new category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addNewCategory()}
                    sx={{ mb: 1 }}
                    InputProps={{
                      sx: {
                        backgroundColor:
                          themeMode === "dark" ? "#3d3d3d" : "#f5f5f5",
                        borderRadius: 1,
                      },
                    }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={!newCategory.trim()}
                    onClick={addNewCategory}
                    sx={{ mb: 1 }}
                  >
                    Add Category
                  </Button>
                </Box>
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((cat) => (
                    <MenuItem
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategoryAnchorEl(null);
                      }}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderRadius: 1,
                        my: 0.5,
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor:
                            themeMode === "dark" ? "#3d3d3d" : "#f5f5f5",
                        },
                      }}
                    >
                      <Typography>{cat}</Typography>
                      <Box>
                        {selectedCategory === cat && (
                          <CheckIcon color="primary" sx={{ mr: 1 }} />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCategory(cat);
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No categories found</MenuItem>
                )}
              </Menu>
            </Box>
          </Grow>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TextField
                  fullWidth
                  label="Quantity Adjustment"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <NumbersIcon sx={{ color: "primary.main", mr: 1 }} />
                    ),
                    sx: {
                      backgroundColor:
                        themeMode === "dark" ? "#3d3d3d" : "#f5f5f5",
                    },
                  }}
                  value={quantityDelta}
                  onChange={(e) => setQuantityDelta(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <TextField
                  fullWidth
                  label="Price Adjustment"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <AttachMoneyIcon sx={{ color: "primary.main", mr: 1 }} />
                    ),
                    sx: {
                      backgroundColor:
                        themeMode === "dark" ? "#3d3d3d" : "#f5f5f5",
                    },
                  }}
                  value={priceDelta}
                  onChange={(e) => setPriceDelta(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <TextField
                  fullWidth
                  label="Safety Stock Level"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <WarningIcon sx={{ color: "primary.main", mr: 1 }} />
                    ),
                    sx: {
                      backgroundColor:
                        themeMode === "dark" ? "#3d3d3d" : "#f5f5f5",
                    },
                  }}
                  value={safetyStock}
                  onChange={(e) => setSafetyStock(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <TextField
                  fullWidth
                  label="Cost Price"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <CostIcon sx={{ color: "primary.main", mr: 1 }} />
                    ),
                    sx: {
                      backgroundColor:
                        themeMode === "dark" ? "#3d3d3d" : "#f5f5f5",
                    },
                  }}
                  value={costDelta}
                  onChange={(e) => setCostDelta(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>

          <Zoom in={true} style={{ transitionDelay: "300ms" }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 3,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                color="error"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <DeleteIcon />
                  )
                }
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(244,67,54,0.3)",
                  },
                }}
              >
                Delete Item
              </Button>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={handleSave}
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(25,118,210,0.3)",
                  },
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Zoom>
        </Paper>
      </Fade>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            backgroundColor: themeMode === "dark" ? "#2d2d2d" : "#ffffff",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete{" "}
            <strong>"{item.name}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              backgroundColor: themeMode === "dark" ? "#3d3d3d" : "#ffffff",
            }}
          >
            {snackbar.message}
          </Alert>
        </motion.div>
      </Snackbar>
    </Box>
  );
};

export default ItemDetailScreen;
