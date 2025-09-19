// src/api/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const getGroups = () => {
  return axios.get(`${API_BASE_URL}/groups`);
};

export const getGroupBalances = (groupId) => {
  return axios.get(`${API_BASE_URL}/groups/${groupId}/balances`);
};

export const getGroupSettle = (groupId) => {
  return axios.get(`${API_BASE_URL}/groups/${groupId}/settle`);
};

export const getGroupExpenses = (groupId) => {
  return axios.get(`${API_BASE_URL}/groups/${groupId}/expenses`);
};

