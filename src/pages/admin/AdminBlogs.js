import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment';
import AdminSidebar from '../../components/AdminSidebar';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('/api/admin/blogs');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (blogId, newStatus) => {
    try {
      await axios.patch(`/api/blogs/${blogId}/status`, { status: newStatus });
      setBlogs(blogs.map(blog => 
        blog._id === blogId ? { ...blog, status: newStatus } : blog
      ));
      toast.success(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      toast.error('Failed to update blog status');
    }
  };

  const handleDeleteClick = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/blogs/${blogToDelete._id}`);
      setBlogs(blogs.filter(blog => blog._id !== blogToDelete._id));
      toast.success('Blog deleted successfully');
      setShowDeleteModal(false);
      setBlogToDelete(null);
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const getStatusBadge = (status) => {
    return (
      <Badge bg={status === 'published' ? 'success' : 'warning'}>
        {status}
      </Badge>
    );
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
                <p className="text-white mt-3">Loading blogs...</p>
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
                <h1 className="text-white">Blog Posts</h1>
                <p className="text-white-50">Manage your blog posts</p>
              </div>
              <Link to="/admin/blogs/create" className="btn btn-hero btn-hero-primary">
                Create New Post
              </Link>
            </div>

            <div className="data-table">
              <Table dark responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-white-50 py-4">
                        No blog posts found. <Link to="/admin/blogs/create" className="text-cyan">Create your first post</Link>
                      </td>
                    </tr>
                  ) : (
                    blogs.map((blog) => (
                      <tr key={blog._id}>
                        <td>
                          <div>
                            <strong className="text-white">{blog.title}</strong>
                            {blog.excerpt && (
                              <div>
                                <small className="text-white-50">
                                  {blog.excerpt.length > 80 
                                    ? blog.excerpt.substring(0, 80) + '...' 
                                    : blog.excerpt
                                  }
                                </small>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{getStatusBadge(blog.status)}</td>
                        <td className="text-white-50">
                          {moment(blog.createdAt).format('MMM DD, YYYY')}
                        </td>
                        <td className="text-white-50">
                          {moment(blog.updatedAt).format('MMM DD, YYYY')}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              as={Link}
                              to={`/blog/${blog.slug}`}
                              variant="outline-info"
                              size="sm"
                              target="_blank"
                            >
                              View
                            </Button>
                            <Button
                              as={Link}
                              to={`/admin/blogs/edit/${blog._id}`}
                              variant="outline-warning"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              variant={blog.status === 'published' ? 'outline-secondary' : 'outline-success'}
                              size="sm"
                              onClick={() => handleStatusChange(
                                blog._id, 
                                blog.status === 'published' ? 'draft' : 'published'
                              )}
                            >
                              {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(blog)}
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-dark border-secondary">
          <Modal.Title className="text-white">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <p>Are you sure you want to delete this blog post?</p>
          {blogToDelete && (
            <p><strong>"{blogToDelete.title}"</strong></p>
          )}
          <p className="text-warning">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminBlogs; 