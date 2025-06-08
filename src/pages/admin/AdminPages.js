import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Card } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import moment from 'moment';
import slugify from 'slugify';
import ReactQuill, { Quill } from 'react-quill';
import AdminSidebar from '../../components/AdminSidebar';

// Configure Quill to preserve image attributes and classes
const ImageBlot = Quill.import('formats/image');
class CustomImageBlot extends ImageBlot {
  static create(value) {
    const node = super.create(value);
    if (typeof value === 'string') {
      node.setAttribute('src', value);
    } else {
      node.setAttribute('src', value.src || value.url || value);
      // Preserve any existing classes
      if (value.className || value.class) {
        node.setAttribute('class', value.className || value.class);
      }
    }
    return node;
  }

  static value(domNode) {
    const src = domNode.getAttribute('src');
    const className = domNode.getAttribute('class');
    if (className) {
      return { src, className };
    }
    return src;
  }

  static formats(domNode) {
    const formats = {};
    // Preserve class attribute
    if (domNode.hasAttribute('class')) {
      formats.class = domNode.getAttribute('class');
    }
    return formats;
  }

  format(name, value) {
    if (name === 'class') {
      this.domNode.setAttribute('class', value);
    } else {
      super.format(name, value);
    }
  }
}

// Register the custom image blot
Quill.register(CustomImageBlot, true);

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    isPublished: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get('/api/admin/pages');
      setPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaDescription: '',
      isPublished: true
    });
    setShowModal(true);
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.metaDescription || '',
      isPublished: page.isPublished
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && { slug: slugify(value, { lower: true, strict: true }) })
    }));
  };

  const handleContentChange = useCallback((content) => {
    setFormData(prev => ({ ...prev, content }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingPage) {
        await axios.put(`/api/admin/pages/${editingPage._id}`, formData);
        toast.success('Page updated successfully!');
      } else {
        await axios.post('/api/admin/pages', formData);
        toast.success('Page created successfully!');
      }
      
      setShowModal(false);
      fetchPages();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/pages/${pageId}`);
      setPages(pages.filter(page => page._id !== pageId));
      toast.success('Page deleted successfully');
    } catch (error) {
      toast.error('Failed to delete page');
    }
  };

  const togglePublishStatus = async (pageId, currentStatus) => {
    try {
      await axios.patch(`/api/admin/pages/${pageId}/publish`, { 
        isPublished: !currentStatus 
      });
      setPages(pages.map(page => 
        page._id === pageId ? { ...page, isPublished: !currentStatus } : page
      ));
      toast.success(`Page ${!currentStatus ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      toast.error('Failed to update page status');
    }
  };

  // Stable function to show image styling modal
  const showImageStyleModal = useCallback((imgElement) => {
    console.log('🚀 Starting showImageStyleModal...');
    
    // Remove any existing modals first
    const existingModal = document.querySelector('.image-style-modal');
    if (existingModal) {
      console.log('🗑️ Removing existing modal...');
      existingModal.remove();
    }

    console.log('📝 Getting current classes...');
    // Get current classes
    const currentClasses = imgElement.className.split(' ');
    
    // Find current values
    let currentSize = '';
    let currentShape = '';
    let currentAlign = '';
    let currentProfile = false;
    
    ['img-small', 'img-medium', 'img-large', 'img-full'].forEach(cls => {
      if (currentClasses.includes(cls)) currentSize = cls;
    });
    
    ['img-circle', 'img-rounded', 'img-square'].forEach(cls => {
      if (currentClasses.includes(cls)) currentShape = cls;
    });
    
    ['img-left', 'img-center', 'img-right'].forEach(cls => {
      if (currentClasses.includes(cls)) currentAlign = cls;
    });
    
    currentProfile = currentClasses.includes('profile-img');
    
    console.log('🎯 Current values:', { currentSize, currentShape, currentAlign, currentProfile });

    console.log('🏗️ Creating modal backdrop...');
    // Create modal backdrop
    const modal = document.createElement('div');
    modal.className = 'image-style-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.95);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateZ(0);
      padding: 20px;
    `;

    console.log('📦 Creating modal content...');
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #1a1a1a;
      color: white;
      border: 2px solid #3bc0ff;
      border-radius: 12px;
      padding: 30px;
      width: 90vw;
      max-width: 1200px;
      max-height: 90vh;
      overflow-y: auto;
      transform: translateZ(0);
      isolation: isolate;
      box-shadow: 0 25px 50px rgba(59, 192, 255, 0.3);
    `;

    console.log('📋 Creating header...');
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #3bc0ff;
      padding-bottom: 15px;
    `;
    header.innerHTML = `
      <h3 style="margin: 0; color: #3bc0ff; font-weight: bold;">🎨 Style Your Image</h3>
      <button id="closeModal" style="background: #3bc0ff; border: none; color: white; font-size: 24px; cursor: pointer; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">&times;</button>
    `;

    // Create main grid container
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    `;

    // Create left column container
    const leftColumn = document.createElement('div');
    leftColumn.style.cssText = `
      display: grid;
      gap: 25px;
    `;

    // Create right column container  
    const rightColumn = document.createElement('div');
    rightColumn.style.cssText = `
      display: grid;
      gap: 25px;
    `;

    console.log('📏 Creating size section...');
    // Create size section with radio buttons
    const sizeSection = document.createElement('div');
    sizeSection.style.cssText = `
      background: rgba(59, 192, 255, 0.1);
      border: 1px solid rgba(59, 192, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
    `;
    sizeSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: #3bc0ff; font-weight: bold;">📏 Size</h4>
    `;
    
    const sizeGrid = document.createElement('div');
    sizeGrid.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    `;
    
    const sizeValues = [
      { value: '', label: 'Default' },
      { value: 'img-small', label: 'Small (150px)' },
      { value: 'img-medium', label: 'Medium (300px)' },
      { value: 'img-large', label: 'Large (500px)' },
      { value: 'img-full', label: 'Full Width', span: true }
    ];
    
    let selectedSizeValue = currentSize;
    
    sizeValues.forEach((option, index) => {
      const radioContainer = document.createElement('div');
      radioContainer.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px;
        cursor: pointer;
        border-radius: 6px;
        border: 2px solid transparent;
        background: rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
        ${option.span ? 'grid-column: 1 / -1;' : ''}
      `;
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'imageSize';
      radio.value = option.value;
      radio.checked = option.value === currentSize;
      radio.style.cssText = `
        margin-right: 10px;
        transform: scale(1.3);
        cursor: pointer;
        accent-color: #3bc0ff;
      `;
      
      const label = document.createElement('label');
      label.textContent = option.label;
      label.style.cssText = `
        color: white;
        cursor: pointer;
        margin: 0;
        font-weight: 500;
      `;
      
      // Set initial selected state
      if (option.value === currentSize) {
        radioContainer.style.border = '2px solid #3bc0ff';
        radioContainer.style.background = 'rgba(59, 192, 255, 0.2)';
      }
      
      // Add hover effect
      radioContainer.addEventListener('mouseover', () => {
        if (!radio.checked) {
          radioContainer.style.border = '2px solid rgba(59, 192, 255, 0.5)';
          radioContainer.style.background = 'rgba(59, 192, 255, 0.1)';
        }
      });
      radioContainer.addEventListener('mouseout', () => {
        if (!radio.checked) {
          radioContainer.style.border = '2px solid transparent';
          radioContainer.style.background = 'rgba(255, 255, 255, 0.05)';
        }
      });
      
      // Handle click on container
      radioContainer.addEventListener('click', () => {
        // Uncheck all other radio buttons and reset styles
        sizeGrid.querySelectorAll('input[name="imageSize"]').forEach((r, i) => {
          r.checked = false;
          r.parentElement.style.border = '2px solid transparent';
          r.parentElement.style.background = 'rgba(255, 255, 255, 0.05)';
        });
        radio.checked = true;
        radioContainer.style.border = '2px solid #3bc0ff';
        radioContainer.style.background = 'rgba(59, 192, 255, 0.2)';
        selectedSizeValue = option.value;
        console.log('📏 Size changed to:', option.value);
      });
      
      radioContainer.appendChild(radio);
      radioContainer.appendChild(label);
      sizeGrid.appendChild(radioContainer);
    });
    
    sizeSection.appendChild(sizeGrid);
    leftColumn.appendChild(sizeSection);
    
    console.log('🔹 Creating shape section...');
    // Create shape section with radio buttons
    const shapeSection = document.createElement('div');
    shapeSection.style.cssText = `
      background: rgba(255, 165, 0, 0.1);
      border: 1px solid rgba(255, 165, 0, 0.3);
      border-radius: 8px;
      padding: 20px;
    `;
    shapeSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: #ffa500; font-weight: bold;">🔹 Shape</h4>
    `;
    
    const shapeGrid = document.createElement('div');
    shapeGrid.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    `;
    
    const shapeValues = [
      { value: '', label: 'Default' },
      { value: 'img-circle', label: 'Circle' },
      { value: 'img-rounded', label: 'Rounded' },
      { value: 'img-square', label: 'Square' }
    ];
    
    let selectedShapeValue = currentShape;
    
    shapeValues.forEach((option, index) => {
      const radioContainer = document.createElement('div');
      radioContainer.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px;
        cursor: pointer;
        border-radius: 6px;
        border: 2px solid transparent;
        background: rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
      `;
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'imageShape';
      radio.value = option.value;
      radio.checked = option.value === currentShape;
      radio.style.cssText = `
        margin-right: 10px;
        transform: scale(1.3);
        cursor: pointer;
        accent-color: #ffa500;
      `;
      
      const label = document.createElement('label');
      label.textContent = option.label;
      label.style.cssText = `
        color: white;
        cursor: pointer;
        margin: 0;
        font-weight: 500;
      `;
      
      // Set initial selected state
      if (option.value === currentShape) {
        radioContainer.style.border = '2px solid #ffa500';
        radioContainer.style.background = 'rgba(255, 165, 0, 0.2)';
      }
      
      // Add hover effect
      radioContainer.addEventListener('mouseover', () => {
        if (!radio.checked) {
          radioContainer.style.border = '2px solid rgba(255, 165, 0, 0.5)';
          radioContainer.style.background = 'rgba(255, 165, 0, 0.1)';
        }
      });
      radioContainer.addEventListener('mouseout', () => {
        if (!radio.checked) {
          radioContainer.style.border = '2px solid transparent';
          radioContainer.style.background = 'rgba(255, 255, 255, 0.05)';
        }
      });
      
      // Handle click on container
      radioContainer.addEventListener('click', () => {
        // Uncheck all other radio buttons and reset styles
        shapeGrid.querySelectorAll('input[name="imageShape"]').forEach((r, i) => {
          r.checked = false;
          r.parentElement.style.border = '2px solid transparent';
          r.parentElement.style.background = 'rgba(255, 255, 255, 0.05)';
        });
        radio.checked = true;
        radioContainer.style.border = '2px solid #ffa500';
        radioContainer.style.background = 'rgba(255, 165, 0, 0.2)';
        selectedShapeValue = option.value;
        console.log('🔹 Shape changed to:', option.value);
      });
      
      radioContainer.appendChild(radio);
      radioContainer.appendChild(label);
      shapeGrid.appendChild(radioContainer);
    });
    
    shapeSection.appendChild(shapeGrid);
    leftColumn.appendChild(shapeSection);
    
    console.log('🔷 Shape radio buttons created');

    console.log('➡️ Creating alignment section...');
    // Create alignment section with radio buttons
    const alignSection = document.createElement('div');
    alignSection.style.cssText = `
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      padding: 20px;
    `;
    alignSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: #22c55e; font-weight: bold;">➡️ Alignment</h4>
    `;
    
    const alignGrid = document.createElement('div');
    alignGrid.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    `;
    
    const alignValues = [
      { value: '', label: 'Default' },
      { value: 'img-left', label: 'Left' },
      { value: 'img-center', label: 'Center' },
      { value: 'img-right', label: 'Right' }
    ];
    
    let selectedAlignValue = currentAlign;
    
    alignValues.forEach((option, index) => {
      const radioContainer = document.createElement('div');
      radioContainer.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px;
        cursor: pointer;
        border-radius: 6px;
        border: 2px solid transparent;
        background: rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
      `;
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'imageAlign';
      radio.value = option.value;
      radio.checked = option.value === currentAlign;
      radio.style.cssText = `
        margin-right: 10px;
        transform: scale(1.3);
        cursor: pointer;
        accent-color: #22c55e;
      `;
      
      const label = document.createElement('label');
      label.textContent = option.label;
      label.style.cssText = `
        color: white;
        cursor: pointer;
        margin: 0;
        font-weight: 500;
      `;
      
      // Set initial selected state
      if (option.value === currentAlign) {
        radioContainer.style.border = '2px solid #22c55e';
        radioContainer.style.background = 'rgba(34, 197, 94, 0.2)';
      }
      
      // Add hover effect
      radioContainer.addEventListener('mouseover', () => {
        if (!radio.checked) {
          radioContainer.style.border = '2px solid rgba(34, 197, 94, 0.5)';
          radioContainer.style.background = 'rgba(34, 197, 94, 0.1)';
        }
      });
      radioContainer.addEventListener('mouseout', () => {
        if (!radio.checked) {
          radioContainer.style.border = '2px solid transparent';
          radioContainer.style.background = 'rgba(255, 255, 255, 0.05)';
        }
      });
      
      // Handle click on container
      radioContainer.addEventListener('click', () => {
        // Uncheck all other radio buttons and reset styles
        alignGrid.querySelectorAll('input[name="imageAlign"]').forEach((r, i) => {
          r.checked = false;
          r.parentElement.style.border = '2px solid transparent';
          r.parentElement.style.background = 'rgba(255, 255, 255, 0.05)';
        });
        radio.checked = true;
        radioContainer.style.border = '2px solid #22c55e';
        radioContainer.style.background = 'rgba(34, 197, 94, 0.2)';
        selectedAlignValue = option.value;
        console.log('➡️ Alignment changed to:', option.value);
      });
      
      radioContainer.appendChild(radio);
      radioContainer.appendChild(label);
      alignGrid.appendChild(radioContainer);
    });
    
    alignSection.appendChild(alignGrid);
    rightColumn.appendChild(alignSection);
    
    console.log('🔷 Alignment radio buttons created');

    console.log('📐 Creating layout section...');
    // Create layout section with radio buttons
    const layoutSection = document.createElement('div');
    layoutSection.style.cssText = `
      background: rgba(168, 85, 247, 0.1);
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 8px;
      padding: 20px;
    `;
    layoutSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: #a855f7; font-weight: bold;">📐 Text Layout</h4>
    `;
    
    const layoutGrid = document.createElement('div');
    layoutGrid.style.cssText = `
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    `;
    
    const layoutValues = [
      { value: '', label: 'Default (inline)', desc: 'Normal image placement' },
      { value: 'img-wrap-left', label: 'Wrap Left', desc: 'Text flows around right side' },
      { value: 'img-wrap-right', label: 'Wrap Right', desc: 'Text flows around left side' },
      { value: 'img-no-wrap', label: 'No Wrap', desc: 'Image in own row, text below' }
    ];
    
    let selectedLayoutValue = '';
    
    // Check for existing layout classes
    ['img-wrap-left', 'img-wrap-right', 'img-no-wrap'].forEach(cls => {
      if (currentClasses.includes(cls)) selectedLayoutValue = cls;
    });
    
    layoutValues.forEach((option, index) => {
      const radioContainer = document.createElement('div');
      radioContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        padding: 15px;
        cursor: pointer;
        border-radius: 6px;
        border: 2px solid transparent;
        background: rgba(255, 255, 255, 0.05);
        transition: all 0.3s ease;
      `;
      
      const topRow = document.createElement('div');
      topRow.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 5px;
      `;
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'imageLayout';
      radio.value = option.value;
      radio.checked = option.value === selectedLayoutValue;
      radio.style.cssText = `
        margin-right: 10px;
        transform: scale(1.3);
        cursor: pointer;
        accent-color: #a855f7;
      `;
      
      const label = document.createElement('label');
      label.textContent = option.label;
      label.style.cssText = `
        color: white;
        cursor: pointer;
        margin: 0;
        font-weight: 600;
        font-size: 14px;
      `;
      
      const desc = document.createElement('div');
      desc.textContent = option.desc;
      desc.style.cssText = `
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        margin-left: 25px;
      `;
      
      // Set initial selected state
      if (option.value === selectedLayoutValue) {
        radioContainer.style.border = '2px solid #a855f7';
        radioContainer.style.background = 'rgba(168, 85, 247, 0.2)';
      }
      
      // Add hover effect
      radioContainer.addEventListener('mouseover', () => {
        if (!radio.checked) {
          radioContainer.style.border = '2px solid rgba(168, 85, 247, 0.5)';
          radioContainer.style.background = 'rgba(168, 85, 247, 0.1)';
        }
      });
      radioContainer.addEventListener('mouseout', () => {
        if (!radio.checked) {
          radioContainer.style.border = '2px solid transparent';
          radioContainer.style.background = 'rgba(255, 255, 255, 0.05)';
        }
      });
      
      // Handle click on container
      radioContainer.addEventListener('click', () => {
        // Uncheck all other radio buttons and reset styles
        layoutGrid.querySelectorAll('input[name="imageLayout"]').forEach((r, i) => {
          r.checked = false;
          r.parentElement.parentElement.style.border = '2px solid transparent';
          r.parentElement.parentElement.style.background = 'rgba(255, 255, 255, 0.05)';
        });
        radio.checked = true;
        radioContainer.style.border = '2px solid #a855f7';
        radioContainer.style.background = 'rgba(168, 85, 247, 0.2)';
        selectedLayoutValue = option.value;
        console.log('📐 Layout changed to:', option.value);
      });
      
      topRow.appendChild(radio);
      topRow.appendChild(label);
      radioContainer.appendChild(topRow);
      radioContainer.appendChild(desc);
      layoutGrid.appendChild(radioContainer);
    });
    
    layoutSection.appendChild(layoutGrid);
    rightColumn.appendChild(layoutSection);
    
    console.log('🔷 Layout radio buttons created');

    console.log('☑️ Creating profile section...');
    // Create profile section with DOM
    const profileSection = document.createElement('div');
    profileSection.style.cssText = `
      background: rgba(236, 72, 153, 0.1);
      border: 1px solid rgba(236, 72, 153, 0.3);
      border-radius: 8px;
      padding: 20px;
      grid-column: 1 / -1;
      margin-top: 10px;
    `;
    
    const profileHeader = document.createElement('h4');
    profileHeader.textContent = '✨ Special Effects';
    profileHeader.style.cssText = `
      margin: 0 0 15px 0;
      color: #ec4899;
      font-weight: bold;
    `;
    
    const profileLabel = document.createElement('label');
    profileLabel.style.cssText = `
      display: flex;
      align-items: center;
      color: white;
      cursor: pointer;
      padding: 15px;
      border-radius: 6px;
      border: 2px solid transparent;
      background: rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
      font-weight: 500;
    `;
    
    const profileCheck = document.createElement('input');
    profileCheck.type = 'checkbox';
    profileCheck.id = 'profileImgCheck';
    profileCheck.checked = currentProfile;
    profileCheck.style.cssText = `
      margin-right: 12px;
      transform: scale(1.3);
      accent-color: #ec4899;
      cursor: pointer;
    `;
    
    const profileText = document.createElement('div');
    profileText.innerHTML = `
      <div style="font-size: 14px; font-weight: 600;">Apply Profile Image Styling</div>
      <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 3px;">Adds cyan border, hover effects, and animations</div>
    `;
    
    // Set initial selected state
    if (currentProfile) {
      profileLabel.style.border = '2px solid #ec4899';
      profileLabel.style.background = 'rgba(236, 72, 153, 0.2)';
    }
    
    // Add hover effect and click handling
    profileLabel.addEventListener('mouseover', () => {
      if (!profileCheck.checked) {
        profileLabel.style.border = '2px solid rgba(236, 72, 153, 0.5)';
        profileLabel.style.background = 'rgba(236, 72, 153, 0.1)';
      }
    });
    profileLabel.addEventListener('mouseout', () => {
      if (!profileCheck.checked) {
        profileLabel.style.border = '2px solid transparent';
        profileLabel.style.background = 'rgba(255, 255, 255, 0.05)';
      }
    });
    
    profileLabel.addEventListener('click', () => {
      profileCheck.checked = !profileCheck.checked;
      if (profileCheck.checked) {
        profileLabel.style.border = '2px solid #ec4899';
        profileLabel.style.background = 'rgba(236, 72, 153, 0.2)';
      } else {
        profileLabel.style.border = '2px solid transparent';
        profileLabel.style.background = 'rgba(255, 255, 255, 0.05)';
      }
    });
    
    profileLabel.appendChild(profileCheck);
    profileLabel.appendChild(profileText);
    profileSection.appendChild(profileHeader);
    profileSection.appendChild(profileLabel);

    console.log('🦶 Creating footer...');
    // Create footer with DOM
    const footer = document.createElement('div');
    footer.style.cssText = `
      display: flex;
      gap: 15px;
      justify-content: center;
      border-top: 2px solid #3bc0ff;
      padding-top: 25px;
      margin-top: 30px;
    `;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕ Cancel';
    cancelBtn.style.cssText = `
      padding: 12px 30px;
      background: linear-gradient(135deg, #6c757d, #5a6268);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
    `;
    
    const applyBtn = document.createElement('button');
    applyBtn.textContent = '✨ Apply Styles';
    applyBtn.style.cssText = `
      padding: 12px 30px;
      background: linear-gradient(135deg, #3bc0ff, #0ea5e9);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(59, 192, 255, 0.4);
    `;
    
    // Add hover effects
    cancelBtn.addEventListener('mouseover', () => {
      cancelBtn.style.transform = 'translateY(-2px)';
      cancelBtn.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
    });
    cancelBtn.addEventListener('mouseout', () => {
      cancelBtn.style.transform = 'translateY(0)';
      cancelBtn.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
    });
    
    applyBtn.addEventListener('mouseover', () => {
      applyBtn.style.transform = 'translateY(-2px)';
      applyBtn.style.boxShadow = '0 6px 20px rgba(59, 192, 255, 0.6)';
    });
    applyBtn.addEventListener('mouseout', () => {
      applyBtn.style.transform = 'translateY(0)';
      applyBtn.style.boxShadow = '0 4px 15px rgba(59, 192, 255, 0.4)';
    });
    
    footer.appendChild(cancelBtn);
    footer.appendChild(applyBtn);

    console.log('🔧 Assembling modal...');
    // Assemble the grid and modal
    gridContainer.appendChild(leftColumn);
    gridContainer.appendChild(rightColumn);
    gridContainer.appendChild(profileSection);
    
    modalContent.appendChild(header);
    modalContent.appendChild(gridContainer);
    modalContent.appendChild(footer);
    modal.appendChild(modalContent);
    
    console.log('➕ Adding modal to DOM...');
    // Add to DOM
    document.body.appendChild(modal);
    
    // Add hover effect to close button
    const closeButtonElement = header.querySelector('#closeModal');
    closeButtonElement.addEventListener('mouseover', () => {
      closeButtonElement.style.background = '#0ea5e9';
      closeButtonElement.style.transform = 'scale(1.1)';
    });
    closeButtonElement.addEventListener('mouseout', () => {
      closeButtonElement.style.background = '#3bc0ff';
      closeButtonElement.style.transform = 'scale(1)';
    });
    
    // Inject CSS to force dropdown options above everything
    const dropdownStyle = document.createElement('style');
    dropdownStyle.id = 'admin-dropdown-fix';
    dropdownStyle.textContent = `
      .image-style-modal select {
        position: relative !important;
        z-index: 2147483647 !important;
      }
      .image-style-modal select option {
        position: relative !important;
        z-index: 2147483647 !important;
        background: #2d3748 !important;
        color: white !important;
      }
      .image-style-modal select:focus {
        z-index: 2147483647 !important;
      }
      .image-style-modal {
        z-index: 2147483646 !important;
      }
    `;
    document.head.appendChild(dropdownStyle);
    
    console.log('✅ Modal added to DOM! Setting up event handlers...');

    // Event handlers
    const closeModal = () => {
      console.log('🚪 closeModal called');
      modal.remove();
      // Clean up injected CSS
      const dropdownStyle = document.getElementById('admin-dropdown-fix');
      if (dropdownStyle) {
        dropdownStyle.remove();
      }
    };

    const applyStyles = () => {
      console.log('🎨 applyStyles called');
      const size = selectedSizeValue;
      const shape = selectedShapeValue;
      const align = selectedAlignValue;
      const layout = selectedLayoutValue;
      const isProfile = profileCheck.checked;
      
      console.log('📊 Values to apply:', { size, shape, align, layout, isProfile });
      
      // Remove existing style classes
      const classesToRemove = ['img-small', 'img-medium', 'img-large', 'img-full', 
                              'img-circle', 'img-rounded', 'img-square',
                              'img-left', 'img-center', 'img-right', 'profile-img',
                              'img-wrap-left', 'img-wrap-right', 'img-no-wrap'];
      classesToRemove.forEach(cls => imgElement.classList.remove(cls));
      
      // Add new classes
      if (size) imgElement.classList.add(size);
      if (shape) imgElement.classList.add(shape);
      if (align) imgElement.classList.add(align);
      if (layout) imgElement.classList.add(layout);
      if (isProfile) imgElement.classList.add('profile-img');
      
      const appliedStyles = [size, shape, align, layout, isProfile ? 'profile-style' : ''].filter(Boolean);
      toast.success(`Image styles applied! ${appliedStyles.join(', ') || 'Default styles'}`);
      
      closeModal();
    };

    console.log('🔍 Setting up event handlers...');
    
    // Attach event listeners
    if (closeButtonElement) {
      closeButtonElement.addEventListener('click', closeModal);
      console.log('❌ Close button event listener attached');
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
      console.log('🚫 Cancel button event listener attached');
    }
    
    if (applyBtn) {
      applyBtn.addEventListener('click', applyStyles);
      console.log('✅ Apply button event listener attached');
    }
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        console.log('🖱️ Outside click detected, closing modal');
        closeModal();
      }
    });

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        console.log('⌨️ Escape key pressed, closing modal');
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    console.log('🎉 All event handlers set up successfully!');
  }, []);

  // Stable image style handler
  const handleImageStyle = useCallback(function() {
    console.log('🎨 Image Style button clicked!');
    console.log('this.quill:', this.quill);
    
    const range = this.quill.getSelection();
    console.log('Selection range:', range);
    
    if (range) {
      const [blot] = this.quill.getLeaf(range.index);
      console.log('Selected blot:', blot);
      console.log('Blot domNode:', blot?.domNode);
      console.log('Tag name:', blot?.domNode?.tagName);
      
      if (blot && blot.domNode.tagName === 'IMG') {
        console.log('✅ Image found! Opening modal...');
        showImageStyleModal(blot.domNode);
      } else {
        console.log('❌ No image selected');
        alert('Please select an image first to apply styling');
      }
    } else {
      console.log('❌ No selection range');
      alert('Please select an image first to apply styling');
    }
  }, [showImageStyleModal]);

  // Memoized quill modules to prevent recreation on every render
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean'],
        ['imageStyle'] // Custom image styling button
      ],
      handlers: {
        imageStyle: handleImageStyle
      }
    },
    clipboard: {
      // Preserve HTML and attributes during paste operations
      matchVisual: false,
      keepOriginalFormat: true
    }
  }), [handleImageStyle]);

  // Custom formats to preserve image CSS classes
  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'script', 'indent', 'direction',
    'color', 'background', 'align', 'link', 'image', 'video',
    'img-small', 'img-medium', 'img-large', 'img-full',
    'img-circle', 'img-rounded', 'img-square', 
    'img-left', 'img-center', 'img-right', 'profile-img',
    'img-wrap-left', 'img-wrap-right', 'img-no-wrap',
    'class' // Add class format to preserve CSS classes
  ];

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
                <p className="text-white mt-3">Loading pages...</p>
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="text-white">Manage Pages</h1>
                <p className="text-white-50">Create and manage custom pages with routes</p>
              </div>
              <Button onClick={handleCreateNew} className="btn-hero btn-hero-primary">
                Create New Page
              </Button>
            </div>

            <Card className="bg-dark-custom border-0 mb-4">
              <Card.Body>
                <h5 className="text-white mb-3">Page Management</h5>
                <p className="text-white-50 mb-0">
                  Create custom pages that will be automatically accessible via their slug URL. 
                  For example, a page with slug "services" will be available at "/services".
                </p>
              </Card.Body>
            </Card>

            <div className="data-table">
              <Table dark responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-white-50 py-4">
                        No custom pages found. Create your first page to get started.
                      </td>
                    </tr>
                  ) : (
                    pages.map((page) => (
                      <tr key={page._id}>
                        <td className="text-white">{page.title}</td>
                        <td className="text-cyan">/{page.slug}</td>
                        <td>
                          <span className={`badge ${page.isPublished ? 'bg-success' : 'bg-warning'}`}>
                            {page.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="text-white-50">
                          {moment(page.createdAt).format('MMM DD, YYYY')}
                        </td>
                        <td className="text-white-50">
                          {moment(page.updatedAt).format('MMM DD, YYYY')}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => window.open(`/${page.slug}`, '_blank')}
                              disabled={!page.isPublished}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleEdit(page)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant={page.isPublished ? 'outline-secondary' : 'outline-success'}
                              size="sm"
                              onClick={() => togglePublishStatus(page._id, page.isPublished)}
                            >
                              {page.isPublished ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(page._id)}
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

      {/* Create/Edit Page Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-dark border-secondary">
          <Modal.Title className="text-white">
            {editingPage ? 'Edit Page' : 'Create New Page'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Page Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter page title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>URL Slug *</Form.Label>
                  <Form.Control
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="page-url-slug"
                    required
                  />
                  <Form.Text className="text-white-50">
                    Will be accessible at: /{formData.slug}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Meta Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder="SEO description for this page"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Page Content *</Form.Label>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={quillModules}
                formats={quillFormats}
                preserveWhitespace={true}
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                label="Publish immediately"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                {editingPage ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingPage ? 'Update Page' : 'Create Page'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPages; 