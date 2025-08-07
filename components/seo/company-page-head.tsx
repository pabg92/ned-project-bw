'use client';

import Head from 'next/head';

export default function CompanyPageHead() {
  return (
    <Head>
      <title>For Companies - Find Board Members | Board Champions</title>
      <meta name="description" content="Access the UK's premier network of board-ready executives. Search, filter, and connect with verified NEDs and board members in minutes. No subscriptions required." />
      <meta name="keywords" content="board recruitment, NED recruitment, non-executive director search, board member search, executive recruitment UK" />
      
      {/* Open Graph */}
      <meta property="og:title" content="Find Your Next Board Member - Board Champions" />
      <meta property="og:description" content="Access 500+ verified board-ready executives. Smart filtering, instant access, pay-per-profile." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://boardchampions.com/companies" />
      <meta property="og:image" content="https://boardchampions.com/board-champions-og.jpg" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Find Your Next Board Member - Board Champions" />
      <meta name="twitter:description" content="Access 500+ verified board-ready executives. Smart filtering, instant access." />
      <meta name="twitter:image" content="https://boardchampions.com/board-champions-og.jpg" />
      
      {/* Canonical */}
      <link rel="canonical" href="https://boardchampions.com/companies" />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Board Champions" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
  );
}