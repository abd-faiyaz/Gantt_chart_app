import React from 'react';

const TestPage = () => {
  console.log('TestPage: Rendering');
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Test Page</h1>
      <p>If you can see this, the routing is working!</p>
    </div>
  );
};

export default TestPage;
