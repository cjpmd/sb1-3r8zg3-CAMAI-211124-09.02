export async function createCustomerPortalSession(userId: string): Promise<string> {
  try {
    const response = await fetch(`http://localhost:3000/api/stripe/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    if (!url) {
      throw new Error('No portal URL returned');
    }

    return url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}
