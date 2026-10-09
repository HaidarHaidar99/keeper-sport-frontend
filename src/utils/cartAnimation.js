/**
 * Keeper Sports Football-to-Cart & Heart-to-Favorites Flight Animations
 * Dynamically computes start position from clicked card / button
 * and flies smoothly to the target Navbar icon.
 * Respects `prefers-reduced-motion`.
 */

export function launchFootballToCart(startElement, onComplete) {
  if (typeof window === 'undefined') {
    if (onComplete) onComplete();
    return;
  }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (onComplete) onComplete();
    return;
  }

  // Locate visible Navbar cart target
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

  const startX = startRect.left + startRect.width / 2 - 12;
  const startY = startRect.top + startRect.height / 2 - 12;

  const endX = targetRect.left + targetRect.width / 2 - 12;
  const endY = targetRect.top + targetRect.height / 2 - 12;

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
  flyer.getBoundingClientRect();

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  flyer.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.55) rotate(360deg)`;
  flyer.style.opacity = '0.9';

  setTimeout(() => {
    if (flyer.parentElement) {
      flyer.parentElement.removeChild(flyer);
    }

    cartTarget.classList.add('ks-cart-pulse');
    setTimeout(() => {
      cartTarget.classList.remove('ks-cart-pulse');
    }, 450);

    if (onComplete) onComplete();
  }, 600);
}

/**
 * Flying Heart Animation to Navbar Favorites / Navigation
 */
export function launchHeartToFavorites(startElement, onComplete) {
  if (typeof window === 'undefined') {
    if (onComplete) onComplete();
    return;
  }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (onComplete) onComplete();
    return;
  }

  // In mobile view (<= 991px), fly to the mobile navigation toggle button.
  // In desktop view (> 991px), fly to the desktop navbar favorites heart icon.
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 991;
  let favTarget = null;

  if (isMobile) {
    favTarget = document.querySelector('#ks-main-nav-toggle') || document.querySelector('.ks-hamburger-trigger');
  } else {
    favTarget = document.querySelector('.ks-desktop-fav-btn') || document.querySelector('a[href="/favorites"]');
  }

  // Graceful fallback if preferred target is not currently visible
  if (!favTarget || favTarget.getBoundingClientRect().width === 0) {
    const candidates = Array.from(document.querySelectorAll('.ks-desktop-fav-btn, #ks-main-nav-toggle, .ks-hamburger-trigger, a[href="/favorites"], .ks-nav-cart-btn'));
    favTarget = candidates.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) || candidates[0];
  }

  if (!favTarget || !startElement) {
    if (onComplete) onComplete();
    return;
  }

  const startRect = startElement.getBoundingClientRect();
  const targetRect = favTarget.getBoundingClientRect();

  const startX = startRect.left + startRect.width / 2 - 12;
  const startY = startRect.top + startRect.height / 2 - 12;

  const endX = targetRect.left + targetRect.width / 2 - 12;
  const endY = targetRect.top + targetRect.height / 2 - 12;

  const heartFlyer = document.createElement('div');
  heartFlyer.className = 'ks-heart-flyer';
  heartFlyer.setAttribute('aria-hidden', 'true');
  heartFlyer.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="#E10600" stroke="#E10600" stroke-width="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  `;

  heartFlyer.style.position = 'fixed';
  heartFlyer.style.left = `${startX}px`;
  heartFlyer.style.top = `${startY}px`;
  heartFlyer.style.zIndex = '99999';
  heartFlyer.style.pointerEvents = 'none';
  heartFlyer.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.55s ease';
  heartFlyer.style.transform = 'translate3d(0, 0, 0) scale(1.1)';
  heartFlyer.style.opacity = '1';

  document.body.appendChild(heartFlyer);
  heartFlyer.getBoundingClientRect();

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  heartFlyer.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.6)`;
  heartFlyer.style.opacity = '0.9';

  setTimeout(() => {
    if (heartFlyer.parentElement) {
      heartFlyer.parentElement.removeChild(heartFlyer);
    }

    favTarget.classList.add('ks-heart-pulse');
    setTimeout(() => {
      favTarget.classList.remove('ks-heart-pulse');
    }, 400);

    if (onComplete) onComplete();
  }, 550);
}
