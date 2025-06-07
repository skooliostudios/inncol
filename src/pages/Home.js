import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="hero-section">
      <div className="hero-pattern"></div>
      <Container className="hero-content">
        <Row className="min-vh-100 align-items-center justify-content-center text-center">
          <Col lg={10} xl={8}>
            <h1 className="hero-title">
              A Digital Ad Agency
            </h1>
            <p className="hero-subtitle">
              built on creativity that transforms<br />
              customers to your Brand!
            </p>
            <div className="hero-buttons">
              <Button 
                as={Link} 
                to="/contact" 
                className="btn-hero btn-hero-secondary"
              >
                Innovate
              </Button>
              <Button 
                as={Link} 
                to="/about" 
                className="btn-hero btn-hero-primary"
              >
                Collaborate
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home; 