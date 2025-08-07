import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Companies - Find Board Members | Board Champions',
  description: 'Access the UK\'s premier network of board-ready executives. Search, filter, and connect with verified NEDs and board members in minutes. No subscriptions required.',
  keywords: 'board recruitment, NED recruitment, non-executive director search, board member search, executive recruitment UK',
  openGraph: {
    title: 'Find Your Next Board Member - Board Champions',
    description: 'Access 500+ verified board-ready executives. Smart filtering, instant access, pay-per-profile.',
    type: 'website',
    url: 'https://boardchampions.com/companies',
    images: [
      {
        url: '/board-champions-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Board Champions - Executive Search Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Next Board Member - Board Champions',
    description: 'Access 500+ verified board-ready executives. Smart filtering, instant access.',
    images: ['/board-champions-og.jpg'],
  },
  alternates: {
    canonical: 'https://boardchampions.com/companies',
  },
};