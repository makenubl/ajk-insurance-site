
document.addEventListener('DOMContentLoaded', function() {

  // ===== Initialize AOS (Animate On Scroll) =====
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50
    });
  }

  // ===== Preloader & Current Year =====
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.opacity = '0';
    setTimeout(() => preloader && (preloader.style.display = 'none'), 450);
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }, 500);

  // ===== Back to Top Button =====
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Hero Swiper =====
  const heroSwiper = new Swiper('.hero-swiper', {
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    effect: 'fade',
    speed: 1000,
    fadeEffect: { crossFade: true }
  });

  const heroEl = document.querySelector('.hero-swiper');
  if (heroEl) {
    heroEl.addEventListener('mouseenter', () => heroSwiper.autoplay.stop());
    heroEl.addEventListener('mouseleave', () => heroSwiper.autoplay.start());
  }

  // ===== Services Swiper =====
  const servicesSwiper = new Swiper('.services-swiper', {
    slidesPerView: 1,
    spaceBetween: 16,
    loop: false,
    breakpoints: {
      480: { slidesPerView: 1 },
      640: { slidesPerView: 2 },
      900: { slidesPerView: 3 },
      1200: { slidesPerView: 4 }
    },
    pagination: { el: '.services-pagination', clickable: true }
  });

  // ===== Mobile Menu Toggle =====
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const nav = document.querySelector('.nav');
  
  mobileBtn && mobileBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    if (nav) {
      nav.style.display = expanded ? 'none' : 'flex';
      nav.style.flexDirection = 'column';
      nav.style.gap = '1rem';
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (nav && window.innerWidth <= 1100) {
      if (!e.target.closest('.nav') && !e.target.closest('.hamburger')) {
        nav.style.display = 'none';
        if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Close mobile menu when clicking nav links
  if (nav) {
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1100) {
          nav.style.display = 'none';
          if (mobileBtn) mobileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#home') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ===== Lead Form Submission (EmailJS - works on S3 static hosting) =====
  const EMAIL_SETTINGS_KEY = 'ajkEmailSettings';
  const DEFAULT_EMAILJS_CONFIG = {
    serviceId: 'service_l35eaus',
    templateId: 'template_bcfbrbg',
    publicKey: 'epoO_YQfPCvyTi7Qk'
  };

  function getEmailJsConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(EMAIL_SETTINGS_KEY) || '{}');
      return {
        serviceId: (saved.emailjsServiceId || DEFAULT_EMAILJS_CONFIG.serviceId).trim(),
        templateId: (saved.emailjsTemplateId || DEFAULT_EMAILJS_CONFIG.templateId).trim(),
        publicKey: (saved.emailjsPublicKey || DEFAULT_EMAILJS_CONFIG.publicKey).trim()
      };
    } catch (error) {
      console.warn('Invalid local EmailJS config, using defaults.', error);
      return { ...DEFAULT_EMAILJS_CONFIG };
    }
  }

  const emailJsConfig = getEmailJsConfig();
  const EMAILJS_SERVICE_ID = emailJsConfig.serviceId;
  const EMAILJS_TEMPLATE_ID = emailJsConfig.templateId;
  const EMAILJS_PUBLIC_KEY = emailJsConfig.publicKey;
  
  const leadForm = document.getElementById('leadForm');

  leadForm && leadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    
    // Show loading state
    status.textContent = 'Submitting...';
    status.style.color = '#0b3b5d';
    status.style.fontWeight = '600';

    // Collect form data
    const formData = new FormData(leadForm);
    const templateParams = {
      name: formData.get('fullName') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      dob: formData.get('dob') || '',
      insuranceType: formData.get('insuranceType') || '',
      city: formData.get('city') || '',
      country: formData.get('country') || '',
      message: formData.get('message') || ''
    };

    console.log('Submitting form data:', templateParams);

    try {
      // Check if EmailJS is configured
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
        throw new Error('EmailJS not configured. Please set up EmailJS credentials.');
      }

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      console.log('EmailJS response:', response);
      
      status.textContent = '✓ Thank you! We will contact you shortly.';
      status.style.color = '#28a745';
      leadForm.reset();
      
      setTimeout(() => {
        status.textContent = '';
      }, 5000);
    } catch (err) {
      console.error('Form submission error:', err);
      status.textContent = '✗ Error: ' + (err.message || 'Please try again later.');
      status.style.color = '#dc3545';
    }
  });

});
