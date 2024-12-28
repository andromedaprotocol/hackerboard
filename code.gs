/**
 * Handles form submissions, calculates scores, determines recommendations,
 * sanitizes data, and stores it in the "Submissions" sheet.
 *
 * @param {Object} e - The form submission event object.
 * @returns {ContentService.TextOutput} - A JSON response indicating success or failure.
 */
function doPost(e) {
  try {
    // Get the specific sheet by name.
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Submissions"); // **CHANGE "Submissions" to your sheet name**

    // Check if the sheet exists
    if (!sheet) {
      throw new Error("Sheet 'Submissions' not found.");
    }

    const data = JSON.parse(e.postData.contents);

    // Sanitize any remaining special characters
    const sanitizeText = (text) => {
      if (!text) return '';
      return text.toString().replace(/[^\w\s-]/gi, '');
    };

    // Sanitize array data
    const sanitizeArray = (arr) => {
      if (!Array.isArray(arr)) return '';
      return arr.map(item => sanitizeText(item)).join(', ');
    };

    // Calculate scores for each path
    const scores = calculateScores(data);

    // Determine recommendations based on scores
    const recommendations = getRecommendations(scores);

    // Extract path names and match levels from recommendations
    const formattedRecommendations = recommendations.map(rec => `${rec.path} (${rec.match})`);

    // Write each field to its specific column
    const lastRow = sheet.getLastRow() + 1;

    // Create the values array with sanitized data
    const values = [
      [
        data.name || '',                    // A: Full Name
        data.email || '',                   // B: Email Address
        data.github || '',                  // C: GitHub Profile
        sanitizeText(data.telegram),        // D: Telegram Username
        sanitizeText(data.x),              // E: X/Twitter Username
        data.location || '',                // F: Location
        sanitizeArray(data.spokenLanguages), // G: Spoken Languages
        sanitizeArray(data.frontendSkills), // H: Front-End Skills
        sanitizeArray(data.languages),      // I: Programming Languages
        sanitizeArray(data.tools),          // J: Andromeda Tool Familiarity
        sanitizeArray(data.blockchainExperience), // K: Blockchain Experience
        data.goals || '',                   // L: Goals
        data.experience || '',              // M: Experience Level
        data.hackathonExperience || '',     // N: Hackathon Experience
        data.education || '',               // O: Education
        data.availability || '',            // P: Availability
        data.portfolio || '',               // Q: Portfolio
        data.additionalSkills || '',         // R: Additional Skills
       sanitizeArray(data.aiExperience), // S: AI Experience (NOW CORRECTLY HANDLES ARRAYS)
        data.relevantProjects || '',         // T: Relevant AI Projects
        formattedRecommendations.join(", ") // U: Recommendations
      ]
    ];

    // Write all values at once
    sheet.getRange(lastRow, 1, 1, values[0].length).setValues(values);

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      recommendations: recommendations // Return recommendations in the response
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error in doPost: " + error.toString());
    Logger.log("Stack Trace: " + error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: "An error occurred during form submission: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Calculates scores for each developer path based on the provided data.
 *
 * @param {Object} data - The form submission data.
 * @returns {Object} - An object containing the calculated scores for each path.
 */
function calculateScores(data) {
    // Log the input data for debugging
    Logger.log("Input Data for calculateScores:", JSON.stringify(data, null, 2));

    let scores = {
      hackerboard: 0,
      adosubmission: 0,
      contractors: 0,
      ambassadors: 0,
      ai: 0
    };

    try {
       // Languages
    if (data.languages) {
        Logger.log("Languages:", data.languages);

        if (data.languages.includes('Rust')) {
          scores.hackerboard += 15;
          scores.adosubmission += 15;
          scores.contractors += 10;
          scores.ai += 5;
          Logger.log("  Rust: +15 to Hacker Board, +15 to ADO Submission, +10 to Contractors, +5 to AI");
        }
        if (data.languages.includes('JavaScript')) {
          scores.hackerboard += 8;
          scores.contractors += 10;
          scores.ambassadors += 2;
          scores.ai += 2;
          Logger.log("  JavaScript: +8 to Hacker Board, +10 to Contractors, +2 to Ambassadors, +2 to AI");
        }
        if (data.languages.includes('TypeScript')) {
          scores.hackerboard += 8;
          scores.contractors += 10;
          scores.ai += 2;
          Logger.log("  TypeScript: +8 to Hacker Board, +10 to Contractors, +2 to AI");
        }
        if (data.languages.includes('Python')) {
          scores.hackerboard += 2;
          scores.adosubmission += 2;
          scores.contractors += 5;
          scores.ambassadors += 2;
          scores.ai += 15;
          Logger.log("  Python: +2 to Hacker Board, +2 to ADO Submission, +5 to Contractors, +2 to Ambassadors, +15 to AI");
        }
        if (data.languages.includes('Solidity')) {
          scores.hackerboard += 2;
          scores.adosubmission += 5;
          scores.contractors += 3;
          Logger.log("  Solidity: +2 to Hacker Board, +5 to ADO Submission, +3 to Contractors");
        }
        if (data.languages.includes('Go')) {
          scores.hackerboard += 5;
          scores.adosubmission += 3;
          scores.contractors += 5;
          scores.ai += 3;
          Logger.log("  Go: +5 to Hacker Board, +3 to ADO Submission, +5 to Contractors, +3 to AI");
        }
        if (data.languages.includes('C++')) {
          scores.hackerboard += 3;
          scores.adosubmission += 2;
          scores.contractors += 3;
          scores.ai += 3;
          Logger.log("  C++: +3 to Hacker Board, +2 to ADO Submission, +3 to Contractors, +3 to AI");
        }
        if (data.languages.includes('Other')) {
          scores.hackerboard += 1;
          scores.adosubmission += 1;
          scores.contractors += 1;
          scores.ambassadors += 1;
          scores.ai += 1;
          Logger.log("  Other: +1 to Hacker Board, +1 to ADO Submission, +1 to Contractors, +1 to Ambassadors, +1 to AI");
        }
      }

      // Front-End Skills
    if (data.frontendSkills) {
      Logger.log("Frontend Skills:", data.frontendSkills);

      if (data.frontendSkills.includes('React')) {
        scores.hackerboard += 5;
        scores.adosubmission += 3;
        scores.contractors += 7;
        Logger.log("  React: +5 to Hacker Board, +3 to ADO Submission, +7 to Contractors");
      }
      if (data.frontendSkills.includes('Next.js')) {
        scores.hackerboard += 8;
        scores.adosubmission += 5;
        scores.contractors += 8;
        Logger.log("  Next.js: +8 to Hacker Board, +5 to ADO Submission, +8 to Contractors");
      }
      if (data.frontendSkills.includes('Vue.js')) {
        scores.hackerboard += 5;
        scores.adosubmission += 3;
        scores.contractors += 5;
        Logger.log("  Vue.js: +5 to Hacker Board, +3 to ADO Submission, +5 to Contractors");
      }
      if (data.frontendSkills.includes('Angular')) {
        scores.hackerboard += 5;
        scores.adosubmission += 3;
        scores.contractors += 5;
         Logger.log("  Angular: +5 to Hacker Board, +3 to ADO Submission, +5 to Contractors");
      }
      if (data.frontendSkills.includes('Svelte')) {
        scores.hackerboard += 3;
        scores.adosubmission += 2;
        scores.contractors += 3;
        scores.ai += 1;
        Logger.log("  Svelte: +3 to Hacker Board, +2 to ADO Submission, +3 to Contractors, +1 to AI");
      }
      if (data.frontendSkills.includes('Tailwind CSS')) {
        scores.hackerboard += 7;
        scores.adosubmission += 5;
        scores.contractors += 7;
        scores.ai += 1;
         Logger.log("  Tailwind CSS: +7 to Hacker Board, +5 to ADO Submission, +7 to Contractors, +1 to AI");
      }
      if (data.frontendSkills.includes('ShadCN')) {
        scores.hackerboard += 7;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ai += 1;
        Logger.log("  ShadCN: +7 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +1 to AI");
      }
      if (data.frontendSkills.includes('UI/UX Design')) {
         scores.hackerboard += 3;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ambassadors += 3;
        scores.ai += 3;
          Logger.log("  UI/UX Design: +3 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +3 to Ambassadors, +3 to AI");
      }
      if (data.frontendSkills.includes('Web3.js / Ethers.js')) {
        scores.hackerboard += 5;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ai += 2;
         Logger.log("  Web3.js / Ethers.js: +5 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +2 to AI");
      }
      if (data.frontendSkills.includes('AndromedaJS SDK')) {
        scores.hackerboard += 10;
        scores.adosubmission += 7;
        scores.contractors += 8;
        scores.ai += 2;
        Logger.log("  AndromedaJS SDK: +10 to Hacker Board, +7 to ADO Submission, +8 to Contractors, +2 to AI");
      }
      if (data.frontendSkills.includes('Other')) {
          scores.hackerboard += 1;
          scores.adosubmission += 1;
          scores.contractors += 1;
          scores.ambassadors += 1;
          scores.ai += 1;
          Logger.log("  Other: +1 to Hacker Board, +1 to ADO Submission, +1 to Contractors, +1 to Ambassadors, +1 to AI");
      }
    }

    // Backend Skills
    if (data.backendSkills) {
      Logger.log("Backend Skills:", data.backendSkills);
      if (data.backendSkills.includes('REST APIs')) {
        scores.hackerboard += 5;
        scores.adosubmission += 5;
        scores.contractors += 7;
        scores.ai += 3;
         Logger.log("  REST APIs: +5 to Hacker Board, +5 to ADO Submission, +7 to Contractors, +3 to AI");
      }

      if (data.backendSkills.includes('GraphQL')) {
        scores.hackerboard += 5;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ai += 3;
         Logger.log("  GraphQL: +5 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +3 to AI");
      }
      if (data.backendSkills.includes('Database (SQL/NoSQL)')) {
        scores.hackerboard += 5;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ai += 3;
          Logger.log("  Database (SQL/NoSQL): +5 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +3 to AI");
      }

      if (data.backendSkills.includes('Serverless Functions')) {
        scores.hackerboard += 5;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ai += 2;
          Logger.log("  Serverless Functions: +5 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +2 to AI");
      }
      if (data.backendSkills.includes('Other')) {
          scores.hackerboard += 1;
          scores.adosubmission += 1;
          scores.contractors += 1;
          scores.ambassadors += 1;
          scores.ai += 1;
           Logger.log("  Other: +1 to Hacker Board, +1 to ADO Submission, +1 to Contractors, +1 to Ambassadors, +1 to AI");
      }
    }

    // Andromeda/Cosmos Tools
     if (data.tools) {
      Logger.log("Tools:", data.tools);
        if (data.tools.includes('Andromeda CLI')) {
          scores.hackerboard += 10;
          scores.adosubmission += 8;
          scores.contractors += 7;
          scores.ambassadors += 2;
          scores.ai += 2;
          Logger.log("  Andromeda CLI: +10 to Hacker Board, +8 to ADO Submission, +7 to Contractors, +2 to Ambassadors, +2 to AI");
        }
        if (data.tools.includes('ADO Builder')) {
          scores.hackerboard += 7;
          scores.adosubmission += 10;
          scores.contractors += 5;
          scores.ambassadors += 2;
          scores.ai += 2;
         Logger.log("  ADO Builder: +7 to Hacker Board, +10 to ADO Submission, +5 to Contractors, +2 to Ambassadors, +2 to AI");
        }
       if (data.tools.includes('App Builder')) {
          scores.hackerboard += 5;
          scores.adosubmission += 7;
          scores.contractors += 5;
          scores.ambassadors += 2;
          scores.ai += 2;
          Logger.log("  App Builder: +5 to Hacker Board, +7 to ADO Submission, +5 to Contractors, +2 to Ambassadors, +2 to AI");
        }
        if (data.tools.includes('Andromeda Web App')) {
          scores.hackerboard += 5;
          scores.adosubmission += 5;
          scores.contractors += 5;
          scores.ambassadors += 2;
          scores.ai += 2;
           Logger.log("  Andromeda Web App: +5 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +2 to Ambassadors, +2 to AI");
        }
       if (data.tools.includes('Andromeda Logic Library (ALL)')) {
          scores.hackerboard += 8;
          scores.adosubmission += 8;
          scores.contractors += 5;
          scores.ambassadors += 2;
          scores.ai += 2;
           Logger.log("  Andromeda Logic Library (ALL): +8 to Hacker Board, +8 to ADO Submission, +5 to Contractors, +2 to Ambassadors, +2 to AI");
        }
       if (data.tools.includes('Keplr Wallet')) {
          scores.hackerboard += 5;
          scores.adosubmission += 5;
          scores.contractors += 5;
          scores.ambassadors += 2;
          scores.ai += 2;
          Logger.log("  Keplr Wallet: +5 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +2 to Ambassadors, +2 to AI");
        }
       if (data.tools.includes('CosmWasm')) {
          scores.hackerboard += 12;
          scores.adosubmission += 10;
          scores.contractors += 8;
          scores.ai += 3;
         Logger.log("  CosmWasm: +12 to Hacker Board, +10 to ADO Submission, +8 to Contractors, +3 to AI");
        }
         if (data.tools.includes('Cosmos SDK')) {
          scores.hackerboard += 10;
          scores.adosubmission += 5;
          scores.contractors += 8;
          scores.ai += 3;
           Logger.log("  Cosmos SDK: +10 to Hacker Board, +5 to ADO Submission, +8 to Contractors, +3 to AI");
        }
       if (data.tools.includes('Git')) {
          scores.hackerboard += 5;
          scores.adosubmission += 5;
          scores.contractors += 5;
          scores.ambassadors += 2;
          scores.ai += 3;
           Logger.log("  Git: +5 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +2 to Ambassadors, +3 to AI");
        }
        if (data.tools.includes('GitHub')) {
          scores.hackerboard += 5;
          scores.adosubmission += 5;
          scores.contractors += 5;
          scores.ambassadors += 2;
          scores.ai += 3;
           Logger.log("  GitHub: +5 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +2 to Ambassadors, +3 to AI");
        }
         if (data.tools.includes('Other')) {
            scores.hackerboard += 1;
            scores.adosubmission += 1;
            scores.contractors += 1;
            scores.ambassadors += 1;
            scores.ai += 1;
            Logger.log("  Other: +1 to Hacker Board, +1 to ADO Submission, +1 to Contractors, +1 to Ambassadors, +1 to AI");
        }
      }

      // Blockchain Experience
    if (data.blockchainExperience) {
      Logger.log("Blockchain Experience:", data.blockchainExperience);
       if (data.blockchainExperience.includes('CosmWasm - Basic')) {
        scores.hackerboard += 5;
        scores.adosubmission += 5;
        scores.contractors += 4;
        scores.ai += 2;
          Logger.log("  CosmWasm - Basic: +5 to Hacker Board, +5 to ADO Submission, +4 to Contractors, +2 to AI");
      }
      if (data.blockchainExperience.includes('CosmWasm - Developed & Deployed Contracts')) {
        scores.hackerboard += 8;
        scores.adosubmission += 8;
        scores.contractors += 6;
        scores.ai += 3;
        Logger.log("  CosmWasm - Developed & Deployed Contracts: +8 to Hacker Board, +8 to ADO Submission, +6 to Contractors, +3 to AI");
      }
      if (data.blockchainExperience.includes('CosmWasm - Open Source Contributions')) {
        scores.hackerboard += 10;
        scores.adosubmission += 10;
        scores.contractors += 5;
        scores.ai += 3;
        Logger.log("  CosmWasm - Open Source Contributions: +10 to Hacker Board, +10 to ADO Submission, +5 to Contractors, +3 to AI");
      }
      if (data.blockchainExperience.includes('Cosmos SDK - Basic')) {
        scores.hackerboard += 5;
        scores.adosubmission += 3;
        scores.contractors += 4;
        scores.ai += 2;
          Logger.log("  Cosmos SDK - Basic: +5 to Hacker Board, +3 to ADO Submission, +4 to Contractors, +2 to AI");
      }
      if (data.blockchainExperience.includes('Cosmos SDK - Built Modules/Applications')) {
        scores.hackerboard += 8;
        scores.adosubmission += 5;
        scores.contractors += 6;
        scores.ai += 3;
        Logger.log("  Cosmos SDK - Built Modules/Applications: +8 to Hacker Board, +5 to ADO Submission, +6 to Contractors, +3 to AI");
      }
       if (data.blockchainExperience.includes('Cosmos SDK - Contributions')) {
        scores.hackerboard += 10;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ai += 3;
        Logger.log("  Cosmos SDK - Contributions: +10 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +3 to AI");
      }
       if (data.blockchainExperience.includes('IBC (Inter-Blockchain Communication)')) {
        scores.hackerboard += 7;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ai += 3;
         Logger.log("  IBC: +7 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +3 to AI");
      }
      if (data.blockchainExperience.includes('Smart Contract Auditing')) {
        scores.hackerboard += 8;
        scores.adosubmission += 5;
        scores.contractors += 7;
        scores.ai += 2;
         Logger.log("  Smart Contract Auditing: +8 to Hacker Board, +5 to ADO Submission, +7 to Contractors, +2 to AI");
      }
      if (data.blockchainExperience.includes('aOS')) {
        scores.hackerboard += 5;
        scores.adosubmission += 10;
        scores.contractors += 5;
        scores.ai += 2;
         Logger.log("  aOS: +5 to Hacker Board, +10 to ADO Submission, +5 to Contractors, +2 to AI");
      }
      if (data.blockchainExperience.includes('DeFi Protocols')) {
        scores.hackerboard += 3;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ai += 3;
        Logger.log("  DeFi Protocols: +3 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +3 to AI");
      }
      if (data.blockchainExperience.includes('NFT Development')) {
        scores.hackerboard += 3;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ai += 2;
         Logger.log("  NFT Development: +3 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +2 to AI");
      }
      if (data.blockchainExperience.includes('Ethereum/EVM')) {
        scores.hackerboard += 2;
        scores.adosubmission += 3;
        scores.contractors += 3;
        scores.ai += 1;
         Logger.log("  Ethereum/EVM: +2 to Hacker Board, +3 to ADO Submission, +3 to Contractors, +1 to AI");
      }
      if (data.blockchainExperience.includes('Other Blockchains (specify)')) {
        scores.hackerboard += 2;
        scores.adosubmission += 2;
        scores.contractors += 2;
        scores.ai += 1;
        Logger.log("  Other Blockchains: +2 to Hacker Board, +2 to ADO Submission, +2 to Contractors, +1 to AI");
      }
    }
     
        // General Skills/Experience
    if (data.generalSkills) {
      Logger.log("General Skills:", data.generalSkills);
        if (data.generalSkills.includes('Git/GitHub')) {
           scores.hackerboard += 5;
           scores.adosubmission += 5;
           scores.contractors += 5;
           scores.ambassadors += 2;
           scores.ai += 3;
           Logger.log("  Git/GitHub: +5 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +2 to Ambassadors, +3 to AI");
         }
      if (data.generalSkills.includes('Testing (Unit, Integration, etc.)')) {
        scores.hackerboard += 5;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ai += 3;
          Logger.log("  Testing: +5 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +3 to AI");
        }
        if (data.generalSkills.includes('CI/CD')) {
           scores.hackerboard += 5;
          scores.adosubmission += 3;
          scores.contractors += 5;
          scores.ai += 2;
            Logger.log("  CI/CD: +5 to Hacker Board, +3 to ADO Submission, +5 to Contractors, +2 to AI");
        }
      if (data.generalSkills.includes('Security Best Practices')) {
        scores.hackerboard += 7;
        scores.adosubmission += 5;
        scores.contractors += 5;
        scores.ambassadors += 1;
        scores.ai += 3;
        Logger.log("  Security Best Practices: +7 to Hacker Board, +5 to ADO Submission, +5 to Contractors, +1 to Ambassadors, +3 to AI");
      }
      if (data.generalSkills.includes('Cloud Platforms (AWS, GCP, Azure)')) {
        scores.hackerboard += 3;
        scores.adosubmission += 3;
        scores.contractors += 5;
        scores.ai += 3;
        Logger.log("  Cloud Platforms: +3 to Hacker Board, +3 to ADO Submission, +5 to Contractors, +3 to AI");
      }
        if (data.generalSkills.includes('DevOps')) {
          scores.hackerboard += 3;
          scores.adosubmission += 3;
          scores.contractors += 5;
          scores.ai += 2;
           Logger.log("  DevOps: +3 to Hacker Board, +3 to ADO Submission, +5 to Contractors, +2 to AI");
        }
        if (data.generalSkills.includes('Agile/Scrum')) {
          scores.hackerboard += 2;
          scores.adosubmission += 2;
          scores.contractors += 5;
          scores.ambassadors += 2;
          scores.ai += 2;
           Logger.log("  Agile/Scrum: +2 to Hacker Board, +2 to ADO Submission, +5 to Contractors, +2 to Ambassadors, +2 to AI");
        }
         if (data.generalSkills.includes('Other')) {
            scores.hackerboard += 1;
            scores.adosubmission += 1;
            scores.contractors += 1;
            scores.ambassadors += 1;
            scores.ai += 1;
            Logger.log("  Other: +1 to Hacker Board, +1 to ADO Submission, +1 to Contractors, +1 to Ambassadors, +1 to AI");
        }
    }

    // Experience Level
     if (data.experience) {
        if (data.experience === 'Beginner (0-1 years)') {
            scores.hackerboard += 1;
            scores.adosubmission += 1;
            scores.contractors += 1;
            scores.ambassadors += 1;
            scores.ai += 1;
             Logger.log("  Beginner: +1 to all paths");
        }
        if (data.experience === 'Intermediate (1-3 years)') {
            scores.hackerboard += 5;
            scores.adosubmission += 5;
            scores.contractors += 5;
            scores.ambassadors += 3;
            scores.ai += 3;
            Logger.log("  Intermediate: +5 to Hacker Board, ADO Submission, and Contractors, +3 to Ambassadors and AI");
        }
        if (data.experience === 'Advanced (3+ years)') {
            scores.hackerboard += 10;
            scores.adosubmission += 7;
            scores.contractors += 10;
            scores.ambassadors += 5;
            scores.ai += 5;
           Logger.log("  Advanced: +10 to Hacker Board and Contractors, +7 to ADO Submission, +5 to Ambassadors and AI");
        }
        if (data.experience === 'Expert (5+ years)') {
            scores.hackerboard += 12;
            scores.adosubmission += 10;
            scores.contractors += 15;
            scores.ambassadors += 7;
            scores.ai += 7;
             Logger.log("  Expert: +12 to Hacker Board and Contractors, +10 to ADO Submission, +7 to Ambassadors and AI");
        }
    }

    // Goals
    if (data.goals) {
      Logger.log("Goals:", data.goals);
       if (data.goals.includes('Build')) {
        scores.hackerboard += 3;
        scores.adosubmission += 3;
        scores.contractors += 3;
        scores.ai += 3;
        Logger.log("  Build: +3 to Hacker Board, ADO Submission, Contractors, and AI");
      }
        if (data.goals.includes('Contribute')) {
          scores.hackerboard += 3;
          scores.adosubmission += 3;
          scores.contractors += 3;
          scores.ambassadors += 5;
          scores.ai += 3;
          Logger.log("  Contribute: +3 to Hacker Board, ADO Submission, Contractors, and AI, +5 to Ambassadors");
      }
       if (data.goals.includes('Mentor')) {
        scores.ambassadors += 3;
         Logger.log("  Mentor: +3 to Ambassadors");
        }
      if (data.goals.includes('Collaborate')) {
         scores.ambassadors += 3;
           Logger.log("  Collaborate: +3 to Ambassadors");
      }
        if (data.goals.includes('Find a Team')) {
            scores.ambassadors += 3;
           Logger.log("  Find a Team: +3 to Ambassadors");
          }
      if (data.goals.includes('Learn')) {
          scores.hackerboard += 1;
          scores.adosubmission += 1;
          scores.contractors += 1;
          scores.ambassadors += 3;
          scores.ai += 1;
          Logger.log("  Learn: +1 to Hacker Board, ADO Submission, Contractors, and AI, +3 to Ambassadors");
        }
      if (data.goals.includes('Earn Rewards')) {
            scores.hackerboard += 1;
            scores.adosubmission += 1;
            scores.contractors += 1;
            scores.ambassadors += 1;
            scores.ai += 1;
            Logger.log("  Earn Rewards: +1 to all paths");
        }
    }

    // Hackathon Experience
    if (data.hackathonExperience) {
      Logger.log("Hackathon Experience:", data.hackathonExperience);
     if (data.hackathonExperience.includes('Some')) {
         scores.hackerboard += 1;
         scores.adosubmission += 1;
         scores.contractors += 1;
           Logger.log("  Some: +1 to Hacker Board, ADO Submission, and Contractors");
       }
        if (data.hackathonExperience.includes('Experienced')) {
            scores.hackerboard += 3;
            scores.adosubmission += 3;
            scores.contractors += 3;
            Logger.log("  Experienced: +3 to Hacker Board, ADO Submission, and Contractors");
          }
       if (data.hackathonExperience.includes('Frequently Participate')) {
            scores.hackerboard += 5;
            scores.adosubmission += 5;
            scores.contractors += 5;
             Logger.log("  Frequently Participate: +5 to Hacker Board, ADO Submission, and Contractors");
           }
        if (data.hackathonExperience.includes('Have Won Awards')) {
            scores.hackerboard += 7;
            scores.adosubmission += 7;
            scores.contractors += 7;
            Logger.log("  Have Won Awards: +7 to Hacker Board, ADO Submission, and Contractors");        }
      }

      // Education
    if (data.education) {
      Logger.log("Education:", data.education);
      if (data.education.includes('Self-taught')) {
        scores.hackerboard += 1;
        scores.adosubmission += 1;
        scores.contractors += 1;
        scores.ambassadors += 1;
        scores.ai += 1;
        Logger.log("  Self-taught: +1 to all paths");
      }
      if (data.education.includes('Bootcamp')) {
        scores.hackerboard += 2;
        scores.adosubmission += 2;
        scores.contractors += 2;
        scores.ambassadors += 1;
        scores.ai += 2;
        Logger.log("  Bootcamp: +2 to Hacker Board, ADO Submission, and Contractors, +1 to Ambassadors, +2 to AI");
      }
      if (data.education.includes('Undergraduate')) {
        scores.hackerboard += 3;
        scores.adosubmission += 3;
        scores.contractors += 3;
        scores.ambassadors += 2;
        scores.ai += 3;
        Logger.log("  Undergraduate: +3 to Hacker Board, ADO Submission, and Contractors, +2 to Ambassadors, +3 to AI");
      }
      if (data.education.includes('Graduate')) {
        scores.hackerboard += 4;
        scores.adosubmission += 4;
        scores.contractors += 4;
        scores.ambassadors += 2;
        scores.ai += 4;
        Logger.log("  Graduate: +4 to Hacker Board, ADO Submission, and Contractors, +2 to Ambassadors, +4 to AI");
      }
       if (data.education.includes('Prefer not to say')) {
            Logger.log("  Prefer not to say: +0 to all paths");
        }
      }

    // Availability
     if (data.availability) {
       Logger.log("Availability:", data.availability);
      if (data.availability.includes('Part-time')) {
        scores.hackerboard += 2;
        scores.adosubmission += 2;
        scores.contractors += 1;
        scores.ambassadors += 3;
        scores.ai += 2;
         Logger.log("  Part-time: +2 to Hacker Board, ADO Submission, and AI, +1 to Contractors, +3 to Ambassadors");
      }
        if (data.availability.includes('Full-time')) {
        scores.hackerboard += 3;
        scores.adosubmission += 3;
        scores.contractors += 3;
        scores.ambassadors += 1;
        scores.ai += 3;
          Logger.log("  Full-time: +3 to Hacker Board, ADO Submission, Contractors, and AI, +1 to Ambassadors");
        }
        if (data.availability.includes('Prefer not to say')) {
          scores.hackerboard += 1;
          scores.adosubmission += 1;
          scores.contractors += 1;
          scores.ambassadors += 1;
          scores.ai += 1;
            Logger.log("  Prefer not to say: +1 to all paths");
      }
   }

    // Spoken Languages
    if (data.spokenLanguages) {
      Logger.log("Spoken Languages:", data.spokenLanguages);
      const nonEnglishLanguages = data.spokenLanguages.filter(lang => lang !== 'English');
      scores.ambassadors += nonEnglishLanguages.length * 2;
       Logger.log("  Non-English Languages: +" + (nonEnglishLanguages.length * 2) + " to Ambassadors");
    }

    // AI Experience and Projects
    if (data.aiExperience) {
        Logger.log("AI Experience:", data.aiExperience);
        // Basic keywords
        const basicKeywords = ["machine learning", "deep learning", "natural language processing", "computer vision", "data mining", "artificial intelligence"];
        let basicKeywordScore = 0;
        basicKeywords.forEach(keyword => {
            if (data.aiExperience.some(item => item.toLowerCase().includes(keyword))) {
                basicKeywordScore += 2;
            }
        });

        // Intermediate keywords
        const intermediateKeywords = ["TensorFlow", "PyTorch", "Scikit-learn", "Keras", "OpenCV"];
        let intermediateKeywordScore = 0;
        intermediateKeywords.forEach(keyword => {
            if (data.aiExperience.some(item => item.toLowerCase().includes(keyword))) {
                intermediateKeywordScore += 5;
            }
        });

        // Advanced keywords
        const advancedKeywords = ["transformer models", "reinforcement learning", "generative AI", "federated learning", "explainable AI"];
        let advancedKeywordScore = 0;
        advancedKeywords.forEach(keyword => {
            if (data.aiExperience.some(item => item.toLowerCase().includes(keyword))) {
                advancedKeywordScore += 8;
            }
        });

        // Specific tools/platforms (adjust points as needed)
        const specificTools = {
            "ChatGPT": 5,
            "OpenAI API": 7,
            "Claude API": 7,
            "Google Gemini API": 7,
            "LangFlow": 5,
           "Other": 1
        };
        let specificToolScore = 0;
        for (const tool in specificTools) {
            if (data.aiExperience.includes(tool)) {
                specificToolScore += specificTools[tool];
            }
        }
        scores.ai += basicKeywordScore + intermediateKeywordScore + advancedKeywordScore + specificToolScore;
          Logger.log("  AI Experience: +" + (basicKeywordScore + intermediateKeywordScore + advancedKeywordScore + specificToolScore) + " to AI");
    }

    if (data.relevantProjects) {
      Logger.log("Relevant AI Projects:", data.relevantProjects);
      // Check for the presence of project links (simplified check)
      const hasProjectLinks = /(https?:\/\/[^\s]+)/g.test(data.relevantProjects);

        if (hasProjectLinks) {
            // Basic scoring based on presence of links, can be refined further
            scores.ai += 5;
              Logger.log("  Relevant AI Projects: +5 to AI");
        }
    }

    // Add more scoring logic for other criteria here

    Logger.log("Calculated Scores:", JSON.stringify(scores, null, 2));

  } catch (error) {
    Logger.log("Error in calculateScores: " + error.toString());
    Logger.log("Stack Trace: " + error.stack);
  }

  return scores;
}

/**
 * Determines recommendations based on calculated scores.
 *
 * @param {Object} scores - The calculated scores for each path.
 * @returns {Array} - An array of recommendation objects with path and match level.
 */
function getRecommendations(scores) {
  Logger.log("Generating recommendations for scores:", scores);
  const recommendations = [];
  if (scores.hackerboard >= 75) {
    const matchLevel = scores.hackerboard - 75 >= 15 ? "Strong Match" : scores.hackerboard - 75 >= 5 ? "Good Match" : "Potential Match";
    recommendations.push({ path: "Hacker Board", match: matchLevel });
    Logger.log("  Hacker Board recommendation: " + matchLevel);
  }
  if (scores.adosubmission >= 55) {
    const matchLevel = scores.adosubmission - 55 >= 15 ? "Strong Match" : scores.adosubmission - 55 >= 5 ? "Good Match" : "Potential Match";
    recommendations.push({ path: "ADO Submission", match: matchLevel });
    Logger.log("  ADO Submission recommendation: " + matchLevel);
  }
  if (scores.contractors >= 65) {
    const matchLevel = scores.contractors - 65 >= 15 ? "Strong Match" : scores.contractors - 65 >= 5 ? "Good Match" : "Potential Match";
    recommendations.push({ path: "Contractor", match: matchLevel });
     Logger.log("  Contractor recommendation: " + matchLevel);
  }
  if (scores.ambassadors >= 25) {
    const matchLevel = scores.ambassadors - 25 >= 15 ? "Strong Match" : scores.ambassadors - 25 >= 5 ? "Good Match" : "Potential Match";
    recommendations.push({ path: "Ambassador", match: matchLevel });
     Logger.log("  Ambassador recommendation: " + matchLevel);
  }
  if (scores.ai >= 40) {
    const matchLevel = scores.ai - 40 >= 15 ? "Strong Match" : scores.ai - 40 >= 5 ? "Good Match" : "Potential Match";
    recommendations.push({ path: "AI Initiatives", match: matchLevel });
    Logger.log("  AI Initiatives recommendation: " + matchLevel);
  }

  Logger.log("Recommendations:", recommendations);
  return recommendations;
}

/**
 * Runs automated tests using data from the "Test Cases" sheet.
 */
function runTests() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const testSheet = ss.getSheetByName("Test Cases");

    // Check if the sheet exists
    if (!testSheet) {
      Logger.log("Error: 'Test Cases' sheet not found.");
      return;
    }

    const dataRange = testSheet.getDataRange();
    const values = dataRange.getValues();

    // Start from row 1 to skip header row
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const testCaseId = row[0];
      const description = row[1];

      // Construct inputData object from the sheet (adjust column indices as needed)
      const inputData = {
        name: row[2],
        email: row[3],
        github: row[4],
        telegram: row[5],
        x: row[6],
        location: row[7],
        spokenLanguages: row[8] ? row[8].split(',').map(lang => lang.trim()) : [],
        frontendSkills: row[9] ? row[9].split(',').map(skill => skill.trim()) : [],
        languages: row[10] ? row[10].split(',').map(lang => lang.trim()) : [],
        tools: row[11] ? row[11].split(',').map(tool => tool.trim()) : [],
        blockchainExperience: row[12] ? row[12].split(',').map(exp => exp.trim()) : [],
        goals: row[13],
        experience: row[14],
        hackathonExperience: row[15],
        education: row[16],
        availability: row[17],
        portfolio: row[18],
        additionalSkills: row[19],
        aiExperience: row[20] ? row[20].split(',').map(aiExp => aiExp.trim()) : [],
        relevantProjects: row[21],
        generalSkills: row[27] ? row[27].split(',').map(gs => gs.trim()) : [],
      };
    
    Logger.log("Running test case: " + testCaseId + " - " + description);
        Logger.log("Input Data:", inputData);

      const scores = calculateScores(inputData);
      const recommendations = getRecommendations(scores);

    // Format recommendations for comparison (you might need to adjust this)
      const actualPaths = recommendations.map(rec => rec.path).join(", ");
      const actualMatchLevels = recommendations.map(rec => rec.match).join(", ");

      // Get expected values from the sheet (adjust column indices as needed)
    const expectedPaths = row[22];
    const expectedMatchLevels = row[23];

    // Compare and write results
     testSheet.getRange(i + 1, 24).setValue(actualPaths);
     testSheet.getRange(i + 1, 25).setValue(actualMatchLevels);

      // Handle comparison of multiple paths and match levels
    const expectedPathsArray = expectedPaths ? expectedPaths.split(',').map(p => p.trim()) : [];
    const expectedMatchLevelsArray = expectedMatchLevels ? expectedMatchLevels.split(',').map(m => m.trim()) : [];

    let pathsMatch = false;
        if (expectedPathsArray.length === recommendations.length) {
        pathsMatch = recommendations.every(rec => {
            return expectedPathsArray.includes(rec.path);
        });
        }
        
        let matchLevelsMatch = false;
        if (expectedMatchLevelsArray.length === recommendations.length) {
          matchLevelsMatch = recommendations.every(rec => {
            return expectedMatchLevelsArray.includes(rec.match);
          });
        }

    // Write "Pass" or "Fail" to the "Pass/Fail" column based on comparison
      const passFailColumn = 27;
    if (pathsMatch && matchLevelsMatch) {
      testSheet.getRange(i + 1, passFailColumn).setValue("Pass");
      Logger.log("Test case passed. Expected: ", expectedPaths, expectedMatchLevels, "Actual: ", actualPaths, actualMatchLevels);
    } else {
      testSheet.getRange(i + 1, passFailColumn).setValue("Fail");
      Logger.log("Test case failed. Expected: ", expectedPaths, expectedMatchLevels, "Actual: ", actualPaths, actualMatchLevels);
    }
  }
}