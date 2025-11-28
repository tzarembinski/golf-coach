# Quick Start Guide

Get your Golf Coach API running in 5 minutes!

## Step 1: Setup Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows
```

## Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

## Step 3: Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Anthropic API key
# Get your key from: https://console.anthropic.com/
```

Your `.env` should look like:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

## Step 4: Run the Server

```bash
python run.py
```

That's it! Your API is now running at http://localhost:8000

## Test It Out

Open http://localhost:8000/docs in your browser to see the interactive API documentation.

### Test with cURL

```bash
# Health check
curl http://localhost:8000/health

# Analyze a swing (replace with your image path)
curl -X POST "http://localhost:8000/api/swings/analyze" \
  -F "address=@path/to/your/golf-swing.jpg"

# Get history
curl http://localhost:8000/api/swings/history
```

## Next Steps

1. Check out the full README.md for detailed documentation
2. Explore the API docs at http://localhost:8000/docs
3. Upload some golf swing images to test the analysis
4. Review the code structure in the `app/` directory

## Common Issues

**"ANTHROPIC_API_KEY not found"**
- Make sure you created `.env` file (not `.env.example`)
- Verify your API key is correct

**"Port 8000 already in use"**
- Change `API_PORT=8001` in your `.env` file

**"Module not found"**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

## Need Help?

Check the main README.md for troubleshooting and detailed documentation.
