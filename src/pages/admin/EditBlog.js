import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import slugify from 'slugify';
import AdminSidebar from '../../components/AdminSidebar';

// Configure Quill to preserve image attributes and classes
const ImageBlot = Quill.import('formats/image');
class CustomImageBlot extends ImageBlot {
  static create(value) {
    const node = super.create(value);
    if (typeof value === 'string') {
      node.setAttribute('src', value);
    } else {
      node.setAttribute('src', value.src || value.url || value);
      // Preserve any existing classes
      if (value.className || value.class) {
        node.setAttribute('class', value.className || value.class);
      }
    }
    return node;
  }

  static value(domNode) {
    const src = domNode.getAttribute('src');
    const className = domNode.getAttribute('class');
    if (className) {
      return { src, className };
    }
    return src;
  }

  static formats(domNode) {
    const formats = {};
    // Preserve class attribute
    if (domNode.hasAttribute('class')) {
      formats.class = domNode.getAttribute('class');
    }
    return formats;
  }

  format(name, value) {
    if (name === 'class') {
      this.domNode.setAttribute('class', value);
    } else {
      super.format(name, value);
    }
  }
}

// Register the custom image blot
Quill.register(CustomImageBlot, true);

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    videoUrl: '',
    tags: '',
    status: 'draft',
    slug: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const fetchBlog = useCallback(async () => {
    try {
      const response = await axios.get(`/api/admin/blogs/${id}`);
      const blog = response.data;
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || '',
        featuredImage: blog.featuredImage || '',
        videoUrl: blog.videoUrl || '',
        tags: blog.tags ? blog.tags.join(', ') : '',
        status: blog.status,
        slug: blog.slug
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog post');
      navigate('/admin/blogs');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && { slug: slugify(value, { lower: true, strict: true }) })
    }));
  };

  const handleContentChange = useCallback((content) => {
    setFormData(prev => ({ ...prev, content }));
  }, []);

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!imageFile) return '';

    const imageFormData = new FormData();
    imageFormData.append('image', imageFile);

    try {
      const response = await axios.post('/api/upload/image', imageFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let featuredImage = formData.featuredImage;
      
      if (imageFile) {
        featuredImage = await uploadImage();
      }

      const blogData = {
        ...formData,
        featuredImage,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await axios.put(`/api/blogs/${id}`, blogData);
      toast.success('Blog post updated successfully!');
      navigate('/admin/blogs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update blog post');
    } finally {
      setSaving(false);
    }
  };

  // Stable function to show image styling modal
  const showImageStyleModal = useCallback((imgElement) => {
    // Remove any existing modals first
    const existingModal = document.querySelector('.image-style-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Get current classes
    const currentClasses = imgElement.className.split(' ');
    
    // Find current values
    let currentSize = '';
    let currentShape = '';
    let currentAlign = '';
    let currentLayout = '';
    let currentProfile = false;
    
    ['img-small', 'img-medium', 'img-large', 'img-full'].forEach(cls => {
      if (currentClasses.includes(cls)) currentSize = cls;
    });
    
    ['img-circle', 'img-rounded', 'img-square'].forEach(cls => {
      if (currentClasses.includes(cls)) currentShape = cls;
    });
    
    ['img-left', 'img-center', 'img-right'].forEach(cls => {
      if (currentClasses.includes(cls)) currentAlign = cls;
    });
    
    ['img-wrap-left', 'img-wrap-right', 'img-no-wrap'].forEach(cls => {
      if (currentClasses.includes(cls)) currentLayout = cls;
    });
    
    currentProfile = currentClasses.includes('profile-img');

    // Create modal backdrop
    const modal = document.createElement('div');
    modal.className = 'image-style-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.95);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #1a1a1a;
      color: white;
      border: 2px solid #3bc0ff;
      border-radius: 12px;
      padding: 30px;
      width: 90vw;
      max-width: 1200px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px rgba(59, 192, 255, 0.3);
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #3bc0ff;
      padding-bottom: 15px;
    `;
    header.innerHTML = `
      <h3 style="margin: 0; color: #3bc0ff; font-weight: bold;">🎨 Style Your Image</h3>
      <button id="closeModal" style="background: #3bc0ff; border: none; color: white; font-size: 24px; cursor: pointer; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">&times;</button>
    `;

    // Create main grid container
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    `;

    // Create left and right columns
    const leftColumn = document.createElement('div');
    leftColumn.style.cssText = `display: grid; gap: 25px;`;
    
    const rightColumn = document.createElement('div');
    rightColumn.style.cssText = `display: grid; gap: 25px;`;

    // Create size section
    const sizeSection = document.createElement('div');
    sizeSection.style.cssText = `
      background: rgba(59, 192, 255, 0.1);
      border: 1px solid rgba(59, 192, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
    `;
    sizeSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: #3bc0ff; font-weight: bold;">📏 Size</h4>
    `;
    
    const sizeSelect = document.createElement('select');
    sizeSelect.id = 'imageSizeSelect';
    sizeSelect.style.cssText = `
      width: 100%;
      padding: 12px;
      background: #2d3748;
      color: white;
      border: 2px solid rgba(59, 192, 255, 0.5);
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    sizeSelect.innerHTML = `
      <option value="">Default</option>
      <option value="img-small">Small (150px)</option>
      <option value="img-medium">Medium (300px)</option>
      <option value="img-large">Large (500px)</option>
      <option value="img-full">Full Width</option>
    `;
    sizeSelect.value = currentSize;
    
    sizeSection.appendChild(sizeSelect);
    leftColumn.appendChild(sizeSection);

    // Create shape section  
    const shapeSection = document.createElement('div');
    shapeSection.style.cssText = `
      background: rgba(255, 165, 0, 0.1);
      border: 1px solid rgba(255, 165, 0, 0.3);
      border-radius: 8px;
      padding: 20px;
    `;
    shapeSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: #ffa500; font-weight: bold;">🔹 Shape</h4>
    `;
    
    const shapeSelect = document.createElement('select');
    shapeSelect.id = 'imageShapeSelect';
    shapeSelect.style.cssText = `
      width: 100%;
      padding: 12px;
      background: #2d3748;
      color: white;
      border: 2px solid rgba(255, 165, 0, 0.5);
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    shapeSelect.innerHTML = `
      <option value="">Default</option>
      <option value="img-circle">Circle</option>
      <option value="img-rounded">Rounded</option>
      <option value="img-square">Square</option>
    `;
    shapeSelect.value = currentShape;
    
    shapeSection.appendChild(shapeSelect);
    leftColumn.appendChild(shapeSection);

    // Create alignment section
    const alignSection = document.createElement('div');
    alignSection.style.cssText = `
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      padding: 20px;
    `;
    alignSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: #22c55e; font-weight: bold;">➡️ Alignment</h4>
    `;
    
    const alignSelect = document.createElement('select');
    alignSelect.id = 'imageAlignSelect';
    alignSelect.style.cssText = `
      width: 100%;
      padding: 12px;
      background: #2d3748;
      color: white;
      border: 1px solid #555;
      border-radius: 4px;
      font-size: 14px;
    `;
    alignSelect.innerHTML = `
      <option value="">Default</option>
      <option value="img-left">Left</option>
      <option value="img-center">Center</option>
      <option value="img-right">Right</option>
    `;
    alignSelect.value = currentAlign;
    alignSection.appendChild(alignSelect);

    // Create layout section
    const layoutSection = document.createElement('div');
    layoutSection.style.marginBottom = '15px';
    layoutSection.innerHTML = `
      <label style="display: block; color: white; margin-bottom: 5px;">Layout:</label>
    `;
    
    const layoutSelect = document.createElement('select');
    layoutSelect.id = 'imageLayoutSelect';
    layoutSelect.style.cssText = `
      width: 100%;
      padding: 8px;
      background: #2d3748;
      color: white;
      border: 1px solid #555;
      border-radius: 4px;
      font-size: 14px;
    `;
    layoutSelect.innerHTML = `
      <option value="">Default</option>
      <option value="img-wrap-left">Wrap Left</option>
      <option value="img-wrap-right">Wrap Right</option>
      <option value="img-no-wrap">No Wrap</option>
    `;
    layoutSelect.value = currentLayout;
    layoutSection.appendChild(layoutSelect);

    // Create profile section
    const profileSection = document.createElement('div');
    profileSection.style.marginBottom = '20px';
    
    const profileLabel = document.createElement('label');
    profileLabel.style.cssText = `
      display: flex;
      align-items: center;
      color: white;
      cursor: pointer;
    `;
    
    const profileCheck = document.createElement('input');
    profileCheck.type = 'checkbox';
    profileCheck.id = 'profileImgCheck';
    profileCheck.checked = currentProfile;
    profileCheck.style.marginRight = '8px';
    
    profileLabel.appendChild(profileCheck);
    profileLabel.appendChild(document.createTextNode('Apply profile image styling (border & hover effects)'));
    profileSection.appendChild(profileLabel);

    // Create footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      border-top: 1px solid #444;
      padding-top: 15px;
    `;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
      padding: 8px 16px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply Styles';
    applyBtn.style.cssText = `
      padding: 8px 16px;
      background: #0d6efd;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    
    footer.appendChild(cancelBtn);
    footer.appendChild(applyBtn);

    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(sizeSection);
    modalContent.appendChild(shapeSection);
    modalContent.appendChild(alignSection);
    modalContent.appendChild(layoutSection);
    modalContent.appendChild(profileSection);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    
    // Add to DOM
    document.body.appendChild(modal);

    // Event handlers
    const closeModal = () => {
      modal.remove();
    };

    const applyStyles = () => {
      const size = sizeSelect.value;
      const shape = shapeSelect.value;
      const align = alignSelect.value;
      const layout = layoutSelect.value;
      const isProfile = profileCheck.checked;
      
      // Remove existing style classes
      const classesToRemove = ['img-small', 'img-medium', 'img-large', 'img-full', 
                              'img-circle', 'img-rounded', 'img-square',
                              'img-left', 'img-center', 'img-right', 'profile-img',
                              'img-wrap-left', 'img-wrap-right', 'img-no-wrap'];
      classesToRemove.forEach(cls => imgElement.classList.remove(cls));
      
      // Add new classes
      if (size) imgElement.classList.add(size);
      if (shape) imgElement.classList.add(shape);
      if (align) imgElement.classList.add(align);
      if (layout) imgElement.classList.add(layout);
      if (isProfile) imgElement.classList.add('profile-img');
      
      const appliedStyles = [size, shape, align, layout, isProfile ? 'profile-style' : ''].filter(Boolean);
      toast.success(`Image styles applied! ${appliedStyles.join(', ') || 'Default styles'}`);
      
      closeModal();
    };

    // Attach event listeners
    header.querySelector('#closeModal').addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    applyBtn.addEventListener('click', applyStyles);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Focus on first select for better UX
    setTimeout(() => {
      sizeSelect.focus();
    }, 100);

  }, []);

  // Stable image style handler
  const handleImageStyle = useCallback(function() {
    const range = this.quill.getSelection();
    if (range) {
      const [blot] = this.quill.getLeaf(range.index);
      if (blot && blot.domNode.tagName === 'IMG') {
        showImageStyleModal(blot.domNode);
      } else {
        alert('Please select an image first to apply styling');
      }
    }
  }, [showImageStyleModal]);

  // Memoized quill modules to prevent recreation on every render
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean'],
        ['imageStyle'] // Custom image styling button
      ],
      handlers: {
        imageStyle: handleImageStyle
      }
    },
    clipboard: {
      // Preserve HTML and attributes during paste operations
      matchVisual: false,
      keepOriginalFormat: true
    }
  }), [handleImageStyle]);

  // Custom formats to preserve image CSS classes
  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'script', 'indent', 'direction',
    'color', 'background', 'align', 'link', 'image', 'video',
    'img-small', 'img-medium', 'img-large', 'img-full',
    'img-circle', 'img-rounded', 'img-square', 
    'img-left', 'img-center', 'img-right', 'profile-img',
    'img-wrap-left', 'img-wrap-right', 'img-no-wrap',
    'class' // Add class format to preserve CSS classes
  ];

  if (loading) {
    return (
      <div className="admin-content">
        <Container fluid>
          <Row>
            <Col md={3} lg={2} className="p-0">
              <AdminSidebar />
            </Col>
            <Col md={9} lg={10} className="p-4 admin-main-content">
              <div className="text-center">
                <div className="spinner-custom mx-auto"></div>
                <p className="text-white mt-3">Loading blog post...</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <Container fluid>
        <Row>
          <Col md={3} lg={2} className="p-0">
            <AdminSidebar />
          </Col>
          <Col md={9} lg={10} className="p-4 admin-main-content">
            <div className="mb-4">
              <h1 className="text-white">Edit Blog Post</h1>
              <p className="text-white-50">Update and manage your blog post</p>
            </div>

            <Card className="bg-dark-custom border-0">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col lg={8}>
                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Title *</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Enter blog post title"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Slug</Form.Label>
                        <Form.Control
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleChange}
                          placeholder="blog-post-url-slug"
                        />
                        <Form.Text className="text-white-50">
                          URL-friendly version of the title
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Excerpt</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="excerpt"
                          value={formData.excerpt}
                          onChange={handleChange}
                          placeholder="Brief description of the blog post"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Content *</Form.Label>
                        <ReactQuill
                          theme="snow"
                          value={formData.content}
                          onChange={handleContentChange}
                          modules={quillModules}
                          formats={quillFormats}
                          preserveWhitespace={true}
                          style={{ height: '300px', marginBottom: '50px' }}
                        />
                      </Form.Group>
                    </Col>

                    <Col lg={4}>
                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Featured Image</Form.Label>
                        {formData.featuredImage && (
                          <div className="mb-2">
                            <img 
                              src={formData.featuredImage} 
                              alt="Featured content" 
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px' }}
                            />
                            <small className="d-block text-white-50 mt-1">Current image</small>
                          </div>
                        )}
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="mb-2"
                        />
                        <Form.Text className="text-white-50">
                          Or enter image URL:
                        </Form.Text>
                        <Form.Control
                          type="url"
                          name="featuredImage"
                          value={formData.featuredImage}
                          onChange={handleChange}
                          placeholder="https://example.com/image.jpg"
                          className="mt-2"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Video URL</Form.Label>
                        <Form.Control
                          type="url"
                          name="videoUrl"
                          value={formData.videoUrl}
                          onChange={handleChange}
                          placeholder="YouTube, Vimeo, or other video URL"
                        />
                        <Form.Text className="text-white-50">
                          Supports YouTube, Vimeo, and other embeddable video URLs
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Tags</Form.Label>
                        <Form.Control
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleChange}
                          placeholder="tag1, tag2, tag3"
                        />
                        <Form.Text className="text-white-50">
                          Separate tags with commas
                        </Form.Text>
                      </Form.Group>

                      <div className="d-grid gap-2">
                        <Button
                          type="submit"
                          className="btn-hero btn-hero-primary"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Updating...
                            </>
                          ) : (
                            'Update Blog Post'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline-secondary"
                          onClick={() => navigate('/admin/blogs')}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditBlog; 