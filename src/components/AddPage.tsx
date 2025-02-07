// src/components/AddPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AddPage = () => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/pages', { title, slug, content });
      console.log('Response:', response.data);
      alert('Page created successfully!');
      navigate(`/view-page/${slug}`); // Redirect to the newly created page
    } catch (error) {
      console.error(error);
      alert('Error creating page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add a New Page</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="slug">Slug</label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content (Markdown)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Create Page'}
        </button>
      </form>
    </div>
  );
};
