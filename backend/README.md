# Resume Analyzer Backend

Production-level backend for AI-powered Resume Analysis.

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # API request handlers
│   ├── services/         # Business logic (PDF parsing, analysis)
│   ├── routes/           # API endpoint definitions
│   ├── middleware/       # Multer upload, auth, etc.
│   └── models/           # MongoDB schemas (future)
├── config/               # Database config
├── uploads/              # Uploaded PDF files
├── server.js             # Express server entry point
├── package.json
├── .env                  # Environment variables
└── .gitignore
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
- `.env` file is already created with default values
- Modify as needed for your environment

### 3. Run Development Server
```bash
npm run dev
```
The server will run on `http://localhost:5000`

### 4. Test Health Check
```bash
curl http://localhost:5000/api/health
```

## API Endpoints

### Upload Resume
**POST** `/api/resume/upload`
- Upload a PDF resume
- Returns extracted text and metadata

**Request:**
```bash
curl -X POST http://localhost:5000/api/resume/upload \
  -F "resume=@path/to/resume.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded and processed successfully",
  "data": {
    "fileName": "timestamp_filename.pdf",
    "filePath": "uploads/...",
    "extractedText": "...",
    "metadata": {
      "pages": 1,
      "lineCount": 45,
      "characterCount": 3500,
      "wordCount": 650
    }
  }
}
```

## Current Features (Step 1)
✓ Express server setup
✓ Multer file upload with PDF validation
✓ PDF text extraction using pdf-parse
✓ Error handling
✓ CORS support

## Next Steps (Step 2)
- [ ] Skill extraction using keyword matching
- [ ] ATS score calculation
- [ ] Resume storage in MongoDB
- [ ] API tests

## Error Handling
- File size validation (5MB limit)
- PDF file type validation
- Graceful error responses
- File cleanup on error

## Tech Stack
- Express.js - Web framework
- Multer - File upload
- pdf-parse - PDF text extraction
- CORS - Cross-origin support
- Dotenv - Environment management
