const axios = require('axios');

/**
 * Calculate ATS Score using both local algorithm and optional AI API
 * @param {string} text - Resume text
 * @returns {Promise<object>} - ATS score breakdown
 */
const calculateATSScoreWithAPI = async (text) => {
  try {
    // First, calculate local score
    const localScore = calculateLocalATSScore(text);

    // Try to enhance with external API if available
    let apiScore = null;
    if (process.env.OPENAI_API_KEY) {
      apiScore = await getOpenAIEnhancedScore(text);
    }

    // Combine scores if API succeeded
    if (apiScore) {
      return {
        ...localScore,
        apiEnhanced: true,
        aiRecommendations: apiScore.recommendations,
        aiKeywords: apiScore.keywords,
        score: Math.round((localScore.score + apiScore.score) / 2)
      };
    }

    return localScore;
  } catch (error) {
    console.error('ATS Scoring Error:', error.message);
    // Fall back to local calculation
    return calculateLocalATSScore(text);
  }
};

/**
 * Get AI-enhanced scoring from OpenAI
 */
const getOpenAIEnhancedScore = async (text) => {
  try {
    const prompt = `Analyze this resume and provide:
1. An ATS compatibility score (0-100)
2. Key missing elements (5-8 items)
3. Top keywords found (5-10)
4. Specific improvements needed

Resume text:
${text.substring(0, 2000)}

Respond in JSON format with: {score, keywords, recommendations}`;

    // This is a placeholder - requires actual OpenAI key
    // For now, return null to use local scoring
    return null;
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    return null;
  }
};

/**
 * Local ATS Score Calculation
 */
const calculateLocalATSScore = (text) => {
  const scores = {};
  let totalScore = 0;
  let maxScore = 0;

  // 1. Contact Information (15 points)
  scores.contactInfo = 0;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g;
  const urlRegex = /https?:\/\/[^\s]+/g;
  const linkedinRegex = /linkedin\.com\/in\/[^\s]+/i;

  if (emailRegex.test(text)) scores.contactInfo += 5;
  if (phoneRegex.test(text)) scores.contactInfo += 5;
  if (urlRegex.test(text) || linkedinRegex.test(text)) scores.contactInfo += 5;

  scores.contactInfo = Math.min(scores.contactInfo, 15);
  scores.contactInfoMax = 15;
  totalScore += scores.contactInfo;
  maxScore += 15;

  // 2. Work Experience Keywords (15 points)
  scores.experience = 0;
  const experienceKeywords = [
    'experience', 'worked', 'managed', 'led', 'developed', 'implemented',
    'achieved', 'responsible', 'team', 'project', 'designed', 'built',
    'created', 'improved', 'increased', 'decreased', 'streamlined'
  ];
  const textLower = text.toLowerCase();
  experienceKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) scores.experience += 1;
  });
  scores.experience = Math.min(scores.experience, 15);
  scores.experienceMax = 15;
  totalScore += scores.experience;
  maxScore += 15;

  // 3. Education Section (15 points)
  scores.education = 0;
  const educationKeywords = [
    'bachelor', 'master', 'phd', 'degree', 'diploma', 'university',
    'college', 'graduated', 'education', 'gpa', 'coursework', 'certification',
    'associate', 'b.s', 'b.a', 'm.s', 'm.b.a', 'b.e', 'b.tech'
  ];
  educationKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) scores.education += 1.2;
  });
  scores.education = Math.min(scores.education, 15);
  scores.educationMax = 15;
  totalScore += scores.education;
  maxScore += 15;

  // 4. Skills Section (15 points)
  scores.skills = 0;
  const skillsKeywords = [
    'skills', 'technical', 'proficiency', 'expertise', 'programming',
    'languages', 'tools', 'platforms', 'frameworks', 'libraries',
    'databases', 'software', 'applications', 'systems'
  ];
  skillsKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) scores.skills += 1.2;
  });

  // Bonus for specific tech keywords
  const techKeywords = [
    'python', 'java', 'javascript', 'react', 'angular', 'nodejs',
    'sql', 'mongodb', 'aws', 'docker', 'git', 'agile', 'scrum'
  ];
  techKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) scores.skills += 0.5;
  });

  scores.skills = Math.min(scores.skills, 15);
  scores.skillsMax = 15;
  totalScore += scores.skills;
  maxScore += 15;

  // 5. Formatting & Structure (15 points)
  scores.formatting = 0;
  const lines = text.split('\n').length;

  // Good line breaks indicate structure
  if (lines > 15) scores.formatting += 5;
  else if (lines > 10) scores.formatting += 3;

  // Check for special characters (bad for ATS)
  const specialCharCount = (text.match(/[©®™§¶†‡◆◊●○█]/g) || []).length;
  if (specialCharCount === 0) scores.formatting += 5;

  // Check for section headers
  const sectionHeaders = [
    'summary', 'experience', 'education', 'skills', 'projects',
    'certifications', 'languages', 'awards', 'professional'
  ];
  let headerCount = 0;
  sectionHeaders.forEach(header => {
    if (textLower.includes(header)) headerCount++;
  });
  if (headerCount >= 4) scores.formatting += 5;
  else if (headerCount >= 3) scores.formatting += 3;

  scores.formatting = Math.min(scores.formatting, 15);
  scores.formattingMax = 15;
  totalScore += scores.formatting;
  maxScore += 15;

  // 6. Content Length & Completeness (10 points)
  scores.completeness = 0;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount >= 100) scores.completeness += 2;
  if (wordCount >= 250) scores.completeness += 2;
  if (wordCount >= 400) scores.completeness += 2;
  if (wordCount >= 600) scores.completeness += 2;
  if (wordCount >= 800) scores.completeness += 2;

  scores.completeness = Math.min(scores.completeness, 10);
  scores.completenessMax = 10;
  totalScore += scores.completeness;
  maxScore += 10;

  // Calculate percentage
  const atsPercentage = Math.round((totalScore / maxScore) * 100);

  // Determine rating
  let rating = 'Poor';
  let ratingEmoji = '🔴';
  if (atsPercentage >= 85) {
    rating = 'Excellent';
    ratingEmoji = '🟢';
  } else if (atsPercentage >= 75) {
    rating = 'Good';
    ratingEmoji = '🟢';
  } else if (atsPercentage >= 65) {
    rating = 'Fair';
    ratingEmoji = '🟡';
  } else if (atsPercentage >= 55) {
    rating = 'Average';
    ratingEmoji = '🟠';
  } else {
    rating = 'Poor';
    ratingEmoji = '🔴';
  }

  return {
    score: atsPercentage,
    rating: rating,
    ratingEmoji: ratingEmoji,
    breakdown: {
      contactInfo: {
        score: scores.contactInfo,
        max: scores.contactInfoMax,
        label: 'Contact Information',
        icon: '📞'
      },
      experience: {
        score: scores.experience,
        max: scores.experienceMax,
        label: 'Work Experience',
        icon: '💼'
      },
      education: {
        score: scores.education,
        max: scores.educationMax,
        label: 'Education',
        icon: '🎓'
      },
      skills: {
        score: scores.skills,
        max: scores.skillsMax,
        label: 'Skills',
        icon: '⚙️'
      },
      formatting: {
        score: scores.formatting,
        max: scores.formattingMax,
        label: 'Formatting & Structure',
        icon: '📋'
      },
      completeness: {
        score: scores.completeness,
        max: scores.completenessMax,
        label: 'Content Completeness',
        icon: '📝'
      }
    },
    totalScore: totalScore,
    maxScore: maxScore,
    wordCount: wordCount,
    recommendations: generateDetailedRecommendations(scores, textLower),
    keywords: extractTopKeywords(text)
  };
};

/**
 * Generate detailed ATS improvement recommendations
 */
const generateDetailedRecommendations = (scores, textLower) => {
  const recommendations = [];

  if (scores.contactInfo < 15) {
    recommendations.push({
      priority: 'high',
      emoji: '📞',
      title: 'Add Contact Information',
      description: 'Include email address, phone number, and LinkedIn profile URL in a dedicated contact section at the top'
    });
  }

  if (scores.experience < 12) {
    recommendations.push({
      priority: 'high',
      emoji: '💼',
      title: 'Strengthen Experience Section',
      description: 'Use action verbs like "led", "developed", "managed" and quantify achievements with metrics'
    });
  }

  if (scores.education < 12) {
    recommendations.push({
      priority: 'medium',
      emoji: '🎓',
      title: 'Clarify Education Info',
      description: 'Clearly list degree type, university name, graduation date, and relevant coursework'
    });
  }

  if (scores.skills < 12) {
    recommendations.push({
      priority: 'high',
      emoji: '⚙️',
      title: 'Expand Skills Section',
      description: 'Add a dedicated skills section with technical tools, programming languages, and certifications'
    });
  }

  if (scores.formatting < 12) {
    recommendations.push({
      priority: 'medium',
      emoji: '📋',
      title: 'Improve Formatting',
      description: 'Use standard section headers and avoid special characters or unusual formatting that confuses ATS'
    });
  }

  if (scores.completeness < 8) {
    recommendations.push({
      priority: 'medium',
      emoji: '📝',
      title: 'Add More Content',
      description: 'Expand your resume to 400-800 words by adding more details about achievements and responsibilities'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'info',
      emoji: '✅',
      title: 'Well-Optimized Resume!',
      description: 'Your resume is excellent for ATS systems. Focus on tailoring it to specific job descriptions'
    });
  }

  return recommendations;
};

/**
 * Extract top keywords from resume
 */
const extractTopKeywords = (text) => {
  const techStack = [
    'javascript', 'python', 'java', 'csharp', 'c++', 'php', 'ruby', 'go', 'rust',
    'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask',
    'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
    'git', 'github', 'gitlab', 'bitbucket',
    'agile', 'scrum', 'kanban', 'waterfall',
    'html', 'css', 'sass', 'webpack', 'gulp',
    'rest', 'graphql', 'api', 'microservices', 'cloud'
  ];

  const textLower = text.toLowerCase();
  const foundKeywords = techStack
    .filter(keyword => textLower.includes(keyword))
    .slice(0, 15);

  return foundKeywords;
};

module.exports = {
  calculateATSScoreWithAPI,
  calculateLocalATSScore
};
