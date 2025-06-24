const { google } = require('googleapis');
const readline = require('readline');

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function getRefreshToken() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'http://localhost:5008/auth/callback' // Use localhost for auth
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('🔐 Gmail API Authentication Setup\n');
  console.log('1. Visit this URL in your browser:');
  console.log('   ', authUrl);
  console.log('\n2. Grant access to your Gmail account');
  console.log('3. Copy the authorization code from the URL\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the authorization code: ', async (code) => {
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      
      console.log('\n✅ Success! Add this to your server/.env file:');
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('\n🎉 Gmail API authentication complete!');
      
    } catch (error) {
      console.error('❌ Error getting tokens:', error);
    }
    
    rl.close();
  });
}

getRefreshToken(); 