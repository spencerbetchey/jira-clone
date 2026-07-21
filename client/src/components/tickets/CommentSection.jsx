import { useState, useEffect } from 'react'
import { fetchComments, createComment, deleteComment } from '../../api/comments'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../common/Avatar'

function CommentSection({ ticketId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadComments()
  }, [ticketId])

  const loadComments = async () => {
    try {
      const data = await fetchComments(ticketId)
      setComments(data)
    } catch (err) {
      console.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!body.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const newComment = await createComment(ticketId, body)
      setComments([...comments, newComment])
      setBody('')
    } catch (err) {
      setError('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await deleteComment(ticketId, commentId)
      setComments(comments.filter(c => c.id !== commentId))
    } catch (err) {
      console.error('Failed to delete comment')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  if (loading) return <div className="text-gray-400 text-sm">Loading comments...</div>

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Comments <span className="text-gray-400 font-normal text-sm">({comments.length})</span>
      </h2>

      {/* Comment List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No comments yet — be the first to comment!
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Avatar name={comment.user_name} />

              {/* Comment Body */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{comment.user_name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {user?.name === comment.user_name && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700">
                  {comment.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Comment Input */}
      <div className="flex gap-3">
        <Avatar name={user?.name} />
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (Ctrl+Enter to submit)"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !body.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentSection