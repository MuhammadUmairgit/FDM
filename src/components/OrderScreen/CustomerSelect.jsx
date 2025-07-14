// src/components/CustomerSelect.js
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Avatar,
  Chip,
  CircularProgress,
  Skeleton,
  useTheme
} from '@mui/material';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import PropTypes from 'prop-types';

const CustomerSelect = ({ selectedContact, setSelectedContact }) => {
  const theme = useTheme();
  
  const { data: contacts = [], isLoading, isError } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      try {
        const q = query(collection(db, 'contacts'), orderBy('name'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}` 
      : names[0][0];
  };

  const generateColor = (str) => {
    if (!str) return theme.palette.primary.main;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={56} sx={{ mt: 1 }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ color: 'error.main', p: 2 }}>
        <Typography>Failed to load customers. Please try again.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
        Customer Information
      </Typography>
      <Autocomplete
        options={contacts}
        getOptionLabel={(option) => option.name || ''}
        value={selectedContact}
        onChange={(_, newValue) => setSelectedContact(newValue)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Customer"
            placeholder="Search by name or phone..."
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.shape.borderRadius,
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box 
            component="li" 
            {...props}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <Avatar 
              sx={{ 
                mr: 2, 
                bgcolor: generateColor(option.name),
                color: theme.palette.getContrastText(generateColor(option.name)),
              }}
            >
              {getInitials(option.name)}
            </Avatar>
            <Box>
              <Typography fontWeight={500}>{option.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {option.phoneNumber || 'No phone number'}
              </Typography>
              {option.email && (
                <Typography variant="body2" color="text.secondary">
                  {option.email}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              avatar={
                <Avatar sx={{ bgcolor: generateColor(option.name) }}>
                  {getInitials(option.name)}
                </Avatar>
              }
              label={option.name}
              sx={{
                mr: 1,
                mt: 1,
                '& .MuiChip-avatar': {
                  color: theme.palette.getContrastText(generateColor(option.name)),
                },
              }}
            />
          ))
        }
        loading={isLoading}
        noOptionsText="No customers found. Try a different search."
        sx={{
          '& .MuiAutocomplete-popper': {
            boxShadow: theme.shadows[3],
          },
        }}
      />
    </Box>
  );
};

CustomerSelect.propTypes = {
  selectedContact: PropTypes.object,
  setSelectedContact: PropTypes.func.isRequired,
};

export default React.memo(CustomerSelect);