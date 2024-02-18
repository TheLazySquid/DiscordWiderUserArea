// @ts-ignore
import styles from './styles.css';
import { userAreaSelector, containerSelector, layerSelector, serverListSelector, channelsSelector, scaleRegex } from './constants';
import { scaleDOMRect } from './utils';
import { onStart, onStop, watchElement } from 'lazypluginlib';

let themesObserver: MutationObserver;
let channelResizeObserver: ResizeObserver;
let baseChannelSize: number = 0;
let varsSet: Set<string> = new Set();
    
watchElement(userAreaSelector, userAreaFound);

channelResizeObserver = new ResizeObserver(entries => {
    for(let entry of entries) {
        updateVar('--sidebar-height', `${baseChannelSize - entry.contentRect.height}px`);
    }
})

themesObserver = new MutationObserver(async () => {
    // wait a bit for it to apply
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('theme changed')

    // recalculate the user area
    const userArea = document.querySelector<HTMLDivElement>(userAreaSelector)
    if(userArea) userAreaFound(userArea);
})

let recalcDebounce = BdApi.Utils.debounce(() => {
    const userArea = document.querySelector<HTMLDivElement>(userAreaSelector)
    if(userArea) userAreaFound(userArea);
}, 150)

window.addEventListener('resize', recalcDebounce);

function updateVar(name: string, value: string) {
    BdApi.DOM.removeStyle(`wua-${name}`);
    BdApi.DOM.addStyle(`wua-${name}`, `:root { ${name}: ${value} !important; }`)
    varsSet.add(name);
}

function userAreaFound(element: HTMLElement) {
    // remove the old style if it exists
    BdApi.DOM.removeStyle('wua-styles');

    const layer = document.querySelector<HTMLDivElement>(layerSelector)!;
    const container = document.querySelector<HTMLDivElement>(containerSelector)!;
    const serverList = document.querySelector<HTMLDivElement>(serverListSelector)!;
    const channels = document.querySelector<HTMLDivElement>(channelsSelector)!;

    const layerScale = 1 / parseFloat(scaleRegex.exec(layer.style.transform)?.[1] ?? '1');
    const layerRect = layer.getBoundingClientRect();

    const centerX = layerRect.left + layerRect.width / 2;
    const centerY = layerRect.top + layerRect.height / 2;

    // this scaling is neccesary for compatibility with betterAnimations,
    // which sometimes scales the layer when in a settings menu, which is where theme switches would be.
    const rect = scaleDOMRect(element.getBoundingClientRect(), layerScale, centerX, centerY)
    const containerRect = scaleDOMRect(container.getBoundingClientRect(), layerScale, centerX, centerY)
    const serverListRect = scaleDOMRect(serverList.getBoundingClientRect(), layerScale, centerX, centerY)
    const channelsRect = scaleDOMRect(channels.getBoundingClientRect(), layerScale, centerX, centerY) 

    // figure out how far from the bottom of the screen the user area is
    const bottom = containerRect.bottom - rect.bottom;

    baseChannelSize = channelsRect.height + rect.height;
    
    // add the new style
    BdApi.DOM.addStyle('wua-styles', styles);
    updateVar('--sidebar-height', `${channelsRect.height}px`);
    updateVar('--user-area-width', `${rect.right - serverListRect.left}px`);
    updateVar('--user-area-left', `${serverListRect.left}px`);
    updateVar('--user-area-bottom', `${bottom}px`)

    channelResizeObserver.observe(element)
}
    
onStart(() => {
    themesObserver.observe(document.querySelector("bd-themes")!, { childList: true, subtree: true })
})

onStop(() => {
    BdApi.DOM.removeStyle('wua-styles');
    channelResizeObserver.disconnect();
    themesObserver.disconnect();
    for(let varName of varsSet) {
        BdApi.DOM.removeStyle(`wua-${varName}`);
    }
})