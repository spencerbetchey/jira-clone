import axios from 'axios'

const API_URL = `${import.meta.env.VITE_API_URL}/notifications`

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const fetchNotifications = async () => {
  const res = await axios.get(API_URL, { headers: getAuthHeader() })
  return res.data.notifications
}

export const markNotificationRead = async (id) => {
  const res = await axios.put(`${API_URL}/${id}/read`, {}, { headers: getAuthHeader() })
  return res.data
}

export const markAllNotificationsRead = async () => {
  const res = await axios.put(`${API_URL}/read-all`, {}, { headers: getAuthHeader() })
  return res.data
}