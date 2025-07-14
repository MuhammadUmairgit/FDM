import React from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  theme,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Text, Title } = Typography;
const { useToken } = theme;

const ItemCard = ({ item }) => {
  const navigate = useNavigate();
  const { token } = useToken();

  const handlePress = () => {
    navigate(`/item/${item.id}`);
  };

  if (!item) {
    return (
      <Card 
        loading 
        style={{ 
          marginBottom: token.margin,
          borderRadius: token.borderRadiusLG,
        }}
      />
    );
  }

  const imageUrl = item.images?.[0] || item.imageUrl || "/api/placeholder/300/200";
  const isLowStock = item.quantity <= (item.lowStockThreshold || 10);
  const isOutOfStock = item.quantity === 0;

  return (
    <motion.div
      whileHover={{ 
        y: -4,
        boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
      }}
      transition={{ duration: 0.3 }}
    >
      <Card
        hoverable
        cover={
          <div style={{ 
            height: 200, 
            overflow: 'hidden',
            position: 'relative',
          }}>
            <img
              alt={item.title || item.name}
              src={imageUrl}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
              onError={(e) => {
                e.target.src = "/api/placeholder/300/200";
              }}
            />
            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${token.colorPrimary}, ${token.colorSuccess})`,
                opacity: 0.8,
              }}
            />
            {/* Stock status badges */}
            {(isOutOfStock || isLowStock) && (
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <Tag color={isOutOfStock ? 'red' : 'orange'}>
                  {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                </Tag>
              </div>
            )}
          </div>
        }
        style={{
          marginBottom: token.margin,
          borderRadius: token.borderRadiusLG,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
        onClick={handlePress}
        bodyStyle={{ padding: token.paddingMD }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* Title */}
          <Tooltip title={item.title || item.name}>
            <Title 
              level={5} 
              ellipsis 
              style={{ 
                margin: 0,
                transition: 'color 0.3s ease',
              }}
              className="title-text"
            >
              {item.title || item.name}
            </Title>
          </Tooltip>

          {/* Description */}
          {item.description && (
            <Text 
              type="secondary" 
              ellipsis={{ rows: 2 }}
              style={{ fontSize: token.fontSizeSM }}
            >
              {item.description}
            </Text>
          )}

          {/* Price and Quantity */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: token.marginXS,
          }}>
            <div>
              <Text strong style={{ fontSize: token.fontSizeLG, color: token.colorPrimary }}>
                ₹{item.price?.toLocaleString() || 0}
              </Text>
              {item.cost && (
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: token.fontSizeSM,
                    marginLeft: token.marginXS,
                  }}
                >
                  Cost: ₹{item.cost}
                </Text>
              )}
            </div>
            
            <Space>
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Qty: {item.quantity || 0}
              </Text>
              {item.unit && (
                <Tag color="blue" style={{ fontSize: token.fontSizeXS }}>
                  {item.unit}
                </Tag>
              )}
            </Space>
          </div>

          {/* Category */}
          {item.category && (
            <div style={{ marginTop: token.marginXS }}>
              <Tag color="purple" style={{ fontSize: token.fontSizeXS }}>
                {item.category}
              </Tag>
            </div>
          )}

          {/* Additional Info */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: token.marginXS,
          }}>
            {item.barcode && (
              <Text 
                type="secondary" 
                style={{ fontSize: token.fontSizeXS }}
              >
                #{item.barcode}
              </Text>
            )}
            
            {item.lastUpdated && (
              <Text 
                type="secondary" 
                style={{ fontSize: token.fontSizeXS }}
              >
                Updated: {new Date(item.lastUpdated.seconds * 1000).toLocaleDateString()}
              </Text>
            )}
          </div>
        </Space>
      </Card>
    </motion.div>
  );
};

export default ItemCard;
