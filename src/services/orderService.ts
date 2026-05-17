import { Order } from '../types';

export async function submitOrderToBackend(order: Order): Promise<boolean> {
  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to submit order:', error);
    return false;
  }
}

export async function submitScanTracking(tableNumber: string): Promise<boolean> {
  try {
    await fetch('/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        tableNumber,
        timestamp: new Date().toLocaleString('id-ID')
      }),
    });
    return true;
  } catch (error) {
    console.error('Failed to submit scan tracking:', error);
    return false;
  }
}
