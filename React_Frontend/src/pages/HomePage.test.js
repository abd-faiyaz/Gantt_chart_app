import React from 'react';

const HomePage = () => {
  console.log('HomePage component rendering...');
  
  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f0f0f0' }}>
      <h1>HomePage is working!</h1>
      <p>If you can see this, the HomePage component is rendering correctly.</p>
    </div>
  );
};

export default HomePage;
