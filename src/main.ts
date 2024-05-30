// @ts-ignore
import styles from './styles.css';
import { userAreaSelector, containerSelector, layerSelector, serverListSelector, channelsSelector, scaleRegex, UAButtonsSelector } from './constants';
import { scaleDOMRect } from './utils';
import { onStart, onStop, onSwitch, watchElement } from 'lazypluginlib';

let baseChannelHeight: number = 0;
let baseChannelWidth: number = 0;
let varsSet: Set<string> = new Set();

const recalcDebounce = BdApi.Utils.debounce(() => {
    const userArea = document.querySelector<HTMLDivElement>(userAreaSelector)
    if(userArea) userAreaFound(userArea);
}, 150)
    
watchElement(userAreaSelector, userAreaFound);

let userAreaObserver = new ResizeObserver(entries => {
    for(let entry of entries) {
        updateVar('--sidebar-height', `${baseChannelHeight - entry.contentRect.height}px`);
    }
})

let channelsObserver = new ResizeObserver(entries => {
    for(let entry of entries) {
        // hide everything but the profile picture if the channel list is hidden
        let btns = document.querySelector(UAButtonsSelector) as HTMLDivElement;
        if(entry.contentRect.width === 0) {
            if(btns) btns.style.display = 'none';
        } else {
            if(btns) btns.style.display = '';
        }
        updateVar('--user-area-width', `${entry.contentRect.right - baseChannelWidth}px`);
    }
})

watchElement(channelsSelector, (element) => {
    channelsObserver.observe(element);
})

let themesObserver = new MutationObserver(async () => {
    // wait a bit for it to apply
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('theme changed')

    // recalculate the user area
    const userArea = document.querySelector<HTMLDivElement>(userAreaSelector)
    if(userArea) userAreaFound(userArea);
})

function updateVar(name: string, value: string) {
    BdApi.DOM.removeStyle(`wua-${name}`);
    BdApi.DOM.addStyle(`wua-${name}`, `:root { ${name}: ${value} !important; }`)
    varsSet.add(name);
}

onSwitch(() => {
    // hacky fix for betteranimations sometimes giving a parent the "perspective" style breaking the fixed positioning
    setTimeout(() => {
        const userArea = document.querySelector<HTMLDivElement>(userAreaSelector)
        let parent = userArea?.parentElement;
        while(parent) {
            if(parent.style.perspective) {
                parent.style.perspective = '';
                break;
            }
            parent = parent.parentElement;
        }
        userAreaFound(userArea!);
    }, 5100)
})

function userAreaFound(element: Element) {
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

    baseChannelHeight = channelsRect.height + rect.height;
    baseChannelWidth = serverListRect.left - channelsRect.left;
    
    // add the new style
    BdApi.DOM.addStyle('wua-styles', styles);
    updateVar('--sidebar-height', `${channelsRect.height}px`);
    updateVar('--user-area-width', `${channelsRect.right - serverListRect.left}px`);
    updateVar('--user-area-left', `${serverListRect.left}px`);
    updateVar('--user-area-bottom', `${bottom}px`)

    userAreaObserver.observe(element)
}
    
onStart(() => {
    window.addEventListener('resize', recalcDebounce);

    themesObserver.observe(document.querySelector("bd-themes")!, { childList: true, subtree: true })
})

onStop(() => {
    userAreaObserver.disconnect();
    channelsObserver.disconnect();
    themesObserver.disconnect();
    BdApi.DOM.removeStyle('wua-styles');
    for(let varName of varsSet) {
        BdApi.DOM.removeStyle(`wua-${varName}`);
    }

    window.removeEventListener('resize', recalcDebounce);
})