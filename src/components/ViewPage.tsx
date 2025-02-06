// src/components/ViewPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export const ViewPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await axios.get(`/pages/${slug}`);
        setPage(response.data);
      } catch (error) {
        console.error(error);
        alert('Page not found');
      }
    };

    fetchPage();
  }, [slug]);

  if (!page) return <p>Loading...</p>;

  return (
    <div>
      <h2>{page.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
};
