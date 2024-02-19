export const userAreaSelector = 'section[aria-label="User area"]'
export const serverListSelector = 'nav[aria-label="Servers sidebar"]'
export const containerSelector = `div:has(> ${serverListSelector})`
export const layerSelector = `[class*="layer__"]`
export const channelsSelector = '[class*="sidebar_"] > nav'
export const scaleRegex = /scale\((.*)\)/