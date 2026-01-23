'use client';

import { useState, useEffect } from 'react';
import { reviewsAPI } from '@/lib/api-client';

interface Review {
  _id: string;
  productId: {
    _id: string;
    title: string;
    imageUrl: string;
  };
  userId?: {
    _id: string;
    fullName: string;
    email: string;
  };
  rating: number;
  comment: string;
  customerName: string;
  images?: string[];
  isApproved: boolean;
  isActive: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Default to pending so admins first see items awaiting moderation
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date>(new Date());

  const fetchReviews = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      // Always fetch full list and filter client-side to avoid backend filter quirks
      const response: any = await reviewsAPI.getAll({ limit: 200 });
      
      const data = response.data || response;
      setReviews(Array.isArray(data) ? data : []);
      setLastFetch(new Date());
    } catch (err: any) {
      console.error('Failed to fetch reviews:', err);
      
      // Check if it's a 404 error
      if (err.message && err.message.includes('Route not found')) {
        setError('The review management API is not yet deployed. Please wait for the Render deployment to complete (usually 3-5 minutes) and refresh this page.');
      } else {
        setError(err.message || 'Failed to load reviews');
      }
      
      setReviews([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    
    // Auto-refresh every 30 seconds to catch new pending reviews
    const pollInterval = setInterval(() => {
      fetchReviews(false); // Silent refresh without loading spinner
    }, 30000);
    
    return () => clearInterval(pollInterval);
  }, []);

  const handleApprove = async (reviewId: string) => {
    try {
      setProcessingId(reviewId);
      await reviewsAPI.approve(reviewId);
      
      // Update local state
      setReviews(reviews.map(review => 
        review._id === reviewId 
          ? { ...review, isApproved: true } 
          : review
      ));
      
      alert('Review approved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to approve review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm('Are you sure you want to reject this review?')) return;
    
    try {
      setProcessingId(reviewId);
      await reviewsAPI.reject(reviewId);
      
      // Remove from list or update state
      setReviews(reviews.filter(review => review._id !== reviewId));
      
      alert('Review rejected successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to reject review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review permanently?')) return;
    
    try {
      setProcessingId(reviewId);
      await reviewsAPI.delete(reviewId);
      
      // Remove from list
      setReviews(reviews.filter(review => review._id !== reviewId));
      
      alert('Review deleted successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    } finally {
      setProcessingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  // Client-side filters and counts so tabs always reflect latest state
  const filteredReviews = reviews.filter((review) => {
    if (statusFilter === 'pending') return !review.isApproved;
    if (statusFilter === 'approved') return review.isApproved;
    return true;
  });

  const pendingCount = reviews.filter((review) => !review.isApproved).length;
  const approvedCount = reviews.filter((review) => review.isApproved).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reviews Management</h1>
            <p className="text-gray-600 mt-2">Manage and moderate product reviews</p>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastFetch.toLocaleTimeString()} • Auto-refreshes every 30s
            </p>
          </div>
          <button
            onClick={() => fetchReviews()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-4"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reviews Management</h1>
        <p className="text-gray-600 mt-2">Manage and moderate product reviews</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          All Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === 'pending'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Pending Approval ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === 'approved'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Approved ({approvedCount})
        </button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter === 'pending'
              ? 'No pending reviews at the moment'
              : statusFilter === 'approved'
              ? 'No approved reviews yet'
              : 'No reviews found'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={review.productId?.imageUrl || '/placeholder.png'}
                          alt={review.productId?.title || 'Product'}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {review.productId?.title || 'Unknown Product'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{review.customerName}</div>
                      {review.userId && (
                        <div className="text-xs text-gray-500">{review.userId.email}</div>
                      )}
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Verified Purchase
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                      <div className="text-sm text-gray-500 mt-1">{review.rating}/5</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        {review.comment}
                      </div>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {review.images.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Review ${idx + 1}`}
                              className="h-16 w-16 rounded object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          review.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review._id)}
                            disabled={processingId === review._id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Approve"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        )}
                        {!review.isApproved && (
                          <button
                            onClick={() => handleReject(review._id)}
                            disabled={processingId === review._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Reject"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id)}
                          disabled={processingId === review._id}
                          className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          title="Delete"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
