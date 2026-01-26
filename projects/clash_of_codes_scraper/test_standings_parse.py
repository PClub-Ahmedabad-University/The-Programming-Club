import requests
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup

load_dotenv()

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
})
session.cookies.set('JSESSIONID', os.getenv('CODEFORCES_SESSION'), domain='.codeforces.com')
session.cookies.set('39ce7', os.getenv('CODEFORCES_39CE7'), domain='.codeforces.com')
session.cookies.set('cf_clearance', os.getenv('CODEFORCES_CF_CLEARANCE'), domain='.codeforces.com')

# Fetch standings
url = "https://codeforces.com/group/AglxI8B75G/contest/666730/standings"
response = session.get(url)

print(f"Status: {response.status_code}\n")

soup = BeautifulSoup(response.text, 'html.parser')
table = soup.find('table', class_='standings')

if not table:
    print("No standings table found!")
else:
    print("Found standings table\n")
    
    # Find participant rows
    rows = table.find_all('tr', attrs={'participantid': True})
    print(f"Participant rows: {len(rows)}\n")
    
    if rows:
        print("=== First Row Analysis ===")
        row = rows[0]
        
        # Get all TDs
        tds = row.find_all('td')
        print(f"Total TDs: {len(tds)}\n")
        
        # Print each TD with its class
        for i, td in enumerate(tds):
            classes = td.get('class', [])
            text = td.get_text(strip=True)[:50]
            print(f"TD[{i}]: classes={classes}")
            print(f"        text='{text}'")
            
            # If this looks like a party cell, show more detail
            if 'party' in ' '.join(classes):
                print(f"        HTML: {str(td)[:300]}")
            print()
