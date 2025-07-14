import React from 'react';
import './SearchBar.css';
import { useTheme } from '@mui/material';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const theme = useTheme();
  
  return (
    <div className={`search-container ${theme.palette.mode}`}>
      <i className="fas fa-search search-icon"></i>
      <input
        type="text"
        placeholder="Search Items"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`search-input ${theme.palette.mode}`}
      />
    </div>
  );
};

export default SearchBar;