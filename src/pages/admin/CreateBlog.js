import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import slugify from 'slugify';
import AdminSidebar from '../../components/AdminSidebar';

const CreateBlog = () => {
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
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && { slug: slugify(value, { lower: true, strict: true }) })
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

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
    setLoading(true);

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

      await axios.post('/api/blogs', blogData);
      toast.success('Blog post created successfully!');
      navigate('/admin/blogs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="admin-content">
      <Container fluid>
        <Row>
          <Col md={3} lg={2} className="p-0">
            <AdminSidebar />
          </Col>
          <Col md={9} lg={10} className="p-4">
            <div className="mb-4">
              <h1 className="text-white">Create New Blog Post</h1>
              <p className="text-white-50">Write and publish a new blog post</p>
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
                          URL-friendly version of the title (auto-generated)
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
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Creating...
                            </>
                          ) : (
                            'Create Blog Post'
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

export default CreateBlog; 