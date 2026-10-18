/* Generated from this release's verified static files. */
const SCOPE = self.registration.scope;
const PREFIX = "nature-guardian-shell:" + new URL(SCOPE).pathname + ":";
const VERSION = "cc9c9150327c7b4c7256";
const CACHE = PREFIX + VERSION;
const ENTRIES = [{"path":"assets/index-CLcQGexs.js","hash":"349b0b3b12eefda8adf1bf5e56d6288f1390a41216540e3d0ef2f8aaef07ac66"},{"path":"assets/index-u2KAl6em.css","hash":"b16315a51f354735a10bd11bc51f0a0bf05029eaa9ab033d064f252b13f51096"},{"path":"icons/apple-touch-icon.png","hash":"ddbb117a64e3ca7fd303591397e282d238f917e262070f9312e9f28c5dfe321e"},{"path":"icons/icon-192.png","hash":"5bdc40ea0f3a77437728a145193a140f2876956b9457f42461e2b6b0a7d34b6a"},{"path":"icons/icon-512.png","hash":"a11415fef42b457a116cd5309332e01e09e6df51f74fbfc54875b0d9228bce38"},{"path":"index.html","hash":"f24111a0c62b3816081a6b11d0b708a81d624953e3a9452590c7e1e4970dd303"},{"path":"leaf.svg","hash":"e74e7b204f07dfb7dbeea739c010b96271d2edf2af2431ee420314d883fe35c9"},{"path":"manifest.webmanifest","hash":"b40add0ff30065a91fbb781c516183e73e15663ddfb0557d786501e126abdc6b"}].map(entry => ({...entry, url:new URL(entry.path, SCOPE).href}));
const INDEX = new URL("index.html", SCOPE).href;
const ROOT = new URL("./", SCOPE).href;
const URLS = new Set([ROOT, ...ENTRIES.map(entry=>entry.url)]);
async function prepareShell() {
    const responses = await Promise.all(ENTRIES.map(async entry=>{
      const response = await fetch(entry.url, {cache:"reload",redirect:"error"});
      if(!response.ok) throw new Error("Offline download failed");
      const bytes = await response.clone().arrayBuffer();
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)), b=>b.toString(16).padStart(2,"0")).join("");
      if(hash!==entry.hash) throw new Error("Offline file integrity mismatch");
      return [entry.url, response];
    }));
    const cache = await caches.open(CACHE);
    await Promise.all(responses.map(([url,response])=>cache.put(url,response)));
    await cache.put(ROOT, await cache.match(INDEX));
}
self.addEventListener("install", event => event.waitUntil(prepareShell()));
self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    await Promise.all((await caches.keys()).filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("message", event => {
  if(event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
  if(["OFFLINE_STATUS", "PREPARE_OFFLINE"].includes(event.data?.type) && event.ports[0]) {
    event.waitUntil((async()=>{
      if(event.data.type === "PREPARE_OFFLINE") {
        try { await prepareShell(); } catch {
          event.ports[0].postMessage({type:"OFFLINE_STATUS",ready:false,version:VERSION});
          return;
        }
      }
      const cache = await caches.open(CACHE);
      const complete = (await Promise.all([...URLS].map(url=>cache.match(url)))).every(Boolean);
      event.ports[0].postMessage({type:"OFFLINE_STATUS",ready:complete,version:VERSION});
    })());
  }
});
self.addEventListener("fetch", event => {
  const request=event.request;
  if(request.method!=="GET") return;
  const url = new URL(request.url); url.search=""; url.hash="";
  if(!URLS.has(url.href)) return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    return await cache.match(url.href) || fetch(request);
  })());
});
