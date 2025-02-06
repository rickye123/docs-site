import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface PageViewerProps {
    slug: string;
}

interface Page {
    title: string;
    content: string;
}

function PageViewer({ slug }: PageViewerProps) {
    const [page, setPage] = useState<Page | null>(null);

    useEffect(() => {
        const fetchPage = async () => {
            const response = await fetch(`/pages/${slug}`);
            const data = await response.json();
            if (response.ok) {
                setPage(data);
            } else {
                alert('Page not found');
            }
        };

        fetchPage();
    }, [slug]);

    if (!page) return <div>Loading...</div>;

    return (
        <div>
            <h1>{page.title}</h1>
            <ReactMarkdown>{page.content}</ReactMarkdown>
        </div>
    );
}

export default PageViewer;
