import React, { useState } from 'react';
import { useDeleteAdminReviewMutation, useGetAdminReviewsQuery, useModerateReviewMutation } from '../../features/products/reviewApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReviewManager() {
  const [status, setStatus] = useState('pending');
  const { data: reviews = [], isLoading } = useGetAdminReviewsQuery(status);
  const [moderate] = useModerateReviewMutation();
  const [remove] = useDeleteAdminReviewMutation();

  if (isLoading) return <LoadingSpinner />;
  return <section className="space-y-md">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="font-headline-sm text-primary">Review moderation</h1><p className="text-sm text-on-surface-variant">Approve purchase verified customer reviews before they appear on product pages.</p></div>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border-outline-variant">
        <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="">All statuses</option>
      </select>
    </header>
    {reviews.length === 0 ? <p className="rounded-xl border bg-white p-lg text-on-surface-variant">No reviews in this view.</p> : <div className="space-y-3">
      {reviews.map((review) => <article key={review._id} className="flex flex-col gap-4 rounded-xl border bg-white p-md md:flex-row">
        {review.product?.image && <img src={review.product.image} alt="" className="h-20 w-20 rounded-lg object-cover" />}
        <div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold text-primary">{review.product?.title || 'Removed product'}</h2><span className="rounded-full bg-surface-container-high px-3 py-1 text-xs capitalize">{review.status}</span></div>
          <p className="mt-1 text-sm">{review.rating}/5 · {review.user?.name || review.userName} · {new Date(review.createdAt).toLocaleDateString()}</p><p className="mt-3 whitespace-pre-wrap text-sm text-on-surface-variant">{review.comment}</p>
          <div className="mt-4 flex gap-3">{review.status !== 'approved' && <button onClick={() => moderate({ id: review._id, status: 'approved' })} className="rounded-lg bg-primary px-4 py-2 text-sm text-white">Approve</button>}{review.status !== 'rejected' && <button onClick={() => moderate({ id: review._id, status: 'rejected' })} className="rounded-lg border px-4 py-2 text-sm">Reject</button>}<button onClick={() => { if (window.confirm('Delete this review?')) remove(review._id); }} className="rounded-lg px-4 py-2 text-sm text-error">Delete</button></div>
        </div>
      </article>)}
    </div>}
  </section>;
}
