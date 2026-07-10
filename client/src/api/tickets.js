import axios from 'axios'

const API_URL = 'http://localhost:5000/api/projects'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const fetchTickets = async (projectId) => {
  const res = await axios.get(`${API_URL}/${projectId}/tickets`, {
    headers: getAuthHeader()
  })
  return res.data.tickets
}

export const fetchTicket = async (projectId, ticketId) => {
  const res = await axios.get(`${API_URL}/${projectId}/tickets/${ticketId}`, {
    headers: getAuthHeader()
  })
  return res.data.ticket
}

export const createTicket = async (projectId, ticketData) => {
  const res = await axios.post(`${API_URL}/${projectId}/tickets`, ticketData, {
    headers: getAuthHeader()
  })
  return res.data.ticket
}

export const updateTicket = async (projectId, ticketId, ticketData) => {
  const res = await axios.put(`${API_URL}/${projectId}/tickets/${ticketId}`, ticketData, {
    headers: getAuthHeader()
  })
  return res.data
}

export const deleteTicket = async (projectId, ticketId) => {
  const res = await axios.delete(`${API_URL}/${projectId}/tickets/${ticketId}`, {
    headers: getAuthHeader()
  })
  return res.data
}

export const fetchAllTickets = async () => {
  const res = await axios.get('http://localhost:5000/api/tickets', {
    headers: getAuthHeader()
  })
  return res.data.tickets
}