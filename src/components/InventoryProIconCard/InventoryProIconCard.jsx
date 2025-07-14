// InventoryProIconCard.jsx

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import BoltIcon from '@mui/icons-material/Bolt';
import StarIcon from '@mui/icons-material/Star';

const InventoryProIconCard = () => {
  return (
    <Card
      sx={{
        maxWidth: 300,
        p: 2,
        borderRadius: 3,
        boxShadow: 4,
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
        transition: '0.3s',
        '&:hover': {
          boxShadow: 8,
          backgroundColor: '#e3f2fd',
        },
      }}
    >
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <InventoryIcon sx={{ fontSize: 40, color: '#1976d2' }} />
        <BoltIcon sx={{ fontSize: 24, color: 'gold', ml: -1 }} />
        <StarIcon sx={{ fontSize: 24, color: 'orange', ml: -1 }} />
      </Box>
      <CardContent>
        <Typography variant="h6" fontWeight="bold">
          Inventory Pro
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Advanced stock management with premium features
        </Typography>
      </CardContent>
    </Card>
  );
};

export default InventoryProIconCard;
