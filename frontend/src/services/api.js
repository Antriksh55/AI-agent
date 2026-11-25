/**
 * API Service – all backend calls go through here.
 * Base URL is proxied via vite.config.js in development.
 * In production, set VITE_API_URL in the frontend .env.
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Chat ────────────────────────────────────────────────────��─────────────────
export const sendMessage = (conversationId, message, language = "en") =>
  client.post("/chat", { conversationId, message, language }).then((r) => r.data);

export const endConversation = (conversationId) =>
  client.post(`/conversations/${conversationId}/end`).then((r) => r.data);

// ── Leads ─────────────────────────────────────────────────────────────────────
export const getLeads = (params = {}) =>
  client.get("/leads", { params }).then((r) => r.data);

export const getLead = (id) =>
  client.get(`/leads/${id}`).then((r) => r.data);

export const updateLead = (id, data) =>
  client.patch(`/leads/${id}`, data).then((r) => r.data);

export const deleteLead = (id) =>
  client.delete(`/leads/${id}`).then((r) => r.data);

// ── Conversations ─────────────────────────────────────────────────────────────
export const getConversations = () =>
  client.get("/conversations").then((r) => r.data);

export const getConversation = (id) =>
  client.get(`/conversations/${id}`).then((r) => r.data);

// ── Appointments ──────────────────────────────────────────────────────────────
export const getAppointments = (params = {}) =>
  client.get("/appointments", { params }).then((r) => r.data);

export const createAppointment = (data) =>
  client.post("/appointments", data).then((r) => r.data);

export const updateAppointment = (id, data) =>
  client.patch(`/appointments/${id}`, data).then((r) => r.data);

// ── Knowledge ─────────────────────────────────────────────────────────────────
export const getKnowledge = () =>
  client.get("/knowledge").then((r) => r.data);

export const createKnowledge = (data) =>
  client.post("/knowledge", data).then((r) => r.data);

export const deleteKnowledge = (id) =>
  client.delete(`/knowledge/${id}`).then((r) => r.data);

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getAnalytics = () =>
  client.get("/analytics").then((r) => r.data);

// ── Summaries ─────────────────────────────────────────────────────────────────
export const getSummary = (conversationId) =>
  client.get(`/summaries/${conversationId}`).then((r) => r.data);

// ── Escalations ───────────────────────────────────────────────────────────────
export const getEscalations = (params = {}) =>
  client.get("/escalations", { params }).then((r) => r.data);

export const updateEscalation = (id, data) =>
  client.patch(`/escalations/${id}`, data).then((r) => r.data);

// ── Health ────────────────────────────────────────────────────────────────────
export const getHealth = () =>
  client.get("/health").then((r) => r.data);
