const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const axios = require('axios');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('subject', 'Subject is required').not().isEmpty(),
  body('message', 'Message is required').not().isEmpty(),
  body('recaptcha', 'Please complete the reCAPTCHA').not().isEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: errors.array() 
      });
    }

    const { name, email, phone, company, subject, message, recaptcha } = req.body;

    // Verify reCAPTCHA
    try {
      const recaptchaResponse = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptcha,
          remoteip: req.ip
        }
      });

      if (!recaptchaResponse.data.success) {
        return res.status(400).json({ message: 'reCAPTCHA verification failed' });
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return res.status(500).json({ message: 'reCAPTCHA verification error' });
    }

    // Create contact entry
    const contact = new Contact({
      name,
      email,
      phone,
      company,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await contact.save();

    // Send notification email to admin (optional)
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransporter({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER, // Send to admin
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Company:</strong> ${company || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
          `
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({ 
      message: 'Thank you for your message! We\'ll get back to you soon.',
      id: contact._id 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router; 