const { extractTextFromPDF, cleanText, extractMetadata } = require('../services/pdfService');
const { calculateATSScoreWithAPI } = require('../services/atsScoreService');
const fs = require('fs').promises;

/**
 * Handle resume upload and PDF extraction
 * POST /api/resume/upload
 */
const uploadResume = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Extract text from PDF
    const pdfData = await extractTextFromPDF(filePath);
    
    // Clean the extracted text
    const cleanedText = cleanText(pdfData.text);
    
    // Extract metadata
    const metadata = extractMetadata(cleanedText);

    // Calculate ATS Score using API-enhanced scoring
    let atsScore;
    try {
      atsScore = await calculateATSScoreWithAPI(cleanedText);
      console.log('✓ ATS Score calculated:', atsScore.score);
    } catch (atsError) {
      console.error('✗ ATS Score Error:', atsError.message);
      atsScore = { score: 0, rating: 'Error', breakdown: {}, recommendations: [] };
    }

    // Send response
    res.status(200).json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      data: {
        fileName: fileName,
        filePath: filePath,
        extractedText: cleanedText,
        metadata: {
          pages: pdfData.pages,
          ...metadata
        },
        atsScore: atsScore
      }
    });

  } catch (error) {
    console.error('Upload Error:', error.message);
    
    // Clean up uploaded file if error occurs
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error processing resume'
    });
  }
};

/**
 * Get resume details
 * GET /api/resume/:fileId
 */
const getResumeDetails = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // TODO: Fetch resume from database using fileId
    res.status(200).json({
      success: true,
      message: 'Resume details retrieved',
      data: {
        fileId: fileId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  uploadResume,
  getResumeDetails
};
