import { Card, Typography, Row, Col, Space, theme } from "antd";
import { 
  DatabaseOutlined, 
  DollarOutlined, 
  BarChartOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { useToken } = theme;

export const StatsCards = ({ totalItems, totalValue, categories }) => {
  const { token } = useToken();

  const cardStyle = {
    borderRadius: token.borderRadiusLG,
    height: "100%",
    border: `1px solid ${token.colorBorderSecondary}`,
  };

  const iconBoxStyle = {
    backgroundColor: token.colorPrimaryBg,
    padding: token.paddingMD,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
  };

  const successIconBoxStyle = {
    ...iconBoxStyle,
    backgroundColor: token.colorSuccessBg,
  };

  const secondaryIconBoxStyle = {
    ...iconBoxStyle,
    backgroundColor: token.colorInfoBg,
  };

  return (
    <Row gutter={[24, 24]}>
      {/* First Card - Total Items */}
      <Col xs={24} md={8}>
        <Card style={cardStyle} bodyStyle={{ padding: token.paddingLG }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <Space direction="vertical" size="small">
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Total Items
              </Text>
              <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                {totalItems}
              </Title>
            </Space>
            <div style={iconBoxStyle}>
              <DatabaseOutlined 
                style={{ 
                  fontSize: 24, 
                  color: token.colorPrimary 
                }} 
              />
            </div>
          </div>
        </Card>
      </Col>

      {/* Second Card - Total Value */}
      <Col xs={24} md={8}>
        <Card style={cardStyle} bodyStyle={{ padding: token.paddingLG }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <Space direction="vertical" size="small">
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Total Value
              </Text>
              <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                ₹{totalValue?.toFixed(2) || '0.00'}
              </Title>
            </Space>
            <div style={successIconBoxStyle}>
              <DollarOutlined 
                style={{ 
                  fontSize: 24, 
                  color: token.colorSuccess 
                }} 
              />
            </div>
          </div>
        </Card>
      </Col>

      {/* Third Card - Categories */}
      <Col xs={24} md={8}>
        <Card style={cardStyle} bodyStyle={{ padding: token.paddingLG }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <Space direction="vertical" size="small">
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Categories
              </Text>
              <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
                {categories}
              </Title>
            </Space>
            <div style={secondaryIconBoxStyle}>
              <BarChartOutlined 
                style={{ 
                  fontSize: 24, 
                  color: token.colorInfo 
                }} 
              />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};
