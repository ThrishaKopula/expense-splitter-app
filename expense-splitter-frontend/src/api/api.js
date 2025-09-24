import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// User login/signup
export const signupUser = (data) => axios.post(`${API_BASE_URL}/signup`, data).then(res => res.data);
export const loginUser = (data) => axios.post(`${API_BASE_URL}/login`, data).then(res => res.data);

// Expenses
export const getExpenses = async (userId) =>
  (await axios.get(`${API_BASE_URL}/expenses/${userId}`)).data;

export const createExpense = async (userId, expense) =>
  (await axios.post(`${API_BASE_URL}/expenses/${userId}`, expense)).data;

export const deleteExpense = async (id) =>
  await axios.delete(`${API_BASE_URL}/expenses/${id}`);
