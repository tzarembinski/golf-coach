# Golf Swing Analyzer - Frontend

A modern React web application for analyzing golf swings using AI-powered analysis from Claude.

## Features

- **Image Upload**: Drag-and-drop or camera capture for 4 swing positions (Address, Top, Impact, Follow-Through)
- **AI Analysis**: Get detailed, position-by-position analysis from Claude AI
- **Swing History**: View all your past swing analyses
- **Comparison View**: Compare two swings side-by-side
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Golf-Themed UI**: Professional green color scheme with clean, modern design

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Hot Toast**: Beautiful toast notifications
- **React Icons**: Icon library including golf-specific icons
- **date-fns**: Date formatting utility

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000` (see main project README)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` if your backend is running on a different URL:
```
VITE_API_URL=http://localhost:8000
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ImageUpload.jsx  # Drag-and-drop image upload
│   │   ├── AnalysisResults.jsx  # Display analysis results
│   │   ├── LoadingSpinner.jsx   # Loading indicator
│   │   └── Navigation.jsx   # Top navigation bar
│   ├── pages/              # Page components
│   │   ├── UploadPage.jsx  # Main upload and analyze page
│   │   ├── HistoryPage.jsx # Swing history listing
│   │   ├── AnalysisDetailPage.jsx  # Single analysis view
│   │   └── ComparisonPage.jsx      # Side-by-side comparison
│   ├── context/            # React Context for state management
│   │   └── SwingContext.jsx
│   ├── services/           # API integration
│   │   └── api.js
│   ├── utils/              # Utility functions and constants
│   │   ├── imageUtils.js
│   │   └── constants.js
│   ├── App.jsx            # Main app component with routing
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles and Tailwind config
├── public/                # Static assets
├── index.html            # HTML template
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── vite.config.js        # Vite configuration
```

## Usage

### Analyzing a Swing

1. Navigate to the home page
2. Upload images for one or more swing positions:
   - **Address**: Setup position before the swing
   - **Top**: Top of the backswing
   - **Impact**: Moment of ball contact
   - **Follow-Through**: Finish position
3. Click "Analyze Swing"
4. Wait for Claude AI to analyze your swing
5. Review the detailed analysis and recommendations

### Viewing History

1. Click "History" in the navigation
2. Browse all your past analyses
3. Click "View" on any card to see full details
4. Use the search bar to filter by date or summary
5. Sort by date or score using the dropdown

### Comparing Swings

1. Go to the History page
2. Click on two swing analyses to select them
3. Click "Compare (2/2)"
4. View side-by-side comparison with images and analysis

## API Integration

The frontend communicates with the FastAPI backend through these endpoints:

- `POST /analyze-swing`: Upload swing images for analysis
- `GET /swing-history`: Retrieve all past analyses
- `GET /swing-history/{id}`: Get specific analysis by ID
- `DELETE /swing-history/{id}`: Delete an analysis

## Customization

### Colors

Golf-themed colors are defined in `tailwind.config.js`:

```javascript
colors: {
  golf: {
    green: {
      // Various shades of green
    },
    fairway: '#2d5016',
    rough: '#4a7c59',
  },
}
```

### Component Styles

Common button and card styles are defined in `src/index.css`:

- `.btn-primary`: Primary action button
- `.btn-secondary`: Secondary action button
- `.card`: Card container
- `.input-field`: Form input field

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Images not uploading
- Check that the backend API is running on the correct URL
- Verify image size is under 10MB
- Ensure image format is JPEG, PNG, or WebP

### API connection errors
- Confirm backend is running: `http://localhost:8000`
- Check `.env` file has correct `VITE_API_URL`
- Look for CORS errors in browser console

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## License

See main project LICENSE file.
