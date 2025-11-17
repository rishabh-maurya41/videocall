#!/bin/bash

# API Testing Script for Telehealth Video Call System
# Usage: ./test-api.sh

API_URL="http://localhost:5000/api"
APPOINTMENT_ID="test-$(date +%s)"

echo "================================"
echo "Telehealth API Testing Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "Test 1: Health Check"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not responding${NC}"
    exit 1
fi
echo ""

# Test 2: Create Meeting
echo "Test 2: Create Meeting"
create_response=$(curl -s -X POST $API_URL/create-meeting \
  -H "Content-Type: application/json" \
  -d "{
    \"appointmentId\": \"$APPOINTMENT_ID\",
    \"doctorId\": \"doctor-123\",
    \"patientId\": \"patient-456\",
    \"scheduledTime\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")

room_id=$(echo $create_response | grep -o '"roomId":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$room_id" ]; then
    echo -e "${GREEN}✓ Meeting created successfully${NC}"
    echo "  Room ID: $room_id"
else
    echo -e "${RED}✗ Failed to create meeting${NC}"
    echo "  Response: $create_response"
    exit 1
fi
echo ""

# Test 3: Get Meeting
echo "Test 3: Get Meeting"
get_response=$(curl -s $API_URL/meeting/$room_id)
meeting_status=$(echo $get_response | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$meeting_status" = "scheduled" ]; then
    echo -e "${GREEN}✓ Meeting retrieved successfully${NC}"
    echo "  Status: $meeting_status"
else
    echo -e "${RED}✗ Failed to retrieve meeting${NC}"
    echo "  Response: $get_response"
fi
echo ""

# Test 4: Update Meeting Status
echo "Test 4: Update Meeting Status"
update_response=$(curl -s -X PUT $API_URL/meeting/$room_id/status \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"active\",
    \"startTime\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")

updated_status=$(echo $update_response | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$updated_status" = "active" ]; then
    echo -e "${GREEN}✓ Meeting status updated successfully${NC}"
    echo "  New Status: $updated_status"
else
    echo -e "${RED}✗ Failed to update meeting status${NC}"
    echo "  Response: $update_response"
fi
echo ""

# Test 5: Complete Meeting
echo "Test 5: Complete Meeting"
complete_response=$(curl -s -X PUT $API_URL/meeting/$room_id/status \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"completed\",
    \"endTime\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")

final_status=$(echo $complete_response | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$final_status" = "completed" ]; then
    echo -e "${GREEN}✓ Meeting completed successfully${NC}"
    echo "  Final Status: $final_status"
else
    echo -e "${RED}✗ Failed to complete meeting${NC}"
    echo "  Response: $complete_response"
fi
echo ""

echo "================================"
echo "All tests completed!"
echo "================================"
