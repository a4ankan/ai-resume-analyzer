const express = require('express');
const router = express.Router();
const { uploadResume, getResumeDetails } = require('../controllers/resumeController');
const upload = require('../middleware/uploadMiddleware');

/**
 * POST /api/resume/upload
 * Upload and parse resume PDF
 */
router.post('/upload', upload.single('resume'), uploadResume);

/**
 * GET /api/resume/:fileId
 * Get resume details (for future database integration)
 */
router.get('/:fileId', getResumeDetails);

module.exports = router;
