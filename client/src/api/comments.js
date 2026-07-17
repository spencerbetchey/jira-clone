import axios from 'axios'

const API_URL = 'http://localhost:5000/api/tickets'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const fetchComments = async (ticketId) => {
  const res = await axios.get(`${API_URL}/${ticketId}/comments`, {
    headers: getAuthHeader()
  })
  return res.data.comments
}

export const createComment = async (ticketId, body) => {
  const res = await axios.post(`${API_URL}/${ticketId}/comments`, { body }, {
    headers: getAuthHeader()
  })
  return res.data.comment
}

export const deleteComment = async (ticketId, commentId) => {
  const res = await axios.delete(`${API_URL}/${ticketId}/comments/${commentId}`, {
    headers: getAuthHeader()
  })
  return res.data
}