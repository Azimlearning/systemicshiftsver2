// src/app/articles/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { FaCalendar, FaHeart, FaComment, FaArrowLeft } from 'react-icons/fa';
import { trackArticleView, toggleArticleLike, checkArticleLike, getArticleEngagement, getArticleComments } from '../../../lib/analytics';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id;
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const categoryColors = {
    'systemic-shifts': 'bg-teal-500',
    'jukris-lens': 'bg-cyan-500',
    'upstreambuzz': 'bg-blue-500',
    'petronas-2.0': 'bg-indigo-500',
    'trending': 'bg-pink-500'
  };

  useEffect(() => {
    async function loadArticle() {
      try {
        // For now, use mock data - replace with Firestore fetch later
        // This matches the mockArticles structure from articles/page.js
        const mockArticles = [
          {
            id: 1,
            title: 'Accelerating Portfolio High-Grading: A Strategic Overview',
            excerpt: 'Discover how we are actively reshaping our portfolio to focus on assets that create the most value through disciplined divestment strategies.',
            category: 'systemic-shifts',
            categoryLabel: 'Systemic Shifts',
            date: '2025-01-20',
            image: '/images/highlight-placeholder.jpg',
            content: `# Accelerating Portfolio High-Grading: A Strategic Overview

Portfolio high-grading is a critical strategic initiative that enables us to focus our resources on assets that deliver the most value. This article explores our approach to disciplined divestment and portfolio optimization.

## Strategic Focus

Our portfolio high-grading strategy centers on:

- **Value Creation**: Identifying and retaining assets that generate superior returns
- **Disciplined Divestment**: Systematically exiting non-core or underperforming assets
- **Resource Optimization**: Redirecting capital to high-potential opportunities

## Implementation Approach

We've developed a rigorous framework for evaluating and executing portfolio decisions, ensuring alignment with our long-term strategic objectives.

## Results and Impact

Through this focused approach, we've been able to:
- Improve overall portfolio returns
- Reduce operational complexity
- Enhance capital allocation efficiency

*This is a sample article. Replace with actual content from Firestore.*`
          },
          // Add more mock articles as needed
        ];

        const foundArticle = mockArticles.find(a => String(a.id) === String(articleId));
        
        if (!foundArticle) {
          // Try to fetch from Firestore if not in mock data
          // TODO: Implement Firestore fetch
          setLoading(false);
          return;
        }

        setArticle(foundArticle);
        
        // Track view
        await trackArticleView(foundArticle.id, foundArticle.title, foundArticle.category);
        
        // Load engagement data
        const engagement = await getArticleEngagement(foundArticle.id);
        setLikesCount(engagement.likes || 0);
        setCommentsCount(engagement.comments || 0);
        setViewsCount(engagement.views || 0);
        
        // Check if user has liked
        const liked = await checkArticleLike(foundArticle.id);
        setIsLiked(liked);
        
        // Load comments
        const articleComments = await getArticleComments(foundArticle.id);
        setComments(articleComments || []);
        
      } catch (error) {
        console.error('Error loading article:', error);
      } finally {
        setLoading(false);
      }
    }

    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const handleLike = async () => {
    try {
      const result = await toggleArticleLike(article.id);
      setIsLiked(result.liked);
      setLikesCount(result.totalLikes);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const { addArticleComment } = await import('../../../lib/analytics');
      await addArticleComment(article.id, commentText);
      setCommentText('');
      
      // Reload comments
      const articleComments = await getArticleComments(article.id);
      setComments(articleComments || []);
      setCommentsCount(comments.length + 1);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-gray-600">Loading article...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/articles" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold">
              <FaArrowLeft /> Back to Articles
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/articles" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold mb-6">
          <FaArrowLeft /> Back to Articles
        </Link>

        {/* Article Header */}
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image */}
          <div className="relative h-96 w-full">
            <Image
              src={article.image || '/images/highlight-placeholder.jpg'}
              alt={article.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${categoryColors[article.category] || 'bg-gray-500'}`}>
                {article.categoryLabel || article.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Title and Meta */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <FaCalendar className="text-sm" />
                  <span>
                    {new Date(article.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaHeart className="text-sm" />
                  <span>{viewsCount} views</span>
                </div>
              </div>
            </div>

            {/* Engagement Buttons */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isLiked
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaHeart className={isLiked ? 'text-white' : 'text-gray-700'} />
                {likesCount} Like{likesCount !== 1 ? 's' : ''}
              </button>
              <div className="flex items-center gap-2 text-gray-600">
                <FaComment />
                <span>{commentsCount} Comment{commentsCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-8">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />
              ) : (
                <p className="text-gray-700 leading-relaxed">{article.excerpt}</p>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>
              
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-3 text-gray-900"
                  rows={4}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submittingComment ? 'Submitting...' : 'Post Comment'}
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {comment.userName || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {comment.timestamp?.toDate ? 
                            new Date(comment.timestamp.toDate()).toLocaleString() :
                            'Recently'
                          }
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.commentText}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

