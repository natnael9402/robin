import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../../src/shared/lib/config';

const HUBSPOT_BASE = 'https://api.hubapi.com';

export async function POST(req: NextRequest) {
  const apiKey = config.hubspotApiKey;
  if (!apiKey || apiKey.startsWith('REPLACE')) {
    return NextResponse.json({ ok: false, error: 'HubSpot key not configured' }, { status: 500 });
  }

  try {
    const { userName, userEmail, message, subject, priority } = await req.json();

    if (!message) {
      return NextResponse.json({ ok: false, error: 'message is required' }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json' as const,
    };

    const contactProps: Record<string, string> = {};
    if (userEmail && userEmail !== 'guest@system.paxora') {
      contactProps.email = userEmail;
    }
    if (userName) {
      contactProps.firstname = userName;
    }

    let contactId: string | null = null;

    if (contactProps.email) {
      const searchRes = await fetch(
        `${HUBSPOT_BASE}/crm/v3/objects/contacts/search`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            filterGroups: [
              { filters: [{ propertyName: 'email', operator: 'EQ', value: contactProps.email }] },
            ],
            limit: 1,
          }),
        }
      );
      const searchData = await searchRes.json();
      const existing = searchData.results?.[0];

      if (existing) {
        contactId = existing.id;
        if (userName && existing.properties?.firstname !== userName) {
          await fetch(`${HUBSPOT_BASE}/crm/v3/objects/contacts/${contactId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ properties: { firstname: userName } }),
          });
        }
      } else {
        const createRes = await fetch(`${HUBSPOT_BASE}/crm/v3/objects/contacts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ properties: contactProps }),
        });
        const created = await createRes.json();
        contactId = created.id ?? null;
      }
    }

    const priorityLabel = priority ? `[${String(priority).toUpperCase()}] ` : '';
    const subjectLabel = subject ? `${subject}` : 'Support Message';
    const ticketSubject = `${priorityLabel}New message from ${userName || 'User'} — ${subjectLabel}`;

    const ticketBody = [
      `From: ${userName || 'Unknown'}${userEmail && userEmail !== 'guest@system.paxora' ? ` (${userEmail})` : ''}`,
      subject ? `Ticket: ${subject}` : '',
      priority ? `Priority: ${String(priority).toUpperCase()}` : '',
      '',
      message,
    ]
      .filter(Boolean)
      .join('\n');

    const ticketPayload: { properties: Record<string, unknown>; associations?: unknown[] } = {
      properties: {
        subject: ticketSubject,
        content: ticketBody,
        hs_ticket_priority: 'HIGH',
        hs_pipeline_stage: '5686888693',
      },
    };

    if (contactId) {
      ticketPayload.associations = [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 16 }],
        },
      ];
    }

    const ticketRes = await fetch(`${HUBSPOT_BASE}/crm/v3/objects/tickets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ticketPayload),
    });

    if (!ticketRes.ok) {
      const errBody = await ticketRes.text();
      console.error('HubSpot ticket creation failed:', ticketRes.status, errBody);
      return NextResponse.json({ ok: false, error: errBody }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('HubSpot notify error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
