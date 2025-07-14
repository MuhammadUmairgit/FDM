// src/components/Settings/LanguageSettings.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
  Avatar,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Translate as TranslateIcon
} from '@mui/icons-material';

const LanguageSettings = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const languages = [
    { code: 'en', name: t('english'), flag: '🇬🇧' },
    { code: 'ro', name: t('romanian'), flag: '🇷🇴' }
  ];

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const applyLanguage = () => {
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TranslateIcon fontSize="large" />
        {t('language_settings')}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageIcon color="primary" />
            {t('current_language')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('select_language')}
          </Typography>

          <FormControl component="fieldset">
            <RadioGroup
              aria-label="language"
              name="language-radio-group"
              value={selectedLanguage}
              onChange={handleLanguageChange}
            >
              {languages.map((lang) => (
                <Card
                  key={lang.code}
                  sx={{
                    mb: 2,
                    border: selectedLanguage === lang.code 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.light,
                      boxShadow: theme.shadows[2]
                    }
                  }}
                >
                  <FormControlLabel
                    value={lang.code}
                    control={<Radio sx={{ display: 'none' }} />}
                    label={
                      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar
                          sx={{
                            bgcolor: 'transparent',
                            color: 'text.primary',
                            fontSize: '2rem',
                            mr: 2,
                            width: 48,
                            height: 48
                          }}
                        >
                          {lang.flag}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">{lang.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {lang.code.toUpperCase()}
                          </Typography>
                        </Box>
                        {selectedLanguage === lang.code && (
                          <CheckCircleIcon color="primary" sx={{ fontSize: 32 }} />
                        )}
                      </Box>
                    }
                    sx={{
                      m: 0,
                      width: '100%',
                      '& .MuiFormControlLabel-label': {
                        width: '100%'
                      }
                    }}
                  />
                </Card>
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={applyLanguage}
          disabled={selectedLanguage === i18n.language}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1rem',
            textTransform: 'none'
          }}
        >
          {t('apply_changes')}
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          <Box>
            <Typography>{t('changes_saved')}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {t('restart_notice')}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LanguageSettings;