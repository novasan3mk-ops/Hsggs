(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Subtle pointer glow.
  const cursorGlow = $('#cursorGlow');
  if (cursorGlow && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  // Reveal on scroll.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = $$('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((el) => observer.observe(el));
  }

  // Mobile navigation.
  const navToggle = $('#navToggle');
  const mainNav = $('#mainNav');
  navToggle?.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('#mainNav a').forEach((link) => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  // "Soon" toast.
  const toast = $('#toast');
  let toastTimer;
  $('#soonButton')?.addEventListener('click', () => {
    clearTimeout(toastTimer);
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  });

  // Product view switcher.
  const productView = $('#productView');
  const productViews = {
    external: {
      src: 'https://media.base44.com/images/public/6a9ecd750c32ce57385cb5f1/b44bf15a1_generated_image.png',
      alt: 'المنظر الخارجي المقترح لجهاز إشارة'
    },
    exploded: {
      src: 'https://media.base44.com/images/public/6a9ecd750c32ce57385cb5f1/0552f8611_generated_image.png',
      alt: 'منظر هندسي مفكك لمكونات جهاز إشارة المقترح'
    }
  };

  $$('.segment').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (!productViews[view] || button.classList.contains('active')) return;
      $$('.segment').forEach((item) => {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-selected', String(item === button));
      });
      productView.classList.add('switching');
      setTimeout(() => {
        productView.src = productViews[view].src;
        productView.alt = productViews[view].alt;
        productView.classList.remove('switching');
      }, 180);
    });
  });

  // FAQ assistant: intentionally local and deterministic so it works without a backend.
  const assistantPanel = $('#assistantPanel');
  const assistantLog = $('#assistantLog');
  const assistantInput = $('#assistantInput');

  function toggleAssistant(force) {
    const open = typeof force === 'boolean' ? force : !assistantPanel.classList.contains('open');
    assistantPanel.classList.toggle('open', open);
    assistantPanel.setAttribute('aria-hidden', String(!open));
    if (open) setTimeout(() => assistantInput?.focus(), 120);
  }

  $('#assistantFab')?.addEventListener('click', () => toggleAssistant());
  $('#assistantClose')?.addEventListener('click', () => toggleAssistant(false));

  const answers = [
    { keys: ['كيف', 'يعمل'], answer: 'الفكرة تمر بأربع طبقات: الكاميرا تلتقط مساحة الإشارة، ثم تُستخرج نقاط اليد/الوجه/الجسم، وبعدها يصنّف نموذج مدرّب الإشارة، ثم تتحول النتيجة إلى صوت أو نص.' },
    { keys: ['انترنت'], answer: 'التصميم المستهدف Offline-first: الوظيفة الأساسية مخطط لها أن تعمل محليًا على الجهاز. قد يُستخدم الاتصال فقط للتحديثات الاختيارية أو مزايا غير أساسية مستقبلًا.' },
    { keys: ['جاهز', 'ترجمة'], answer: 'الموجود في الموقع هو نموذج إثبات لتتبع اليد. الترجمة الكاملة ليست ادعاءً جاهزًا بعد؛ تحتاج بيانات لغة إشارة موثوقة ونموذجًا مدرّبًا واختبارات دقة قبل وصفها كمنتج مكتمل.' },
    { keys: ['خصوصية'], answer: 'الهدف أن تُعالج إطارات الكاميرا داخل الجهاز دون رفع الفيديو. كما يقترح التصميم مؤشرًا ضوئيًا مرتبطًا ماديًا بتشغيل الكاميرا وزر تعطيل فعلي.' },
    { keys: ['رأس', 'كاب'], answer: 'انتقلت الكاميرا من الصدر إلى ذراع أعلى الرأس لأن هذا يمنحها زاوية أفضل لرؤية اليدين والوجه وأعلى الجسم، بينما تبقى وحدة المعالجة والبطارية خلف الكاب لتوزيع الوزن.' },
    { keys: ['بطارية'], answer: 'عمر البطارية رقم يجب إثباته بالنموذج الحقيقي. بدل وعد غير مختبر، يقترح المشروع تقليل استهلاك الطاقة بتفعيل الاستدلال عند وجود حركة واستخدام عتاد Edge AI منخفض الطاقة.' },
    { keys: ['50', 'زمن'], answer: 'أقل من 50 ms هو هدف هندسي مبدئي، وليس قياسًا نهائيًا حتى يُختبر النموذج المضغوط على العتاد المستهدف.' },
    { keys: ['صعب', 'عقبات'], answer: 'أصعب جزء ليس رؤية اليد، بل فهم الإشارات الحركية والجمل الطبيعية مع اختلاف الأشخاص واللهجات وتعابير الوجه. لذلك يقسم المشروع الطريق إلى تتبع، قاموس محدود، ثم نموذج زمني كامل.' },
    { keys: ['حروف', 'كاميرا'], answer: 'النموذج الحي يتعرّف تجريبيًا على ستة أشكال ثابتة: أ، ب، ت، ث، ل، ي. التثبيت يتم عبر عدة إطارات، والنتيجة تعرض درجة مطابقة شكلية وليست دقة نموذج لغة إشارة كامل.' },
    { keys: ['سؤال', 'إبداع'], answer: 'السؤال الهندسي المقترح: هل يؤدي نقل الكاميرا من الصدر إلى أعلى الرأس إلى زيادة بقاء اليدين داخل مجال الرؤية وتحسين ثبات التعرّف، مع الحفاظ على زمن استجابة مناسب ومعالجة محلية؟' },
    { keys: ['نماذج'], answer: 'لكل مشروع توجد نماذج أساسية مثل 1 و1A و1B. وإذا جمعت فيديو أو اختبرت الجهاز على مشاركين فقد تحتاج نموذج العناصر البشرية 4 والموافقة المسبقة قبل جمع البيانات. تحديد النماذج النهائي يكون مع المشرف ولجنة SRC حسب إجراءاتك.' }
  ];

  function localAnswer(question) {
    const normalized = question.toLowerCase().replace(/[؟?.,،]/g, ' ');
    let best = null;
    let bestScore = 0;
    for (const item of answers) {
      const score = item.keys.reduce((sum, key) => sum + (normalized.includes(key) ? 1 : 0), 0);
      if (score > bestScore) { best = item; bestScore = score; }
    }
    return bestScore ? best.answer : 'أقدر أشرح الفكرة، التصميم على الرأس، الخصوصية، نموذج الكاميرا، خطة التدريب، أو المخاطر الهندسية. جرّب سؤالًا أقصر عن أحد هذه الجوانب.';
  }

  function appendMessage(text, type) {
    const message = document.createElement('div');
    message.className = type === 'user' ? 'user-message' : 'bot-message';
    message.textContent = text;
    assistantLog.append(message);
    assistantLog.scrollTop = assistantLog.scrollHeight;
  }

  function askAssistant(question) {
    const clean = String(question || '').trim();
    if (!clean) return;
    appendMessage(clean, 'user');
    setTimeout(() => appendMessage(localAnswer(clean), 'bot'), 180);
  }

  $('#assistantForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    askAssistant(assistantInput.value);
    assistantInput.value = '';
  });
  $$('.quick-questions button').forEach((button) => button.addEventListener('click', () => askAssistant(button.dataset.q)));

  const copyAbstractButton = $('#copyAbstract');
  copyAbstractButton?.addEventListener('click', async () => {
    const text = $('#abstractText')?.textContent?.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const old = copyAbstractButton.textContent;
      copyAbstractButton.textContent = 'تم النسخ ✓';
      setTimeout(() => { copyAbstractButton.textContent = old; }, 1800);
    } catch {
      copyAbstractButton.textContent = 'حدد النص وانسخه يدويًا';
    }
  });

  // Camera + MediaPipe Hands. Lightweight static-sign prototype for a small, explicit alphabet subset.
  const video = $('#webcam');
  const canvas = $('#outputCanvas');
  const ctx = canvas?.getContext('2d');
  const status = $('#cameraStatus');
  const resultBox = $('#trackingResult');
  const startButton = $('#startCamera');
  const stopButton = $('#stopCamera');
  const recognitionLetter = $('#recognitionLetter');
  const recognitionConfidence = $('#recognitionConfidence');
  const confidenceBar = $('#confidenceBar');
  const difficultyLabel = $('#difficultyLabel');
  const targetSign = $('#targetSign');
  const targetHint = $('#targetHint');
  const nextTarget = $('#nextTarget');
  const sessionFramesEl = $('#sessionFrames');
  const handFramesEl = $('#handFrames');
  const detectionRateEl = $('#detectionRate');
  const inferenceTimeEl = $('#inferenceTime');

  const signLessons = [
    { letter: 'أ', hint: 'ارفع الإبهام وأغلق بقية الأصابع.' },
    { letter: 'ب', hint: 'افتح الأصابع الأربعة واثنِ الإبهام للداخل.' },
    { letter: 'ت', hint: 'ارفع السبابة والوسطى فقط وأغلق البقية.' },
    { letter: 'ث', hint: 'ارفع السبابة والوسطى والبنصر وأغلق الخنصر.' },
    { letter: 'ل', hint: 'ارفع السبابة والإبهام لتكوين زاوية L وأغلق البقية.' },
    { letter: 'ي', hint: 'افتح الإبهام والخنصر فقط وأغلق الأصابع الثلاثة الوسطى.' }
  ];

  const difficultyProfiles = {
    easy: { label: 'مبتدئ', threshold: 0.72, hold: 4 },
    medium: { label: 'متوسط', threshold: 0.82, hold: 8 },
    hard: { label: 'تحدّي', threshold: 0.90, hold: 13 }
  };

  const signPatterns = {
    'أ': [1, 0, 0, 0, 0],
    'ب': [0, 1, 1, 1, 1],
    'ت': [0, 1, 1, 0, 0],
    'ث': [0, 1, 1, 1, 0],
    'ل': [1, 1, 0, 0, 0],
    'ي': [1, 0, 0, 0, 1]
  };

  let hands = null;
  let stream = null;
  let rafId = 0;
  let processing = false;
  let running = false;
  let trackedFrames = 0;
  let totalInferenceFrames = 0;
  let handDetectedFrames = 0;
  let lastInferenceMs = 0;
  let difficulty = 'easy';
  let lessonIndex = 0;
  let stableLetter = '';
  let stableFrames = 0;
  let acceptedLetter = '';

  function updateSessionMetrics() {
    if (sessionFramesEl) sessionFramesEl.textContent = String(totalInferenceFrames);
    if (handFramesEl) handFramesEl.textContent = String(handDetectedFrames);
    if (detectionRateEl) detectionRateEl.textContent = totalInferenceFrames ? `${Math.round((handDetectedFrames / totalInferenceFrames) * 100)}%` : '0%';
    if (inferenceTimeEl) inferenceTimeEl.textContent = lastInferenceMs ? `${lastInferenceMs.toFixed(1)} ms` : '— ms';
  }

  function setStatus(kind, text) {
    status.classList.toggle('active', kind === 'active');
    status.classList.toggle('error', kind === 'error');
    status.innerHTML = `<span></span> ${text}`;
  }

  function setResult(title, description) {
    resultBox.innerHTML = `<small>ESHARA VISION</small><strong>${title}</strong><p>${description}</p>`;
  }

  function setRecognition(letter = '—', score = 0) {
    const value = Math.max(0, Math.min(1, score));
    recognitionLetter.textContent = letter;
    recognitionConfidence.textContent = `${Math.round(value * 100)}%`;
    confidenceBar.style.width = `${Math.round(value * 100)}%`;
  }

  function setLesson(index) {
    lessonIndex = (index + signLessons.length) % signLessons.length;
    const lesson = signLessons[lessonIndex];
    targetSign.textContent = lesson.letter;
    targetHint.textContent = lesson.hint;
    acceptedLetter = '';
  }

  function setDifficulty(level) {
    if (!difficultyProfiles[level]) return;
    difficulty = level;
    difficultyLabel.textContent = difficultyProfiles[level].label;
    $$('.difficulty').forEach((button) => button.classList.toggle('active', button.dataset.level === level));
    stableLetter = '';
    stableFrames = 0;
  }

  $$('.difficulty').forEach((button) => button.addEventListener('click', () => setDifficulty(button.dataset.level)));
  nextTarget?.addEventListener('click', () => setLesson(lessonIndex + 1));
  setLesson(0);
  setDifficulty('easy');

  function resizeCanvas() {
    if (!video.videoWidth || !video.videoHeight) return;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  }

  function drawFallbackFrame() {
    resizeCanvas();
    if (!canvas.width) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function distance(a, b) {
    return Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
  }

  function jointAngle(a, b, c) {
    const abx = a.x - b.x;
    const aby = a.y - b.y;
    const cbx = c.x - b.x;
    const cby = c.y - b.y;
    const denom = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
    if (!denom) return 0;
    const cosine = Math.max(-1, Math.min(1, (abx * cbx + aby * cby) / denom));
    return Math.acos(cosine) * 180 / Math.PI;
  }

  function fingerIsExtended(lm, mcp, pip, dip, tip) {
    const pipAngle = jointAngle(lm[mcp], lm[pip], lm[tip]);
    const dipAngle = jointAngle(lm[pip], lm[dip], lm[tip]);
    const wristGain = distance(lm[tip], lm[0]) / Math.max(distance(lm[pip], lm[0]), 0.001);
    return pipAngle > 145 && dipAngle > 145 && wristGain > 1.08;
  }

  function thumbIsExtended(lm) {
    const palm = Math.max(distance(lm[5], lm[17]), 0.001);
    const angle = jointAngle(lm[1], lm[2], lm[4]);
    const separation = distance(lm[4], lm[5]) / palm;
    return angle > 135 && separation > 0.72;
  }

  function extractFingerState(lm) {
    return [
      thumbIsExtended(lm),
      fingerIsExtended(lm, 5, 6, 7, 8),
      fingerIsExtended(lm, 9, 10, 11, 12),
      fingerIsExtended(lm, 13, 14, 15, 16),
      fingerIsExtended(lm, 17, 18, 19, 20)
    ].map(Boolean);
  }

  function comparePattern(state, pattern) {
    let matches = 0;
    state.forEach((value, index) => { if (Number(value) === pattern[index]) matches += 1; });
    return matches / pattern.length;
  }

  function classifyStaticSign(lm) {
    const state = extractFingerState(lm);
    let bestLetter = '';
    let bestScore = 0;
    for (const [letter, pattern] of Object.entries(signPatterns)) {
      const raw = comparePattern(state, pattern);
      // Exact finger-state matches are useful, but still heuristic — cap below 100%.
      const score = raw === 1 ? 0.94 : raw * 0.88;
      if (score > bestScore) {
        bestLetter = letter;
        bestScore = score;
      }
    }
    return { letter: bestLetter, score: bestScore, state };
  }

  function updateStableRecognition(candidate) {
    const profile = difficultyProfiles[difficulty];
    if (!candidate || candidate.score < profile.threshold) {
      stableLetter = '';
      stableFrames = 0;
      acceptedLetter = '';
      return { accepted: false, progress: 0 };
    }

    if (stableLetter === candidate.letter) stableFrames += 1;
    else {
      stableLetter = candidate.letter;
      stableFrames = 1;
      acceptedLetter = '';
    }

    const progress = Math.min(1, stableFrames / profile.hold);
    if (stableFrames >= profile.hold) acceptedLetter = stableLetter;
    return { accepted: Boolean(acceptedLetter), progress };
  }

  async function ensureHands() {
    if (hands) return hands;
    if (typeof window.Hands !== 'function') {
      throw new Error('تعذر تحميل محرك MediaPipe. تحقق من الاتصال أو من سياسات CDN في الموقع.');
    }

    hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.58
    });

    hands.onResults((results) => {
      if (!running) return;
      resizeCanvas();
      if (!canvas.width) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (results.image) ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      const multi = results.multiHandLandmarks || [];
      totalInferenceFrames += 1;
      if (multi.length) handDetectedFrames += 1;
      updateSessionMetrics();
      multi.forEach((landmarks) => {
        if (typeof window.drawConnectors === 'function' && window.HAND_CONNECTIONS) {
          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#66fcf1', lineWidth: 3 });
        }
        if (typeof window.drawLandmarks === 'function') {
          window.drawLandmarks(ctx, landmarks, { color: '#ffffff', fillColor: '#66fcf1', lineWidth: 1, radius: 3 });
        }
      });

      if (multi.length) {
        trackedFrames += 1;
        const candidates = multi.map(classifyStaticSign).sort((a, b) => b.score - a.score);
        const candidate = candidates[0];
        const stability = updateStableRecognition(candidate);
        const profile = difficultyProfiles[difficulty];
        const displayScore = candidate.score * (0.82 + stability.progress * 0.18);
        setRecognition(candidate.letter || '—', displayScore);

        if (stability.accepted) {
          const wanted = signLessons[lessonIndex].letter;
          if (acceptedLetter === wanted) {
            setResult(`✓ ممتاز — حرف ${acceptedLetter}`, `تم تثبيت المطابقة على مستوى «${profile.label}». جرّب حرفًا آخر من زر التدريب.`);
          } else {
            setResult(`تم رصد حرف ${acceptedLetter}`, `المطلوب الآن «${wanted}». غيّر شكل اليد حسب التلميح ثم ثبّتها للحظات.`);
          }
        } else if (candidate.score >= profile.threshold) {
          setResult(`مرشح: ${candidate.letter}`, `ثبّت يدك قليلًا… ${Math.round(stability.progress * 100)}% من مدة التثبيت المطلوبة.`);
        } else {
          setResult('الشكل غير واضح بعد', 'اجعل الكف كاملًا داخل الإطار، ووجّه اليد للكاميرا، ثم جرّب أحد الحروف الستة المدعومة.');
        }
      } else {
        stableLetter = '';
        stableFrames = 0;
        acceptedLetter = '';
        setRecognition('—', 0);
        setResult('في انتظار اليد', 'ارفع يدًا واحدة كاملة داخل الإطار وبإضاءة أمامية واضحة.');
      }
      ctx.restore();
    });

    await hands.initialize();
    return hands;
  }

  async function processLoop() {
    if (!running) return;
    if (video.readyState >= 2 && !processing) {
      processing = true;
      try {
        const startedAt = performance.now();
        await hands.send({ image: video });
        lastInferenceMs = performance.now() - startedAt;
        updateSessionMetrics();
      } catch (error) {
        console.error(error);
        setStatus('error', 'تعذر تشغيل محرك التتبّع');
        setResult('خطأ في التتبّع', 'أوقف الكاميرا ثم أعد المحاولة.');
        stopCamera();
        return;
      } finally {
        processing = false;
      }
    }
    rafId = requestAnimationFrame(processLoop);
  }

  async function startCamera() {
    if (running) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error', 'المتصفح لا يتيح Camera API هنا');
      setResult('الكاميرا غير متاحة', 'افتح الصفحة عبر HTTPS أو localhost وبمتصفح حديث.');
      return;
    }

    startButton.disabled = true;
    setStatus('active', 'جارٍ تجهيز محرك الرؤية...');
    setResult('تهيئة التعرّف', 'يتم تحميل نموذج تتبع اليد ثم يبدأ المصنّف التجريبي داخل المتصفح.');

    try {
      await ensureHands();
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      video.srcObject = stream;
      await video.play();
      running = true;
      trackedFrames = 0;
      totalInferenceFrames = 0;
      handDetectedFrames = 0;
      lastInferenceMs = 0;
      updateSessionMetrics();
      stableLetter = '';
      stableFrames = 0;
      acceptedLetter = '';
      setStatus('active', 'الكاميرا تعمل — تعرّف محلي تجريبي');
      setResult('ابدأ بحرف التدريب', `الحرف المطلوب الآن «${signLessons[lessonIndex].letter}». ${signLessons[lessonIndex].hint}`);
      stopButton.disabled = false;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(processLoop);
    } catch (error) {
      console.error(error);
      const denied = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError';
      setStatus('error', denied ? 'تم رفض إذن الكاميرا' : 'تعذر تشغيل الكاميرا');
      setResult('لم تبدأ التجربة', denied ? 'اسمح للموقع باستخدام الكاميرا من إعدادات المتصفح ثم حاول مرة أخرى.' : (error?.message || 'تحقق من HTTPS واتصال الشبكة ثم أعد المحاولة.'));
      startButton.disabled = false;
    }
  }

  function stopCamera() {
    running = false;
    cancelAnimationFrame(rafId);
    rafId = 0;
    processing = false;
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    if (video) video.srcObject = null;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStatus('', 'الكاميرا متوقفة');
    setRecognition('—', 0);
    setResult('تم إيقاف التجربة', trackedFrames ? `عالج النموذج ${trackedFrames} إطارًا يحتوي على يد أثناء هذه الجلسة.` : 'يمكنك تشغيل الكاميرا مرة أخرى متى شئت.');
    startButton.disabled = false;
    stopButton.disabled = true;
  }

  startButton?.addEventListener('click', startCamera);
  stopButton?.addEventListener('click', stopCamera);
  addEventListener('beforeunload', () => stream?.getTracks().forEach((track) => track.stop()));
  addEventListener('resize', drawFallbackFrame, { passive: true });
})();
