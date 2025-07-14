// src/components/AuthPage/AuthPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Space,
  Alert,
  Switch,
  Row,
  Col,
  message,
  theme,
  Avatar,
  Tooltip,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  UserAddOutlined,
  CrownOutlined,
  InfoCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { auth, db } from "../../firebase/firebaseConfig";
import { useAuth } from "./AuthContext";

const { Title, Text, Paragraph } = Typography;
const { useToken } = theme;

const ADMIN_CREDENTIALS = {
  email: "admin@inventory.com",
  password: "Admin@123",
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { token } = useToken();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showAdminHint, setShowAdminHint] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        const userData = userDoc.data();

        if (userData?.role === "admin") {
          messageApi.success("Welcome back, Admin!");
          navigate("/dashboard");
        } else {
          messageApi.success(`Welcome back, ${userData?.displayName || "User"}!`);
          navigate("/");
        }
      } else {
        // Registration logic
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

        // Determine user role
        const isAdminEmail = values.email === ADMIN_CREDENTIALS.email;
        const role = isAdminEmail ? "admin" : "user";

        // Create user document
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: values.email,
          displayName: values.email.split("@")[0],
          role: role,
          createdAt: new Date(),
          categories: [],
        });

        if (isAdminEmail) {
          messageApi.success("Admin account created successfully!");
          navigate("/dashboard");
        } else {
          messageApi.success("Account created successfully!");
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = "An error occurred. Please try again.";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/email-already-in-use":
          errorMessage = "Email is already registered.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }
      
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    form.resetFields();
    setShowAdminHint(false);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setShowAdminHint(!isLogin && email === ADMIN_CREDENTIALS.email);
  };

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #6E45E2 0%, #88D3CE 100%)",
    padding: token.padding,
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 400,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    border: "none",
  };

  const avatarStyle = {
    backgroundColor: token.colorPrimary,
    marginBottom: token.marginLG,
  };

  return (
    <>
      {contextHolder}
      <div style={containerStyle}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card style={cardStyle}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Space direction="vertical" size="large" style={{ width: "100%", textAlign: "center" }}>
                {/* Header */}
                <div>
                  <Avatar 
                    size={64} 
                    style={avatarStyle}
                    icon={isLogin ? <LoginOutlined /> : <UserAddOutlined />}
                  />
                  <Title level={2} style={{ margin: 0, color: token.colorText }}>
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </Title>
                  <Text type="secondary">
                    {isLogin 
                      ? "Sign in to your inventory account" 
                      : "Join our inventory management system"
                    }
                  </Text>
                </div>

                {/* Admin Hint */}
                <AnimatePresence>
                  {showAdminHint && !isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert
                        message="Admin Account"
                        description="Registering with admin email will create an admin account with full privileges."
                        type="info"
                        icon={<CrownOutlined />}
                        showIcon
                        style={{ textAlign: "left" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  requiredMark={false}
                  size="large"
                  style={{ width: "100%" }}
                >
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: "Please enter your email!" },
                        { type: "email", message: "Please enter a valid email!" }
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined style={{ color: token.colorTextSecondary }} />}
                        placeholder="Email address"
                        onChange={handleEmailChange}
                        style={{ borderRadius: token.borderRadius }}
                      />
                    </Form.Item>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Form.Item
                      name="password"
                      rules={[
                        { required: true, message: "Please enter your password!" },
                        isLogin ? {} : { min: 6, message: "Password must be at least 6 characters!" }
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
                        placeholder="Password"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        style={{ borderRadius: token.borderRadius }}
                      />
                    </Form.Item>
                  </motion.div>

                  {/* Admin Demo Credentials */}
                  {isLogin && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <Alert
                        message="Demo Credentials"
                        description={
                          <div>
                            <Paragraph style={{ margin: 0, fontSize: token.fontSizeSM }}>
                              <strong>Admin:</strong> {ADMIN_CREDENTIALS.email} / {ADMIN_CREDENTIALS.password}
                            </Paragraph>
                          </div>
                        }
                        type="info"
                        icon={<InfoCircleOutlined />}
                        showIcon
                        style={{ marginBottom: token.marginMD, textAlign: "left" }}
                      />
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                        icon={!loading && (isLogin ? <LoginOutlined /> : <UserAddOutlined />)}
                        style={{
                          borderRadius: token.borderRadius,
                          height: 48,
                          fontSize: token.fontSizeLG,
                          fontWeight: 600,
                        }}
                      >
                        {loading 
                          ? (isLogin ? "Signing In..." : "Creating Account...") 
                          : (isLogin ? "Sign In" : "Create Account")
                        }
                      </Button>
                    </Form.Item>
                  </motion.div>
                </Form>

                {/* Toggle Auth Mode */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <Divider>
                    <Text type="secondary">OR</Text>
                  </Divider>
                  
                  <Space direction="vertical" align="center">
                    <Text type="secondary">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </Text>
                    <Button 
                      type="link" 
                      onClick={toggleAuthMode}
                      style={{ 
                        fontWeight: 600,
                        fontSize: token.fontSize,
                        padding: 0,
                        height: "auto",
                      }}
                    >
                      {isLogin ? "Create an account" : "Sign in instead"}
                    </Button>
                  </Space>
                </motion.div>
              </Space>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AuthPage;
