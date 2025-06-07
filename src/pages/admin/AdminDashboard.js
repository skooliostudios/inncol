import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalContacts: 0,
    publishedBlogs: 0,
    draftBlogs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-white">Dashboard</h1>
              <p className="text-white-50">Welcome to your admin dashboard</p>
            </div>

            {loading ? (
              <div className="text-center">
                <div className="spinner-custom mx-auto"></div>
              </div>
            ) : (
              <Row>
                <Col lg={3} md={6} className="mb-4">
                  <Card className="bg-dark-custom border-cyan">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="text-white-50">Total Blogs</h6>
                          <h2 className="text-cyan">{stats.totalBlogs}</h2>
                        </div>
                        <div className="text-cyan">
                          <i className="fas fa-blog"></i>
                        </div>
                      </div>
                      <Link to="/admin/blogs" className="text-decoration-none">
                        <small className="text-cyan">View Details →</small>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                  <Card className="bg-dark-custom border-cyan">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="text-white-50">Published</h6>
                          <h2 className="text-cyan">{stats.publishedBlogs}</h2>
                        </div>
                        <div className="text-cyan">
                          <i className="fas fa-check-circle"></i>
                        </div>
                      </div>
                      <Link to="/admin/blogs" className="text-decoration-none">
                        <small className="text-cyan">Manage Blogs →</small>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                  <Card className="bg-dark-custom border-cyan">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="text-white-50">Drafts</h6>
                          <h2 className="text-cyan">{stats.draftBlogs}</h2>
                        </div>
                        <div className="text-cyan">
                          <i className="fas fa-edit"></i>
                        </div>
                      </div>
                      <Link to="/admin/blogs" className="text-decoration-none">
                        <small className="text-cyan">Edit Drafts →</small>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={3} md={6} className="mb-4">
                  <Card className="bg-dark-custom border-cyan">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="text-white-50">Contact Messages</h6>
                          <h2 className="text-cyan">{stats.totalContacts}</h2>
                        </div>
                        <div className="text-cyan">
                          <i className="fas fa-envelope"></i>
                        </div>
                      </div>
                      <Link to="/admin/contacts" className="text-decoration-none">
                        <small className="text-cyan">View Messages →</small>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            <Row className="mt-5">
              <Col>
                <Card className="bg-dark-custom border-0">
                  <Card.Body>
                    <h5 className="text-white mb-3">Quick Actions</h5>
                    <div className="d-flex flex-wrap gap-3">
                      <Link to="/admin/blogs/create" className="btn btn-hero btn-hero-primary">
                        Create New Blog Post
                      </Link>
                      <Link to="/admin/contacts" className="btn btn-hero btn-hero-secondary">
                        View Contact Messages
                      </Link>
                      <Link to="/admin/pages" className="btn btn-hero btn-hero-secondary">
                        Manage Pages
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard; 