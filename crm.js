// ==========================================================================
// Growth Beacon Simplified Agency CRM - India Localized Engine (INR ₹)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const ACCESS_PASSWORD = 'beacon2026';

  // --------------------------------------------------------------------------
  // DOM Selectors
  // --------------------------------------------------------------------------
  const loginSection = document.getElementById('login-section');
  const crmLayout = document.getElementById('crm-layout');
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('password-input');
  const loginError = document.getElementById('login-error');
  const btnLogout = document.getElementById('btn-logout');

  // Sidebar Role Elements
  const roleBadge = document.getElementById('sidebar-role-badge');
  const roleSwitchButtons = document.querySelectorAll('.role-switch-btn');

  // Navigation Links & Section Panels
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.crm-section');
  const panelTitleText = document.getElementById('panel-title-text');
  const panelSubtitleText = document.getElementById('panel-subtitle-text');

  // Executive Dashboard Selectors
  const dashTotalLeads = document.getElementById('dash-total-leads');
  const dashCloseRate = document.getElementById('dash-conversion-rate');
  const dashActiveClients = document.getElementById('dash-active-clients');
  const dashTotalMmr = document.getElementById('dash-total-mmr');
  const forecastMmrBar = document.getElementById('forecast-mmr-bar');
  const forecastMmrVal = document.getElementById('forecast-mmr-val');
  const forecastOutstandingBar = document.getElementById('forecast-outstanding-bar');
  const forecastOutstandingVal = document.getElementById('forecast-outstanding-val');

  // Sales Pipeline Selectors
  const btnTogglePipelineList = document.getElementById('btn-toggle-pipeline-list');
  const btnTogglePipelineKanban = document.getElementById('btn-toggle-pipeline-kanban');
  const pipelineListContainer = document.getElementById('pipeline-list-container');
  const pipelineKanbanContainer = document.getElementById('pipeline-kanban-container');
  const salesSearchInput = document.getElementById('sales-search-input');
  const salesTableBody = document.getElementById('sales-table-body');
  
  // Add Lead Form Selectors
  const btnAddLeadToggle = document.getElementById('btn-add-lead-toggle');
  const addLeadDrawer = document.getElementById('add-lead-drawer');
  const newLeadForm = document.getElementById('new-lead-form');
  const btnCancelLead = document.getElementById('btn-cancel-lead');

  // Clients & Tickets Selectors
  const clientsTableBody = document.getElementById('clients-table-body');
  const btnAddTicketToggle = document.getElementById('btn-add-ticket-toggle');
  const ticketAdderBox = document.getElementById('ticket-adder-box');
  const ticketClientSelect = document.getElementById('ticket-client-select');
  const ticketTitleInput = document.getElementById('ticket-title-input');
  const btnSubmitTicket = document.getElementById('btn-submit-ticket');
  const ticketsListContainer = document.getElementById('tickets-list-container');

  // Invoices Selectors
  const btnAddInvoice = document.getElementById('btn-add-invoice');
  const invoiceBuilderBox = document.getElementById('invoice-builder-box');
  const invoiceForm = document.getElementById('invoice-form');
  const invClientSelect = document.getElementById('inv-client-select');
  const invAmount = document.getElementById('inv-amount');
  const invType = document.getElementById('inv-type');
  const financeInvoicesTbody = document.getElementById('finance-invoices-tbody');

  // Today's Task Checklist Selectors
  const taskInput = document.getElementById('task-input');
  const btnAddTask = document.getElementById('btn-add-task');
  const taskListContainer = document.getElementById('task-list');

  // AI Assistant Selectors
  const aiChatLogs = document.getElementById('ai-chat-logs');
  const aiChatInput = document.getElementById('ai-chat-input');
  const btnSubmitAiChat = document.getElementById('btn-submit-ai-chat');
  const btnAiPrompts = document.querySelectorAll('.btn-ai-prompt');

  // Admin & Security Selectors
  const btnSettingsBackup = document.getElementById('btn-settings-backup');
  const btnSettingsReset = document.getElementById('btn-settings-reset');
  const settingsLogsContainer = document.getElementById('settings-logs-container');

  // Pipeline Modals
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalBtnClose = document.getElementById('modal-btn-close');
  const modalBtnSave = document.getElementById('modal-btn-save');
  const modalStatusSelect = document.getElementById('modal-status-select');
  const modalNotesArea = document.getElementById('modal-notes-area');

  // Deep-linked Comms Modals
  const modalCommsOverlay = document.getElementById('modal-comms-overlay');
  const modalCommsClose = document.getElementById('modal-comms-close');
  const modalCommsCancel = document.getElementById('modal-comms-cancel');
  const modalCommsSend = document.getElementById('modal-comms-send');
  const commsChannel = document.getElementById('comms-channel');
  const commsTemplate = document.getElementById('comms-template');
  const commsSubject = document.getElementById('comms-subject');
  const commsBody = document.getElementById('comms-body');
  const emailSubjectGroup = document.getElementById('email-subject-group');

  // --------------------------------------------------------------------------
  // Core Databases & Seeders (India Localized ₹ INR)
  // --------------------------------------------------------------------------
  let leads = [];
  let tickets = [];
  let invoices = [];
  let tasks = [];
  let sessionLogs = [];
  let userRole = 'admin';

  const SEED_LEADS = [
    { id: 1723000001, name: 'Liam O\'Connor', email: 'liam@apexretail.com', phone: '+919876543210', company: 'Apex Retail Group', service: 'SEO Strategy', date: '2026-08-01', status: 'Won', val: 35000, probability: 100, source: 'Website Form', delivery: { onboarding: 'Kickoff Call', payment: 'Deposit Paid', content: 'In Progress', kickoffDate: '8/12/2026', lastUpdated: '2026-08-09' } },
    { id: 1723000002, name: 'Sophia Martinez', email: 'sophia@luxeaesthetics.co', phone: '+919876543211', company: 'Luxe Aesthetics Clinic', service: 'PPC campaigns', date: '2026-08-03', status: 'Proposal Sent', val: 20000, probability: 75, source: 'Instagram/Facebook', delivery: { onboarding: 'Pending Access', payment: 'Invoice Sent', content: 'Not Started', lastUpdated: '2026-08-03' } },
    { id: 1723000003, name: 'Jackson Wright', email: 'j.wright@horizontech.io', phone: '+919876543212', company: 'Horizon Tech Solutions', service: 'Conversion Optimization (CRO)', date: '2026-08-05', status: 'Audit Scheduled', val: 50000, probability: 50, source: 'LinkedIn', delivery: { onboarding: 'Pending Access', payment: 'Invoice Sent', content: 'Not Started', lastUpdated: '2026-08-05' } },
    { id: 1723000004, name: 'Ava Chen', email: 'ava@blossoms.com', phone: '+919876543213', company: 'Blossom Floral Boutique', service: 'SEO Strategy', date: '2026-08-06', status: 'Contacted', val: 15000, probability: 25, source: 'Google Ads', delivery: { onboarding: 'Pending Access', payment: 'Invoice Sent', content: 'Not Started', lastUpdated: '2026-08-06' } },
    { id: 1723000005, name: 'Lucas Miller', email: 'lucas@millerlogistics.com', phone: '+919876543214', company: 'Miller Logistics', service: 'PPC campaigns', date: '2026-08-08', status: 'New', val: 30000, probability: 10, source: 'Website Form', delivery: { onboarding: 'Pending Access', payment: 'Invoice Sent', content: 'Not Started', lastUpdated: '2026-08-08' } }
  ];

  const SEED_TICKETS = [
    { id: 1042, clientName: 'Apex Retail Group', title: 'Need promotional posters for Independence Day', status: 'Assigned' }
  ];

  const SEED_FINANCE = [
    { id: 'INV-0801', clientName: 'Apex Retail Group', amount: 17500, type: 'Deposit Advance (50%)', status: 'Fully Paid', date: '2026-08-01' },
    { id: 'INV-0802', clientName: 'Luxe Aesthetics Clinic', amount: 10000, type: 'Deposit Advance (50%)', status: 'Invoice Sent', date: '2026-08-03' }
  ];

  const SEED_TASKS = [
    { id: 1, text: 'Confirm kickoff date with Apex Retail', completed: false },
    { id: 2, text: 'Create draft proposals for Luxe Aesthetics', completed: true }
  ];

  // --------------------------------------------------------------------------
  // Core Local Storage Controllers
  // --------------------------------------------------------------------------
  const loadDatabase = () => {
    leads = JSON.parse(localStorage.getItem('gb_crm_leads')) || SEED_LEADS;
    tickets = JSON.parse(localStorage.getItem('gb_crm_tickets')) || SEED_TICKETS;
    invoices = JSON.parse(localStorage.getItem('gb_crm_finance')) || SEED_FINANCE;
    tasks = JSON.parse(localStorage.getItem('gb_crm_tasks')) || SEED_TASKS;
    sessionLogs = JSON.parse(localStorage.getItem('gb_crm_logs')) || [
      { timestamp: new Date().toLocaleString(), detail: 'Authorized connection via access code beacon2026', role: 'admin' }
    ];
    userRole = localStorage.getItem('gb_crm_active_role') || 'admin';
    saveDatabase();
  };

  const saveDatabase = () => {
    localStorage.setItem('gb_crm_leads', JSON.stringify(leads));
    localStorage.setItem('gb_crm_tickets', JSON.stringify(tickets));
    localStorage.setItem('gb_crm_finance', JSON.stringify(invoices));
    localStorage.setItem('gb_crm_tasks', JSON.stringify(tasks));
    localStorage.setItem('gb_crm_logs', JSON.stringify(sessionLogs));
    localStorage.setItem('gb_crm_active_role', userRole);
  };

  const logAction = (detail) => {
    sessionLogs.unshift({ timestamp: new Date().toLocaleString(), detail, role: userRole });
    saveDatabase();
    renderSecurityLogs();
  };

  // --------------------------------------------------------------------------
  // Authorization Verification
  // --------------------------------------------------------------------------
  const checkAuth = () => {
    const isAuth = sessionStorage.getItem('gb_crm_authenticated') === 'true';
    if (isAuth) {
      loginSection.style.display = 'none';
      crmLayout.style.display = 'flex';
      loadDatabase();
      applyRBACSettings();
      renderExecutiveDashboard();
    } else {
      loginSection.style.display = 'flex';
      crmLayout.style.display = 'none';
    }
  };

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === ACCESS_PASSWORD) {
      sessionStorage.setItem('gb_crm_authenticated', 'true');
      loginSection.style.display = 'none';
      crmLayout.style.display = 'flex';
      loadDatabase();
      applyRBACSettings();
      renderExecutiveDashboard();
    } else {
      loginError.textContent = 'Invalid authorization code.';
      loginError.style.display = 'block';
      setTimeout(() => { loginError.style.display = 'none'; }, 2000);
    }
  });

  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('gb_crm_authenticated');
    checkAuth();
  });

  // --------------------------------------------------------------------------
  // Role-Based Access Control (RBAC) Engine
  // --------------------------------------------------------------------------
  const applyRBACSettings = () => {
    roleBadge.textContent = userRole.replace('_', ' ');
    
    // Update role switches state
    roleSwitchButtons.forEach(btn => {
      if (btn.getAttribute('data-role') === userRole) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  roleSwitchButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selected = e.currentTarget.getAttribute('data-role');
      userRole = selected;
      logAction(`Modified active session permission scope to ${selected.toUpperCase()}`);
      applyRBACSettings();
    });
  });

  // --------------------------------------------------------------------------
  // Navigation & Tab Switching Controllers
  // --------------------------------------------------------------------------
  const switchTab = (tabId) => {
    sidebarLinks.forEach(link => {
      if (link.id === tabId) link.classList.add('active');
      else link.classList.remove('active');
    });

    // Hide all panels
    sections.forEach(sec => sec.classList.remove('active'));

    // Resolve Target panel and title texts
    let targetSectionId = 'section-dashboard';
    let title = 'Executive Command Center';
    let sub = 'Growth Beacon Agency Metrics & Operations Overview.';

    switch (tabId) {
      case 'nav-dashboard':
        targetSectionId = 'section-dashboard';
        renderExecutiveDashboard();
        break;
      case 'nav-sales':
        targetSectionId = 'section-sales';
        title = 'Sales Pipeline';
        sub = 'Manage prospects, track deals status, and add incoming project leads.';
        renderSalesSection();
        break;
      case 'nav-clients':
        targetSectionId = 'section-clients';
        title = 'Client Workspaces & Invoicing';
        sub = 'Track client document briefings checklist, GST invoices, and support tickets.';
        renderClientsSection();
        break;
      case 'nav-ai':
        targetSectionId = 'section-ai';
        title = 'Local AI Assistant';
        sub = 'Quick query assistant to analyze accounts and draft campaign summaries.';
        break;
      case 'nav-settings':
        targetSectionId = 'section-settings';
        title = 'System Configuration';
        sub = 'Session actions log, permission switches, and database resets.';
        renderSecurityLogs();
        break;
    }

    document.getElementById(targetSectionId).classList.add('active');
    panelTitleText.textContent = title;
    panelSubtitleText.textContent = sub;
  };

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (e.currentTarget.id === 'btn-logout') return;
      switchTab(e.currentTarget.id);
    });
  });

  // --------------------------------------------------------------------------
  // Tab 1: Executive Dashboard Command Center Calculations
  // --------------------------------------------------------------------------
  const renderExecutiveDashboard = () => {
    const totalCount = leads.length;
    const wonCount = leads.filter(l => l.status === 'Won').length;
    const closeRate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;
    
    // Sum active Won values
    let mmrSum = 0;
    leads.forEach(l => {
      if (l.status === 'Won') mmrSum += (l.val || 30000);
    });

    dashTotalLeads.textContent = totalCount;
    dashConversionRate.textContent = `${closeRate}%`;
    dashActiveClients.textContent = wonCount;
    dashTotalMmr.textContent = `₹${mmrSum.toLocaleString('en-IN')}`;

    // Update Forecast Cards Bars
    let totalOutstanding = 0;
    invoices.forEach(inv => {
      if (inv.status !== 'Fully Paid') totalOutstanding += inv.amount;
    });

    forecastMmrVal.textContent = `₹${mmrSum.toLocaleString('en-IN')}`;
    forecastOutstandingVal.textContent = `₹${totalOutstanding.toLocaleString('en-IN')}`;

    const maxVal = Math.max(mmrSum, totalOutstanding, 1);
    forecastMmrBar.style.width = `${(mmrSum / maxVal) * 100}%`;
    forecastOutstandingBar.style.width = `${(totalOutstanding / maxVal) * 100}%`;

    // Render Today's Checklist
    renderChecklist();
  };

  const renderChecklist = () => {
    taskListContainer.innerHTML = '';
    if (tasks.length === 0) {
      taskListContainer.innerHTML = `<li style="font-size:0.85rem; color:var(--color-text-muted); text-align:center;">All tasks completed!</li>`;
      return;
    }

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
        <span class="task-text">${task.text}</span>
        <button class="btn-task-delete" data-id="${task.id}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      `;

      // Checkbox Change handler
      li.querySelector('.task-checkbox').addEventListener('change', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
          tasks[idx].completed = e.currentTarget.checked;
          saveDatabase();
          renderChecklist();
        }
      });

      // Delete task handler
      li.querySelector('.btn-task-delete').addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        tasks = tasks.filter(t => t.id !== id);
        saveDatabase();
        renderChecklist();
      });

      taskListContainer.appendChild(li);
    });
  };

  btnAddTask.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (!text) return;
    tasks.push({ id: Date.now(), text, completed: false });
    saveDatabase();
    taskInput.value = '';
    renderChecklist();
  });

  // --------------------------------------------------------------------------
  // Tab 2: Sales Pipeline
  // --------------------------------------------------------------------------
  let salesActiveView = 'table';

  const renderSalesSection = () => {
    if (salesActiveView === 'table') {
      pipelineListContainer.style.display = 'block';
      pipelineKanbanContainer.style.display = 'none';
      renderSalesTable();
    } else {
      pipelineListContainer.style.display = 'none';
      pipelineKanbanContainer.style.display = 'block';
      renderSalesKanban();
    }
  };

  const getFilteredLeads = () => {
    const query = salesSearchInput.value.toLowerCase();
    return leads.filter(l => {
      return l.name.toLowerCase().includes(query) || 
             l.company.toLowerCase().includes(query) || 
             l.email.toLowerCase().includes(query);
    });
  };

  const renderSalesTable = () => {
    salesTableBody.innerHTML = '';
    const filtered = getFilteredLeads();

    if (filtered.length === 0) {
      salesTableBody.innerHTML = `<tr><td colspan="7" class="empty-state"><p>No pipeline leads found.</p></td></tr>`;
      return;
    }

    filtered.forEach(l => {
      const row = document.createElement('tr');
      let statusClass = 'status-new';
      if (l.status === 'Contacted') statusClass = 'status-contacted';
      if (l.status === 'Audit Scheduled') statusClass = 'status-new';
      if (l.status === 'Proposal Sent') statusClass = 'status-proposal';
      if (l.status === 'Won') statusClass = 'status-won';

      row.innerHTML = `
        <td style="font-weight: 600; color: var(--color-white);">${l.name}</td>
        <td>${l.company}</td>
        <td style="font-size:0.8rem; color: var(--color-text-muted);">${l.email}<br>${l.phone}</td>
        <td style="font-weight: 500;">${l.service} (₹${(l.val || 30000).toLocaleString('en-IN')})</td>
        <td style="font-size:0.85rem;">${l.date}</td>
        <td><span class="status-badge ${statusClass}">${l.status}</span></td>
        <td>
          <button class="btn-action btn-edit-lead" data-id="${l.id}">✏️ Update</button>
        </td>
      `;
      salesTableBody.appendChild(row);
    });

    document.querySelectorAll('.btn-edit-lead').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        openDetailsModal(id);
      });
    });
  };

  const renderSalesKanban = () => {
    const stacks = {
      'New': document.getElementById('stack-new'),
      'Contacted': document.getElementById('stack-contacted'),
      'Audit Scheduled': document.getElementById('stack-audit'),
      'Proposal Sent': document.getElementById('stack-proposal'),
      'Won': document.getElementById('stack-won')
    };

    // Reset stacks
    Object.values(stacks).forEach(st => st.innerHTML = '');

    leads.forEach(l => {
      const stack = stacks[l.status];
      if (!stack) return;

      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-id', l.id);
      
      card.innerHTML = `
        <div class="kanban-card-title">${l.name}</div>
        <div class="kanban-card-company">${l.company}</div>
        <div class="kanban-card-footer">
          <span class="kanban-card-value">₹${(l.val || 30000).toLocaleString('en-IN')}</span>
          <span class="kanban-card-probability">${l.probability || 10}% Win</span>
        </div>
      `;

      // Drag Event Listeners
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', l.id);
        card.style.opacity = '0.5';
      });

      card.addEventListener('dragend', () => {
        card.style.opacity = '1';
      });

      stack.appendChild(card);
    });

    // Update column counters
    document.getElementById('count-kanban-new').textContent = leads.filter(l => l.status === 'New').length;
    document.getElementById('count-kanban-contacted').textContent = leads.filter(l => l.status === 'Contacted').length;
    document.getElementById('count-kanban-audit').textContent = leads.filter(l => l.status === 'Audit Scheduled').length;
    document.getElementById('count-kanban-proposal').textContent = leads.filter(l => l.status === 'Proposal Sent').length;
    document.getElementById('count-kanban-won').textContent = leads.filter(l => l.status === 'Won').length;

    // Dragover & Drop zones Setup
    document.querySelectorAll('.kanban-column').forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.style.background = 'rgba(0, 240, 255, 0.05)';
      });

      col.addEventListener('dragleave', () => {
        col.style.background = 'rgba(7, 11, 25, 0.4)';
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.style.background = 'rgba(7, 11, 25, 0.4)';
        const id = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const nextStatus = col.getAttribute('data-status');
        
        const leadIdx = leads.findIndex(x => x.id === id);
        if (leadIdx !== -1 && leads[leadIdx].status !== nextStatus) {
          const oldStatus = leads[leadIdx].status;
          leads[leadIdx].status = nextStatus;
          
          if (nextStatus === 'Won') {
            leads[leadIdx].probability = 100;
            if (!leads[leadIdx].delivery) {
              leads[leadIdx].delivery = {
                onboarding: 'Pending Access',
                payment: 'Invoice Sent',
                content: 'Not Started',
                lastUpdated: new Date().toLocaleDateString()
              };
            }
          }

          saveDatabase();
          logAction(`Kanban drag: ${leads[leadIdx].name} moved to ${nextStatus}`);
          renderSalesKanban();
        }
      });
    });
  };

  btnTogglePipelineList.addEventListener('click', () => {
    salesActiveView = 'table';
    btnTogglePipelineList.classList.add('active');
    btnTogglePipelineList.classList.remove('btn-secondary');
    btnTogglePipelineKanban.classList.add('btn-secondary');
    btnTogglePipelineKanban.classList.remove('active');
    renderSalesSection();
  });

  btnTogglePipelineKanban.addEventListener('click', () => {
    salesActiveView = 'kanban';
    btnTogglePipelineKanban.classList.add('active');
    btnTogglePipelineKanban.classList.remove('btn-secondary');
    btnTogglePipelineList.classList.add('btn-secondary');
    btnTogglePipelineList.classList.remove('active');
    renderSalesSection();
  });

  salesSearchInput.addEventListener('input', renderSalesSection);

  // Manual Lead Form Drawer toggle
  btnAddLeadToggle.addEventListener('click', () => {
    const isShowing = addLeadDrawer.style.display === 'block';
    addLeadDrawer.style.display = isShowing ? 'none' : 'block';
  });

  btnCancelLead.addEventListener('click', () => {
    addLeadDrawer.style.display = 'none';
  });

  newLeadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('lead-name').value;
    const company = document.getElementById('lead-company').value;
    const email = document.getElementById('lead-email').value;
    const phone = document.getElementById('lead-phone').value;
    const service = document.getElementById('lead-service').value;
    const status = document.getElementById('lead-status').value;

    let val = 20000;
    if (service.includes('PPC')) val = 35000;
    if (service.includes('SEO')) val = 50000;

    const newLead = {
      id: Date.now(),
      name,
      company,
      email,
      phone,
      service,
      status,
      val,
      probability: status === 'Won' ? 100 : 10,
      date: new Date().toLocaleDateString(),
      delivery: status === 'Won' ? { onboarding: 'Pending Access', payment: 'Invoice Sent', content: 'Not Started', lastUpdated: new Date().toLocaleDateString() } : null
    };

    leads.push(newLead);
    saveDatabase();
    logAction(`Logged new lead for ${name} (${company})`);

    newLeadForm.reset();
    addLeadDrawer.style.display = 'none';
    renderSalesSection();
  });

  // --------------------------------------------------------------------------
  // Tab 3: Clients Workspace, Invoicing, support tickets
  // --------------------------------------------------------------------------
  const renderClientsSection = () => {
    clientsTableBody.innerHTML = '';
    const activeClients = leads.filter(l => l.status === 'Won');

    if (activeClients.length === 0) {
      clientsTableBody.innerHTML = `<tr><td colspan="7" class="empty-state"><p>No active clients found. Move a lead to 'Won' to see them here.</p></td></tr>`;
      return;
    }

    activeClients.forEach(c => {
      if (!c.delivery) {
        c.delivery = { onboarding: 'Pending Access', payment: 'Invoice Sent', content: 'Not Started', lastUpdated: new Date().toLocaleDateString() };
      }

      const portalUrl = `${window.location.origin}${window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))}/client.html?id=${c.id}`;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="td-client">
          <div>${c.name}</div>
          <span style="font-size:0.75rem; color: var(--color-text-muted);">${c.company}</span>
        </td>
        <td style="font-weight: 700; color: var(--color-white);">₹${(c.val || 30000).toLocaleString('en-IN')}/mo</td>
        <td>
          <select class="select-filter delivery-select-onboard" data-id="${c.id}" style="padding: 6px 10px; font-size: 0.85rem;">
            <option value="Pending Access" ${c.delivery.onboarding === 'Pending Access' ? 'selected' : ''}>Pending Access</option>
            <option value="Kickoff Call" ${c.delivery.onboarding === 'Kickoff Call' ? 'selected' : ''}>Kickoff Call</option>
            <option value="Strategy Approved" ${c.delivery.onboarding === 'Strategy Approved' ? 'selected' : ''}>Strategy Approved</option>
          </select>
        </td>
        <td>
          <select class="select-filter delivery-select-pay" data-id="${c.id}" style="padding: 6px 10px; font-size: 0.85rem;">
            <option value="Invoice Sent" ${c.delivery.payment === 'Invoice Sent' ? 'selected' : ''}>Invoice Sent</option>
            <option value="Deposit Paid" ${c.delivery.payment === 'Deposit Paid' ? 'selected' : ''}>Deposit Paid</option>
            <option value="Fully Paid" ${c.delivery.payment === 'Fully Paid' ? 'selected' : ''}>Fully Paid</option>
          </select>
        </td>
        <td style="font-size:0.85rem; color: var(--color-text-muted);">${c.delivery.lastUpdated}</td>
        <td>
          <button class="btn-secondary btn-copy-workspace" data-url="${portalUrl}" style="padding: 6px 12px; font-size: 0.75rem; border-radius: 12px;">Copy Link</button>
        </td>
        <td>
          <button class="btn-action btn-comms-trigger" data-id="${c.id}">✉️ Comms</button>
        </td>
      `;
      clientsTableBody.appendChild(row);
    });

    // Save Dropdowns state changes
    document.querySelectorAll('.delivery-select-onboard').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        const idx = leads.findIndex(l => l.id === id);
        if (idx !== -1) {
          leads[idx].delivery.onboarding = e.currentTarget.value;
          leads[idx].delivery.lastUpdated = new Date().toLocaleDateString();
          saveDatabase();
          renderClientsSection();
        }
      });
    });

    document.querySelectorAll('.delivery-select-pay').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        const idx = leads.findIndex(l => l.id === id);
        if (idx !== -1) {
          leads[idx].delivery.payment = e.currentTarget.value;
          leads[idx].delivery.lastUpdated = new Date().toLocaleDateString();
          saveDatabase();
          renderClientsSection();
        }
      });
    });

    // Copy portal link
    document.querySelectorAll('.btn-copy-workspace').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const url = e.currentTarget.getAttribute('data-url');
        navigator.clipboard.writeText(url).then(() => {
          const orig = e.currentTarget.textContent;
          e.currentTarget.textContent = 'Copied!';
          setTimeout(() => { e.currentTarget.textContent = orig; }, 1200);
        });
      });
    });

    document.querySelectorAll('.btn-comms-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        openCommsModal(id);
      });
    });

    renderFinanceAndTickets();
  };

  const renderFinanceAndTickets = () => {
    // Populate client selector dropdowns
    invClientSelect.innerHTML = '';
    ticketClientSelect.innerHTML = '';
    const activeClients = leads.filter(l => l.status === 'Won');
    
    activeClients.forEach(c => {
      const opt1 = document.createElement('option');
      opt1.value = c.company;
      opt1.textContent = `${c.name} (${c.company})`;
      invClientSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = c.company;
      opt2.textContent = `${c.name} (${c.company})`;
      ticketClientSelect.appendChild(opt2);
    });

    // Render Invoices
    financeInvoicesTbody.innerHTML = '';
    invoices.forEach(inv => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-family: monospace; color: var(--cyan-glow);">${inv.id}</td>
        <td style="font-weight:600; color:var(--color-white);">${inv.clientName}</td>
        <td>₹${inv.amount.toLocaleString('en-IN')}</td>
        <td style="font-size:0.8rem;">${inv.type}</td>
        <td><span class="status-badge ${inv.status === 'Fully Paid' ? 'status-won' : 'status-proposal'}">${inv.status}</span></td>
      `;
      financeInvoicesTbody.appendChild(row);
    });

    // Render Tickets
    ticketsListContainer.innerHTML = '';
    if (tickets.length === 0) {
      ticketsListContainer.innerHTML = `<li style="font-size:0.85rem; color:var(--color-text-muted); text-align:center;">All clear! No pending support tickets.</li>`;
      return;
    }

    tickets.forEach(tk => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.innerHTML = `
        <div class="task-text">
          <strong>#${tk.id}</strong>: ${tk.title}
          <div style="font-size:0.7rem; color:var(--color-text-muted); margin-top:2px;">Client: ${tk.clientName}</div>
        </div>
        <button class="btn-task-delete btn-resolve-ticket" data-id="${tk.id}" title="Resolve Ticket">✓</button>
      `;

      li.querySelector('.btn-resolve-ticket').addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        tickets = tickets.filter(t => t.id !== id);
        saveDatabase();
        renderFinanceAndTickets();
      });

      ticketsListContainer.appendChild(li);
    });
  };

  btnAddInvoice.addEventListener('click', () => {
    const isShowing = invoiceBuilderBox.style.display === 'block';
    invoiceBuilderBox.style.display = isShowing ? 'none' : 'block';
  });

  invoiceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const client = invClientSelect.value;
    const amount = parseFloat(invAmount.value);
    const type = invType.value;

    const newInvoice = {
      id: `INV-${Date.now().toString().substring(8)}`,
      clientName: client,
      amount,
      type,
      status: 'Invoice Sent',
      date: new Date().toLocaleDateString()
    };

    invoices.push(newInvoice);
    saveDatabase();
    invAmount.value = '';
    invoiceBuilderBox.style.display = 'none';
    renderFinanceAndTickets();
    renderExecutiveDashboard();
  });

  btnAddTicketToggle.addEventListener('click', () => {
    const isShowing = ticketAdderBox.style.display === 'block';
    ticketAdderBox.style.display = isShowing ? 'none' : 'block';
  });

  btnSubmitTicket.addEventListener('click', () => {
    const client = ticketClientSelect.value;
    const title = ticketTitleInput.value.trim();

    if (!client || !title) return;

    const newTicket = {
      id: 1000 + Math.floor(Math.random() * 9000),
      clientName: client,
      title,
      status: 'Assigned'
    };

    tickets.push(newTicket);
    saveDatabase();
    ticketTitleInput.value = '';
    ticketAdderBox.style.display = 'none';
    renderFinanceAndTickets();
  });

  // --------------------------------------------------------------------------
  // Tab 4: Local AI Assistant (AI Layer) Heuristics
  // --------------------------------------------------------------------------
  const runLocalAIEngine = (query) => {
    const outputLog = document.createElement('div');
    outputLog.className = 'ai-bubble-user';
    outputLog.innerHTML = `<strong>You:</strong> ${query}`;
    aiChatLogs.appendChild(outputLog);

    const replyLog = document.createElement('div');
    replyLog.className = 'ai-bubble-system';

    const normalized = query.toLowerCase();
    let replyText = '';

    if (normalized.includes('risk') || normalized.includes('churn')) {
      const activeWon = leads.filter(l => l.status === 'Won');
      let flagged = [];
      activeWon.forEach(c => {
        if (c.delivery?.payment === 'Invoice Sent') {
          flagged.push({ name: c.name, comp: c.company, reason: 'Pending GST invoice payment (Warning 🟡)' });
        }
      });

      if (flagged.length === 0) {
        replyText = `<strong>AI Assistant:</strong> All active Indian client accounts are healthy (🟢). No outstanding payment delays detected.`;
      } else {
        replyText = `<strong>AI Assistant - Accounts Warning Alert:</strong><br><br>`;
        flagged.forEach(f => {
          replyText += `• <strong>${f.name} (${f.comp})</strong>: ${f.reason}<br>`;
        });
      }
    } else if (normalized.includes('seo') || normalized.includes('keyword')) {
      replyText = `<strong>AI Assistant - Local India SEO Target Keywords:</strong><br><br>
        1. <strong>"best seo services in bangalore"</strong> (Volume: 8,500/mo)<br>
        2. <strong>"performance marketing agency mumbai"</strong> (Volume: 5,400/mo)<br>
        3. <strong>"cro strategy blueprints india"</strong> (Volume: 1,200/mo)`;
    } else if (normalized.includes('caption') || normalized.includes('insta')) {
      replyText = `<strong>AI Assistant - Instagram Brand growth caption brief:</strong><br><br>
        <em>"Stop burning ad budget on low-converting pages. 📉 At Growth Beacon, we optimize sales conversions and target direct marketing scale for Indian businesses. Secure your audit slot today! 🚀 #cro #marketingblueprint #indiafounders"</em>`;
    } else if (normalized.includes('predict') || normalized.includes('probability')) {
      const activeDeals = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost');
      replyText = `<strong>AI Assistant - Conversion Probability Forecast:</strong><br><br>`;
      activeDeals.forEach(d => {
        let prob = 20;
        if (d.source === 'Website Form') prob += 15;
        if (d.val > 30000) prob += 10;
        replyText += `• <strong>${d.name} (${d.company})</strong>: win probability score is <strong>${prob + (d.probability || 10)}%</strong><br>`;
      });
    } else {
      replyText = `<strong>AI Assistant:</strong> Vanakkam! How can I help you manage your agency? Type keywords like <em>"risk"</em>, <em>"seo"</em>, <em>"caption"</em>, or <em>"predict"</em> to generate reports.`;
    }

    replyLog.innerHTML = replyText;
    aiChatLogs.appendChild(replyLog);
    aiChatLogs.scrollTop = aiChatLogs.scrollHeight;
  };

  btnSubmitAiChat.addEventListener('click', () => {
    const val = aiChatInput.value.trim();
    if (!val) return;
    runLocalAIEngine(val);
    aiChatInput.value = '';
  });

  btnAiPrompts.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const promptText = e.currentTarget.getAttribute('data-prompt');
      runLocalAIEngine(promptText);
    });
  });

  // --------------------------------------------------------------------------
  // Tab 5: Admin settings, Backups, Reset controls
  // --------------------------------------------------------------------------
  const renderSecurityLogs = () => {
    settingsLogsContainer.innerHTML = '';
    sessionLogs.slice(0, 10).forEach(log => {
      const li = document.createElement('li');
      li.style.background = 'rgba(255,255,255,0.02)';
      li.style.border = '1px solid var(--border-color)';
      li.style.borderRadius = '8px';
      li.style.padding = '8px 12px';
      li.style.fontSize = '0.8rem';
      li.innerHTML = `
        <span style="color:var(--cyan-glow); font-family: monospace;">[${log.timestamp}]</span>: ${log.detail}
      `;
      settingsLogsContainer.appendChild(li);
    });
  };

  btnSettingsBackup.addEventListener('click', () => {
    const dbExport = { leads, tickets, invoices, tasks, sessionLogs };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbExport));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "growth_beacon_crm_backup.json");
    dlAnchorElem.click();
    logAction('Downloaded CRM system backup file.');
  });

  btnSettingsReset.addEventListener('click', () => {
    if (confirm('Reset all CRM databases? This will clear local storage.')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  });

  // --------------------------------------------------------------------------
  // Modals & Detail Editors
  // --------------------------------------------------------------------------
  let activeDetailsId = null;

  const openDetailsModal = (id) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    activeDetailsId = id;
    document.getElementById('modal-info-name').textContent = lead.name;
    document.getElementById('modal-info-email').textContent = lead.email;
    document.getElementById('modal-info-company').textContent = lead.company;
    document.getElementById('modal-info-service').textContent = lead.service;
    document.getElementById('modal-info-date').textContent = lead.date;
    
    modalStatusSelect.value = lead.status;
    modalNotesArea.value = lead.notes || '';

    modalOverlay.classList.add('active');
  };

  const closeDetailsModal = () => {
    modalOverlay.classList.remove('active');
    activeDetailsId = null;
  };

  modalClose.addEventListener('click', closeDetailsModal);
  modalBtnClose.addEventListener('click', closeDetailsModal);

  modalBtnSave.addEventListener('click', () => {
    const idx = leads.findIndex(l => l.id === activeDetailsId);
    if (idx !== -1) {
      leads[idx].status = modalStatusSelect.value;
      leads[idx].notes = modalNotesArea.value;
      
      if (modalStatusSelect.value === 'Won') {
        leads[idx].probability = 100;
        if (!leads[idx].delivery) {
          leads[idx].delivery = {
            onboarding: 'Pending Access',
            payment: 'Invoice Sent',
            content: 'Not Started',
            lastUpdated: new Date().toLocaleDateString()
          };
        }
      }

      saveDatabase();
      logAction(`Pipeline updated for ${leads[idx].name}`);
      renderSalesSection();
      closeDetailsModal();
    }
  });

  // --------------------------------------------------------------------------
  // Milestone Communications Templating modal (India Localized +91)
  // --------------------------------------------------------------------------
  let activeCommsClientId = null;

  const openCommsModal = (id) => {
    const client = leads.find(l => l.id === id);
    if (!client) return;

    activeCommsClientId = id;
    commsChannel.value = 'whatsapp';
    commsTemplate.value = 'advance_payment';

    updateCommsTemplate();
    modalCommsOverlay.classList.add('active');
  };

  const closeCommsModal = () => {
    modalCommsOverlay.classList.remove('active');
    activeCommsClientId = null;
  };

  const updateCommsTemplate = () => {
    const client = leads.find(l => l.id === activeCommsClientId);
    if (!client) return;

    const channel = commsChannel.value;
    const template = commsTemplate.value;
    const value = client.val || 30000;
    const halfValue = value / 2;

    let subject = '';
    let body = '';

    if (channel === 'email') {
      emailSubjectGroup.style.display = 'block';
      if (template === 'advance_payment') {
        subject = `Inbound Kickoff: 50% Advance Payment Setup — ${client.company}`;
        body = `Hi ${client.name},\n\nHope you're doing great! We're excited to partner with ${client.company} on your upcoming campaign.\n\nTo lock in your calendar slot for the onboarding kickoff, please settle the 50% advance setup invoice (₹${halfValue.toLocaleString('en-IN')}) via the secure billing page: http://localhost:8000/client.html?id=${client.id}\n\nLet us know once settled so we can finalize coordinates!\n\nBest regards,\nPremkumar & Ram\nGrowth Beacon Team`;
      } else if (template === 'onboarding') {
        subject = `Welcome to Growth Beacon: Onboarding Workspace Portal — ${client.company}`;
        body = `Hi ${client.name},\n\nWelcome onboard! Your deposit payment has been confirmed.\n\nYour campaign workspace is now live! Please log in to complete your briefs and competitor lists: http://localhost:8000/client.html?id=${client.id}\n\nLet's get scaling!\n\nBest regards,\nPremkumar & Ram\nGrowth Beacon Team`;
      } else if (template === 'draft_delivery') {
        subject = `First Campaign Draft Assets ready for approval — ${client.company}`;
        body = `Hi ${client.name},\n\nWe have completed our draft strategizing for your service package.\n\nPlease log in to review the copywriting drafts here: http://localhost:8000/client.html?id=${client.id}\n\nLooking forward to your feedback!\n\nBest regards,\nPremkumar & Ram\nGrowth Beacon Team`;
      } else if (template === 'final_payment') {
        subject = `Project Milestone complete: Remaining 50% Invoice due — ${client.company}`;
        body = `Hi ${client.name},\n\nWe hope you liked the draft deliverables! As we proceed to launch campaigns live, the remaining 50% retainer balance (₹${halfValue.toLocaleString('en-IN')}) is now due.\n\nPlease confirm payment here: http://localhost:8000/client.html?id=${client.id}\n\nBest regards,\nPremkumar & Ram\nGrowth Beacon Team`;
      } else if (template === 'final_delivery') {
        subject = `Campaign Launch Confirmed: Project Final Delivery — ${client.company}`;
        body = `Hi ${client.name},\n\nAll payments are settled and campaign drafts are officially approved.\n\nYour deliverables are live! Check your reporting details here: http://localhost:8000/client.html?id=${client.id}\n\nThank you for choosing Growth Beacon!\n\nBest regards,\nPremkumar & Ram\nGrowth Beacon Team`;
      }
    } else {
      emailSubjectGroup.style.display = 'none';
      if (template === 'advance_payment') {
        body = `Hi ${client.name}, excited to start with ${client.company}! Please settle the 50% advance deposit (₹${halfValue.toLocaleString('en-IN')}) here to lock in your kickoff: http://localhost:8000/client.html?id=${client.id}`;
      } else if (template === 'onboarding') {
        body = `Hi ${client.name}, welcome to Growth Beacon! Access your secure workspace brief portal here to upload brand info: http://localhost:8000/client.html?id=${client.id}`;
      } else if (template === 'draft_delivery') {
        body = `Hi ${client.name}, draft marketing deliverables are ready! Review copywriting copy here: http://localhost:8000/client.html?id=${client.id}`;
      } else if (template === 'final_payment') {
        body = `Hi ${client.name}, remaining 50% retainer invoice (₹${halfValue.toLocaleString('en-IN')}) is now due before live launching: http://localhost:8000/client.html?id=${client.id}`;
      } else if (template === 'final_delivery') {
        body = `Hi ${client.name}, everything is live! Access your monthly organic SEO/PPC report files: http://localhost:8000/client.html?id=${client.id}`;
      }
    }

    commsSubject.value = subject;
    commsBody.value = body;
  };

  commsChannel.addEventListener('change', updateCommsTemplate);
  commsTemplate.addEventListener('change', updateCommsTemplate);
  modalCommsClose.addEventListener('click', closeCommsModal);
  modalCommsCancel.addEventListener('click', closeCommsModal);

  modalCommsSend.addEventListener('click', () => {
    const client = leads.find(l => l.id === activeCommsClientId);
    if (!client) return;

    const channel = commsChannel.value;
    const subject = commsSubject.value;
    const body = commsBody.value;

    if (channel === 'email') {
      const emailUrl = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(emailUrl, '_blank');
      logAction(`Sent email template (${commsTemplate.value}) to ${client.name}`);
    } else {
      const cleanPhone = client.phone.replace(/\D/g, '');
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(body)}`;
      window.open(waUrl, '_blank');
      logAction(`Sent WhatsApp template (${commsTemplate.value}) to ${client.name}`);
    }

    closeCommsModal();
  });

  // --------------------------------------------------------------------------
  // Simulated AI Agents Roster Trigger Event Handlers
  // --------------------------------------------------------------------------
  document.querySelectorAll('.btn-run-agent').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const agent = e.currentTarget.getAttribute('data-agent');
      const chatBubble = document.createElement('div');
      chatBubble.className = 'ai-bubble-system';
      
      if (agent === 'sdr') {
        const pendingLead = leads.find(l => l.status !== 'Won' && l.status !== 'Lost');
        if (pendingLead) {
          pendingLead.notes = `[AI SDR Audit - ${new Date().toLocaleDateString()}]: Automated crawl of ${pendingLead.company}'s website shows zero active Meta Pixel trackers and slow PageSpeed scores (FCP: 3.2s). Pre-qualified target for standard PPC campaign package. Win conversion probability set to 65%.`;
          pendingLead.probability = 65;
          saveDatabase();
          logAction(`AI SDR: Completed website audit report for ${pendingLead.name}`);
          
          document.getElementById('agent-sdr-log').innerHTML = `<span style="color:var(--status-won);">✓ Audited ${pendingLead.company}</span>`;
          chatBubble.innerHTML = `<strong>AI Sales SDR Agent:</strong> Successfully ran website audit on <strong>${pendingLead.name} (${pendingLead.company})</strong>. Updated lead notes and set win probability score to 65%.`;
          renderSalesSection();
        } else {
          chatBubble.innerHTML = `<strong>AI Sales SDR Agent:</strong> No pending lead records found to audit in the database.`;
        }
      } 
      else if (agent === 'am') {
        const pendingClient = leads.find(l => l.status === 'Won' && l.delivery?.onboarding === 'Pending Access');
        if (pendingClient) {
          pendingClient.delivery.onboarding = 'Kickoff Call';
          pendingClient.delivery.lastUpdated = new Date().toLocaleDateString();
          
          const newTicket = {
            id: 1000 + Math.floor(Math.random() * 9000),
            clientName: pendingClient.company,
            title: 'Verify GA4 tags and link Google Ads dashboard'
          };
          tickets.push(newTicket);
          saveDatabase();
          logAction(`AI Account Manager: Verified onboarding status for ${pendingClient.name}`);
          
          document.getElementById('agent-am-log').innerHTML = `<span style="color:var(--status-won);">✓ Scheduled kickoff for ${pendingClient.company}</span>`;
          chatBubble.innerHTML = `<strong>AI Account Manager Agent:</strong> Verified asset credentials for <strong>${pendingClient.name}</strong>. Automatically moved onboarding state to 'Kickoff Call' and created support ticket #${newTicket.id} to link GA4 dashboard.`;
          renderClientsSection();
        } else {
          chatBubble.innerHTML = `<strong>AI Account Manager Agent:</strong> Checked client databases. All won clients have already advanced past 'Pending Access'.`;
        }
      }
      else if (agent === 'seo') {
        const keywords = ['best digital marketing agency vellore', 'coimbatore exports seo strategy', 'madurai retail marketing plans'];
        const chosen = keywords[Math.floor(Math.random() * keywords.length)];
        
        chatBubble.innerHTML = `<strong>AI SEO Specialist Agent:</strong> Competitor SEO gap analysis complete for keyword: <em>"${chosen}"</em>. Search volume: 1,800/mo. Suggested blog title: <em>"How to scale your business in Tamil Nadu using local SEO blueprints"</em>. Draft queued.`;
        document.getElementById('agent-seo-log').innerHTML = `<span style="color:var(--status-won);">✓ Keyword researched: "${chosen}"</span>`;
        logAction(`AI SEO Specialist: Conducted keyword search audit for "${chosen}"`);
      }
      else if (agent === 'ads') {
        chatBubble.innerHTML = `<strong>AI Media Buyer Agent:</strong> Completed PPC campaign sweep. ROAS on Meta retargeting campaigns optimized to <strong>3.4x</strong>. Suggested adding a new video reel ad creative set to combat audience wear-out.`;
        document.getElementById('agent-ads-log').innerHTML = `<span style="color:var(--status-won);">✓ ROAS audit complete (ROAS: 3.4x)</span>`;
        logAction(`AI Media Buyer: Checked campaign ROAS metrics`);
      }
      else if (agent === 'bill') {
        const unpaid = invoices.find(inv => inv.status === 'Invoice Sent');
        if (unpaid) {
          const client = leads.find(l => l.company === unpaid.clientName);
          const reminderBody = `Hi ${client ? client.name : 'Client'}, this is a friendly reminder from the Growth Beacon accounts desk regarding outstanding invoice ${unpaid.id} (₹${unpaid.amount.toLocaleString('en-IN')}). Please settle here: http://localhost:8000/client.html?id=${client ? client.id : ''}`;
          
          chatBubble.innerHTML = `<strong>AI Accountant Agent:</strong> Found unpaid invoice <strong>${unpaid.id}</strong> for <strong>${unpaid.clientName}</strong>. Ready-to-send payment nudge drafted:<br><br><pre style="background:rgba(0,0,0,0.3); padding:8px; border-radius:6px; font-size:0.75rem; white-space:pre-wrap; font-family:inherit; color:#fff;">${reminderBody}</pre>`;
          document.getElementById('agent-bill-log').innerHTML = `<span style="color:var(--status-won);">✓ Drafted reminder for ${unpaid.clientName}</span>`;
          logAction(`AI Accountant: Created invoice payment follow-up template for ${unpaid.clientName}`);
        } else {
          chatBubble.innerHTML = `<strong>AI Accountant Agent:</strong> Checked invoice records. All logged invoices are currently marked 'Fully Paid'.`;
        }
      }
      else if (agent === 'pr') {
        chatBubble.innerHTML = `<strong>AI PR Reputation Agent:</strong> Audited Google Business Profile listings reviews. Detected a new 5-star review from a user on Apex Retail Group page. Automatically posted reply: <em>"Thank you for your valuable feedback! We look forward to serving you again."</em>. GMB score rating is <strong>4.8★</strong>.`;
        document.getElementById('agent-pr-log').innerHTML = `<span style="color:var(--status-won);">✓ Replied to new 5★ review (Rating: 4.8★)</span>`;
        logAction('AI PR Agent: Checked GMB map reviews and posted automated response');
      }
      else if (agent === 'report') {
        const totalRev = leads.filter(l => l.status === 'Won').reduce((sum, l) => sum + (l.val || 30000), 0);
        chatBubble.innerHTML = `<strong>AI Reporting Analyst Agent:</strong> Aggregated monthly digital services metrics. Generated PDF draft report summary:<br>
          • <strong>Total Retainer MRR:</strong> ₹${totalRev.toLocaleString('en-IN')}<br>
          • <strong>Average Lead Win-Rate:</strong> ${leads.length > 0 ? Math.round((leads.filter(l => l.status === 'Won').length / leads.length) * 100) : 0}%<br>
          • <strong>Resolved Support Tickets:</strong> 100% efficiency. Ready for email delivery.`;
        document.getElementById('agent-report-log').innerHTML = `<span style="color:var(--status-won);">✓ Summary report generated</span>`;
        logAction('AI Reporting Analyst: Prepared monthly operational review data metrics');
      }
      
      aiChatLogs.appendChild(chatBubble);
      aiChatLogs.scrollTop = aiChatLogs.scrollHeight;
    });
  });

  // Initial checks and loads
  checkAuth();
});
