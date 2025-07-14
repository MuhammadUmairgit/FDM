import React from 'react';
import { Input, theme } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { useToken } = theme;

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const { token } = useToken();
  
  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <Input
        placeholder="Search Items"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
        size="large"
        style={{
          borderRadius: token.borderRadius,
          fontSize: token.fontSize,
        }}
        allowClear
      />
    </div>
  );
};

export default SearchBar;