// src/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// ---- USERS ----
export const getUsers = async () => (await axios.get(`${API_BASE_URL}/users`)).data;
export const createUser = async (user) =>
  (await axios.post(`${API_BASE_URL}/users`, user)).data;
export const deleteUser = async (id) =>
  (await axios.delete(`${API_BASE_URL}/users/${id}`)).data;

// ---- GROUPS ----
export const getGroups = async () => (await axios.get(`${API_BASE_URL}/groups`)).data;
export const createGroup = async (group) =>
  (await axios.post(`${API_BASE_URL}/groups`, group)).data;
export const deleteGroup = async (id) =>
  (await axios.delete(`${API_BASE_URL}/groups/${id}`)).data;

// ---- EXPENSES ----
export const getExpenses = async (groupId) =>
  (await axios.get(`${API_BASE_URL}/groups/${groupId}/expenses`)).data;
export const createExpense = async (groupId, expense) =>
  (await axios.post(`${API_BASE_URL}/groups/${groupId}/expenses`, expense)).data;
export const deleteExpense = async (groupId, expenseId) =>
  (await axios.delete(`${API_BASE_URL}/groups/${groupId}/expenses/${expenseId}`)).data;
