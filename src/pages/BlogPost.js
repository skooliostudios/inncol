import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const BlogPost = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlog = useCallback(async () => {
    try {
      const response = await axios.get(`/api/blogs/${slug}`);
      setBlog(response.data);
    } catch (error) {
      setError('Blog post not found');
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const renderVideoEmbed = (videoUrl) => {
    if (!videoUrl) return null;

    // YouTube URL regex
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);

    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return (
        <div className="ratio ratio-16x9 mb-4">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Embedded video"
            allowFullScreen
            className="rounded"
          ></iframe>
        </div>
      );
    }

    // Vimeo URL regex
    const vimeoRegex = /vimeo\.com\/(?:.*\/)?(\d+)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);

    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return (
        <div className="ratio ratio-16x9 mb-4">
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            title="Embedded video"
            allowFullScreen
            className="rounded"
          ></iframe>
        </div>
      );
    }

    // Generic video embed
    return (
      <div className="ratio ratio-16x9 mb-4">
        <iframe
          src={videoUrl}
          title="Embedded video"
          allowFullScreen
          className="rounded"
        ></iframe>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="contact-section">
        <Container>
          <div className="text-center">
            <div className="spinner-custom mx-auto"></div>
            <p className="text-white mt-3">Loading blog post...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="contact-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h1 className="text-white mb-4">Blog Post Not Found</h1>
              <p className="text-white-50 mb-4">
                The blog post you're looking for doesn't exist or has been moved.
              </p>
              <Link to="/blog" className="btn btn-hero btn-hero-primary">
                Back to Blog
              </Link>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="contact-section">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="mb-4">
              <Link to="/blog" className="text-cyan text-decoration-none">
                ← Back to Blog
              </Link>
            </div>

            <Card className="bg-dark-custom border-0">
              <Card.Body className="p-5">
                <div className="blog-meta mb-3">
                  <small className="text-white-50">
                    Published on {moment(blog.createdAt).format('MMMM DD, YYYY')}
                    {blog.updatedAt !== blog.createdAt && (
                      <> • Updated {moment(blog.updatedAt).format('MMMM DD, YYYY')}</>
                    )}
                  </small>
                </div>

                <h1 className="text-white fw-bold mb-4">{blog.title}</h1>

                {blog.featuredImage && (
                  <div className="mb-4">
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="img-fluid rounded"
                      style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {blog.videoUrl && renderVideoEmbed(blog.videoUrl)}

                <div 
                  className="text-white-50"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                  style={{ lineHeight: '1.8' }}
                />

                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-5">
                    <h6 className="text-white mb-3">Tags:</h6>
                    <div>
                      {blog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="badge bg-secondary me-2 mb-2"
                          style={{ fontSize: '0.9rem' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BlogPost; 