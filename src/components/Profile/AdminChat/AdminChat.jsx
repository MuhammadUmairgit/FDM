// src/pages/ProfileScreen/components/AdminChat/AdminChat.js
import  {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Paper,
  TextField,
  InputAdornment,
  Avatar,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Chip,
  Snackbar,
  Alert,
  useMediaQuery,
} from "@mui/material";
import {
  Send,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Search,
  EmojiEmotions,
  Close,
  AttachFile,
  Group,
  Check,
  MoreVert,
  Reply,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Picker from "emoji-picker-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useTheme } from "@mui/material/styles";
import {
  collection,
  query,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../../firebase/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const AdminChat = ({ userData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isAdmin = userData?.role === "admin" || userData?.isAdmin;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Check if URL is an image
  const isImageUrl = (url) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  };

  // Fetch messages from Firestore
  useEffect(() => {
    if (!isAdmin || !isOpen) return;

    setIsLoading(true);
    const q = query(collection(db, "adminChat"), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
      setIsLoading(false);

      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    return () => unsubscribe();
  }, [isAdmin, isOpen]);

  // Auto-scroll when chat is opened or messages change
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = useCallback(async () => {
    if (!userData?.uid) {
      showSnackbar("User not authenticated", "error");
      return;
    }

    if (!newMessage.trim() && !isUploading) {
      showSnackbar("Cannot send empty message", "warning");
      return;
    }

    try {
      const messageId = uuidv4();
      const messageData = {
        id: messageId,
        text: newMessage,
        senderId: userData.uid,
        senderEmail: userData.email,
        senderName: userData.displayName || userData.email,
        senderPhoto: userData.photoURL || null,
        timestamp: serverTimestamp(),
        ...(replyingTo && { replyTo: replyingTo }),
        isEdited: false,
      };

      await addDoc(collection(db, "adminChat"), messageData);
      setNewMessage("");
      setReplyingTo(null);
      setShowEmojiPicker(false);
      setIsUploading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      showSnackbar("Failed to send message. Please try again.", "error");
    }
  }, [newMessage, userData, replyingTo, isUploading]);

  const handleEditMessage = async (messageId, newText) => {
    try {
      const messageRef = doc(db, "adminChat", messageId);
      await updateDoc(messageRef, {
        text: newText,
        isEdited: true,
      });
      showSnackbar("Message updated", "success");
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error editing message:", error);
      showSnackbar("Failed to edit message", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showSnackbar("File size too large (max 10MB)", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const fileId = uuidv4();
    const storageRef = ref(storage, `chat_attachments/${fileId}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        setIsUploading(false);
        showSnackbar("Failed to upload file", "error");
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setNewMessage(downloadURL);
          showSnackbar("File uploaded - click send to share", "success");
        } catch (error) {
          console.error("Error getting download URL:", error);
          setIsUploading(false);
          showSnackbar("Failed to get file URL", "error");
        }
      }
    );
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(
      (message) =>
        (message.text &&
          message.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (message.senderName &&
          message.senderName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [messages, searchQuery]);

  const handleMessageClick = (message, event) => {
    if (event.target.closest("button") || event.target.closest("a")) return;

    setSelectedMessage(selectedMessage?.id === message.id ? null : message);
  };

  const renderMessageContent = (message) => {
    if (message.text?.startsWith("http")) {
      if (isImageUrl(message.text)) {
        return (
          <Box sx={{ maxWidth: "100%", mt: 1 }}>
            <img
              src={message.text}
              alt="Attachment"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: theme.shape.borderRadius,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
          </Box>
        );
      }
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Attachment:
          </Typography>
          <a
            href={message.text}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: theme.palette.primary.main,
              textDecoration: "underline",
              wordBreak: "break-all",
            }}
          >
            {message.text}
          </a>
        </Box>
      );
    }
    return <Typography sx={{ lineHeight: 1.5 }}>{message.text}</Typography>;
  };

  const renderMessage = (message) => {
    const isCurrentUser = message.senderId === userData?.uid;
    const isReply = message.replyTo;
    const repliedMessage = isReply
      ? messages.find((m) => m.id === message.replyTo.id)
      : null;

    return (
      <Box
        key={message.id}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: isCurrentUser ? "flex-end" : "flex-start",
          mb: 2,
          px: isMobile ? 1 : 2,
          position: "relative",
        }}
        onClick={(e) => handleMessageClick(message, e)}
      >
        {/* Sender info */}
        {!isCurrentUser && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Avatar
              src={message.senderPhoto}
              sx={{
                width: 24,
                height: 24,
                mr: 1,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {message.senderName?.charAt(0) || message.senderEmail?.charAt(0)}
            </Avatar>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.secondary,
              }}
            >
              {message.senderName || message.senderEmail}
            </Typography>
          </Box>
        )}

        {/* Reply preview */}
        {isReply && repliedMessage && (
          <Box
            sx={{
              maxWidth: "80%",
              mb: 0.5,
              p: 1,
              borderRadius: 1,
              bgcolor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[800]
                  : theme.palette.grey[200],
              borderLeft: `3px solid ${theme.palette.primary.main}`,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {repliedMessage.senderName || repliedMessage.senderEmail}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                color: theme.palette.text.secondary,
              }}
            >
              {repliedMessage.text?.length > 50
                ? `${repliedMessage.text.substring(0, 50)}...`
                : repliedMessage.text || "Attachment"}
            </Typography>
          </Box>
        )}

        {/* Message bubble */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            maxWidth: "80%",
            backgroundColor: isCurrentUser
              ? theme.palette.primary.main
              : theme.palette.mode === "dark"
              ? theme.palette.grey[800]
              : theme.palette.grey[200],
            color: isCurrentUser
              ? theme.palette.primary.contrastText
              : theme.palette.text.primary,
            borderRadius: isCurrentUser
              ? "18px 4px 18px 18px"
              : "4px 18px 18px 18px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            position: "relative",
            transition: "transform 0.2s",
            transform:
              selectedMessage?.id === message.id ? "scale(1.02)" : "scale(1)",
            boxShadow:
              selectedMessage?.id === message.id ? theme.shadows[2] : "none",
          }}
        >
          {renderMessageContent(message)}

          {/* Message time and status */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mt: 1,
            }}
          >
            {message.isEdited && (
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                  mr: 0.5,
                  color: isCurrentUser
                    ? "rgba(255,255,255,0.7)"
                    : theme.palette.text.secondary,
                  fontStyle: "italic",
                }}
              >
                edited
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                color: isCurrentUser
                  ? "rgba(255,255,255,0.7)"
                  : theme.palette.text.secondary,
              }}
            >
              {message.timestamp?.toDate
                ? formatDistanceToNow(message.timestamp.toDate(), {
                    addSuffix: true,
                  })
                : "Just now"}
            </Typography>
            {isCurrentUser && (
              <Box sx={{ ml: 0.5 }}>
                <Check
                  fontSize="small"
                  sx={{
                    opacity: 0.7,
                    color: isCurrentUser
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.secondary,
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Message actions */}
          {selectedMessage?.id === message.id && (
            <Box
              sx={{
                position: "absolute",
                top: -30,
                right: isCurrentUser ? 0 : "unset",
                left: isCurrentUser ? "unset" : 0,
                display: "flex",
                bgcolor:
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[800]
                    : theme.palette.grey[200],
                borderRadius: 2,
                p: 0.5,
                boxShadow: theme.shadows[1],
              }}
            >
              <Tooltip title="Reply">
                <IconButton
                  size="small"
                  onClick={() => {
                    setReplyingTo({
                      id: message.id,
                      sender: message.senderName || message.senderEmail,
                      text: message.text,
                    });
                    setSelectedMessage(null);
                  }}
                >
                  <Reply fontSize="small" />
                </IconButton>
              </Tooltip>
              {isCurrentUser && (
                <Tooltip title="More options">
                  <IconButton size="small">
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  if (!isAdmin) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
          overflow: "hidden",
          bgcolor:
            theme.palette.mode === "dark"
              ? theme.palette.grey[900]
              : theme.palette.background.paper,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Chat Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              cursor: "pointer",
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Group sx={{ mr: 1 }} />
              <Typography variant="h6">Admin Team Chat</Typography>
              <Chip
                label="Live"
                color="error"
                size="small"
                sx={{
                  ml: 2,
                  color: "white",
                  bgcolor: theme.palette.error.main,
                }}
              />
            </Box>
            <IconButton sx={{ color: theme.palette.primary.contrastText }}>
              {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Box>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    height: isMobile ? "70vh" : 500,
                    display: "flex",
                    flexDirection: "column",
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? theme.palette.grey[900]
                        : theme.palette.background.paper,
                  }}
                >
                  {/* Search Bar */}
                  <Box
                    sx={{
                      p: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? theme.palette.grey[800]
                          : theme.palette.grey[100],
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Search messages..."
                      size="small"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setSearchQuery("")}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? theme.palette.grey[700]
                              : theme.palette.background.paper,
                        },
                      }}
                    />
                  </Box>

                  {/* Chat Messages */}
                  <Box
                    ref={chatContainerRef}
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      p: 2,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? theme.palette.grey[900]
                          : theme.palette.grey[50],
                      position: "relative",
                    }}
                  >
                    {isLoading ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : filteredMessages.length > 0 ? (
                      <>
                        {filteredMessages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                          textAlign: "center",
                          p: 3,
                        }}
                      >
                        <Group
                          sx={{
                            fontSize: 60,
                            color: theme.palette.grey[500],
                            mb: 2,
                          }}
                        />
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {searchQuery
                            ? "No messages match your search"
                            : "No messages yet"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ opacity: 0.7 }}
                        >
                          {searchQuery
                            ? "Try a different search term"
                            : "Start a conversation with your team"}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Upload Progress */}
                  {isUploading && (
                    <Box
                      sx={{
                        px: 2,
                        pt: 1,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? theme.palette.grey[800]
                            : theme.palette.grey[100],
                      }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        color="secondary"
                      />
                      <Typography
                        variant="caption"
                        display="block"
                        textAlign="center"
                        sx={{
                          color: theme.palette.text.secondary,
                        }}
                      >
                        Uploading: {uploadProgress}%
                      </Typography>
                    </Box>
                  )}

                  {/* Reply Preview */}
                  {replyingTo && (
                    <Box
                      sx={{
                        p: 1,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? theme.palette.grey[800]
                            : theme.palette.grey[100],
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          Replying to {replyingTo.sender}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: isMobile ? 150 : 300,
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {replyingTo.text || "Attachment"}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setReplyingTo(null)}
                        sx={{
                          color: theme.palette.text.secondary,
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {/* Message Input */}
                  <Box
                    sx={{
                      p: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      position: "relative",
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? theme.palette.grey[800]
                          : theme.palette.grey[100],
                    }}
                  >
                    {showEmojiPicker && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: "100%",
                          left: 0,
                          width: "100%",
                          zIndex: 10,
                        }}
                      >
                        <Picker
                          onEmojiClick={handleEmojiClick}
                          pickerStyle={{
                            width: "100%",
                            boxShadow: "none",
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 0,
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? theme.palette.grey[800]
                                : theme.palette.background.paper,
                          }}
                          theme={theme.palette.mode}
                        />
                      </Box>
                    )}
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Tooltip title="Emoji">
                        <IconButton
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          sx={{
                            color: theme.palette.text.secondary,
                          }}
                        >
                          <EmojiEmotions />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Attach file">
                        <>
                          <IconButton
                            onClick={() => fileInputRef.current.click()}
                            disabled={isUploading}
                            sx={{
                              color: theme.palette.text.secondary,
                            }}
                          >
                            <AttachFile />
                          </IconButton>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                            accept="image/*, .pdf, .doc, .docx, .txt"
                          />
                        </>
                      </Tooltip>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder={
                          isUploading
                            ? "Uploading file..."
                            : "Type a message..."
                        }
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="small"
                        multiline
                        maxRows={4}
                        disabled={isUploading}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 20,
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? theme.palette.grey[700]
                                : theme.palette.background.paper,
                            "& fieldset": {
                              borderColor: theme.palette.divider,
                            },
                            "&:hover fieldset": {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                      <Tooltip title="Send">
                        <span>
                          <IconButton
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() && !isUploading}
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                              "&:hover": {
                                bgcolor: theme.palette.primary.dark,
                              },
                              "&:disabled": {
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? theme.palette.grey[700]
                                    : theme.palette.grey[300],
                              },
                            }}
                          >
                            <Send />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default AdminChat;
