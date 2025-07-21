import React from 'react';
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const drawerWidth = 200;

function Layout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button component={Link} to="/">
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button component={Link} to="/jobs">
            <ListItemText primary="Jobs" />
          </ListItem>
          <ListItem button component={Link} to="/history">
            <ListItemText primary="History" />
          </ListItem>
        </List>
      </Drawer>

      <main style={{ flexGrow: 1, padding: '20px' }}>
        <AppBar position="fixed" sx={{ zIndex: 1201 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              My React App
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        {children}
      </main>
    </div>
  );
}

export default Layout;

