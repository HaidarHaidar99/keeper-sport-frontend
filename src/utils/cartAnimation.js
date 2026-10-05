/**
 * Keeper Sports Football-to-Cart Flight Animation
 * Dynamically computes start position from the clicked Product Card / Add button
 * and flies smoothly to the actual visible Navbar Cart element.
 * Respects `prefers-reduced-motion`.
 */

export function launchFootballToCart(startElement, onComplete) {
  if (typeof window === 'undefined') {
    if (onComplete) onComplete();
    return;
  }

  // Respect prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (onComplete) onComplete();
    return;
  }

  // Locate visible Navbar cart target
  // Check both desktop CART nav link and mobile cart button
  const targets = Array.from(document.querySelectorAll('.ks-nav-cart-btn, a[href="/cart"], [data-nav-cart="true"]'));
  const cartTarget = targets.find((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }) || targets[0];

  if (!cartTarget || !startElement) {
    if (onComplete) onComplete();
    return;
  }

  const startRect = startElement.getBoundingClientRect();
  const targetRect = cartTarget.getBoundingClientRect();

  // Starting coordinates (center of start element)
  const startX = startRect.left + startRect.width / 2 - 12;
  const startY = startRect.top + startRect.height / 2 - 12;

  // Destination coordinates (center of cart target)
  const endX = targetRect.left + targetRect.width / 2 - 12;
  const endY = targetRect.top + targetRect.height / 2 - 12;

  // Create flyer element
  const flyer = document.createElement('div');
  flyer.className = 'ks-football-flyer';
  flyer.setAttribute('aria-hidden', 'true');
  flyer.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="ks-football-svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="var(--ks-bg-card, #111)" />
      <polygon points="12,7 15,10 14,14 10,14 9,10" fill="var(--ks-accent-red, #E10600)" stroke="currentColor" stroke-width="1" />
      <path d="M12 7V2" stroke="currentColor" />
      <path d="M15 10L19.5 7.5" stroke="currentColor" />
      <path d="M14 14L18 18" stroke="currentColor" />
      <path d="M10 14L6 18" stroke="currentColor" />
      <path d="M9 10L4.5 7.5" stroke="currentColor" />
    </svg>
  `;

  flyer.style.position = 'fixed';
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.style.zIndex = '99999';
  flyer.style.pointerEvents = 'none';
  flyer.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.6s cubic-bezier(0.2, 0.8, 0.25, 1)';
  flyer.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
  flyer.style.opacity = '1';

  document.body.appendChild(flyer);

  // Force reflow
  flyer.getBoundingClientRect();

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  // Animate toward cart
  flyer.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.55) rotate(360deg)`;
  flyer.style.opacity = '0.9';

  setTimeout(() => {
    if (flyer.parentElement) {
      flyer.parentElement.removeChild(flyer);
    }

    // Subtle reaction on cart icon
    cartTarget.classList.add('ks-cart-pulse');
    setTimeout(() => {
      cartTarget.classList.remove('ks-cart-pulse');
    }, 450);

    if (onComplete) onComplete();
  }, 600);
}
