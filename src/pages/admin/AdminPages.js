import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Card } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment';
import slugify from 'slugify';
import ReactQuill from 'react-quill';
import AdminSidebar from '../../components/AdminSidebar';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    isPublished: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get('/api/admin/pages');
      setPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaDescription: '',
      isPublished: true
    });
    setShowModal(true);
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.metaDescription || '',
      isPublished: page.isPublished
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && { slug: slugify(value, { lower: true, strict: true }) })
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingPage) {
        await axios.put(`/api/admin/pages/${editingPage._id}`, formData);
        toast.success('Page updated successfully!');
      } else {
        await axios.post('/api/admin/pages', formData);
        toast.success('Page created successfully!');
      }
      
      setShowModal(false);
      fetchPages();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/pages/${pageId}`);
      setPages(pages.filter(page => page._id !== pageId));
      toast.success('Page deleted successfully');
    } catch (error) {
      toast.error('Failed to delete page');
    }
  };

  const togglePublishStatus = async (pageId, currentStatus) => {
    try {
      await axios.patch(`/api/admin/pages/${pageId}/publish`, { 
        isPublished: !currentStatus 
      });
      setPages(pages.map(page => 
        page._id === pageId ? { ...page, isPublished: !currentStatus } : page
      ));
      toast.success(`Page ${!currentStatus ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      toast.error('Failed to update page status');
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
      ['link', 'image'],
      ['clean']
    ],
  };

  if (loading) {
    return (
      <div className="admin-content">
        <Container fluid>
          <Row>
            <Col md={3} lg={2} className="p-0">
              <AdminSidebar />
            </Col>
            <Col md={9} lg={10} className="p-4">
              <div className="text-center">
                <div className="spinner-custom mx-auto"></div>
                <p className="text-white mt-3">Loading pages...</p>
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
          <Col md={9} lg={10} className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="text-white">Manage Pages</h1>
                <p className="text-white-50">Create and manage custom pages with routes</p>
              </div>
              <Button onClick={handleCreateNew} className="btn-hero btn-hero-primary">
                Create New Page
              </Button>
            </div>

            <Card className="bg-dark-custom border-0 mb-4">
              <Card.Body>
                <h5 className="text-white mb-3">Page Management</h5>
                <p className="text-white-50 mb-0">
                  Create custom pages that will be automatically accessible via their slug URL. 
                  For example, a page with slug "services" will be available at "/services".
                </p>
              </Card.Body>
            </Card>

            <div className="data-table">
              <Table dark responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-white-50 py-4">
                        No custom pages found. Create your first page to get started.
                      </td>
                    </tr>
                  ) : (
                    pages.map((page) => (
                      <tr key={page._id}>
                        <td className="text-white">{page.title}</td>
                        <td className="text-cyan">/{page.slug}</td>
                        <td>
                          <span className={`badge ${page.isPublished ? 'bg-success' : 'bg-warning'}`}>
                            {page.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="text-white-50">
                          {moment(page.createdAt).format('MMM DD, YYYY')}
                        </td>
                        <td className="text-white-50">
                          {moment(page.updatedAt).format('MMM DD, YYYY')}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => window.open(`/${page.slug}`, '_blank')}
                              disabled={!page.isPublished}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleEdit(page)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant={page.isPublished ? 'outline-secondary' : 'outline-success'}
                              size="sm"
                              onClick={() => togglePublishStatus(page._id, page.isPublished)}
                            >
                              {page.isPublished ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(page._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Create/Edit Page Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-dark border-secondary">
          <Modal.Title className="text-white">
            {editingPage ? 'Edit Page' : 'Create New Page'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Page Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter page title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>URL Slug *</Form.Label>
                  <Form.Control
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="page-url-slug"
                    required
                  />
                  <Form.Text className="text-white-50">
                    Will be accessible at: /{formData.slug}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Meta Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder="SEO description for this page"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Page Content *</Form.Label>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={quillModules}
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                label="Publish immediately"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                {editingPage ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingPage ? 'Update Page' : 'Create Page'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPages; 