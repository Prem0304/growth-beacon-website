// ==========================================================================
// Growth Beacon CRM — Authentication & RBAC Service (auth-service.js)
// ==========================================================================

const AuthService = (() => {

  const SESSION_KEY = 'gb_crm_session';
  const DEMO_MODE = true; // Toggle false in strict production to disable demo role switching

  const PERMISSION_MATRIX = {
    admin: {
      'leads.view': true, 'leads.create': true, 'leads.edit': true, 'leads.delete': true,
      'clients.view': true, 'clients.edit': true,
      'projects.view': true, 'projects.edit': true,
      'campaigns.view': true, 'campaigns.edit': true,
      'tasks.view': true, 'tasks.create': true, 'tasks.assign': true,
      'finance.view': true, 'finance.create': true, 'finance.edit': true,
      'reports.view': true, 'settings.view': true, 'users.manage': true
    },
    account_manager: {
      'leads.view': true, 'leads.create': true, 'leads.edit': true, 'leads.delete': false,
      'clients.view': true, 'clients.edit': true,
      'projects.view': true, 'projects.edit': true,
      'campaigns.view': true, 'campaigns.edit': false,
      'tasks.view': true, 'tasks.create': true, 'tasks.assign': true,
      'finance.view': true, 'finance.create': true, 'finance.edit': false,
      'reports.view': true, 'settings.view': false, 'users.manage': false
    },
    performance_marketer: {
      'leads.view': true, 'leads.create': true, 'leads.edit': true, 'leads.delete': false,
      'clients.view': true, 'clients.edit': false,
      'projects.view': true, 'projects.edit': true,
      'campaigns.view': true, 'campaigns.edit': true,
      'tasks.view': true, 'tasks.create': true, 'tasks.assign': true,
      'finance.view': false, 'finance.create': false, 'finance.edit': false,
      'reports.view': true, 'settings.view': false, 'users.manage': false
    },
    seo_specialist: {
      'leads.view': false, 'leads.create': false, 'leads.edit': false, 'leads.delete': false,
      'clients.view': true, 'clients.edit': false,
      'projects.view': true, 'projects.edit': true,
      'campaigns.view': true, 'campaigns.edit': true,
      'tasks.view': true, 'tasks.create': true, 'tasks.assign': false,
      'finance.view': false, 'finance.create': false, 'finance.edit': false,
      'reports.view': true, 'settings.view': false, 'users.manage': false
    },
    graphic_designer: {
      'leads.view': false, 'leads.create': false, 'leads.edit': false, 'leads.delete': false,
      'clients.view': true, 'clients.edit': false,
      'projects.view': true, 'projects.edit': false,
      'campaigns.view': false, 'campaigns.edit': false,
      'tasks.view': true, 'tasks.create': true, 'tasks.assign': false,
      'finance.view': false, 'finance.create': false, 'finance.edit': false,
      'reports.view': false, 'settings.view': false, 'users.manage': false
    },
    content_writer: {
      'leads.view': false, 'leads.create': false, 'leads.edit': false, 'leads.delete': false,
      'clients.view': true, 'clients.edit': false,
      'projects.view': true, 'projects.edit': false,
      'campaigns.view': false, 'campaigns.edit': false,
      'tasks.view': true, 'tasks.create': true, 'tasks.assign': false,
      'finance.view': false, 'finance.create': false, 'finance.edit': false,
      'reports.view': false, 'settings.view': false, 'users.manage': false
    }
  };

  const generateSaltedToken = async (email, pwd) => {
    try {
      const msgUint8 = new TextEncoder().encode(`${email}_${pwd}_gb_salt_2026`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return `gb_token_${Math.random().toString(36).substring(2)}${Date.now()}`;
    }
  };

  return {
    isDemoMode: () => DEMO_MODE,

    login: async (email, password) => {
      if (!email || !password) {
        throw new Error('Please enter valid user email and password credentials.');
      }

      const token = await generateSaltedToken(email, password);
      const userRole = localStorage.getItem('gb_crm_active_role') || 'admin';

      const userSession = {
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: userRole,
        token: token,
        authenticatedAt: new Date().toISOString()
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
      DataService.addLog(`User session authenticated for: ${email}`, userSession.name, userSession.role);
      return { success: true, user: userSession, token: token };
    },

    logout: () => {
      const current = AuthService.getCurrentUser();
      if (current) {
        DataService.addLog(`User session terminated (logout) for: ${current.email}`, current.name, current.role);
      }
      sessionStorage.removeItem(SESSION_KEY);
    },

    getCurrentUser: () => {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    isAuthenticated: () => {
      const user = AuthService.getCurrentUser();
      return !!(user && user.token);
    },

    hasPermission: (permissionKey) => {
      const user = AuthService.getCurrentUser();
      const role = user ? user.role : (localStorage.getItem('gb_crm_active_role') || 'admin');
      const matrix = PERMISSION_MATRIX[role] || PERMISSION_MATRIX.admin;
      return !!matrix[permissionKey];
    },

    setSimulatedRole: (newRole) => {
      if (!DEMO_MODE) {
        console.warn('Role switching is disabled in strict production mode.');
        return false;
      }
      localStorage.setItem('gb_crm_active_role', newRole);
      const user = AuthService.getCurrentUser();
      if (user) {
        user.role = newRole;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
      DataService.addLog(`Simulated role updated to: ${newRole}`);
      return true;
    }
  };
})();
