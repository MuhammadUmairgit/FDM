import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  MenuItem,
  CircularProgress,
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Collapse,
  Slide,
  Grow,
  Zoom,
  Avatar,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Tag as TagIcon,
  Category as CategoryIcon,
  Numbers as NumbersIcon,
  AttachMoney as AttachMoneyIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Check as CheckIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Star as StarIcon,
  MonetizationOn as MonetizationOnIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../Auth/AuthContext";

const AddItemModal = ({ open, onClose, onAddItem, isLoading }) => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(1);
  const [sellingPrice, setSellingPrice] = useState(1);
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [userCategories, setUserCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Load user-specific categories
  const loadUserCategories = async () => {
    if (!currentUser) return;

    setIsLoadingCategories(true);
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setUserCategories(userDoc.data().categories || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      loadUserCategories();
    }
  }, [open, currentUser]);

  const resetForm = () => {
    setItemName("");
    setDescription("");
    setQuantity(1);
    setPrice(1);
    setSellingPrice(1);
    setLocation("");
    setSelectedCategory("");
    setNewCategory("");
    setTags("");
    setImageUrl("");
    setShowCategoryDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName) return;

    onAddItem({
      name: itemName,
      description,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      sellingPrice: parseFloat(sellingPrice),
      location,
      category: selectedCategory,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      image: imageUrl,
      addedAt: new Date().toISOString(),
    });
    resetForm();
  };

  const addNewCategory = async () => {
    if (newCategory.trim() === "" || !currentUser) return;

    const categoryToAdd = newCategory.trim();

    try {
      // Update Firestore with the new category
      await updateDoc(doc(db, "users", currentUser.uid), {
        categories: arrayUnion(categoryToAdd),
      });

      // Update local state
      setUserCategories((prev) => [...prev, categoryToAdd]);
      setSelectedCategory(categoryToAdd);
      setNewCategory("");
      setShowCategoryDropdown(false);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showCategoryDropdown && newCategory) {
        addNewCategory();
      } else {
        handleSubmit(e);
      }
    }
  };

  // Default categories if user has none
  const defaultCategories = [
    "Electronics",
    "Clothing",
    "Books",
    "Kitchen",
    "Other",
  ];
  const allCategories = [
    ...new Set([...userCategories, ...defaultCategories]),
  ].sort();

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      aria-labelledby="add-item-modal"
      aria-describedby="add-new-storage-item"
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isSmallScreen ? "90%" : 500,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
            outline: "none",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header with slide animation */}
          <Slide direction="down" in={open} mountOnEnter unmountOnExit>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 600, color: theme.palette.primary.main }}
              >
                Add Storage Item
              </Typography>
              <motion.div whileHover={{ scale: 1.1 }}>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  aria-label="close"
                  sx={{ color: theme.palette.text.primary }}
                >
                  <CloseIcon />
                </IconButton>
              </motion.div>
            </Box>
          </Slide>

          <Divider sx={{ mb: 3, bgcolor: theme.palette.divider }} />

          <Box
            component="form"
            noValidate
            sx={{ mt: 1 }}
            onSubmit={handleSubmit}
            onKeyPress={handleKeyPress}
          >
            {/* Item Name Field */}
            <Grow in={open} style={{ transitionDelay: open ? "100ms" : "0ms" }}>
              <TextField
                fullWidth
                margin="normal"
                label="Item Name"
                variant="outlined"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TagIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
                required
                autoFocus
              />
            </Grow>

            {/* Description Field */}
            <Grow in={open} style={{ transitionDelay: open ? "150ms" : "0ms" }}>
              <TextField
                fullWidth
                margin="normal"
                label="Description"
                variant="outlined"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Grow>

            {/* Location Field */}
            <Grow in={open} style={{ transitionDelay: open ? "200ms" : "0ms" }}>
              <TextField
                fullWidth
                margin="normal"
                label="Storage Location"
                variant="outlined"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </Grow>

            {/* Category Field with dropdown */}
            <Grow in={open} style={{ transitionDelay: open ? "250ms" : "0ms" }}>
              <Box sx={{ position: "relative", mb: 2 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Category"
                  variant="outlined"
                  value={selectedCategory}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {showCategoryDropdown ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </InputAdornment>
                    ),
                    readOnly: true,
                  }}
                />

                <Collapse in={showCategoryDropdown}>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper
                      sx={{
                        position: "absolute",
                        width: "100%",
                        mt: 1,
                        zIndex: 1,
                        maxHeight: 300,
                        overflow: "auto",
                        boxShadow: 3,
                        borderRadius: 2,
                        bgcolor: "background.paper",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {/* Add new category section */}
                      <Box
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          bgcolor: theme.palette.background.default,
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Create new category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          autoFocus
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AddIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiInputBase-input": {
                              color: theme.palette.text.primary,
                            },
                            "& .MuiInputBase-input::placeholder": {
                              color: theme.palette.text.secondary,
                              opacity: 1,
                            },
                          }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={addNewCategory}
                          disabled={!newCategory.trim()}
                          startIcon={<CheckIcon />}
                          sx={{
                            whiteSpace: "nowrap",
                            minWidth: 100,
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                          }}
                        >
                          Add
                        </Button>
                      </Box>

                      {/* Categories list */}
                      {isLoadingCategories ? (
                        <Box
                          sx={{
                            p: 2,
                            display: "flex",
                            justifyContent: "center",
                            bgcolor: "background.paper",
                          }}
                        >
                          <CircularProgress size={24} />
                        </Box>
                      ) : allCategories.length > 0 ? (
                        allCategories.map((category) => (
                          <MenuItem
                            key={category}
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowCategoryDropdown(false);
                            }}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 1,
                              bgcolor:
                                selectedCategory === category
                                  ? theme.palette.action.selected
                                  : "background.paper",
                              color: theme.palette.text.primary,
                              "&:hover": {
                                bgcolor: theme.palette.action.hover,
                              },
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: theme.palette.primary.main,
                                  color: theme.palette.primary.contrastText,
                                }}
                              >
                                <CategoryIcon fontSize="small" />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={category}
                              primaryTypographyProps={{
                                fontWeight:
                                  selectedCategory === category ? 600 : 400,
                                color: "inherit",
                              }}
                            />
                            {userCategories.includes(category) && (
                              <StarIcon fontSize="small" color="primary" />
                            )}
                            {selectedCategory === category && (
                              <CheckIcon color="primary" />
                            )}
                          </MenuItem>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            p: 2,
                            textAlign: "center",
                            bgcolor: "background.paper",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          No categories found. Create one above!
                        </Typography>
                      )}
                    </Paper>
                  </motion.div>
                </Collapse>
              </Box>
            </Grow>

            {/* Quantity Field */}
            {!showCategoryDropdown && (
              <Grow
                in={open}
                style={{ transitionDelay: open ? "300ms" : "0ms" }}
              >
                <TextField
                  fullWidth
                  margin="normal"
                  label="Quantity"
                  type="number"
                  variant="outlined"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1) {
                      setQuantity(value);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NumbersIcon color="action" />
                      </InputAdornment>
                    ),
                    inputProps: { min: 1 },
                  }}
                  required
                  disabled={showCategoryDropdown}
                  sx={{ mb: 2 }}
                />
              </Grow>
            )}

            {/* Price Field */}
            {!showCategoryDropdown && (
              <Grow
                in={open}
                style={{ transitionDelay: open ? "350ms" : "0ms" }}
              >
                <TextField
                  fullWidth
                  margin="normal"
                  label="Cost Price"
                  type="number"
                  variant="outlined"
                  value={price}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setPrice(value);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon color="action" />
                      </InputAdornment>
                    ),
                    inputProps: { min: 0, step: "0.01" },
                  }}
                  required
                  disabled={showCategoryDropdown}
                  sx={{ mb: 2 }}
                />
              </Grow>
            )}

            {/* Selling Price Field */}
            {!showCategoryDropdown && (
              <Grow
                in={open}
                style={{ transitionDelay: open ? "400ms" : "0ms" }}
              >
                <TextField
                  fullWidth
                  margin="normal"
                  label="Selling Price"
                  type="number"
                  variant="outlined"
                  value={sellingPrice}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setSellingPrice(value);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonetizationOnIcon color="action" />
                      </InputAdornment>
                    ),
                    inputProps: { min: 0, step: "0.01" },
                  }}
                  required
                  disabled={showCategoryDropdown}
                  sx={{ mb: 2 }}
                />
              </Grow>
            )}

            {/* Tags Field */}
            {!showCategoryDropdown && (
              <Grow
                in={open}
                style={{ transitionDelay: open ? "450ms" : "0ms" }}
              >
                <TextField
                  fullWidth
                  margin="normal"
                  label="Tags (comma separated)"
                  variant="outlined"
                  value={tags}
                  disabled={showCategoryDropdown}
                  onChange={(e) => setTags(e.target.value)}
                  sx={{ mb: 2 }}
                  helperText="e.g. electronics, fragile, gift"
                />
              </Grow>
            )}

            {/* Image URL Field */}
            {!showCategoryDropdown && (
              <Grow
                in={open}
                style={{ transitionDelay: open ? "500ms" : "0ms" }}
              >
                <TextField
                  fullWidth
                  margin="normal"
                  disabled={showCategoryDropdown}
                  label="Image URL (Optional)"
                  variant="outlined"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grow>
            )}

            {/* Submit Button with zoom animation */}
            <Zoom in={open} style={{ transitionDelay: open ? "600ms" : "0ms" }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading || !itemName}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AddIcon />
                  )
                }
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: theme.shadows[4],
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {isLoading ? "Adding..." : "Add to Storage"}
              </Button>
            </Zoom>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default AddItemModal;
