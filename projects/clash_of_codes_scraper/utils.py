"""
Utility functions for the Clash of Codes scraper.
Handles authentication, HTML parsing, data normalization, and file operations.
"""

import requests
import time
import json
import logging
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Any
from pathlib import Path

import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


class CodeforcesSession:
    """Handles authentication and session management for Codeforces."""
    
    def __init__(self, username: str = None, password: str = None, session_cookie: str = None, cookie_39ce7: str = None, cf_clearance: str = None):
        self.username = username
        self.password = password
        self.session_cookie = session_cookie
        self.cookie_39ce7 = cookie_39ce7
        self.cf_clearance = cf_clearance
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
        })
        self.logged_in = False
        self.auth_method = None  # 'cookies' or 'password'
    
    def login(self) -> bool:
        """
        Authenticate with Codeforces using cookies or username/password.
        Returns True if login successful, False otherwise.
        """
        # Try cookie-based authentication first
        if self.session_cookie and self.cookie_39ce7:
            return self._login_with_cookies()
        
        # Fallback to username/password
        elif self.username and self.password:
            return self._login_with_password()
        
        else:
            logger.error("No authentication method provided")
            return False
    
    def _login_with_cookies(self) -> bool:
        """
        Authenticate using session cookies from browser.
        Returns True if cookies are valid, False otherwise.
        """
        try:
            logger.info("Authenticating with session cookies...")
            
            # Set the cookies
            self.session.cookies.set('JSESSIONID', self.session_cookie, domain='.codeforces.com')
            self.session.cookies.set('39ce7', self.cookie_39ce7, domain='.codeforces.com')
            if self.cf_clearance:
                self.session.cookies.set('cf_clearance', self.cf_clearance, domain='.codeforces.com')
            
            # Verify cookies work by accessing a protected page
            test_response = self.session.get(
                'https://codeforces.com/',
                timeout=config.REQUEST_TIMEOUT
            )
            
            # Check if we're logged in by looking for logout link
            if 'Logout' in test_response.text or 'logout' in test_response.text.lower():
                logger.info("✓ Cookie authentication successful!")
                self.logged_in = True
                self.auth_method = 'cookies'
                return True
            else:
                logger.error("✗ Cookies are invalid or expired")
                logger.error("Please update your cookies from browser")
                return False
                
        except Exception as e:
            logger.error(f"Cookie authentication error: {e}")
            return False
    
    def _login_with_password(self) -> bool:
        """
        Authenticate using username and password (legacy method).
        Returns True if login successful, False otherwise.
        """
        try:
            logger.info(f"Attempting to login as {self.username}...")
            
            # Get the login page to extract CSRF token
            login_page = self.session.get(
                'https://codeforces.com/enter',
                timeout=config.REQUEST_TIMEOUT
            )
            
            if login_page.status_code != 200:
                logger.error(f"Failed to load login page: {login_page.status_code}")
                return False
            
            soup = BeautifulSoup(login_page.text, 'lxml')
            
            # Extract CSRF token
            csrf_token = None
            csrf_input = soup.find('input', {'name': 'csrf_token'})
            if csrf_input:
                csrf_token = csrf_input.get('value')
            
            if not csrf_token:
                logger.error("Could not find CSRF token on login page")
                return False
            
            # Prepare login data
            login_data = {
                'csrf_token': csrf_token,
                'action': 'enter',
                'handleOrEmail': self.username,
                'password': self.password,
                'remember': 'on'
            }
            
            # Submit login form
            login_response = self.session.post(
                'https://codeforces.com/enter',
                data=login_data,
                timeout=config.REQUEST_TIMEOUT,
                allow_redirects=True
            )
            
            # Check if login was successful
            if 'Logout' in login_response.text or self.username in login_response.text:
                logger.info("✓ Login successful!")
                self.logged_in = True
                self.auth_method = 'password'
                return True
            else:
                logger.error("✗ Login failed - incorrect credentials or CSRF issue")
                return False
                
        except Exception as e:
            logger.error(f"Password authentication error: {e}")
            return False
    
    def get(self, url: str, max_retries: int = None) -> Optional[requests.Response]:
        """
        Make a GET request with retry logic.
        """
        max_retries = max_retries or config.MAX_RETRIES
        
        for attempt in range(max_retries):
            try:
                response = self.session.get(url, timeout=config.REQUEST_TIMEOUT)
                
                if response.status_code == 200:
                    return response
                elif response.status_code == 403:
                    logger.warning(f"Access forbidden - may need to re-login")
                    return None
                else:
                    logger.warning(f"Request failed with status {response.status_code}")
                    
            except requests.RequestException as e:
                logger.warning(f"Request error (attempt {attempt + 1}/{max_retries}): {e}")
            
            if attempt < max_retries - 1:
                time.sleep(config.RETRY_DELAY)
        
        return None


def extract_contest_list(html: str, group_id: str = None) -> List[Dict[str, Any]]:
    """
    Extract contest IDs and titles from the contests listing page.
    
    Args:
        html: HTML content of the contests page
        group_id: Optional group ID for constructing URLs
    
    Returns:
        List of dicts with contest info: [{'id': '1234', 'title': 'Contest Name', 'url': '...'}, ...]
    """
    soup = BeautifulSoup(html, 'html.parser')  # Use html.parser for better compatibility
    contests = []
    seen_ids = set()
    
    # Find all links that point to contests
    contest_links = soup.find_all('a', href=lambda x: x and '/contest/' in x and 'Enter' in soup.get_text())
    
    for link in contest_links:
        try:
            href = link.get('href')
            if not href or '/contest/' not in href:
                continue
            
            # Skip virtual participation and standings links
            if '/virtual' in href or '/standings' in href or '/problems' in href:
                continue
            
            # Extract contest ID from URL like /group/ABC/contest/123456 or /contest/123456
            parts = href.split('/contest/')
            if len(parts) < 2:
                continue
            
            contest_id = parts[1].split('/')[0].split('?')[0]
            
            # Skip if we've already seen this contest
            if contest_id in seen_ids or not contest_id.isdigit():
                continue
            seen_ids.add(contest_id)
            
            # Try to find the title - it's usually in the parent element or nearby text
            # Look for the parent td or nearby text
            parent = link.find_parent('td')
            if parent:
                # Get the first text node (before the link)
                title_text = parent.get_text(separator='|', strip=True).split('|')[0]
                # Clean up the title
                title = title_text.replace('Enter »', '').replace('Enter', '').strip()
            else:
                title = f"Contest {contest_id}"
            
            # Construct standings URL
            if group_id:
                standings_url = f"https://codeforces.com/group/{group_id}/contest/{contest_id}/standings"
            else:
                standings_url = f"https://codeforces.com/contest/{contest_id}/standings"
            
            contests.append({
                'id': contest_id,
                'title': title,
                'url': standings_url
            })
        except Exception as e:
            logger.warning(f"Error parsing contest link: {e}")
            continue
    
    logger.info(f"Found {len(contests)} contests")
    return contests


def parse_standings(html: str, contest_id: str) -> Dict[str, Any]:
    """
    Parse contest standings page and extract participant data.
    
    Args:
        html: HTML content of the standings page
        contest_id: Contest ID for reference
    
    Returns:
        Dict with normalized contest data
    """
    soup = BeautifulSoup(html, 'html.parser')  # Use html.parser for better compatibility
    
    # Extract contest title
    title_element = soup.find('title')
    title = title_element.text.strip() if title_element else f"Contest {contest_id}"
    title = title.split(' - ')[0].strip()  # Remove "Codeforces" suffix
    
    participants = {}
    
    # Find the standings table
    standings_table = soup.find('table', class_='standings')
    
    if not standings_table:
        logger.warning(f"No standings table found for contest {contest_id}")
        return {
            'contestId': contest_id,
            'title': title,
            'participants': {}
        }
    
    # Extract problem list
    problem_headers = standings_table.find_all('th', class_='standings-cell_problem-header')
    problems = []
    for header in problem_headers:
        problem_link = header.find('a')
        if problem_link:
            problem_index = problem_link.text.strip()
            problems.append(problem_index)
    
    # Parse participant rows - note: attribute is lowercase 'participantid' not 'participantId'
    rows = standings_table.find_all('tr', attrs={'participantid': True})
    
    for row in rows:
        try:
            # Get all TD elements
            tds = row.find_all('td')
            
            if len(tds) < 3:
                continue
            
            # TD[0] = rank (no class)
            try:
                rank = int(tds[0].text.strip())
            except:
                rank = 0
            
            # TD[1] = contestant cell with handle
            contestant_cell = tds[1]
            handle_link = contestant_cell.find('a')
            if not handle_link:
                # Try getting text directly (might be unlinked)
                handle = contestant_cell.text.strip()
                if not handle or handle == '#':
                    continue
            else:
                handle = handle_link.text.strip()
            
            # Remove trailing # if present
            handle = handle.rstrip('#')
            
            if not handle:
                continue
            
            # TD[2] = solved count
            try:
                solved = int(tds[2].text.strip())
            except:
                solved = 0
            
            # TD[3] = penalty/points (skip)
            # TD[4+] = problem cells (time submissions)
            
            solve_timeline = []
            attempted = 0
            
            # Problems start from index 4 (0=rank, 1=name, 2=solved, 3=penalty, 4+=problems)
            problem_cells = tds[4:] if len(tds) > 4 else []
            
            for idx, cell in enumerate(problem_cells):
                if idx >= len(problems):
                    break
                
                problem_index = problems[idx]
                cell_text = cell.text.strip()
                
                # Skip empty cells
                if not cell_text:
                    continue
                
                # Cell contains time like "+00:12" = accepted
                # Cell contains negative penalty like "-1" = wrong answer
                # Cell contains "?" = attempted but no result yet
                
                if cell_text and cell_text != '--':
                    attempted += 1
                    
                    if cell_text.startswith('+'):
                        # Accepted - parse time
                        time_str = cell_text[1:]  # Remove '+'
                        try:
                            # Format: "HH:MM" or "MM:SS"
                            parts = time_str.split(':')
                            if len(parts) == 2:
                                hours_or_mins = int(parts[0])
                                mins_or_secs = int(parts[1])
                                # Assume format is MM:SS for contests
                                solve_time = hours_or_mins * 60 + mins_or_secs
                            else:
                                solve_time = 0
                        except:
                            solve_time = 0
                        
                        solve_timeline.append({
                            'problem': problem_index,
                            'time': solve_time,
                            'status': 'AC',
                            'tags': []
                        })
                    elif cell_text.startswith('-') or cell_text == '?':
                        # Wrong answer or pending
                        solve_timeline.append({
                            'problem': problem_index,
                            'time': 0,
                            'status': 'WA' if cell_text.startswith('-') else 'PENDING',
                            'tags': []
                        })
            
            participants[handle] = {
                'rank': rank,
                'solved': solved,
                'attempted': attempted,
                'solveTimeline': solve_timeline
            }
            
        except Exception as e:
            logger.warning(f"Error parsing participant row: {e}")
            continue
    
    logger.info(f"Parsed {len(participants)} participants for contest {contest_id}")
    
    return {
        'contestId': contest_id,
        'title': title,
        'participants': participants
    }


def save_contest_json(contest_data: Dict[str, Any], output_dir: str = None) -> bool:
    """
    Save contest data to a JSON file.
    
    Args:
        contest_data: Normalized contest data
        output_dir: Directory to save the file (defaults to config.OUTPUT_DIR)
    
    Returns:
        True if successful, False otherwise
    """
    output_dir = output_dir or config.OUTPUT_DIR
    contest_id = contest_data.get('contestId', 'unknown')
    
    output_path = Path(output_dir) / f"contest_{contest_id}.json"
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(contest_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"✓ Saved: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to save {output_path}: {e}")
        return False


def load_existing_contests(output_dir: str = None) -> set:
    """
    Load list of already scraped contest IDs.
    
    Returns:
        Set of contest IDs that have been scraped
    """
    output_dir = output_dir or config.OUTPUT_DIR
    existing = set()
    
    for file in Path(output_dir).glob('contest_*.json'):
        # Extract contest ID from filename
        contest_id = file.stem.replace('contest_', '')
        existing.add(contest_id)
    
    if existing:
        logger.info(f"Found {len(existing)} existing contest files")
    
    return existing


def determine_contest_type(contest_id: str) -> str:
    """
    Determine if a contest is 'weekly' or 'battle' based on configuration.
    
    Args:
        contest_id: Contest ID to classify
    
    Returns:
        'weekly', 'battle', or 'unknown'
    """
    if contest_id in config.WEEKLY_CONTEST_IDS:
        return 'weekly'
    elif contest_id in config.BATTLE_CONTEST_IDS:
        return 'battle'
    else:
        return 'unknown'
