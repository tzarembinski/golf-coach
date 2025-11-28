# Golf Coach API - Phase 1

A FastAPI-based backend for golf swing analysis using Claude AI vision capabilities.

## Features

- **Swing Analysis**: Upload 1-4 golf swing images and receive expert AI analysis
- **Position Support**: Analyze different swing positions (address, top, impact, follow-through)
- **History Tracking**: Store and retrieve past swing analyses with timestamps
- **Claude AI Integration**: Powered by Anthropic's Claude for detailed swing feedback
- **RESTful API**: Clean, well-documented endpoints with Pydantic validation

## Tech Stack

- **Python 3.10+**
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - Async ORM for database operations
- **SQLite** - Local database (easily upgradeable to PostgreSQL)
- **Anthropic Claude** - AI vision model for swing analysis
- **Pydantic** - Data validation and settings management

## Project Structure

```
golf-coach/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and settings
│   ├── database.py          # Database setup and session management
│   ├── models/
│   │   ├── __init__.py
│   │   ├── swing.py         # SQLAlchemy models
│   │   └── schemas.py       # Pydantic schemas for validation
│   ├── routers/
│   │   ├── __init__.py
│   │   └── swings.py        # Swing analysis endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── claude_service.py    # Claude API integration
│   │   └── swing_service.py     # Database operations
│   └── utils/
│       ├── __init__.py
│       └── image_utils.py   # Image validation and conversion
├── .env.example             # Example environment variables
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Setup Instructions

### 1. Clone and Navigate

```bash
cd golf-coach
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

Get your API key from: https://console.anthropic.com/

### 5. Run the Application

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or using Python directly:

```bash
python -m app.main
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### 1. Analyze Swing
**POST** `/api/swings/analyze`

Upload 1-4 images for swing analysis.

**Parameters** (form-data):
- `address` (file, optional): Setup position image
- `top` (file, optional): Top of backswing image
- `impact` (file, optional): Impact position image
- `follow_through` (file, optional): Follow-through image

**Constraints**:
- At least 1 image required
- Max 4 images
- Supported formats: JPEG, PNG
- Max size per image: 5MB

**Response**:
```json
{
  "swing_id": 1,
  "analysis": "Full detailed analysis text...",
  "rating": 7,
  "summary": "Brief summary of the swing...",
  "created_at": "2024-01-15T10:30:00Z",
  "message": "Swing analyzed successfully"
}
```

### 2. Get Swing History
**GET** `/api/swings/history`

Retrieve list of past swing analyses.

**Query Parameters**:
- `limit` (int, default: 50, max: 100): Number of results
- `offset` (int, default: 0): Pagination offset

**Response**:
```json
{
  "total": 10,
  "swings": [
    {
      "id": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "summary": "Good setup position, needs work on backswing...",
      "rating": 7,
      "positions_analyzed": "address,top,impact",
      "thumbnail": "base64_encoded_thumbnail..."
    }
  ]
}
```

### 3. Get Specific Swing
**GET** `/api/swings/{swing_id}`

Get detailed analysis for a specific swing.

**Response**:
```json
{
  "id": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "images": {
    "address": "base64_encoded_image...",
    "top": "base64_encoded_image..."
  },
  "analysis": "Full detailed analysis...",
  "summary": "Brief summary...",
  "rating": 7,
  "positions_analyzed": "address,top"
}
```

## Testing with cURL

### Analyze a swing:

```bash
curl -X POST "http://localhost:8000/api/swings/analyze" \
  -F "address=@/path/to/address.jpg" \
  -F "top=@/path/to/top.jpg" \
  -F "impact=@/path/to/impact.jpg"
```

### Get history:

```bash
curl "http://localhost:8000/api/swings/history?limit=10"
```

### Get specific swing:

```bash
curl "http://localhost:8000/api/swings/1"
```

## Development

### Running in Development Mode

Set `DEBUG_MODE=true` in your `.env` file for:
- Auto-reload on code changes
- Detailed SQL query logging
- More verbose error messages

### Database

The SQLite database file (`golf_coach.db`) is created automatically on first run.

To reset the database, simply delete the file:
```bash
rm golf_coach.db
```

### Logging

Logs are printed to console with the following format:
```
2024-01-15 10:30:00 - app.routers.swings - INFO - Received 2 images for analysis
```

## Architecture Notes

### Image Storage
Images are currently stored as base64 in the SQLite database. This is intentional for Phase 1 to keep things simple. Future phases will optimize this with:
- Cloud storage (S3, etc.)
- Database references instead of embedded data
- Image compression and optimization

### Async/Await
The entire application uses async/await for:
- Non-blocking database operations
- Concurrent Claude API calls
- Better performance under load

### Error Handling
All endpoints include:
- Input validation with Pydantic
- Image format and size validation
- Helpful error messages
- Proper HTTP status codes

## Future Enhancements (Post-Phase 1)

- User authentication and authorization
- Comparison views for multiple swings
- Progress tracking over time
- Video analysis support
- Cloud storage integration
- Caching layer for performance
- Rate limiting
- PostgreSQL migration for production

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
Make sure you've created a `.env` file with your API key.

### "Module not found" errors
Ensure you've activated your virtual environment and installed dependencies:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Port already in use
Change the port in `.env` or when running:
```bash
uvicorn app.main:app --port 8001
```

## License

Private project - All rights reserved

## Support

For issues or questions, please create an issue in the project repository.
