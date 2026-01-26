from bs4 import BeautifulSoup

with open('debug_standings.html', 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
table = soup.find('table', class_='standings')
rows = table.find_all('tr', attrs={'participantid': True})

print(f'Found {len(rows)} participant rows\n')

# Analyze first row
row = rows[0]

# Check cell classes
tds = row.find_all('td')
print(f'Total TDs in first row: {len(tds)}\n')

for i, td in enumerate(tds[:8]):
    classes = ' '.join(td.get('class', []))
    text = td.text.strip().replace('\n', ' ')[:40]
    print(f'TD {i}: class="{classes}"')
    print(f'       text="{text}"\n')
