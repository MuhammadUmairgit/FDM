import { Grid, Card, CardContent, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const QuickAction = ({ item }) => {
  const navigate = useNavigate();

  return (
    <Grid item xs={6} sm={3}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
        onClick={() => navigate(`/${item.screen}`)}
        elevation={2}
      >
        <CardContent>
          <IconButton color="primary" size="large">
            <item.icon fontSize="inherit" />
          </IconButton>
          <Typography variant="subtitle1" align="center">
            {item.title}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

const QuickActions = ({ quickActions }) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {quickActions.map((action) => (
          <QuickAction key={action.id} item={action} />
        ))}
      </Grid>
    </>
  );
};

export default QuickActions;