// 카운트업
document.querySelectorAll('.count').forEach(el => {
  const target = parseInt(el.dataset.target);
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 40);
});

// 통합 IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    if (el.classList.contains('card') || el.classList.contains('service-card')) {
      setTimeout(() => el.classList.add('visible'), i * 120);
      observer.unobserve(el);
    }

    if (el.classList.contains('bar')) {
      el.style.height = el.dataset.height + '%';
      observer.unobserve(el);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.card, .service-card, .bar').forEach(el => observer.observe(el));

// 문의 폼 제출
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = '전송 중...';
    btn.disabled = true;

    const data = new FormData(contactForm);
    const response = await fetch('https://formspree.io/f/xojrberr', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      contactForm.innerHTML = '<p style="color:#3B82F6; font-size:18px; font-weight:600; text-align:center; padding:40px 0;">✅ 문의가 접수되었습니다!<br><span style="font-size:14px; color:#64748B; font-weight:400;">빠른 시일 내에 연락드리겠습니다.</span></p>';
    } else {
      btn.textContent = '문의 신청하기';
      btn.disabled = false;
      alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  });
}

// 사이드바 목차 스크롤 하이라이트
const tocItems = document.querySelectorAll('.toc-item');

const sectionMap = [
  { id: 'clients', index: 0 },
  { id: 'about', index: 1 },
  { id: 'expertise', index: 2 },
  { id: 'services', index: 3 },
  { id: 'history', index: 4 },
  { id: 'contact', index: 5 }
];

function updateToc() {
  let currentIndex = 0;

  sectionMap.forEach(({ id, index }) => {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2) {
        currentIndex = index;
      }
    }
  });

  tocItems.forEach((item, i) => {
    if (i === currentIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

window.addEventListener('scroll', updateToc);
updateToc(); // 페이지 로드시 바로 실행
// 고객사 인터랙티브 마인드맵
(function () {
  const canvas = document.getElementById('clientsMap');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, cssW, cssH, dpr;
  let nodes = [], stars = [];
  let hoveredNode = null;
  let raf = null;
  let tick = 0;

  const CATS = [
    { name: '손해보험',  color: '#3B82F6', items: ['KB손해보험', '현대해상', '메리츠화재', '신한EZ손보'] },
    { name: '생명보험',  color: '#A78BFA', items: ['교보생명', 'ING생명', '흥국화재'] },
    { name: '공공기관',  color: '#22D3EE', items: ['경찰청', '검찰청', '우정국'] },
    { name: '금융기관',  color: '#10B981', items: ['MG새마을금고', '우리은행', 'KB증권'] },
    { name: '헬스케어',  color: '#F59E0B', items: ['KB헬스케어', '한국에자이'] },
    { name: '유통·식품', color: '#EF4444', items: ['풀무원', 'CJ제일제당', '롯데면세점', 'Inbody'] },
    { name: '보증·보안', color: '#EC4899', items: ['서울보증보험', '신용보증기금'] },
  ];

  function hexRgb(hex) {
    return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  }

  function setup() {
    const wrap = canvas.parentElement;
    cssW = Math.min(wrap.clientWidth - 2, 960);
    cssH = Math.round(cssW * 0.72);
    dpr = window.devicePixelRatio || 1;
    W = cssW; H = cssH;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildNodes();
  }

  function buildNodes() {
    const cx = W / 2, cy = H / 2;
    nodes = []; stars = [];

    for (let i = 0; i < 110; i++) {
      stars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.3+0.2, phi: Math.random()*Math.PI*2 });
    }

    nodes.push({
      id: 'c', type: 'center', x: cx, y: cy, r: 42,
      label: ['주요', '고객사'], color: '#3B82F6', rgb: [59,130,246],
      phi: 0, parentId: null, childIds: []
    });

    const catDist = Math.min(W * 0.22, H * 0.30, 175);
    const leafDist = Math.min(W * 0.13, H * 0.18, 96);

    CATS.forEach((cat, ci) => {
      const angle = (ci / CATS.length) * Math.PI * 2 - Math.PI / 2;
      const cx2 = cx + Math.cos(angle) * catDist;
      const cy2 = cy + Math.sin(angle) * catDist;
      const rgb = hexRgb(cat.color);
      const catId = 'cat' + ci;
      const catNode = {
        id: catId, type: 'cat', x: cx2, y: cy2, r: 27,
        label: [cat.name], color: cat.color, rgb,
        phi: Math.random()*Math.PI*2, parentId: 'c', childIds: [], angle
      };
      nodes.push(catNode);

      const count = cat.items.length;
      const spreadRad = (count <= 2 ? 26 : count <= 3 ? 32 : 36) * Math.PI / 180;

      cat.items.forEach((name, li) => {
        const leafAngle = angle + (li - (count - 1) / 2) * spreadRad;
        const lx = cx2 + Math.cos(leafAngle) * leafDist;
        const ly = cy2 + Math.sin(leafAngle) * leafDist;
        const half = Math.ceil(name.length / 2);
        const leafId = 'leaf' + ci + '_' + li;
        nodes.push({
          id: leafId, type: 'leaf', x: lx, y: ly, r: 23,
          label: name.length > 5 ? [name.slice(0,half), name.slice(half)] : [name],
          color: cat.color, rgb, phi: Math.random()*Math.PI*2, parentId: catId, childIds: [], catIndex: ci
        });
        catNode.childIds.push(leafId);
      });
    });
  }

  function getRelated(node) {
    const ids = new Set([node.id]);
    if (node.parentId) ids.add(node.parentId);
    node.childIds.forEach(id => ids.add(id));
    if (node.type === 'cat') { ids.add('c'); }
    if (node.type === 'leaf') {
      const parent = nodes.find(n => n.id === node.parentId);
      if (parent) { parent.childIds.forEach(id => ids.add(id)); ids.add('c'); }
    }
    if (node.type === 'center') { nodes.filter(n => n.type === 'cat').forEach(n => ids.add(n.id)); }
    return ids;
  }

  function getFloat(node) { return Math.sin(tick * 0.028 + node.phi) * 3.8; }

  function drawBg() {
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.75);
    grad.addColorStop(0, '#0c1628');
    grad.addColorStop(1, '#030a14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    stars.forEach(s => {
      const a = (Math.sin(tick*0.022 + s.phi) * 0.3 + 0.7) * 0.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });
  }

  function drawEdge(n1, n2, bright) {
    const y1 = n1.y + getFloat(n1), y2 = n2.y + getFloat(n2);
    const dx = n2.x - n1.x, dy = y2 - y1;
    const mx = (n1.x + n2.x) / 2, my = (y1 + y2) / 2;
    const cpx = mx - dy * 0.13, cpy = my + dx * 0.13;
    const pulse = Math.sin(tick*0.038 + n2.phi)*0.2 + 0.8;
    const rgb = n2.rgb.join(',');
    const alpha = bright ? 0.8 * pulse : (hoveredNode ? 0.1 : 0.5 * pulse);
    const lw = bright ? (n2.type === 'cat' ? 2.4 : 1.5) : (n2.type === 'cat' ? 1.6 : 0.9);
    ctx.beginPath();
    ctx.moveTo(n1.x, y1);
    ctx.quadraticCurveTo(cpx, cpy, n2.x, y2);
    ctx.strokeStyle = `rgba(${rgb},${alpha})`;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawNode(node, related) {
    const fy = getFloat(node);
    const isHov = hoveredNode && hoveredNode.id === node.id;
    const dimmed = hoveredNode && !related;
    const rgb = node.rgb.join(',');
    ctx.save();
    ctx.translate(node.x, node.y + fy);
    if (isHov) ctx.scale(1.18, 1.18);
    ctx.globalAlpha = dimmed ? 0.22 : 1;

    if (node.type === 'center') {
      const g = ctx.createRadialGradient(0,0,0,0,0,node.r*2.6);
      g.addColorStop(0, `rgba(59,130,246,${0.28+Math.sin(tick*0.045)*0.08})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0,0,node.r*2.6,0,Math.PI*2); ctx.fill();
      const ps = 1 + Math.sin(tick*0.045)*0.12;
      ctx.beginPath(); ctx.arc(0,0,node.r*ps,0,Math.PI*2);
      ctx.strokeStyle = `rgba(59,130,246,${0.38+Math.sin(tick*0.045)*0.12})`;
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,node.r,0,Math.PI*2);
      ctx.fillStyle = '#0c1e36'; ctx.fill();
      ctx.strokeStyle = '#3B82F6'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Apple SD Gothic Neo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('주요', 0, -5); ctx.fillText('고객사', 0, 12);

    } else if (node.type === 'cat') {
      const g = ctx.createRadialGradient(0,0,0,0,0,node.r*2.4);
      g.addColorStop(0, `rgba(${rgb},0.2)`); g.addColorStop(1,'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0,0,node.r*2.4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(0,0,node.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(${rgb},0.15)`; ctx.fill();
      ctx.strokeStyle = node.color; ctx.lineWidth = isHov ? 2.5 : 1.8; ctx.stroke();
      ctx.fillStyle = node.color;
      ctx.font = `bold ${cssW < 560 ? 9 : 11}px Apple SD Gothic Neo, sans-serif`;
      ctx.textAlign = 'center'; ctx.fillText(node.label[0], 0, 5);

    } else {
      const g = ctx.createRadialGradient(0,0,0,0,0,node.r*2);
      g.addColorStop(0, `rgba(${rgb},0.15)`); g.addColorStop(1,'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0,0,node.r*2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(0,0,node.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(${rgb},0.1)`; ctx.fill();
      ctx.strokeStyle = `rgba(${rgb},${isHov ? 0.95 : 0.55})`; ctx.lineWidth = isHov ? 1.6 : 1.1; ctx.stroke();
      ctx.fillStyle = '#d0e2f4';
      ctx.font = `${cssW < 560 ? 8.5 : 10}px Apple SD Gothic Neo, sans-serif`;
      ctx.textAlign = 'center';
      if (node.label.length > 1) { ctx.fillText(node.label[0],0,-3); ctx.fillText(node.label[1],0,10); }
      else { ctx.fillText(node.label[0],0,4); }
    }
    ctx.restore();
  }

  function getNodeAt(mx, my) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = mx - n.x, dy = my - (n.y + getFloat(n));
      if (Math.sqrt(dx*dx + dy*dy) < n.r * 1.5) return n;
    }
    return null;
  }

  function frame() {
    tick++;
    ctx.clearRect(0, 0, W, H);
    drawBg();
    const center = nodes.find(n => n.type === 'center');
    const cats = nodes.filter(n => n.type === 'cat');
    const leaves = nodes.filter(n => n.type === 'leaf');
    const related = hoveredNode ? getRelated(hoveredNode) : null;
    cats.forEach(c => drawEdge(center, c, related ? (related.has(c.id) && related.has('c')) : true));
    leaves.forEach(l => {
      const p = nodes.find(n => n.id === l.parentId);
      if (p) drawEdge(p, l, related ? (related.has(l.id) && related.has(p.id)) : true);
    });
    [...leaves, ...cats, center].forEach(n => drawNode(n, related ? related.has(n.id) : true));
    raf = requestAnimationFrame(frame);
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    hoveredNode = getNodeAt((e.clientX - rect.left) * (W / rect.width), (e.clientY - rect.top) * (H / rect.height));
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  });
  canvas.addEventListener('mouseleave', () => { hoveredNode = null; });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    hoveredNode = getNodeAt((t.clientX - rect.left) * (W / rect.width), (t.clientY - rect.top) * (H / rect.height));
  }, { passive: false });
  canvas.addEventListener('touchend', () => { hoveredNode = null; });

  let resizeTimer;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (raf) cancelAnimationFrame(raf);
      setup(); frame();
    }, 80);
  }).observe(canvas.parentElement);

  setup();
  frame();
})();