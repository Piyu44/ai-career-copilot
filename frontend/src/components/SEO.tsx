import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  name?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  type = 'website',
  name = 'JOB ASAP'
}) => {
  const fullTitle = title ? `${title} | ${name}` : `${name} — AI Resume Builder & Career Copilot`;
  const defaultDescription = "Upload your resume, paste a job description, and let JOB ASAP analyze your job match, improve your resume, write cover letters, and run mock interviews. Get hired faster.";
  const finalDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={finalDescription} />
      
      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
    </Helmet>
  );
};
