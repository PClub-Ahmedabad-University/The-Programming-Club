# Clash of Codes Contest Scraper

A Python-based web scraper for extracting contest data from private Codeforces group contests. Generates normalized JSON snapshots of participant performance for use in a Rewind feature.

## Features

- 🔐 **Secure Authentication** - Login to private Codeforces groups
- 📊 **Complete Data Extraction** - Scrapes rankings, problems solved, solve times, and more
- 💾 **Normalized JSON Output** - One file per contest, ready for frontend consumption
- ⚡ **Smart Caching** - Skips already scraped contests
- 🔄 **Retry Logic** - Handles network failures gracefully
- 📝 **Detailed Logging** - Track scraping progress and errors

## Project Structure

```
clash_of_codes_scraper/
├── scraper.py          # Main scraper script
├── config.py           # Configuration management
├── utils.py            # Helper functions (login, parsing, etc.)
├── requirements.txt    # Python dependencies
├── .env.example        # Example environment configuration
├── .env               # Your actual configuration (create this)
└── data/              # Output directory for JSON files
    ├── contest_1234.json
    ├── contest_1235.json
    └── ...
```

## Installation

### 1. Clone or Navigate to Project

```bash
cd /Users/jay/Desktop/clash_of_codes/projects/clash_of_codes_scraper
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or if using a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Required
GROUP_URL=https://codeforces.com/group/YOUR_GROUP_ID/contests
USERNAME=your_codeforces_username
PASSWORD=your_codeforces_password

# Optional
OUTPUT_DIR=./data/
CONTEST_IDS=  # Leave empty for all, or specify: 1234,1235,1236

# Contest Classification (optional)
WEEKLY_CONTEST_IDS=1234,1235,1236
BATTLE_CONTEST_IDS=1237,1238,1239
```

## Usage

### Basic Usage - Scrape All Contests

```bash
python scraper.py
```

This will:
1. Login to Codeforces with your credentials
2. Fetch the list of all contests in your group
3. Scrape standings and participant data
4. Save each contest as `contest_{id}.json` in the `data/` folder

### Scrape Specific Contests

Set `CONTEST_IDS` in your `.env` file:

```bash
CONTEST_IDS=1234,1235,1236
```

Then run:

```bash
python scraper.py
```

### Re-run Safely

The scraper automatically skips contests that have already been scraped (existing JSON files in `data/`). To force re-scraping, delete the specific JSON file or the entire `data/` folder.

## Output Format

Each contest is saved as a JSON file with the following structure:

```json
{
  "contestId": "1234",
  "title": "Weekly Contest 1",
  "type": "weekly",
  "participants": {
    "tourist": {
      "rank": 12,
      "solved": 5,
      "attempted": 6,
      "solveTimeline": [
        {
          "problem": "A",
          "time": 180,
          "status": "AC",
          "tags": []
        },
        {
          "problem": "B",
          "time": 450,
          "status": "AC",
          "tags": []
        }
      ]
    },
    "petr": {
      "rank": 5,
      "solved": 6,
      "attempted": 6,
      "solveTimeline": [...]
    }
  }
}
```

### Field Descriptions

- `contestId` - Unique contest identifier
- `title` - Contest name
- `type` - Contest type (`weekly`, `battle`, or `unknown`)
- `participants` - Dictionary keyed by participant handle
  - `rank` - Final rank in the contest
  - `solved` - Number of problems solved
  - `attempted` - Number of problems attempted
  - `solveTimeline` - Array of problem solutions
    - `problem` - Problem identifier (A, B, C, etc.)
    - `time` - Solve time in seconds from contest start
    - `status` - Verdict (`AC`, `WA`, etc.)
    - `tags` - Problem tags/topics (currently empty, requires additional API calls)

## Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROUP_URL` | Yes | - | URL of your Codeforces group contests page |
| `USERNAME` | Yes | - | Your Codeforces username |
| `PASSWORD` | Yes | - | Your Codeforces password |
| `OUTPUT_DIR` | No | `./data/` | Directory to save JSON files |
| `CONTEST_IDS` | No | All contests | Comma-separated list of specific contests to scrape |
| `WEEKLY_CONTEST_IDS` | No | - | Contests to mark as type "weekly" |
| `BATTLE_CONTEST_IDS` | No | - | Contests to mark as type "battle" |
| `MAX_RETRIES` | No | `3` | Number of retry attempts for failed requests |
| `REQUEST_TIMEOUT` | No | `30` | Request timeout in seconds |
| `RETRY_DELAY` | No | `2` | Delay between retries in seconds |

## Troubleshooting

### Login Fails

- Verify your username and password in `.env`
- Check if Codeforces is accessible
- Ensure you're not being rate-limited

### No Contests Found

- Verify `GROUP_URL` is correct
- Make sure you have access to the group
- Check if the group has any contests

### Permission Denied

- Ensure you're logged into the correct account
- Verify you're a member of the private group
- Some contests may have restricted access

### Missing Data

- Some contests may not have standings available yet
- Private contests may have different HTML structure
- Check logs for specific parsing errors

## Extending the Scraper

### Adding Problem Tags

To fetch problem tags, you'll need to make additional API calls to Codeforces:

```python
# In utils.py, modify the parse_standings function
def get_problem_tags(contest_id: str, problem_index: str) -> List[str]:
    """Fetch problem tags from Codeforces API"""
    api_url = f"https://codeforces.com/api/contest.standings?contestId={contest_id}"
    # Implement API call and parse tags
    pass
```

### JavaScript-Heavy Pages

If your group uses JavaScript-rendered pages, switch to `playwright`:

```bash
pip install playwright
playwright install chromium
```

Then modify `utils.py` to use Playwright instead of requests.

## Security Notes

- **Never commit `.env` file** - It contains your password
- `.env` is already in `.gitignore`
- Use environment variables in production
- Consider using API keys if available

## Performance

- **Rate Limiting**: Built-in 1-second delay between contests
- **Caching**: Automatically skips already scraped contests
- **Retries**: 3 attempts per request with exponential backoff

## Integration with Rewind Feature

The generated JSON files are designed to work seamlessly with your Rewind feature:

1. Upload JSON files to your backend
2. Import them into your database
3. Use the normalized format to calculate statistics
4. Display in the Rewind UI

Example integration:

```javascript
// Load contest data
const contestData = require('./data/contest_1234.json');

// Access participant stats
const userStats = contestData.participants['tourist'];
console.log(`Rank: ${userStats.rank}`);
console.log(`Solved: ${userStats.solved}/${userStats.attempted}`);
```

## Contributing

Feel free to extend this scraper with additional features:
- Submission details parsing
- Problem difficulty extraction
- Rating changes tracking
- Team contest support

## License

This project is for educational purposes. Respect Codeforces' terms of service and rate limits.

## Support

For issues or questions:
- Check the logs for detailed error messages
- Verify your configuration in `.env`
- Ensure Codeforces is accessible and you have proper permissions

---

**Happy Scraping! 🚀**
