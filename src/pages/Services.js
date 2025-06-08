import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Services = () => {
  const services = [
    {
      title: "AI Workflows",
      description: "Intelligent workflow automation that streamlines your business processes and increases efficiency.",
      features: ["Process Optimization", "Smart Task Routing", "Predictive Analytics", "Custom AI Solutions"]
    },
    {
      title: "Automation",
      description: "End-to-end business automation solutions that reduce manual work and improve productivity.",
      features: ["Marketing Automation", "Sales Funnel Automation", "Customer Service Bots", "Data Processing"]
    },
    {
      title: "AI Agents",
      description: "Advanced AI-powered agents that handle customer interactions and business operations 24/7.",
      features: ["Conversational AI", "Virtual Assistants", "Lead Qualification", "Customer Support Automation"]
    },
    {
      title: "Digital Marketing Strategy",
      description: "Comprehensive digital marketing strategies tailored to your business goals and target audience.",
      features: ["Market Research", "Competitor Analysis", "Customer Journey Mapping", "ROI Optimization"]
    },
    {
      title: "Social Media Management",
      description: "Complete social media presence management across all platforms to build your brand community.",
      features: ["Content Creation", "Community Management", "Social Advertising", "Analytics & Reporting"]
    },
    {
      title: "Search Engine Optimization",
      description: "Boost your online visibility and organic traffic with our proven SEO strategies.",
      features: ["Keyword Research", "On-Page Optimization", "Technical SEO", "Link Building"]
    },
    {
      title: "Pay-Per-Click Advertising",
      description: "Targeted advertising campaigns that deliver immediate results and maximum ROI.",
      features: ["Google Ads", "Facebook Ads", "LinkedIn Ads", "Campaign Optimization"]
    },
    {
      title: "Content Marketing",
      description: "Engaging content that tells your brand story and connects with your audience.",
      features: ["Blog Writing", "Video Production", "Infographics", "Email Campaigns"]
    },
    {
      title: "Web Design & Development",
      description: "Modern, responsive websites that convert visitors into customers.",
      features: ["Custom Design", "Mobile Optimization", "E-commerce", "CMS Integration"]
    },
    {
      title: "Brand Identity Design",
      description: "Complete brand identity solutions that make your business stand out from the competition.",
      features: ["Logo Design", "Brand Guidelines", "Marketing Materials", "Digital Assets"]
    },
    {
      title: "Analytics & Reporting",
      description: "Data-driven insights to measure performance and optimize your marketing efforts.",
      features: ["Performance Tracking", "Custom Dashboards", "Monthly Reports", "Growth Analysis"]
    }
  ];

  return (
    <div className="contact-section">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-white mb-4">Our Services</h1>
              <p className="lead text-white-50">
                Comprehensive digital marketing solutions to transform your business and drive growth.
              </p>
            </div>
            
            <Row>
              {services.map((service, index) => (
                <Col lg={6} className="mb-4" key={index}>
                  <Card className="blog-card h-100">
                    <Card.Body className="blog-card-body">
                      <h3 className="blog-title mb-3">{service.title}</h3>
                      <p className="blog-excerpt mb-4">{service.description}</p>
                      <ul className="list-unstyled">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="text-white-50 mb-2">
                            <span className="text-cyan me-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            
            <div className="text-center mt-5">
              <div className="blog-card p-5">
                <h2 className="blog-title mb-4">Ready to Transform Your Business?</h2>
                <p className="lead blog-excerpt mb-4">
                  Let's discuss how our services can help you achieve your digital marketing goals.
                </p>
                <a href="/contact" className="btn btn-hero btn-hero-primary">
                  Get Started Today
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Services; 