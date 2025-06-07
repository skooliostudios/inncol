const express = require('express');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const Page = require('../models/Page');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', auth, async (req, res) => {
  try {
    const [totalBlogs, publishedBlogs, draftBlogs, totalContacts] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Contact.countDocuments()
    ]);

    res.json({
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalContacts
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/blogs
// @desc    Get all blogs (including drafts) for admin
// @access  Private (Admin)
router.get('/blogs', auth, async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name')
      .sort({ updatedAt: -1 });
    
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/blogs/:id
// @desc    Get single blog for editing
// @access  Private (Admin)
router.get('/blogs/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/contacts
// @desc    Get all contact messages
// @access  Private (Admin)
router.get('/contacts', auth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/contacts/:id/read
// @desc    Mark contact message as read
// @access  Private (Admin)
router.patch('/contacts/:id/read', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    contact.isRead = true;
    await contact.save();
    
    res.json(contact);
  } catch (error) {
    console.error('Error marking contact as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/contacts/:id/respond
// @desc    Send response to contact message
// @access  Private (Admin)
router.post('/contacts/:id/respond', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Response message is required' });
    }

    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Send email response
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
          to: contact.email,
          subject: `Re: ${contact.subject}`,
          html: `
            <h2>Thank you for contacting Inncol</h2>
            <p>Dear ${contact.name},</p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><strong>Your original message:</strong></p>
            <p><em>${contact.message.replace(/\n/g, '<br>')}</em></p>
            <hr>
            <p>Best regards,<br>Inncol Team</p>
          `
        };

        await transporter.sendMail(mailOptions);
        
        // Update contact as responded
        contact.isResponded = true;
        contact.responseDate = new Date();
        await contact.save();
        
        res.json({ 
          message: 'Response sent successfully',
          contact 
        });

      } catch (emailError) {
        console.error('Failed to send response email:', emailError);
        res.status(500).json({ message: 'Failed to send email response' });
      }
    } else {
      res.status(500).json({ message: 'Email configuration not set up' });
    }

  } catch (error) {
    console.error('Error sending response:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/contacts/:id
// @desc    Delete contact message
// @access  Private (Admin)
router.delete('/contacts/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    await Contact.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/pages
// @desc    Get all pages for admin
// @access  Private (Admin)
router.get('/pages', auth, async (req, res) => {
  try {
    const pages = await Page.find()
      .populate('author', 'name')
      .sort({ updatedAt: -1 });
    
    res.json(pages);
  } catch (error) {
    console.error('Error fetching admin pages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/pages
// @desc    Create a new page
// @access  Private (Admin)
router.post('/pages', auth, async (req, res) => {
  try {
    const { title, slug, content, metaDescription, isPublished } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ message: 'Title, slug, and content are required' });
    }

    // Check if slug already exists
    const existingPage = await Page.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    const page = new Page({
      title,
      slug,
      content,
      metaDescription,
      isPublished: isPublished || false,
      author: req.user._id
    });

    await page.save();
    await page.populate('author', 'name');
    
    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/pages/:id
// @desc    Update a page
// @access  Private (Admin)
router.put('/pages/:id', auth, async (req, res) => {
  try {
    const { title, slug, content, metaDescription, isPublished } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ message: 'Title, slug, and content are required' });
    }

    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Check if new slug conflicts with existing page (excluding current page)
    if (slug !== page.slug) {
      const existingPage = await Page.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingPage) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }

    page.title = title;
    page.slug = slug;
    page.content = content;
    page.metaDescription = metaDescription;
    page.isPublished = isPublished;

    await page.save();
    await page.populate('author', 'name');
    
    res.json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/pages/:id/publish
// @desc    Toggle page publish status
// @access  Private (Admin)
router.patch('/pages/:id/publish', auth, async (req, res) => {
  try {
    const { isPublished } = req.body;

    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    page.isPublished = isPublished;
    await page.save();
    
    res.json(page);
  } catch (error) {
    console.error('Error updating page status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/pages/:id
// @desc    Delete a page
// @access  Private (Admin)
router.delete('/pages/:id', auth, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    await Page.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 