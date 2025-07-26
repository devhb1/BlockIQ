// Test script to verify CSP headers
const https = require('https');

const testUrl = 'https://www.blockiq.xyz';

console.log('Testing CSP headers for:', testUrl);

const req = https.get(testUrl, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  const csp = res.headers['content-security-policy'];
  if (csp) {
    console.log('\n✅ CSP header found:', csp);
    
    // Check if Farcaster domains are allowed
    if (csp.includes('farcaster.xyz') || csp.includes('warpcast.com')) {
      console.log('✅ Farcaster domains are allowed in CSP');
    } else {
      console.log('❌ Farcaster domains are NOT allowed in CSP');
    }
    
    // Check if WalletConnect domains are allowed
    if (csp.includes('walletconnect.com')) {
      console.log('✅ WalletConnect domains are allowed in CSP');
    } else {
      console.log('❌ WalletConnect domains are NOT allowed in CSP');
    }
  } else {
    console.log('❌ No CSP header found');
  }
});

req.on('error', (err) => {
  console.error('Error:', err.message);
});

req.end(); 