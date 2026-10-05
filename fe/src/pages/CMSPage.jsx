import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetPublicPageQuery } from '../features/dashboard/cmsApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CMSPage() {
  const { slug } = useParams();
  const { data: page, isLoading, isError } = useGetPublicPageQuery(slug);
  if (isLoading) return <LoadingSpinner />;
  if (isError || !page) return <main className="mx-auto max-w-3xl px-gutter py-xl"><h1 className="font-headline-md text-primary">Page unavailable</h1><p className="mt-3 text-on-surface-variant">This page is missing or has not been published.</p><Link to="/" className="mt-6 inline-block underline">Return to ShopNest</Link></main>;
  return <main className="mx-auto min-h-[55vh] max-w-3xl px-gutter py-xl"><p className="mb-3 text-xs uppercase tracking-widest text-on-surface-variant">ShopNest</p><h1 className="font-headline-md text-primary">{page.title}</h1><article className="mt-lg whitespace-pre-wrap leading-8 text-on-surface-variant">{page.content}</article></main>;
}
