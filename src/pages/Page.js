import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const Page = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async () => {
    try {
      const response = await axios.get(`/api/pages/${slug}`);
      setPage(response.data);
    } catch (error) {
      setError('Page not found');
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  useEffect(() => {
    if (page && page.title) {
      document.title = `${page.title} - Inncol`;
    }
    if (page && page.metaDescription) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', page.metaDescription);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = page.metaDescription;
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
    }
  }, [page]);

  if (loading) {
    return (
      <div className="contact-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <div className="spinner-custom mx-auto"></div>
              <p className="text-white mt-3">Loading page...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="contact-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h1 className="text-white mb-4">Page Not Found</h1>
              <p className="text-white-50 mb-4">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <Link to="/" className="btn btn-hero btn-hero-primary">
                Back to Home
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
          <Col lg={10} xl={8}>
            <div className="mb-4">
              <Link to="/" className="text-cyan text-decoration-none">
                ← Back to Home
              </Link>
            </div>

            <Card className="bg-dark-custom border-0">
              <Card.Body className="p-5">
                <div className="page-meta mb-3">
                  <small className="text-white-50">
                    Published on {moment(page.publishedAt || page.createdAt).format('MMMM DD, YYYY')}
                    {page.updatedAt !== page.createdAt && (
                      <> • Updated {moment(page.updatedAt).format('MMMM DD, YYYY')}</>
                    )}
                    {page.author && (
                      <> • By {page.author.name}</>
                    )}
                  </small>
                </div>

                <h1 className="text-white fw-bold mb-4">{page.title}</h1>

                <div 
                  className="text-white-50"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                  style={{ 
                    lineHeight: '1.8',
                    fontSize: '1.1rem'
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Page; 