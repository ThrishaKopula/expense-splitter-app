import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const signupUser = (data) => axios.post(`${API_BASE_URL}/signup`, data).then(res => res.data);
export const loginUser = (data) => axios.post(`${API_BASE_URL}/login`, data).then(res => res.data);
// Users
export const getUsers = async () => (await axios.get(`${API_BASE_URL}/users`)).data;
export const createUser = async (user) => (await axios.post(`${API_BASE_URL}/users`, user)).data;
export const deleteUser = async (id) => await axios.delete(`${API_BASE_URL}/users/${id}`);

// Groups
export const getGroups = async () => (await axios.get(`${API_BASE_URL}/groups`)).data;
export const createGroup = async (group) => (await axios.post(`${API_BASE_URL}/groups`, group)).data;
export const deleteGroup = async (id) => await axios.delete(`${API_BASE_URL}/groups/${id}`);

// Expenses
export const getExpenses = async (groupId) =>
  (await axios.get(`${API_BASE_URL}/groups/${groupId}/expenses`)).data;
export const createExpense = async (expense) => (await axios.post(`${API_BASE_URL}/expenses`, expense)).data;
export const deleteExpense = async (id) => await axios.delete(`${API_BASE_URL}/expenses/${id}`);
