document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // Header scroll effect
  // ==========================================================================
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ==========================================================================
  // App-Style Mobile Bottom Navigation Tab Bar (Concept 1)
  // ==========================================================================
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  
  if (mobileNavItems.length > 0) {
    // 1. Smooth scrolling click handler for bottom nav links
    mobileNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          // Remove active from all items and set current to active
          mobileNavItems.forEach(nav => nav.classList.remove('active'));
          item.classList.add('active');
          
          // Scroll to section with header offset
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });

    // 2. Scroll Spy: Auto-highlight bottom navigation tab item in view
    const sections = document.querySelectorAll('section[id]');
    const sectionIdMap = {
      'home': 'home',
      'about': 'home',
      'services': 'services',
      'pricing': 'pricing',
      'testimonials': 'services',
      'contact': 'contact'
    };

    const observerOptions = {
      root: null,
      threshold: 0.25,
      rootMargin: '-80px 0px 0px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          const mappedId = sectionIdMap[sectionId];
          
          if (mappedId) {
            const targetNavItem = document.querySelector(`.mobile-nav-item[href="#${mappedId}"]`);
            if (targetNavItem) {
              mobileNavItems.forEach(nav => nav.classList.remove('active'));
              targetNavItem.classList.add('active');
            }
          }
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }



  // ==========================================================================
  // Scroll Reveal Animations
  // ==========================================================================
  const cards = document.querySelectorAll('.animate-card');
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  cards.forEach(card => {
    revealObserver.observe(card);
  });

  // ==========================================================================
  // Stats Counting Animation
  // ==========================================================================
  const statNumbers = document.querySelectorAll('.stat-num');
  
  const countStats = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetValue = parseInt(target.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds animation
        const startTime = performance.now();

        const updateCount = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          
          // Easing function (easeOutQuad)
          const easeProgress = progress * (2 - progress);
          
          const currentValue = Math.floor(easeProgress * targetValue);
          target.textContent = currentValue;

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            target.textContent = targetValue; // Ensure exact final value
          }
        };

        requestAnimationFrame(updateCount);
        observer.unobserve(target); // Animate only once
      }
    });
  };

  const statsObserver = new IntersectionObserver(countStats, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  statNumbers.forEach(stat => {
    statsObserver.observe(stat);
  });



  // ==========================================================================
  // Contact Form Submission & Feedback (Web3Forms API Integration)
  // ==========================================================================
  const contactForm = document.getElementById('growth-contact-form');
  const formSuccess = document.getElementById('form-success');
  const submitBtn = document.getElementById('form-submit-btn');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Show submitting state
      submitBtn.classList.add('submitting');
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('span');
      const originalText = btnText.textContent;
      btnText.textContent = 'Transmitting...';

      const formData = new FormData(contactForm);
      
      // Access Key for Web3Forms (Replace with your actual key from https://web3forms.com)
      const accessKey = "d46f63c7-3d23-48d2-86ad-c9a2169f0ea4";
      formData.append("access_key", accessKey);
      formData.append("subject", "New Lead from Growth Beacon");

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status === 200) {
          // Save Lead Locally for CRM
          const localLead = {
            id: Date.now(),
            name: formData.get("name"),
            email: formData.get("email"),
            company: formData.get("company") || "N/A",
            service: formData.getAll("services").join(", ") || "N/A",
            message: formData.get("message"),
            status: "New",
            notes: "",
            date: new Date().toLocaleDateString()
          };
          
          let localLeads = JSON.parse(localStorage.getItem("gb_crm_leads")) || [];
          localLeads.unshift(localLead);
          localStorage.setItem("gb_crm_leads", JSON.stringify(localLeads));

          // Fade out form and display success block
          contactForm.style.opacity = '0';
          contactForm.style.transform = 'translateY(-20px)';
          setTimeout(() => {
            contactForm.style.display = 'none';
            formSuccess.classList.add('active');
          }, 400);
        } else {
          console.error(json);
          alert(json.message || "An error occurred. Please try again.");
          btnText.textContent = originalText;
          submitBtn.classList.remove('submitting');
          submitBtn.disabled = false;
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Network error. Please check your connection and try again.");
        btnText.textContent = originalText;
        submitBtn.classList.remove('submitting');
        submitBtn.disabled = false;
      });
    });
  }

  // ==========================================================================
  // Newsletter Form Signup
  // ==========================================================================
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterSuccess = document.getElementById('newsletter-success');

  if (newsletterForm && newsletterSuccess) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = newsletterForm.querySelector('input');
      const submitBtn = newsletterForm.querySelector('button');

      submitBtn.textContent = '...';
      submitBtn.disabled = true;

      setTimeout(() => {
        emailInput.style.display = 'none';
        submitBtn.style.display = 'none';
        newsletterSuccess.style.display = 'block';
      }, 1000);
    });
  }

  // ==========================================================================
  // Hidden CRM Admin Portal Entry Triggers
  // ==========================================================================
  // 1. Keyboard Shortcut Trigger (Alt + Shift + A)
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      window.location.href = 'crm.html';
    }
  });

  // 2. Hidden Footer Period Click Trigger (Click 3 times in a row)
  const hiddenAdminTrigger = document.getElementById('hidden-admin-trigger');
  if (hiddenAdminTrigger) {
    let clickCount = 0;
    let clickTimeout = null;
    
    hiddenAdminTrigger.addEventListener('click', () => {
      clickCount++;
      
      // Clear reset timeout
      if (clickTimeout) clearTimeout(clickTimeout);
      
      // Reset count after 3 seconds of inactivity
      clickTimeout = setTimeout(() => {
        clickCount = 0;
      }, 3000);
      
      // Redirect after 3 clicks
      if (clickCount >= 3) {
        window.location.href = 'crm.html';
      }
    });
  }

  // ==========================================================================
  // Interactive Pricing Engine (Tier-2 Tamil Nadu Rates)
  // ==========================================================================
  const PRICING_DB = {
    smm: {
      title: "Social Media Management",
      icon: "📢",
      basic: { price: "₹8,000", period: "/month", desc: "For startups wanting basic online activity.", features: ["6 Custom graphic posts", "Profile optimization", "Holiday greeting posts", "Monthly content plan", "Standard monthly reach report"] },
      standard: { price: "₹12,000", period: "/month", desc: "For growing brands seeking active inquiries.", features: ["10 Custom graphic posts", "4 Reels / Short Videos", "Aesthetic grid layout planning", "Comment monitoring & DM template", "Monthly progress metrics review"] },
      premium: { price: "₹15,000", period: "/month", desc: "For large retail chains and premium showrooms.", features: ["15 Custom graphic posts", "8 Reels / Short Videos", "Dedicated account manager", "Local influencer outreach support", "GMB reviews response manager"] }
    },
    seo: {
      title: "SEO Services",
      icon: "🔍",
      basic: { price: "₹15,000", period: "/month", desc: "Basic search presence and GMB listings setups.", features: ["Google My Business Map optimization", "8 Target local keywords", "Search console error fixes", "2 Basic blog articles", "Monthly ranking reports"] },
      standard: { price: "₹25,000", period: "/month", desc: "Complete regional ranking push for manufacturers.", features: ["20 Target keywords optimization", "3 High-DA backlink acquisitions", "Homepage conversion journey review", "Competitor local gap analysis"] },
      premium: { price: "₹40,000", period: "/month", desc: "National SEO execution for B2B/B2C services.", features: ["40+ Competitive keywords ranking", "6 High-Authority articles", "8 High-DA backlink guest posts", "Custom local schema programming", "Landing page layout audits"] }
    },
    ads: {
      title: "Ads / Paid Campaigns",
      icon: "📈",
      basic: { price: "₹15,000", period: "/month", desc: "Testing lead gen for local businesses.", features: ["Meta Ads setup & management", "4 Custom ad creatives", "Lead form integrations", "Monthly conversion metrics report"] },
      standard: { price: "₹25,000", period: "/month", desc: "Comprehensive lead generation pipelines.", features: ["Meta Ads + Google Ads Setup", "1 Custom landing page design", "8 Custom ad creatives", "A/B copy variation testing", "Weekly budget optimizations"] },
      premium: { price: "₹40,000", period: "/month", desc: "Scale campaigns with full automation.", features: ["Meta + Google + YouTube Ads", "Multiple landing pages designs", "Heatmap conversion rate audits", "Unlimited ad creative designs", "CRM leads integration setup"] }
    },
    branding: {
      title: "Branding Services",
      icon: "🏷️",
      basic: { price: "₹3,500", period: "one-time", desc: "Get a professional logo concept.", features: ["3 Unique logo design options", "High-res source vector files", "Transparent PNG/JPEG exports", "2 Revision rounds"] },
      standard: { price: "₹8,000", period: "one-time", desc: "Logo + stationery brand elements.", features: ["Logo design included", "Visiting card print layout", "Business letterhead design", "Envelope layout design", "5 Revision rounds"] },
      premium: { price: "₹15,000", period: "one-time", desc: "Complete corporate brand guidelines.", features: ["Logo + full stationery kit", "Social media templates bundle", "Brand Style Guide book", "Typography & color guidelines", "Unlimited revisions"] }
    },
    video: {
      title: "Video Marketing",
      icon: "🎥",
      basic: { price: "₹5,000", period: "one-time", desc: "Raw video editing package.", features: ["4 Reels/Shorts edited", "Client provides raw footage", "Audio trends syncing", "Caption subtitles", "1 Round of review edits"] },
      standard: { price: "₹9,000", period: "one-time", desc: "Reels with strategy and copy support.", features: ["8 Reels/Shorts edited", "Script outlines provided", "Sound effects & motion graphics", "Engaging captions copy", "2 Revision rounds"] },
      premium: { price: "₹14,000", period: "one-time", desc: "End-to-end shorts campaign delivery.", features: ["12 Reels/Shorts edited", "Full scriptwriting + storyboards", "Custom thumbnails design", "Weekly trends brainstorm", "Unlimited revisions"] }
    },
    whatsapp: {
      title: "WhatsApp Marketing",
      icon: "💬",
      basic: { price: "₹5,000", period: "/month", desc: "Basic broadcast setups.", features: ["2 Broadcast campaigns / mo", "Up to 2,000 contacts list", "Template verification support", "Standard broadcast statistics reports"] },
      standard: { price: "₹10,000", period: "/month", desc: "Active newsletter schedules.", features: ["4 Broadcast campaigns / mo", "Customer list segmentations", "Basic automated menu replies", "Custom chat links setup"] },
      premium: { price: "₹18,000", period: "/month", desc: "E-Commerce checkout conversion integrations.", features: ["Unlimited broadcast campaigns", "Checkout cart abandonment loop", "CRM alert integrations", "Custom chatbot builder flows"] }
    },
    email: {
      title: "Email Marketing",
      icon: "📩",
      basic: { price: "₹6,000", period: "/month", desc: "Standard newsletters broadcasts.", features: ["2 Newsletter campaigns / mo", "List import & hygiene checks", "Basic layout designs", "Open/click rate reports"] },
      standard: { price: "₹12,000", period: "/month", desc: "Lifecycle lead nurture automations.", features: ["4 Email campaigns / mo", "Lead nurture drip flow (3-step)", "Automated welcome flows", "A/B subject testing"] },
      premium: { price: "₹20,000", period: "/month", desc: "Custom checkout flows.", features: ["8 Email campaigns / mo", "Abandoned cart recovery setups", "Advanced customer split targeting", "Custom templates designs"] }
    },
    content: {
      title: "Content Writing",
      icon: "✍️",
      basic: { price: "₹5,000", period: "/month", desc: "Search articles creation.", features: ["2 SEO blog articles / mo", "Up to 1,000 words each", "Primary keyword research", "Internal link suggestions"] },
      standard: { price: "₹10,000", period: "/month", desc: "Regular blog setups.", features: ["4 SEO blog articles / mo", "Copywriting for 2 landing pages", "Secondary keywords density check", "Featured image recommendations"] },
      premium: { price: "₹18,000", period: "/month", desc: "Thought leadership assets.", features: ["8 SEO blog articles / mo", "Copy audits for all social ads", "Topic research & competitor audits", "Detailed link-building strategies"] }
    },
    website: {
      title: "Website Design & Dev",
      icon: "🌐",
      basic: { price: "₹15,000", period: "one-time", desc: "Basic corporate web presence.", features: ["5-Page WordPress website", "Fully mobile responsive", "Contact forms setup", "Google Maps embed", "1 Month support"] },
      standard: { price: "₹28,000", period: "one-time", desc: "Dynamic corporate site with blogs.", features: ["Corporate site + blog layout", "WhatsApp chat button link", "Optimized fast loading speeds", "3 Months support", "SEO search tags setup"] },
      premium: { price: "₹45,000", period: "one-time", desc: "E-Commerce store installations.", features: ["Shopify/WooCommerce store setup", "Razorpay / Paytm integration", "Shipping API configuration", "Up to 50 product uploads", "6 Months support"] }
    },
    crm: {
      title: "CRM & Automation",
      icon: "🤖",
      basic: { price: "₹10,000", period: "one-time", desc: "CRM workspace mapping.", features: ["Zoho/HubSpot CRM setup", "Contact fields customization", "Website form linking", "Lead sorting pipelines"] },
      standard: { price: "₹20,000", period: "one-time", desc: "Full funnel trigger setups.", features: ["Complete sales pipeline mapping", "Lead routing automated triggers", "3-Step automated email flows", "User guides and dashboard setup"] },
      premium: { price: "₹40,000", period: "one-time", desc: "Enterprise dashboard mappings.", features: ["Custom API setups", "Multi-software system syncs", "2 Hours of staff dashboard training", "Continuous workflow optimization", "Lifetime audit fixes"] }
    },
    gbp: {
      title: "Google Business Maps",
      icon: "🗺️",
      basic: { price: "₹3,000", period: "one-time", desc: "Maps listing verification.", features: ["GMB claim & verification help", "Listing categories optimization", "Address matching verification", "Service menu listing"] },
      standard: { price: "₹5,000", period: "one-time", desc: "Local rank booster setups.", features: ["Local keyword targeting setup", "10 Geotagged site photos", "GMB review link generator", "Basic competitor audits"] },
      premium: { price: "₹8,000", period: "one-time", desc: "Dominating local map pack.", features: ["Map pack local rank sweep", "20 Geotagged site photos", "Competitor citation gap checks", "Automated maps review booster"] }
    },
    influencer: {
      title: "Influencer Marketing",
      icon: "🎤",
      basic: { price: "₹10,000", period: "/month", desc: "Shortlist local creators.", features: ["Auditing of 5 local creators", "Outreach for up to 2 collabs", "Standard contract coordination"] },
      standard: { price: "₹20,000", period: "/month", desc: "Mid-level creator campaigns.", features: ["Full management of 5 collabs", "Script draft checking", "ROI tracking setup", "Engagement stats analysis"] },
      premium: { price: "₹35,000", period: "/month", desc: "Large regional campaigns.", features: ["Up to 12 creator campaigns", "Custom gifting sweep setups", "Contract terms reviews", "Comprehensive conversion metrics"] }
    }
  };

  // Helper to format currency symbol beautifully
  const formatPrice = (priceStr) => {
    if (!priceStr) return '';
    const numOnly = priceStr.replace('₹', '');
    return `<span class="price-currency">₹</span>${numOnly}`;
  };

  // Helper to generate pricing cards HTML
  const buildPricingCardsHTML = (serviceData) => {
    return `
      <!-- BASIC TIER -->
      <div class="price-card">
        <div class="price-card-header">
          <h3>Basic</h3>
          <p>${serviceData.basic.desc}</p>
        </div>
        <div class="price-amount-wrapper">
          <span class="price-amount-val">${formatPrice(serviceData.basic.price)}</span>
          <span class="price-amount-period">${serviceData.basic.period}</span>
        </div>
        <ul class="price-features-list">
          ${serviceData.basic.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
        <a href="#contact" class="price-card-cta btn btn-secondary modal-cta-trigger">Get Started</a>
      </div>

      <!-- STANDARD TIER -->
      <div class="price-card popular-tier">
        <span class="popular-badge">Recommended</span>
        <div class="price-card-header">
          <h3>Standard</h3>
          <p>${serviceData.standard.desc}</p>
        </div>
        <div class="price-amount-wrapper">
          <span class="price-amount-val">${formatPrice(serviceData.standard.price)}</span>
          <span class="price-amount-period">${serviceData.standard.period}</span>
        </div>
        <ul class="price-features-list">
          ${serviceData.standard.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
        <a href="#contact" class="price-card-cta btn btn-primary modal-cta-trigger">Choose Standard</a>
      </div>

      <!-- PREMIUM TIER -->
      <div class="price-card">
        <div class="price-card-header">
          <h3>Premium</h3>
          <p>${serviceData.premium.desc}</p>
        </div>
        <div class="price-amount-wrapper">
          <span class="price-amount-val">${formatPrice(serviceData.premium.price)}</span>
          <span class="price-amount-period">${serviceData.premium.period}</span>
        </div>
        <ul class="price-features-list">
          ${serviceData.premium.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
        <a href="#contact" class="price-card-cta btn btn-secondary modal-cta-trigger">Go Premium</a>
      </div>
    `;
  };

  // 1. Controller for Dedicated Pricing Section Tabs
  const pricingDeck = document.getElementById('pricing-deck');
  const tabButtons = document.querySelectorAll('[data-service-tab]');

  const renderPricingSectionTab = (serviceKey) => {
    try {
      const serviceData = PRICING_DB[serviceKey];
      if (serviceData && pricingDeck) {
        pricingDeck.innerHTML = buildPricingCardsHTML(serviceData);
        
        // Bind Contact links inside standard pricing cards safely
        pricingDeck.querySelectorAll('.modal-cta-trigger').forEach(anchor => {
          anchor.addEventListener('click', () => {
            const contactMsg = document.getElementById('contact-message');
            if (contactMsg) {
              contactMsg.value = `Hi Premkumar, I'm interested in the standard/premium tiers for your ${serviceData.title} package. Please send our brand team a detailed quotation.`;
            }
          });
        });
      }
    } catch (e) {
      console.error("Error in renderPricingSectionTab:", e);
    }
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const serviceKey = e.currentTarget.getAttribute('data-service-tab');
      renderPricingSectionTab(serviceKey);
    });
  });

  // Initial render for default (SMM)
  renderPricingSectionTab('smm');

  // 2. Controller for Interactive Service Card Clicks (Modal popup)
  const serviceModal = document.getElementById('service-modal-overlay');
  const serviceModalTitle = document.getElementById('service-modal-title');
  const modalPricingDeck = document.getElementById('modal-pricing-deck');
  const modalCloseBtn = document.getElementById('service-modal-close');
  const modalCloseBtnBottom = document.getElementById('service-modal-btn-close');

  const openServicePricingModal = (serviceKey) => {
    try {
      console.log('openServicePricingModal called with:', serviceKey);
      const serviceData = PRICING_DB[serviceKey];
      if (!serviceData) {
        console.warn('No service data found for key:', serviceKey);
        return;
      }
      if (!serviceModal) {
        console.error('Modal overlay element not found!');
        return;
      }
      
      if (serviceModalTitle) {
        serviceModalTitle.textContent = `${serviceData.icon} ${serviceData.title} Pricing`;
      }
      if (modalPricingDeck) {
        modalPricingDeck.innerHTML = buildPricingCardsHTML(serviceData);
      }
      
      serviceModal.classList.add('active');
      console.log('Modal active class added successfully.');

      // Bind CTAs to prefill contact form message safely
      if (modalPricingDeck) {
        modalPricingDeck.querySelectorAll('.modal-cta-trigger').forEach(anchor => {
          anchor.addEventListener('click', () => {
            serviceModal.classList.remove('active');
            const contactMsg = document.getElementById('contact-message');
            if (contactMsg) {
              contactMsg.value = `Hi Premkumar, I am interested in the ${serviceData.title} package options for our business. Please connect with us.`;
            }
          });
        });
      }
    } catch (err) {
      console.error('Error in openServicePricingModal:', err);
    }
  };

  const closeServicePricingModal = () => {
    if (serviceModal) serviceModal.classList.remove('active');
  };

  document.querySelectorAll('[data-service]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const serviceKey = card.getAttribute('data-service');
      console.log('Service card clicked:', serviceKey);
      openServicePricingModal(serviceKey);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeServicePricingModal);
  if (modalCloseBtnBottom) modalCloseBtnBottom.addEventListener('click', closeServicePricingModal);
  
  if (serviceModal) {
    serviceModal.addEventListener('click', (e) => {
      if (e.target === serviceModal) closeServicePricingModal();
    });
  }

  // ==========================================================================
  // Custom Multi-Select Dropdown Box Logic
  // ==========================================================================
  const multiselectContainer = document.getElementById('multiselect-container');
  const selectTrigger = document.getElementById('select-box-trigger');
  const selectValue = document.getElementById('select-box-value');
  
  if (multiselectContainer && selectTrigger && selectValue) {
    // Open/Close toggle
    selectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      multiselectContainer.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!multiselectContainer.contains(e.target)) {
        multiselectContainer.classList.remove('open');
      }
    });

    // Handle checkboxes selections and display values list
    const multiselectCheckboxes = multiselectContainer.querySelectorAll('.multiselect-checkbox');
    const updateDropdownText = () => {
      const selected = [];
      multiselectCheckboxes.forEach(cb => {
        if (cb.checked) {
          selected.push(cb.value);
        }
      });
      
      if (selected.length > 0) {
        selectValue.textContent = selected.join(', ');
        selectValue.style.color = 'var(--color-white)';
      } else {
        selectValue.textContent = 'Select Services of Interest';
        selectValue.style.color = 'var(--color-text-muted)';
      }
    };

    multiselectCheckboxes.forEach(cb => {
      cb.addEventListener('change', updateDropdownText);
    });
  }
});
