/**
 * Keeper Sports Favorite-to-Navbar Micro-Animation
 * Launches a small, fast, smooth heart flyer from the clicked heart button
 * to the visible Navbar Favorites / Heart icon.
 * Non-blocking, fast (~0.5s), respects `prefers-reduced-motion`.
 */

export function launchHeartToFavorites(startElement, onComplete) {
  if (typeof window === 'undefined') {
    if (onComplete) onComplete();
    return;
  }

  // Respect prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (onComplete) onComplete();
    return;
  }

  // Locate visible Navbar favorites target
  const targets = Array.from(
    document.querySelectorAll('.ks-nav-fav-btn, a[href="/favorites"], [data-nav-favorites="true"]')
  );
  const favTarget = targets.find((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }) || targets[0];

  if (!favTarget || !startElement) {
    if (onComplete) onComplete();
    return;
  }

  const startRect = startElement.getBoundingClientRect();
  const targetRect = favTarget.getBoundingClientRect();

  // Starting coordinates (center of start element)
  const startX = startRect.left + startRect.width / 2 - 9;
  const startY = startRect.top + startRect.height / 2 - 9;

  // Destination coordinates (center of favorites target)
  const endX = targetRect.left + targetRect.width / 2 - 9;
  const endY = targetRect.top + targetRect.height / 2 - 9;

  // Create flyer element
  const flyer = document.createElement('div');
  flyer.className = 'ks-heart-flyer';
  flyer.setAttribute('aria-hidden', 'true');
  flyer.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#E10600" stroke="#E10600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  `;

  flyer.style.position = 'fixed';
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.style.zIndex = '99999';
  flyer.style.pointerEvents = 'none';
  flyer.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.9, 0.35, 1), opacity 0.45s ease-out';
  flyer.style.transform = 'translate3d(0, 0, 0) scale(1)';
  flyer.style.opacity = '1';

  document.body.appendChild(flyer);

  // Force reflow
  flyer.getBoundingClientRect();

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  // Animate toward favorites in navbar
  flyer.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.6)`;
  flyer.style.opacity = '0.9';

  setTimeout(() => {
    if (flyer.parentElement) {
      flyer.parentElement.removeChild(flyer);
    }

    // Pulse animation on the navbar heart
    favTarget.classList.add('ks-fav-pulse');
    setTimeout(() => {
      favTarget.classList.remove('ks-fav-pulse');
    }, 450);

    if (onComplete) onComplete();
  }, 450);
}
