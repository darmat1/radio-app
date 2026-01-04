#!/bin/bash

echo "🎵 Radio Stream Proxy Test Suite"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/proxy/icecast.walmradio.com:8443/christmas"
ORIGINAL_URL="https://icecast.walmradio.com:8443/christmas"

# Function to check if server is running
check_server() {
    echo -n "🔍 Checking if server is running... "
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/" | grep -q "200"; then
        echo -e "${GREEN}✓ Server running${NC}"
        return 0
    else
        echo -e "${RED}✗ Server not running${NC}"
        echo "Please start the server with: npm run dev"
        return 1
    fi
}

# Test CORS headers
test_cors() {
    echo -n "🌐 Testing CORS headers... "
    headers=$(curl -s -I "$API_URL" 2>/dev/null)
    
    if echo "$headers" | grep -q "Access-Control-Allow-Origin: \*"; then
        echo -e "${GREEN}✓ CORS headers present${NC}"
    else
        echo -e "${RED}✗ CORS headers missing${NC}"
        return 1
    fi
}

# Test content type
test_content_type() {
    echo -n "🎧 Testing audio content type... "
    headers=$(curl -s -I "$API_URL" 2>/dev/null)
    
    if echo "$headers" | grep -q "content-type: audio/"; then
        echo -e "${GREEN}✓ Audio content type detected${NC}"
        content_type=$(echo "$headers" | grep -i "content-type" | cut -d' ' -f2- | tr -d '\r\n')
        echo "   Content-Type: $content_type"
    else
        echo -e "${RED}✗ Invalid content type${NC}"
        return 1
    fi
}

# Test icecast metadata
test_icecast_metadata() {
    echo -n "📻 Testing Icecast metadata... "
    headers=$(curl -s -I "$API_URL" 2>/dev/null)
    
    if echo "$headers" | grep -q "icy-metaint"; then
        echo -e "${GREEN}✓ Icecast metadata present${NC}"
        metaint=$(echo "$headers" | grep -i "icy-metaint" | cut -d' ' -f2- | tr -d '\r\n')
        echo "   ICY-MetaInt: $metaint"
    else
        echo -e "${YELLOW}⚠ No Icecast metadata (may be normal for some streams)${NC}"
    fi
}

# Test actual data stream
test_stream_data() {
    echo -n "📡 Testing stream data... "
    data=$(curl -s "$API_URL" --max-time 3 2>/dev/null | head -c 1000)
    
    if [ -n "$data" ]; then
        # Check if data looks like audio (binary data)
        if echo "$data" | xxd -l 16 | grep -q "^[0-9a-f]\{8\}"; then
            echo -e "${GREEN}✓ Stream data flowing${NC}"
            echo "   Data sample: $(echo "$data" | xxd -l 32 | head -n1 | cut -d' ' -f2-)"
        else
            echo -e "${YELLOW}⚠ Data received but may not be audio${NC}"
        fi
    else
        echo -e "${RED}✗ No data received${NC}"
        return 1
    fi
}

# Test OPTIONS method for CORS preflight
test_options() {
    echo -n "⚙️  Testing OPTIONS method... "
    status=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$API_URL" 2>/dev/null)
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✓ OPTIONS method supported${NC}"
    else
        echo -e "${RED}✗ OPTIONS method failed (status: $status)${NC}"
        return 1
    fi
}

# Test direct URL (should fail with CORS)
test_direct_url() {
    echo -n "🚫 Testing direct URL (should fail CORS)... "
    headers=$(curl -s -I "$ORIGINAL_URL" --max-time 3 2>/dev/null)
    
    if [ -z "$headers" ]; then
        echo -e "${GREEN}✓ Direct URL inaccessible (expected)${NC}"
    else
        if echo "$headers" | grep -q "Access-Control-Allow-Origin"; then
            echo -e "${YELLOW}⚠ Direct URL has CORS (unexpected)${NC}"
        else
            echo -e "${YELLOW}⚠ Direct URL accessible but no CORS (browser would still block)${NC}"
        fi
    fi
}

# Main test execution
echo
if check_server; then
    echo
    test_cors
    test_content_type
    test_icecast_metadata
    test_stream_data
    test_options
    test_direct_url
    echo
    echo -e "${GREEN}🎉 Proxy solution test completed!${NC}"
    echo
    echo "To test in browser, open: http://localhost:3000/test.html"
else
    echo -e "${RED}❌ Cannot proceed - server not available${NC}"
    exit 1
fi