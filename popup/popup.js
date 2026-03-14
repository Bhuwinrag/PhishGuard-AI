// NOTE: This file must be transpiled from JSX to plain JavaScript before use.
// Run `npm run build` after saving any changes.

const {
  useState,
  useEffect,
  useMemo
} = React;

// --- Animated Shield Component ---
const AnimatedShield = ({
  status
}) => {
  const {
    iconColor,
    glowColor
  } = useMemo(() => {
    switch (status) {
      case 'secure':
        return {
          iconColor: '#34d399',
          glowColor: 'rgba(52, 211, 153, 0.5)'
        };
      case 'warning':
        return {
          iconColor: '#facc15',
          glowColor: 'rgba(250, 204, 21, 0.4)'
        };
      case 'danger':
        return {
          iconColor: '#ef4444',
          glowColor: 'rgba(239, 68, 68, 0.5)'
        };
      default:
        return {
          iconColor: '#9ca3af',
          glowColor: 'rgba(34, 211, 238, 0.3)'
        };
    }
  }, [status]);
  const isScanning = status === 'scanning';
  const scannerStyle = {
    position: 'absolute',
    top: '0',
    left: '10%',
    width: '80%',
    height: '4px',
    backgroundColor: '#22d3ee',
    borderRadius: '2px',
    boxShadow: '0 0 15px #22d3ee, 0 0 5px white',
    animation: 'scan 2s ease-in-out infinite',
    opacity: isScanning ? 1 : 0,
    transition: 'opacity 0.3s'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100px',
      height: '100px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '-20px',
      width: '140px',
      height: '140px',
      backgroundColor: glowColor,
      filter: 'blur(30px)',
      borderRadius: '50%',
      transition: 'background-color 0.5s'
    }
  }), /*#__PURE__*/React.createElement("svg", {
    style: {
      position: 'relative',
      width: '100%',
      height: '100%',
      color: iconColor,
      transition: 'color 0.5s'
    },
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2L2 7V13C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 13V7L12 2Z"
  })), isScanning && /*#__PURE__*/React.createElement("div", {
    style: scannerStyle
  }));
};

// --- Risk Score Bar Component ---
const RiskScoreBar = ({
  score,
  status
}) => {
  const barColor = useMemo(() => {
    switch (status) {
      case 'secure':
        return '#34d399';
      case 'warning':
        return '#facc15';
      case 'danger':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }, [status]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '9999px',
      height: '10px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${Math.max(0, Math.min(100, score))}%`,
      height: '100%',
      backgroundColor: barColor,
      borderRadius: '9999px',
      transition: 'width 0.5s ease-in-out, background-color 0.5s ease-in-out',
      boxShadow: `0 0 10px ${barColor}`
    }
  }));
};

// --- Main App Component ---
const App = () => {
  const [result, setResult] = useState({
    status: 'scanning',
    message: 'Analyzing current page...',
    aiScore: 0,
    quantumVerified: false
  });
  const [tabUrl, setTabUrl] = useState('');
  useEffect(() => {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url) {
        const formattedUrl = new URL(activeTab.url).hostname;
        setTabUrl(formattedUrl);
        chrome.runtime.sendMessage({
          type: 'SCAN_PAGE'
        });
      } else {
        setResult({
          status: 'idle',
          message: 'No active page to scan.',
          aiScore: 0,
          quantumVerified: false
        });
      }
    });
    const listener = message => setResult(message.payload);
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);
  const getStatusColor = () => {
    switch (result.status) {
      case 'secure':
        return '#34d399';
      case 'warning':
        return '#facc15';
      case 'danger':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      width: '400px',
      height: '600px',
      color: 'white',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
      background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      padding: '1.25rem',
      textAlign: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0.05em'
    }
  }, "PhishGuard", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#22d3ee',
      fontWeight: 700
    }
  }, "AI")), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '0.5rem',
      fontSize: '1rem',
      color: '#cbd5e1',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, tabUrl || 'No active tab')), /*#__PURE__*/React.createElement("main", {
    style: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 1.5rem 1rem'
    }
  }, /*#__PURE__*/React.createElement(AnimatedShield, {
    status: result.status
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: '1.5rem',
      fontSize: '2rem',
      fontWeight: 'bold',
      color: getStatusColor(),
      transition: 'color 0.5s'
    }
  }, result.status.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: '120px',
      overflowY: 'auto',
      marginTop: '0.75rem',
      paddingRight: '10px',
      fontSize: '0.875rem',
      color: '#cbd5e1',
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("p", null, result.message))), /*#__PURE__*/React.createElement("footer", {
    style: {
      padding: '1.5rem',
      backgroundColor: 'rgba(17, 24, 39, 0.7)',
      borderTop: '1px solid #334155',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.875rem',
      color: '#9ca3af'
    }
  }, "AI Risk Score"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'monospace',
      color: getStatusColor(),
      fontWeight: 'bold'
    }
  }, result.aiScore.toFixed(2), "%")), /*#__PURE__*/React.createElement(RiskScoreBar, {
    score: result.aiScore,
    status: result.status
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.875rem',
      color: '#9ca3af'
    }
  }, "Quantum Verification"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: result.quantumVerified ? '#22d3ee' : '#6b7280'
    }
  }, result.quantumVerified ? 'VERIFIED' : 'N/A'))));
};
ReactDOM.render(/*#__PURE__*/React.createElement(App, null), document.getElementById('root'));
