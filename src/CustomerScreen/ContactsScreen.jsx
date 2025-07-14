import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Fade,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Grid,
  Badge,
  InputAdornment,
  Menu,
  MenuItem,
  Fab,
} from "@mui/material";
import {
  People as PeopleIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Message as MessageIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Storage as StorageIcon,
  Contacts as ContactsIcon,
  Person as PersonIcon,
  ShowChart as ShowChartIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../components/Auth/AuthContext";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ContactsContext = React.createContext();

export const useContacts = () => {
  const context = React.useContext(ContactsContext);
  if (!context) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
};

export const ContactsProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const fetchContacts = async () => {
    if (!currentUser) return [];

    const q = query(
      collection(db, "contacts"),
      where("userId", "==", currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  const {
    data: contacts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["userContacts", currentUser?.uid],
    queryFn: fetchContacts,
    enabled: !!currentUser,
  });

  const totalContacts = contacts.length;
  const favoriteContacts = contacts.filter((contact) => contact.isFavorite);
  const recentContacts = useMemo(() => {
    return [...contacts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [contacts]);

  const value = {
    contacts,
    isLoading,
    totalContacts,
    recentContacts,
    favoriteContacts,
    refetchContacts: refetch,
  };

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
};

const ContactsScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const {
    contacts,
    isLoading,
    totalContacts,
    recentContacts,
    favoriteContacts,
    refetchContacts,
  } = useContacts();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [filter, setFilter] = useState("all");

  const open = Boolean(anchorEl);
  const filterMenuOpen = Boolean(filterMenuAnchor);

  const addContactMutation = useMutation({
    mutationFn: async (newContact) => {
      if (!currentUser) throw new Error("User not authenticated");

      const contactWithUser = {
        ...newContact,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        isFavorite: false,
      };

      const docRef = await addDoc(collection(db, "contacts"), contactWithUser);
      return { id: docRef.id, ...contactWithUser };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userContacts", currentUser?.uid],
      });
      setFormOpen(false);
      setSnackbar({
        open: true,
        message: "Contact added successfully!",
        severity: "success",
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: "Failed to add contact",
        severity: "error",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ contactId, isFavorite }) => {
      const contactRef = doc(db, "contacts", contactId);
      await updateDoc(contactRef, {
        isFavorite: !isFavorite,
      });
      return contactId;
    },
    onSuccess: (contactId) => {
      queryClient.invalidateQueries({
        queryKey: ["userContacts", currentUser?.uid],
      });
      setSnackbar({
        open: true,
        message: "Favorite status updated",
        severity: "success",
      });
      // Update the selected contact if it's the one being toggled
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact((prev) => ({
          ...prev,
          isFavorite: !prev.isFavorite,
        }));
      }
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: "Failed to update favorite status",
        severity: "error",
      });
    },
  });

  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Apply search filter
    if (searchQuery) {
      result = result.filter((contact) => {
        const contactName = contact.name ? contact.name.toLowerCase() : "";
        const contactPhone = contact.phoneNumber
          ? contact.phoneNumber.toLowerCase()
          : "";
        const contactEmail = contact.email ? contact.email.toLowerCase() : "";
        return (
          contactName.includes(searchQuery.toLowerCase()) ||
          contactPhone.includes(searchQuery.toLowerCase()) ||
          contactEmail.includes(searchQuery.toLowerCase())
        );
      });
    }

    // Apply category filter
    if (filter === "favorites") {
      result = result.filter((contact) => contact.isFavorite);
    } else if (filter === "recent") {
      result = recentContacts;
    }

    return result;
  }, [contacts, searchQuery, filter, recentContacts]);

  const handleAddContact = useCallback(async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      setSnackbar({
        open: true,
        message: "Please fill in required fields",
        severity: "error",
      });
      return;
    }

    await addContactMutation.mutateAsync({
      name,
      address,
      phoneNumber,
      email,
    });

    setName("");
    setAddress("");
    setPhoneNumber("");
    setEmail("");
  }, [name, address, phoneNumber, email, addContactMutation]);

  const handleCall = useCallback((phone) => {
    window.open(`tel:${phone}`, "_blank");
  }, []);

  const handleWhatsapp = useCallback((phone) => {
    window.open(`https://wa.me/${phone}`, "_blank");
  }, []);

  const handleSeeMessages = useCallback((phone) => {
    console.log("Opening messages for:", phone);
  }, []);

  const handleEmail = useCallback((email) => {
    window.open(`mailto:${email}`, "_blank");
  }, []);

  const handleContactPress = useCallback((contact) => {
    setSelectedContact(contact);
  }, []);

  const handleCloseOptions = useCallback(() => {
    setSelectedContact(null);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterMenuClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleFilterSelect = (filterType) => {
    setFilter(filterType);
    handleFilterMenuClose();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleFavorite = useCallback(
    (contactId, isFavorite) => {
      toggleFavoriteMutation.mutate({ contactId, isFavorite });
    },
    [toggleFavoriteMutation]
  );

  return (
    <Box
      sx={{
        p: isMobile ? 0 : 4,
        minHeight: "100vh",
        background: theme.palette.background.default,
        position: "relative",
      }}
    >
      {/* Header with animation */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              p: isMobile ? 2 : 0,
              mb: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.getContrastText(
                    theme.palette.background.default
                  ),
                  textShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              >
                Contacts
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  onClick={handleFilterMenuClick}
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    boxShadow: 2,
                    "&:hover": {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Badge
                    badgeContent={
                      filter === "favorites"
                        ? favoriteContacts.length
                        : filter === "recent"
                        ? recentContacts.length
                        : 0
                    }
                    color="primary"
                  >
                    <FilterIcon />
                  </Badge>
                </IconButton>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setFormOpen(true)}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: 3,
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Add
                </Button>
              </Box>
            </Box>

            <TextField
              fullWidth
              placeholder="Search contacts..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </motion.div>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={filterMenuOpen}
        onClose={handleFilterMenuClose}
        MenuListProps={{
          "aria-labelledby": "filter-button",
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 4,
            minWidth: 200,
          },
        }}
      >
        <MenuItem
          onClick={() => handleFilterSelect("all")}
          selected={filter === "all"}
          sx={{
            bgcolor:
              filter === "all" ? theme.palette.action.selected : "inherit",
          }}
        >
          <ListItemText primary="All Contacts" />
          <Chip label={totalContacts} size="small" />
        </MenuItem>
        <MenuItem
          onClick={() => handleFilterSelect("favorites")}
          selected={filter === "favorites"}
          sx={{
            bgcolor:
              filter === "favorites"
                ? theme.palette.action.selected
                : "inherit",
          }}
        >
          <ListItemText primary="Favorites" />
          <Chip
            label={favoriteContacts.length}
            size="small"
            color="primary"
            icon={<StarIcon fontSize="small" />}
          />
        </MenuItem>
        <MenuItem
          onClick={() => handleFilterSelect("recent")}
          selected={filter === "recent"}
          sx={{
            bgcolor:
              filter === "recent" ? theme.palette.action.selected : "inherit",
          }}
        >
          <ListItemText primary="Recent" />
          <Chip label={recentContacts.length} size="small" color="secondary" />
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "60vh",
                }}
              >
                <CircularProgress size={60} />
              </Box>
            ) : filteredContacts.length > 0 ? (
              <Grid container spacing={3}>
                {filteredContacts.map((contact) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={contact.id}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        sx={{
                          borderRadius: 3,
                          boxShadow: 3,
                          bgcolor: theme.palette.background.paper,
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: 6,
                          },
                          position: "relative",
                          overflow: "visible",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 1,
                          }}
                        >
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(contact.id, contact.isFavorite);
                            }}
                            sx={{
                              bgcolor: theme.palette.background.paper,
                              boxShadow: 2,
                              "&:hover": {
                                bgcolor: theme.palette.action.hover,
                              },
                            }}
                          >
                            {contact.isFavorite ? (
                              <StarIcon color="warning" />
                            ) : (
                              <StarBorderIcon />
                            )}
                          </IconButton>
                        </Box>

                        <CardContent
                          sx={{
                            p: 3,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                          }}
                          onClick={() => handleContactPress(contact)}
                        >
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              fontSize: 32,
                              bgcolor: theme.palette.primary.main,
                              color: "white",
                              mb: 2,
                              boxShadow: 3,
                            }}
                          >
                            {contact.name.charAt(0).toUpperCase()}
                          </Avatar>

                          <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                          >
                            {contact.name}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {contact.phoneNumber}
                            </Typography>
                          </Box>

                          {contact.email && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <EmailIcon fontSize="small" color="action" />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {contact.email}
                              </Typography>
                            </Box>
                          )}

                          {contact.address && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LocationIcon fontSize="small" color="action" />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {contact.address}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 4,
                    height: "50vh",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      bgcolor: theme.palette.action.hover,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                    }}
                  >
                    <PeopleIcon
                      sx={{
                        fontSize: 60,
                        color: theme.palette.text.disabled,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {filter === "favorites"
                      ? "No favorite contacts"
                      : searchQuery
                      ? "No matching contacts"
                      : "No contacts found"}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, maxWidth: 400 }}
                  >
                    {filter === "favorites"
                      ? "Mark contacts as favorites to see them here"
                      : searchQuery
                      ? "Try a different search term"
                      : "Get started by adding your first contact"}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setFormOpen(true)}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      fontWeight: 600,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      boxShadow: 3,
                    }}
                  >
                    Add Contact
                  </Button>
                </Box>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Add Contact Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        TransitionComponent={Transition}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background: theme.palette.background.paper,
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              New Contact
            </Typography>
            <IconButton onClick={() => setFormOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              pt: 2,
            }}
          >
            <TextField
              label="Full Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              required
            />

            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              required
            />

            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="Address"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setFormOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddContact}
            variant="contained"
            disabled={addContactMutation.isPending}
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            {addContactMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Save Contact"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Options Dialog */}
      <Dialog
        open={Boolean(selectedContact)}
        onClose={handleCloseOptions}
        TransitionComponent={Transition}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background: theme.palette.background.paper,
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              Contact Details
            </Typography>
            <Box>
              <IconButton
                onClick={() =>
                  toggleFavorite(
                    selectedContact?.id,
                    selectedContact?.isFavorite
                  )
                }
                disabled={toggleFavoriteMutation.isPending}
              >
                {toggleFavoriteMutation.isPending ? (
                  <CircularProgress size={24} />
                ) : selectedContact?.isFavorite ? (
                  <StarIcon color="warning" />
                ) : (
                  <StarBorderIcon />
                )}
              </IconButton>
              <IconButton onClick={handleCloseOptions}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 3,
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: 48,
                bgcolor: theme.palette.primary.main,
                color: "white",
                mb: 3,
                boxShadow: 4,
              }}
            >
              {selectedContact?.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Typography variant="h4" fontWeight={700} gutterBottom>
              {selectedContact?.name}
            </Typography>

            <Box
              sx={{
                width: "100%",
                mt: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.action.hover,
                }}
              >
                <PhoneIcon color="primary" />
                <Typography variant="body1">
                  {selectedContact?.phoneNumber}
                </Typography>
              </Box>

              {selectedContact?.email && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.action.hover,
                  }}
                >
                  <EmailIcon color="primary" />
                  <Typography variant="body1">
                    {selectedContact?.email}
                  </Typography>
                </Box>
              )}

              {selectedContact?.address && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.action.hover,
                  }}
                >
                  <LocationIcon color="primary" />
                  <Typography variant="body1">
                    {selectedContact?.address}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            variant="contained"
            startIcon={<PhoneIcon />}
            onClick={() => handleCall(selectedContact?.phoneNumber)}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              flex: 1,
              bgcolor: theme.palette.success.main,
              "&:hover": {
                bgcolor: theme.palette.success.dark,
              },
            }}
          >
            Call
          </Button>

          <Button
            variant="contained"
            startIcon={<WhatsAppIcon />}
            onClick={() => handleWhatsapp(selectedContact?.phoneNumber)}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              flex: 1,
              bgcolor: "#25D366",
              "&:hover": {
                bgcolor: "#128C7E",
              },
            }}
          >
            WhatsApp
          </Button>

          {selectedContact?.email && (
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={() => handleEmail(selectedContact?.email)}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                flex: 1,
                bgcolor: theme.palette.secondary.main,
                "&:hover": {
                  bgcolor: theme.palette.secondary.dark,
                },
              }}
            >
              Email
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setFormOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            bgcolor: theme.palette.primary.main,
            backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            "&:hover": {
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%", boxShadow: 6 }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactsScreen;
