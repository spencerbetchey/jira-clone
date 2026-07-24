import axios from 'axios'

const API_URL = `${import.meta.env.VITE_API_URL}/projects`

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const fetchSprints = async (projectId) => {
  const res = await axios.get(`${API_URL}/${projectId}/sprints`, {
    headers: getAuthHeader()
  })
  return res.data.sprints
}

export const createSprint = async (projectId, sprintData) => {
  const res = await axios.post(`${API_URL}/${projectId}/sprints`, sprintData, {
    headers: getAuthHeader()
  })
  return res.data.sprint
}

export const updateSprint = async (projectId, sprintId, sprintData) => {
  const res = await axios.put(`${API_URL}/${projectId}/sprints/${sprintId}`, sprintData, {
    headers: getAuthHeader()
  })
  return res.data
}

export const deleteSprint = async (projectId, sprintId) => {
  const res = await axios.delete(`${API_URL}/${projectId}/sprints/${sprintId}`, {
    headers: getAuthHeader()
  })
  return res.data
}

export const assignTicketToSprint = async (projectId, sprintId, ticketId) => {
  const res = await axios.post(`${API_URL}/${projectId}/sprints/${sprintId}/assign`, 
    { ticketId },
    { headers: getAuthHeader() }
  )
  return res.data
}