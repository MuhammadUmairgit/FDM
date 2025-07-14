import React, { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Card,
  Switch,
  Form,
  Input,
  Button,
  Select,
  Space,
  Row,
  Col,
  Avatar,
  Divider,
  Alert,
  theme,
  Spin,
} from "antd";
import {
  BgColorsOutlined,
  BellOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  LockOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ThemeSwitcherDropdown from "../../context/ThemeSwitcher";

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { useToken } = theme;

const SettingsScreen = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appearance");
  const [form] = Form.useForm();

  const { data: userPreferences, isLoading } = useQuery(
    "userPreferences",
    async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            language: "en",
            timezone: "UTC",
            emailNotifications: true,
            pushNotifications: true,
            autoBackup: false,
            backupFrequency: "weekly",
            enableAnimations: true,
            compactMode: false,
          });
        }, 500);
      });
    }
  );

  const menuItems = [
    {
      key: "appearance",
      icon: <BgColorsOutlined />,
      label: "Appearance",
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "Notifications",
    },
    {
      key: "language",
      icon: <GlobalOutlined />,
      label: "Language",
    },
    {
      key: "security",
      icon: <SafetyCertificateOutlined />,
      label: "Security",
    },
    {
      key: "account",
      icon: <UserOutlined />,
      label: "Account",
    },
    {
      key: "backup",
      icon: <CloudUploadOutlined />,
      label: "Backup",
    },
    {
      key: "about",
      icon: <InfoCircleOutlined />,
      label: "About",
    },
  ];

  const getCurrentTabTitle = () => {
    return menuItems.find((item) => item.key === activeTab)?.label || "Settings";
  };

  const renderAppearanceSettings = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card title="Theme Preferences" bordered={false}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <div>
              <Text strong>Current Theme</Text>
              <br />
              <Text type="secondary">Customize the look and feel of the application</Text>
            </div>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <ThemeSwitcherDropdown />
          </Col>
        </Row>
      </Card>

      <Card title="Advanced Appearance Settings" bordered={false}>
        <Form layout="vertical" initialValues={userPreferences}>
          <Form.Item name="enableAnimations" valuePropName="checked">
            <Space>
              <Switch />
              <Text>Enable animations</Text>
            </Space>
          </Form.Item>
          
          <Form.Item name="compactMode" valuePropName="checked">
            <Space>
              <Switch />
              <Text>Compact mode</Text>
            </Space>
          </Form.Item>
          
          <Form.Item name="highContrast" valuePropName="checked">
            <Space>
              <Switch />
              <Text>High contrast mode</Text>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );

  const renderNotificationSettings = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card title="Notification Preferences" bordered={false}>
        <Form layout="vertical" initialValues={userPreferences}>
          <Form.Item name="emailNotifications" valuePropName="checked">
            <Space>
              <Switch />
              <div>
                <Text strong>Email Notifications</Text>
                <br />
                <Text type="secondary">Receive updates via email</Text>
              </div>
            </Space>
          </Form.Item>
          
          <Form.Item name="pushNotifications" valuePropName="checked">
            <Space>
              <Switch />
              <div>
                <Text strong>Push Notifications</Text>
                <br />
                <Text type="secondary">Browser push notifications</Text>
              </div>
            </Space>
          </Form.Item>
          
          <Form.Item name="inventoryAlerts" valuePropName="checked">
            <Space>
              <Switch />
              <div>
                <Text strong>Inventory Alerts</Text>
                <br />
                <Text type="secondary">Low stock and expiry warnings</Text>
              </div>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Notification Frequency" bordered={false}>
        <Form.Item label="Email Digest Frequency">
          <Select defaultValue="daily" style={{ width: 200 }}>
            <Option value="realtime">Real-time</Option>
            <Option value="hourly">Hourly</Option>
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
          </Select>
        </Form.Item>
      </Card>
    </Space>
  );

  const renderLanguageSettings = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card title="Language & Region" bordered={false}>
        <Form layout="vertical" initialValues={userPreferences}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="Language" name="language">
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Español</Option>
                  <Option value="fr">Français</Option>
                  <Option value="de">Deutsch</Option>
                  <Option value="ja">日本語</Option>
                  <Option value="zh">中文</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Timezone" name="timezone">
                <Select>
                  <Option value="UTC">UTC</Option>
                  <Option value="America/New_York">Eastern Time</Option>
                  <Option value="America/Los_Angeles">Pacific Time</Option>
                  <Option value="Europe/London">GMT</Option>
                  <Option value="Asia/Tokyo">Japan Time</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="Date Format">
            <Select defaultValue="MM/DD/YYYY">
              <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
              <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
              <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Currency">
            <Select defaultValue="USD">
              <Option value="USD">USD ($)</Option>
              <Option value="EUR">EUR (€)</Option>
              <Option value="GBP">GBP (£)</Option>
              <Option value="JPY">JPY (¥)</Option>
              <Option value="INR">INR (₹)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );

  const renderSecuritySettings = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card title="Security Preferences" bordered={false}>
        <Form layout="vertical">
          <Form.Item name="twoFactorEnabled" valuePropName="checked">
            <Space>
              <Switch />
              <div>
                <Text strong>Two-Factor Authentication</Text>
                <br />
                <Text type="secondary">Add an extra layer of security</Text>
              </div>
            </Space>
          </Form.Item>
          
          <Form.Item name="sessionTimeout" valuePropName="checked">
            <Space>
              <Switch />
              <div>
                <Text strong>Auto-logout</Text>
                <br />
                <Text type="secondary">Automatically sign out after inactivity</Text>
              </div>
            </Space>
          </Form.Item>
          
          <Divider />
          
          <Title level={5}>Change Password</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="Current Password">
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="New Password">
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button type="primary" icon={<LockOutlined />}>
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );

  const renderAccountSettings = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card title="Account Information" bordered={false}>
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item label="Display Name">
                <Input prefix={<UserOutlined />} defaultValue="John Doe" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Email Address">
                <Input prefix={<MailOutlined />} defaultValue="john@example.com" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="Bio">
            <Input.TextArea rows={3} placeholder="Tell us about yourself..." />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary">Save Changes</Button>
              <Button>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      <Card title="Danger Zone" bordered={false}>
        <Alert
          message="Account Deletion"
          description="Once you delete your account, there is no going back. Please be certain."
          type="warning"
          showIcon
          style={{ marginBottom: token.margin }}
        />
        <Button danger>Delete Account</Button>
      </Card>
    </Space>
  );

  const renderBackupSettings = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card title="Backup & Sync" bordered={false}>
        <Form layout="vertical" initialValues={userPreferences}>
          <Form.Item name="autoBackup" valuePropName="checked">
            <Space>
              <Switch />
              <div>
                <Text strong>Automatic Backup</Text>
                <br />
                <Text type="secondary">Automatically backup your data</Text>
              </div>
            </Space>
          </Form.Item>
          
          <Form.Item label="Backup Frequency" name="backupFrequency">
            <Select style={{ width: 200 }}>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
          </Form.Item>
          
          <Divider />
          
          <Title level={5}>Manual Backup</Title>
          <Paragraph type="secondary">
            Create a backup of all your inventory data, settings, and preferences.
          </Paragraph>
          
          <Space>
            <Button type="primary" icon={<CloudUploadOutlined />}>
              Create Backup
            </Button>
            <Button icon={<CloudUploadOutlined />}>
              Download Backup
            </Button>
          </Space>
        </Form>
      </Card>
    </Space>
  );

  const renderAboutSettings = () => (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card title="About InventoryPro" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Avatar size={64} style={{ backgroundColor: token.colorPrimary }}>
              IP
            </Avatar>
            <Title level={3} style={{ marginTop: token.marginMD }}>
              InventoryPro
            </Title>
            <Text type="secondary">Version 2.1.0</Text>
          </div>
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text strong>Release Date:</Text>
              <br />
              <Text type="secondary">December 2024</Text>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>License:</Text>
              <br />
              <Text type="secondary">MIT License</Text>
            </Col>
          </Row>
          
          <Paragraph>
            InventoryPro is a modern inventory management system designed to help 
            businesses track, manage, and optimize their inventory efficiently.
          </Paragraph>
          
          <Space wrap>
            <Button type="link">Privacy Policy</Button>
            <Button type="link">Terms of Service</Button>
            <Button type="link">Support</Button>
            <Button type="link">Documentation</Button>
          </Space>
        </Space>
      </Card>
    </Space>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "appearance":
        return renderAppearanceSettings();
      case "notifications":
        return renderNotificationSettings();
      case "language":
        return renderLanguageSettings();
      case "security":
        return renderSecuritySettings();
      case "account":
        return renderAccountSettings();
      case "backup":
        return renderBackupSettings();
      case "about":
        return renderAboutSettings();
      default:
        return renderAppearanceSettings();
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh" 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={280}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: token.paddingLG,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "center",
            gap: token.marginMD,
          }}
        >
          <Avatar style={{ backgroundColor: token.colorPrimary }}>
            <SettingOutlined />
          </Avatar>
          <Title level={4} style={{ margin: 0 }}>
            Settings
          </Title>
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
          onClick={({ key }) => setActiveTab(key)}
          style={{
            border: "none",
            height: "calc(100vh - 80px)",
          }}
        />
      </Sider>

      <Content
        style={{
          padding: token.paddingLG,
          background: token.colorBgLayout,
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: token.marginLG }}>
          <Title level={2}>{getCurrentTabTitle()}</Title>
          <Text type="secondary">
            Manage your {getCurrentTabTitle().toLowerCase()} preferences and settings
          </Text>
        </div>
        
        {renderActiveTab()}
      </Content>
    </Layout>
  );
};

export default SettingsScreen;
