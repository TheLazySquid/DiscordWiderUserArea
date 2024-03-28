export const userAreaSelector = 'section[class*="panels__"]'
export const serverListSelector = 'nav[class*="guilds__"]'
export const containerSelector = `div:has(> ${serverListSelector})`
export const layerSelector = `[class*="layers__"]`
export const channelsSelector = '[class*="sidebar_"] > nav'
export const scaleRegex = /scale\((.*)\)/
export const UAButtonsSelector = 'div[class*="avatarWrapper_"] + div'