/* ==========================================================================
   Growth Beacon CRM — Central Unified Data Engine & Reactive State Store
   ========================================================================== */

const DataService = (() => {

  const STORAGE_KEY = 'gb_crm_unified_store_v2';

  // Seed Default Database Store
  const SEED_DATA = {
    leads: [
      { id: 101, name: "Liam O'Connor", company: "Apex Retail Group", email: "liam@apexretail.com", phone: "+91 98765 43210", service: "SEO Strategy", source: "Website Form", val: 35000, priority: "High", owner: "Account Manager", status: "Won", date: "2026-08-01", nextAction: "Send Q3 Growth Report", notes: "Enterprise retail account in South Tamil Nadu." },
      { id: 102, name: "Sophia Martinez", company: "Luxe Aesthetics Clinic", email: "sophia@luxeaesthetics.co", phone: "+91 98765 43211", service: "PPC Ad Campaigns", source: "Instagram Ads", val: 25000, priority: "High", owner: "Performance Marketer", status: "Proposal", date: "2026-08-03", nextAction: "Follow up on deposit invoice", notes: "Requested immediate ad scaling." },
      { id: 103, name: "Jackson Wright", company: "Horizon Tech Solutions", email: "j.wright@horizontech.io", phone: "+91 98765 43212", service: "SEO & CRO Blueprint", source: "LinkedIn", val: 50000, priority: "Medium", owner: "SEO Specialist", status: "Audit", date: "2026-08-05", nextAction: "Conduct Technical Audit", notes: "SaaS technical lead audit." },
      { id: 104, name: "Anand Kumar", company: "South India Spices", email: "anand@southindiaspices.com", phone: "+91 98421 11223", service: "SMM & Branding Package", source: "Google Ads", val: 20000, priority: "Low", owner: "Content Writer", status: "Contacted", date: "2026-08-10", nextAction: "Send Quote", notes: "Local spice brand expansion." }
    ],
    clients: [
      { id: 201, company: "Apex Retail Group", contact: "Liam O'Connor", email: "liam@apexretail.com", phone: "+91 98765 43210", services: "SEO & CRO Overhaul", mrr: 35000, status: "Active", owner: "Account Manager", date: "2026-08-01" },
      { id: 202, company: "Theni Cardamom Exports", contact: "Rajesh K", email: "rajesh@cardamomapex.com", phone: "+91 94431 88990", services: "Full-Stack Performance", mrr: 65000, status: "Active", owner: "Performance Marketer", date: "2026-08-15" }
    ],
    projects: [
      { id: 301, clientId: 201, clientName: "Apex Retail Group", title: "Q3 E-commerce Organic SEO Overhaul", service: "SEO Strategy", owner: "SEO Specialist", startDate: "2026-08-10", deadline: "2026-11-10", budget: 105000, status: "Active", progress: 65, deliverables: "Monthly Technical Audit + Keyword Ranks" },
      { id: 302, clientId: 202, clientName: "Theni Cardamom Exports", title: "Global Export Lead Generation Engine", service: "PPC Ad Campaigns", owner: "Performance Marketer", startDate: "2026-08-15", deadline: "2026-09-30", budget: 65000, status: "Active", progress: 40, deliverables: "Meta Lead Ads + Landing Page" }
    ],
    tasks: [
      { id: 401, text: "Confirm kickoff date with Apex Retail", completed: false, dueDate: "2026-08-26", priority: "High", assignedTo: "Account Manager", clientName: "Apex Retail Group", projectId: 301 },
      { id: 402, text: "Create draft ad creative proposals for Luxe Aesthetics", completed: true, dueDate: "2026-08-24", priority: "Medium", assignedTo: "Performance Marketer", clientName: "Luxe Aesthetics Clinic", projectId: 302 },
      { id: 403, text: "Audit local GMB Google Maps ranking keywords", completed: false, dueDate: "2026-08-28", priority: "Normal", assignedTo: "SEO Specialist", clientName: "Theni Cardamom Exports", projectId: 302 }
    ],
    campaigns: [
      { id: 501, clientId: 202, clientName: "Theni Cardamom Exports", title: "Cardamom Global B2B Export Campaign", platform: "Meta Ads", objective: "Lead Generation", budget: 45000, startDate: "2026-08-15", endDate: "2026-09-15", owner: "Performance Marketer", status: "Active", kpis: "Target CPL < ₹450" },
      { id: 502, clientId: 201, clientName: "Apex Retail Group", title: "Festive Retail Google Shopping Ads", platform: "Google Ads", objective: "Sales", budget: 60000, startDate: "2026-08-20", endDate: "2026-10-20", owner: "SEO Specialist", status: "Planning", kpis: "Target ROAS 4.5x" }
    ],
    content: [
      { id: 601, title: "Independence Day Spice Sale Reel", clientName: "South India Spices", contentType: "Reel", platform: "Instagram", owner: "Graphic Designer", deadline: "2026-08-27", status: "Design", description: "15-sec promotional video showing spice harvesting." },
      { id: 602, title: "Cardamom Health Benefits Carousel", clientName: "Theni Cardamom Exports", contentType: "Carousel", platform: "LinkedIn", owner: "Content Writer", deadline: "2026-08-29", status: "Writing", description: "5-slide infographic for export buyers." }
    ],
    team: [
      { id: 701, name: "Admin User", email: "admin@growthbeacon.co.in", role: "Admin", department: "Executive", activeTasks: 4, status: "Active" },
      { id: 702, name: "Priya Sharma", email: "priya@growthbeacon.co.in", role: "Account Manager", department: "Client Success", activeTasks: 3, status: "Active" },
      { id: 703, name: "Karthik Raja", email: "karthik@growthbeacon.co.in", role: "Performance Marketer", department: "Media Buying", activeTasks: 5, status: "Active" },
      { id: 704, name: "Ananya Ramesh", email: "ananya@growthbeacon.co.in", role: "SEO Specialist", department: "Organic Growth", activeTasks: 2, status: "Active" }
    ],
    tickets: [
      { id: 801, clientName: "Apex Retail Group", title: "Promotional banners update for mobile app homepage", status: "Open", priority: "High" },
      { id: 802, clientName: "Theni Cardamom Exports", title: "Update GST invoice billing address details", status: "Resolved", priority: "Normal" }
    ],
    invoices: [
      { id: "INV-0801", clientId: 201, clientName: "Apex Retail Group", amount: 17500, cgst: 1575, sgst: 1575, total: 20650, paidAmount: 20650, balance: 0, type: "Deposit Advance (50%)", status: "Paid", issueDate: "2026-08-01", dueDate: "2026-08-05" },
      { id: "INV-0802", clientId: 202, clientName: "Theni Cardamom Exports", amount: 32500, cgst: 2925, sgst: 2925, total: 38350, paidAmount: 0, balance: 38350, type: "Deposit Advance (50%)", status: "Sent", issueDate: "2026-08-15", dueDate: "2026-08-25" }
    ],
    payments: [
      { id: "PAY-1001", invoiceId: "INV-0801", clientName: "Apex Retail Group", amount: 20650, date: "2026-08-04", method: "Bank Transfer (NEFT)", status: "Completed", notes: "Full advance payment settled." }
    ],
    expenses: [
      { id: 901, title: "Canva Pro & Adobe Creative Cloud Subscription", category: "Software", amount: 4500, date: "2026-08-02", vendor: "Adobe", status: "Paid" },
      { id: 902, title: "Ahrefs & SEMrush SEO Keyword Tracker Tools", category: "Software", amount: 12000, date: "2026-08-05", vendor: "Ahrefs", status: "Paid" }
    ],
    activities: [
      { id: 1, timestamp: "26 Aug 2026, 10:00 AM", type: "system", text: "Growth Beacon CRM Unified Store Initialized.", entityId: null }
    ],
    logs: []
  };

  // Get Store
  const getStore = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
        return SEED_DATA;
      }
      return JSON.parse(stored);
    } catch (e) {
      return SEED_DATA;
    }
  };

  // Save Store
  const saveStore = (store) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.error("Storage error:", e);
    }
  };

  // Generic Entity Methods
  const getCollection = (key) => getStore()[key] || [];
  const setCollection = (key, items) => {
    const store = getStore();
    store[key] = items;
    saveStore(store);
  };

  const addActivity = (type, text, entityId = null) => {
    const store = getStore();
    const act = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      type: type,
      text: text,
      entityId: entityId
    };
    store.activities = [act, ...(store.activities || [])];
    saveStore(store);
  };

  const addLog = (detail) => {
    const store = getStore();
    const currentUser = sessionStorage.getItem('gb_crm_user') ? JSON.parse(sessionStorage.getItem('gb_crm_user')) : { role: 'admin' };
    const log = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-IN'),
      detail: detail,
      role: currentUser.role || 'admin'
    };
    store.logs = [log, ...(store.logs || [])];
    saveStore(store);
  };

  const resetNamespace = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
  };

  // Async API Backend Sync
  const syncWithBackend = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const backendLeads = await res.json();
        if (backendLeads && backendLeads.length > 0) {
          const store = getStore();
          store.leads = backendLeads;
          saveStore(store);
        }
      }
    } catch (e) {
      // Offline fallback to localStorage
    }
  };

  // Auto sync on load
  syncWithBackend();

  return {
    getLeads: () => getCollection('leads'),
    saveLeads: (items) => setCollection('leads', items),
    getClients: () => getCollection('clients'),
    saveClients: (items) => setCollection('clients', items),
    getProjects: () => getCollection('projects'),
    saveProjects: (items) => setCollection('projects', items),
    getTasks: () => getCollection('tasks'),
    saveTasks: (items) => setCollection('tasks', items),
    getCampaigns: () => getCollection('campaigns'),
    saveCampaigns: (items) => setCollection('campaigns', items),
    getContent: () => getCollection('content'),
    saveContent: (items) => setCollection('content', items),
    getTeam: () => getCollection('team'),
    saveTeam: (items) => setCollection('team', items),
    getTickets: () => getCollection('tickets'),
    saveTickets: (items) => setCollection('tickets', items),
    getInvoices: () => getCollection('invoices'),
    saveInvoices: (items) => setCollection('invoices', items),
    getPayments: () => getCollection('payments'),
    savePayments: (items) => setCollection('payments', items),
    getExpenses: () => getCollection('expenses'),
    saveExpenses: (items) => setCollection('expenses', items),
    getActivities: () => getCollection('activities'),
    getLogs: () => getCollection('logs'),
    addActivity,
    addLog,
    resetNamespace
  };
})();
