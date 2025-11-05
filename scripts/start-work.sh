#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Get project root (one level up from scripts/)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Display header
echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${MAGENTA}🚀 Starting Work Session${NC}            ${CYAN}║${NC}"
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo ""

# Display current date
TODAY=$(date "+%B %d, %Y")
TODAY_SHORT=$(date "+%Y-%m-%d")
echo -e "${GREEN}📅 Today is: ${YELLOW}${TODAY}${NC}"
echo ""

# Show next immediate tasks from PROJECT_STATUS_TRACKER.md
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 NEXT IMMEDIATE TASKS:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "docs/PROJECT_STATUS_TRACKER.md" ]; then
    # Extract the "Next Immediate Tasks" section
    sed -n '/## 🔄 NEXT IMMEDIATE TASKS/,/^##/p' docs/PROJECT_STATUS_TRACKER.md | head -n -1 | tail -n +2
else
    echo -e "${YELLOW}⚠️  PROJECT_STATUS_TRACKER.md not found${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Ask what they'll work on today
echo -e "${GREEN}✏️  What will you work on today?${NC}"
echo -e "${YELLOW}   (Press Enter when done)${NC}"
echo ""
read -p "👉 " WORK_FOCUS
echo ""

# Create CURRENT_SESSION.md with template
SESSION_FILE="docs/CURRENT_SESSION.md"

cat > "$SESSION_FILE" << EOF
# 🎯 CURRENT WORK SESSION

**Date:** ${TODAY}
**Started:** $(date "+%I:%M %p")

---

## 📝 Today's Focus

${WORK_FOCUS}

---

## ✅ Tasks Completed This Session

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

---

## 🐛 Issues Encountered

None yet.

---

## 💡 Notes & Learnings

-

---

## 🔄 Next Steps

-

---

**Session Status:** 🟢 Active
EOF

echo -e "${GREEN}✅ Session started successfully!${NC}"
echo ""
echo -e "${CYAN}📝 Updated: ${SESSION_FILE}${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Run ${CYAN}npm run work:end${YELLOW} when you're done to log your work!${NC}"
echo ""
echo -e "${MAGENTA}Happy coding! 🎉${NC}"
echo ""
