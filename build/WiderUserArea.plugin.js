/**
 * @name WiderUserArea
 * @version 0.1.0
 * @description Expands your user area into the server list
 * @author TheLazySquid
 * @authorId 619261917352951815
 * @website github.com/TheLazySquid/DiscordWiderUserArea
 * @source github.com/TheLazySquid/DiscordWiderUserArea/blob/main/build/WiderUserArea.plugin.js
 */
module.exports = class {
    constructor() {
        const createCallbackHandler = (callbackName) => {
            const fullName = callbackName + "Callbacks";
            this[fullName] = [];
            return (callback, once, id) => {
                let object = { callback }

                const delCallback = () => {
                    this[fullName].splice(this[fullName].indexOf(object), 1);
                }
                
                // if once is true delete it after use
                if (once === true) {
                    object.callback = () => {
                        callback();
                        delCallback();
                    }
                }

                if(id) {
                    object.id = id

                    for(let i = 0; i < this[fullName].length; i++) {
                        if(this[fullName][i].id === id) {
                            this[fullName][i] = object;
                            return delCallback;
                        }
                    }
                }

                this[fullName].push(object);
                return delCallback;
            }
        }
        
        const onStart = createCallbackHandler("start");
        const onStop = createCallbackHandler("stop");
        const onSwitch = createCallbackHandler("onSwitch");

        const watchElement = (selector, callback) => {
            let observer = new MutationObserver((mutations) => {
                for (let mutation of mutations) {
                    if (mutation.addedNodes.length) {
                        for (let node of mutation.addedNodes) {
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

            onStart(() => {
                observer.observe(document.body, { childList: true, subtree: true });

                for(let element of document.querySelectorAll(selector)) {
                    callback(element);
                }
            });

            onStop(() => {
                observer.disconnect();
            });
        }

        const setSettingsPanel = (el) => {
            this.getSettingsPanel = () => el;
        }
'use strict';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var styles = ":root {\r\n    --user-area-bottom: 0;\r\n    --user-area-left: 0;\r\n}\r\n\r\n.sidebar_ded4b5,\r\nnav[aria-label=\"Servers sidebar\"] {\r\n    height: var(--sidebar-height);\r\n}\r\n\r\nsection[aria-label=\"User area\"] {\r\n    position: fixed;\r\n    bottom: var(--user-area-bottom);\r\n    left: var(--user-area-left);\r\n    width: var(--user-area-width);\r\n}\r\n\r\n.avatarWrapper_ba5175 {\r\n    flex-grow: 1;\r\n}";

const userAreaSelector = 'section[aria-label="User area"]';
const containerSelector = '.container__037ed';
const layerSelector = '.layer__2efaa';
const serverListSelector = 'nav[aria-label="Servers sidebar"]';
const channelsSelector = '.sidebar_ded4b5 > *';
const scaleRegex = /scale\((.*)\)/;

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

let themesObserver;
let channelResizeObserver;
let baseChannelSize = 0;
let varsSet = new Set();
watchElement(userAreaSelector, userAreaFound);
channelResizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        updateVar('--sidebar-height', `${baseChannelSize - entry.contentRect.height}px`);
    }
});
themesObserver = new MutationObserver(() => __awaiter(void 0, void 0, void 0, function* () {
    // wait a bit for it to apply
    yield new Promise(resolve => setTimeout(resolve, 1000));
    console.log('theme changed');
    // recalculate the user area
    const userArea = document.querySelector(userAreaSelector);
    if (userArea)
        userAreaFound(userArea);
}));
let recalcDebounce = BdApi.Utils.debounce(() => {
    const userArea = document.querySelector(userAreaSelector);
    if (userArea)
        userAreaFound(userArea);
}, 150);
window.addEventListener('resize', recalcDebounce);
function updateVar(name, value) {
    BdApi.DOM.removeStyle(`wua-${name}`);
    BdApi.DOM.addStyle(`wua-${name}`, `:root { ${name}: ${value} !important; }`);
    varsSet.add(name);
}
function userAreaFound(element) {
    var _a, _b;
    // remove the old style if it exists
    BdApi.DOM.removeStyle('wua-styles');
    const layer = document.querySelector(layerSelector);
    const container = document.querySelector(containerSelector);
    const serverList = document.querySelector(serverListSelector);
    const channels = document.querySelector(channelsSelector);
    const layerScale = 1 / parseFloat((_b = (_a = scaleRegex.exec(layer.style.transform)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : '1');
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
    baseChannelSize = channelsRect.height + rect.height;
    // add the new style
    BdApi.DOM.addStyle('wua-styles', styles);
    updateVar('--sidebar-height', `${channelsRect.height}px`);
    updateVar('--user-area-width', `${rect.right - serverListRect.left}px`);
    updateVar('--user-area-left', `${serverListRect.left}px`);
    updateVar('--user-area-bottom', `${bottom}px`);
    channelResizeObserver.observe(element);
}
onStart(() => {
    themesObserver.observe(document.querySelector("bd-themes"), { childList: true, subtree: true });
});
onStop(() => {
    BdApi.DOM.removeStyle('wua-styles');
    channelResizeObserver.disconnect();
    themesObserver.disconnect();
    for (let varName of varsSet) {
        BdApi.DOM.removeStyle(`wua-${varName}`);
    }
});
    }


    start() {
        for(let callback of this.startCallbacks) {
            callback.callback();
        }
    }
    
    stop() {
        for(let callback of this.stopCallbacks) {
            callback.callback();
        }
    }

    onSwitch() {
        for(let callback of this.onSwitchCallbacks) {
            callback.callback();
        }
    }
}
