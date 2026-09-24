/* global Office */

Office.onReady(function (info) {
  const badge = document.getElementById('status-badge');
  const statusArea = document.getElementById('status-area');

  if (info.host !== Office.HostType.Outlook) {
    badge.textContent = 'Non in Outlook';
    badge.className = 'status-badge error';
    statusArea.innerHTML = '<div class="info-row"><span class="value">⚠️ Questo add-in funziona solo in Microsoft Outlook.</span></div>';
    return;
  }

  badge.textContent = '✓ Outlook connesso';
  badge.className = 'status-badge ok';

  // Mostra versione API
  const apiVer = Office.context.requirements
    ? 'Mailbox ' + (Office.context.mailbox.diagnostics ? Office.context.mailbox.diagnostics.hostVersion : '?')
    : 'Office.js caricato';
  document.getElementById('api-version').textContent = apiVer;

  const item = Office.context.mailbox.item;

  if (!item) {
    document.getElementById('no-item').style.display = 'block';
    return;
  }

  document.getElementById('email-info').style.display = 'block';

  // Oggetto
  document.getElementById('subject').textContent = item.subject || '(nessun oggetto)';

  // Item ID (troncato per leggibilità)
  const itemId = item.itemId || '—';
  document.getElementById('item-id').textContent = itemId.substring(0, 60) + (itemId.length > 60 ? '…' : '');

  // Mittente
  if (item.from) {
    const from = item.from;
    document.getElementById('from-name').textContent = from.displayName || '—';
    document.getElementById('from-email').textContent = from.emailAddress || '—';
    const emailAddr = from.emailAddress || '';
    const atIndex = emailAddr.indexOf('@');
    document.getElementById('from-domain').textContent =
      atIndex >= 0 ? emailAddr.substring(atIndex) : '—';
  }

  // Destinatari TO + CC
  const recipientsContainer = document.getElementById('recipients-list');
  const allRecipients = [
    ...(item.to || []).map(r => ({ ...r, type: 'TO' })),
    ...(item.cc || []).map(r => ({ ...r, type: 'CC' })),
  ];

  if (allRecipients.length === 0) {
    recipientsContainer.innerHTML = '<span class="empty-state">Nessun destinatario</span>';
  } else {
    recipientsContainer.innerHTML = allRecipients
      .map(r => {
        const email = r.emailAddress || '';
        const name = r.displayName || email;
        return `<span class="pill" title="${email}">${r.type}: ${name}</span>`;
      })
      .join('');
  }
});
