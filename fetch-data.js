const { google } = require('googleapis');

async function fetchData() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1' // Adjust sheet name and range as needed
    });

    const values = response.data.values;
    // Convert fetched data into JSON format
    const jsonData = convertToJSON(values);
    console.log('Fetched data:', jsonData);
    return jsonData;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

function convertToJSON(values) {
  if (!values || !values.length) {
    return null;
  }

  const jsonData = [];
  const headers = values[0];
  for (let i = 1; i < values.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    jsonData.push(row);
  }
  return jsonData;
}

fetchData();
