// Shared interactions for the Artizyn website. Page content stays in the HTML.
document.querySelectorAll('video[autoplay]').forEach(studioVideo => {
  studioVideo.muted = true;
  // Request playback immediately, including when the video is below the fold.
  // Keep the native controls available if a visitor's browser blocks autoplay.
  studioVideo.play().catch(() => {});
});

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

// Native details/summary controls are keyboard accessible and work without JS.
document.querySelectorAll('.faq-list details').forEach(item => {
  item.addEventListener('toggle', () => {
    if (item.open) document.querySelectorAll('.faq-list details').forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});

const projectDialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-project-image]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('#dialog-title').textContent = button.dataset.projectName;
    const image = document.querySelector('#dialog-image');
    image.src = button.dataset.projectImage;
    image.alt = button.dataset.projectName;
    document.querySelector('#dialog-address').textContent = button.dataset.projectAddress;
    projectDialog.showModal();
  });
});
document.querySelector('#dialog-close').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', event => {
  if (event.target !== projectDialog) return;
  const bounds = projectDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) projectDialog.close();
});

// Reuse the public Artizyn chatbot already embedded on the Canva website.
// It is loaded only after the visitor opens it; no API key is needed here.
const assistantToggle = document.querySelector('#assistant-toggle');
const assistantPanel = document.querySelector('#assistant-panel');
function closeAssistant() {
  assistantPanel.hidden = true;
  assistantToggle.setAttribute('aria-expanded', 'false');
}
assistantToggle.addEventListener('click', () => {
  const open = assistantPanel.hidden;
  assistantPanel.hidden = !open;
  assistantToggle.setAttribute('aria-expanded', String(open));
  if (open) {
    const frame = document.querySelector('#assistant-frame');
    if (!frame.hasAttribute('src')) frame.src = frame.dataset.src;
    document.querySelector('#assistant-close').focus();
  }
});
document.querySelector('#assistant-close').addEventListener('click', () => {
  closeAssistant(); assistantToggle.focus();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (menuToggle.getAttribute('aria-expanded') === 'true') { closeMenu(); menuToggle.focus(); }
  if (!assistantPanel.hidden) { closeAssistant(); assistantToggle.focus(); }
});

// GitHub Pages hosts static files. This form prepares an email for the visitor
// to review and send in their own email app; it does not submit to a server.
const form = document.querySelector('#enquiry-form');
let enquiryText = '';
if (form) {
  const selectedPackage = new URLSearchParams(location.search).get('package');
  if (['Essential', 'Advanced', 'Signature'].includes(selectedPackage)) {
    document.querySelector('#design-package').value = selectedPackage;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(form);
    const name = values.get('name').trim();
    const message = values.get('message').trim();
    if (!name || message.length < 10) {
      const invalid = !name ? document.querySelector('#client-name') : document.querySelector('#project-message');
      invalid.setCustomValidity(!name ? 'Please enter your name.' : 'Please enter at least 10 characters about your project.');
      invalid.reportValidity();
      return;
    }
    enquiryText = `PROJECT ENQUIRY — ARTIZYN DESIGN STUDIO\n\nName: ${name}\nEmail: ${values.get('email').trim()}\nProject type: ${values.get('project')}\nDesign package: ${values.get('package') || 'Not selected'}\n\nProject details:\n${message}`;
    document.querySelector('#enquiry-preview').textContent = enquiryText;
    document.querySelector('#enquiry-result').hidden = false;
    document.querySelector('#draft-status').textContent = 'Draft prepared. No message has been sent.';
    document.querySelector('#email-enquiry').href = `mailto:artizyn.1254@gmail.com?subject=${encodeURIComponent('Project enquiry — ' + values.get('project'))}&body=${encodeURIComponent(enquiryText)}`;
  });
  form.addEventListener('input', event => event.target.setCustomValidity?.(''));
  document.querySelector('#copy-enquiry').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(enquiryText);
      document.querySelector('#draft-status').textContent = 'Draft copied. No message has been sent.';
    } catch {
      document.querySelector('#draft-status').textContent = 'Copy is unavailable. Select the draft text to copy it, or use Download .txt.';
    }
  });
  document.querySelector('#download-enquiry').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([enquiryText], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'artizyn-enquiry.txt';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.querySelector('#draft-status').textContent = 'Draft download started. No message has been sent.';
  });
}
