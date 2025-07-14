// src/components/AuthPage/AuthPage.jsx
import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Zoom,
  Paper,
  Avatar,
  Collapse,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  Info,
  ArrowForward,
} from "@mui/icons-material";
import { auth, db } from "../../firebase/firebaseConfig";
import { useAuth } from "./AuthContext";

const ADMIN_CREDENTIALS = {
  email: "admin@inventory.com",
  password: "Admin@123",
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [showAdminHint, setShowAdminHint] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        const userData = userDoc.data();

        if (userData?.role === "admin") {
          showSnackbar("Welcome back, Admin!", "success");
          navigate("/dashboard");
        } else {
          showSnackbar(
            `Welcome back, ${userData?.displayName || "User"}!`,
            "success"
          );
          navigate("/");
        }
      } else {
        // Registration logic
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Set user data in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          displayName: email.split("@")[0], // Default to email prefix as name
          role: email === ADMIN_CREDENTIALS.email ? "admin" : "user",
          createdAt: new Date(),
          disabled: false,
        });

        // Create a personal inventory collection for the user
        await setDoc(doc(db, "userInventories", userCredential.user.uid), {
          userId: userCredential.user.uid,
          createdAt: new Date(),
        });

        showSnackbar(
          email === ADMIN_CREDENTIALS.email
            ? "Admin account created successfully!"
            : "Account created successfully!",
          "success"
        );
        navigate("/");
      }
    } catch (error) {
      let errorMessage = "An error occurred";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "User not found. Would you like to register instead?";
          setIsLogin(false);
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/email-already-in-use":
          errorMessage = "Email already in use. Please login instead.";
          setIsLogin(true);
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setShowAdminHint(false);
  };

  const isAdminEmail = email === ADMIN_CREDENTIALS.email;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        p: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
        style={{
          position: "absolute",
          top: -100,
          left: -100,
        }}
      >
        <AdminPanelSettings sx={{ fontSize: 300, color: "primary.main" }} />
      </motion.div> */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 450,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            position: "relative",
            zIndex: 1,
            overflow: "visible",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 60,
                      height: 60,
                      mb: 2,
                    }}
                  >
                    {isLogin ? (
                      <LoginIcon fontSize="large" />
                    ) : (
                      <PersonAddIcon fontSize="large" />
                    )}
                  </Avatar>
                </motion.div>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    textAlign: "center",
                    color: "primary.main",
                  }}
                >
                  {isLogin ? "Welcome Back" : "Create Account"}
                  {isAdminEmail && (
                    <AdminIcon
                      color="primary"
                      sx={{ ml: 1, verticalAlign: "middle" }}
                    />
                  )}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {isLogin
                    ? "Sign in to continue to your account"
                    : "Get started with your new account"}
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value === ADMIN_CREDENTIALS.email) {
                        setShowAdminHint(true);
                      } else {
                        setShowAdminHint(false);
                      }
                    }}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </motion.div>

                <Collapse in={showAdminHint && !isLogin}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                      borderRadius: 2,
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Info sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Registering with admin email will create an admin
                        account
                      </Typography>
                    </Box>
                  </Paper>
                </Collapse>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    endIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <ArrowForward />
                      )
                    }
                    sx={{
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    {isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                <Box textAlign="center">
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, color: "text.secondary" }}
                  >
                    {isLogin
                      ? "Don't have an account?"
                      : "Already have an account?"}
                  </Typography>
                  <Button
                    onClick={toggleAuthMode}
                    sx={{
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    {isLogin ? "Create an account" : "Sign in instead"}
                  </Button>
                </Box>
              </motion.div>
            </CardContent>
          </motion.div>
        </Card>
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Zoom in={snackbar.open}>
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Zoom>
      </Snackbar>
    </Box>
  );
};

export default AuthPage;
