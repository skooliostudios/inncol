import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const About = () => {
  return (
    <div className="contact-section">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-white mb-4">About Inncol</h1>
              <p className="lead text-white-50">
                We are a digital ad agency built on creativity that transforms customers to your brand.
              </p>
            </div>
            
            <Row>
              <Col md={6} className="mb-4">
                <div className="bg-dark-custom p-4 rounded-3 h-100">
                  <h3 className="text-cyan mb-3">Our Mission</h3>
                  <p className="text-white-50">
                    To help businesses thrive in the digital landscape by creating compelling, 
                    innovative marketing solutions that drive real results and meaningful connections 
                    with their target audience.
                  </p>
                </div>
              </Col>
              <Col md={6} className="mb-4">
                <div className="bg-dark-custom p-4 rounded-3 h-100">
                  <h3 className="text-cyan mb-3">Our Vision</h3>
                  <p className="text-white-50">
                    To be the leading digital agency that transforms how brands connect with 
                    their customers through cutting-edge technology, creative excellence, and 
                    strategic innovation.
                  </p>
                </div>
              </Col>
            </Row>
            
            <div className="text-center mt-5">
              <h2 className="text-white mb-4">Why Choose Us?</h2>
              <Row>
                <Col md={4} className="mb-4">
                  <div className="bg-dark-custom p-4 rounded-3 h-100 text-center">
                    <h4 className="text-cyan">Creative Excellence</h4>
                    <p className="text-white-50">Award-winning creative team with years of experience</p>
                  </div>
                </Col>
                <Col md={4} className="mb-4">
                  <div className="bg-dark-custom p-4 rounded-3 h-100 text-center">
                    <h4 className="text-cyan">Data-Driven Results</h4>
                    <p className="text-white-50">Strategic approach backed by analytics and insights</p>
                  </div>
                </Col>
                <Col md={4} className="mb-4">
                  <div className="bg-dark-custom p-4 rounded-3 h-100 text-center">
                    <h4 className="text-cyan">Full-Service Solutions</h4>
                    <p className="text-white-50">Everything you need under one roof</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About; 