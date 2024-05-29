const { google } = require('googleapis');
const { execSync } = require('child_process');
const fetch = require('node-fetch');

// Function to authenticate with Google Sheets API and fetch data
async function fetchData() {
  const auth = new google.auth.GoogleAuth({
    // Your Google Sheets API credentials here
    credentials: {
      client_email: 'portfolio-auto@portfolio-automation-424810.iam.gserviceaccount.com',
      private_key: '4703ccd2b7811949b95a54808d8b25e79009e103',
    },
    // Scopes for Google Sheets API
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1399397859',
      range: 'Sheet1', // Adjust sheet name and range as needed
    });
    const values = response.data.values;
    // Extract data from the response
    if (values.length) {
      const [name, classRegNo, linkedin, bio] = values[0];
      return { name, classRegNo, linkedin, bio };
    } else {
      console.log('No data found.');
      return null;
    }
  } catch (err) {
    console.error('The API returned an error:', err);
    return null;
  }
}

// Function to clone the template repository from GitHub
function cloneRepo(repoName) {
  execSync(`git clone https://github.com/johnsamuel05/members-portfolio-proclub.git ${repoName}`);
}

// Function to update files with fetched data
function updateFiles(repoName, data) {
  // Example: Update index.html file with fetched data
  // This can be customized based on your template structure
  const indexPath = `${repoName}/index.html`;
  let fileContent = fs.readFileSync(indexPath, 'utf8');
  fileContent = fileContent
    .replace('{{NAME}}', data.name)
    .replace('{{CLASS_REG_NO}}', data.classRegNo)
    .replace('{{LINKEDIN}}', data.linkedin)
    .replace('{{BIO}}', data.bio);
  fs.writeFileSync(indexPath, fileContent, 'utf8');
}

// Function to push changes to GitHub
function pushToGitHub(repoName) {
  execSync(`cd ${repoName} && git add . && git commit -m "Update portfolio data" && git push origin master`);
}

// Function to deploy to Vercel
async function deployToVercel(repoName) {
  try {
    const response = await fetch(`https://api.vercel.com/v9/now/deployments?projectId=YOUR_VERCEL_PROJECT_ID&name=${repoName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer tBtry3o3J5esLcSHwXbbhLI6`,
      },
    });
    const result = await response.json();
    console.log(`Deployment URL: ${result.url}`);
  } catch (error) {
    console.error('Error deploying to Vercel:', error);
  }
}

// Main function to orchestrate the deployment process
async function deploy() {
  const data = await fetchData();
  if (!data) {
    console.log('No data fetched. Exiting deployment.');
    return;
  }
  const repoName = data.name.replace(/\s+/g, '-').toLowerCase();
  cloneRepo(repoName);
  updateFiles(repoName, data);
  pushToGitHub(repoName);
  deployToVercel(repoName);
}

deploy();
