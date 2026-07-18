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
  // Mobile Nav Toggle
  // ==========================================================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');
  
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
    });

    // Close mobile menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav-link, .nav-btn');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('active');
      });
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
          // Fade out form and display custom styling success block
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
});
