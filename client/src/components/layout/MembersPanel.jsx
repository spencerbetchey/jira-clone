import { useState, useEffect } from 'react'
import { fetchProjectMembers, addProjectMember, removeProjectMember } from '../../api/projects'
import { useAuth } from '../../context/AuthContext'

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-600',
  developer: 'bg-blue-100 text-blue-600',
  viewer: 'bg-gray-100 text-gray-600',
}

function MembersPanel({ projectId, ownerId }) {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('developer')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMembers()
  }, [projectId])

  const loadMembers = async () => {
    try {
      const data = await fetchProjectMembers(projectId)
      setMembers(data)
    } catch (err) {
      console.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!email.trim()) return
    setAdding(true)
    setError('')
    try {
      const res = await addProjectMember(projectId, email, role)
      setMembers([...members, res.member])
      setEmail('')
      setRole('developer')
      setShowModal(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return
    try {
      await removeProjectMember(projectId, userId)
      setMembers(members.filter(m => m.id !== userId))
    } catch (err) {
      console.error('Failed to remove member')
    }
  }

  if (loading) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Members <span className="text-gray-400 font-normal text-sm">({members.length})</span>
        </h2>
        {user?.id === ownerId && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Member
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {members.map(member => (
          <div key={member.id} className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{member.name}</p>
                <p className="text-xs text-gray-400">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role]}`}>
                {member.role}
              </span>
              {user?.id === ownerId && member.id !== ownerId && (
                <button
                  onClick={() => handleRemove(member.id)}
                  className="text-gray-400 hover:text-red-500 text-sm transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Member</h2>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="teammate@example.com"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => { setShowModal(false); setError('') }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {adding ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MembersPanel