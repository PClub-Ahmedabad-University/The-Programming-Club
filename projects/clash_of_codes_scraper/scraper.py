#!/usr/bin/env python3
"""
Clash of Codes Contest Scraper

This script scrapes contest data from a private Codeforces group
and generates JSON snapshots for participant performance analysis.

Usage:
    python scraper.py

Environment variables should be set in .env file.
See .env.example for required configuration.
"""

import sys
import time
from pathlib import Path
from typing import List, Dict
from tqdm import tqdm

import config
import utils
from utils import logger


def extract_group_id(group_url: str) -> str:
    """Extract group ID from the group URL."""
    # Example: https://codeforces.com/group/ABC123/contests -> ABC123
    parts = group_url.split('/group/')
    if len(parts) > 1:
        return parts[1].split('/')[0]
    return None


def scrape_all_contests(session: utils.CodeforcesSession, group_id: str = None) -> List[Dict]:
    """
    Scrape all available contests from the group.
    
    Args:
        session: Authenticated session
        group_id: Group ID for URL construction
    
    Returns:
        List of contest information dicts
    """
    logger.info(f"Fetching contest list from: {config.GROUP_URL}")
    
    response = session.get(config.GROUP_URL)
    
    if not response:
        logger.error("Failed to fetch contest list")
        return []
    
    contests = utils.extract_contest_list(response.text, group_id)
    
    # Filter contests if CONTEST_IDS is specified
    if config.CONTEST_IDS:
        contests = [c for c in contests if c['id'] in config.CONTEST_IDS]
        logger.info(f"Filtered to {len(contests)} specified contests")
    
    return contests


def scrape_contest(session: utils.CodeforcesSession, contest: Dict) -> bool:
    """
    Scrape a single contest and save its data.
    
    Args:
        session: Authenticated session
        contest: Contest info dict with 'id', 'title', 'url'
    
    Returns:
        True if successful, False otherwise
    """
    contest_id = contest['id']
    contest_url = contest['url']
    
    logger.info(f"Scraping contest {contest_id}: {contest['title']}")
    
    # Fetch standings page
    response = session.get(contest_url)
    
    if not response:
        logger.error(f"✗ Failed to fetch standings for contest {contest_id}")
        return False
    
    # Parse standings
    contest_data = utils.parse_standings(response.text, contest_id)
    
    # Add contest type if configured
    contest_type = utils.determine_contest_type(contest_id)
    if contest_type != 'unknown':
        contest_data['type'] = contest_type
    
    # Save to JSON
    success = utils.save_contest_json(contest_data, config.OUTPUT_DIR)
    
    # Small delay to avoid overwhelming the server
    time.sleep(1)
    
    return success


def main():
    """Main scraper execution."""
    
    print("=" * 60)
    print("Clash of Codes Contest Scraper")
    print("=" * 60)
    print()
    
    # Validate configuration
    try:
        config.validate_config()
    except ValueError as e:
        logger.error(str(e))
        logger.error("\nPlease create a .env file with required settings.")
        logger.error("See .env.example for reference.")
        sys.exit(1)
    
    logger.info(f"Output directory: {config.OUTPUT_DIR}")
    logger.info(f"Group URL: {config.GROUP_URL}")
    
    # Extract group ID
    group_id = extract_group_id(config.GROUP_URL)
    if group_id:
        logger.info(f"Group ID: {group_id}")
    
    # Create session and login
    # Prefer cookie-based authentication if available
    if config.CODEFORCES_SESSION and config.CODEFORCES_39CE7:
        session = utils.CodeforcesSession(
            session_cookie=config.CODEFORCES_SESSION,
            cookie_39ce7=config.CODEFORCES_39CE7,
            cf_clearance=config.CODEFORCES_CF_CLEARANCE
        )
        logger.info("Using cookie-based authentication")
    else:
        session = utils.CodeforcesSession(
            username=config.USERNAME,
            password=config.PASSWORD
        )
        logger.info("Using password-based authentication")
    
    if not session.login():
        logger.error("Failed to authenticate. Please check your cookies/credentials.")
        logger.error("\nTo get cookies from your browser:")
        logger.error("1. Login to Codeforces in your browser")
        logger.error("2. Open DevTools (F12)")
        logger.error("3. Go to Application/Storage → Cookies → codeforces.com")
        logger.error("4. Copy the values of 'JSESSIONID' and '39ce7' cookies")
        logger.error("5. Add them to your .env file")
        sys.exit(1)
    
    print()
    
    # Load existing contests to avoid re-scraping
    existing_contests = utils.load_existing_contests(config.OUTPUT_DIR)
    
    # Get contest list
    contests = scrape_all_contests(session, group_id)
    
    if not contests:
        logger.warning("No contests found to scrape")
        sys.exit(0)
    
    # Filter out already scraped contests
    contests_to_scrape = [c for c in contests if c['id'] not in existing_contests]
    
    if len(contests_to_scrape) < len(contests):
        logger.info(f"Skipping {len(contests) - len(contests_to_scrape)} already scraped contests")
    
    if not contests_to_scrape:
        logger.info("All contests already scraped!")
        sys.exit(0)
    
    print()
    logger.info(f"Starting to scrape {len(contests_to_scrape)} contests...")
    print()
    
    # Scrape each contest
    successful = 0
    failed = 0
    
    for contest in tqdm(contests_to_scrape, desc="Scraping contests", unit="contest"):
        if scrape_contest(session, contest):
            successful += 1
        else:
            failed += 1
    
    # Summary
    print()
    print("=" * 60)
    print("Scraping Complete!")
    print("=" * 60)
    print(f"✓ Successful: {successful}")
    if failed > 0:
        print(f"✗ Failed: {failed}")
    print(f"📁 Output directory: {config.OUTPUT_DIR}")
    print("=" * 60)
    
    # List generated files
    output_files = list(Path(config.OUTPUT_DIR).glob('contest_*.json'))
    print(f"\nGenerated {len(output_files)} JSON files:")
    for file in sorted(output_files)[:10]:  # Show first 10
        print(f"  - {file.name}")
    if len(output_files) > 10:
        print(f"  ... and {len(output_files) - 10} more")
    
    print()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nScraping interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)
