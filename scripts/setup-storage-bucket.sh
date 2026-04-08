#!/bin/bash
# Setup script for mission-artifacts storage bucket
# Run this after setting up the Supabase local environment

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up mission-artifacts storage bucket...${NC}"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "supabase CLI is not installed. Visit https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

# Create the storage bucket (private)
echo "Creating storage bucket: mission-artifacts"
supabase storage create mission-artifacts --public=false

# Verify bucket was created
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Storage bucket created successfully${NC}"
else
    echo -e "${YELLOW}Note: Bucket may already exist${NC}"
fi

echo -e "${GREEN}Done! The artifacts bucket is ready to use.${NC}"
echo ""
echo "RLS policies will be automatically applied when you run:"
echo "supabase db push"
