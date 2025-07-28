import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Button, Box, Grow } from '@mui/material';

function Dashboard() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/jobs');
  };

  return (
    <Box sx={{ mt: 6, ml: 10, maxWidth: '800px' }}>
      <Grow in={true} timeout={800}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Cybersecurity Analysis Panel
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Using this panel, you can perform various cybersecurity analyses such as
            <strong> ping testing</strong>, <strong>port scanning</strong>,
            <strong> HTTP header inspection</strong>, <strong>whois lookup</strong>,
            <strong> OS detection</strong>, and <strong>custom command execution</strong>.
          </Typography>

          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>
            Collect basic information about target systems, view your scan history,
            and analyze results to improve your security posture.
          </Typography>

          <Box display="flex" justifyContent="flex-start" mt={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStart}
              size="large"
            >
              Click to Get Started
            </Button>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
}

export default Dashboard;

