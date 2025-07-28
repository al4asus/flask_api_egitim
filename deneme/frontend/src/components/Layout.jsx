import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  Box,
  Container,
  ListItemButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import ParticlesBackground from './ParticlesBackground';

const drawerWidth = 200;

function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <CssBaseline />
      <ParticlesBackground />

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#ffffffcc',
            zIndex: 2,
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/">
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/jobs">
              <ListItemText primary="Tasks" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/history">
              <ListItemText primary="History" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: `${drawerWidth}px`,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            backgroundColor: '#1976d2',
            zIndex: 3,
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
              Cybersecurity Analysis Panel
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Container maxWidth="lg" sx={{ backgroundColor: 'transparent' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;

