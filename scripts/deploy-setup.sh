#!/bin/bash

# DYO Deployment Setup Script
# This script automates pre-deployment setup steps for the DYO application
# Run this after pulling the latest code and before deployment

set -e  # Exit on first error

echo "🚀 DYO Deployment Setup Starting..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required tools
check_requirements() {
  echo -e "\n${YELLOW}Checking requirements...${NC}"
  
  if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Install it with: npm install -g supabase${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Supabase CLI found${NC}"
  
  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Node.js found${NC}"
}

# Create storage bucket
create_storage_bucket() {
  echo -e "\n${YELLOW}Setting up storage bucket...${NC}"
  
  # Check if bucket already exists
  if supabase storage ls mission-artifacts 2>/dev/null; then
    echo -e "${GREEN}✓ Storage bucket 'mission-artifacts' already exists${NC}"
  else
    echo "Creating storage bucket 'mission-artifacts'..."
    supabase storage create mission-artifacts --public=false
    echo -e "${GREEN}✓ Storage bucket created${NC}"
  fi
}

# Verify environment variables
check_env_vars() {
  echo -e "\n${YELLOW}Checking environment variables...${NC}"
  
  missing_vars=()
  
  if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    missing_vars+=("NEXT_PUBLIC_SUPABASE_URL")
  else
    echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_URL set${NC}"
  fi
  
  if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    missing_vars+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  else
    echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY set${NC}"
  fi
  
  if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    missing_vars+=("SUPABASE_SERVICE_ROLE_KEY")
  else
    echo -e "${GREEN}✓ SUPABASE_SERVICE_ROLE_KEY set${NC}"
  fi
  
  if [ -z "$GOOGLE_GENERATIVE_AI_API_KEY" ]; then
    echo -e "${YELLOW}⚠ GOOGLE_GENERATIVE_AI_API_KEY not set (optional - will use library fallback)${NC}"
  else
    echo -e "${GREEN}✓ GOOGLE_GENERATIVE_AI_API_KEY set${NC}"
  fi
  
  if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
      echo -e "${RED}  - $var${NC}"
    done
    echo -e "\n${YELLOW}Copy .env.example to .env.local and fill in the values${NC}"
    exit 1
  fi
}

# Run migrations
run_migrations() {
  echo -e "\n${YELLOW}Running database migrations...${NC}"
  supabase db push
  echo -e "${GREEN}✓ Migrations applied${NC}"
}

# Build the application
build_app() {
  echo -e "\n${YELLOW}Building the application...${NC}"
  npm run build
  echo -e "${GREEN}✓ Build completed${NC}"
}

# Type checking
type_check() {
  echo -e "\n${YELLOW}Running type checking...${NC}"
  npm run typecheck
  echo -e "${GREEN}✓ Type checking passed${NC}"
}

# Main execution
main() {
  check_requirements
  check_env_vars
  create_storage_bucket
  run_migrations
  type_check
  build_app
  
  echo -e "\n${GREEN}✅ Deployment setup completed successfully!${NC}"
  echo -e "\n${YELLOW}Next steps:${NC}"
  echo "1. Review the deployment checklist in DEPLOYMENT.md"
  echo "2. Run: npm run start"
  echo "3. Test the application in your deployment environment"
}

main
