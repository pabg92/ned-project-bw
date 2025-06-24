#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Installing Puppeteer MCP Server for Claude Desktop${NC}"
echo "=================================================="

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Install the Puppeteer MCP server globally
echo -e "${YELLOW}Installing @modelcontextprotocol/server-puppeteer...${NC}"
npm install -g @modelcontextprotocol/server-puppeteer

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install Puppeteer MCP server${NC}"
    exit 1
fi

# Find Claude Desktop config file
CONFIG_DIR="$HOME/Library/Application Support/Claude"
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

# Check if config directory exists
if [ ! -d "$CONFIG_DIR" ]; then
    echo -e "${YELLOW}Creating Claude Desktop config directory...${NC}"
    mkdir -p "$CONFIG_DIR"
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}Creating Claude Desktop config file...${NC}"
    echo '{
  "mcpServers": {}
}' > "$CONFIG_FILE"
fi

# Get the path to the installed puppeteer server
PUPPETEER_PATH=$(npm list -g @modelcontextprotocol/server-puppeteer --parseable 2>/dev/null | head -n 1)

if [ -z "$PUPPETEER_PATH" ]; then
    echo -e "${RED}Error: Could not find installed Puppeteer MCP server path${NC}"
    exit 1
fi

# Backup existing config
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}Backed up existing config${NC}"

# Add Puppeteer MCP to config using Node.js for proper JSON handling
node -e "
const fs = require('fs');
const configPath = '$CONFIG_FILE';

try {
    let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (!config.mcpServers) {
        config.mcpServers = {};
    }
    
    config.mcpServers.puppeteer = {
        command: 'node',
        args: ['$PUPPETEER_PATH/dist/index.js']
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Successfully added Puppeteer MCP to Claude Desktop config');
} catch (error) {
    console.error('❌ Error updating config:', error.message);
    process.exit(1);
}
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Installation complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Quit Claude Desktop completely (Cmd+Q)"
    echo "2. Restart Claude Desktop"
    echo "3. The Puppeteer MCP server should now be available"
    echo ""
    echo "The Puppeteer server provides browser automation capabilities including:"
    echo "- Taking screenshots"
    echo "- Navigating web pages"
    echo "- Clicking elements"
    echo "- Filling forms"
    echo "- Evaluating JavaScript"
else
    echo -e "${RED}Failed to update Claude Desktop config${NC}"
    exit 1
fi