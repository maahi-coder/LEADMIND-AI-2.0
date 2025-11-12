import type { Lead } from '../types';

export const sendLeadsToWebhook = async (leads: Lead[], url: string): Promise<boolean> => {
  if (!url) {
    console.error("Webhook URL is not provided.");
    return false;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leads }),
    });

    if (response.ok) {
      console.log('Leads successfully sent to webhook.');
      return true;
    } else {
      console.error(`Webhook failed with status: ${response.status}`, await response.text());
      return false;
    }
  } catch (error) {
    console.error("Error sending leads to webhook:", error);
    return false;
  }
};
