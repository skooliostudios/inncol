const cron = require('node-cron');
const gmailService = require('./gmailService');

class EmailMonitor {
  constructor() {
    this.isRunning = false;
    this.cronJob = null;
  }

  async start() {
    if (this.isRunning) {
      console.log('📧 Email monitor is already running');
      return;
    }

    // Initialize Gmail service
    const initialized = await gmailService.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize Gmail service - Email monitoring disabled');
      return;
    }

    // Start monitoring every 2 minutes
    this.cronJob = cron.schedule('*/2 * * * *', async () => {
      console.log('🔍 Checking for new Gmail messages...');
      try {
        await gmailService.getNewEmails();
      } catch (error) {
        console.error('Error in email monitoring:', error);
      }
    }, {
      scheduled: false
    });

    this.cronJob.start();
    this.isRunning = true;
    
    console.log('✅ Email monitoring started - Checking every 2 minutes');
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log('🛑 Email monitoring stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: new Date().toISOString()
    };
  }
}

module.exports = new EmailMonitor(); 