const { google } = require('googleapis');
const Contact = require('../models/Contact');

class GmailService {
  constructor() {
    this.gmail = null;
    this.auth = null;
  }

  async initialize() {
    try {
      // Create OAuth2 client
      this.auth = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI
      );

      // Set refresh token
      this.auth.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
      });

      // Initialize Gmail API
      this.gmail = google.gmail({ version: 'v1', auth: this.auth });
      
      console.log('✅ Gmail API initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Gmail API:', error);
      return false;
    }
  }

  async getNewEmails() {
    try {
      if (!this.gmail) {
        throw new Error('Gmail API not initialized');
      }

      // Get emails from the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const query = `in:inbox after:${Math.floor(fiveMinutesAgo.getTime() / 1000)}`;

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query
      });

      const messages = response.data.messages || [];
      console.log(`📧 Found ${messages.length} new emails to process`);

      for (const message of messages) {
        await this.processEmail(message.id);
      }

    } catch (error) {
      console.error('Error fetching new emails:', error);
    }
  }

  async processEmail(messageId) {
    try {
      // Get full message details
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      const headers = message.payload.headers;

      // Extract email details
      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const inReplyTo = headers.find(h => h.name === 'In-Reply-To')?.value || '';

      // Check if this is a reply to one of our contact emails
      if (!subject.startsWith('Re: ')) {
        return; // Not a reply
      }

      // Extract email body
      const emailBody = this.extractEmailBody(message.payload);
      const senderEmail = this.extractEmail(from);

      // Find matching contact by email and subject
      const originalSubject = subject.replace('Re: ', '');
      const contact = await Contact.findOne({
        email: senderEmail,
        subject: originalSubject
      });

      if (contact) {
        // Add customer reply to conversation thread
        contact.responses.push({
          message: emailBody,
          sentBy: 'customer',
          timestamp: new Date(),
          gmailMessageId: messageId
        });

        await contact.save();
        console.log(`✅ Added customer reply to conversation: ${contact._id}`);

        // Note: Email labeling removed to avoid scope issues
        // The email remains in Gmail inbox unchanged
      }

    } catch (error) {
      console.error('Error processing email:', error);
    }
  }

  extractEmailBody(payload) {
    let body = '';

    if (payload.body && payload.body.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body && part.body.data) {
          body += Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    // Clean up the email body (remove quoted text, signatures, etc.)
    return this.cleanEmailBody(body);
  }

  cleanEmailBody(body) {
    // Remove common email footers and quoted text
    const lines = body.split('\n');
    const cleanLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Stop at common reply indicators
      if (line.startsWith('On ') && line.includes('wrote:')) break;
      if (line.startsWith('>')) break;
      if (line.includes('-----Original Message-----')) break;
      
      cleanLines.push(lines[i]);
    }

    return cleanLines.join('\n').trim();
  }

  extractEmail(fromString) {
    const match = fromString.match(/<(.+?)>/);
    return match ? match[1] : fromString;
  }
}

module.exports = new GmailService(); 