import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000',
})

export const getAllTickets = () => API.get('/tickets/')
export const getTicketById = (id) => API.get(`/tickets/${id}`)
export const createTicket = (data) => API.post('/tickets/', data)
export const updateTicket = (id, data) => API.put(`/tickets/${id}`, data)
export const deleteTicket = (id) => API.delete(`/tickets/${id}`)
export const searchTickets = (params) => API.get('/tickets/search', { params })

export const checkEmail = (email) => API.post('/auth/check-email', { email })
export const registerUser = (data) => API.post('/auth/register', data)
export const loginUser = (data) => API.post('/auth/login', data)
