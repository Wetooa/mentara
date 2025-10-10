

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.5ge8EAzQ.js","_app/immutable/chunks/C6BjpI8V.js","_app/immutable/chunks/DGNEGb3f.js"];
export const stylesheets = ["_app/immutable/assets/0.CHotjUP5.css"];
export const fonts = [];
