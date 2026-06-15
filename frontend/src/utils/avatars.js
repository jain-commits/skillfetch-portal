import React from 'react';

export const defaultAvatars = [
  { id: 'avatar1', label: 'Royal Blue-Violet', colors: ['#2563EB', '#7C3AED'] },
  { id: 'avatar2', label: 'Sunset Amber', colors: ['#F59E0B', '#EF4444'] },
  { id: 'avatar3', label: 'Emerald Forest', colors: ['#10B981', '#047857'] },
  { id: 'avatar4', label: 'Sweet Violet-Pink', colors: ['#EC4899', '#8B5CF6'] },
  { id: 'avatar5', label: 'Cyan Ocean', colors: ['#06B6D4', '#2563EB'] },
  { id: 'avatar6', label: 'Peach Sunrise', colors: ['#F97316', '#EF4444'] },
  { id: 'avatar7', label: 'Steel Obsidian', colors: ['#4B5563', '#111827'] },
  { id: 'avatar8', label: 'Electric Orchid', colors: ['#D946EF', '#701A75'] },
  { id: 'avatar9', label: 'Lime Mint', colors: ['#84CC16', '#10B981'] },
  { id: 'avatar10', label: 'Cherry Berry', colors: ['#EF4444', '#991B1B'] }
];

export const getAvatarUrl = (avatarId, name = '') => {
  if (!avatarId) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0056b3&color=fff&size=128`;
  }
  
  // If it's a custom uploaded image (base64 data), just return it directly
  if (avatarId.startsWith('data:image')) {
    return avatarId;
  }
  
  const avatar = defaultAvatars.find(a => a.id === avatarId) || defaultAvatars[0];
  const colors = avatar.colors;
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
  
  // Return the SVG data URL
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="grad_${avatar.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors[0]}" />
        <stop offset="100%" stop-color="${colors[1]}" />
      </linearGradient>
    </defs>
    <circle cx="64" cy="64" r="64" fill="url(#grad_${avatar.id})" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="700">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
