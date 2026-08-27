/* GROWTHBEACON CRM — PRODUCTION CLIENT-SIDE APPLICATION ENGINE */

document.addEventListener('DOMContentLoaded', () => {
  let currentUser = null;
  let csrfToken = null;

  // DOM Elements
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.crm-module-section');
  const breadcrumbEl = document.getElementById('breadcrumb-current');
  const searchInput = document.getElementById('global-search-input');
  const searchDropdown = document.getElementById('search-results-dropdown');

  // Centralized API Client
  async function apiClient(endpoint, method = 'GET', body = null) {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const options = {
      method: method,
      headers: headers,
      credentials: 'same-origin'
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const res = await fetch(endpoint, options);
      const data = await res.json();
      if (res.status === 401 && endpoint !== '/api/v1/auth/login') {
        showLoginModal();
        return null;
      }
      return data;
    } catch (e) {
      console.warn("API request error:", endpoint, e);
      return null;
    }
  }

  // ==========================================================================
  // 1. AUTHENTICATION ENGINE
  // ==========================================================================
  async function checkAuth() {
    const data = await apiClient('/api/v1/auth/me');
    if (data && data.authenticated) {
      currentUser = data.user;
      csrfToken = data.csrf_token;
      updateUserUI();
      loadDashboardMetrics();
      loadLeads();
    } else {
      showLoginModal();
    }
  }

  function updateUserUI() {
    if (!currentUser) return;
    document.getElementById('user-name-display').textContent = currentUser.name;
    document.getElementById('user-role-badge').textContent = currentUser.role_name;

    if (currentUser.role_name === 'Client') {
      window.location.href = './client.html';
    }
  }

  function showLoginModal() {
    let overlay = document.getElementById('modal-auth-login');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-auth-login';
      overlay.className = 'modal-overlay active';
      overlay.innerHTML = `
        <div class="modal-box" style="width:400px; text-align:center;">
          <img src="assets/growth_beacon_logo.svg?v=4" width="48" style="margin-bottom:1rem;">
          <h3 style="margin-bottom:0.5rem; color:var(--cyan-glow);">GROWTHBEACON CRM LOGIN</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem;">Authenticate agency session to access workspace.</p>
          <form id="form-login">
            <div class="form-group" style="text-align:left;">
              <label>Email Address</label>
              <input type="email" id="login-email" class="form-control" value="admin@growthbeacon.co.in" required>
            </div>
            <div class="form-group" style="text-align:left;">
              <label>Authorization Password</label>
              <input type="password" id="login-password" class="form-control" value="beacon2026" required>
            </div>
            <button type="submit" class="btn-crm btn-crm-primary" style="width:100%; justify-content:center; margin-top:1rem;">Authenticate Session</button>
          </form>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const data = await apiClient('/api/v1/auth/login', 'POST', { email, password });
        if (data && data.success) {
          csrfToken = data.csrf_token;
          overlay.remove();
          checkAuth();
        } else {
          alert((data && data.error && data.error.message) || "Invalid credentials");
        }
      });
    }
  }

  document.getElementById('btn-logout').addEventListener('click', async () => {
    await apiClient('/api/v1/auth/logout', 'POST');
    window.location.reload();
  });

  // ==========================================================================
  // 2. MODULE NAVIGATION
  // ==========================================================================
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const moduleName = item.getAttribute('data-module');
      if (!moduleName) return;

      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(sec => sec.classList.remove('active'));
      const targetSec = document.getElementById(`sec-${moduleName}`);
      if (targetSec) targetSec.classList.add('active');

      breadcrumbEl.textContent = item.querySelector('span').textContent.replace(/[^\w\s&]/gi, '').trim();

      if (moduleName === 'leads') loadLeads();
      if (moduleName === 'companies') loadCompanies();
      if (moduleName === 'deals') loadDeals();
      if (moduleName === 'clients') loadClients();
      if (moduleName === 'projects') loadProjects();
      if (moduleName === 'tasks') loadTasks();
      if (moduleName === 'finance') loadInvoices();
      if (moduleName === 'tickets') loadTickets();
    });
  });

  // ==========================================================================
  // 3. API DATA FETCHERS & RENDERERS
  // ==========================================================================
  async function loadDashboardMetrics() {
    const data = await apiClient('/api/v1/dashboard/metrics');
    if (data && data.success) {
      const m = data.metrics;
      document.getElementById('kpi-total-leads').textContent = m.total_leads;
      document.getElementById('kpi-conversion-rate').textContent = `${m.conversion_rate}%`;
      document.getElementById('kpi-active-clients').textContent = m.active_clients;
      document.getElementById('kpi-mrr').textContent = `₹${m.mrr.toLocaleString()}`;
      document.getElementById('badge-leads-count').textContent = m.total_leads;
    }
  }

  async function loadLeads() {
    const data = await apiClient('/api/v1/leads');
    if (data && data.success) {
      renderLeadsTable('tbody-leads', data.leads);
      renderLeadsTable('tbody-dashboard-leads', data.leads.slice(0, 5));
    }
  }

  function renderLeadsTable(elementId, leads) {
    const tbody = document.getElementById(elementId);
    if (!tbody) return;

    if (!leads || leads.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No leads recorded yet. Click + Quick Lead to create one!</td></tr>`;
      return;
    }

    tbody.innerHTML = leads.map(l => `
      <tr>
        <td><strong>${l.name}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${l.email || l.phone || ''}</span></td>
        <td>${l.company || '—'}</td>
        <td><span style="font-size:0.8rem; background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px;">${l.lead_source || 'Website'}</span></td>
        <td>${l.interested_services || 'Digital Marketing'}</td>
        <td>₹${(l.budget || 0).toLocaleString()}</td>
        <td><span style="color:var(--cyan-glow); font-weight:700;">${l.lead_score || 80}/100</span></td>
        <td><span class="badge-status status-${(l.status || 'new').toLowerCase()}">${l.status}</span></td>
        <td>
          <button class="btn-crm btn-crm-secondary" style="padding:3px 8px; font-size:0.75rem;" onclick="convertLeadToClient(${l.id}, '${l.company || l.name}')">Convert to Client</button>
        </td>
      </tr>
    `).join('');
  }

  async function loadCompanies() {
    const data = await apiClient('/api/v1/leads');
    const tbody = document.getElementById('tbody-companies');
    if (data && data.success && tbody) {
      tbody.innerHTML = data.leads.map(l => `
        <tr>
          <td><strong>${l.company || l.name}</strong></td>
          <td>${l.industry || 'Commercial'}</td>
          <td>Theni, Tamil Nadu</td>
          <td><a href="#" style="color:var(--cyan-glow);">growthbeacon.co.in</a></td>
          <td>₹${((l.budget || 25000) * 4).toLocaleString()}</td>
        </tr>
      `).join('');
    }
  }

  async function loadDeals() {
    const data = await apiClient('/api/v1/deals');
    const tbody = document.getElementById('tbody-deals');
    if (data && data.success && tbody) {
      tbody.innerHTML = data.deals.map(d => `
        <tr>
          <td><strong>${d.deal_name}</strong></td>
          <td>${d.client_name || 'Nova Retail Showroom'}</td>
          <td>₹${(d.value || 45000).toLocaleString()}</td>
          <td><span class="badge-status status-${(d.stage_name || 'new').toLowerCase()}">${d.stage_name || 'Proposal'}</span></td>
          <td>${d.probability}%</td>
          <td>
            <button class="btn-crm btn-crm-primary" style="padding:3px 8px; font-size:0.75rem;" onclick="markDealWon(${d.id}, '${d.deal_name}')">Mark Won</button>
          </td>
        </tr>
      `).join('');
    }
  }

  async function loadClients() {
    const data = await apiClient('/api/v1/clients');
    const tbody = document.getElementById('tbody-clients');
    if (data && data.success && tbody) {
      tbody.innerHTML = data.clients.map(c => `
        <tr>
          <td><strong>${c.company_name}</strong></td>
          <td>${c.industry || 'Retail'}</td>
          <td>${c.location || 'Theni, Tamil Nadu'}</td>
          <td><span style="color:var(--green-success); font-weight:700;">${c.health_score}/100</span></td>
          <td><span class="badge-status status-healthy">${c.health_status}</span></td>
          <td>
            <button class="btn-crm btn-crm-secondary" style="padding:3px 8px; font-size:0.75rem;" onclick="viewClient360(${c.id})">360° Profile</button>
          </td>
        </tr>
      `).join('');
    }
  }

  async function loadProjects() {
    const data = await apiClient('/api/v1/projects');
    const tbody = document.getElementById('tbody-projects');
    if (data && data.success && tbody) {
      tbody.innerHTML = data.projects.map(p => `
        <tr>
          <td><strong>${p.project_name}</strong></td>
          <td>${p.company_name || 'Client Account'}</td>
          <td>${p.manager_name || 'Anand'}</td>
          <td>
            <div style="width:100px; background:rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;">
              <div style="width:${p.progress}%; background:var(--cyan-glow); height:100%;"></div>
            </div>
            <span style="font-size:0.75rem;">${p.progress}%</span>
          </td>
          <td><span class="badge-status status-active">${p.status}</span></td>
        </tr>
      `).join('');
    }
  }

  async function loadTasks() {
    const data = await apiClient('/api/v1/tasks');
    const tbody = document.getElementById('tbody-tasks');
    if (data && data.success && tbody) {
      tbody.innerHTML = data.tasks.map(t => `
        <tr>
          <td><strong>${t.title}</strong></td>
          <td>${t.company_name || 'Client Account'}</td>
          <td>${t.assignee_name || 'Team Member'}</td>
          <td><span style="color:var(--yellow-warning); font-weight:600;">${t.priority}</span></td>
          <td>${t.due_date || '2026-09-05'}</td>
          <td><span class="badge-status status-${(t.status || 'todo').toLowerCase()}">${t.status}</span></td>
        </tr>
      `).join('');
    }
  }

  async function loadInvoices() {
    const data = await apiClient('/api/v1/invoices');
    const tbody = document.getElementById('tbody-invoices');
    if (data && data.success && tbody) {
      tbody.innerHTML = data.invoices.map(inv => `
        <tr>
          <td><strong>${inv.invoice_number}</strong></td>
          <td>${inv.company_name || 'Nova Retail Showroom'}</td>
          <td>₹${inv.subtotal.toLocaleString()}</td>
          <td>${inv.include_gst ? '₹' + (inv.cgst_amount + inv.sgst_amount).toLocaleString() + ' (18%)' : 'No GST (0%)'}</td>
          <td><strong>₹${inv.total_amount.toLocaleString()}</strong></td>
          <td>₹${inv.paid_amount.toLocaleString()}</td>
          <td>₹${inv.balance_amount.toLocaleString()}</td>
          <td><span class="badge-status status-${inv.status.toLowerCase()}">${inv.status}</span></td>
          <td>
            ${inv.balance_amount > 0 ? `<button class="btn-crm btn-crm-primary" style="padding:3px 8px; font-size:0.75rem;" onclick="recordPaymentPrompt(${inv.id}, ${inv.balance_amount})">Record Payment</button>` : '<span style="color:var(--green-success); font-size:0.75rem;">Paid in Full</span>'}
          </td>
        </tr>
      `).join('');
    }
  }

  async function loadTickets() {
    const data = await apiClient('/api/v1/tickets');
    const tbody = document.getElementById('tbody-tickets');
    if (data && data.success && tbody) {
      tbody.innerHTML = data.tickets.map(tk => `
        <tr>
          <td><strong>${tk.ticket_number}</strong></td>
          <td>${tk.company_name || 'Client Account'}</td>
          <td>${tk.subject}</td>
          <td>${tk.priority}</td>
          <td>${tk.assignee_name || 'Anand'}</td>
          <td><span class="badge-status status-new">${tk.status}</span></td>
        </tr>
      `).join('');
    }
  }

  // ==========================================================================
  // 4. ACTION MODALS & CONVERSIONS
  // ==========================================================================
  const modalLead = document.getElementById('modal-add-lead');
  const btnOpenLead1 = document.getElementById('btn-open-add-lead');
  const btnOpenLead2 = document.getElementById('btn-add-lead-main');
  const btnCloseLead = document.getElementById('btn-close-lead-modal');

  if (btnOpenLead1) btnOpenLead1.addEventListener('click', () => modalLead.classList.add('active'));
  if (btnOpenLead2) btnOpenLead2.addEventListener('click', () => modalLead.classList.add('active'));
  if (btnCloseLead) btnCloseLead.addEventListener('click', () => modalLead.classList.remove('active'));

  document.getElementById('form-add-lead').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('lead-name').value,
      company: document.getElementById('lead-company').value,
      email: document.getElementById('lead-email').value,
      phone: document.getElementById('lead-phone').value,
      interested_services: document.getElementById('lead-service').value
    };

    const data = await apiClient('/api/v1/leads', 'POST', payload);
    if (data && data.success) {
      modalLead.classList.remove('active');
      document.getElementById('form-add-lead').reset();
      loadDashboardMetrics();
      loadLeads();
    }
  });

  // Invoice Modal with GST Toggle
  const modalInvoice = document.getElementById('modal-add-invoice');
  const btnOpenInvoice = document.getElementById('btn-open-add-invoice');
  const btnCloseInvoice = document.getElementById('btn-close-invoice-modal');

  if (btnOpenInvoice) {
    btnOpenInvoice.addEventListener('click', async () => {
      const select = document.getElementById('invoice-client-id');
      const data = await apiClient('/api/v1/clients');
      if (data && data.success && select) {
        select.innerHTML = data.clients.map(c => `<option value="${c.id}">${c.company_name}</option>`).join('');
      }
      modalInvoice.classList.add('active');
    });
  }
  if (btnCloseInvoice) btnCloseInvoice.addEventListener('click', () => modalInvoice.classList.remove('active'));

  document.getElementById('form-add-invoice').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      client_id: document.getElementById('invoice-client-id').value,
      subtotal: parseFloat(document.getElementById('invoice-subtotal').value),
      include_gst: document.getElementById('invoice-include-gst').checked
    };

    const data = await apiClient('/api/v1/invoices', 'POST', payload);
    if (data && data.success) {
      modalInvoice.classList.remove('active');
      loadInvoices();
    }
  });

  // Global Conversion & Action Handlers
  window.convertLeadToClient = async function(leadId, companyName) {
    if (confirm(`Convert lead '${companyName}' into an Active Client Account with Onboarding Project?`)) {
      const data = await apiClient(`/api/v1/leads/${leadId}/convert`, 'POST', { company_name: companyName });
      if (data && data.success) {
        alert("Client Account & Onboarding Project Created Successfully!");
        loadDashboardMetrics();
        loadLeads();
      }
    }
  };

  window.markDealWon = async function(dealId, dealName) {
    if (confirm(`Mark deal '${dealName}' as WON and auto-create Client Account?`)) {
      const data = await apiClient(`/api/v1/deals/${dealId}/convert-to-client`, 'POST', { company_name: dealName });
      if (data && data.success) {
        alert("Deal Marked WON & Client Profile Auto-Created!");
        loadDeals();
      }
    }
  };

  window.recordPaymentPrompt = async function(invoiceId, balance) {
    const amountStr = prompt(`Enter payment amount to record for Invoice (Current Balance: ₹${balance}):`, balance);
    if (amountStr) {
      const amount = parseFloat(amountStr);
      if (amount > 0) {
        const data = await apiClient('/api/v1/payments', 'POST', { invoice_id: invoiceId, amount: amount, payment_method: 'UPI' });
        if (data && data.success) {
          loadInvoices();
        }
      }
    }
  };

  window.viewClient360 = async function(clientId) {
    alert(`Client 360° Overview initialized for Client ID: ${clientId}`);
  };

  // ==========================================================================
  // 5. GLOBAL SEARCH ENGINE
  // ==========================================================================
  if (searchInput) {
    searchInput.addEventListener('input', async () => {
      const q = searchInput.value.trim();
      if (q.length < 2) {
        searchDropdown.style.display = 'none';
        return;
      }

      const data = await apiClient(`/api/v1/search?q=${encodeURIComponent(q)}`);
      if (data && data.success && data.results.length > 0) {
        searchDropdown.innerHTML = data.results.map(r => `
          <div style="padding:8px 12px; border-bottom:1px solid var(--crm-border); cursor:pointer;" onclick="navigateToResult('${r.link}')">
            <span style="font-size:0.75rem; background:rgba(0,240,255,0.15); color:var(--cyan-glow); padding:2px 6px; border-radius:4px;">${r.type}</span>
            <strong style="margin-left:6px; font-size:0.85rem;">${r.title}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted); float:right;">${r.subtitle}</span>
          </div>
        `).join('');
        searchDropdown.style.display = 'block';
      } else {
        searchDropdown.innerHTML = `<div style="padding:12px; color:var(--text-muted); font-size:0.85rem;">No matching records found</div>`;
        searchDropdown.style.display = 'block';
      }
    });
  }

  window.navigateToResult = function(module) {
    searchDropdown.style.display = 'none';
    const navItem = document.querySelector(`.nav-item[data-module="${module}"]`);
    if (navItem) navItem.click();
  };

  // Initialize
  checkAuth();
});
