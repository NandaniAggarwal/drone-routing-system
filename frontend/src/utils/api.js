import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export async function runSimulation(payload) {
  const res = await client.post('/solve', payload);
  return res.data;
}
