// vBout CRM integration for Personal Assessment
// Upserts contacts to vBout List 185481 with assessment scores and profile

const VBOUT_API_BASE = 'https://api.vbout.com/1';

// Personal assessment field IDs (List 185481)
const FIELD_IDS: Record<string, number> = {
  exposure: 1170813,
  resilience: 1170814,
  readiness: 1170815,
  profile: 1170816,
  pathway_title: 1170816, // same as profile
};

async function addContactToVbout(email: string, fields: Record<string, string | number | null>) {
  const apiKey = process.env.VBOUT_API_KEY;
  const listId = process.env.VBOUT_PERSONAL_LIST_ID;

  if (!apiKey || !listId) {
    console.log('[Vbout-Personal] Not configured, skipping');
    return null;
  }

  const allFields = { ...fields };

  // Step 1: Add contact (creates or returns existing)
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('listid', listId);
  formData.append('status', 'Active');

  for (const [key, value] of Object.entries(allFields)) {
    if (value === undefined || value === null || value === '') continue;
    const id = FIELD_IDS[key.toLowerCase()];
    if (id) {
      formData.append(`field[${id}]`, String(value));
    }
  }

  const addUrl = `${VBOUT_API_BASE}/emailmarketing/addcontact.json?key=${encodeURIComponent(apiKey)}`;

  try {
    const addRes = await fetch(addUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    const data = await addRes.json();
    const responseData = data?.response?.data;
    const contactExists =
      (responseData?.id === 0 || responseData?.id === '0') ||
      String(responseData?.error || '').toLowerCase().includes('already exists') ||
      String(responseData?.item || '').toLowerCase().includes('already exists');

    let contactId: string | null;
    if (contactExists) {
      contactId = await getContactIdByEmail(email);
    } else if (data?.response?.header?.status === 'error') {
      console.error('[Vbout-Personal] addcontact FAILED:', JSON.stringify(data));
      return null;
    } else {
      contactId = responseData?.id;
      console.log('[Vbout-Personal] addcontact created:', email, '| ID:', contactId);
    }

    // Step 2: editcontact to save custom fields (addcontact silently drops them)
    if (contactId) {
      return await editContact(contactId, allFields);
    }

    return null;
  } catch (e: unknown) {
    console.error('[Vbout-Personal] addcontact error:', (e as Error).message);
    return null;
  }
}

async function getContactIdByEmail(email: string): Promise<string | null> {
  const apiKey = process.env.VBOUT_API_KEY;
  const listId = process.env.VBOUT_PERSONAL_LIST_ID;
  const url = `${VBOUT_API_BASE}/emailmarketing/getcontacts.json?key=${encodeURIComponent(apiKey!)}&listid=${encodeURIComponent(listId!)}&limit=100`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.response?.data?.contacts?.items || [];
    const match = items.find((c: { email?: string }) => c.email?.toLowerCase() === email.toLowerCase());
    return match?.id || null;
  } catch (e: unknown) {
    console.error('[Vbout-Personal] getcontacts error:', (e as Error).message);
    return null;
  }
}

async function editContact(contactId: string, allFields: Record<string, string | number | null>) {
  const apiKey = process.env.VBOUT_API_KEY;
  const listId = process.env.VBOUT_PERSONAL_LIST_ID;

  const formData = new URLSearchParams();
  formData.append('id', String(contactId));
  formData.append('listid', listId!);
  formData.append('status', 'Active');

  for (const [key, value] of Object.entries(allFields)) {
    if (value === undefined || value === null || value === '') continue;
    const id = FIELD_IDS[key.toLowerCase()];
    if (id) {
      formData.append(`field[${id}]`, String(value));
    }
  }

  const url = `${VBOUT_API_BASE}/emailmarketing/editcontact.json?key=${encodeURIComponent(apiKey!)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    const data = await res.json();
    if (data?.response?.header?.status === 'error') {
      console.error('[Vbout-Personal] editcontact FAILED:', JSON.stringify(data));
      return null;
    }
    console.log('[Vbout-Personal] editcontact succeeded for contact', contactId);
    return data;
  } catch (e: unknown) {
    console.error('[Vbout-Personal] editcontact error:', (e as Error).message);
    return null;
  }
}

export { addContactToVbout };
