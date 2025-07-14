// src/pages/ProfileScreen/components/AdminTools/AdminTools.js
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Badge,
  LinearProgress,
} from "@mui/material";
import {
  PersonAdd,
  MoreVert,
  Delete,
  AdminPanelSettings,
  SupervisedUserCircle,
  SwitchAccount,
  Search,
  Edit,
  Refresh,
  PersonRemove,
  VerifiedUser,
  Warning,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useSnackbar } from "notistack";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth } from "../../../firebase/firebaseConfig";
import RoleDropdown from "../RoleDropdown/RoleDropdown";
import AdminChat from "../AdminChat/AdminChat";
import { db } from "../../../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useConfirm } from "material-ui-confirm";
import { debounce } from "lodash";

const ADMIN_CREDENTIALS = {
  email: "admin@inventory.com",
  password: "Admin@123",
};

const UserStatusChip = ({ user }) => {
  if (user.id === "admin") {
    return (
      <Chip
        icon={<VerifiedUser />}
        label="Main Admin"
        color="primary"
        size="small"
      />
    );
  }
  if (user.disabled) {
    return (
      <Chip icon={<Warning />} label="Disabled" color="error" size="small" />
    );
  }
  return <Chip label="Active" color="success" size="small" />;
};

const AdminTools = ({ userData }) => {
  const [showAdminChat, setShowAdminChat] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUserData, setEditUserData] = useState({});
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const confirm = useConfirm();

  // Fetch users from Firebase with debounced search
  useEffect(() => {
    setLoading(true);
    const usersQuery = query(collection(db, "users"));

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersList = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        usersList.push({
          id: doc.id,
          ...userData,
          isAdmin: userData.role === "admin",
          displayName: userData.displayName || userData.email.split("@")[0],
          createdAt: userData.createdAt?.toDate() || new Date(),
        });
      });

      // Add the main admin if not in the list
      if (!usersList.some((user) => user.email === ADMIN_CREDENTIALS.email)) {
        usersList.push({
          id: "admin",
          email: ADMIN_CREDENTIALS.email,
          displayName: "System Admin",
          role: "admin",
          isAdmin: true,
          disabled: false,
          createdAt: new Date(),
        });
      }

      setUsers(usersList);
      setFilteredUsers(usersList);
      setLoading(false);
      setIsRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (!searchTerm) {
        setFilteredUsers(users);
        return;
      }

      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.displayName &&
            user.displayName
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }, 300);

    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchTerm, users]);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // The snapshot listener will handle the refresh
  };

  const handleEditUser = (user) => {
    setEditUserData(user);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditSubmit = async () => {
    try {
      const userRef = doc(db, "users", editUserData.id);
      await updateDoc(userRef, {
        displayName: editUserData.displayName,
        disabled: editUserData.disabled,
      });
      enqueueSnackbar("User updated successfully", { variant: "success" });
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      enqueueSnackbar("Failed to update user", { variant: "error" });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      if (userId === "admin") {
        enqueueSnackbar("Cannot change main admin role", {
          variant: "warning",
        });
        return;
      }

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      enqueueSnackbar("User role updated", { variant: "success" });
    } catch (error) {
      console.error("Error updating user role:", error);
      enqueueSnackbar("Failed to update user role", { variant: "error" });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await confirm({
        title: "Confirm Delete",
        description: `Are you sure you want to delete ${selectedUser.email}? This action cannot be undone.`,
        confirmationText: "Delete",
        confirmationButtonProps: { variant: "contained", color: "error" },
      });

      if (selectedUser.id === "admin") {
        enqueueSnackbar("Cannot delete main admin", { variant: "warning" });
        return;
      }

      const userRef = doc(db, "users", selectedUser.id);
      await deleteDoc(userRef);
      enqueueSnackbar("User deleted", { variant: "success" });
      handleMenuClose();
    } catch (error) {
      if (error !== "cancel") {
        console.error("Error deleting user:", error);
        enqueueSnackbar("Failed to delete user", { variant: "error" });
      }
    }
  };

  const handleSwitchUser = async (user) => {
    const snackbarId = enqueueSnackbar(`Switching to ${user.email}...`, {
      variant: "info",
      persist: true,
    });

    try {
      await auth.signOut();
      await signInWithEmailAndPassword(auth, user.email, "defaultPassword");
      closeSnackbar(snackbarId);
      enqueueSnackbar(`Now viewing as ${user.email}`, { variant: "success" });
    } catch (error) {
      closeSnackbar(snackbarId);
      console.error("Error switching user:", error);
      enqueueSnackbar("Failed to switch user", { variant: "error" });
    }
  };

  const handleToggleUserStatus = async () => {
    if (!selectedUser) return;

    try {
      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, { disabled: !selectedUser.disabled });
      enqueueSnackbar(
        `User ${selectedUser.disabled ? "enabled" : "disabled"}`,
        { variant: "success" }
      );
      handleMenuClose();
    } catch (error) {
      console.error("Error toggling user status:", error);
      enqueueSnackbar("Failed to update user status", { variant: "error" });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card sx={{ mb: 3, borderRadius: { xs: 0, sm: 2 } }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              flexWrap="wrap"
              gap={2}
            >
              <Typography variant="h6" component="h2">
                User Management
              </Typography>

              <Box display="flex" gap={2}>
                <TextField
                  size="small"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200 }}
                />

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    size="small"
                  >
                    Refresh
                  </Button>
                </motion.div>
              </Box>
            </Box>

            {isRefreshing && <LinearProgress sx={{ mb: 1 }} />}

            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 500,
                borderRadius: 2,
                boxShadow: "none",
                border: "1px solid rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 200,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          hover
                          sx={{
                            opacity: user.disabled ? 0.7 : 1,
                            "&:hover": {
                              opacity: 1,
                            },
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Badge
                                overlap="circular"
                                anchorOrigin={{
                                  vertical: "bottom",
                                  horizontal: "right",
                                }}
                                badgeContent={
                                  user.isAdmin ? (
                                    <AdminPanelSettings
                                      color="primary"
                                      sx={{ fontSize: "1rem" }}
                                    />
                                  ) : null
                                }
                              >
                                <Avatar
                                  src={user.photoURL}
                                  sx={{
                                    mr: 1,
                                    bgcolor: user.disabled
                                      ? "grey.500"
                                      : "primary.main",
                                  }}
                                >
                                  {user.displayName.charAt(0).toUpperCase()}
                                </Avatar>
                              </Badge>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {user.displayName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Joined: {user.createdAt.toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <UserStatusChip user={user} />
                          </TableCell>
                          <TableCell>
                            <RoleDropdown
                              user={user}
                              onRoleChange={(role) =>
                                handleRoleChange(user.id, role)
                              }
                              disabled={user.id === "admin" || user.disabled}
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Switch to this account">
                                <IconButton
                                  onClick={() => handleSwitchUser(user)}
                                  disabled={
                                    user.id === "admin" || user.disabled
                                  }
                                  size="small"
                                >
                                  <SwitchAccount fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <IconButton
                                onClick={(e) => handleMenuOpen(e, user)}
                                size="small"
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{ textAlign: "center", py: 4 }}
                        >
                          <Typography color="text.secondary">
                            {searchTerm
                              ? "No matching users found"
                              : "No users found"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        TransitionComponent={motion.div}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <MenuItem
          onClick={() => handleSwitchUser(selectedUser)}
          disabled={selectedUser?.disabled}
        >
          <ListItemIcon>
            <SwitchAccount fontSize="small" />
          </ListItemIcon>
          <ListItemText>Switch to this account</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditUser(selectedUser)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleRoleChange(
              selectedUser?.id,
              selectedUser?.role === "admin" ? "user" : "admin"
            );
            handleMenuClose();
          }}
          disabled={selectedUser?.id === "admin"}
        >
          <ListItemIcon>
            {selectedUser?.role === "admin" ? (
              <SupervisedUserCircle fontSize="small" />
            ) : (
              <AdminPanelSettings fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedUser?.role === "admin"
              ? "Make Regular User"
              : "Make Admin"}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleToggleUserStatus}
          disabled={selectedUser?.id === "admin"}
        >
          <ListItemIcon>
            {selectedUser?.disabled ? (
              <PersonAdd fontSize="small" color="success" />
            ) : (
              <PersonRemove fontSize="small" color="warning" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedUser?.disabled ? "Enable User" : "Disable User"}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteUser}
          disabled={selectedUser?.id === "admin"}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: "error" }}>
            Delete User
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 400 }}>
            <TextField
              fullWidth
              label="Display Name"
              value={editUserData.displayName || ""}
              onChange={(e) =>
                setEditUserData({
                  ...editUserData,
                  displayName: e.target.value,
                })
              }
              margin="normal"
            />
            <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Status:
              </Typography>
              <Chip
                label={editUserData.disabled ? "Disabled" : "Active"}
                color={editUserData.disabled ? "error" : "success"}
                size="small"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <AdminChat
        open={showAdminChat}
        onClose={() => setShowAdminChat(false)}
        userData={userData}
      />
    </>
  );
};

export default AdminTools;
