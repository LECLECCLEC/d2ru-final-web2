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

    // 카드 페이드인
    if (el.classList.contains('card') || el.classList.contains('service-card')) {
      setTimeout(() => el.classList.add('visible'), i * 120);
      observer.unobserve(el);
    }

    // 바 차트
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
      contactForm.innerHTML = '<p style="color:#818cf8; font-size:18px; font-weight:600; text-align:center; padding:40px 0;">✅ 문의가 접수되었습니다!<br><span style="font-size:14px; color:rgba(255,255,255,0.5); font-weight:400;">빠른 시일 내에 연락드리겠습니다.</span></p>';
    } else {
      btn.textContent = '문의 신청하기';
      btn.disabled = false;
      alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  });
}
