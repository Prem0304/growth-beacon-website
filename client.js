/* ==========================================================================
   Growth Beacon - Client Workspace Interactive Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = parseInt(urlParams.get('id'), 10);

  const errorView = document.getElementById('error-view');
  const workspaceView = document.getElementById('workspace-view');

  // Selectors for dynamic text
  const clientWelcomeName = document.getElementById('client-welcome-name');
  const clientProjectService = document.getElementById('client-project-service');
  const clientCompanyName = document.getElementById('client-company-name');
  const badgeOnboarding = document.getElementById('badge-onboarding');

  // Timeline Step containers
  const stepAdvance = document.getElementById('step-advance');
  const stepOnboard = document.getElementById('step-onboard');
  const stepDrafts = document.getElementById('step-drafts');
  const stepFinalPay = document.getElementById('step-finalpay');
  const stepDelivery = document.getElementById('step-delivery');

  // Timeline Action containers
  const actionAdvance = document.getElementById('action-advance');
  const actionOnboard = document.getElementById('action-onboard');
  const actionDrafts = document.getElementById('action-drafts');
  const actionFinalPay = document.getElementById('action-finalpay');
  const actionDelivery = document.getElementById('action-delivery');

  // Form elements
  const briefingFormCard = document.getElementById('briefing-form-card');
  const onboardingBriefForm = document.getElementById('onboarding-brief-form');
  const briefWebsite = document.getElementById('brief-website');
  const briefCompetitor = document.getElementById('brief-competitor');
  const briefAudience = document.getElementById('brief-audience');
  const briefChannel = document.getElementById('brief-channel');
  const briefNotes = document.getElementById('brief-notes');

  // Log container
  const activityLogFeed = document.getElementById('activity-log-feed');

  let leads = [];
  let localLeads = [];
  let client = null;
  let isLocal = false;

  const loadDatabase = () => {
    leads = JSON.parse(localStorage.getItem('gb_crm_leads')) || [];
    localLeads = JSON.parse(localStorage.getItem('gb_crm_local_leads')) || [];
  };

  const saveDatabase = () => {
    if (isLocal) {
      localStorage.setItem('gb_crm_local_leads', JSON.stringify(localLeads));
    } else {
      localStorage.setItem('gb_crm_leads', JSON.stringify(leads));
    }
  };

  const findClient = () => {
    loadDatabase();
    // Search in primary leads
    client = leads.find(l => l.id === clientId);
    isLocal = false;
    
    // Search in local outreach if not found
    if (!client) {
      client = localLeads.find(l => l.id === clientId);
      isLocal = true;
    }
  };

  const renderWorkspace = () => {
    findClient();
    
    if (!client) {
      errorView.style.display = 'block';
      workspaceView.style.display = 'none';
      return;
    }

    errorView.style.display = 'none';
    workspaceView.style.display = 'block';

    // Populate client general info
    clientWelcomeName.textContent = `Welcome Back, ${client.name.split(' ')[0]}!`;
    clientProjectService.innerHTML = `Your campaign workspace for <strong>${client.service || 'Growth Acceleration'}</strong>`;
    clientCompanyName.textContent = client.company;

    // Ensure delivery metadata exists
    if (!client.delivery) {
      client.delivery = {
        onboarding: 'Pending Access',
        payment: 'Invoice Sent',
        content: 'Not Started',
        lastUpdated: new Date().toLocaleDateString()
      };
    }

    const { onboarding, payment, content } = client.delivery;

    // Update global status badge
    updateGlobalStatusBadge(onboarding, payment, content);

    // Render Timeline Milestones & Actions
    renderMilestones(onboarding, payment, content);

    // Render briefing form display
    renderBriefingForm(onboarding);

    // Render activity feed
    renderLogs(onboarding, payment, content);
  };

  const updateGlobalStatusBadge = (onboarding, payment, content) => {
    if (content === 'Approved') {
      badgeOnboarding.className = 'badge-status badge-completed';
      badgeOnboarding.textContent = 'Campaigns Active';
    } else if (onboarding === 'Strategy Approved' || content === 'Delivered') {
      badgeOnboarding.className = 'badge-status badge-active';
      badgeOnboarding.textContent = 'Fulfillment Phase';
    } else {
      badgeOnboarding.className = 'badge-status badge-pending';
      badgeOnboarding.textContent = 'Onboarding Phase';
    }
  };

  const renderMilestones = (onboarding, payment, content) => {
    // ------------------ Milestone 1: 50% Advance ------------------
    const isStep1Done = payment === 'Deposit Paid' || payment === 'Fully Paid';
    const halfValue = (client.val || 30000) / 2;
    if (isStep1Done) {
      stepAdvance.className = 'timeline-step completed';
      actionAdvance.innerHTML = '<span style="color: #27c93f; font-weight: 600; font-size: 0.85rem;">✓ 50% Advance Confirmed</span>';
    } else {
      stepAdvance.className = 'timeline-step active';
      actionAdvance.innerHTML = `
        <button class="btn-primary" id="btn-pay-advance" style="padding: 8px 16px; font-size: 0.8rem; margin-top: 8px;">
          Pay 50% Deposit (₹${halfValue.toLocaleString('en-IN')})
        </button>
      `;
      document.getElementById('btn-pay-advance').addEventListener('click', () => {
        simulatePayment('Deposit Paid');
      });
    }

    // ------------------ Milestone 2: Onboarding Brief ------------------
    const isStep2Done = onboarding === 'Kickoff Call' || onboarding === 'Strategy Approved';
    if (isStep2Done) {
      stepOnboard.className = 'timeline-step completed';
      actionOnboard.innerHTML = '<span style="color: #27c93f; font-weight: 600; font-size: 0.85rem;">✓ Onboarding Brief Approved</span>';
    } else if (isStep1Done) {
      stepOnboard.className = 'timeline-step active';
      actionOnboard.innerHTML = `
        <button class="btn-secondary" id="btn-scroll-brief" style="padding: 6px 12px; font-size: 0.8rem; margin-top: 4px;">
          Complete Onboarding Brief
        </button>
      `;
      document.getElementById('btn-scroll-brief').addEventListener('click', () => {
        briefingFormCard.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      stepOnboard.className = 'timeline-step';
      actionOnboard.innerHTML = '<span style="color: var(--color-text-muted); font-size: 0.8rem;">Awaiting advance payment...</span>';
    }

    // ------------------ Milestone 3: Draft Strategy ------------------
    const isStep3Done = content === 'Delivered' || content === 'Approved';
    if (isStep3Done) {
      stepDrafts.className = 'timeline-step completed';
      actionDrafts.innerHTML = '<span style="color: #27c93f; font-weight: 600; font-size: 0.85rem;">✓ Drafts Reviewed & Approved</span>';
    } else if (isStep2Done) {
      stepDrafts.className = 'timeline-step active';
      actionDrafts.innerHTML = `
        <a href="https://growthbeacon.com/deliveries/shared" target="_blank" class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; margin-top: 4px; display: inline-block; text-decoration: none;">
          Review Campaign Drafts Folder
        </a>
      `;
    } else {
      stepDrafts.className = 'timeline-step';
      actionDrafts.innerHTML = '<span style="color: var(--color-text-muted); font-size: 0.8rem;">Awaiting onboarding setup...</span>';
    }

    // ------------------ Milestone 4: Final Payment ------------------
    const isStep4Done = payment === 'Fully Paid';
    if (isStep4Done) {
      stepFinalPay.className = 'timeline-step completed';
      actionFinalPay.innerHTML = '<span style="color: #27c93f; font-weight: 600; font-size: 0.85rem;">✓ Final Milestone Payment Confirmed</span>';
    } else if (isStep3Done) {
      stepFinalPay.className = 'timeline-step active';
      actionFinalPay.innerHTML = `
        <button class="btn-primary" id="btn-pay-final" style="padding: 8px 16px; font-size: 0.8rem; margin-top: 8px;">
          Pay Remaining 50% (₹${halfValue.toLocaleString('en-IN')})
        </button>
      `;
      document.getElementById('btn-pay-final').addEventListener('click', () => {
        simulatePayment('Fully Paid');
      });
    } else {
      stepFinalPay.className = 'timeline-step';
      actionFinalPay.innerHTML = '<span style="color: var(--color-text-muted); font-size: 0.8rem;">Awaiting drafts approval...</span>';
    }

    // ------------------ Milestone 5: Live Launch ------------------
    if (content === 'Approved') {
      stepDelivery.className = 'timeline-step completed';
      actionDelivery.innerHTML = '<span style="color: #27c93f; font-weight: 600; font-size: 0.85rem;">✓ Campaigns Launched & Live!</span>';
    } else if (isStep4Done) {
      stepDelivery.className = 'timeline-step active';
      actionDelivery.innerHTML = `
        <button class="btn-primary" id="btn-launch-campaigns" style="padding: 8px 16px; font-size: 0.8rem; margin-top: 8px;">
          Confirm Final Campaign Launch
        </button>
      `;
      document.getElementById('btn-launch-campaigns').addEventListener('click', () => {
        simulateFinalLaunch();
      });
    } else {
      stepDelivery.className = 'timeline-step';
      actionDelivery.innerHTML = '<span style="color: var(--color-text-muted); font-size: 0.8rem;">Awaiting final invoice settlement...</span>';
    }
  };

  const simulatePayment = (newStatus) => {
    client.delivery.payment = newStatus;
    client.delivery.lastUpdated = new Date().toLocaleDateString();
    
    // Automatically progress onboarding state after advance payment is received
    if (newStatus === 'Deposit Paid' && client.delivery.onboarding === 'Pending Access') {
      // Just loaded
    }
    
    saveDatabase();
    renderWorkspace();
  };

  const simulateFinalLaunch = () => {
    client.delivery.content = 'Approved';
    client.delivery.lastUpdated = new Date().toLocaleDateString();
    saveDatabase();
    renderWorkspace();
  };

  const renderBriefingForm = (onboarding) => {
    const isBriefCompleted = onboarding === 'Kickoff Call' || onboarding === 'Strategy Approved';
    if (isBriefCompleted) {
      briefingFormCard.style.display = 'none';
    } else if (client.delivery.payment === 'Deposit Paid') {
      briefingFormCard.style.display = 'block';
    } else {
      // Hide form until deposit is paid
      briefingFormCard.style.display = 'none';
    }
  };

  onboardingBriefForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Save brief details
    client.brief = {
      website: briefWebsite.value,
      competitor: briefCompetitor.value,
      audience: briefAudience.value,
      goals: briefChannel.value,
      notes: briefNotes.value,
      submittedDate: new Date().toLocaleDateString()
    };

    // Update statuses
    client.delivery.onboarding = 'Strategy Approved';
    client.delivery.lastUpdated = new Date().toLocaleDateString();
    
    saveDatabase();
    renderWorkspace();
  });

  const renderLogs = (onboarding, payment, content) => {
    if (!activityLogFeed) return;
    activityLogFeed.innerHTML = '';

    // Logs array build
    const logs = [];

    logs.push({
      time: client.date || '8/9/2026',
      text: 'Project record approved. Campaign roadmap initialized.'
    });

    if (payment === 'Invoice Sent') {
      logs.push({
        time: client.date || '8/9/2026',
        text: 'Initial 50% setup deposit invoice generated.'
      });
    }

    if (payment === 'Deposit Paid' || payment === 'Fully Paid') {
      logs.push({
        time: client.date || '8/9/2026',
        text: 'Deposit cleared! Onboarding questionnaire portal unlocked.'
      });
    }

    if (onboarding === 'Strategy Approved' || onboarding === 'Kickoff Call') {
      const subTime = (client.brief && client.brief.submittedDate) || new Date().toLocaleDateString();
      logs.push({
        time: subTime,
        text: `Briefing details received! (Website: ${client.brief?.website || ''})`
      });
      logs.push({
        time: subTime,
        text: 'Strategy alignment under active prep. Initial asset drafts compiling.'
      });
    }

    if (content === 'Delivered' || content === 'Approved') {
      logs.push({
        time: client.delivery.lastUpdated,
        text: 'Campaign structures and ad template drafts delivered. Milestones pending final approval.'
      });
    }

    if (payment === 'Fully Paid') {
      logs.push({
        time: client.delivery.lastUpdated,
        text: 'Final 50% milestone payment confirmed! Campaign release procedures unlocked.'
      });
    }

    if (content === 'Approved') {
      logs.push({
        time: client.delivery.lastUpdated,
        text: 'Campaign launched successfully! Live search tracking analytics and optimization reports activated.'
      });
    }

    // Output reverse chronological
    logs.reverse().forEach(log => {
      const div = document.createElement('div');
      div.className = 'log-entry';
      div.innerHTML = `
        <span class="log-time">${log.time}</span>
        <p>${log.text}</p>
      `;
      activityLogFeed.appendChild(div);
    });
  };

  // Initial render
  renderWorkspace();
});
