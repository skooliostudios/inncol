const express = require('express');
const Page = require('../models/Page');

const router = express.Router();

// @route   GET /api/pages
// @desc    Get all published pages
// @access  Public
router.get('/', async (req, res) => {
  try {
    const pages = await Page.find({ isPublished: true })
      .populate('author', 'name')
      .sort({ publishedAt: -1 });
    
    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pages/:slug
// @desc    Get single page by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ 
      slug: req.params.slug, 
      isPublished: true 
    }).populate('author', 'name');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 