import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Space,
  Dropdown,
  Button,
  Divider,
  Badge,
  theme,
  Grid,
  Tooltip,
} from "antd";
import {
  DashboardOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  SettingOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  GlobalOutlined,
  LockOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const AnimatedDrawer = ({ children }) => {
  const { token } = useToken();
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);

  // Responsive settings
  const isMobile = !screens.md;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return unsubscribe;
  }, []);

  // Set selected menu item based on current route
  useEffect(() => {
    const path = location.pathname;
    let key = "";
    
    if (path === "/") key = "home";
    else if (path === "/dashboard") key = "dashboard";
    else if (path === "/orders") key = "orders";
    else if (path === "/contacts") key = "contacts";
    else if (path === "/analytics") key = "analytics";
    else if (path.startsWith("/settings")) {
      key = path.replace("/settings", "settings") || "settings";
      setOpenKeys(["settings"]);
    }
    
    setSelectedKeys([key]);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleMenuClick = ({ key }) => {
    const routes = {
      home: "/",
      dashboard: "/dashboard",
      orders: "/orders",
      contacts: "/contacts",
      analytics: "/analytics",
      settings: "/settings",
      "settings/appearance": "/settings/appearance",
      "settings/language": "/settings/language",
      "settings/security": "/settings/security",
      "settings/backup": "/settings/backup",
    };

    if (routes[key]) {
      navigate(routes[key]);
    }

    // Close mobile drawer after navigation
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Home",
    },
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Orders",
    },
    {
      key: "contacts",
      icon: <TeamOutlined />,
      label: "Contacts",
    },
    {
      key: "analytics",
      icon: <BarChartOutlined />,
      label: "Analytics",
    },
    {
      type: "divider",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      children: [
        {
          key: "settings/appearance",
          icon: <UserOutlined />,
          label: "Appearance",
        },
        {
          key: "settings/language",
          icon: <GlobalOutlined />,
          label: "Language",
        },
        {
          key: "settings/security",
          icon: <LockOutlined />,
          label: "Security",
        },
        {
          key: "settings/backup",
          icon: <CloudUploadOutlined />,
          label: "Backup",
        },
      ],
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "Notifications",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const siderStyle = {
    background: token.colorBgContainer,
    borderRight: `1px solid ${token.colorBorderSecondary}`,
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
  };

  const contentStyle = {
    marginLeft: isMobile ? 0 : (collapsed ? 80 : 256),
    minHeight: "100vh",
    background: token.colorBgLayout,
    transition: "margin-left 0.2s",
  };

  const headerStyle = {
    background: token.colorBgContainer,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    padding: `0 ${token.paddingLG}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    position: "sticky",
    top: 0,
    zIndex: 999,
  };

  const userPanelStyle = {
    padding: token.paddingMD,
    borderTop: `1px solid ${token.colorBorderSecondary}`,
    background: token.colorBgElevated,
  };

  const UserPanel = () => (
    <div style={userPanelStyle}>
      <Dropdown 
        menu={{ 
          items: userMenuItems.map(item => ({
            ...item,
            onClick: item.onClick || (() => {})
          }))
        }} 
        trigger={["click"]}
        placement="topLeft"
      >
        <div style={{ cursor: "pointer" }}>
          <Space>
            <Avatar 
              size={collapsed ? 32 : 40}
              style={{ 
                backgroundColor: token.colorPrimary,
                flexShrink: 0,
              }}
              icon={<UserOutlined />}
            />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                style={{ overflow: "hidden" }}
              >
                <Space direction="vertical" size={0} style={{ width: "100%" }}>
                  <Text strong style={{ fontSize: token.fontSizeSM }}>
                    {userData?.displayName || "User"}
                  </Text>
                  <Text 
                    type="secondary" 
                    style={{ 
                      fontSize: token.fontSizeXS,
                      lineHeight: 1.2,
                    }}
                  >
                    {userData?.role === "admin" ? "Administrator" : "User"}
                  </Text>
                </Space>
              </motion.div>
            )}
          </Space>
        </div>
      </Dropdown>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          style={siderStyle}
          collapsed={collapsed}
          collapsible
          trigger={null}
          width={256}
          collapsedWidth={80}
          theme="light"
        >
          {/* Logo/Brand Section */}
          <div style={{ 
            padding: token.paddingMD,
            textAlign: "center",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {collapsed ? (
                <Title level={3} style={{ margin: 0, color: token.colorPrimary }}>
                  I
                </Title>
              ) : (
                <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>
                  Inventory Pro
                </Title>
              )}
            </motion.div>
          </div>

          {/* Navigation Menu */}
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onClick={handleMenuClick}
            items={menuItems}
            style={{ 
              border: "none",
              height: "calc(100vh - 64px - 80px)",
              overflowY: "auto",
            }}
          />

          {/* User Panel */}
          <UserPanel />
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Layout.Sider
          style={{
            ...siderStyle,
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s ease",
          }}
          width={256}
          theme="light"
        >
          {/* Mobile Header */}
          <div style={{
            padding: token.paddingMD,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>
              Inventory Pro
            </Title>
            <Button 
              type="text" 
              icon={<MenuFoldOutlined />} 
              onClick={() => setMobileOpen(false)}
            />
          </div>

          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onClick={handleMenuClick}
            items={menuItems}
            style={{ 
              border: "none",
              height: "calc(100vh - 64px - 80px)",
              overflowY: "auto",
            }}
          />

          <UserPanel />
        </Layout.Sider>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: 999,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <Layout style={contentStyle}>
        {/* Header for desktop toggle and mobile menu */}
        <div style={headerStyle}>
          <Space>
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setMobileOpen(true)}
                size="large"
              />
            ) : (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                size="large"
              />
            )}
          </Space>

          <Space>
            <Tooltip title="Notifications">
              <Badge count={0} size="small">
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  size="large"
                />
              </Badge>
            </Tooltip>
          </Space>
        </div>

        {/* Page Content */}
        <Content style={{ 
          padding: token.paddingLG,
          background: token.colorBgLayout,
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default React.memo(AnimatedDrawer);
