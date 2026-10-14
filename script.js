/* MaQweb Services — contact configuration.
 * WhatsApp includes India's country code (+91), as required by wa.me.
 * Enquiries are opened in the visitor's email app or WhatsApp; the visitor must press Send.
 */
const SITE_CONFIG = {
  businessEmail: 'maqwebsevices@gmail.com',
  whatsappNumber: '917461979033'
};

document.documentElement.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-menu');
const navUse = menuToggle?.querySelector('use');

function setMenuOpen(open) {
  if (!menuToggle || !mobileNav) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navUse?.setAttribute('href', open ? '#icon-close' : '#icon-menu');
  mobileNav.classList.toggle('is-open', open);
  mobileNav.inert = !open;
  document.body.classList.toggle('nav-open', open);
}

menuToggle?.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenuOpen(false);
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) setMenuOpen(false);
});
document.addEventListener('click', event => {
  if (mobileNav?.classList.contains('is-open') && !mobileNav.contains(event.target) && !menuToggle.contains(event.target)) setMenuOpen(false);
});

/* Scroll-in visuals; content is visible without IntersectionObserver */
const elements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: .08, rootMargin: '0px 0px 30px 0px' });
  elements.forEach(element => observer.observe(element));
} else {
  elements.forEach(element => element.classList.add('visible'));
}

/* Selecting a plan fills in the enquiry form. */
document.querySelectorAll('[data-plan]').forEach(link => {
  link.addEventListener('click', () => {
    const planSelect = document.getElementById('contact-plan');
    if (planSelect) planSelect.value = link.dataset.plan;
  });
});

/* Use mailto/WhatsApp, not a fake backend: no form data is transmitted silently. */
const enquiryForm = document.getElementById('enquiry-form');
const formStatus = document.getElementById('form-status');
const submitLabel = document.getElementById('submit-label');
const emailIsSet = SITE_CONFIG.businessEmail.includes('@') && !/your[_-]?email|example\./i.test(SITE_CONFIG.businessEmail);
const whatsappDigits = SITE_CONFIG.whatsappNumber.replace(/\D/g, '');
const whatsappIsSet = /^\d{10,15}$/.test(whatsappDigits);

if (submitLabel) {
  submitLabel.textContent = emailIsSet ? 'Enquire by email' : 'Prepare my enquiry';
}

function showStatus(message, error = false) {
  if (!formStatus) return;
  formStatus.hidden = false;
  formStatus.textContent = message;
  formStatus.classList.toggle('error', error);
}

async function copyEnquiry(text) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* fallback below */ }
  }
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch (_) { /* manual fallback */ }
  el.remove();
  return copied;
}

enquiryForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;

  const values = new FormData(enquiryForm);
  const name = String(values.get('name') || '').trim();
  const email = String(values.get('email') || '').trim();
  const business = String(values.get('business') || '').trim();
  const plan = String(values.get('plan') || 'Not sure yet').trim();
  const message = String(values.get('message') || '').trim();

  const subject = `Website enquiry — ${business} — ${name}`;
  const body = `Hello MaQweb Services,\n\nI would like to discuss a website for my business.\n\nName: ${name}\nEmail: ${email}\nBusiness: ${business}\nPackage: ${plan}\n\nProject idea:\n${message}\n\nThank you!`;

  const viaWhatsApp = event.submitter?.value === 'whatsapp';
  if (viaWhatsApp && whatsappIsSet) {
    const url = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(body)}`;
    const popup = window.open(url, '_blank');
    if (popup) popup.opener = null;
    else window.location.href = url;
    showStatus('WhatsApp should open with your enquiry. Press Send in WhatsApp to complete it.');
  } else if (emailIsSet) {
    window.location.href = `mailto:${SITE_CONFIG.businessEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showStatus('Your email app should open with your enquiry. Press Send there to complete it.');
  } else {
    const copied = await copyEnquiry(`${subject}\n\n${body}`);
    showStatus(copied
      ? 'Enquiry copied to your clipboard. Paste it into a message to MaQweb Services. To enable direct enquiries, the website owner should add contact details in script.js.'
      : 'Direct sending is not yet connected. Please copy your enquiry details from the form. The website owner can add an email or WhatsApp number in script.js.',
      !copied);
  }
});

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
