// Header.tsx
import React from 'react';

const headerStyle = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #dee2e6',
  marginBottom: '20px',
};

const titleStyle = {
  margin: 0,
  fontSize: '2rem',
  color: '#343a40',
};

const Header: React.FC = () => {
  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>Live Tracker</h1>
    </header>
  );
};

export default Header;