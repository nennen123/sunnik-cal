#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get project root (one level up from scripts/)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Display header
echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${MAGENTA}🏁 Ending Work Session${NC}              ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# Get current date
TODAY=$(date "+%B %d, %Y")
TODAY_SHORT=$(date "+%Y-%m-%d")
TIME_NOW=$(date "+%I:%M %p")

# Show git status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 GIT STATUS:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
git status -s
echo ""

# Show file changes statistics
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📈 CHANGES SUMMARY:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
git diff --stat
echo ""

# Check if there are any changes
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  No changes detected. Nothing to log.${NC}"
    echo ""
    exit 0
fi

# Ask for work summary
echo -e "${GREEN}✏️  Summarize what you accomplished today:${NC}"
echo -e "${YELLOW}   (Press Enter when done, or type 'auto' for auto-summary)${NC}"
echo ""
read -p "👉 " WORK_SUMMARY
echo ""

# Generate auto-summary if requested
if [ "$WORK_SUMMARY" = "auto" ] || [ -z "$WORK_SUMMARY" ]; then
    echo -e "${CYAN}🤖 Generating automatic summary...${NC}"

    # Get list of changed files
    CHANGED_FILES=$(git diff --name-only)
    STAGED_FILES=$(git diff --cached --name-only)
    ALL_CHANGES="$CHANGED_FILES $STAGED_FILES"

    # Simple auto-summary based on file types
    if echo "$ALL_CHANGES" | grep -q "\.js\|\.jsx"; then
        WORK_SUMMARY="Updated JavaScript/React components and logic"
    elif echo "$ALL_CHANGES" | grep -q "\.md"; then
        WORK_SUMMARY="Updated documentation"
    elif echo "$ALL_CHANGES" | grep -q "\.css"; then
        WORK_SUMMARY="Updated styles and UI"
    elif echo "$ALL_CHANGES" | grep -q "package.json"; then
        WORK_SUMMARY="Updated dependencies and configuration"
    else
        WORK_SUMMARY="Updated project files"
    fi

    echo -e "${GREEN}✅ Generated: ${WORK_SUMMARY}${NC}"
    echo ""
fi

# Read CURRENT_SESSION.md if it exists
SESSION_NOTES=""
if [ -f "docs/CURRENT_SESSION.md" ]; then
    echo -e "${CYAN}📝 Reading session notes...${NC}"
    SESSION_NOTES=$(cat docs/CURRENT_SESSION.md)
fi

# Create daily log entry
LOG_ENTRY="
### ${TODAY}

**Session Time:** ${TIME_NOW}

**Summary:** ${WORK_SUMMARY}

**Changes:**
\`\`\`
$(git diff --stat)
\`\`\`

**Modified Files:**
$(git status -s)

---
"

# Append to DAILY_WORK_LOG.md
DAILY_LOG="docs/DAILY_WORK_LOG.md"

# Create file if it doesn't exist
if [ ! -f "$DAILY_LOG" ]; then
    echo "# 📅 DAILY WORK LOG" > "$DAILY_LOG"
    echo "" >> "$DAILY_LOG"
    echo "Track of daily work sessions and accomplishments." >> "$DAILY_LOG"
    echo "" >> "$DAILY_LOG"
    echo "---" >> "$DAILY_LOG"
    echo "" >> "$DAILY_LOG"
fi

# Append the log entry
echo "$LOG_ENTRY" >> "$DAILY_LOG"

echo -e "${GREEN}✅ Daily log updated: ${DAILY_LOG}${NC}"
echo ""

# Ask if user wants to commit
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💾 Do you want to commit these changes? (y/n)${NC}"
read -p "👉 " -n 1 -r
echo ""
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Generate commit message
    echo -e "${CYAN}📝 Generating commit message...${NC}"

    # Use work summary as commit message
    COMMIT_MSG="$WORK_SUMMARY

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    # Show the commit message
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}Commit message:${NC}"
    echo "$COMMIT_MSG"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Ask for confirmation
    echo -e "${YELLOW}Proceed with commit? (y/n)${NC}"
    read -p "👉 " -n 1 -r
    echo ""
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Stage all changes
        git add .

        # Commit
        git commit -m "$COMMIT_MSG"

        echo ""
        echo -e "${GREEN}✅ Changes committed successfully!${NC}"
        echo ""

        # Ask about pushing
        echo -e "${YELLOW}📤 Push to remote? (y/n)${NC}"
        read -p "👉 " -n 1 -r
        echo ""
        echo ""

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push
            echo ""
            echo -e "${GREEN}✅ Pushed to remote!${NC}"
        else
            echo -e "${YELLOW}⏭️  Skipped push. You can push later with: ${CYAN}git push${NC}"
        fi
    else
        echo -e "${YELLOW}⏭️  Commit cancelled.${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped commit. Changes are logged but not committed.${NC}"
fi

echo ""
echo -e "${MAGENTA}🎉 Great work today! Session ended.${NC}"
echo ""
