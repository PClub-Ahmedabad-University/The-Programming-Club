import requests, os
from dotenv import load_dotenv
import utils

load_dotenv()

session = requests.Session()
session.headers.update({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'})
session.cookies.set('JSESSIONID', os.getenv('CODEFORCES_SESSION'), domain='.codeforces.com')
session.cookies.set('39ce7', os.getenv('CODEFORCES_39CE7'), domain='.codeforces.com')
session.cookies.set('cf_clearance', os.getenv('CODEFORCES_CF_CLEARANCE'), domain='.codeforces.com')

print("Fetching standings...")
response = session.get('https://codeforces.com/group/AglxI8B75G/contest/666730/standings')
print(f"Status: {response.status_code}\n")

print("Parsing standings...")
result = utils.parse_standings(response.text, '666730')

print(f'Title: {result["title"]}')
print(f'Participants: {len(result["participants"])}\n')

if result['participants']:
    print("First 3 participants:")
    for i, (handle, data) in enumerate(list(result['participants'].items())[:3]):
        print(f'{i+1}. {handle}: rank={data["rank"]}, solved={data["solved"]}, attempted={data["attempted"]}')
        if data["solveTimeline"]:
            print(f'   First solve: {data["solveTimeline"][0]}')
else:
    print("No participants found!")
