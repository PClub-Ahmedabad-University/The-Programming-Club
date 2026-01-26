import requests
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv

load_dotenv()

# Use cookies from .env
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
})
session.cookies.set('JSESSIONID', os.getenv('CODEFORCES_SESSION'), domain='.codeforces.com')
session.cookies.set('39ce7', os.getenv('CODEFORCES_39CE7'), domain='.codeforces.com')
session.cookies.set('cf_clearance', os.getenv('CODEFORCES_CF_CLEARANCE'), domain='.codeforces.com')

# Fetch the contests page
response = session.get('https://codeforces.com/group/AglxI8B75G/contests')
print(f"Status: {response.status_code}")
print(f"URL: {response.url}")

soup = BeautifulSoup(response.text, 'lxml')

# Save HTML for inspection
with open('debug_contests.html', 'w', encoding='utf-8') as f:
    f.write(response.text)
print("HTML saved to debug_contests.html")

# Check for different possible contest row patterns
print("\n=== Looking for contest data ===")

# Pattern 1: data-contestId (case sensitive!)
rows_pattern1 = soup.find_all('tr', attrs={'data-contestId': True})
print(f"Rows with data-contestId: {len(rows_pattern1)}")

# Pattern 2: Any tr with data-contest-id (kebab-case)
rows_pattern2 = soup.find_all('tr', attrs={'data-contest-id': True})
print(f"Rows with data-contest-id: {len(rows_pattern2)}")

# Pattern 3: Look in tables with class datatable
datatables = soup.find_all('table', class_='datatable')
print(f"Tables with class datatable: {len(datatables)}")
if datatables:
    for i, table in enumerate(datatables):
        rows = table.find_all('tr')
        print(f"  Table {i+1}: {len(rows)} rows")

# Pattern 4: Find all contest links
contest_links = soup.find_all('a', href=lambda x: x and '/contest/' in x)
print(f"\nContest links found: {len(contest_links)}")
for link in contest_links[:10]:
    href = link.get('href')
    text = link.text.strip()
    print(f"  {href}: {text[:60]}")

# Check if we're actually logged in
if 'Enter' in response.text or 'Войти' in response.text:
    print("\n⚠️ WARNING: Might not be logged in!")
if 'Logout' in response.text or 'Выход' in response.text:
    print("\n✓ Looks like we're logged in")
