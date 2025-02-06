// src/components/AddPage.tsx
import React, { useState } from 'react';
import axios from 'axios';

export const AddPage = () => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/pages', { title, slug, content });
      alert('Page created successfully');
    } catch (error) {
      console.error(error);
      alert('Error creating page');
    }
  };

  return (
    <div>
      <h2>Add a New Page</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Slug:
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
        <label>
          Content (Markdown):
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        <button type="submit">Save Page</button>
      </form>
    </div>
  );
};
