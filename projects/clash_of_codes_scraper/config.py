"""
Configuration file for the Clash of Codes scraper.
Loads settings from environment variables and provides defaults.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Required Configuration
GROUP_URL = os.getenv('GROUP_URL', 'https://codeforces.com/group/GROUPID/contests')

# Authentication - Cookie-based (recommended)
CODEFORCES_SESSION = os.getenv('CODEFORCES_SESSION', '')
CODEFORCES_39CE7 = os.getenv('CODEFORCES_39CE7', '')
CODEFORCES_CF_CLEARANCE = os.getenv('CODEFORCES_CF_CLEARANCE', '')

# Authentication - Username/Password (legacy, not recommended)
USERNAME = os.getenv('USERNAME', '')
PASSWORD = os.getenv('PASSWORD', '')

# Optional Configuration
OUTPUT_DIR = os.getenv('OUTPUT_DIR', './data/')
CONTEST_IDS = os.getenv('CONTEST_IDS', '')  # Comma-separated list, e.g., "1234,1235,1236"

# Parse contest IDs if provided
if CONTEST_IDS:
    CONTEST_IDS = [id.strip() for id in CONTEST_IDS.split(',') if id.strip()]
else:
    CONTEST_IDS = None  # Scrape all contests

# Contest Type Configuration (manually configure weekly vs battle)
WEEKLY_CONTEST_IDS = os.getenv('WEEKLY_CONTEST_IDS', '')
if WEEKLY_CONTEST_IDS:
    WEEKLY_CONTEST_IDS = set(id.strip() for id in WEEKLY_CONTEST_IDS.split(',') if id.strip())
else:
    WEEKLY_CONTEST_IDS = set()

BATTLE_CONTEST_IDS = os.getenv('BATTLE_CONTEST_IDS', '')
if BATTLE_CONTEST_IDS:
    BATTLE_CONTEST_IDS = set(id.strip() for id in BATTLE_CONTEST_IDS.split(',') if id.strip())
else:
    BATTLE_CONTEST_IDS = set()

# Scraping Configuration
MAX_RETRIES = int(os.getenv('MAX_RETRIES', '3'))
REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', '30'))
RETRY_DELAY = int(os.getenv('RETRY_DELAY', '2'))  # seconds

# Headers for requests
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

# Validation
def validate_config():
    """Validate that required configuration is present."""
    errors = []
    
    if not GROUP_URL:
        errors.append("GROUP_URL is required")
    
    # Check if either cookies OR username/password are provided
    has_cookies = CODEFORCES_SESSION and CODEFORCES_39CE7
    has_credentials = USERNAME and PASSWORD
    
    if not has_cookies and not has_credentials:
        errors.append("Authentication required: Either provide CODEFORCES_SESSION + CODEFORCES_39CE7 cookies, or USERNAME + PASSWORD")
    
    if errors:
        raise ValueError(f"Configuration errors:\n" + "\n".join(f"  - {e}" for e in errors))
    
    return True

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)
