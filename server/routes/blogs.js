const express = require('express');
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const slugify = require('slugify');

const router = express.Router();

// @route   GET /api/blogs
// @desc    Get all published blogs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name')
      .sort({ publishedAt: -1 });
    
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('author', 'name');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();
    
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog post
// @access  Private (Admin)
router.post('/', [
  auth,
  body('title', 'Title is required').not().isEmpty(),
  body('content', 'Content is required').not().isEmpty(),
  body('slug', 'Slug is required').not().isEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: errors.array() 
      });
    }

    const { title, content, excerpt, featuredImage, videoUrl, tags, status, slug } = req.body;

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    const blog = new Blog({
      title,
      content,
      excerpt,
      featuredImage,
      videoUrl,
      tags,
      status: status || 'draft',
      slug: slug || slugify(title, { lower: true, strict: true }),
      author: req.user._id
    });

    await blog.save();
    await blog.populate('author', 'name');
    
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog post
// @access  Private (Admin)
router.put('/:id', [
  auth,
  body('title', 'Title is required').not().isEmpty(),
  body('content', 'Content is required').not().isEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors: errors.array() 
      });
    }

    const { title, content, excerpt, featuredImage, videoUrl, tags, status, slug } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if new slug conflicts with existing blog (excluding current blog)
    if (slug && slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingBlog) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }

    // Update fields
    blog.title = title;
    blog.content = content;
    blog.excerpt = excerpt;
    blog.featuredImage = featuredImage;
    blog.videoUrl = videoUrl;
    blog.tags = tags;
    blog.status = status;
    blog.slug = slug || slugify(title, { lower: true, strict: true });

    await blog.save();
    await blog.populate('author', 'name');
    
    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/blogs/:id/status
// @desc    Update blog status
// @access  Private (Admin)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    blog.status = status;
    await blog.save();
    
    res.json(blog);
  } catch (error) {
    console.error('Error updating blog status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog post
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 