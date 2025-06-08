import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Careers = () => {
  return (
    <div className="contact-section">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-white mb-4">Join Our Team</h1>
              <p className="lead text-white-50">
                Be part of an innovative team that's transforming the digital advertising landscape.
              </p>
            </div>
            
            <Row className="mb-5">
              <Col md={6} className="mb-4">
                <div className="blog-card p-4 h-100">
                  <h3 className="blog-title mb-3">Why Work With Us?</h3>
                  <ul className="blog-excerpt">
                    <li>Competitive salary and benefits</li>
                    <li>Flexible working arrangements</li>
                    <li>Professional development opportunities</li>
                    <li>Creative and collaborative environment</li>
                    <li>Work on exciting client projects</li>
                  </ul>
                </div>
              </Col>
              <Col md={6} className="mb-4">
                <div className="blog-card p-4 h-100">
                  <h3 className="blog-title mb-3">Open Positions</h3>
                  <p className="blog-excerpt mb-3">
                    We're always looking for talented individuals to join our team:
                  </p>
                  <ul className="blog-excerpt">
                    <li>Digital Marketing Specialist</li>
                    <li>Creative Designer</li>
                    <li>Content Writer</li>
                    <li>Account Manager</li>
                    <li>Web Developer</li>
                  </ul>
                </div>
              </Col>
            </Row>
            
            <div className="text-center">
              <div className="blog-card p-5">
                <h2 className="blog-title mb-4">Ready to Apply?</h2>
                <p className="blog-excerpt mb-4">
                  Send us your resume and portfolio, and let's discuss how you can contribute to our mission.
                </p>
                <Button 
                  as={Link} 
                  to="/contact" 
                  className="btn-hero btn-hero-primary"
                >
                  Get In Touch
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Careers; 