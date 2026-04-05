import { API_BASE_URL, getToken } from "./config";
import type { IrsResponse } from '../types';

export const syncIRS = async (payload: { classIds: number[] }) => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/irs/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Gagal sinkronisasi data IRS');
    return data;
}

export const getMyIrs = async(): Promise<IrsResponse[]> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/irs/my-irs`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Gagal mendapatkan IRS');
    return data;
}

export const dropIrs = async(id: number): Promise<IrsResponse> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/irs/drop/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    })

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Gagal drop IRS');
    return data;
}
