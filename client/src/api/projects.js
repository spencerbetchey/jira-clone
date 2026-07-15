import axios from 'axios'

const API_URL = 'http://localhost:5000/api/projects'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const fetchProjects = async () => {
  const res = await axios.get(API_URL, { headers: getAuthHeader() })
  return res.data.projects
}

export const fetchProject = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() })
  return res.data.project
}

export const createProject = async (projectData) => {
  const res = await axios.post(API_URL, projectData, { headers: getAuthHeader() })
  return res.data.project
}

export const updateProject = async (id, projectData) => {
  const res = await axios.put(`${API_URL}/${id}`, projectData, { headers: getAuthHeader() })
  return res.data
}

export const deleteProject = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() })
  return res.data
}

export const fetchProjectMembers = async (projectId) => {
  const res = await axios.get(`${API_URL}/${projectId}/members`, {
    headers: getAuthHeader()
  })
  return res.data.members
}

export const addProjectMember = async (projectId, email, role) => {
  const res = await axios.post(`${API_URL}/${projectId}/members`, { email, role }, {
    headers: getAuthHeader()
  })
  return res.data
}

export const removeProjectMember = async (projectId, userId) => {
  const res = await axios.delete(`${API_URL}/${projectId}/members/${userId}`, {
    headers: getAuthHeader()
  })
  return res.data
}

export const fetchMyProjectRole = async (projectId) => {
  const res = await axios.get(`${API_URL}/${projectId}/members`, {
    headers: getAuthHeader()
  })
  const token = localStorage.getItem('token')
  const payload = JSON.parse(atob(token.split('.')[1]))
  const myId = payload.id
  const me = res.data.members.find(m => m.id === myId)
  return me ? me.role : 'admin'
}