import React, { useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import ReCAPTCHA from 'react-google-recaptcha';
import axios from 'axios';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef();

  // Debug: Log the environment variable
  console.log('Environment variable loaded:', process.env.REACT_APP_RECAPTCHA_SITE_KEY);
  
  const actualSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LdEJmsrAAAAAChMhC-Rukx30aBQs3lib4Qks71y";
  console.log('Actual site key being used:', actualSiteKey);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const recaptchaValue = recaptchaRef.current.getValue();
    if (!recaptchaValue) {
      toast.error('Please complete the reCAPTCHA');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/contact', {
        ...formData,
        recaptcha: recaptchaValue
      });

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      });
      recaptchaRef.current.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-section">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-white mb-4">Get In Touch</h1>
              <p className="lead text-white-50">
                Ready to transform your brand? Let's discuss your project and create something amazing together.
              </p>
            </div>
            
            <Card className="blog-card border-0 shadow-cyan">
              <Card.Body className="blog-card-body">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="text-white fw-semibold">Company</Form.Label>
                        <Form.Control
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Your company name"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="text-white fw-semibold">Subject *</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What can we help you with?"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="text-white fw-semibold">Message *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project, goals, and how we can help..."
                      required
                    />
                  </Form.Group>
                  
                  <div className="mb-4 d-flex justify-content-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={actualSiteKey}
                      theme="dark"
                    />
                  </div>
                  
                  <div className="text-center">
                    <Button
                      type="submit"
                      className="btn-hero btn-hero-primary"
                      disabled={loading}
                      style={{ minWidth: '200px' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact; 