import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ChatProvider, useChatContext } from './contexts/ChatContext';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import NewChatWelcome from './components/NewChatWelcome';
import ActiveChat from './components/ActiveChat';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    background: {
      default: '#ffffff',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        },
      },
    },
  },
});

const SIDEBAR_WIDTH = 300;

const ChatInterface = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentChat } = useChatContext();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box
        component="nav"
        sx={{
          width: { md: SIDEBAR_WIDTH },
          flexShrink: { md: 0 }
        }}
      >
        <Sidebar 
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          overflow: 'hidden'
        }}
      >
        <ChatHeader handleDrawerToggle={handleDrawerToggle} />
        
        {currentChat ? <ActiveChat /> : <NewChatWelcome />}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;