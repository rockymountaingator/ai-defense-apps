const fetch = require('node-fetch');

const VBOUT_API_BASE = 'https://api.vbout.com/1';

const FIELD_IDS = {
  firstname:    327162,
  first_name:   327162,
  lastname:     327163,
  last_name:    327163,
  company:      1163158,
  company_name: 1163158,
  industry:     1163159,
  v_ai_score:   1163160,
  company_size: 1163162,
  revenue:      1163163,
  ro_score:     1163164,
  dp_score:     1163165,
  ms_score:     1163166,
  di_score:     1163167,
  job_title:    1163168,
  title:        1163168,
  quadrant:     1163169,
  archetype:    1170812,
};

function buildFieldParams(formData, fields) {
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue;
    const id = FIELD_IDS[key.toLowerCase()];
    if (id) {
      formData.append(`field[${id}]`, String(value));
    }
  }
}

async function getContactIdByEmail(email) {
  const apiKey = process.env.VBOUT_API_KEY;
  const listId = process.env.VBOUT_LIST_ID;
  const url = `${VBOUT_API_BASE}/emailmarketing/getcontacts.json?key=${encodeURIComponent(apiKey)}&listid=${encodeURIComponent(listId)}&limit=100`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const items = data?.response?.data?.contacts?.items || [];
    const match = items.find(c => c.email?.toLowerCase() === email.toLowerCase());
    return match?.id || null;
  } catch (e) {
    console.error('[Vbout] getcontacts error:', e.message);
    return null;
  }
}

async function editContact(contactId, allFields) {
  const apiKey = process.env.VBOUT_API_KEY;
  const listId = process.env.VBOUT_LIST_ID;

  const formData = new URLSearchParams();
  formData.append('id', String(contactId));
  formData.append('listid', listId);
  formData.append('status', 'Active');
  buildFieldParams(formData, allFields);

  const url = `${VBOUT_API_BASE}/emailmarketing/editcontact.json?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await res.json();
    if (data?.response?.header?.status === 'error') {
      console.error('[Vbout] editcontact FAILED:', JSON.stringify(data));
      return null;
    }
    console.log('[Vbout] editcontact succeeded for contact', contactId);
    return data;
  } catch (e) {
    console.error('[Vbout] editcontact error:', e.message);
    return null;
  }
}

function getArchetype(quadrant, employeeSize) {
  const isSmall = employeeSize && ['1-10','11-50'].includes(employeeSize);
  const isMid = employeeSize && ['51-200','201-500'].includes(employeeSize);
  if (quadrant === 'AI Vanguard') {
    return isSmall ? 'Scalable Pioneer' : isMid ? 'Enterprise AI Leader' : 'Fortress AI';
  } else if (quadrant === 'The Experimentalist') {
    return isSmall ? 'Eager Experimenter' : isMid ? 'Invested Explorer' : 'Big Bet Gambler';
  } else if (quadrant === 'Untapped Fortress') {
    return isSmall ? 'Hidden Gem' : isMid ? 'Sleeping Giant' : 'Dormant Leviathan';
  } else {
    return isSmall ? 'Vulnerable Startup' : isMid ? 'Exposed Mid-Market' : 'Titanic Risk';
  }
}

async function addToList(email, firstName, lastName, customFields = {}) {
  const listId = process.env.VBOUT_LIST_ID;
  const apiKey = process.env.VBOUT_API_KEY;

  if (!listId || !apiKey) {
    console.warn('[Vbout] Not configured - skipping');
    return null;
  }

  console.log('[Vbout] addToList for', email);

  const allFields = {
    firstname: firstName || '',
    lastname: lastName || '',
    ...customFields
  };

  // Step 1: addcontact
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('listid', listId);
  formData.append('status', 'Active');
  buildFieldParams(formData, allFields);

  const addUrl = `${VBOUT_API_BASE}/emailmarketing/addcontact.json?key=${encodeURIComponent(apiKey)}`;

  try {
    const addRes = await fetch(addUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    const data = await addRes.json();
    const responseData = data?.response?.data;
    const contactExists =
      (responseData?.id === 0 || responseData?.id === '0') ||
      String(responseData?.error || '').toLowerCase().includes('already exists') ||
      String(responseData?.item || '').toLowerCase().includes('already exists');

    let contactId;
    if (contactExists) {
      console.log('[Vbout] Contact exists - looking up ID');
      contactId = await getContactIdByEmail(email);
    } else if (data?.response?.header?.status === 'error') {
      console.error('[Vbout] addcontact FAILED:', JSON.stringify(data));
      return null;
    } else {
      contactId = responseData?.id;
      console.log('[Vbout] addcontact created:', email, '| ID:', contactId);
    }

    // Step 2: ALWAYS follow with editcontact to save custom fields
    // Vbout's addcontact silently drops field[ID] params - editcontact is what actually saves them
    if (contactId) {
      console.log('[Vbout] Following up with editcontact to save fields');
      return await editContact(contactId, allFields);
    }

    console.warn('[Vbout] No contact ID available for editcontact');
    return null;
  } catch (e) {
    console.error('[Vbout] addcontact error:', e.message);
    return null;
  }
}

module.exports = { addToList, getArchetype };
