/**
 * Helper to normalize external social media links so they always open
 * as valid external URLs (target="_blank") and never trigger internal 404 routes.
 */
export function normalizeSocialUrl(platform, raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (!trimmed) return '';

  // Already absolute HTTP/HTTPS
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Handle '@username' or plain username
  const cleanHandle = trimmed.replace(/^@+/, '');

  switch (platform?.toLowerCase()) {
    case 'instagram':
      if (trimmed.includes('instagram.com/')) {
        return `https://${trimmed.replace(/^https?:\/\//i, '')}`;
      }
      return `https://www.instagram.com/${cleanHandle}`;

    case 'tiktok':
      if (trimmed.includes('tiktok.com/')) {
        return `https://${trimmed.replace(/^https?:\/\//i, '')}`;
      }
      return `https://www.tiktok.com/@${cleanHandle}`;

    case 'facebook':
      if (trimmed.includes('facebook.com/')) {
        return `https://${trimmed.replace(/^https?:\/\//i, '')}`;
      }
      return `https://www.facebook.com/${cleanHandle}`;

    case 'youtube':
      if (trimmed.includes('youtube.com/')) {
        return `https://${trimmed.replace(/^https?:\/\//i, '')}`;
      }
      return `https://www.youtube.com/@${cleanHandle}`;

    case 'x':
    case 'twitter':
      if (trimmed.includes('x.com/') || trimmed.includes('twitter.com/')) {
        return `https://${trimmed.replace(/^https?:\/\//i, '')}`;
      }
      return `https://x.com/${cleanHandle}`;

    case 'whatsapp': {
      const digits = trimmed.replace(/[^0-9]/g, '');
      return `https://wa.me/${digits}`;
    }

    default:
      return `https://${trimmed}`;
  }
}
