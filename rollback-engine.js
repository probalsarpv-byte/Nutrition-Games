export function deepClone(obj){return typeof structuredClone==='function'?structuredClone(obj):JSON.parse(JSON.stringify(obj));}
export function makeSnapshot(game){return deepClone(game);}
export function restoreGame(target,snapshot){const fresh=deepClone(snapshot);for(const k of Object.keys(target))delete target[k];Object.assign(target,fresh);return target;}
