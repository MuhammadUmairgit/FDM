import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Typography,
  Space,
  Divider,
  Spin,
  Tag,
  Card,
  Row,
  Col,
  message,
  theme,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  TagOutlined,
  AppstoreOutlined,
  NumberOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  StarOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../Auth/AuthContext";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { useToken } = theme;

const AddItemModal = ({ open, onClose, onAddItem, isLoading }) => {
  const { token } = useToken();
  const { currentUser } = useAuth();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [userCategories, setUserCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Load user-specific categories
  const loadUserCategories = async () => {
    if (!currentUser) return;

    setIsLoadingCategories(true);
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setUserCategories(userDoc.data().categories || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      messageApi.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadUserCategories();
    }
  }, [open, currentUser]);

  const resetForm = () => {
    form.resetFields();
    setSelectedCategory("");
    setNewCategory("");
    setShowCategoryDropdown(false);
  };

  const handleSubmit = async (values) => {
    try {
      const itemData = {
        name: values.itemName,
        description: values.description || "",
        quantity: values.quantity || 1,
        price: values.price || 0,
        sellingPrice: values.sellingPrice || values.price || 0,
        location: values.location || "",
        category: selectedCategory || values.category || "",
        tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
        imageUrl: values.imageUrl || "",
        createdAt: new Date(),
        lastUpdated: new Date(),
        userId: currentUser?.uid,
      };

      await onAddItem(itemData);
      messageApi.success("Item added successfully!");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding item:", error);
      messageApi.error("Failed to add item. Please try again.");
    }
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) {
      messageApi.warning("Please enter a category name");
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        categories: arrayUnion(newCategory.trim())
      });
      
      setUserCategories(prev => [...prev, newCategory.trim()]);
      setSelectedCategory(newCategory.trim());
      setNewCategory("");
      setShowCategoryDropdown(false);
      messageApi.success("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      messageApi.error("Failed to add category");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const modalStyles = {
    borderRadius: token.borderRadiusLG,
    padding: 0,
  };

  const cardStyle = {
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    marginBottom: token.marginSM,
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: token.marginSM }}>
            <PlusOutlined style={{ color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0 }}>Add New Item</Title>
          </div>
        }
        open={open}
        onCancel={handleClose}
        footer={null}
        width={600}
        style={modalStyles}
        destroyOnClose
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                size="large"
              >
                <Row gutter={[16, 16]}>
                  {/* Item Name */}
                  <Col span={24}>
                    <Form.Item
                      label={
                        <Space>
                          <TagOutlined />
                          <Text strong>Item Name</Text>
                        </Space>
                      }
                      name="itemName"
                      rules={[
                        { required: true, message: 'Please enter item name' },
                        { min: 2, message: 'Item name must be at least 2 characters' }
                      ]}
                    >
                      <Input 
                        placeholder="Enter item name"
                        style={{ borderRadius: token.borderRadius }}
                      />
                    </Form.Item>
                  </Col>

                  {/* Description */}
                  <Col span={24}>
                    <Form.Item
                      label={
                        <Space>
                          <FileTextOutlined />
                          <Text strong>Description</Text>
                        </Space>
                      }
                      name="description"
                    >
                      <TextArea 
                        rows={3}
                        placeholder="Enter item description (optional)"
                        style={{ borderRadius: token.borderRadius }}
                      />
                    </Form.Item>
                  </Col>

                  {/* Quantity and Price Row */}
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          <NumberOutlined />
                          <Text strong>Quantity</Text>
                        </Space>
                      }
                      name="quantity"
                      initialValue={1}
                      rules={[{ required: true, message: 'Please enter quantity' }]}
                    >
                      <InputNumber 
                        min={0}
                        style={{ width: '100%', borderRadius: token.borderRadius }}
                        placeholder="0"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          <DollarOutlined />
                          <Text strong>Cost Price</Text>
                        </Space>
                      }
                      name="price"
                      initialValue={0}
                      rules={[{ required: true, message: 'Please enter price' }]}
                    >
                      <InputNumber 
                        min={0}
                        step={0.01}
                        style={{ width: '100%', borderRadius: token.borderRadius }}
                        placeholder="0.00"
                        prefix="₹"
                      />
                    </Form.Item>
                  </Col>

                  {/* Selling Price and Location Row */}
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          <StarOutlined />
                          <Text strong>Selling Price</Text>
                        </Space>
                      }
                      name="sellingPrice"
                      initialValue={0}
                    >
                      <InputNumber 
                        min={0}
                        step={0.01}
                        style={{ width: '100%', borderRadius: token.borderRadius }}
                        placeholder="0.00"
                        prefix="₹"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space>
                          <EnvironmentOutlined />
                          <Text strong>Location</Text>
                        </Space>
                      }
                      name="location"
                    >
                      <Input 
                        placeholder="Storage location"
                        style={{ borderRadius: token.borderRadius }}
                      />
                    </Form.Item>
                  </Col>

                  {/* Category Section */}
                  <Col span={24}>
                    <Form.Item
                      label={
                        <Space>
                          <AppstoreOutlined />
                          <Text strong>Category</Text>
                        </Space>
                      }
                    >
                      {!showCategoryDropdown ? (
                        <Space.Compact style={{ width: '100%' }}>
                          <Select
                            placeholder="Select category"
                            style={{ flex: 1, borderRadius: token.borderRadius }}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            loading={isLoadingCategories}
                            allowClear
                          >
                            {userCategories.map((category) => (
                              <Option key={category} value={category}>
                                {category}
                              </Option>
                            ))}
                          </Select>
                          <Button 
                            type="primary" 
                            onClick={() => setShowCategoryDropdown(true)}
                            icon={<PlusOutlined />}
                          >
                            New
                          </Button>
                        </Space.Compact>
                      ) : (
                        <Card size="small" style={cardStyle}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>Add New Category</Text>
                            <Space.Compact style={{ width: '100%' }}>
                              <Input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Enter new category"
                                onPressEnter={addNewCategory}
                                style={{ flex: 1 }}
                              />
                              <Button 
                                type="primary" 
                                onClick={addNewCategory}
                                loading={isLoadingCategories}
                              >
                                Add
                              </Button>
                              <Button 
                                onClick={() => setShowCategoryDropdown(false)}
                                icon={<CloseOutlined />}
                              />
                            </Space.Compact>
                          </Space>
                        </Card>
                      )}
                    </Form.Item>
                  </Col>

                  {/* Tags */}
                  <Col span={24}>
                    <Form.Item
                      label={
                        <Space>
                          <TagOutlined />
                          <Text strong>Tags</Text>
                        </Space>
                      }
                      name="tags"
                    >
                      <Input 
                        placeholder="electronics, fragile, gift (comma separated)"
                        style={{ borderRadius: token.borderRadius }}
                      />
                    </Form.Item>
                  </Col>

                  {/* Image URL */}
                  <Col span={24}>
                    <Form.Item
                      label={
                        <Space>
                          <PictureOutlined />
                          <Text strong>Image URL</Text>
                        </Space>
                      }
                      name="imageUrl"
                    >
                      <Input 
                        placeholder="https://example.com/image.jpg (optional)"
                        style={{ borderRadius: token.borderRadius }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                {/* Submit Button */}
                <Form.Item style={{ marginBottom: 0 }}>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={handleClose} size="large">
                      Cancel
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={isLoading}
                      size="large"
                      icon={!isLoading && <PlusOutlined />}
                      style={{ minWidth: 120 }}
                    >
                      {isLoading ? "Adding..." : "Add Item"}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </>
  );
};

export default AddItemModal;
