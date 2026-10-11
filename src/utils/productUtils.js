// Product utilities for Keeper Sports: Color normalization & image resolution

const HEX_COLOR_MAP = {
  'ffffff': 'White',
  'fff': 'White',
  '000000': 'Black',
  '000': 'Black',
  '111111': 'Black',
  '111': 'Black',
  '222222': 'Dark Charcoal',
  '333333': 'Charcoal',
  'e10600': 'Keeper Red',
  'ff0000': 'Red',
  'f00': 'Red',
  '0047ab': 'Cobalt Blue',
  '0000ff': 'Blue',
  '00f': 'Blue',
  '000080': 'Navy Blue',
  '1e792c': 'Forest Green',
  '00ff00': 'Green',
  'ffd700': 'Gold',
  'ffff00': 'Yellow',
  '808080': 'Gray',
  '7a7a7a': 'Gray',
  'a3a3a3': 'Light Gray',
  'c0c0c0': 'Silver',
  'ff69b4': 'Pink',
  'ff8c00': 'Dark Orange',
  'ffa500': 'Orange',
  '800080': 'Purple',
  '8b0000': 'Dark Red',
  '800000': 'Maroon',
  '4b0082': 'Indigo',
  '00ffff': 'Cyan',
  '008080': 'Teal',
  'a52a2a': 'Brown',
  'f5f5dc': 'Beige'
};

/**
 * Returns a human-friendly color name instead of raw hex values like ffffff, 111111, etc.
 */
export function formatColorName(colorStr) {
  if (!colorStr) return '';
  const clean = String(colorStr).trim().replace(/^#/, '').toLowerCase();
  
  if (HEX_COLOR_MAP[clean]) {
    return HEX_COLOR_MAP[clean];
  }

  // If it's a 3 or 6 digit hex code not in the explicit map, estimate by RGB components
  if (/^[0-9a-f]{3,6}$/i.test(clean)) {
    const hex = clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean.padEnd(6, '0');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (r > 235 && g > 235 && b > 235) return 'White';
    if (r < 30 && g < 30 && b < 30) return 'Black';
    if (Math.abs(r - g) < 22 && Math.abs(g - b) < 22) return r > 150 ? 'Light Gray' : 'Charcoal';
    if (r > 180 && g < 90 && b < 90) return 'Red';
    if (b > 180 && r < 90 && g < 160) return 'Blue';
    if (g > 160 && r < 110 && b < 110) return 'Green';
    if (r > 200 && g > 180 && b < 80) return 'Yellow';
    if (r > 200 && g > 100 && b < 60) return 'Orange';
    if (r > 120 && b > 120 && g < 90) return 'Purple';
    return 'Custom Color';
  }

  // If standard word (e.g. "black", "royal blue"), capitalize title-case
  return String(colorStr)
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Returns valid CSS color string for preview circles / dots
 */
export function getColorHex(colorStr) {
  if (!colorStr) return '#FFFFFF';
  const trimmed = String(colorStr).trim();
  if (trimmed.startsWith('#')) return trimmed;
  if (/^[0-9a-fA-F]{3,8}$/.test(trimmed)) return `#${trimmed}`;
  
  const lower = trimmed.toLowerCase();
  const known = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#E10600',
    blue: '#0047AB',
    navy: '#000080',
    green: '#1E792C',
    yellow: '#FFD700',
    gold: '#FFD700',
    gray: '#7A7A7A',
    grey: '#7A7A7A',
    silver: '#C0C0C0',
    orange: '#FFA500',
    purple: '#800080'
  };
  return known[lower] || colorStr;
}

/**
 * Resolves product image URL safely from various possible backend formats
 */
export function getProductImage(product, item = null) {
  // Check direct item properties first
  if (item?.coverImage) return item.coverImage;
  if (item?.image) return item.image;
  if (item?.image_url) return item.image_url;
  if (item?.cover_image_path_snapshot) return item.cover_image_path_snapshot;

  // Check product object properties
  if (product?.primaryImage) return product.primaryImage;
  if (product?.image_url) return product.image_url;
  if (product?.coverImage) return product.coverImage;

  // Check media array
  if (Array.isArray(product?.media) && product.media.length > 0) {
    const coverMedia = product.media.find((m) => m && m.is_cover);
    if (coverMedia?.storage_path) return coverMedia.storage_path;
    if (product.media[0]?.storage_path) return product.media[0].storage_path;
  }

  // Check product_media array
  if (Array.isArray(product?.product_media) && product.product_media.length > 0) {
    const coverMedia = product.product_media.find((m) => m && m.is_cover);
    if (coverMedia?.storage_path) return coverMedia.storage_path;
    if (product.product_media[0]?.storage_path) return product.product_media[0].storage_path;
  }

  // Check images string array
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images[0];
  }

  return null;
}
