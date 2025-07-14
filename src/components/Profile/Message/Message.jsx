// src/pages/ProfileScreen/components/AdminChat/Message.js
import { Box, Avatar, Typography, Paper, IconButton } from "@mui/material";
import { Reply } from "@mui/icons-material";
import { motion } from "framer-motion";

const Message = ({ message, isCurrentUser, onReply }) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: isCurrentUser ? "flex-end" : "flex-start",
          mb: 2,
          px: 2,
          position: "relative",
        }}
      >
        {/* Sender info */}
        {!isCurrentUser && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Avatar
              sx={{ width: 24, height: 24, mr: 1 }}
            >
              {message.senderName?.charAt(0)}
            </Avatar>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {message.senderName}
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
              ? "primary.main"
              : "grey.200",
            color: isCurrentUser
              ? "primary.contrastText"
              : "text.primary",
            borderRadius: isCurrentUser
              ? "18px 4px 18px 18px"
              : "4px 18px 18px 18px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <Typography>{message.text}</Typography>

          {/* Message time */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mt: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                color: isCurrentUser
                  ? "rgba(255,255,255,0.7)"
                  : "text.secondary",
              }}
            >
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Typography>
          </Box>
        </Paper>

        {/* Message actions */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
          <IconButton 
            size="small" 
            onClick={() => onReply({
              id: message.id,
              text: message.text,
              sender: message.senderName,
            })}
          >
            <Reply fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Message;