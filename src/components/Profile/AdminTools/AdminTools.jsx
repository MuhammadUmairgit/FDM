// src/pages/ProfileScreen/components/AdminTools/AdminTools.js
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Avatar,
  Tag,
  Dropdown,
  Typography,
  Spin,
  Modal,
  Form,
  Select,
  message,
  Badge,
  Tooltip,
  Popconfirm,
  Progress,
  Row,
  Col,
  theme,
} from "antd";
import {
  UserAddOutlined,
  MoreOutlined,
  DeleteOutlined,
  CrownOutlined,
  UserOutlined,
  SwapOutlined,
  SearchOutlined,
  EditOutlined,
  ReloadOutlined,
  UserDeleteOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
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
import { debounce } from "lodash";

const { Title, Text } = Typography;
const { useToken } = theme;
const { Option } = Select;

const ADMIN_CREDENTIALS = {
  email: "admin@inventory.com",
  password: "Admin@123",
};

const UserStatusTag = ({ user }) => {
  const { token } = useToken();
  
  if (user.id === "admin") {
    return (
      <Tag 
        icon={<SafetyCertificateOutlined />} 
        color="gold"
        style={{ borderRadius: token.borderRadius }}
      >
        Main Admin
      </Tag>
    );
  }
  if (user.disabled) {
    return (
      <Tag 
        icon={<ExclamationCircleOutlined />} 
        color="error"
        style={{ borderRadius: token.borderRadius }}
      >
        Disabled
      </Tag>
    );
  }
  return (
    <Tag 
      color="success"
      style={{ borderRadius: token.borderRadius }}
    >
      Active
    </Tag>
  );
};

const AdminTools = ({ userData }) => {
  const { token } = useToken();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [showAdminChat, setShowAdminChat] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState(null);

  // Load users from Firestore
  useEffect(() => {
    const usersQuery = query(collection(db, "users"));
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersList = [];
        snapshot.forEach((doc) => {
          const userData = doc.data();
          usersList.push({
            id: doc.id,
            ...userData,
            key: doc.id,
            createdAt: userData.createdAt?.toDate() || new Date(),
          });
        });
        setUsers(usersList);
        setLoading(false);
        setIsRefreshing(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        messageApi.error("Failed to load users");
        setLoading(false);
        setIsRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [messageApi]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Firestore will automatically trigger update through onSnapshot
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      if (!selectedUser) return;
      
      await updateDoc(doc(db, "users", selectedUser.id), {
        displayName: values.displayName,
        role: values.role,
      });
      
      messageApi.success("User updated successfully");
      setEditModalOpen(false);
      setSelectedUser(null);
      editForm.resetFields();
    } catch (error) {
      console.error("Error updating user:", error);
      messageApi.error("Failed to update user");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
      });
      messageApi.success("Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      messageApi.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      messageApi.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      messageApi.error("Failed to delete user");
    }
  };

  const handleSwitchUser = async (user) => {
    try {
      // Implementation for switching user account
      messageApi.info(`Switching to ${user.displayName}...`);
      // Add your user switching logic here
    } catch (error) {
      console.error("Error switching user:", error);
      messageApi.error("Failed to switch user");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        disabled: !currentStatus,
      });
      messageApi.success(`User ${currentStatus ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      console.error("Error toggling user status:", error);
      messageApi.error("Failed to update user status");
    }
  };

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    return users.filter(user =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Debounced search function
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  const getActionItems = (user) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit User',
      onClick: () => handleEditUser(user),
    },
    {
      key: 'switch',
      icon: <SwapOutlined />,
      label: 'Switch Account',
      onClick: () => handleSwitchUser(user),
      disabled: user.id === "admin" || user.disabled,
    },
    {
      key: 'toggle',
      icon: user.disabled ? <UserOutlined /> : <UserDeleteOutlined />,
      label: user.disabled ? 'Enable User' : 'Disable User',
      onClick: () => handleToggleUserStatus(user.id, user.disabled),
      disabled: user.id === "admin",
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete User',
      danger: true,
      disabled: user.id === "admin",
    },
  ];

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 250,
      render: (_, user) => (
        <Space>
          <Badge
            count={user.role === 'admin' ? <CrownOutlined style={{ color: token.colorPrimary }} /> : 0}
            offset={[-8, 8]}
          >
            <Avatar
              src={user.photoURL}
              style={{
                backgroundColor: user.disabled ? token.colorTextDisabled : token.colorPrimary,
              }}
            >
              {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </Badge>
          <div>
            <Text strong style={{ opacity: user.disabled ? 0.7 : 1 }}>
              {user.displayName || 'Unnamed User'}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: token.fontSizeXS }}>
              Joined: {user.createdAt?.toLocaleDateString()}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, user) => <UserStatusTag user={user} />,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (_, user) => (
        <Select
          value={user.role}
          style={{ width: '100%' }}
          onChange={(value) => handleRoleChange(user.id, value)}
          disabled={user.id === "admin" || user.disabled}
          size="small"
        >
          <Option value="user">User</Option>
          <Option value="admin">Admin</Option>
          <Option value="manager">Manager</Option>
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, user) => (
        <Space>
          <Tooltip title="Switch Account">
            <Button
              type="text"
              icon={<SwapOutlined />}
              onClick={() => handleSwitchUser(user)}
              disabled={user.id === "admin" || user.disabled}
              size="small"
            />
          </Tooltip>
          <Dropdown
            menu={{ 
              items: getActionItems(user),
              onClick: ({ key }) => {
                if (key === 'delete') {
                  Modal.confirm({
                    title: 'Delete User',
                    content: `Are you sure you want to delete ${user.displayName}? This action cannot be undone.`,
                    okText: 'Delete',
                    okType: 'danger',
                    onOk: () => handleDeleteUser(user.id),
                  });
                }
              }
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          title={
            <Space>
              <CrownOutlined style={{ color: token.colorPrimary }} />
              <Title level={4} style={{ margin: 0 }}>
                Admin Tools
              </Title>
            </Space>
          }
          extra={
            <Space>
              <Button
                icon={<MessageOutlined />}
                onClick={() => setShowAdminChat(!showAdminChat)}
                type={showAdminChat ? "primary" : "default"}
              >
                {showAdminChat ? "Hide" : "Show"} Chat
              </Button>
            </Space>
          }
          style={{ marginBottom: token.marginLG }}
        >
          {/* Controls */}
          <Row gutter={[16, 16]} style={{ marginBottom: token.marginMD }}>
            <Col xs={24} sm={16} md={18}>
              <Input
                placeholder="Search users by name or email..."
                prefix={<SearchOutlined />}
                onChange={(e) => debouncedSearch(e.target.value)}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isRefreshing}
                block
                size="large"
              >
                Refresh
              </Button>
            </Col>
          </Row>

          {/* Progress indicator */}
          {isRefreshing && (
            <Progress 
              percent={100} 
              status="active" 
              showInfo={false}
              style={{ marginBottom: token.marginMD }}
            />
          )}

          {/* Users Table */}
          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} users`,
            }}
            scroll={{ x: 800 }}
            locale={{
              emptyText: searchTerm 
                ? `No users found matching "${searchTerm}"` 
                : "No users found"
            }}
            rowClassName={(record) => 
              record.disabled ? 'disabled-row' : ''
            }
            style={{
              borderRadius: token.borderRadius,
            }}
          />
        </Card>

        {/* Admin Chat */}
        {showAdminChat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AdminChat />
          </motion.div>
        )}
      </motion.div>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
          editForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            label="Display Name"
            name="displayName"
            rules={[{ required: true, message: 'Please enter display name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .disabled-row {
          opacity: 0.7;
        }
        .disabled-row:hover {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default AdminTools;
