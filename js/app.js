/* ============================================================
   PRISM — app logic
   Free, keyless image generation:
     · Pollinations (Sana)      — GET image.pollinations.ai
     · AI Horde (SD/SDXL/FLUX)  — stablehorde.net, anonymous key
   ============================================================ */
(() => {
'use strict';

/* ---------- tiny DOM helpers ---------- */
const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

/* ---------- model registry ---------- */
const IC = {
  pollinations: '<img src="assets/logos/pollinations.png" alt="" loading="lazy" />',
  flux:         '<img src="assets/logos/flux.png" alt="" loading="lazy" />',
  stability:    '<img src="assets/logos/stability.png" alt="" loading="lazy" />',
  albedobase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="4" y="14" width="16" height="6" rx="2"/><rect x="6.5" y="8.5" width="13" height="6" rx="2" opacity="0.75"/><rect x="9" y="3" width="10" height="6" rx="2" opacity="0.5"/></svg>`,
  juggernaut: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3l7.5 3v5.2c0 4.6-3.2 8-7.5 9.8-4.3-1.8-7.5-5.2-7.5-9.8V6L12 3z"/><path d="M8.6 12.2l2.4 2.4 4.6-4.8"/></svg>`,
  icbinp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2.1 2.1M15.9 15.9 18 18M18 6l-2.1 2.1M8.1 15.9 6 18"/><circle cx="12" cy="12" r="3.2"/></svg>`,
  dreamshaper: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z"/><path d="M17.5 4.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" fill="currentColor" stroke="none" opacity="0.85"/></svg>`,
  animagine: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3.5l2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2 2-5.4z"/><path d="M18.8 15.2l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6z" fill="currentColor" stroke="none" opacity="0.8"/></svg>`,
};

const MODELS = [
  {
    id: 'sana', name: 'Sana', sub: 'Pollinations · instant text-to-image',
    provider: 'pollinations', icon: IC.pollinations, iconTint: '#c4b5fd',
    img2img: false, badges: [{ k: 'fast', t: 'fast' }, { k: 'mark', t: 'watermark' }],
    desc: 'Quick drafts, no queue.',
  },
  {
    id: 'flux', name: 'FLUX.1 Schnell', sub: 'Black Forest Labs · flagship',
    provider: 'horde', hordeModel: 'Flux.1-Schnell fp8 (Compact)',
    icon: IC.flux, iconTint: '#7dd3fc',
    img2img: true, steps: { min: 2, max: 8, def: 4 }, cfg: 1.5,
    badges: [{ k: 'i2i', t: 'reference' }],
    desc: 'Best prompt adherence.',
  },
  {
    id: 'albedobase', name: 'AlbedoBase XL 3.1', sub: 'SDXL · all-rounder',
    provider: 'horde', hordeModel: 'AlbedoBase XL 3.1',
    icon: IC.albedobase, iconTint: '#a5b4fc',
    img2img: true, badges: [{ k: 'i2i', t: 'reference' }],
  },
  {
    id: 'juggernaut', name: 'Juggernaut XL', sub: 'SDXL · photoreal',
    provider: 'horde', hordeModel: 'Juggernaut XL',
    icon: IC.juggernaut, iconTint: '#fda4af',
    img2img: true, badges: [{ k: 'i2i', t: 'reference' }],
  },
  {
    id: 'icbinp', name: 'ICBINP', sub: 'Stable Diffusion · photography',
    provider: 'horde', hordeModel: "ICBINP - I Can't Believe It's Not Photography",
    icon: IC.icbinp, iconTint: '#86efac',
    img2img: true, badges: [{ k: 'i2i', t: 'reference' }, { k: 'slow', t: 'slower' }],
  },
  {
    id: 'animagine', name: 'Animagine XL', sub: 'SDXL · anime & illustration',
    provider: 'horde', hordeModel: 'Animagine XL',
    icon: IC.animagine, iconTint: '#f9a8d4',
    img2img: true, badges: [{ k: 'i2i', t: 'reference' }],
  },
  {
    id: 'dreamshaper', name: 'Dreamshaper', sub: 'Stable Diffusion · painterly',
    provider: 'horde', hordeModel: 'Dreamshaper',
    icon: IC.dreamshaper, iconTint: '#fcd34d',
    img2img: true, badges: [{ k: 'i2i', t: 'reference' }],
  },
  {
    id: 'sd15', name: 'Stable Diffusion 1.5', sub: 'Stability AI · the classic',
    provider: 'horde', hordeModel: 'stable_diffusion',
    icon: IC.stability, iconTint: '#e9d5ff',
    img2img: true, badges: [{ k: 'i2i', t: 'reference' }, { k: 'slow', t: 'slower' }],
  },
];

const RATIOS = [
  { id: '1:1',  poll: [768, 768], horde: [576, 576] },
  { id: '4:3',  poll: [768, 576], horde: [640, 448] },
  { id: '3:4',  poll: [576, 768], horde: [448, 640] },
  { id: '16:9', poll: [768, 432], horde: [704, 384] },
  { id: '9:16', poll: [432, 768], horde: [384, 704] },
];

const STYLES = [
  { id: 'none', label: 'No style', suffix: '' },
  { id: 'cinematic', label: 'Cinematic', suffix: ', cinematic lighting, dramatic composition, film still, anamorphic, shallow depth of field' },
  { id: 'photo', label: 'Photoreal', suffix: ', photorealistic, 85mm lens, natural light, high detail, RAW photo' },
  { id: 'anime', label: 'Anime', suffix: ', anime illustration, clean linework, vibrant colors, studio quality' },
  { id: 'render3d', label: '3D render', suffix: ', 3d render, octane, soft studio lighting, subsurface scattering, high detail' },
  { id: 'watercolor', label: 'Watercolor', suffix: ', watercolor painting, soft washes, textured paper, delicate brushwork' },
  { id: 'neon', label: 'Neon noir', suffix: ', neon noir, rain-slick streets, moody haze, vivid magenta and cyan lighting' },
  { id: 'minimal', label: 'Minimal', suffix: ', minimalist, flat vector, generous negative space, limited palette' },
];

const IDEAS = [
  'a lighthouse made of stacked books, storm at dusk',
  'an astronaut tending a greenhouse on the moon',
  'a fox curled asleep inside a dew-covered poppy',
  'brutalist cathedral of glass and moss, morning fog',
  'a tiny ramen shop on the back of a whale',
  'portrait of a queen made of constellations',
  'an origami dragon mid-flight over Tokyo',
  'a train station platform floating in a nebula',
];

/* ---------- state ---------- */
const state = {
  model: MODELS.find((m) => m.id === 'flux'),
  ratio: RATIOS[0],
  style: STYLES[0],
  batch: 1,
  steps: 25,
  cfg: 7,
  denoise: 0.65,
  seed: null,          // null = random
  refImage: null,      // { base64, name, url }
  cards: [],           // gallery card records
  busy: false,
};

/* ============================================================
   Providers
   ============================================================ */
const HORDE = 'https://stablehorde.net/api/v2';
const HORDE_KEY = '0000000000'; // official anonymous key
const CLIENT_AGENT = 'PrismStudio:1.0:github-pages';

async function fetchWithTimeout(url, opts = {}, ms = 120000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/* ---- AI Horde (async submit → poll → collect) ---- */
async function hordeGenerate(job, onStatus) {
  const m = job.model;
  const [w, h] = job.dims;
  const params = {
    width: w,
    height: h,
    steps: job.steps,
    cfg_scale: job.cfg,
    sampler_name: 'k_euler_a',
    karras: true,
    n: 1,
    seed: String(job.seed),
  };
  if (job.ref) {
    params.denoising_strength = job.denoise;
  }
  const payload = {
    prompt: job.finalPrompt,
    params,
    nsfw: false,
    censor_nsfw: true,
    shared: false,
    r2: true,
    models: [m.hordeModel],
  };
  if (job.ref) {
    payload.source_image = job.ref.base64;
    payload.source_processing = 'img2img';
  }

  const submit = await fetchWithTimeout(`${HORDE}/generate/async`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: HORDE_KEY,
      'Client-Agent': CLIENT_AGENT,
    },
    body: JSON.stringify(payload),
  }, 30000);
  const sub = await submit.json().catch(() => ({}));
  if (!submit.ok || !sub.id) {
    let msg = sub.message || `Horde rejected the request (HTTP ${submit.status})`;
    if (sub.errors) {
      const detail = Object.entries(sub.errors).map(([k, v]) => `${k}: ${v}`).join('; ');
      msg = `${msg} — ${detail}`;
    }
    throw new Error(msg);
  }

  // poll
  const started = Date.now();
  for (;;) {
    if (Date.now() - started > 10 * 60 * 1000) throw new Error('Timed out waiting for the Horde (10 min)');
    await sleep(3500);
    let check;
    try {
      const r = await fetchWithTimeout(`${HORDE}/generate/check/${sub.id}`, {}, 15000);
      check = await r.json();
    } catch {
      continue; // transient network blip — keep polling
    }
    if (check.faulted) throw new Error('The generation faulted on the Horde. Try again or pick another model.');
    if (!check.is_possible) throw new Error('No workers are currently able to run this model. Try another one.');
    if (check.done) break;
    onStatus({
      queue: check.queue_position,
      wait: check.wait_time,
      elapsed: Math.round((Date.now() - started) / 1000),
    });
  }

  const status = await (await fetchWithTimeout(`${HORDE}/generate/status/${sub.id}`, {}, 20000)).json();
  const gen = status.generations && status.generations[0];
  if (!gen || !gen.img) throw new Error('The Horde finished but returned no image. Try again.');
  const imgRes = await fetchWithTimeout(gen.img, {}, 60000);
  if (!imgRes.ok) throw new Error(`Could not fetch the finished image (HTTP ${imgRes.status})`);
  const blob = await imgRes.blob();
  return URL.createObjectURL(blob);
}

/* ---- Pollinations (serialized GET) ---- */
let pollChain = Promise.resolve();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pollinationsGenerate(job) {
  // one concurrent request per IP on the free tier — chain them.
  // NOTE: loaded via an <img> element because browser fetch() is
  // Turnstile-gated by Pollinations; image loads are not.
  const run = async () => {
    const [w, h] = job.dims;
    const qs = new URLSearchParams({
      width: String(w),
      height: String(h),
      seed: String(job.seed),
      nologo: 'true',
      referrer: 'prism.studio',
    });
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(job.finalPrompt)}?${qs}`;
    await new Promise((resolve, reject) => {
      const img = new Image();
      const kill = () => { img.src = ''; };
      const to = setTimeout(() => { kill(); reject(new Error('Pollinations timed out — try again or switch to an AI Horde model')); }, 150000);
      img.onload = () => {
        clearTimeout(to);
        if (img.naturalWidth > 0) resolve();
        else reject(new Error('Pollinations returned an empty image — try again'));
      };
      img.onerror = () => {
        clearTimeout(to);
        reject(new Error('Pollinations refused the request — it may be rate-limiting anonymous users. Wait a moment or switch to an AI Horde model.'));
      };
      img.src = url;
    });
    return url; // remote URL used directly as <img src>
  };
  const p = pollChain.then(run, run); // run even if previous failed
  pollChain = p.catch(() => {});
  return p;
}

/* ============================================================
   UI — toasts
   ============================================================ */
const toastStack = $('#toastStack');
const TOAST_ICON = {
  ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  err: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
};
function toast(msg, kind = 'info', ms = 4200) {
  const t = el('div', `toast ${kind}`, `${TOAST_ICON[kind]}<span>${msg}</span>`);
  toastStack.appendChild(t);
  const kill = () => { t.classList.add('out'); setTimeout(() => t.remove(), 320); };
  t.addEventListener('click', kill);
  setTimeout(kill, ms);
}

/* ============================================================
   UI — popovers
   ============================================================ */
const pops = { settings: null, ratio: null, style: null, batch: null, model: null };
function closeAllPops(except) {
  for (const key of Object.keys(pops)) {
    if (key !== except && pops[key]) {
      pops[key].hidden = true;
      pops[key] = null;
    }
  }
  document.querySelectorAll('[aria-expanded]').forEach((b) => {
    if (b.id !== 'btnSend') b.setAttribute('aria-expanded', 'false');
  });
}
function togglePop(key, popEl, btn, build) {
  if (pops[key]) { closeAllPops(); return; }
  closeAllPops();
  build();
  popEl.hidden = false;
  pops[key] = popEl;
  btn.setAttribute('aria-expanded', 'true');
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.popover') && !e.target.closest('.tool-btn') && !e.target.closest('.model-pill') && !e.target.closest('.mini-btn')) {
    closeAllPops();
  }
});

/* ---------- model popover ---------- */
const modelPop = $('#modelPop');
function buildModelPop() {
  modelPop.innerHTML = '';
  const groups = [
    { key: 'pollinations', label: 'Pollinations — instant, keyless' },
    { key: 'horde', label: 'AI Horde — community cluster, keyless' },
  ];
  let i = 0;
  for (const g of groups) {
    modelPop.appendChild(el('div', 'pop-group-label', g.label));
    for (const m of MODELS.filter((x) => x.provider === g.key)) {
      const item = el('button', `model-item${m.id === state.model.id ? ' selected' : ''}`);
      item.type = 'button';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', m.id === state.model.id);
      item.dataset.testid = `model-item-${m.id}`;
      item.style.animationDelay = `${Math.min(i++ * 35, 280)}ms`;
      const badges = (m.badges || []).map((b) => `<span class="badge ${b.k}">${b.t}</span>`).join('');
      item.innerHTML = `
        <span class="model-item-icon" style="color:${m.iconTint || '#cbd5e1'}">${m.icon}</span>
        <span class="model-item-body">
          <span class="model-item-name">${m.name}</span>
          <span class="model-item-sub">${m.sub}</span>
          <span class="model-item-badges">${badges}</span>
        </span>
        <span class="model-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>`;
      item.addEventListener('click', () => {
        selectModel(m);
        closeAllPops();
      });
      modelPop.appendChild(item);
    }
  }
}
function selectModel(m) {
  state.model = m;
  // clamp steps/cfg to model defaults
  if (m.steps) {
    state.steps = Math.min(Math.max(state.steps, m.steps.min), m.steps.max);
    setSlider($('#setSteps'), m.steps.min, m.steps.max, state.steps);
  } else {
    setSlider($('#setSteps'), 2, 30, 25);
    if (state.steps < 10) state.steps = 25;
  }
  if (m.cfg) {
    state.cfg = m.cfg;
    setSlider($('#setCfg'), 1, 3, 1.5, 0.5);
  } else {
    setSlider($('#setCfg'), 1, 12, 7, 0.5);
    state.cfg = 7;
  }
  $('#modelPillName').textContent = m.name;
  $('#modelPillIcon').innerHTML = m.icon;
  $('#modelPillIcon').style.color = m.iconTint || '#cbd5e1';
  if (state.refImage && !m.img2img) {
    // reference attached but model can't use it — pick a capable model
    const alt = MODELS.find((x) => x.img2img && x.id === 'flux');
    if (m.id === 'sana') {
      state.model = alt;
      $('#modelPillName').textContent = alt.name;
      $('#modelPillIcon').innerHTML = alt.icon;
      $('#modelPillIcon').style.color = alt.iconTint;
      toast('Switched to FLUX.1 Schnell — Sana can\u2019t use reference images', 'info');
    }
  }
  updateSendState();
}
function setSlider(input, min, max, val, step) {
  input.min = min; input.max = max; input.step = step || 1; input.value = val;
  input.dispatchEvent(new Event('input'));
}

/* ---------- ratio popover ---------- */
const ratioPop = $('#ratioPop');
function buildRatioPop() {
  ratioPop.innerHTML = '';
  RATIOS.forEach((r, i) => {
    const [w, h] = r.horde;
    const b = el('button', `ratio-btn${r.id === state.ratio.id ? ' selected' : ''}`);
    b.type = 'button';
    b.setAttribute('role', 'option');
    b.setAttribute('aria-selected', r.id === state.ratio.id);
    b.dataset.testid = `ratio-${r.id.replace(':', 'x')}`;
    b.innerHTML = `<span class="ratio-shape" style="width:${(w / 64) * 9}px;height:${(h / 64) * 9}px"></span>${r.id}`;
    b.addEventListener('click', () => {
      state.ratio = r;
      $('#ratioLabel').textContent = r.id;
      closeAllPops();
      applyRatioToCards();
    });
    ratioPop.appendChild(b);
  });
}

/* ---------- style popover ---------- */
const stylePop = $('#stylePop');
function buildStylePop() {
  stylePop.innerHTML = '';
  STYLES.forEach((s) => {
    const b = el('button', `opt-item${s.id === state.style.id ? ' selected' : ''}`);
    b.type = 'button';
    b.setAttribute('role', 'option');
    b.dataset.testid = `style-${s.id}`;
    b.innerHTML = `<span class="opt-dot"></span>${s.label}`;
    b.addEventListener('click', () => {
      state.style = s;
      $('#styleLabel').textContent = s.id === 'none' ? 'Style' : s.label;
      closeAllPops();
    });
    stylePop.appendChild(b);
  });
}

/* ---------- batch popover ---------- */
const batchPop = $('#batchPop');
function buildBatchPop() {
  batchPop.innerHTML = '';
  for (let n = 1; n <= 4; n++) {
    const b = el('button', `batch-btn${n === state.batch ? ' selected' : ''}`);
    b.type = 'button';
    b.textContent = n;
    b.dataset.testid = `batch-${n}`;
    b.addEventListener('click', () => {
      state.batch = n;
      $('#batchLabel').textContent = n;
      closeAllPops();
    });
    batchPop.appendChild(b);
  }
}

/* ---------- wire popovers ---------- */
$('#btnModel').addEventListener('click', () => togglePop('model', modelPop, $('#btnModel'), buildModelPop));
$('#btnRatio').addEventListener('click', () => togglePop('ratio', ratioPop, $('#btnRatio'), buildRatioPop));
$('#btnStyle').addEventListener('click', () => togglePop('style', stylePop, $('#btnStyle'), buildStylePop));
$('#btnBatch').addEventListener('click', () => togglePop('batch', batchPop, $('#btnBatch'), buildBatchPop));
$('#btnSettings').addEventListener('click', () => togglePop('settings', $('#settingsPop'), $('#btnSettings'), () => {}));

/* ---------- settings ---------- */
$('#setSteps').addEventListener('input', (e) => {
  state.steps = +e.target.value;
  $('#stepsOut').textContent = state.steps;
});
$('#setCfg').addEventListener('input', (e) => {
  state.cfg = +e.target.value;
  $('#cfgOut').textContent = state.cfg % 1 === 0 ? state.cfg : state.cfg.toFixed(1);
});
$('#setDenoise').addEventListener('input', (e) => {
  state.denoise = +e.target.value;
  $('#denoiseOut').textContent = state.denoise.toFixed(2);
});
$('#setSeed').addEventListener('input', (e) => {
  const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
  e.target.value = v;
  state.seed = v === '' ? null : +v;
});
$('#btnSeedDice').addEventListener('click', () => {
  state.seed = Math.floor(Math.random() * 999999999);
  $('#setSeed').value = state.seed;
});

/* ============================================================
   Reference image
   ============================================================ */
const refChip = $('#refChip');
const refFile = $('#refFile');

$('#btnRef').addEventListener('click', () => refFile.click());
refFile.addEventListener('change', () => { if (refFile.files[0]) setRefImage(refFile.files[0]); refFile.value = ''; });
$('#refRemove').addEventListener('click', clearRefImage);

async function setRefImage(file) {
  if (!file.type.startsWith('image/')) { toast('That file isn\u2019t an image', 'err'); return; }
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  // downscale to ≤768px so payloads stay light
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const scale = Math.min(1, 768 / Math.max(img.width, img.height));
  const cv = document.createElement('canvas');
  cv.width = Math.round(img.width * scale);
  cv.height = Math.round(img.height * scale);
  cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
  const outUrl = cv.toDataURL('image/jpeg', 0.9);
  const base64 = outUrl.split(',')[1];

  state.refImage = { base64, name: file.name, url: outUrl };
  $('#refThumb').src = outUrl;
  $('#refName').textContent = file.name;
  refChip.hidden = false;
  $('#rowDenoise').hidden = false;
  if (!state.model.img2img) selectModel(MODELS.find((m) => m.id === 'flux'));
  toast('Reference image ready — the model will edit from it', 'ok', 3000);
  updateSendState();
}
function clearRefImage() {
  state.refImage = null;
  refChip.hidden = true;
  $('#rowDenoise').hidden = true;
  updateSendState();
}

/* drag & drop + paste */
const composer = $('#composer');
let dragDepth = 0;
composer.addEventListener('dragenter', (e) => { e.preventDefault(); dragDepth++; $('#refDropHint').hidden = false; composer.classList.add('drag-over'); });
composer.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; $('#refDropHint').hidden = true; composer.classList.remove('drag-over'); } });
composer.addEventListener('dragover', (e) => e.preventDefault());
composer.addEventListener('drop', (e) => {
  e.preventDefault();
  dragDepth = 0;
  $('#refDropHint').hidden = true;
  composer.classList.remove('drag-over');
  const f = [...(e.dataTransfer.files || [])].find((x) => x.type.startsWith('image/'));
  if (f) setRefImage(f);
});
document.addEventListener('paste', (e) => {
  if (e.target.closest('.prompt-input') || e.target.closest('.seed-input')) {
    const f = [...(e.clipboardData.files || [])].find((x) => x.type.startsWith('image/'));
    if (f) { e.preventDefault(); setRefImage(f); }
  }
});

/* ============================================================
   Prompt input
   ============================================================ */
const promptEl = $('#prompt');
promptEl.addEventListener('input', () => {
  promptEl.style.height = 'auto';
  promptEl.style.height = Math.min(promptEl.scrollHeight, 200) + 'px';
  updateSendState();
});
promptEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    generate();
  }
});
$('#btnSurprise').addEventListener('click', () => {
  const idea = IDEAS[Math.floor(Math.random() * IDEAS.length)];
  promptEl.value = idea;
  promptEl.dispatchEvent(new Event('input'));
  promptEl.focus();
});

function updateSendState() {
  const has = promptEl.value.trim().length > 0;
  $('#btnSend').disabled = !has || state.busy;
}

/* ============================================================
   Generation
   ============================================================ */
const gallery = $('#gallery');
const emptyState = $('#emptyState');
const btnSend = $('#btnSend');

function finalPrompt() {
  return (promptEl.value.trim() + state.style.suffix).trim();
}

async function generate() {
  const text = promptEl.value.trim();
  if (!text) { promptEl.focus(); return; }
  if (state.busy) return;
  state.busy = true;
  btnSend.classList.add('busy');
  btnSend.disabled = true;

  const jobs = [];
  for (let i = 0; i < state.batch; i++) {
    jobs.push({
      model: state.model,
      finalPrompt: finalPrompt(),
      dims: state.model.provider === 'pollinations' ? state.ratio.poll : state.ratio.horde,
      steps: state.steps,
      cfg: state.cfg,
      denoise: state.denoise,
      seed: state.seed != null ? state.seed + i : Math.floor(Math.random() * 999999999),
      ref: state.model.img2img && state.refImage ? state.refImage : null,
    });
  }

  // build cards first (batch appears together)
  const cards = jobs.map((j) => makeCard(j));
  cards.forEach((c, i) => { c.node.style.animationDelay = `${i * 70}ms`; });

  const work = jobs.map(async (j, i) => {
    const card = cards[i];
    try {
      const url = j.model.provider === 'pollinations'
        ? await pollinationsGenerate(j)
        : await hordeGenerate(j, (s) => {
            const bits = [];
            if (s.queue > 0) bits.push(`queue #${s.queue}`);
            else bits.push('painting');
            if (s.wait > 0) bits.push(`~${s.wait}s`);
            card.statusEl.innerHTML = `${bits.join(' · ')}<br><span class="load-time">${s.elapsed}s</span>`;
          });
      card.done(url);
      if (state.refImage && !state.model.img2img) { /* unreachable */ }
    } catch (err) {
      console.error(err);
      card.fail(err.message || 'Something went wrong');
    }
  });

  await Promise.allSettled(work);
  state.busy = false;
  btnSend.classList.remove('busy');
  updateSendState();
}
btnSend.addEventListener('click', generate);

/* ============================================================
   Gallery cards
   ============================================================ */
function makeCard(job) {
  const node = el('article', 'card');
  const [w, h] = job.dims;
  node.style.setProperty('--ar', `${w} / ${h}`);
  node.dataset.testid = `card-${job.seed}`;

  const media = el('div', 'card-media');
  const loading = el('div', 'card-loading', '<div class="load-orbit"></div>');
  const statusEl = el('div', 'load-status', 'connecting…');
  loading.appendChild(statusEl);
  media.appendChild(loading);

  const tag = el('span', 'card-tag', `${job.model.icon}${job.model.name}`);
  tag.style.color = job.model.iconTint || '#cbd5e1';

  const actions = el('div', 'card-actions');
  const grp = el('div', 'card-action-group');
  const mk = (icon, label, testid, fn) => {
    const b = el('button', 'card-act', icon);
    b.setAttribute('aria-label', label);
    b.dataset.testid = testid;
    b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
    return b;
  };
  grp.appendChild(mk('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>', 'Download image', 'card-download', () => download(job, card)));
  grp.appendChild(mk('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v5h-5"/></svg>', 'Generate again', 'card-reroll', () => reroll(job)));
  grp.appendChild(mk('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>', 'Remove', 'card-remove', () => removeCard(card)));
  actions.appendChild(grp);

  media.appendChild(tag);
  media.appendChild(actions);
  node.appendChild(media);

  emptyState.hidden = true;
  $('#galleryHead').hidden = false;
  gallery.prepend(node);

  const card = {
    node, media, statusEl, job,
    url: null,
    done(u) {
      this.url = u;
      loading.remove();
      const img = el('img');
      img.src = u;
      img.alt = job.finalPrompt.slice(0, 120);
      img.dataset.testid = `img-${job.seed}`;
      img.addEventListener('click', () => openLightbox(card));
      media.appendChild(img);
    },
    fail(msg) {
      loading.remove();
      const err = el('div', 'card-error', `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
        <span>${msg}</span>`);
      media.appendChild(err);
    },
  };
  state.cards.unshift(card);
  return card;
}

function removeCard(card) {
  const i = state.cards.indexOf(card);
  if (i >= 0) state.cards.splice(i, 1);
  card.node.style.transition = 'opacity 0.25s, transform 0.25s';
  card.node.style.opacity = '0';
  card.node.style.transform = 'scale(0.96)';
  setTimeout(() => card.node.remove(), 260);
  if (!state.cards.length) { emptyState.hidden = false; $('#galleryHead').hidden = true; }
}

function applyRatioToCards() { /* future: live aspect preview on placeholder */ }

async function download(job, card) {
  if (!card.url) return;
  if (card.url.startsWith('blob:')) {
    try {
      const res = await fetch(card.url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `prism-${job.model.id}-${job.seed}.${blob.type.includes('png') ? 'png' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch {
      toast('Download blocked by the browser — right-click the image and save it instead', 'err');
    }
  } else {
    // remote (Pollinations) URL — browser fetch is Turnstile-gated there,
    // so hand the direct URL to the user in a new tab
    window.open(card.url, '_blank', 'noopener');
    toast('Opened in a new tab — right-click the image to save it', 'info');
  }
}

function reroll(job) {
  // same prompt & settings, fresh seed — reuse current settings only for prompt
  const prevPrompt = promptEl.value;
  promptEl.value = job.finalPrompt.replace(new RegExp(state.style.suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), '').trim() || job.finalPrompt;
  const keep = state.seed;
  state.seed = null;
  generate().finally(() => {
    state.seed = keep;
    if (!prevPrompt) promptEl.value = '';
    updateSendState();
  });
}

/* clear all */
$('#btnClear').addEventListener('click', () => {
  state.cards.forEach((c) => removeCard(c));
});

/* ============================================================
   Lightbox
   ============================================================ */
const lightbox = $('#lightbox');
let lbCard = null;
function openLightbox(card) {
  lbCard = card;
  $('#lightboxImg').src = card.url;
  $('#lbModel').textContent = `${card.job.model.name} · seed ${card.job.seed}`;
  $('#lbPrompt').textContent = card.job.finalPrompt;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.hidden = true;
  lbCard = null;
  document.body.style.overflow = '';
}
$('#lbClose').addEventListener('click', closeLightbox);
$('#lightboxBackdrop').addEventListener('click', closeLightbox);
$('#lbDownload').addEventListener('click', () => lbCard && download(lbCard.job, lbCard));
$('#lbCopy').addEventListener('click', async () => {
  if (!lbCard) return;
  try { await navigator.clipboard.writeText(lbCard.job.finalPrompt); toast('Prompt copied', 'ok', 2000); }
  catch { toast('Couldn\u2019t copy — clipboard blocked', 'err'); }
});
$('#lbReroll').addEventListener('click', () => { if (lbCard) { closeLightbox(); reroll(lbCard.job); } });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!lightbox.hidden) closeLightbox();
    else closeAllPops();
  }
});

/* ============================================================
   Seed chips / empty state
   ============================================================ */
const seedChips = $('#seedChips');
IDEAS.slice(0, 5).forEach((idea, i) => {
  const c = el('button', 'chip', idea);
  c.type = 'button';
  c.style.animationDelay = `${0.3 + i * 0.07}s`;
  c.dataset.testid = `idea-${i}`;
  c.addEventListener('click', () => {
    promptEl.value = idea;
    promptEl.dispatchEvent(new Event('input'));
    promptEl.focus();
  });
  seedChips.appendChild(c);
});

/* ============================================================
   Init
   ============================================================ */
selectModel(MODELS.find((m) => m.id === 'flux'));
updateSendState();

})();
