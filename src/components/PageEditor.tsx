import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

function PageEditor() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [preview, setPreview] = useState('');

    const handleSave = async () => {
        const response = await fetch('/pages', {
            method: 'POST',
            body: JSON.stringify({ title, slug, content }),
        });
        const data = await response.json();
        if (response.ok) {
            alert('Page saved successfully');
        } else {
            alert('Error saving page');
        }
    };

    return (
        <div>
            <h1>Create a New Page</h1>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                type="text"
                placeholder="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
            />
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter markdown here..."
            />
            <button onClick={handleSave}>Save Page</button>

            <h2>Preview</h2>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}

export default PageEditor;
