'use client';

import { getAcessToken } from '../data/token';

export const fetchWithCredentials = async (url: string) => {
  const accessToken = await getAcessToken();
  return fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((res) => res.json());
};
