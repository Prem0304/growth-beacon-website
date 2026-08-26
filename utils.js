// ==========================================================================
// Growth Beacon CRM — Shared Utilities (utils.js)
// ==========================================================================

const Utils = {
  // XSS Prevention / HTML Sanitizer
  escapeHTML: (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  // INR Currency Formatter (₹)
  formatCurrency: (amount) => {
    const val = parseFloat(amount) || 0;
    return `₹${val.toLocaleString('en-IN')}`;
  },

  // Dynamic Client Portal URL Generator (Prevents Localhost Bug)
  getPortalUrl: (clientId) => {
    return `${window.location.origin}/client.html?id=${encodeURIComponent(clientId)}`;
  },

  // Date Formatter (DD/MM/YYYY)
  formatDate: (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  },

  // Email Validator
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  // Phone Validator (+91 or 10 digits)
  isValidPhone: (phone) => {
    const cleaned = String(phone).replace(/[^0-9]/g, '');
    return cleaned.length >= 10 && cleaned.length <= 13;
  },

  // Debounce Helper for Search Performance
  debounce: (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
};
