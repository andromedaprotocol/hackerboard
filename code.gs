/**
 * Handles all requests and sets the CORS headers.
 *
 * @param {Object} e The event object with request parameters.
 * @returns {ContentService.TextOutput} The JSON response with CORS headers.
 */
function handleResponse(e) {
    try {
        // Get callback name from request parameters
        const callback = e.parameter.callback;
        
        if (e.postData && e.postData.contents) {
            const data = JSON.parse(e.postData.contents);
            Logger.log("Received Data:", JSON.stringify(data, null, 2));

            const scores = calculateScores(data);
            const recommendations = getRecommendations(scores);

            const ss = SpreadsheetApp.getActiveSpreadsheet();
            const sheet = ss.getSheetByName("Submissions");

            if (!sheet) throw new Error("Sheet 'Submissions' not found.");

            const lastRow = sheet.getLastRow() + 1;
            const formattedRecommendations = recommendations.map(rec => `${rec.path} (${rec.match})`);
            
            const values = [
                [
                    data.name || '',
                    data.email || '',
                    data.github || '',
                    data.telegram || '',
                    data.x || '',
                    data.location || '',
                    sanitizeArray(data.spokenLanguages).join(", "),
                    sanitizeArray(data.frontendSkills).join(", "),
                    sanitizeArray(data.languages).join(", "),
                    sanitizeArray(data.tools).join(", "),
                    sanitizeArray(data.blockchainExperience).join(", "),
                    data.goals || '',
                    data.experience || '',
                    data.hackathonExperience || '',
                    data.education || '',
                    data.availability || '',
                    data.portfolio || '',
                    data.additionalSkills || '',
                    sanitizeArray(data.aiExperience).join(", "),
                    data.relevantProjects || '',
                    formattedRecommendations.join(", ")
                ]
            ];

            sheet.getRange(lastRow, 1, 1, values[0].length).setValues(values);

            const response = {
                result: "success",
                recommendations: recommendations
            };

            // Wrap response in callback if JSONP
            const responseText = callback ? 
                `${callback}(${JSON.stringify(response)})` : 
                JSON.stringify(response);

            return ContentService.createTextOutput(responseText)
                .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
        }
    } catch (error) {
        Logger.log("Error: " + error.toString());
        const errorResponse = {
            result: "error",
            message: error.toString()
        };

        const responseText = callback ? 
            `${callback}(${JSON.stringify(errorResponse)})` : 
            JSON.stringify(errorResponse);

        return ContentService.createTextOutput(responseText)
            .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
    }
}

/**
 * Handles GET requests.
 *
 * @param {Object} e The event object with request parameters.
 * @returns {ContentService.TextOutput} The JSON response with CORS headers.
 */
function doGet(e) {
  return handleResponse(e);
}

/**
 * Handles POST requests to process form submissions and calculate scores.
 *
 * @param {Object} e The event object with submitted form data.
 * @returns {ContentService.TextOutput} The JSON response with the result and recommendations.
 */
function doPost(e) {
  return handleResponse(e);
}


/**
 * Calculates scores for each developer path based on the provided data.
 *
 * @param {Object} data - The form submission data.
 * @returns {Object} - An object containing the calculated scores for each path.
 */
function calculateScores(data) {
    Logger.log("Input Data for calculateScores:", JSON.stringify(data, null, 2));

    let scores = {
        hackerboard: 0,
        adosubmission: 0,
        contractors: 0,
        ambassadors: 0,
        ai: 0
    };

    const weightMappings = {
    // Programming Languages
    languages: {
        Rust: { hackerboard: 15, adosubmission: 15, contractors: 10, ai: 5 },
        JavaScript: { hackerboard: 8, contractors: 10, ambassadors: 2, ai: 2 },
        TypeScript: { hackerboard: 8, contractors: 10, ai: 2 },
        Python: { hackerboard: 2, adosubmission: 2, contractors: 5, ambassadors: 2, ai: 15 },
        Solidity: { hackerboard: 2, adosubmission: 5, contractors: 3 },
        Go: { hackerboard: 5, adosubmission: 3, contractors: 5, ai: 3 },
        "C++": { hackerboard: 3, adosubmission: 2, contractors: 3, ai: 3 },
        Other: { hackerboard: 1, adosubmission: 1, contractors: 1, ambassadors: 1, ai: 1 }
    },

    // Front-End Skills
    frontendSkills: {
        React: { hackerboard: 5, adosubmission: 3, contractors: 7 },
        "Next.js": { hackerboard: 8, adosubmission: 5, contractors: 8 },
        "Vue.js": { hackerboard: 5, adosubmission: 3, contractors: 5 },
        Angular: { hackerboard: 5, adosubmission: 3, contractors: 5 },
        ShadCN: { hackerboard: 7, adosubmission: 5, contractors: 5 },
        "UI/UX Design": { hackerboard: 3, adosubmission: 5, contractors: 5, ambassadors: 3, ai: 3 },
        "Web3.js / Ethers.js": { hackerboard: 5, adosubmission: 5, contractors: 5, ai: 2 },
        "AndromedaJS SDK": { hackerboard: 10, adosubmission: 7, contractors: 8, ai: 2 },
        Other: { hackerboard: 1, adosubmission: 1, contractors: 1, ambassadors: 1, ai: 1 }
    },

    // Back-End Skills
    backendSkills: {
        "REST APIs": { hackerboard: 5, adosubmission: 5, contractors: 7, ai: 3 },
        GraphQL: { hackerboard: 5, adosubmission: 5, contractors: 5, ai: 3 },
        "Database (SQL/NoSQL)": { hackerboard: 5, adosubmission: 5, contractors: 5, ai: 3 },
        "Serverless Functions": { hackerboard: 5, adosubmission: 5, contractors: 5, ai: 2 },
        Other: { hackerboard: 1, adosubmission: 1, contractors: 1, ambassadors: 1, ai: 1 }
    },

    // Andromeda/Cosmos Tools
    tools: {
        "Andromeda CLI": { hackerboard: 10, adosubmission: 8, contractors: 7, ambassadors: 2, ai: 2 },
        "ADO Builder": { hackerboard: 7, adosubmission: 10, contractors: 5, ambassadors: 2, ai: 2 },
        "App Builder": { hackerboard: 5, adosubmission: 7, contractors: 5, ambassadors: 2, ai: 2 },
        "Andromeda Web App": { hackerboard: 5, adosubmission: 5, contractors: 5, ambassadors: 2, ai: 2 },
        "Andromeda Logic Library (ALL)": { hackerboard: 8, adosubmission: 8, contractors: 5, ambassadors: 2, ai: 2 },
        "Keplr Wallet": { hackerboard: 5, adosubmission: 5, contractors: 5, ambassadors: 2, ai: 2 },
        CosmWasm: { hackerboard: 12, adosubmission: 10, contractors: 8, ai: 3 },
        "Cosmos SDK": { hackerboard: 10, adosubmission: 5, contractors: 8, ai: 3 },
        Git: { hackerboard: 5, adosubmission: 5, contractors: 5, ambassadors: 2, ai: 3 },
        GitHub: { hackerboard: 5, adosubmission: 5, contractors: 5, ambassadors: 2, ai: 3 },
        Other: { hackerboard: 1, adosubmission: 1, contractors: 1, ambassadors: 1, ai: 1 }
    },

    // Blockchain Experience
    blockchainExperience: {
        "CosmWasm - Basic": { hackerboard: 5, adosubmission: 5, contractors: 4, ai: 2 },
        "CosmWasm - Developed & Deployed Contracts": { hackerboard: 8, adosubmission: 8, contractors: 6, ai: 3 },
        "CosmWasm - Open Source Contributions": { hackerboard: 10, adosubmission: 10, contractors: 5, ai: 3 },
        "Cosmos SDK - Basic": { hackerboard: 5, adosubmission: 3, contractors: 4, ai: 2 },
        "Cosmos SDK - Built Modules/Applications": { hackerboard: 8, adosubmission: 5, contractors: 6, ai: 3 },
        "Cosmos SDK - Contributions": { hackerboard: 10, adosubmission: 5, contractors: 5, ai: 3 },
        "IBC (Inter-Blockchain Communication)": { hackerboard: 7, adosubmission: 5, contractors: 5, ai: 3 },
        "Smart Contract Auditing": { hackerboard: 8, adosubmission: 5, contractors: 7, ai: 2 },
        "aOS": { hackerboard: 5, adosubmission: 10, contractors: 5, ai: 2 },
        "DeFi Protocols": { hackerboard: 3, adosubmission: 5, contractors: 5, ai: 3 },
        "NFT Development": { hackerboard: 3, adosubmission: 5, contractors: 5, ai: 2 },
        "Ethereum/EVM": { hackerboard: 2, adosubmission: 3, contractors: 3, ai: 1 },
        Other: { hackerboard: 2, adosubmission: 2, contractors: 2, ai: 1 }
    },

    // General Skills
    generalSkills: {
        "Git/GitHub": { hackerboard: 5, adosubmission: 5, contractors: 5, ambassadors: 2, ai: 3 },
        "Testing (Unit, Integration, etc.)": { hackerboard: 5, adosubmission: 5, contractors: 5, ai: 3 },
        "CI/CD": { hackerboard: 5, adosubmission: 3, contractors: 5, ai: 2 },
        "Security Best Practices": { hackerboard: 7, adosubmission: 5, contractors: 5, ambassadors: 1, ai: 3 },
        "Cloud Platforms (AWS, GCP, Azure)": { hackerboard: 3, adosubmission: 3, contractors: 5, ai: 3 },
        DevOps: { hackerboard: 3, adosubmission: 3, contractors: 5, ai: 2 },
        "Agile/Scrum": { hackerboard: 2, adosubmission: 2, contractors: 5, ambassadors: 2, ai: 2 },
        Other: { hackerboard: 1, adosubmission: 1, contractors: 1, ambassadors: 1, ai: 1 }
    },

    // AI-Specific Tools
    aiExperience: {
        "ChatGPT": { ai: 5 },
        "OpenAI API": { ai: 7 },
        "Claude API": { ai: 7 },
        "Google Gemini API": { ai: 7 },
        LangFlow: { ai: 5 },
        Other: { ai: 1 }
    }
};

    function addScores(category, dataArray, weights) {
        if (!dataArray) return;
        dataArray.forEach(item => {
            if (weights[item]) {
                for (const path in weights[item]) {
                    scores[path] += weights[item][path];
                    Logger.log(`  ${item}: +${weights[item][path]} to ${path}`);
                }
            }
        });
    }

    // Apply weights
    addScores("languages", data.languages, weightMappings.languages);
    addScores("frontendSkills", data.frontendSkills, weightMappings.frontendSkills);
    addScores("backendSkills", data.backendSkills, weightMappings.backendSkills);
    addScores("tools", data.tools, weightMappings.tools);
    addScores("blockchainExperience", data.blockchainExperience, weightMappings.blockchainExperience);
    addScores("generalSkills", data.generalSkills, weightMappings.generalSkills);
    addScores("aiExperience", data.aiExperience, weightMappings.aiExperience);

    Logger.log("Calculated Scores:", JSON.stringify(scores, null, 2));
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
    const paths = [
        { path: "Contractors", score: scores.contractors },
        { path: "Hacker Board", score: scores.hackerboard },
        { path: "ADO Submission", score: scores.adosubmission },
        { path: "Ambassadors", score: scores.ambassadors },
        { path: "AI Initiatives", score: scores.ai }
    ];

    const threshold = 5;
    for (const { path, score } of paths) {
        if (score > threshold) {
            recommendations.push({ path, match: `${score}%` });
            Logger.log(`  Added recommendation for ${path}: ${score}%`);
        }
    }

    Logger.log("Recommendations:", recommendations);
    return recommendations;
}

/**
 * Utility function to sanitize input arrays.
 *
 * @param {Array} arr - The input array.
 * @returns {Array} - The sanitized array with falsy values removed.
 */
function sanitizeArray(arr) {
    return arr ? arr.filter(Boolean) : [];
}