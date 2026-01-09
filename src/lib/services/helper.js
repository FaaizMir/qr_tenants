import axiosInstance from "../axios";

// Centralized API helpers for backend endpoints

export async function createMerchant(payload) {
  const resp = await axiosInstance.post("/merchants", payload);
  return resp.data;
}

export async function updateMerchant(id, payload) {
  const resp = await axiosInstance.patch(`/merchants/${id}`, payload);
  return resp.data;
}

export async function deleteMerchant(id) {
  const resp = await axiosInstance.delete(`/merchants/${id}`);
  return resp.data;
}

export async function getMerchantById(id) {
  const resp = await axiosInstance.get(`/merchants/${id}`);
  // API returns { message, data: {...} }, so extract the nested data
  return resp.data.data || resp.data;
}

export async function getMerchants(params = {}) {
  // params: { page, pageSize, search }
  const resp = await axiosInstance.get("/merchants", { params });
  return resp.data;
}

export default {
  createMerchant,
  updateMerchant,
  deleteMerchant,
  getMerchantById,
  getMerchants,
};

