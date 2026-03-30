# Resume Analyzer - AI-Powered Resume Processing

A full-stack application for uploading, parsing, and analyzing resume PDFs with AI-powered extraction and metadata analysis.

## 📋 Project Structure

```
resumeAnalyzer/
├── backend/              # Node.js/Express backend API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
│   ├── uploads/          # Uploaded resume files
│   ├── package.json
│   ├── server.js
│   └── README.md
└── frontend/             # React/HTML frontend
    ├── index.html        # Main HTML file
    ├── style.css         # Styling
    ├── script.js         # Frontend logic
    ├── server.js         # Frontend server
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### 1. Start Backend Server

```bash
cd backend
npm install
npm start
```

Backend runs on **http://localhost:5000**

### 2. Start Frontend Server

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

### 3. Open in Browser

Navigate to **http://localhost:3000** to access the Resume Analyzer.

## 📚 Features

### Frontend Features
- 📤 **Drag & Drop Upload** - Upload PDF resumes easily
- 🎨 **Modern UI** - Beautiful, responsive design
- 📊 **Metadata Display** - View extracted metadata in real-time
- 📝 **Text Preview** - See extracted resume text
- 📋 **Copy to Clipboard** - Quick copy of extracted text
- 📥 **Download as TXT** - Export extracted text as file
- ⚡ **Real-time Processing** - Instant feedback on upload
- 📱 **Fully Responsive** - Works on all devices

### Backend Features
- 🔄 **PDF Parsing** - Extract text from PDF resumes
- 🏷️ **Metadata Extraction** - Email, phone, URL detection
- 📤 **Resume Upload** - Handle file uploads with validation
- ✨ **Text Cleaning** - Clean and format extracted text
- 🔒 **CORS Support** - Cross-origin resource sharing
- ⚠️ **Error Handling** - Comprehensive error management

## 🔌 API Endpoints

### Upload Resume
**POST** `/api/resume/upload`

Upload a PDF resume for processing.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `resume` (PDF file)

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded and processed successfully",
  "data": {
    "fileName": "resume.pdf",
    "filePath": "uploads/resume.pdf",
    "extractedText": "...",
    "metadata": {
      "pages": 1,
      "emails": ["email@example.com"],
      "phones": ["+1-234-567-8900"],
      "urls": ["https://example.com"]
    }
  }
}
```

### Get Resume Details
**GET** `/api/resume/:fileId`

Retrieve previously uploaded resume details (placeholder for future database integration).

**Response:**
```json
{
  "success": true,
  "message": "Resume details retrieved",
  "data": {
    "fileId": "user-provided-id"
  }
}
```

### Health Check
**GET** `/api/health`

Check if the backend server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-03-30T12:24:53.648Z"
}
```

## 🎨 Frontend Interface

### Upload Section
- Drag-and-drop zone for PDF files
- File selection button
- File size and name display
- Upload progress indicator

### Results Section
- **Metadata Panel** - Displays extracted information
  - Number of pages
  - Detected emails
  - Detected phone numbers
  - Detected URLs
- **Text Panel** - Shows full extracted text
- **Action Buttons**
  - Copy extracted text to clipboard
  - Download as TXT file
  - Upload new resume

### Notifications
- Success messages (auto-dismiss)
- Error alerts with details
- File validation feedback

## 🛠️ Development

### Backend Structure

**Controllers** (`src/controllers/`)
- `resumeController.js` - Handles resume upload and retrieval

**Services** (`src/services/`)
- `pdfService.js` - PDF parsing and text extraction

**Middleware** (`src/middleware/`)
- `uploadMiddleware.js` - File upload handling with validation

**Routes** (`src/routes/`)
- `resumeRoutes.js` - API endpoint definitions

### Frontend Structure

**HTML** (`index.html`)
- Semantic HTML5 structure
- Accessible form elements
- Error and success message containers

**CSS** (`style.css`)
- Modern CSS Grid and Flexbox layouts
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Custom scrollbar styling

**JavaScript** (`script.js`)
- Event listeners for file upload
- Drag and drop handling
- API communication
- DOM manipulation and updates
- File utilities (size formatting, HTML escaping)

## 📝 Supported File Types

- **PDF** (.pdf) - Supported
- Maximum file size: **10 MB**

## 🎯 Usage

1. **Navigate** to http://localhost:3000
2. **Upload** a resume PDF by dragging or clicking
3. **View** extracted text and metadata
4. **Copy** the text or download as TXT
5. **Upload** another resume to repeat

## 🔐 Security Considerations

- File size validation (10 MB limit)
- File type validation (PDF only)
- CORS enabled for cross-origin requests
- Automatic file cleanup on errors
- Input sanitization and HTML escaping

## 🌐 Environment Variables

Backend can be configured with `.env` file:

```env
PORT=5000
NODE_ENV=development
```

Frontend automatically connects to `http://localhost:5000/api`

## 🐛 Troubleshooting

### Backend Issues

**Error: Cannot find module**
- Run `npm install` in backend directory

**Server won't start**
- Check if port 5000 is already in use
- Change PORT in `.env` file

**CORS errors**
- Frontend must be on same machine or CORS is enabled

### Frontend Issues

**Cannot connect to backend**
- Verify backend is running on `http://localhost:5000`
- Check browser console for error messages

**File upload fails**
- Ensure file is PDF format
- Check file size (max 10 MB)
- Verify backend has write permission for uploads folder

## 📦 Dependencies

### Backend
- `express` - Web framework
- `multer` - File upload handling
- `pdf-parse` - PDF text extraction
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment configuration
- `axios` - HTTP client

### Frontend
- `express` - Server framework for static files
- `cors` - Cross-origin resource sharing

## 🚀 Deployment

### Production Build

**Backend:**
```bash
NODE_ENV=production npm start
```

**Frontend:**
```bash
npm start
```

For production deployment:
- Use a reverse proxy (nginx)
- Enable HTTPS
- Set proper environment variables
- Use process manager (PM2)

## 📈 Future Enhancements

- [ ] Database integration for storing resumes
- [ ] AI-powered resume analysis and scoring
- [ ] Resume templates and formatting
- [ ] Batch resume processing
- [ ] Advanced metadata extraction
- [ ] Resume comparison features
- [ ] Export to multiple formats (DOCX, JSON)
- [ ] User authentication and accounts
- [ ] Resume versioning

## 📄 License

ISC

## 👨‍💻 Author

Resume Analyzer Team

## 📞 Support

For issues or questions, please check the troubleshooting section or review the API documentation.

---

**Backend:** http://localhost:5000  
**Frontend:** http://localhost:3000  
**API Base:** http://localhost:5000/api
