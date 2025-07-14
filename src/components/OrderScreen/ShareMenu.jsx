import { Menu, MenuItem, Typography } from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  GridOn as ExcelIcon,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material";

const ShareMenu = ({ anchorEl, onClose }) => {
  const downloadPDF = () => {
    // PDF download implementation
    onClose();
  };

  const downloadExcel = () => {
    // Excel download implementation
    onClose();
  };

  const shareOnWhatsApp = () => {
    // WhatsApp sharing implementation
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 4,
          mt: 1,
          minWidth: 200,
        },
      }}
    >
      <MenuItem onClick={downloadPDF} sx={{ py: 1 }}>
        <PdfIcon sx={{ mr: 2, color: "error.main" }} />
        <Typography>Download PDF</Typography>
      </MenuItem>
      <MenuItem onClick={downloadExcel} sx={{ py: 1 }}>
        <ExcelIcon sx={{ mr: 2, color: "success.main" }} />
        <Typography>Download Excel</Typography>
      </MenuItem>
      <MenuItem onClick={shareOnWhatsApp} sx={{ py: 1 }}>
        <WhatsAppIcon sx={{ mr: 2, color: "success.dark" }} />
        <Typography>Share on WhatsApp</Typography>
      </MenuItem>
    </Menu>
  );
};

export default ShareMenu;
