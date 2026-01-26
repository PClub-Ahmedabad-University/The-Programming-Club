from bs4 import BeautifulSoup

# Read the saved HTML
with open('debug_contests.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'lxml')

# Check for data-contestId
rows1 = soup.find_all('tr', attrs={'data-contestId': True})
print(f"Rows with data-contestId: {len(rows1)}")

# Check for data-groupContestId
rows2 = soup.find_all('tr', attrs={'data-groupContestId': True})
print(f"Rows with data-groupContestId: {len(rows2)}")

# Try different parser
soup2 = BeautifulSoup(html, 'html.parser')
rows3 = soup2.find_all('tr', attrs={'data-contestId': True})
print(f"Rows with data-contestId (html.parser): {len(rows3)}")

rows4 = soup2.find_all('tr', attrs={'data-groupContestId': True})
print(f"Rows with data-groupContestId (html.parser): {len(rows4)}")

if rows3:
    print("\nFirst row analysis:")
    row = rows3[0]
    print(f"Attributes: {row.attrs}")
    
    first_td = row.find('td')
    if first_td:
        print(f"\nFirst TD text: {first_td.get_text(strip=True)[:100]}")
        
        # Find links
        links = first_td.find_all('a')
        print(f"\nLinks in first TD: {len(links)}")
        for link in links:
            print(f"  - {link.get('href')}: {link.text.strip()}")
