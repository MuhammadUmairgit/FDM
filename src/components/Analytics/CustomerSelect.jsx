// src/components/CustomerSelect/CustomerSelect.js
import { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const CustomerSelect = ({
  selectedContact,
  setSelectedContact,
  isMobile,
  label = "Select Customer",
  clearable = false,
}) => {
  const theme = useTheme();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "contacts"));
        const contactsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContacts(contactsData);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <Autocomplete
      options={contacts}
      getOptionLabel={(option) => option.name || "Unnamed Contact"}
      value={selectedContact}
      onChange={(_, newValue) => setSelectedContact(newValue)}
      loading={loading}
      disableClearable={!clearable}
      sx={{ minWidth: isMobile ? "100%" : 250 }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box display="flex" alignItems="center" gap={1} width="100%">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {option.name ? (
                option.name.charAt(0).toUpperCase()
              ) : (
                <PersonIcon />
              )}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body1" fontWeight={500}>
                {option.name || "Unnamed Contact"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.phone || "No phone"}
              </Typography>
            </Box>
            {option.ordersCount > 0 && (
              <Chip
                label={`${option.ordersCount} orders`}
                size="small"
                sx={{
                  bgcolor: theme.palette.success.light,
                  color: theme.palette.success.dark,
                }}
              />
            )}
          </Box>
        </Box>
      )}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  );
};

export default CustomerSelect;
