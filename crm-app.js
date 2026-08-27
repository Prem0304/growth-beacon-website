/* GROWTHBEACON CRM — MASTER CLIENT-SIDE APPLICATION ENGINE (DUAL-MODE REST + LOCAL DATA ENGINE) */

document.addEventListener('DOMContentLoaded', () => {
  let currentUser = null;
  let authToken = localStorage.getItem('growthbeacon_token');

  // DOM Elements
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.crm-module-section');
  const breadcrumbEl = document.getElementById('breadcrumb-current');
  const searchInput = document.getElementById('global-search-input');
  const searchDropdown = document.getElementById('search-results-dropdown');

  // ==========================================================================
  // INITIAL SEED DATA FOR STATIC HOSTING (GITHUB PAGES COMPATIBILITY)
  // ==========================================================================
  function initLocalStore() {
    if (!localStorage.getItem('gb_leads')) {
      const defaultLeads = [
        { id: 1, name: "Arunachalam", company: "Theni Silk Palace", email: "arun@thenisilks.com", phone: "+91 9842200101", interested_services: "SEO Services, Meta Ads", budget: 50000, lead_score: 85, status: "Qualified", lead_source: "Website" },
        { id: 2, name: "Murugan", company: "Subam Travels", email: "info@subamtravels.com", phone: "+91 9842200102", interested_services: "Google Ads Management", budget: 35000, lead_score: 65, status: "Contacted", lead_source: "Google Search" },
        { id: 3, name: "Kavya", company: "Coimbatore Tech Park", email: "kavya@ctp.in", phone: "+91 9842200103", interested_services: "Website Development, SEO", budget: 120000, lead_score: 92, status: "Proposal Sent", lead_source: "Instagram" }
      ];
      localStorage.setItem('gb_leads', JSON.stringify(defaultLeads));
    }

    if (!localStorage.getItem('gb_deals')) {
      const defaultDeals = [
        { id: 1, deal_name: "Nova Retail — SEO & Meta Ads Retainer", client_name: "Nova Retail Showroom", value: 60000, stage_name: "Proposal", probability: 75 },
        { id: 2, deal_name: "GreenLeaf — E-Commerce Portal", client_name: "GreenLeaf Organics", value: 95000, stage_name: "Negotiation", probability: 90 }
      ];
      localStorage.setItem('gb_deals', JSON.stringify(defaultDeals));
    }

    if (!localStorage.getItem('gb_clients')) {
      const defaultClients = [
        { id: 1, company_name: "Nova Retail Showroom", industry: "Retail", website: "https://novaretail.com", location: "Theni, Tamil Nadu", health_score: 92, health_status: "Healthy" },
        { id: 2, company_name: "GreenLeaf Organics", industry: "Agriculture", website: "https://greenleaforganics.in", location: "Bodinayakanur, Theni", health_score: 78, health_status: "Healthy" }
      ];
      localStorage.setItem('gb_clients', JSON.stringify(defaultClients));
    }

    if (!localStorage.getItem('gb_projects')) {
      const defaultProjects = [
        { id: 1, project_name: "Nova Retail — SEO & Meta Ads Campaign", company_name: "Nova Retail Showroom", manager_name: "Anand", progress: 75, status: "Active" },
        { id: 2, project_name: "GreenLeaf Organics — E-Commerce Web App", company_name: "GreenLeaf Organics", manager_name: "Ram", progress: 60, status: "Active" }
      ];
      localStorage.setItem('gb_projects', JSON.stringify(defaultProjects));
    }

    if (!localStorage.getItem('gb_tasks')) {
      const defaultTasks = [
        { id: 1, title: "Optimize Diwali Meta Ads Creatives", company_name: "Nova Retail Showroom", assignee_name: "Karthik", priority: "High", due_date: "2026-09-05", status: "In Progress" },
        { id: 2, title: "Perform Technical SEO Rank Audit", company_name: "Nova Retail Showroom", assignee_name: "Priya", priority: "Medium", due_date: "2026-08-27", status: "Completed" }
      ];
      localStorage.setItem('gb_tasks', JSON.stringify(defaultTasks));
    }

    if (!localStorage.getItem('gb_invoices')) {
      const defaultInvoices = [
        { id: 1, invoice_number: "INV-2026-001", company_name: "Nova Retail Showroom", subtotal: 50000, include_gst: 1, cgst_amount: 4500, sgst_amount: 4500, total_amount: 59000, paid_amount: 59000, balance_amount: 0, status: "Paid" },
        { id: 2, invoice_number: "INV-2026-002", company_name: "GreenLeaf Organics", subtotal: 35000, include_gst: 0, cgst_amount: 0, sgst_amount: 0, total_amount: 35000, paid_amount: 15000, balance_amount: 20000, status: "Partially Paid" }
      ];
      localStorage.setItem('gb_invoices', JSON.stringify(defaultInvoices));
    }

    if (!localStorage.getItem('gb_tickets')) {
      const defaultTickets = [
        { id: 1, ticket_number: "TICK-2026-001", company_name: "Nova Retail Showroom", subject: "Diwali Offer Creative Review", priority: "High", assignee_name: "Anand", status: "New" }
      ];
      localStorage.setItem('gb_tickets', JSON.stringify(defaultTickets));
    }
  }

  initLocalStore();

  // Helper for safe API call with local fallback
  async function safeApiCall(url, options = {}) {
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await res.json();
        }
      }
    } catch (e) {
      console.log("REST API offline, using local engine for:", url);
    }
    return null;
  }

  // ==========================================================================
  // 1. AUTHENTICATION ENGINE
  // ==========================================================================
  async function checkAuth() {
    if (!authToken) {
      showLoginModal();
      return;
    }

    const data = await safeApiCall('/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (data && data.authenticated) {
      currentUser = data.user;
    } else {
      currentUser = { id: 1, name: "Premkumar", email: "admin@growthbeacon.co.in", role_name: "Super Admin" };
    }

    updateUserUI();
    loadDashboardMetrics();
    loadLeads();
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

        const data = await safeApiCall('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (data && data.success) {
          authToken = data.token;
          localStorage.setItem('growthbeacon_token', data.token);
          currentUser = data.user;
        } else {
          authToken = 'beacon2026_demo_token';
          localStorage.setItem('growthbeacon_token', authToken);
          currentUser = { id: 1, name: "Premkumar", email: email, role_name: email.includes('client') ? 'Client' : 'Super Admin' };
        }

        overlay.remove();
        updateUserUI();
        loadDashboardMetrics();
        loadLeads();
      });
    }
  }

  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('growthbeacon_token');
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
    const data = await safeApiCall('/api/v1/dashboard/metrics', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    let m = null;
    if (data && data.success) {
      m = data.metrics;
    } else {
      const leads = JSON.parse(localStorage.getItem('gb_leads') || '[]');
      const clients = JSON.parse(localStorage.getItem('gb_clients') || '[]');
      const invoices = JSON.parse(localStorage.getItem('gb_invoices') || '[]');

      const paidRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total_amount, 0);

      m = {
        total_leads: leads.length,
        qualified_leads: leads.filter(l => l.status === 'Qualified' || l.status === 'Won').length,
        conversion_rate: 33.3,
        won_revenue: 155000,
        pipeline_value: 95000,
        active_clients: clients.length,
        mrr: clients.length * 35000,
        total_paid_revenue: paidRevenue,
        active_projects: 2,
        tasks_due_today: 1
      };
    }

    document.getElementById('kpi-total-leads').textContent = m.total_leads;
    document.getElementById('kpi-conversion-rate').textContent = `${m.conversion_rate}%`;
    document.getElementById('kpi-active-clients').textContent = m.active_clients;
    document.getElementById('kpi-mrr').textContent = `₹${m.mrr.toLocaleString()}`;
    document.getElementById('badge-leads-count').textContent = m.total_leads;
  }

  async function loadLeads() {
    const data = await safeApiCall('/api/v1/leads', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    let leads = [];
    if (data && data.success) {
      leads = data.leads;
    } else {
      leads = JSON.parse(localStorage.getItem('gb_leads') || '[]');
    }

    renderLeadsTable('tbody-leads', leads);
    renderLeadsTable('tbody-dashboard-leads', leads.slice(0, 5));
  }

  function renderLeadsTable(elementId, leads) {
    const tbody = document.getElementById(elementId);
    if (!tbody) return;

    if (leads.length === 0) {
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
    const leads = JSON.parse(localStorage.getItem('gb_leads') || '[]');
    const tbody = document.getElementById('tbody-companies');
    if (tbody) {
      tbody.innerHTML = leads.map(l => `
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
    const deals = JSON.parse(localStorage.getItem('gb_deals') || '[]');
    const tbody = document.getElementById('tbody-deals');
    if (tbody) {
      tbody.innerHTML = deals.map(d => `
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
    const clients = JSON.parse(localStorage.getItem('gb_clients') || '[]');
    const tbody = document.getElementById('tbody-clients');
    if (tbody) {
      tbody.innerHTML = clients.map(c => `
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
    const projects = JSON.parse(localStorage.getItem('gb_projects') || '[]');
    const tbody = document.getElementById('tbody-projects');
    if (tbody) {
      tbody.innerHTML = projects.map(p => `
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
    const tasks = JSON.parse(localStorage.getItem('gb_tasks') || '[]');
    const tbody = document.getElementById('tbody-tasks');
    if (tbody) {
      tbody.innerHTML = tasks.map(t => `
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
    const invoices = JSON.parse(localStorage.getItem('gb_invoices') || '[]');
    const tbody = document.getElementById('tbody-invoices');
    if (tbody) {
      tbody.innerHTML = invoices.map(inv => `
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
    const tickets = JSON.parse(localStorage.getItem('gb_tickets') || '[]');
    const tbody = document.getElementById('tbody-tickets');
    if (tbody) {
      tbody.innerHTML = tickets.map(tk => `
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
      id: Date.now(),
      name: document.getElementById('lead-name').value,
      company: document.getElementById('lead-company').value,
      email: document.getElementById('lead-email').value,
      phone: document.getElementById('lead-phone').value,
      interested_services: document.getElementById('lead-service').value,
      budget: 35000,
      lead_score: 80,
      status: 'New',
      lead_source: 'Manual'
    };

    const res = await safeApiCall('/api/v1/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
      body: JSON.stringify(payload)
    });

    if (!res) {
      const leads = JSON.parse(localStorage.getItem('gb_leads') || '[]');
      leads.unshift(payload);
      localStorage.setItem('gb_leads', JSON.stringify(leads));
    }

    modalLead.classList.remove('active');
    document.getElementById('form-add-lead').reset();
    loadDashboardMetrics();
    loadLeads();
  });

  // Invoice Modal with GST Toggle
  const modalInvoice = document.getElementById('modal-add-invoice');
  const btnOpenInvoice = document.getElementById('btn-open-add-invoice');
  const btnCloseInvoice = document.getElementById('btn-close-invoice-modal');

  if (btnOpenInvoice) {
    btnOpenInvoice.addEventListener('click', async () => {
      const select = document.getElementById('invoice-client-id');
      const clients = JSON.parse(localStorage.getItem('gb_clients') || '[]');
      if (select) {
        select.innerHTML = clients.map(c => `<option value="${c.id}">${c.company_name}</option>`).join('');
      }
      modalInvoice.classList.add('active');
    });
  }
  if (btnCloseInvoice) btnCloseInvoice.addEventListener('click', () => modalInvoice.classList.remove('active'));

  document.getElementById('form-add-invoice').addEventListener('submit', async (e) => {
    e.preventDefault();
    const clientId = document.getElementById('invoice-client-id').value;
    const subtotal = parseFloat(document.getElementById('invoice-subtotal').value);
    const includeGst = document.getElementById('invoice-include-gst').checked;

    const cgst = includeGst ? roundVal(subtotal * 0.09) : 0;
    const sgst = includeGst ? roundVal(subtotal * 0.09) : 0;
    const total = subtotal + cgst + sgst;

    const clients = JSON.parse(localStorage.getItem('gb_clients') || '[]');
    const selectedClient = clients.find(c => c.id == clientId) || { company_name: "Nova Retail Showroom" };

    const newInv = {
      id: Date.now(),
      invoice_number: `INV-2026-${Math.floor(Math.random() * 900 + 100)}`,
      company_name: selectedClient.company_name,
      subtotal: subtotal,
      include_gst: includeGst ? 1 : 0,
      cgst_amount: cgst,
      sgst_amount: sgst,
      total_amount: total,
      paid_amount: 0,
      balance_amount: total,
      status: 'Sent'
    };

    const invoices = JSON.parse(localStorage.getItem('gb_invoices') || '[]');
    invoices.unshift(newInv);
    localStorage.setItem('gb_invoices', JSON.stringify(invoices));

    modalInvoice.classList.remove('active');
    loadInvoices();
  });

  function roundVal(val) { return Math.round(val * 100) / 100; }

  // Global Lead Conversion Helper
  window.convertLeadToClient = function(leadId, companyName) {
    if (confirm(`Convert lead '${companyName}' into an Active Client Account with Onboarding Project?`)) {
      const clients = JSON.parse(localStorage.getItem('gb_clients') || '[]');
      clients.unshift({ id: Date.now(), company_name: companyName, industry: "Commercial", location: "Theni, Tamil Nadu", health_score: 90, health_status: "Healthy" });
      localStorage.setItem('gb_clients', JSON.stringify(clients));

      const projects = JSON.parse(localStorage.getItem('gb_projects') || '[]');
      projects.unshift({ id: Date.now(), project_name: `${companyName} — Onboarding Project`, company_name: companyName, manager_name: "Anand", progress: 10, status: "Active" });
      localStorage.setItem('gb_projects', JSON.stringify(projects));

      alert("Client Account & Onboarding Project Created Successfully!");
      loadDashboardMetrics();
      loadLeads();
    }
  };

  window.markDealWon = function(dealId, dealName) {
    if (confirm(`Mark deal '${dealName}' as WON and auto-create Client Account?`)) {
      const clients = JSON.parse(localStorage.getItem('gb_clients') || '[]');
      clients.unshift({ id: Date.now(), company_name: dealName, industry: "Commercial", location: "Theni, Tamil Nadu", health_score: 95, health_status: "Healthy" });
      localStorage.setItem('gb_clients', JSON.stringify(clients));

      alert("Deal Marked WON & Client Profile Auto-Created!");
      loadDeals();
    }
  };

  window.recordPaymentPrompt = function(invoiceId, balance) {
    const amountStr = prompt(`Enter payment amount to record for Invoice (Current Balance: ₹${balance}):`, balance);
    if (amountStr) {
      const amount = parseFloat(amountStr);
      if (amount > 0) {
        const invoices = JSON.parse(localStorage.getItem('gb_invoices') || '[]');
        const inv = invoices.find(i => i.id == invoiceId);
        if (inv) {
          inv.paid_amount += amount;
          inv.balance_amount = Math.max(0, inv.total_amount - inv.paid_amount);
          inv.status = inv.balance_amount === 0 ? 'Paid' : 'Partially Paid';
          localStorage.setItem('gb_invoices', JSON.stringify(invoices));
          loadInvoices();
        }
      }
    }
  };

  window.viewClient360 = function(clientId) {
    const clients = JSON.parse(localStorage.getItem('gb_clients') || '[]');
    const c = clients.find(cl => cl.id == clientId) || clients[0];
    alert(`Client 360° Overview: ${c.company_name}\nIndustry: ${c.industry || 'Retail'}\nHealth Score: ${c.health_score}/100 (${c.health_status})\nStatus: Active Retainer`);
  };

  // ==========================================================================
  // 5. GLOBAL SEARCH ENGINE
  // ==========================================================================
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (q.length < 2) {
        searchDropdown.style.display = 'none';
        return;
      }

      const leads = JSON.parse(localStorage.getItem('gb_leads') || '[]');
      const clients = JSON.parse(localStorage.getItem('gb_clients') || '[]');
      const invoices = JSON.parse(localStorage.getItem('gb_invoices') || '[]');

      const results = [];
      leads.filter(l => (l.name || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q)).forEach(l => {
        results.append || results.push({ type: 'Lead', title: l.name, subtitle: l.company || 'Lead', link: 'leads' });
      });
      clients.filter(c => (c.company_name || '').toLowerCase().includes(q)).forEach(c => {
        results.push({ type: 'Client', title: c.company_name, subtitle: c.industry || 'Client', link: 'clients' });
      });
      invoices.filter(i => (i.invoice_number || '').toLowerCase().includes(q)).forEach(i => {
        results.push({ type: 'Invoice', title: i.invoice_number, subtitle: `₹${i.total_amount}`, link: 'finance' });
      });

      if (results.length > 0) {
        searchDropdown.innerHTML = results.map(r => `
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
