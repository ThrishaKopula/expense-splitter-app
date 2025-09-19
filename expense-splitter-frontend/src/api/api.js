import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// -------- USERS --------
export const getUsers = () => axios.get(`${API_BASE_URL}/users`);
export const createUser = (user) => axios.post(`${API_BASE_URL}/users`, user);
export const deleteUser = (id) => axios.delete(`${API_BASE_URL}/users/${id}`);

// -------- GROUPS --------
export const getGroups = () => axios.get(`${API_BASE_URL}/groups`);
export const createGroup = (group) => axios.post(`${API_BASE_URL}/groups`, group);
export const deleteGroup = (id) => axios.delete(`${API_BASE_URL}/groups/${id}`);

// -------- EXPENSES --------
export const getExpenses = (groupId) =>
  axios.get(`${API_BASE_URL}/groups/${groupId}/expenses`);
export const createExpense = (groupId, expense) =>
  axios.post(`${API_BASE_URL}/groups/${groupId}/expenses`, expense);
export const deleteExpense = (id) => axios.delete(`${API_BASE_URL}/expenses/${id}`);
