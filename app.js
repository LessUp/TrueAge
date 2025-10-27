const $ = (id) => document.getElementById(id);

function toNumber(v) {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : NaN;
}

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

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
  $("bmi").value = Number.isFinite(bmi) ? bmi.toFixed(1) : '—';
  $("whtr").value = Number.isFinite(whtr) ? whtr.toFixed(2) : '—';
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
    bmi: 0.10,
    whtr: 0.10,
    sbp: 0.09,
    dbp: 0.09,
    rhr: 0.06,
    vo2max: 0.09,
    hdl: 0.07,
    ldl: 0.08,
    tg: 0.05,
    hba1c: 0.10,
    fpg: 0.06,
    crp: 0.08,
    egfr: 0.07,
    alt: 0.04,
    ast: 0.03,
    uric: 0.04,
    sleep: 0.02,
  };
  const dirs = {
    bmi: 'higher_worse',
    whtr: 'higher_worse',
    sbp: 'higher_worse',
    dbp: 'higher_worse',
    rhr: 'higher_worse',
    vo2max: 'higher_better',
    hdl: 'higher_better',
    ldl: 'higher_worse',
    tg: 'higher_worse',
    hba1c: 'higher_worse',
    fpg: 'higher_worse',
    crp: 'higher_worse',
    egfr: 'higher_better',
    alt: 'higher_worse',
    ast: 'higher_worse',
    uric: 'higher_worse',
    sleep: 'higher_better',
  };
  const labels = {
    bmi: '体重指数(BMI)',
    whtr: '腰高比(WHtR)',
    sbp: '收缩压(SBP)',
    dbp: '舒张压(DBP)',
    rhr: '静息心率',
    vo2max: '最大摄氧量(VO2max)',
    hdl: '高密度脂蛋白(HDL)',
    ldl: '低密度脂蛋白(LDL)',
    tg: '甘油三酯(TG)',
    hba1c: '糖化血红蛋白(HbA1c)',
    fpg: '空腹血糖',
    crp: '炎症指标(hs-CRP)',
    egfr: '肾小球滤过率(eGFR)',
    alt: 'ALT',
    ast: 'AST',
    uric: '尿酸',
    sleep: '睡眠时长',
  };
  return { targets, sds, weights, dirs, labels };
}

function computeScore(input) {
  const { targets, sds, weights, dirs, labels } = buildMetricDefs(input);
  const values = {
    bmi: input.bmi,
    whtr: input.whtr,
    sbp: input.sbp,
    dbp: input.dbp,
    rhr: input.rhr,
    vo2max: input.vo2max,
    hdl: input.hdl,
    ldl: input.ldl,
    tg: input.tg,
    hba1c: input.hba1c,
    fpg: input.fpg,
    crp: input.crp,
    egfr: input.egfr,
    alt: input.alt,
    ast: input.ast,
    uric: input.uric,
    sleep: input.sleep,
  };

  const entries = Object.keys(values).map(k => ({ id: k, value: values[k] }))
    .filter(e => Number.isFinite(e.value) && Number.isFinite(sds[e.id]) && Number.isFinite(weights[e.id]));

  const sumAllWeights = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalWeight = entries.reduce((acc, e) => acc + (weights[e.id] || 0), 0);
  if (totalWeight <= 0 || !Number.isFinite(input.age)) {
    return {
      bioAge: NaN,
      delta: NaN,
      confidence: 0,
      breakdown: [],
    };
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
    deltaEl.textContent = '—';
    confBar.style.width = '0%';
    confVal.textContent = '—';
    breakdownList.innerHTML = '';
    suggestionsList.innerHTML = '';
    return;
  }

  bioAgeEl.textContent = `${res.bioAge.toFixed(1)} 岁`;

  deltaEl.classList.remove('text-rose-600', 'text-green-600');
  const d = res.delta;
  if (d > 0.05) {
    deltaEl.textContent = `比物理年龄年长 ${d.toFixed(1)} 岁`;
    deltaEl.classList.add('text-rose-600');
  } else if (d < -0.05) {
    deltaEl.textContent = `比物理年龄年轻 ${Math.abs(d).toFixed(1)} 岁`;
    deltaEl.classList.add('text-green-600');
  } else {
    deltaEl.textContent = '与物理年龄相当';
  }

  const confPct = Math.round(res.confidence * 100);
  const confLabel = res.confidence >= 0.75 ? '高' : res.confidence >= 0.55 ? '中' : '低';
  confBar.style.width = `${confPct}%`;
  confVal.textContent = `${confLabel}（${confPct}%）`;

  const top = res.breakdown.slice(0, 6);
  breakdownList.innerHTML = top.map(c => {
    const sign = c.years >= 0 ? '+' : '−';
    const color = c.years >= 0 ? 'text-rose-600' : 'text-green-600';
    const badge = c.years >= 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return `
      <div class="flex items-center justify-between p-2 rounded-lg border ${badge}">
        <div class="text-slate-700">
          <div class="font-medium">${c.label}</div>
          <div class="text-xs text-slate-500">当前 ${formatNum(c.value, 2)} | 目标 ${formatNum(c.target, 2)}</div>
        </div>
        <div class="text-right ${color} font-medium">
          ${sign}${Math.abs(c.years).toFixed(2)} 岁
        </div>
      </div>
    `;
  }).join('');

  
  const worst = res.breakdown.filter(c => c.years > 0).slice(0, 3);
  const tips = [];
  worst.forEach(c => tips.push(...suggestionFor(c.id, input)));
  suggestionsList.innerHTML = tips.slice(0, 6).map(t => `<li>${t}</li>`).join('');
}

function suggestionFor(id, input) {
  const S = {
    bmi: [
      '控制总能量与精制碳水，优先高蛋白与高纤维',
      '每周≥2次抗阻训练并配合日均8000步',
      '阶段目标：BMI≈22'
    ],
    whtr: [
      '优先减少腹部脂肪：控糖/酒，餐后步行10–15分钟',
      '加入核心力量训练（平板、卷腹、深蹲）每周2–3次',
      '阶段目标：WHtR<0.5'
    ],
    sbp: [
      '减少钠盐摄入与加工食品，增加钾（蔬果）',
      '每周150–300分钟中等强度有氧+力量',
      '若持续≥130/80 mmHg，请就医评估'
    ],
    dbp: [
      '压力管理与深呼吸训练，规律作息',
      '体重管理与有氧耐力训练',
      '记录家庭血压，异常请就医'
    ],
    rhr: [
      '逐步提升有氧耐力：慢跑/骑行/游泳',
      '每周2次间歇训练（如4×4分钟高强度）',
      '保障睡眠与恢复，避免过度训练'
    ],
    vo2max: [
      '每周2次HIIT+2次中等强度有氧组合',
      '间歇方案：4×4分钟高强度，间隔3分钟轻松',
      '逐步延长到每周180–300分钟有氧总量'
    ],
    hdl: [
      '增加运动与健康脂肪：橄榄油、坚果、深海鱼',
      '戒烟限酒，控制精制糖',
      '维持健康体脂率'
    ],
    ldl: [
      '减少饱和脂肪与反式脂肪，增加可溶性纤维（燕麦、豆类）',
      '考虑植物甾醇/烟酸/水溶性纤维补充（咨询医生）',
      '必要时就医评估他汀或非他汀方案'
    ],
    tg: [
      '限制精制糖与酒精，优化餐次分配',
      '补充Omega-3（深海鱼/鱼油）',
      '规律运动与体重管理'
    ],
    hba1c: [
      '控制碳水比例与时机，优先低GI食物',
      '餐后步行或轻度运动10–15分钟',
      '提升肌肉量与胰岛素敏感性（抗阻+有氧）'
    ],
    fpg: [
      '晚餐提前，睡前避免高糖零食',
      '早晨快走/拉伸改善胰岛素敏感性',
      '保持7–9小时高质量睡眠'
    ],
    crp: [
      '抗炎饮食：蔬果、橄榄油、坚果、深海鱼',
      '规律作息与压力管理，避免长期熬夜',
      '排除感染或慢性炎症，必要时就医'
    ],
    egfr: [
      '充足饮水，避免NSAIDs等肾毒性药物过量',
      '控制血压血糖，维持健康体重',
      'eGFR异常持续请肾内科评估'
    ],
    alt: [
      '控制酒精与含糖饮料，减少精制碳水',
      '减重与有氧运动，关注脂肪肝筛查',
      '异常持续请肝病门诊评估'
    ],
    ast: [
      '与ALT类似：控酒、控糖、减重与规律运动',
      '评估药物/草本对肝的影响',
      '必要时完善肝功能检查'
    ],
    uric: [
      '减少高嘌呤食物与酒精（尤其啤酒）',
      '充足饮水与体重管理',
      '反复痛风发作请风湿科评估降尿酸治疗'
    ],
    sleep: [
      '固定睡眠与起床时间，目标7–9小时',
      '睡前1小时远离蓝光与重口味饮食',
      '卧室黑暗、安静、偏凉，持续2周建立节律'
    ],
  };
  return S[id] ? S[id] : [];
}

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
  const actScore = Number.isFinite(actMin) ? clamp((actMin / 300) * 100, 0, 100) : NaN;
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
    { s: actScore, w: 0.35 },
    { s: fvScore, w: 0.20 },
    { s: smokeScore, w: 0.20 },
    { s: alcScore, w: 0.10 },
    { s: sitScore, w: 0.15 },
  ];
  const usable = comps.filter(c => Number.isFinite(c.s));
  if (usable.length === 0 || !Number.isFinite(input.age)) return { lsAge: NaN, score: NaN, delta: NaN, tips: [] };
  const wsum = usable.reduce((a, b) => a + b.w, 0);
  const score = clamp(usable.reduce((a, b) => a + b.s * b.w, 0) / wsum, 0, 100);
  const delta = (50 - score) * 0.2;
  const lsAge = clamp(input.age + delta, 10, 110);
  const tips = [];
  if (ls.smoke === 'current') tips.push('戒烟并寻求专业支持');
  if (Number.isFinite(actMin) && actMin < 150) tips.push('每周≥150–300分钟中等强度活动');
  if (Number.isFinite(ls.fv) && ls.fv < 5) tips.push('每日≥5份蔬果');
  if (Number.isFinite(ls.alc) && ls.alc > 14) tips.push('减少酒精摄入，目标≤7杯/周');
  if (Number.isFinite(ls.sit) && ls.sit > 8) tips.push('久坐久站每小时活动2–3分钟');
  return { lsAge, score, delta, tips };
}

function renderLifestyle(res, age) {
  const ageEl = $("ls_ageVal");
  const deltaEl = $("ls_deltaVal");
  const bar = $("ls_scoreBar");
  const list = $("ls_suggestions");
  if (!Number.isFinite(res.lsAge)) {
    ageEl.textContent = '—';
    deltaEl.textContent = '—';
    bar.style.width = '0%';
    list.innerHTML = '';
    return;
  }
  ageEl.textContent = `${res.lsAge.toFixed(1)} 岁`;
  deltaEl.classList.remove('text-rose-600', 'text-green-600');
  if (res.delta > 0.05) { deltaEl.textContent = `比物理年龄年长 ${res.delta.toFixed(1)} 岁`; deltaEl.classList.add('text-rose-600'); }
  else if (res.delta < -0.05) { deltaEl.textContent = `比物理年龄年轻 ${Math.abs(res.delta).toFixed(1)} 岁`; deltaEl.classList.add('text-green-600'); }
  else { deltaEl.textContent = '与物理年龄相当'; }
  const pct = Math.round(clamp(res.score, 0, 100));
  bar.style.width = `${pct}%`;
  list.innerHTML = res.tips.slice(0, 5).map(t => `<li>${t}</li>`).join('');
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
  if (!Number.isFinite(vo2) || !sex || !Number.isFinite(age)) return { crfAge: NaN, delta: NaN, note: '需要VO2max或RHR' };
  const v0 = sex === 'male' ? 50 : 42;
  const k = sex === 'male' ? 0.34 : 0.30;
  const ageEst = 20 + (v0 - vo2) / k;
  const crfAge = clamp(ageEst, 15, 90);
  const delta = crfAge - age;
  const note = used === 'vo2' ? '由VO2max计算' : used === 'rhr' ? '由RHR估算' : '—';
  return { crfAge, delta, note };
}

function renderCRF(res, age) {
  const ageEl = $("crf_ageVal");
  const deltaEl = $("crf_deltaVal");
  const noteEl = $("crf_note");
  if (!Number.isFinite(res.crfAge)) {
    ageEl.textContent = '—';
    deltaEl.textContent = '—';
    noteEl.textContent = res.note || '—';
    return;
  }
  ageEl.textContent = `${res.crfAge.toFixed(1)} 岁`;
  deltaEl.classList.remove('text-rose-600', 'text-green-600');
  if (res.delta > 0.05) { deltaEl.textContent = `年长 ${res.delta.toFixed(1)} 岁`; deltaEl.classList.add('text-rose-600'); }
  else if (res.delta < -0.05) { deltaEl.textContent = `年轻 ${Math.abs(res.delta).toFixed(1)} 岁`; deltaEl.classList.add('text-green-600'); }
  else { deltaEl.textContent = '与物理年龄相当'; }
  noteEl.textContent = res.note || '—';
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
    { s: durScore, w: 0.35 },
    { s: consScore, w: 0.25 },
    { s: cafScore, w: 0.10 },
    { s: scrScore, w: 0.10 },
    { s: apScore, w: 0.10 },
    { s: qScore, w: 0.10 },
  ];
  const usable = comps.filter(c => Number.isFinite(c.s));
  if (usable.length === 0) return { score: NaN, grade: '—', tips: [] };
  const wsum = usable.reduce((a, b) => a + b.w, 0);
  const score = clamp(usable.reduce((a, b) => a + b.s * b.w, 0) / wsum, 0, 100);
  let grade = 'C';
  if (score >= 85) grade = 'A'; else if (score >= 70) grade = 'B'; else if (score >= 55) grade = 'C'; else grade = 'D';
  const tips = [];
  if (sl.caf === 'yes') tips.push('14点后避免咖啡因');
  if (sl.screen === 'yes') tips.push('睡前1小时远离屏幕');
  if (sl.apnea === 'yes') tips.push('评估打鼾与睡眠呼吸暂停风险');
  if (Number.isFinite(duration) && (duration < 7 || duration > 9)) tips.push('将睡眠时长优化到7–9小时');
  if (Number.isFinite(sl.consistency) && sl.consistency < 5) tips.push('固定作息，规律天数≥5天/周');
  if (Number.isFinite(sl.quality) && sl.quality <= 3) tips.push('睡前放松训练与优化睡眠环境');
  return { score, grade, tips };
}

function renderSleep(res) {
  const scoreEl = $("sl_scoreVal");
  const gradeEl = $("sl_gradeVal");
  const bar = $("sl_scoreBar");
  const list = $("sl_suggestions");
  if (!Number.isFinite(res.score)) {
    scoreEl.textContent = '—';
    gradeEl.textContent = '—';
    bar.style.width = '0%';
    list.innerHTML = '';
    return;
  }
  const pct = Math.round(clamp(res.score, 0, 100));
  scoreEl.textContent = `${pct}`;
  gradeEl.textContent = `${res.grade}`;
  bar.style.width = `${pct}%`;
  list.innerHTML = res.tips.slice(0, 5).map(t => `<li>${t}</li>`).join('');
}

function serializeState() {
  const sex = [...document.querySelectorAll('input[name="sex"]')].find(r => r.checked)?.value || '';
  const state = {
    age: $("age")?.value || '',
    sex,
    height: $("height")?.value || '',
    weight: $("weight")?.value || '',
    waist: $("waist")?.value || '',
    sbp: $("sbp")?.value || '',
    dbp: $("dbp")?.value || '',
    rhr: $("rhr")?.value || '',
    vo2max: $("vo2max")?.value || '',
    sleep: $("sleep")?.value || '',
    gluUnit: $("gluUnit")?.value || 'mgdl',
    lipUnit: $("lipUnit")?.value || 'mgdl',
    crUnit: $("crUnit")?.value || 'mgdl',
    hba1c: $("hba1c")?.value || '',
    fpg: $("fpg")?.value || '',
    ldl: $("ldl")?.value || '',
    hdl: $("hdl")?.value || '',
    tg: $("tg")?.value || '',
    crp: $("crp")?.value || '',
    cr: $("cr")?.value || '',
    alt: $("alt")?.value || '',
    ast: $("ast")?.value || '',
    uric: $("uric")?.value || '',
    ls_days: $("ls_days")?.value || '',
    ls_min: $("ls_min")?.value || '',
    ls_fv: $("ls_fv")?.value || '',
    ls_smoke: $("ls_smoke")?.value || '',
    ls_alc: $("ls_alc")?.value || '',
    ls_sit: $("ls_sit")?.value || '',
    sl_consistency: $("sl_consistency")?.value || '',
    sl_caf: $("sl_caf")?.value || '',
    sl_screen: $("sl_screen")?.value || '',
    sl_apnea: $("sl_apnea")?.value || '',
    sl_quality: $("sl_quality")?.value || ''
  };
  return state;
}

function applyState(state) {
  if (!state || typeof state !== 'object') return;
  if (state.age != null) $("age").value = state.age;
  if (state.sex) {
    const el = document.querySelector(`input[name="sex"][value="${state.sex}"]`);
    if (el) el.checked = true;
  }
  const ids = ["height","weight","waist","sbp","dbp","rhr","vo2max","sleep","hba1c","fpg","ldl","hdl","tg","crp","cr","alt","ast","uric","ls_days","ls_min","ls_fv","ls_smoke","ls_alc","ls_sit","sl_consistency","sl_caf","sl_screen","sl_apnea","sl_quality"]; 
  ids.forEach(id => { if (state[id] != null && $(id)) $(id).value = state[id]; });
  const uids = ["gluUnit","lipUnit","crUnit"]; uids.forEach(id => { if (state[id] && $(id)) $(id).value = state[id]; });
  updateDerivedDisplays();
}

function saveToLocal() {
  try { localStorage.setItem('true_age_state_v1', JSON.stringify(serializeState())); alert('已保存到本地'); } catch (e) { alert('保存失败'); }
}

function loadFromLocal() {
  try { const s = localStorage.getItem('true_age_state_v1'); if (!s) { alert('没有已保存的数据'); return; } const obj = JSON.parse(s); applyState(obj); alert('已从本地读取'); } catch (e) { alert('读取失败'); }
}

function exportJSON() {
  const data = JSON.stringify(serializeState(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'true-age-state.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function triggerImport() { $("importFile").click(); }

function handleImportFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try { const obj = JSON.parse(reader.result); applyState(obj); alert('已导入'); } catch (e) { alert('导入失败'); }
  };
  reader.readAsText(file);
}

function buildSummary() {
  const input = readForm();
  const bio = computeScore(input);
  const ls = computeLifestyleAge(input, readLifestyleInputs());
  const crf = computeCRFAge(input);
  const sl = computeSleepScore(input, readSleepInputs());
  const lines = [];
  if (Number.isFinite(input.age)) lines.push(`物理年龄: ${input.age}`);
  if (Number.isFinite(bio.bioAge)) lines.push(`生理年龄: ${bio.bioAge.toFixed(1)} (Δ ${bio.delta>0?'+':''}${bio.delta.toFixed(1)}) 可信度: ${Math.round(bio.confidence*100)}%`);
  const top = bio.breakdown.slice(0,3).map(c=>`${c.label}${c.years>=0?'+':'−'}${Math.abs(c.years).toFixed(2)}岁`).join('，');
  if (top) lines.push(`主要因子: ${top}`);
  if (Number.isFinite(ls.lsAge)) lines.push(`生活方式年龄: ${ls.lsAge.toFixed(1)} (Δ ${ls.delta>0?'+':''}${ls.delta.toFixed(1)}) 分数: ${Math.round(ls.score)}`);
  if (Number.isFinite(crf.crfAge)) lines.push(`心肺适能年龄: ${crf.crfAge.toFixed(1)} (Δ ${crf.delta>0?'+':''}${crf.delta.toFixed(1)})`);
  if (Number.isFinite(sl.score)) lines.push(`睡眠评分: ${Math.round(sl.score)} 等级: ${sl.grade}`);
  lines.push('由 True-Age 工具生成');
  return lines.join('\n');
}

async function copySummary() {
  try { await navigator.clipboard.writeText(buildSummary()); alert('结果已复制'); } catch (e) { alert('复制失败'); }
}

function makeShareLink() {
  const s = serializeState();
  const qs = new URLSearchParams();
  Object.keys(s).forEach(k => { if (s[k] !== '' && s[k] != null) qs.set(k, s[k]); });
  const link = `${window.location.origin}${window.location.pathname}?${qs.toString()}`;
  return link;
}

async function copyShareLink() {
  const link = makeShareLink();
  try { await navigator.clipboard.writeText(link); alert('分享链接已复制'); } catch (e) { alert('复制失败'); }
}

function applyFromQuery() {
  const p = new URLSearchParams(window.location.search);
  if ([...p.keys()].length === 0) return false;
  const obj = {};
  p.forEach((v,k)=>{ obj[k]=v; });
  applyState(obj);
  const input = readForm();
  if (Number.isFinite(input.age)) { const res = computeScore(input); renderResults(res, input); }
  return true;
}

function onSubmit(e) {
  e.preventDefault();
  const input = readForm();
  if (!Number.isFinite(input.age)) {
    alert('请填写物理年龄');
    return;
  }
  updateDerivedDisplays();
  const res = computeScore(input);
  renderResults(res, input);
}

function onReset() {
  $("ageForm").reset();
  updateDerivedDisplays();
  renderResults({ bioAge: NaN, delta: NaN, confidence: 0, breakdown: [] }, {});
}

function onDemo() {
  $("age").value = 35;
  document.querySelector('input[name="sex"][value="male"]').checked = true;
  $("height").value = 175;
  $("weight").value = 72;
  $("waist").value = 82;

  $("sbp").value = 114;
  $("dbp").value = 72;
  $("rhr").value = 58;
  $("vo2max").value = 44;
  $("sleep").value = 7.3;

  $("gluUnit").value = 'mgdl';
  $("lipUnit").value = 'mgdl';
  $("crUnit").value = 'mgdl';

  $("hba1c").value = 5.2;
  $("fpg").value = 88;
  $("ldl").value = 85;
  $("hdl").value = 60;
  $("tg").value = 90;
  $("crp").value = 0.7;
  $("cr").value = 0.95;
  $("alt").value = 22;
  $("ast").value = 21;
  $("uric").value = 5.2;

  updateDerivedDisplays();
}

function onDemoLS() {
  $("ls_days").value = 4;
  $("ls_min").value = 40;
  $("ls_fv").value = 4;
  $("ls_smoke").value = 'none';
  $("ls_alc").value = 2;
  $("ls_sit").value = 7;
}

function onDemoSL() {
  $("sl_consistency").value = 5;
  $("sl_caf").value = 'no';
  $("sl_screen").value = 'no';
  $("sl_apnea").value = 'no';
  $("sl_quality").value = 4;
}

function wireEvents() {
  $("ageForm").addEventListener('submit', onSubmit);
  $("resetBtn").addEventListener('click', onReset);
  $("demoBtn").addEventListener('click', () => { onDemo(); const res = computeScore(readForm()); renderResults(res, readForm()); });

  ["height", "weight", "waist"].forEach(id => {
    $(id).addEventListener('input', updateDerivedDisplays);
  });
  document.querySelectorAll('input[name="sex"]').forEach(r => r.addEventListener('change', () => {
    const input = readForm();
    if (Number.isFinite(input.age)) {
      const res = computeScore(input);
      renderResults(res, input);
    }
  }));

  $("ls_calcBtn").addEventListener('click', () => {
    const input = readForm();
    const ls = readLifestyleInputs();
    const res = computeLifestyleAge(input, ls);
    renderLifestyle(res, input.age);
  });
  $("ls_demoBtn").addEventListener('click', () => {
    onDemoLS();
    const input = readForm();
    const ls = readLifestyleInputs();
    const res = computeLifestyleAge(input, ls);
    renderLifestyle(res, input.age);
  });

  $("crf_calcBtn").addEventListener('click', () => {
    const input = readForm();
    const res = computeCRFAge(input);
    renderCRF(res, input.age);
  });

  $("sl_calcBtn").addEventListener('click', () => {
    const input = readForm();
    const sl = readSleepInputs();
    const res = computeSleepScore(input, sl);
    renderSleep(res);
  });
  $("sl_demoBtn").addEventListener('click', () => {
    onDemoSL();
    const input = readForm();
    const sl = readSleepInputs();
    const res = computeSleepScore(input, sl);
    renderSleep(res);
  });

  $("saveBtn").addEventListener('click', saveToLocal);
  $("loadBtn").addEventListener('click', loadFromLocal);
  $("exportBtn").addEventListener('click', exportJSON);
  $("importBtn").addEventListener('click', triggerImport);
  $("copyBtn").addEventListener('click', () => { copySummary(); });
  $("shareBtn").addEventListener('click', () => { copyShareLink(); });
  $("importFile").addEventListener('change', (e) => { handleImportFile(e.target.files?.[0]); e.target.value = ''; });
}

const applied = applyFromQuery();
if (!applied) updateDerivedDisplays();
wireEvents();
