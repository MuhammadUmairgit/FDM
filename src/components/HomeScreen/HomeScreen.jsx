import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  FloatButton,
  Button,
  Typography,
  Spin,
  Tabs,
  Avatar,
  Row,
  Col,
  Modal,
  Table,
  Input,
  Card,
  Space,
  Upload,
  message,
  Divider,
  theme,
  Badge,
  Tooltip,
  Tag,
} from "antd";
import {
  PlusOutlined,
  BarChartOutlined,
  UploadOutlined,
  EditOutlined,
  DatabaseOutlined,
  ContactsOutlined,
  AreaChartOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";

import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../Auth/AuthContext";
import { useInventory } from "./InventoryContext";
import AddItemModal from "../AddItemModal/AddItemModal";
import ItemList from "../ItemList/ItemList";
import OrderForm from "../OrderScreen/OrderForm";
import { StatsCards } from "./StatsCards";
import { ProfitChart } from "./ProfitChart";
import { RecentItems } from "./RecentItems";
import { BulkEditTableSkeleton, LoadingSkeleton } from "./LoadingSkeleton";
import SearchBar from "../SearchBar/SearchBar";
import { QuickAccessCards } from "./QuickAccessCards";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useToken } = theme;

const HomeScreen = () => {
  const { token } = useToken();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const {
    items,
    isLoading,
    totalItems,
    totalValue,
    totalCostValue,
    totalPotentialProfit,
    profitMargin,
    categories,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [editableItems, setEditableItems] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [file, setFile] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isBulkEditLoading, setIsBulkEditLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const graphIconRef = useRef(null);

  // Prepare profit data for the chart
  const prepareProfitData = useCallback((items) => {
    const profitByCategory = {};

    items.forEach((item) => {
      const category = item.category || "Uncategorized";
      const quantity = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price) || 0;
      const costPrice = parseFloat(item.costPrice) || 0;
      const profit = (price - costPrice) * quantity;

      if (!profitByCategory[category]) {
        profitByCategory[category] = {
          category,
          profit: 0,
          cost: 0,
          revenue: 0,
          count: 0,
        };
      }

      profitByCategory[category].profit += profit;
      profitByCategory[category].cost += costPrice * quantity;
      profitByCategory[category].revenue += price * quantity;
      profitByCategory[category].count += 1;
    });

    return Object.values(profitByCategory)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, []);

  const [profitData, setProfitData] = useState([]);

  useEffect(() => {
    if (items.length > 0) {
      setProfitData(prepareProfitData(items));
    }
  }, [items, prepareProfitData]);

  const addItemMutation = useMutation({
    mutationFn: async (newItem) => {
      if (!currentUser) throw new Error("User not authenticated");

      const itemWithUser = {
        ...newItem,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "inventory"), itemWithUser);
      return { id: docRef.id, ...itemWithUser };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["inventory", currentUser?.uid],
      });
      setModalVisible(false);
    },
  });

  // const updateItemMutation = useMutation({
  //   mutationFn: async ({ id, updatedData }) => {
  //     const itemRef = doc(db, "inventory", id);
  //     await updateDoc(itemRef, updatedData);
  //     return { id, ...updatedData };
  //   },
  //   onSuccess: (updatedItem) => {
  //     queryClient.invalidateQueries(["inventory", currentUser?.uid]);
  //   },
  //   onError: (error) => {
  //     console.error("Error updating item:", error);
  //   },
  // });

  const bulkUpdateItemsMutation = useMutation({
    mutationFn: async (itemsToUpdate) => {
      const updatePromises = itemsToUpdate.map((item) => {
        const itemRef = doc(db, "inventory", item.id);
        return updateDoc(itemRef, {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
        });
      });
      await Promise.all(updatePromises);
      return itemsToUpdate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory", currentUser?.uid]);
      setSnackbar({
        open: true,
        message: "Items updated successfully!",
        severity: "success",
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error updating items: ${error.message}`,
        severity: "error",
      });
    },
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      // Process the data to extract item name, price, quantity, and selling price
      const processedData = jsonData.map((row) => ({
        name:
          row["Item Name"] ||
          row["item name"] ||
          row["Item"] ||
          row["item"] ||
          "No Name",
        price: parseFloat(
          row["Price"] ||
            row["price"] ||
            row["Cost Price"] ||
            row["cost price"] ||
            0
        ),
        quantity: parseInt(row["Quantity"] || row["quantity"] || 1),
        sellingPrice: parseFloat(
          row["Selling Price"] ||
            row["selling price"] ||
            row["Sale Price"] ||
            row["sale price"] ||
            0
        ),
        category: row["Category"] || row["category"] || "Uncategorized",
        description: row["Description"] || row["description"] || "",
      }));

      setExcelData(processedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportItems = async () => {
    try {
      const newItems = [];
      const existingItems = [];

      // Separate new items from existing ones
      for (const item of excelData) {
        const existingItem = items.find(
          (i) => i.name.toLowerCase() === item.name.toLowerCase()
        );

        if (existingItem) {
          existingItems.push(item);
        } else {
          newItems.push(item);
        }
      }

      // Only add new items to the order form
      if (newItems.length > 0) {
        const formattedOrderItems = newItems.map((item) => ({
          name: item.name,
          price: item.price.toString(),
          quantity: "1",
          available: item.quantity,
          id: Date.now() + Math.random(),
        }));

        setOrderItems(formattedOrderItems);
        setShowOrderForm(true);
      }

      setSnackbar({
        open: true,
        message: `Import complete: ${newItems.length} new items added to order form`,
        severity: "success",
      });
      setUploadModalOpen(false);
      setExcelData([]);
      setFile(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error importing items: ${error.message}`,
        severity: "error",
      });
    }
  };

  const handleOpenBulkEdit = async () => {
    setBulkEditModalOpen(true);
    setIsBulkEditLoading(true);

    // Simulate loading delay (you can remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 500));

    setEditableItems([...items]);
    setIsBulkEditLoading(false);
  };

  const handleBulkEditChange = (id, field, value) => {
    setEditableItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleBulkSave = () => {
    bulkUpdateItemsMutation.mutate(editableItems);
    setBulkEditModalOpen(false);
  };

  const showMessage = (content, type = 'success') => {
    messageApi[type](content);
  };

  useEffect(() => {
    const graphIcon = graphIconRef.current;
    if (!graphIcon) return;

    let animationId;
    let angle = 0;
    let direction = 1;

    const animate = () => {
      angle += direction * 0.5;
      if (angle > 5) direction = -1;
      if (angle < -5) direction = 1;
      graphIcon.style.transform = `rotate(${angle}deg)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemName = item.name ? item.name.toLowerCase() : "";
      const itemCode = item.code ? item.code.toLowerCase() : "";
      return (
        itemName.includes(searchQuery.toLowerCase()) ||
        itemCode.includes(searchQuery.toLowerCase())
      );
    });
  }, [items, searchQuery]);

  const recentItems = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [items]);

  const handleAddItem = async (itemData) => {
    try {
      await addItemMutation.mutateAsync(itemData);
    } catch (error) {
      console.error("Error adding item:", error.message);
    }
  };

  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };

  const handleNavigateTo = (path) => {
    navigate(path);
  };

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography color="error">
          Please login to access your inventory
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {showOrderForm ? (
        <OrderForm
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          onClose={() => setShowOrderForm(false)}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            backgroundColor: theme.palette.background.default,
            pb: isMobile ? "80px" : 0,
          }}
        >
          {/* Header with gradient background */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #6E45E2 0%, #88D3CE 100%)",
              p: 3,
              color: "white",
              boxShadow: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 600 }}
                >
                  Personal Storage
                </Typography>
                <Typography variant="subtitle1">
                  Welcome, {currentUser.email}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "white",
                  color: theme.palette.primary.main,
                }}
                onClick={() => handleNavigateTo("/profile")}
              >
                {currentUser.email.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              flex: 1,
              p: isMobile ? 2 : 3,
              overflow: "auto",
            }}
          >
            {/* Navigation Tabs */}
            <Box sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab
                  label="Inventory"
                  icon={<StorageIcon />}
                  iconPosition="start"
                />
                <Tab
                  label="Quick Access"
                  icon={<ContactsIcon />}
                  iconPosition="start"
                />
                <Tab
                  label="Stats"
                  icon={<AnalyticsIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {isLoading ? (
              <LoadingSkeleton isMobile={isMobile} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{
                    opacity: 0,
                    x: activeTab === 0 ? -50 : activeTab === 1 ? 50 : 0,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: activeTab === 0 ? -50 : activeTab === 1 ? 50 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 0 ? (
                    <>
                      {/* Search and Action Buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 3,
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <SearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                          />
                        </Box>
                        <Box ref={graphIconRef}>
                          <IconButton
                            onClick={handleNavigateToDashboard}
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                              "&:hover": {
                                backgroundColor: theme.palette.primary.dark,
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            <ShowChartIcon />
                          </IconButton>
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={handleOpenBulkEdit}
                          sx={{
                            backgroundColor: theme.palette.info.main,
                            "&:hover": {
                              backgroundColor: theme.palette.info.dark,
                            },
                          }}
                        >
                          Bulk Edit
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<UploadIcon />}
                          onClick={() => setUploadModalOpen(true)}
                          sx={{
                            backgroundColor: theme.palette.success.main,
                            "&:hover": {
                              backgroundColor: theme.palette.success.dark,
                            },
                          }}
                        >
                          Import
                        </Button>
                      </Box>

                      {/* Item List */}
                      <Fade in={!isLoading} timeout={500}>
                        <Box
                          sx={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 2,
                            p: 2,
                            boxShadow: 1,
                          }}
                        >
                          <ItemList
                            items={filteredItems}
                            isLoading={isLoading}
                          />
                        </Box>
                      </Fade>
                    </>
                  ) : activeTab === 1 ? (
                    <QuickAccessCards
                      onNavigate={handleNavigateTo}
                      onAddItem={() => setModalVisible(true)}
                      isMobile={isMobile}
                    />
                  ) : (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      <StatsCards
                        totalItems={totalItems}
                        totalValue={totalValue}
                        categories={categories}
                        totalCostValue={totalCostValue}
                        totalPotentialProfit={totalPotentialProfit}
                        profitMargin={profitMargin}
                      />

                      {/* Profit Analysis Section */}
                      <Grid spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardContent>
                              <Typography
                                variant="h6"
                                sx={{ textAlign: "left", fontSize: "40px" }}
                                gutterBottom
                              >
                                Profit Analysis
                              </Typography>
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Box>
                                  <Typography
                                    variant="body1"
                                    color="text.secondary"
                                  >
                                    Total Cost Value
                                  </Typography>
                                  <Typography variant="h5" fontWeight="bold">
                                    ${totalCostValue.toFixed(2)}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="body1"
                                    color="text.secondary"
                                  >
                                    Potential Profit
                                  </Typography>
                                  <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    color="success.main"
                                  >
                                    ${totalPotentialProfit.toFixed(2)}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="body1"
                                    color="text.secondary"
                                  >
                                    Profit Margin
                                  </Typography>
                                  <Typography variant="h5" fontWeight="bold">
                                    {profitMargin.toFixed(2)}%
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                        {/* <Grid item xs={12} md={6}>
                          <ProfitChart profitData={profitData} />
                        </Grid> */}
                      </Grid>

                      <RecentItems recentItems={recentItems} />
                    </Box>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </Box>

          {/* Floating Action Button */}
          {activeTab === 0 && (
            <Zoom in={true} style={{ transitionDelay: "200ms" }}>
              <Fab
                color="primary"
                sx={{
                  position: "fixed",
                  bottom: isMobile ? 80 : 24,
                  right: 24,
                  zIndex: 1000,
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.3s ease",
                }}
                onClick={() => setModalVisible(true)}
              >
                <AddIcon />
              </Fab>
            </Zoom>
          )}

          {/* Add Item Modal */}
          <AddItemModal
            open={modalVisible}
            onClose={() => setModalVisible(false)}
            onAddItem={handleAddItem}
            isLoading={addItemMutation.isPending}
          />

          {/* Excel Upload Modal */}
          <Dialog
            open={uploadModalOpen}
            onClose={() => {
              setUploadModalOpen(false);
              setExcelData([]);
              setFile(null);
            }}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle
              sx={{ bgcolor: theme.palette.primary.main, color: "white" }}
            >
              <Box display="flex" alignItems="center">
                <UploadIcon sx={{ mr: 1 }} />
                Import Items from Excel
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Box mb={3}>
                <input
                  accept=".xlsx,.xls,.csv"
                  style={{ display: "none" }}
                  id="excel-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="excel-upload">
                  <Button variant="contained" component="span" sx={{ mr: 2 }}>
                    Select File
                  </Button>
                </label>
                {file && (
                  <Typography variant="body1" component="span">
                    {file.name}
                  </Typography>
                )}
              </Box>

              {excelData.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Preview (First 5 Rows)
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Name</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Selling Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {excelData.slice(0, 5).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>${row.price.toFixed(2)}</TableCell>
                            <TableCell>{row.quantity}</TableCell>
                            <TableCell>
                              ${row.sellingPrice.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setUploadModalOpen(false);
                  setExcelData([]);
                  setFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportItems}
                disabled={!file}
                variant="contained"
                color="primary"
              >
                Import
              </Button>
            </DialogActions>
          </Dialog>

          {/* Bulk Edit Modal */}
          <Dialog
            open={bulkEditModalOpen}
            onClose={() => setBulkEditModalOpen(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle
              sx={{ bgcolor: theme.palette.primary.main, color: "white" }}
            >
              Bulk Edit Items
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {isBulkEditLoading ? (
                <BulkEditTableSkeleton />
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Selling Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {editableItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <TextField
                              value={item.name || ""}
                              onChange={(e) =>
                                handleBulkEditChange(
                                  item.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              fullWidth
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.price || ""}
                              onChange={(e) =>
                                handleBulkEditChange(
                                  item.id,
                                  "price",
                                  e.target.value
                                )
                              }
                              type="number"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.quantity || ""}
                              onChange={(e) =>
                                handleBulkEditChange(
                                  item.id,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              type="number"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.sellingPrice || ""}
                              onChange={(e) =>
                                handleBulkEditChange(
                                  item.id,
                                  "sellingPrice",
                                  e.target.value
                                )
                              }
                              type="number"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBulkEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBulkSave}
                disabled={isBulkEditLoading}
                variant="contained"
                color="primary"
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      )}
    </>
  );
};

export default HomeScreen;
