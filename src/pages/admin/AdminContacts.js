import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Badge } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment';
import AdminSidebar from '../../components/AdminSidebar';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/admin/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    setResponseMessage('');
    
    // Mark as read if not already
    if (!contact.isRead) {
      markAsRead(contact._id);
    }
  };

  const markAsRead = async (contactId) => {
    try {
      await axios.patch(`/api/admin/contacts/${contactId}/read`);
      setContacts(contacts.map(contact => 
        contact._id === contactId ? { ...contact, isRead: true } : contact
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendResponse = async () => {
    if (!responseMessage.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    setSendingResponse(true);
    try {
      await axios.post(`/api/admin/contacts/${selectedContact._id}/respond`, {
        message: responseMessage
      });
      
      // Update the contact as responded
      setContacts(contacts.map(contact => 
        contact._id === selectedContact._id 
          ? { ...contact, isResponded: true, responseDate: new Date() }
          : contact
      ));
      
      toast.success('Response sent successfully!');
      setShowModal(false);
      setResponseMessage('');
    } catch (error) {
      toast.error('Failed to send response');
    } finally {
      setSendingResponse(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/contacts/${contactId}`);
      setContacts(contacts.filter(contact => contact._id !== contactId));
      toast.success('Contact message deleted');
    } catch (error) {
      toast.error('Failed to delete contact message');
    }
  };

  const getStatusBadge = (contact) => {
    if (contact.isResponded) {
      return <Badge bg="success">Responded</Badge>;
    } else if (contact.isRead) {
      return <Badge bg="info">Read</Badge>;
    } else {
      return <Badge bg="warning">New</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <Container fluid>
          <Row>
            <Col md={3} lg={2} className="p-0">
              <AdminSidebar />
            </Col>
            <Col md={9} lg={10} className="p-4 admin-main-content">
              <div className="text-center">
                <div className="spinner-custom mx-auto"></div>
                <p className="text-white mt-3">Loading contact messages...</p>
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
          <Col md={9} lg={10} className="p-4 admin-main-content">
            <div className="mb-4">
              <h1 className="text-white">Contact Messages</h1>
              <p className="text-white-50">View and respond to customer inquiries</p>
            </div>

            <div className="data-table">
              <Table dark responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-white-50 py-4">
                        No contact messages found.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact._id} className={!contact.isRead ? 'table-warning' : ''}>
                        <td className="text-white">{contact.name}</td>
                        <td className="text-white-50">{contact.email}</td>
                        <td className="text-white">
                          {contact.subject.length > 40 
                            ? contact.subject.substring(0, 40) + '...' 
                            : contact.subject
                          }
                        </td>
                        <td className="text-white-50">
                          {moment(contact.createdAt).format('MMM DD, YYYY HH:mm')}
                        </td>
                        <td>{getStatusBadge(contact)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleViewContact(contact)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(contact._id)}
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

      {/* Contact Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark border-secondary">
          <Modal.Title className="text-white">Contact Message Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          {selectedContact && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Name:</strong> {selectedContact.name}
                </Col>
                <Col md={6}>
                  <strong>Email:</strong> {selectedContact.email}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Phone:</strong> {selectedContact.phone || 'Not provided'}
                </Col>
                <Col md={6}>
                  <strong>Company:</strong> {selectedContact.company || 'Not provided'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <strong>Subject:</strong> {selectedContact.subject}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <strong>Message:</strong>
                  <div className="mt-2 p-3 bg-secondary rounded">
                    {selectedContact.message}
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <strong>Received:</strong> {moment(selectedContact.createdAt).format('MMMM DD, YYYY at HH:mm')}
                </Col>
              </Row>

              <hr className="border-secondary" />

              <div>
                <h6 className="text-white mb-3">Send Response</h6>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Type your response here..."
                  />
                </Form.Group>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendResponse}
            disabled={sendingResponse || !responseMessage.trim()}
          >
            {sendingResponse ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Sending...
              </>
            ) : (
              'Send Response'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminContacts; 