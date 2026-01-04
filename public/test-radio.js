// Test script to validate the radio streaming solution
// This simulates what happens in the actual radio app

console.log('🎵 Radio Streaming Solution Test');
console.log('================================');

// Test the proxy URL generation function
function getProxyUrl(originalUrl) {
  try {
    const url = new URL(originalUrl);
    const pathWithoutProtocol = url.toString().replace(/^https?:\/\//, '');
    return `/api/proxy/${pathWithoutProtocol}`;
  } catch (error) {
    console.error('Invalid URL for proxy:', originalUrl, error);
    return originalUrl;
  }
}

// Test URLs
const testStation = {
  name: 'Walm Radio Christmas',
  url: 'https://icecast.walmradio.com:8443/christmas',
  country: 'United States'
};

console.log('\n📍 Station:', testStation.name);
console.log('🔗 Original URL:', testStation.url);

const proxyUrl = getProxyUrl(testStation.url);
console.log('🔄 Proxy URL:', proxyUrl);

// Test audio loading
function testAudioPlayback() {
  console.log('\n🎧 Testing audio playback...');
  
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  
  // Test direct URL first (should fail with CORS)
  console.log('❌ Testing direct URL...');
  audio.src = testStation.url;
  
  audio.addEventListener('error', (e) => {
    console.log('Direct URL failed as expected:', audio.error?.message || 'CORS error');
    
    // Now test proxy URL
    console.log('✅ Testing proxy URL...');
    audio.src = proxyUrl;
    
    audio.addEventListener('error', (e) => {
      console.error('❌ Proxy URL also failed:', audio.error?.message);
    });
    
    audio.addEventListener('loadeddata', () => {
      console.log('✅ Proxy URL loaded successfully!');
      console.log('📊 Audio Details:');
      console.log('   - ReadyState:', audio.readyState);
      console.log('   - NetworkState:', audio.networkState);
      console.log('   - CurrentSrc:', audio.currentSrc);
      
      // Test play
      audio.play().then(() => {
        console.log('🎉 Audio playing successfully!');
        setTimeout(() => {
          audio.pause();
          console.log('⏹️  Test completed - audio paused');
        }, 2000);
      }).catch(err => {
        console.error('❌ Play failed:', err.message);
      });
    });
    
    audio.addEventListener('loadstart', () => {
      console.log('🔄 Loading proxy stream...');
    });
    
    audio.load();
  });
  
  audio.addEventListener('loadeddata', () => {
    console.log('❓ Direct URL loaded unexpectedly');
  });
  
  audio.load();
}

// Test API response
async function testAPIResponse() {
  console.log('\n🌐 Testing API response...');
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'HEAD',
      headers: {
        'Range': 'bytes=0-1023'
      }
    });
    
    console.log('📊 Response Headers:');
    console.log('   - Status:', response.status);
    console.log('   - Content-Type:', response.headers.get('content-type'));
    console.log('   - CORS:', response.headers.get('access-control-allow-origin'));
    console.log('   - ICY-MetaInt:', response.headers.get('icy-metaint'));
    console.log('   - Content-Length:', response.headers.get('content-length'));
    
    if (response.ok && response.headers.get('content-type')?.startsWith('audio/')) {
      console.log('✅ API response is valid');
    } else {
      console.log('❌ API response is invalid');
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run tests
if (typeof window !== 'undefined') {
  // Browser environment
  testAPIResponse().then(() => {
    testAudioPlayback();
  });
} else {
  console.log('❌ This test must be run in a browser environment');
  console.log('🌐 Open: http://localhost:3000/test.html to run the test');
}