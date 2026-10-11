// Product utilities for Keeper Sports: Color normalization & image resolution

const COLOR_NAMES_PALETTE = [
  // Neutrals / Achromatics
  { name: 'Pure White', rgb: [255, 255, 255], hex: 'ffffff' },
  { name: 'White', rgb: [250, 250, 250], hex: 'fafafa' },
  { name: 'Off White', rgb: [245, 245, 240], hex: 'f5f5f0' },
  { name: 'Ivory', rgb: [255, 255, 240], hex: 'fffff0' },
  { name: 'Pitch Black', rgb: [0, 0, 0], hex: '000000' },
  { name: 'Jet Black', rgb: [18, 18, 18], hex: '121212' },
  { name: 'Black', rgb: [28, 28, 28], hex: '1c1c1c' },
  { name: 'Charcoal', rgb: [54, 54, 54], hex: '363636' },
  { name: 'Dark Gray', rgb: [70, 70, 70], hex: '464646' },
  { name: 'Slate Gray', rgb: [112, 128, 144], hex: '708090' },
  { name: 'Gray', rgb: [128, 128, 128], hex: '808080' },
  { name: 'Silver', rgb: [192, 192, 192], hex: 'c0c0c0' },
  { name: 'Light Gray', rgb: [211, 211, 211], hex: 'd3d3d3' },
  { name: 'Platinum', rgb: [229, 228, 226], hex: 'e5e4e2' },

  // Reds & Pinks
  { name: 'Keeper Red', rgb: [225, 6, 0], hex: 'e10600' },
  { name: 'Crimson Red', rgb: [220, 20, 60], hex: 'dc143c' },
  { name: 'Scarlet', rgb: [255, 36, 0], hex: 'ff2400' },
  { name: 'Red', rgb: [255, 0, 0], hex: 'ff0000' },
  { name: 'Dark Red', rgb: [139, 0, 0], hex: '8b0000' },
  { name: 'Maroon', rgb: [128, 0, 0], hex: '800000' },
  { name: 'Burgundy', rgb: [128, 0, 32], hex: '800020' },
  { name: 'Wine', rgb: [114, 47, 55], hex: '722f37' },
  { name: 'Coral', rgb: [255, 127, 80], hex: 'ff7f50' },
  { name: 'Salmon', rgb: [250, 128, 114], hex: 'fa8072' },
  { name: 'Hot Pink', rgb: [255, 105, 180], hex: 'ff69b4' },
  { name: 'Rose', rgb: [255, 0, 127], hex: 'ff007f' },
  { name: 'Pink', rgb: [255, 192, 203], hex: 'ffc0cb' },
  { name: 'Light Pink', rgb: [255, 182, 193], hex: 'ffb6c1' },

  // Blues
  { name: 'Navy Blue', rgb: [0, 0, 128], hex: '000080' },
  { name: 'Midnight Blue', rgb: [25, 25, 112], hex: '191970' },
  { name: 'Deep Royal Blue', rgb: [0, 35, 102], hex: '002366' },
  { name: 'Royal Blue', rgb: [65, 105, 225], hex: '4169e1' },
  { name: 'Cobalt Blue', rgb: [0, 71, 171], hex: '0047ab' },
  { name: 'Electric Blue', rgb: [0, 102, 255], hex: '0066ff' },
  { name: 'Blue', rgb: [0, 0, 255], hex: '0000ff' },
  { name: 'Dodger Blue', rgb: [30, 144, 255], hex: '1e90ff' },
  { name: 'Sky Blue', rgb: [135, 206, 235], hex: '87ceeb' },
  { name: 'Baby Blue', rgb: [137, 207, 240], hex: '89cff0' },
  { name: 'Light Blue', rgb: [173, 216, 230], hex: 'add8e6' },
  { name: 'Ice Blue', rgb: [200, 230, 245], hex: 'c8e6f5' },
  { name: 'Cyan', rgb: [0, 255, 255], hex: '00ffff' },
  { name: 'Turquoise', rgb: [64, 224, 208], hex: '40e0d0' },
  { name: 'Teal', rgb: [0, 128, 128], hex: '008080' },
  { name: 'Dark Teal', rgb: [0, 90, 90], hex: '005a5a' },

  // Greens
  { name: 'Forest Green', rgb: [34, 139, 34], hex: '228b22' },
  { name: 'Dark Green', rgb: [0, 100, 0], hex: '006400' },
  { name: 'Emerald Green', rgb: [80, 200, 120], hex: '50c878' },
  { name: 'Pine Green', rgb: [1, 121, 111], hex: '01796f' },
  { name: 'Green', rgb: [0, 128, 0], hex: '008000' },
  { name: 'Kelly Green', rgb: [76, 187, 23], hex: '4cbb17' },
  { name: 'Neon Green', rgb: [57, 255, 20], hex: '39ff14' },
  { name: 'Lime Green', rgb: [50, 205, 50], hex: '32cd32' },
  { name: 'Olive Green', rgb: [128, 128, 0], hex: '808000' },
  { name: 'Army Green', rgb: [75, 83, 32], hex: '4b5320' },
  { name: 'Mint Green', rgb: [152, 255, 152], hex: '98ff98' },
  { name: 'Sage Green', rgb: [158, 170, 140], hex: '9eaa8c' },

  // Yellows & Golds & Oranges
  { name: 'Bright Yellow', rgb: [255, 255, 0], hex: 'ffff00' },
  { name: 'Yellow', rgb: [250, 230, 50], hex: 'fae632' },
  { name: 'Neon Yellow', rgb: [255, 255, 51], hex: 'ffff33' },
  { name: 'Lemon', rgb: [255, 250, 20], hex: 'fffa14' },
  { name: 'Gold', rgb: [255, 215, 0], hex: 'ffd700' },
  { name: 'Metallic Gold', rgb: [212, 175, 55], hex: 'd4af37' },
  { name: 'Amber', rgb: [255, 191, 0], hex: 'ffbf00' },
  { name: 'Dark Orange', rgb: [255, 140, 0], hex: 'ff8c00' },
  { name: 'Orange', rgb: [255, 165, 0], hex: 'ffa500' },
  { name: 'Neon Orange', rgb: [255, 95, 31], hex: 'ff5f1f' },
  { name: 'Bronze', rgb: [205, 127, 50], hex: 'cd7f32' },
  { name: 'Copper', rgb: [184, 115, 51], hex: 'b87333' },

  // Purples & Violets
  { name: 'Purple', rgb: [128, 0, 128], hex: '800080' },
  { name: 'Dark Purple', rgb: [60, 0, 90], hex: '3c005a' },
  { name: 'Violet', rgb: [138, 43, 226], hex: '8a2be2' },
  { name: 'Indigo', rgb: [75, 0, 130], hex: '4b0082' },
  { name: 'Plum', rgb: [142, 69, 133], hex: '8e4585' },
  { name: 'Magenta', rgb: [255, 0, 255], hex: 'ff00ff' },
  { name: 'Lavender', rgb: [230, 230, 250], hex: 'e6e6fa' },
  { name: 'Lilac', rgb: [200, 162, 200], hex: 'c8a2c8' },

  // Browns & Earth
  { name: 'Chocolate', rgb: [123, 63, 0], hex: '7b3f00' },
  { name: 'Brown', rgb: [139, 69, 19], hex: '8b4513' },
  { name: 'Dark Brown', rgb: [65, 35, 15], hex: '41230f' },
  { name: 'Coffee', rgb: [111, 78, 55], hex: '6f4e37' },
  { name: 'Tan', rgb: [210, 180, 140], hex: 'd2b48c' },
  { name: 'Khaki', rgb: [195, 176, 145], hex: 'c3b091' },
  { name: 'Beige', rgb: [245, 245, 220], hex: 'f5f5dc' },
  { name: 'Sand', rgb: [236, 213, 165], hex: 'ecd5a5' }
];

/**
 * Returns a human-friendly color name instead of raw hex values like ffffff, 111111, etc.
 * Uses perceptual distance matching across a comprehensive palette, so it never returns generic "Custom Color".
 */
export function formatColorName(colorStr) {
  if (!colorStr) return '';
  const clean = String(colorStr).trim().replace(/^#/, '').toLowerCase();

  // If it's a 3 or 6 digit hex code, find the nearest perceptual color name
  if (/^[0-9a-f]{3,8}$/i.test(clean)) {
    let hex = clean;
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    } else if (hex.length >= 6) {
      hex = hex.substring(0, 6);
    } else {
      hex = hex.padEnd(6, '0');
    }

    // Exact hex match first
    const exact = COLOR_NAMES_PALETTE.find((c) => c.hex === hex);
    if (exact) return exact.name;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    let closest = COLOR_NAMES_PALETTE[0];
    let minDistance = Infinity;

    for (const item of COLOR_NAMES_PALETTE) {
      // Weighted perceptual color distance
      const dr = r - item.rgb[0];
      const dg = g - item.rgb[1];
      const db = b - item.rgb[2];
      const dist = 0.3 * (dr * dr) + 0.59 * (dg * dg) + 0.11 * (db * db);

      if (dist < minDistance) {
        minDistance = dist;
        closest = item;
      }
    }

    return closest.name;
  }

  // If standard words (e.g. "black", "royal blue"), capitalize title-case
  return String(colorStr)
    .trim()
    .split(/[\s-_]+/)
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
