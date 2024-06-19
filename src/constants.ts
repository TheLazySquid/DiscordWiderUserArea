export const userAreaSelector = 'section[class*="panels_"]'
export const serverListSelector = 'nav[class*="guilds_"]'
export const containerSelector = `div:has(> ${serverListSelector})`
export const layerSelector = `[class*="baseLayer"]`
export const channelsSelector = '[class*="sidebar_"] > nav'
export const scaleRegex = /scale\((.*)\)/
export const UAButtonsSelector = 'div[class*="avatarWrapper_"] + div'