/**
 * @name WiderUserArea
 * @version 0.2.3
 * @description A BetterDiscord plugin that expands your user area into the server list, compatible with most themes
 * @author TheLazySquid
 * @authorId 619261917352951815
 * @website https://github.com/TheLazySquid/DiscordWiderUserArea
 * @source https://github.com/TheLazySquid/DiscordWiderUserArea/blob/main/build/WiderUserArea.plugin.js
 */
module.exports = class {
    constructor() {
'use strict';

var styles = ":root {\r\n    --user-area-bottom: 0;\r\n    --user-area-left: 0;\r\n}\r\n\r\nnav[class*=\"guilds_\"] {\r\n    height: var(--sidebar-height);\r\n}\r\n\r\n[class*=\"sidebar_\"] {\r\n    height: calc(var(--sidebar-height) - var(--notices-height));\r\n}\r\n\r\n/* user area */\r\nsection[class*=\"panels_\"] {\r\n    position: fixed;\r\n    overflow: hidden;\r\n    bottom: var(--user-area-bottom);\r\n    left: var(--user-area-left);\r\n    width: var(--user-area-width);\r\n}\r\n\r\n[class*=\"avatarWrapper_\"] {\r\n    flex-grow: 1;\r\n}\r\n\r\n/* prevent the user info popout from clipping */\r\n[class*=\"accountProfilePopoutWrapper\"] {\r\n    left: 0;\r\n}";

const userAreaSelector = 'section[class*="panels_"]';
const serverListSelector = 'nav[class*="guilds_"]';
const containerSelector = `div:has(> ${serverListSelector})`;
const layerSelector = `[class*="baseLayer"]`;
const channelsSelector = '[class*="sidebar_"] > nav';
const scaleRegex = /scale\((.*)\)/;
const UAButtonsSelector = 'div[class*="avatarWrapper_"] + div';
const firstServerListSelector = `${serverListSelector}:first-child`;
const secondServerListSelector = `${serverListSelector}:nth-child(2)`;

function scaleDOMRect(rect, scale, scaleCenterX, scaleCenterY) {
    // Calculate the distance of the rect from the scale center
    const distX = rect.x - scaleCenterX;
    const distY = rect.y - scaleCenterY;
    // Scale the distances
    const newDistX = distX * scale;
    const newDistY = distY * scale;
    // Calculate the new position of the rect
    const newX = scaleCenterX + newDistX;
    const newY = scaleCenterY + newDistY;
    // Scale the dimensions of the rect
    const newWidth = rect.width * scale;
    const newHeight = rect.height * scale;
    // Create a new DOMRect with the new dimensions and position
    const newRect = new DOMRect(newX, newY, newWidth, newHeight);
    return newRect;
}

const createCallbackHandler = (callbackName) => {
    const fullName = callbackName + "Callbacks";
    this[fullName] = [];
    this[callbackName] = () => {
        for (let i = 0; i < this[fullName].length; i++) {
            this[fullName][i].callback();
        }
    };
    return (callback, once, id) => {
        let object = { callback };
        const delCallback = () => {
            this[fullName].splice(this[fullName].indexOf(object), 1);
        };
        // if once is true delete it after use
        if (once === true) {
            object.callback = () => {
                callback();
                delCallback();
            };
        }
        if (id) {
            object.id = id;
            for (let i = 0; i < this[fullName].length; i++) {
                if (this[fullName][i].id === id) {
                    this[fullName][i] = object;
                    return delCallback;
                }
            }
        }
        this[fullName].push(object);
        return delCallback;
    };
};
/**
 * Takes a callback and fires it when the plugin is started
 * @param callback - The callback to be fired
 * @param once - If true, the callback will be deleted after use
 * @param id - The id of the callback - if it already exists, it will be replaced
 * @returns A function to delete the callback
 */
const onStart = createCallbackHandler("start");
/**
 * Takes a callback and fires it when the plugin is stopped
 * @param callback - The callback to be fired
 * @param once - If true, the callback will be deleted after use
 * @param id - The id of the callback - if it already exists, it will be replaced
 * @returns A function to delete the callback
 */
const onStop = createCallbackHandler("stop");
/**
 * Takes a callback and fires it when the user navigates
 * @param callback - The callback to be fired
 * @param once - If true, the callback will be deleted after use
 * @param id - The id of the callback - if it already exists, it will be replaced
 * @returns A function to delete the callback
 */
const onSwitch = createCallbackHandler("onSwitch");

/**
 * Watches for an element with a given selector to be added to the DOM
 * @param selector The CSS selector to watch
 * @param callback The callback to run whenever the matching element is added to the DOM
 * @returns A function to stop watching
 */
function watchElement(selector, callback) {
    let observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                for (let node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement))
                        continue;
                    if (node.matches && node.matches(selector)) {
                        callback(node);
                    }
                    if (node.querySelectorAll) {
                        for (let element of node.querySelectorAll(selector)) {
                            callback(element);
                        }
                    }
                }
            }
        }
    });
    let startDispose = onStart(() => {
        observer.observe(document.body, { childList: true, subtree: true });
        for (let element of document.querySelectorAll(selector)) {
            callback(element);
        }
    });
    let stopDispose = onStop(() => {
        observer.disconnect();
    });
    return () => {
        observer.disconnect();
        startDispose();
        stopDispose();
    };
}

// @ts-ignore
let baseChannelHeight = 0;
let baseChannelWidth = 0;
let varsSet = new Set();
const recalcDebounce = BdApi.Utils.debounce(() => {
    const userArea = document.querySelector(userAreaSelector);
    if (userArea)
        userAreaFound(userArea);
}, 150);
watchElement(userAreaSelector, userAreaFound);
let userAreaObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        updateVar('--sidebar-height', `${baseChannelHeight - entry.contentRect.height}px`);
    }
});
let channelsRect;
let secondChannelsRect;
let channelsObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        channelsRect = entry.contentRect;
        // hide everything but the profile picture if the channel list is hidden
        let btns = document.querySelector(UAButtonsSelector);
        if (entry.contentRect.width === 0) {
            if (btns)
                btns.style.display = 'none';
        }
        else {
            if (btns)
                btns.style.display = '';
        }
        let newWidth = entry.contentRect.right - baseChannelWidth;
        if (secondChannelsRect)
            newWidth += secondChannelsRect.width;
        updateVar('--user-area-width', `${newWidth}px`);
    }
});
watchElement(channelsSelector, (element) => {
    channelsObserver.disconnect();
    channelsObserver.observe(element);
});
let secondServerListObserver = new ResizeObserver((entries) => {
    if (!channelsRect)
        return;
    for (let entry of entries) {
        secondChannelsRect = entry.contentRect;
        let width = entry.contentRect.width;
        updateVar('--user-area-width', `${channelsRect.right - baseChannelWidth + width}px`);
    }
});
watchElement(secondServerListSelector, (element) => {
    secondServerListObserver.disconnect();
    secondServerListObserver.observe(element);
});
let themesObserver = new MutationObserver(async () => {
    // wait a bit for it to apply
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('theme changed');
    // recalculate the user area
    const userArea = document.querySelector(userAreaSelector);
    if (userArea)
        userAreaFound(userArea);
});
let noticesHeight = 0;
let noticesObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
        noticesHeight = entry.contentRect.height;
        updateVar('--notices-height', `${entry.contentRect.height}px`);
    }
});
function updateVar(name, value) {
    BdApi.DOM.removeStyle(`wua-${name}`);
    BdApi.DOM.addStyle(`wua-${name}`, `:root { ${name}: ${value} !important; }`);
    varsSet.add(name);
}
onSwitch(() => {
    // hacky fix for betteranimations sometimes giving a parent the "perspective" style breaking the fixed positioning
    setTimeout(() => {
        const userArea = document.querySelector(userAreaSelector);
        let parent = userArea?.parentElement;
        while (parent) {
            if (parent.style.perspective) {
                parent.style.perspective = '';
                break;
            }
            parent = parent.parentElement;
        }
        userAreaFound(userArea);
    }, 5100);
});
function userAreaFound(element) {
    // remove the old style if it exists
    BdApi.DOM.removeStyle('wua-styles');
    const layer = document.querySelector(layerSelector);
    const container = document.querySelector(containerSelector);
    const serverList = document.querySelector(firstServerListSelector);
    const channels = document.querySelector(channelsSelector);
    const secondServerList = document.querySelector(secondServerListSelector);
    const layerScale = 1 / parseFloat(scaleRegex.exec(layer.style.transform)?.[1] ?? '1');
    const layerRect = layer.getBoundingClientRect();
    const centerX = layerRect.left + layerRect.width / 2;
    const centerY = layerRect.top + layerRect.height / 2;
    // this scaling is neccesary for compatibility with betterAnimations,
    // which sometimes scales the layer when in a settings menu, which is where theme switches would be.
    const rect = scaleDOMRect(element.getBoundingClientRect(), layerScale, centerX, centerY);
    const containerRect = scaleDOMRect(container.getBoundingClientRect(), layerScale, centerX, centerY);
    const serverListRect = scaleDOMRect(serverList.getBoundingClientRect(), layerScale, centerX, centerY);
    const channelsRect = scaleDOMRect(channels.getBoundingClientRect(), layerScale, centerX, centerY);
    // figure out how far from the bottom of the screen the user area is
    const bottom = containerRect.bottom - rect.bottom;
    baseChannelHeight = channelsRect.height + rect.height;
    baseChannelWidth = serverListRect.left - channelsRect.left;
    if (secondServerList) {
        const secondServerListRect = scaleDOMRect(secondServerList.getBoundingClientRect(), layerScale, centerX, centerY);
        baseChannelWidth += secondServerListRect.width;
    }
    // add the new style
    BdApi.DOM.addStyle('wua-styles', styles);
    updateVar('--sidebar-height', `${channelsRect.height + noticesHeight}px`);
    updateVar('--user-area-width', `${channelsRect.right - serverListRect.left}px`);
    updateVar('--user-area-left', `${serverListRect.left}px`);
    updateVar('--user-area-bottom', `${bottom}px`);
    userAreaObserver.observe(element);
}
onStart(() => {
    window.addEventListener('resize', recalcDebounce);
    themesObserver.observe(document.querySelector("bd-themes"), { childList: true, subtree: true });
    updateVar('--notices-height', '0px');
    noticesObserver.observe(document.querySelector("#bd-notices"));
});
onStop(() => {
    userAreaObserver.disconnect();
    channelsObserver.disconnect();
    themesObserver.disconnect();
    secondServerListObserver.disconnect();
    noticesObserver.disconnect();
    BdApi.DOM.removeStyle('wua-styles');
    for (let varName of varsSet) {
        BdApi.DOM.removeStyle(`wua-${varName}`);
    }
    window.removeEventListener('resize', recalcDebounce);
});
    }
}
