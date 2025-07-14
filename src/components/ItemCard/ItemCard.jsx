import React from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  Skeleton,
  Chip,
  useTheme,
  Fade,
  Grow,
  styled,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const StyledCard = styled(Card)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
  transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
  cursor: "pointer",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
    "& .title-text": {
      color: theme.palette.primary.main,
    },
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
    opacity: 0.8,
  },
}));

const GlowBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: "16px",
  boxShadow: `0 0 20px 5px ${theme.palette.primary.light}`,
  opacity: 0,
  transition: "opacity 0.3s ease",
  pointerEvents: "none",
  "&.active": {
    opacity: 0.4,
  },
}));

const ItemCard = ({ item }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handlePress = () => {
    navigate(`/item/${item.id}`, {
      state: { item }, // Only pass serializable data
    });
  };

  return (
    <Box sx={{ position: "relative", overflow: "visible" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
        style={{
          position: "relative",
          overflow: "visible",
          zIndex: isHovered ? 2 : 1,
        }}
      >
        <StyledCard
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handlePress}
        >
          <GlowBox className={isHovered ? "active" : ""} />

          <Box sx={{ display: "flex", p: 3, position: "relative", zIndex: 1 }}>
            {/* Image Section */}
            <Box
              sx={{
                mr: 2,
                position: "relative",
                minWidth: 100,
                flexShrink: 0,
              }}
            >
              {item.image?.uri ? (
                <>
                  {!imageLoaded && (
                    <Skeleton
                      variant="rectangular"
                      width={100}
                      height={100}
                      sx={{
                        borderRadius: "12px",
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "grey.800"
                            : "grey.200",
                      }}
                    />
                  )}
                  <Fade in={imageLoaded} timeout={500}>
                    <CardMedia
                      component="img"
                      image={item.image.uri}
                      alt={item.name}
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: "12px",
                        objectFit: "cover",
                        boxShadow: theme.shadows[2],
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                      onLoad={() => setImageLoaded(true)}
                    />
                  </Fade>
                </>
              ) : (
                <Grow in timeout={500}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "12px",
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.800" : "grey.100",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.palette.text.secondary,
                      boxShadow: theme.shadows[1],
                      border: `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                      No Image
                    </Typography>
                  </Box>
                </Grow>
              )}
            </Box>

            {/* Details Section */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Name and Code */}
              <Box sx={{ mb: 1 }}>
                <Tooltip
                  title={item.name || "No Name"}
                  placement="top"
                  arrow
                  enterDelay={500}
                >
                  <Typography
                    variant="h6"
                    className="title-text"
                    sx={{
                      fontWeight: 300,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: theme.palette.text.primary,
                      transition: "color 0.3s ease",
                    }}
                  >
                    {item.name || "No Name"}
                  </Typography>
                </Tooltip>
                <Chip
                  label={item.code || "N/A"}
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    fontWeight: 200,
                    fontSize: "0.7rem",
                    height: "22px",
                  }}
                />
              </Box>

              {/* Quantity and Price */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  width: "100%",
                  justifyContent: "space-between",
                  mt: 1.5,
                }}
              >
                <Box
                  sx={{
                    flex: "1 1 50%",
                    p: 1.5,
                    borderRadius: "10px",
                    bgcolor:
                      theme.palette.mode === "dark" ? "grey.800" : "grey.50",
                    textAlign: "center",
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    minWidth: 0,
                    "&:hover": {
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.700" : "grey.100",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 100,
                      color: theme.palette.text.secondary,
                      fontSize: "0.75rem",
                      letterSpacing: "0.5px",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    QTY
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 100,
                      color: theme.palette.primary.main,
                      mt: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.quantity || "0"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flex: "1 1 50%",
                    p: 1.5,
                    borderRadius: "10px",
                    bgcolor:
                      theme.palette.mode === "dark" ? "grey.800" : "grey.50",
                    textAlign: "center",
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    minWidth: 0,
                    "&:hover": {
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.700" : "grey.100",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 100,
                      color: theme.palette.text.secondary,
                      fontSize: "0.75rem",
                      letterSpacing: "0.5px",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    PRICE
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 100,
                      color: theme.palette.secondary.main,
                      mt: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.price || "0"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </StyledCard>
      </motion.div>
    </Box>
  );
};

export default React.memo(ItemCard);
