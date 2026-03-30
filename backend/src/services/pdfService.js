const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{text: string, pages: number}>}
 */
const extractTextFromPDF = async (filePath) => {
  try {
    // Read the PDF file
    const pdfBuffer = await fs.readFile(filePath);
    
    // Parse PDF
    const pdfData = await pdfParse(pdfBuffer);
    
    return {
      text: pdfData.text,
      pages: pdfData.numpages,
      success: true
    };
  } catch (error) {
    console.error('PDF Parsing Error:', error.message);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Clean and normalize extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

/**
 * Extract metadata from PDF text
 * @param {string} text - Extracted text
 * @returns {object} - Extracted metadata
 */
const extractMetadata = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Extract emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex) || [];

  // Extract phone numbers
  const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g;
  const phones = text.match(phoneRegex) || [];

  // Extract URLs
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  
  return {
    firstLine: lines[0] || '',
    lineCount: lines.length,
    characterCount: text.length,
    wordCount: text.split(/\s+/).length,
    emails: [...new Set(emails)],
    phones: [...new Set(phones)],
    urls: [...new Set(urls)]
  };
};

module.exports = {
  extractTextFromPDF,
  cleanText,
  extractMetadata
};
