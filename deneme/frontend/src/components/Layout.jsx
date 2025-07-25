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
  Container
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
            position: 'relative',
            zIndex: 1,
            backgroundColor: '#ffffffcc',
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button component={Link} to="/">
            <ListItemText primary="Ana Sayfa" />
          </ListItem>
          <ListItem button component={Link} to="/jobs">
            <ListItemText primary="İşlemler" />
          </ListItem>
          <ListItem button component={Link} to="/history">
            <ListItemText primary="Geçmiş" />
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
          zIndex: 1,
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            backgroundColor: '#1976d2',
            zIndex: 2,
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
              Siber Güvenlik Analiz Paneli
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;

