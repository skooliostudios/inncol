import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="admin-sidebar">
      <div className="p-3">
        <h5 className="text-white mb-0">Admin Panel</h5>
        {user && (
          <small className="text-white-50">Welcome, {user.name}</small>
        )}
      </div>
      
      <Nav className="flex-column sidebar-nav">
        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/admin" 
            className={isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}
          >
            <i className="fas fa-tachometer-alt me-2"></i>
            Dashboard
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/admin/blogs" 
            className={isActive('/admin/blogs') ? 'active' : ''}
          >
            <i className="fas fa-blog me-2"></i>
            Blog Posts
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/admin/blogs/create" 
            className={isActive('/admin/blogs/create') ? 'active' : ''}
          >
            <i className="fas fa-plus me-2"></i>
            Create Blog
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/admin/contacts" 
            className={isActive('/admin/contacts') ? 'active' : ''}
          >
            <i className="fas fa-envelope me-2"></i>
            Contact Messages
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/admin/pages" 
            className={isActive('/admin/pages') ? 'active' : ''}
          >
            <i className="fas fa-file-alt me-2"></i>
            Manage Pages
          </Nav.Link>
        </Nav.Item>
        
        <hr className="border-secondary mx-3" />
        
        <Nav.Item>
          <Nav.Link as={Link} to="/" target="_blank">
            <i className="fas fa-external-link-alt me-2"></i>
            View Website
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default AdminSidebar; 