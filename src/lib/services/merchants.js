import axiosInstance from "../axios";

export async function createMerchant(payload) {
  const resp = await axiosInstance.post("/merchants", payload);
  return resp.data;
}

export async function updateMerchant(id, payload) {
  const resp = await axiosInstance.patch(`/merchants/${id}`, payload);
  return resp.data;
}

export default { createMerchant, updateMerchant };
