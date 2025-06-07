import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('/api/blogs');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const getExcerpt = (content, length = 150) => {
    const text = stripHtml(content);
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (loading) {
    return (
      <div className="contact-section">
        <Container>
          <div className="text-center">
            <div className="spinner-custom mx-auto"></div>
            <p className="text-white mt-3">Loading blogs...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="contact-section">
      <Container>
        <Row>
          <Col>
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-white mb-4">Our Blog</h1>
              <p className="lead text-white-50">
                Insights, trends, and expert advice from our team
              </p>
            </div>
          </Col>
        </Row>

        <Row>
          {blogs.length === 0 ? (
            <Col>
              <div className="text-center">
                <p className="text-white-50">No blog posts found. Check back soon!</p>
              </div>
            </Col>
          ) : (
            blogs.map((blog) => (
              <Col lg={4} md={6} key={blog._id} className="mb-4">
                <Card className="blog-card h-100">
                  {blog.featuredImage && (
                    <Card.Img 
                      variant="top" 
                      src={blog.featuredImage} 
                      alt={blog.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body className="blog-card-body d-flex flex-column">
                    <div className="blog-meta mb-2">
                      <small>{moment(blog.createdAt).format('MMMM DD, YYYY')}</small>
                    </div>
                    <Card.Title className="blog-title">
                      <Link 
                        to={`/blog/${blog.slug}`} 
                        className="text-decoration-none text-white"
                      >
                        {blog.title}
                      </Link>
                    </Card.Title>
                    <Card.Text className="blog-excerpt flex-grow-1">
                      {getExcerpt(blog.content)}
                    </Card.Text>
                    <div className="mt-auto">
                      <Button 
                        as={Link} 
                        to={`/blog/${blog.slug}`} 
                        variant="outline-light" 
                        size="sm"
                      >
                        Read More
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Blog; 