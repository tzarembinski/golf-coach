# Golf Swing Analyzer

A full-stack application for analyzing golf swings using Claude AI vision capabilities. Upload swing images, get detailed AI analysis, track your progress, and compare swings over time.

## Overview

This project consists of two main components:
- **Backend (Phase 1)**: FastAPI-based REST API with Claude AI integration
- **Frontend (Phase 2)**: React web application with modern UI/UX

## Features

### Backend
- **Swing Analysis**: Upload 1-4 golf swing images and receive expert AI analysis
- **Position Support**: Analyze different swing positions (address, top, impact, follow-through)
- **History Tracking**: Store and retrieve past swing analyses with timestamps
- **Claude AI Integration**: Powered by Anthropic's Claude for detailed swing feedback
- **RESTful API**: Clean, well-documented endpoints with Pydantic validation

### Frontend
- **Image Upload**: Drag-and-drop or camera capture for swing images
- **Real-time Analysis**: View detailed AI analysis with position-by-position breakdowns
- **Swing History**: Browse all your past analyses with search and filtering
- **Comparison View**: Compare two swings side-by-side
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Golf-Themed UI**: Professional green color scheme with clean, modern design

## Tech Stack

### Backend
- **Python 3.10+**
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - Async ORM for database operations
- **SQLite** - Local database
- **Anthropic Claude** - AI vision model for swing analysis
- **Pydantic** - Data validation and settings management

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications

## Quick Start

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### 1. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the backend
python run.py
```

Backend will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if backend is on different URL

# Run the frontend
npm run dev
```

Frontend will be available at: http://localhost:5173

### 3. Start Using the App

1. Open http://localhost:5173 in your browser
2. Upload golf swing images (1-4 positions)
3. Click "Analyze Swing"
4. Review your detailed AI-powered analysis
5. View history and compare swings over time

## Project Structure

```
golf-coach/
├── app/                    # Backend (Python/FastAPI)
│   ├── main.py            # FastAPI application entry point
│   ├── config.py          # Configuration and settings
│   ├── database.py        # Database setup
│   ├── models/            # Database models and schemas
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic and Claude integration
│   └── utils/             # Utility functions
├── frontend/              # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # State management
│   │   ├── services/      # API integration
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── .env                   # Backend environment variables (create from .env.example)
├── requirements.txt       # Backend dependencies
├── run.py                 # Backend startup script
└── README.md             # This file
```

## API Endpoints

### Analyze Swing
```
POST /analyze-swing
```
Upload swing images (form-data) and receive AI analysis

### Get History
```
GET /swing-history
```
Retrieve list of past swing analyses

### Get Specific Swing
```
GET /swing-history/{id}
```
Get detailed analysis for a specific swing

### Delete Swing
```
DELETE /swing-history/{id}
```
Delete a swing analysis

See full API documentation at http://localhost:8000/docs when the backend is running.

## Development

### Backend Development

```bash
# Run with auto-reload
python run.py

# Or use uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Build for Production

**Backend:**
```bash
# Use gunicorn or similar for production
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Frontend:**
```bash
cd frontend
npm run build
# Built files will be in frontend/dist/
```

## Configuration

### Backend (.env)
```env
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=sqlite:///./golf_coach.db
DEBUG_MODE=false
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Usage Guide

### Analyzing a Swing

1. Navigate to the home page
2. Upload images for one or more swing positions:
   - **Address**: Setup position before the swing
   - **Top**: Top of the backswing
   - **Impact**: Moment of ball contact
   - **Follow-Through**: Finish position
3. Click "Analyze Swing" button
4. Wait for Claude AI to analyze (usually 5-15 seconds)
5. Review detailed analysis with scores and recommendations

### Viewing History

1. Click "History" in the navigation
2. Browse all your past analyses
3. Use search to filter by date or content
4. Sort by date or score
5. Click "View" to see full analysis details

### Comparing Swings

1. Go to History page
2. Click on two different swing cards to select them
3. Click "Compare (2/2)" button
4. View side-by-side comparison with images and analysis

## Architecture Notes

### Image Storage
Images are stored as base64 in SQLite for simplicity in Phase 1. Future enhancements may include cloud storage (S3, etc.).

### State Management
Frontend uses React Context API for global state management (swing history, selections, etc.).

### API Communication
Frontend communicates with backend via REST API with proper error handling and loading states.

### Async Operations
Backend uses async/await throughout for non-blocking operations and better performance.

## Troubleshooting

### Backend Issues

**"ANTHROPIC_API_KEY not found"**
- Ensure `.env` file exists in the root directory
- Verify API key is set correctly in `.env`

**Port already in use**
- Change port in `run.py` or when running uvicorn
- Kill the process using the port: `lsof -ti:8000 | xargs kill -9`

**Database errors**
- Delete `golf_coach.db` to reset the database

### Frontend Issues

**API connection errors**
- Confirm backend is running on http://localhost:8000
- Check CORS settings in backend
- Verify `VITE_API_URL` in frontend `.env`

**Images not uploading**
- Check image size (max 10MB)
- Ensure format is JPEG, PNG, or WebP
- Verify backend is running

**Build errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Future Enhancements

- [ ] User authentication and profiles
- [ ] Video analysis support
- [ ] Progress tracking charts and metrics
- [ ] Social features (share swings, follow instructors)
- [ ] Mobile app (React Native)
- [ ] Cloud storage for images
- [ ] Real-time coaching mode
- [ ] Integration with launch monitors
- [ ] PostgreSQL migration for production
- [ ] Caching and performance optimization

## Contributing

This is a private project. For questions or issues, please contact the project maintainer.

## License

Private project - All rights reserved

## Support

For detailed backend documentation, see `README.md` in the root directory.
For detailed frontend documentation, see `frontend/README.md`.

For API documentation, visit http://localhost:8000/docs when the backend is running.
