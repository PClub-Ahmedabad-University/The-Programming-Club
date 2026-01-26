import requests
import os
from dotenv import load_dotenv

load_dotenv()

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
})
session.cookies.set('JSESSIONID', os.getenv('CODEFORCES_SESSION'), domain='.codeforces.com')
session.cookies.set('39ce7', os.getenv('CODEFORCES_39CE7'), domain='.codeforces.com')
session.cookies.set('cf_clearance', os.getenv('CODEFORCES_CF_CLEARANCE'), domain='.codeforces.com')

# Fetch a standings page
url = "https://codeforces.com/group/AglxI8B75G/contest/666730/standings"
response = session.get(url)

print(f"Status: {response.status_code}")

# Save to file
with open('debug_standings.html', 'w', encoding='utf-8') as f:
    f.write(response.text)
print("Saved to debug_standings.html")

# Check for standings table
from bs4 import BeautifulSoup
soup = BeautifulSoup(response.text, 'html.parser')

# Look for tables
tables = soup.find_all('table')
print(f"\nFound {len(tables)} tables")

# Look for standings table specifically
standings_table = soup.find('table', class_='standings')
print(f"Standings table: {standings_table is not None}")

# Look for any table with "standings" in class
for i, table in enumerate(tables):
    classes = table.get('class', [])
    print(f"Table {i+1}: classes = {classes}")
