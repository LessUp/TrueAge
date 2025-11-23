const $ = (id) => document.getElementById(id);

// --- Utils ---
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

function showToast(message, type = 'info') {
  const container = $('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  
  const colors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-slate-800 text-white'
  };
  
  const icons = {
    success: 'check-circle',
    error: 'alert-circle',
    info: 'info'
  };

  toast.className = `${colors[type] || colors.info} px-4 py-3 rounded-xl shadow-lg shadow-slate-200/50 flex items-center gap-3 transform transition-all duration-500 translate-x-10 opacity-0 min-w-[200px]`;
  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="w-5 h-5"></i>
    <span class="text-sm font-medium">${message}</span>
  `;
  
  container.appendChild(toast);
  lucide.createIcons({ root: toast });

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-10', 'opacity-0');
  });

  // Remove after 3s
  setTimeout(() => {
    toast.classList.add('translate-x-10', 'opacity-0');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// --- Math Helpers ---
function toNumber(v) {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : NaN;
}

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

// --- Core Calc Functions ---
function computeBMI(heightCm, weightKg) {
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return NaN;
  const h = heightCm / 100;
  if (h <= 0) return NaN;
  return weightKg / (h * h);
}

function computeWHtR(heightCm, waistCm) {
  if (!Number.isFinite(heightCm) || !Number.isFinite(waistCm)) return NaN;
  if (heightCm <= 0) return NaN;
  return waistCm / heightCm;
}

function eGFR_CKD_EPI_2021(age, sex, scr_mg_dl) {
  if (!Number.isFinite(age) || !scr_mg_dl || !sex) return NaN;
  const k = sex === 'female' ? 0.7 : 0.9;
  const a = sex === 'female' ? -0.241 : -0.302;
  const minPart = Math.min(scr_mg_dl / k, 1);
  const maxPart = Math.max(scr_mg_dl / k, 1);
  const sexCoef = sex === 'female' ? 1.012 : 1;
  return 142 * Math.pow(minPart, a) * Math.pow(maxPart, -1.200) * Math.pow(0.9938, age) * sexCoef;
}

function convertGlucoseToMgDl(value, unit) {
  if (!Number.isFinite(value)) return NaN;
  return unit === 'mmol' ? value * 18 : value;
}

function convertCholToMgDl(value, unit) {
  if (!Number.isFinite(value)) return NaN;
  return unit === 'mmol' ? value * 38.67 : value;
}

function convertTgToMgDl(value, unit) {
  if (!Number.isFinite(value)) return NaN;
  return unit === 'mmol' ? value * 88.57 : value;
}

function convertCreatinineToMgDl(value, unit) {
  if (!Number.isFinite(value)) return NaN;
  return unit === 'umol' ? value / 88.4 : value;
}

// --- Data Reading ---
function readForm() {
  const sex = [...document.querySelectorAll('input[name="sex"]')].find(r => r.checked)?.value || '';
  const age = toNumber($("age").value);
  const height = toNumber($("height").value);
  const weight = toNumber($("weight").value);
  const waist = toNumber($("waist").value);
  const sbp = toNumber($("sbp").value);
  const dbp = toNumber($("dbp").value);
  const rhr = toNumber($("rhr").value);
  const vo2max = toNumber($("vo2max").value);
  const sleep = toNumber($("sleep").value);

  const gluUnit = $("gluUnit").value;
  const lipUnit = $("lipUnit").value;
  const crUnit = $("crUnit").value;

  const hba1c = toNumber($("hba1c").value);
  const fpg = convertGlucoseToMgDl(toNumber($("fpg").value), gluUnit);
  const ldl = convertCholToMgDl(toNumber($("ldl").value), lipUnit);
  const hdl = convertCholToMgDl(toNumber($("hdl").value), lipUnit);
  const tg = convertTgToMgDl(toNumber($("tg").value), lipUnit);
  const crp = toNumber($("crp").value);
  const cr = convertCreatinineToMgDl(toNumber($("cr").value), crUnit);
  const alt = toNumber($("alt").value);
  const ast = toNumber($("ast").value);
  const uric = toNumber($("uric").value);

  const bmi = computeBMI(height, weight);
  const whtr = computeWHtR(height, waist);
  const egfr = eGFR_CKD_EPI_2021(age, sex, cr);

  return { sex, age, height, weight, waist, sbp, dbp, rhr, vo2max, sleep, hba1c, fpg, ldl, hdl, tg, crp, cr, alt, ast, uric, bmi, whtr, egfr };
}

function formatNum(x, digits = 1) {
  if (!Number.isFinite(x)) return '—';
  return x.toFixed(digits);
}

function updateDerivedDisplays() {
  const height = toNumber($("height").value);
  const weight = toNumber($("weight").value);
  const waist = toNumber($("waist").value);
  const bmi = computeBMI(height, weight);
  const whtr = computeWHtR(height, waist);
  
  const bmiEl = $("bmi");
  const whtrEl = $("whtr");
  
  bmiEl.value = Number.isFinite(bmi) ? bmi.toFixed(1) : '—';
  whtrEl.value = Number.isFinite(whtr) ? whtr.toFixed(2) : '—';

  // Add visual indicators
  if (Number.isFinite(whtr)) {
      whtrEl.style.color = whtr > 0.5 ? '#e11d48' : '#059669'; // rose-600 : emerald-600
  } else {
      whtrEl.style.color = '';
  }
}

function buildMetricDefs(input) {
  const male = input.sex === 'male';
  const targets = {
    bmi: 22,
    whtr: 0.46,
    sbp: 110,
    dbp: 70,
    rhr: 60,
    vo2max: male ? 42 : 35,
    hdl: 60,
    ldl: 70,
    tg: 90,
    hba1c: 5.2,
    fpg: 85,
    crp: 0.6,
    egfr: 100,
    alt: 20,
    ast: 22,
    uric: male ? 5.0 : 4.5,
    sleep: 7.5,
  };
  const sds = {
    bmi: 3.5,
    whtr: 0.06,
    sbp: 12,
    dbp: 8,
    rhr: 10,
    vo2max: 8,
    hdl: 15,
    ldl: 30,
    tg: 50,
    hba1c: 0.4,
    fpg: 10,
    crp: 0.7,
    egfr: 15,
    alt: 10,
    ast: 8,
    uric: 1.2,
    sleep: 1.0,
  };
  const weights = {
    bmi: 0.10, whtr: 0.10, sbp: 0.09, dbp: 0.09, rhr: 0.06,
    vo2max: 0.09, hdl: 0.07, ldl: 0.08, tg: 0.05,
    hba1c: 0.10, fpg: 0.06, crp: 0.08, egfr: 0.07,
    alt: 0.04, ast: 0.03, uric: 0.04, sleep: 0.02,
  };
  const dirs = {
    bmi: 'higher_worse', whtr: 'higher_worse', sbp: 'higher_worse', dbp: 'higher_worse', rhr: 'higher_worse',
    vo2max: 'higher_better', hdl: 'higher_better', ldl: 'higher_worse', tg: 'higher_worse',
    hba1c: 'higher_worse', fpg: 'higher_worse', crp: 'higher_worse', egfr: 'higher_better',
    alt: 'higher_worse', ast: 'higher_worse', uric: 'higher_worse', sleep: 'higher_better',
  };
  const labels = {
    bmi: 'BMI', whtr: '腰高比', sbp: '收缩压', dbp: '舒张压', rhr: '静息心率',
    vo2max: 'VO2max', hdl: 'HDL', ldl: 'LDL', tg: '甘油三酯',
    hba1c: 'HbA1c', fpg: '空腹血糖', crp: 'hs-CRP', egfr: 'eGFR',
    alt: 'ALT', ast: 'AST', uric: '尿酸', sleep: '睡眠',
  };
  return { targets, sds, weights, dirs, labels };
}

function computeScore(input) {
  const { targets, sds, weights, dirs, labels } = buildMetricDefs(input);
  const values = {
    bmi: input.bmi, whtr: input.whtr, sbp: input.sbp, dbp: input.dbp, rhr: input.rhr,
    vo2max: input.vo2max, hdl: input.hdl, ldl: input.ldl, tg: input.tg,
    hba1c: input.hba1c, fpg: input.fpg, crp: input.crp, egfr: input.egfr,
    alt: input.alt, ast: input.ast, uric: input.uric, sleep: input.sleep,
  };

  const entries = Object.keys(values).map(k => ({ id: k, value: values[k] }))
    .filter(e => Number.isFinite(e.value) && Number.isFinite(sds[e.id]) && Number.isFinite(weights[e.id]));

  const sumAllWeights = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalWeight = entries.reduce((acc, e) => acc + (weights[e.id] || 0), 0);
  if (totalWeight <= 0 || !Number.isFinite(input.age)) {
    return { bioAge: NaN, delta: NaN, confidence: 0, breakdown: [] };
  }

  const scalePerZ = 5;
  let S = 0;
  const contributions = [];

  entries.forEach(e => {
    const target = targets[e.id];
    const sd = sds[e.id];
    const dir = dirs[e.id];
    const rawZ = dir === 'higher_worse' ? (e.value - target) / sd : (target - e.value) / sd;
    const z = clamp(rawZ, -3, 3);
    const w = weights[e.id] || 0;
    const wNorm = w / totalWeight;
    const years = z * scalePerZ * wNorm;
    S += z * wNorm;
    contributions.push({
      id: e.id,
      label: labels[e.id] || e.id,
      value: e.value,
      target,
      z,
      wNorm,
      years,
      direction: z >= 0 ? 'older' : 'younger',
    });
  });

  const adjYears = S * scalePerZ;
  const bioAge = clamp(input.age + adjYears, 10, 110);
  const delta = bioAge - input.age;

  let coverage = totalWeight / sumAllWeights;
  coverage = clamp(coverage, 0, 1);
  const n = entries.length;
  let confidence = 0.35 + 0.65 * coverage;
  if (n < 5) confidence *= 0.85;
  if (n < 3) confidence *= 0.7;
  confidence = clamp(confidence, 0.2, 1);

  contributions.sort((a, b) => Math.abs(b.years) - Math.abs(a.years));

  return { bioAge, delta, confidence, breakdown: contributions };
}

function renderResults(res, input) {
  const bioAgeEl = $("bioAgeVal");
  const deltaEl = $("deltaVal");
  const confBar = $("confidenceBar");
  const confVal = $("confidenceVal");
  const breakdownList = $("breakdownList");
  const suggestionsList = $("suggestionsList");

  if (!Number.isFinite(res.bioAge)) {
    bioAgeEl.textContent = '—';
    deltaEl.textContent = '...';
    deltaEl.className = 'text-lg font-medium text-white/90 px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-sm';
    confBar.style.width = '0%';
    confVal.textContent = '0%';
    breakdownList.innerHTML = '<div class="text-center text-sm text-slate-400 py-4">输入数据以查看分析</div>';
    suggestionsList.innerHTML = '';
    return;
  }

  // Animate number
  bioAgeEl.textContent = `${res.bioAge.toFixed(1)}`;

  const d = res.delta;
  deltaEl.className = `text-sm font-bold px-2 py-1 rounded-md backdrop-blur-sm ${d > 0.05 ? 'bg-rose-500/20 text-rose-100' : d < -0.05 ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/20 text-white'}`;
  
  if (d > 0.05) {
    deltaEl.textContent = `+${d.toFixed(1)} 岁`;
  } else if (d < -0.05) {
    deltaEl.textContent = `-${Math.abs(d).toFixed(1)} 岁`;
  } else {
    deltaEl.textContent = '=';
  }

  const confPct = Math.round(res.confidence * 100);
  confBar.style.width = `${confPct}%`;
  confVal.textContent = `${confPct}%`;
  // Color code confidence bar
  confBar.className = `h-full rounded-full transition-all duration-700 ease-out ${confPct > 70 ? 'bg-emerald-400' : confPct > 40 ? 'bg-amber-400' : 'bg-rose-400'}`;

  const top = res.breakdown.slice(0, 5);
  breakdownList.innerHTML = top.map(c => {
    const isAging = c.years >= 0;
    const colorClass = isAging ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100';
    const icon = isAging ? 'chevrons-up' : 'chevrons-down';
    
    return `
      <div class="flex items-center justify-between p-2.5 rounded-lg border ${colorClass} transition-transform hover:scale-[1.01]">
        <div class="flex flex-col">
          <span class="font-bold text-sm text-slate-700">${c.label}</span>
          <span class="text-[10px] text-slate-500 opacity-80">当前 ${formatNum(c.value, 2)} / 目标 ${formatNum(c.target, 2)}</span>
        </div>
        <div class="flex items-center gap-1 font-bold ${isAging ? 'text-rose-600' : 'text-emerald-600'}">
          <span class="text-sm">${isAging ? '+' : '-'}${Math.abs(c.years).toFixed(1)}</span>
          <i data-lucide="${icon}" class="w-3 h-3"></i>
        </div>
      </div>
    `;
  }).join('');
  
  // Re-render icons for the new list
  lucide.createIcons({ root: breakdownList });

  const worst = res.breakdown.filter(c => c.years > 0).slice(0, 3);
  const tips = [];
  worst.forEach(c => tips.push(...suggestionFor(c.id, input)));
  
  if (tips.length === 0 && res.breakdown.length > 0) {
      tips.push("您的指标表现优秀，请继续保持！");
  }
  
  suggestionsList.innerHTML = tips.slice(0, 5).map(t => 
    `<li class="flex gap-2 items-start">
      <span class="mt-1.5 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0"></span>
      <span class="flex-1">${t}</span>
    </li>`
  ).join('');
}

function suggestionFor(id, input) {
  const S = {
    bmi: ['控制总能量与碳水，优先高蛋白', '每周≥2次抗阻训练'],
    whtr: ['减少腹部脂肪：控糖、限酒', '核心训练（平板/卷腹）'],
    sbp: ['减少钠盐，增加钾(蔬果)', '每周150分钟中等有氧'],
    dbp: ['压力管理，深呼吸', '有氧耐力训练'],
    rhr: ['提升有氧耐力(跑/游)', '保障睡眠与恢复'],
    vo2max: ['HIIT间歇训练', '增加有氧运动总量'],
    hdl: ['增加优质脂肪(鱼/坚果)', '戒烟，有氧运动'],
    ldl: ['减少饱和脂肪/反式脂肪', '增加膳食纤维'],
    tg: ['限制精制糖与酒精', '补充Omega-3'],
    hba1c: ['低GI饮食', '餐后轻度活动'],
    fpg: ['晚餐少碳水，睡前禁食', '改善胰岛素敏感性'],
    crp: ['抗炎饮食(蔬果/鱼)', '避免熬夜'],
    egfr: ['充足饮水', '慎用伤肾药物'],
    alt: ['限酒，减重', '脂肪肝筛查'],
    ast: ['限酒，规律作息', '肝功能监测'],
    uric: ['低嘌呤饮食，限酒', '多饮水'],
    sleep: ['固定作息，7-9小时', '睡前远离蓝光'],
  };
  return S[id] ? S[id] : [];
}

// --- Secondary Modules ---
function readLifestyleInputs() {
  const days = toNumber($("ls_days")?.value);
  const minutes = toNumber($("ls_min")?.value);
  const fv = toNumber($("ls_fv")?.value);
  const smoke = $("ls_smoke")?.value || '';
  const alc = toNumber($("ls_alc")?.value);
  const sit = toNumber($("ls_sit")?.value);
  return { days, minutes, fv, smoke, alc, sit };
}

function computeLifestyleAge(input, ls) {
  const actMin = Number.isFinite(ls.days) && Number.isFinite(ls.minutes) ? clamp(ls.days * ls.minutes, 0, 600) : NaN;
  let actScore = NaN;
  if (Number.isFinite(actMin)) {
    let s = 0;
    if (actMin <= 0) s = 0;
    else if (actMin < 150) s = (actMin / 150) * 80;
    else if (actMin <= 300) s = 80 + ((actMin - 150) / 150) * 20;
    else s = 100;
    actScore = clamp(s, 0, 100);
  }
  const fvScore = Number.isFinite(ls.fv) ? clamp((ls.fv / 5) * 100, 0, 100) : NaN;
  let smokeScore = NaN;
  if (ls.smoke === 'none') smokeScore = 100; else if (ls.smoke === 'former') smokeScore = 70; else if (ls.smoke === 'current') smokeScore = 20;
  let alcScore = NaN;
  if (Number.isFinite(ls.alc)) {
    if (ls.alc <= 7) alcScore = 100; else if (ls.alc <= 14) alcScore = 80; else if (ls.alc <= 21) alcScore = 60; else alcScore = 30;
  }
  let sitScore = NaN;
  if (Number.isFinite(ls.sit)) {
    if (ls.sit <= 2) sitScore = 100; else if (ls.sit >= 12) sitScore = 20; else sitScore = clamp(100 - ((ls.sit - 2) / 8) * 60, 20, 100);
  }
  const comps = [
    { s: actScore, w: 0.35 }, { s: fvScore, w: 0.20 },
    { s: smokeScore, w: 0.20 }, { s: alcScore, w: 0.10 }, { s: sitScore, w: 0.15 },
  ];
  const usable = comps.filter(c => Number.isFinite(c.s));
  if (usable.length === 0 || !Number.isFinite(input.age)) return { lsAge: NaN, score: NaN, delta: NaN, tips: [] };
  const wsum = usable.reduce((a, b) => a + b.w, 0);
  const score = clamp(usable.reduce((a, b) => a + b.s * b.w, 0) / wsum, 0, 100);
  const delta = (50 - score) * 0.2;
  const lsAge = clamp(input.age + delta, 10, 110);
  
  const tips = [];
  if (ls.smoke === 'current') tips.push('戒烟');
  if (Number.isFinite(actMin) && actMin < 150) tips.push('增加运动');
  if (Number.isFinite(ls.fv) && ls.fv < 5) tips.push('多吃蔬果');
  
  return { lsAge, score, delta, tips };
}

function renderLifestyle(res, age) {
  const ageEl = $("ls_ageVal");
  const deltaEl = $("ls_deltaVal");
  const bar = $("ls_scoreBar");
  const list = $("ls_suggestions");
  if (!Number.isFinite(res.lsAge)) {
    ageEl.textContent = '—';
    deltaEl.textContent = '';
    bar.style.width = '0%';
    list.innerHTML = '';
    return;
  }
  ageEl.textContent = `${res.lsAge.toFixed(1)}岁`;
  
  if (res.delta > 0.05) {
      deltaEl.innerHTML = `<span class="text-rose-500 font-medium">+${res.delta.toFixed(1)} 岁</span>`;
  } else if (res.delta < -0.05) {
      deltaEl.innerHTML = `<span class="text-emerald-500 font-medium">-${Math.abs(res.delta).toFixed(1)} 岁</span>`;
  } else {
      deltaEl.textContent = '与实际年龄相当';
  }
  
  const pct = Math.round(clamp(res.score, 0, 100));
  bar.style.width = `${pct}%`;
  list.innerHTML = res.tips.slice(0, 3).map(t => `<li>${t}</li>`).join('');
}

function computeCRFAge(input) {
  const sex = input.sex;
  const age = input.age;
  let used = '';
  let vo2 = Number.isFinite(input.vo2max) ? input.vo2max : NaN;
  if (!Number.isFinite(vo2) && Number.isFinite(input.rhr) && Number.isFinite(age)) {
    const hrmax = 208 - 0.7 * age;
    if (hrmax > 0 && input.rhr > 0) vo2 = 15.3 * (hrmax / input.rhr);
    if (Number.isFinite(vo2)) used = 'rhr';
  } else if (Number.isFinite(vo2)) {
    used = 'vo2';
  }
  if (!Number.isFinite(vo2) || !sex || !Number.isFinite(age)) return { crfAge: NaN, delta: NaN, note: '需 VO2max 或 RHR' };
  const v0 = sex === 'male' ? 50 : 42;
  const k = sex === 'male' ? 0.34 : 0.30;
  const ageEst = 20 + (v0 - vo2) / k;
  const crfAge = clamp(ageEst, 15, 90);
  const delta = crfAge - age;
  const note = used === 'vo2' ? '基于 VO2max' : '基于 RHR';
  return { crfAge, delta, note };
}

function renderCRF(res, age) {
  const ageEl = $("crf_ageVal");
  const deltaEl = $("crf_deltaVal");
  const noteEl = $("crf_note");
  if (!Number.isFinite(res.crfAge)) {
    ageEl.textContent = '—';
    deltaEl.textContent = '';
    noteEl.textContent = res.note || '';
    return;
  }
  ageEl.textContent = `${res.crfAge.toFixed(1)}岁`;
  
  if (res.delta > 0.05) {
      deltaEl.innerHTML = `<span class="text-rose-500 font-medium">+${res.delta.toFixed(1)} 岁</span>`;
  } else if (res.delta < -0.05) {
      deltaEl.innerHTML = `<span class="text-emerald-500 font-medium">-${Math.abs(res.delta).toFixed(1)} 岁</span>`;
  } else {
      deltaEl.textContent = '—';
  }
  noteEl.textContent = res.note;
}

function readSleepInputs() {
  const consistency = toNumber($("sl_consistency")?.value);
  const caf = $("sl_caf")?.value || '';
  const screen = $("sl_screen")?.value || '';
  const apnea = $("sl_apnea")?.value || '';
  const quality = toNumber($("sl_quality")?.value);
  return { consistency, caf, screen, apnea, quality };
}

function rangeScore(x, optLow, optHigh, min, max) {
  if (!Number.isFinite(x)) return NaN;
  if (x >= optLow && x <= optHigh) return 100;
  if (x < optLow) return clamp(100 - ((optLow - x) / (optLow - min)) * 100, 0, 100);
  return clamp(100 - ((x - optHigh) / (max - optHigh)) * 100, 0, 100);
}

function computeSleepScore(input, sl) {
  const duration = toNumber($("sleep")?.value);
  const durScore = rangeScore(duration, 7, 9, 4, 12);
  const consScore = Number.isFinite(sl.consistency) ? clamp((sl.consistency / 7) * 100, 0, 100) : NaN;
  const cafScore = sl.caf === 'no' ? 100 : sl.caf === 'yes' ? 60 : NaN;
  const scrScore = sl.screen === 'no' ? 100 : sl.screen === 'yes' ? 65 : NaN;
  const apScore = sl.apnea === 'no' ? 100 : sl.apnea === 'yes' ? 40 : NaN;
  const qScore = Number.isFinite(sl.quality) ? clamp(20 * sl.quality, 20, 100) : NaN;
  
  const comps = [
    { s: durScore, w: 0.30 }, { s: consScore, w: 0.30 },
    { s: cafScore, w: 0.10 }, { s: scrScore, w: 0.10 },
    { s: apScore, w: 0.10 }, { s: qScore, w: 0.10 },
  ];
  const usable = comps.filter(c => Number.isFinite(c.s));
  if (usable.length === 0) return { score: NaN, grade: '—', tips: [] };
  
  const wsum = usable.reduce((a, b) => a + b.w, 0);
  const score = clamp(usable.reduce((a, b) => a + b.s * b.w, 0) / wsum, 0, 100);
  let grade = 'C';
  if (score >= 85) grade = 'A'; else if (score >= 70) grade = 'B'; else if (score >= 55) grade = 'C'; else grade = 'D';
  
  const tips = [];
  if (sl.caf === 'yes') tips.push('午后限咖');
  if (sl.screen === 'yes') tips.push('睡前禁屏');
  if (Number.isFinite(duration) && (duration < 7 || duration > 9)) tips.push('时长7-9h');
  
  return { score, grade, tips };
}

function renderSleep(res) {
  const scoreEl = $("sl_scoreVal");
  const gradeEl = $("sl_gradeVal");
  const bar = $("sl_scoreBar");
  const list = $("sl_suggestions");
  
  if (!Number.isFinite(res.score)) {
    scoreEl.textContent = '—';
    gradeEl.textContent = '';
    bar.style.width = '0%';
    list.innerHTML = '';
    return;
  }
  const pct = Math.round(clamp(res.score, 0, 100));
  scoreEl.textContent = `${pct}`;
  gradeEl.textContent = res.grade;
  gradeEl.className = `text-xs font-bold px-1.5 rounded text-white ${res.grade === 'A' ? 'bg-emerald-500' : res.grade === 'B' ? 'bg-blue-500' : 'bg-amber-500'}`;
  
  bar.style.width = `${pct}%`;
  list.innerHTML = res.tips.slice(0, 3).map(t => `<li>${t}</li>`).join('');
}

// --- State & Serialization ---
function serializeState() {
  const sex = [...document.querySelectorAll('input[name="sex"]')].find(r => r.checked)?.value || '';
  const state = {
    age: $("age")?.value || '',
    sex,
    height: $("height")?.value || '', weight: $("weight")?.value || '', waist: $("waist")?.value || '',
    sbp: $("sbp")?.value || '', dbp: $("dbp")?.value || '', rhr: $("rhr")?.value || '',
    vo2max: $("vo2max")?.value || '', sleep: $("sleep")?.value || '',
    gluUnit: $("gluUnit")?.value || 'mgdl', lipUnit: $("lipUnit")?.value || 'mgdl', crUnit: $("crUnit")?.value || 'mgdl',
    hba1c: $("hba1c")?.value || '', fpg: $("fpg")?.value || '',
    ldl: $("ldl")?.value || '', hdl: $("hdl")?.value || '', tg: $("tg")?.value || '',
    crp: $("crp")?.value || '', cr: $("cr")?.value || '',
    alt: $("alt")?.value || '', ast: $("ast")?.value || '', uric: $("uric")?.value || '',
    ls_days: $("ls_days")?.value || '', ls_min: $("ls_min")?.value || '', ls_fv: $("ls_fv")?.value || '',
    ls_smoke: $("ls_smoke")?.value || '', ls_alc: $("ls_alc")?.value || '', ls_sit: $("ls_sit")?.value || '',
    sl_consistency: $("sl_consistency")?.value || '', sl_caf: $("sl_caf")?.value || '',
    sl_screen: $("sl_screen")?.value || '', sl_apnea: $("sl_apnea")?.value || '', sl_quality: $("sl_quality")?.value || ''
  };
  return state;
}

function applyState(state) {
  if (!state || typeof state !== 'object') return;
  if (state.age != null) $("age").value = state.age;
  if (state.sex) {
    const el = document.querySelector(`input[name="sex"][value="${state.sex}"]`);
    if (el) {
       el.checked = true;
       // Manually trigger change for radio buttons to update UI style if needed? 
       // The CSS relies on peer-checked which works natively.
    }
  }
  const ids = ["height","weight","waist","sbp","dbp","rhr","vo2max","sleep","hba1c","fpg","ldl","hdl","tg","crp","cr","alt","ast","uric","ls_days","ls_min","ls_fv","ls_smoke","ls_alc","ls_sit","sl_consistency","sl_caf","sl_screen","sl_apnea","sl_quality"]; 
  ids.forEach(id => { if (state[id] != null && $(id)) $(id).value = state[id]; });
  const uids = ["gluUnit","lipUnit","crUnit"]; uids.forEach(id => { if (state[id] && $(id)) $(id).value = state[id]; });
  
  updateDerivedDisplays();
  recalcAll();
}

// --- Main Logic Wiring ---
function recalcAll() {
  const input = readForm();
  if (Number.isFinite(input.age)) {
    const res = computeScore(input);
    renderResults(res, input);
    
    // Update sub-sections if they have data
    const ls = readLifestyleInputs();
    const lsRes = computeLifestyleAge(input, ls);
    renderLifestyle(lsRes, input.age);
    
    const crfRes = computeCRFAge(input);
    renderCRF(crfRes, input.age);
    
    const sl = readSleepInputs();
    const slRes = computeSleepScore(input, sl);
    renderSleep(slRes);
  }
}

const debouncedRecalc = debounce(recalcAll, 500);

function onDemo() {
  applyState({
    age: 35, sex: 'male', height: 175, weight: 72, waist: 82,
    sbp: 114, dbp: 72, rhr: 58, vo2max: 44, sleep: 7.3,
    hba1c: 5.2, fpg: 88, ldl: 85, hdl: 60, tg: 90,
    crp: 0.7, cr: 0.95, alt: 22, ast: 21, uric: 5.2,
    ls_days: 4, ls_min: 40, ls_fv: 4, ls_smoke: 'none', ls_alc: 2, ls_sit: 7,
    sl_consistency: 5, sl_caf: 'no', sl_screen: 'no', sl_apnea: 'no', sl_quality: 4
  });
  showToast('示例数据已加载', 'success');
}

function onReset() {
  $("ageForm").reset();
  // Clear other manual inputs
  document.querySelectorAll('input').forEach(i => {
     if (i.type !== 'radio') i.value = '';
  });
  document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  
  updateDerivedDisplays();
  renderResults({ bioAge: NaN, delta: NaN, confidence: 0, breakdown: [] }, {});
  renderLifestyle({ lsAge: NaN }, NaN);
  renderCRF({ crfAge: NaN }, NaN);
  renderSleep({ score: NaN }, NaN);
  
  showToast('数据已清空', 'info');
}

function wireEvents() {
  // Auto-calc on any input change
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(el => {
    el.addEventListener('input', () => {
      updateDerivedDisplays();
      debouncedRecalc();
    });
  });

  $("resetBtn").addEventListener('click', onReset);
  $("demoBtn").addEventListener('click', onDemo);
  const mobileDemo = $("demoBtnMobile");
  if(mobileDemo) mobileDemo.addEventListener('click', onDemo);

  // Sub-section manual buttons (optional now, but good for feedback)
  $("ls_calcBtn").addEventListener('click', () => { recalcAll(); showToast('生活方式分析已更新', 'success'); });
  $("crf_calcBtn").addEventListener('click', () => { recalcAll(); showToast('心肺适能分析已更新', 'success'); });
  $("sl_calcBtn").addEventListener('click', () => { recalcAll(); showToast('睡眠评分已更新', 'success'); });

  // Storage & Share
  $("saveBtn").addEventListener('click', () => {
    try { localStorage.setItem('true_age_state_v2', JSON.stringify(serializeState())); showToast('已保存到浏览器缓存', 'success'); }
    catch (e) { showToast('保存失败', 'error'); }
  });
  
  $("loadBtn").addEventListener('click', () => {
    try { 
      const s = localStorage.getItem('true_age_state_v2'); 
      if (!s) { showToast('未找到保存的数据', 'info'); return; }
      applyState(JSON.parse(s)); 
      showToast('数据已读取', 'success'); 
    } catch (e) { showToast('读取失败', 'error'); }
  });

  $("exportBtn").addEventListener('click', () => {
    const data = JSON.stringify(serializeState(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'true-age-data.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('文件已开始下载', 'success');
  });

  $("importBtn").addEventListener('click', () => $("importFile").click());
  $("importFile").addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { applyState(JSON.parse(reader.result)); showToast('导入成功', 'success'); } 
      catch (e) { showToast('文件格式错误', 'error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  $("shareBtn").addEventListener('click', async () => {
      const s = serializeState();
      const qs = new URLSearchParams();
      Object.keys(s).forEach(k => { if (s[k] !== '' && s[k] != null) qs.set(k, s[k]); });
      const link = `${window.location.origin}${window.location.pathname}?${qs.toString()}`;
      try { await navigator.clipboard.writeText(link); showToast('分享链接已复制', 'success'); } 
      catch (e) { showToast('复制失败', 'error'); }
  });
}

// Init
lucide.createIcons();
if (window.location.search) {
    const p = new URLSearchParams(window.location.search);
    const obj = {};
    p.forEach((v,k)=>{ obj[k]=v; });
    applyState(obj);
}
wireEvents();
