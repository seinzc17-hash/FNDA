/**
 * 이마트 리버점 삼겹살 프로모션 사이트 순수 바닐라 자바스크립트 (Vanilla JS)
 * 외부 라이브러리/프레임워크 없이 순수 브라우저 API로만 구현
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initCartCalculator();
  initCardNewsCarousel();
  initFaqAccordion();
  initLightbox();
  initShareFeatures();
});

/* ==========================================================================
   1. 행사 D-Day 카운트다운 타이머
   ========================================================================== */
function initCountdown() {
  // 1차 행사 시작일: 2026년 11월 7일 오전 10시 (한국 시간)
  const targetDate = new Date('2026-11-07T10:00:00+09:00').getTime();

  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minsEl = document.getElementById('cdMins');
  const secsEl = document.getElementById('cdSecs');

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. 35,000원 스마트 장바구니 계산기 (핵심 킬러 기능)
   ========================================================================== */
const PRODUCTS = [
  {
    id: 'pork',
    name: '국내산 삼겹살 500g',
    category: '정육',
    price: 13900,
    emoji: '🥩',
    isMain: true,
    desc: '신선한 국내산 냉장 삼겹살 구이용'
  },
  {
    id: 'vege',
    name: '모둠 쌈채소 (상추+깻잎)',
    category: '신선채소',
    price: 2980,
    emoji: '🥬',
    desc: '고기와 환상궁합 신선 채소'
  },
  {
    id: 'garlic',
    name: '알싸한 깐마늘 (200g)',
    category: '신선채소',
    price: 2480,
    emoji: '🧄',
    desc: '구워먹기 딱 좋은 통마늘'
  },
  {
    id: 'pepper',
    name: '매콤 청양고추 (150g)',
    category: '신선채소',
    price: 1890,
    emoji: '🌶️',
    desc: '느끼함을 꽉 잡아주는 깔끔한 매운맛'
  },
  {
    id: 'mushroom',
    name: '새송이버섯 (팩)',
    category: '신선채소',
    price: 2200,
    emoji: '🍄',
    desc: '쫄깃한 식감의 구이용 버섯'
  },
  {
    id: 'ssamjang',
    name: '고기전용 구수한 쌈장 (500g)',
    category: '소스/양념',
    price: 2680,
    emoji: '🥣',
    desc: '삼겹살 맛을 배로 살리는 특제 쌈장'
  },
  {
    id: 'onion',
    name: '아삭한 햇양파 (1.5kg 망)',
    category: '신선채소',
    price: 3980,
    emoji: '🧅',
    desc: '달콤하게 구워지는 신선 양파'
  },
  {
    id: 'kimchi',
    name: '구이용 맛김치 (1kg)',
    category: '음료',
    price: 7900,
    emoji: '🥢',
    desc: '삼겹살 기름에 함께 굽는 별미'
  },
  {
    id: 'drink',
    name: '라임 탄산수 (4입 번들)',
    category: '음료',
    price: 3500,
    emoji: '🥤',
    desc: '기름기를 씻어주는 청량한 탄산수'
  },
  {
    id: 'tofu',
    name: '된장찌개용 부드러운 두부',
    category: '신선채소',
    price: 1500,
    emoji: '🍲',
    desc: '고기 밥상 필수 된장찌개 재료'
  }
];

function initCartCalculator() {
  const TARGET_AMOUNT = 35000;
  const DISCOUNT_AMOUNT = 2000;

  // 장바구니 상태: 삼겹살은 기본 1개 세팅
  const cartState = {
    pork: 1
  };

  const gridContainer = document.getElementById('itemsGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const panel = document.getElementById('calcSummaryPanel');
  const resetBtn = document.getElementById('resetCartBtn');
  const copyBtn = document.getElementById('copyListBtn');

  // 모바일 하단 플로팅 바
  const mobileBar = document.getElementById('mobileCartBar');
  const mobileAmount = document.getElementById('mobileCartAmount');

  // 상품 카드 렌더링
  function renderProducts(filter = 'all') {
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    PRODUCTS.forEach(p => {
      if (filter !== 'all' && p.category.indexOf(filter) === -1) {
        return;
      }

      const qty = cartState[p.id] || 0;
      const card = document.createElement('div');
      card.className = `item-card ${p.isMain ? 'is-main' : ''}`;
      card.innerHTML = `
        ${p.isMain ? '<span class="item-badge-main">행사 대표</span>' : ''}
        <div class="item-emoji">${p.emoji}</div>
        <div class="item-name">${p.name}</div>
        <div class="item-category">${p.category}</div>
        <div class="item-price-row">
          <span class="item-price">${p.price.toLocaleString()}원</span>
        </div>
        <div class="item-control">
          <button type="button" class="qty-btn minus" data-id="${p.id}" aria-label="${p.name} 수량 감소">−</button>
          <span class="qty-num" id="qty-${p.id}">${qty}</span>
          <button type="button" class="qty-btn plus" data-id="${p.id}" aria-label="${p.name} 수량 증가">+</button>
        </div>
      `;

      gridContainer.appendChild(card);
    });

    // 수량 변경 이벤트 리스너 바인딩
    gridContainer.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = e.currentTarget.dataset.id;
        const isPlus = e.currentTarget.classList.contains('plus');
        changeQty(id, isPlus ? 1 : -1);
      });
    });
  }

  function changeQty(id, delta) {
    const current = cartState[id] || 0;
    const next = Math.max(0, current + delta);

    if (next === 0) {
      delete cartState[id];
    } else {
      cartState[id] = next;
    }

    // UI 수량 표시 업데이트
    const numEl = document.getElementById(`qty-${id}`);
    if (numEl) numEl.textContent = next;

    updateReceipt();
  }

  // 영수증 및 프로그레스 바 실시간 계산
  let previouslyReached = false;

  function updateReceipt() {
    let subtotal = 0;
    let hasPork = false;

    PRODUCTS.forEach(p => {
      const qty = cartState[p.id] || 0;
      if (qty > 0) {
        subtotal += p.price * qty;
        if (p.id === 'pork') hasPork = true;
      }
    });

    const isGoalReached = subtotal >= TARGET_AMOUNT && hasPork;
    const discount = isGoalReached ? DISCOUNT_AMOUNT : 0;
    const finalTotal = Math.max(0, subtotal - discount);

    // 프로그레스 바 계산
    const percent = Math.min(100, Math.round((subtotal / TARGET_AMOUNT) * 100));
    const meterFill = document.getElementById('meterBarFill');
    const meterCurrent = document.getElementById('meterCurrentVal');
    const meterMsg = document.getElementById('meterStatusMsg');

    if (meterFill) meterFill.style.width = `${percent}%`;
    if (meterCurrent) meterCurrent.textContent = `${subtotal.toLocaleString()}원`;

    if (meterMsg) {
      if (!hasPork) {
        meterMsg.innerHTML = '⚠️ 삼겹살을 최소 1팩 담아야 혜택이 적용됩니다!';
      } else if (subtotal < TARGET_AMOUNT) {
        const remain = TARGET_AMOUNT - subtotal;
        meterMsg.innerHTML = `💡 삼겹살 <strong>2,000원 할인</strong>까지 <strong>${remain.toLocaleString()}원</strong> 남았어요!`;
      } else {
        meterMsg.innerHTML = `🎉 축하합니다! 35,000원 달성으로 <strong>삼겹살 2,000원 할인 확정!</strong>`;
      }
    }

    // 목표 도달 스타일
    if (panel) {
      if (isGoalReached) {
        panel.classList.add('goal-reached');
        if (!previouslyReached) {
          triggerSuccessPulse();
          previouslyReached = true;
        }
      } else {
        panel.classList.remove('goal-reached');
        previouslyReached = false;
      }
    }

    // 영수증 금액 표기
    const subtotalEl = document.getElementById('receiptSubtotal');
    const discountRow = document.getElementById('receiptDiscountRow');
    const discountEl = document.getElementById('receiptDiscount');
    const totalEl = document.getElementById('receiptTotal');

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()}원`;
    if (discountRow) {
      discountRow.style.display = discount > 0 ? 'flex' : 'none';
      if (discountEl) discountEl.textContent = `-${discount.toLocaleString()}원`;
    }
    if (totalEl) totalEl.textContent = `${finalTotal.toLocaleString()}원`;

    // 모바일 하단 플로팅 바
    if (mobileBar && mobileAmount) {
      if (subtotal > 0) {
        mobileBar.classList.add('active');
        mobileAmount.textContent = `${finalTotal.toLocaleString()}원 (${percent}%)`;
      } else {
        mobileBar.classList.remove('active');
      }
    }
  }

  function triggerSuccessPulse() {
    showToast('🎉 35,000원 달성! 삼겹살 2,000원 즉시 할인이 적용되었습니다!');
  }

  // 필터 버튼 클릭 이벤트
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const filter = e.currentTarget.dataset.filter;
      renderProducts(filter);
    });
  });

  // 장바구니 초기화
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      for (const key in cartState) delete cartState[key];
      cartState.pork = 1; // 삼겹살 1개로 복구
      renderProducts();
      updateReceipt();
      showToast('장바구니가 기본 상태로 초기화되었습니다.');
    });
  }

  // 장보기 리스트 복사 기능
  if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let text = '🛒 [이마트 리버점] 주말 삼겹살 장보기 리스트\n';
      text += '━━━━━━━━━━━━━━━━━━━━\n';
      let count = 0;
      let sum = 0;

      PRODUCTS.forEach(p => {
        const qty = cartState[p.id] || 0;
        if (qty > 0) {
          count++;
          sum += p.price * qty;
          text += `• ${p.name} × ${qty}개 (${(p.price * qty).toLocaleString()}원)\n`;
        }
      });

      if (count === 0) {
        showToast('장바구니에 담긴 상품이 없습니다.');
        return;
      }

      const isGoal = sum >= TARGET_AMOUNT && cartState.pork > 0;
      text += '━━━━━━━━━━━━━━━━━━━━\n';
      text += `할인 전 장바구니 합계: ${sum.toLocaleString()}원\n`;
      if (isGoal) {
        text += `행사 특별 할인: -${DISCOUNT_AMOUNT.toLocaleString()}원\n`;
        text += `최종 예상 결제액: ${(sum - DISCOUNT_AMOUNT).toLocaleString()}원 (할인 적용 성공!)\n`;
      } else {
        text += `최종 예상 결제액: ${sum.toLocaleString()}원\n`;
      }
      text += '📍 행사 장소: 이마트 리버점 단독\n';
      text += '📅 행사 기간: 11월 7·8일, 14·15일 (토·일 4일간)';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('📋 장보기 목록이 복사되었습니다! 카톡에 붙여넣으세요.');
        }).catch(() => {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    });
  }

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('📋 장보기 목록이 복사되었습니다!');
    } catch(err) {
      showToast('복사에 실패했습니다.');
    }
    document.body.removeChild(ta);
  }

  // 최초 렌더링
  renderProducts();
  updateReceipt();
}

/* ==========================================================================
   3. 카드뉴스 반응형 캐러셀 (5편 탐색)
   ========================================================================== */
function initCardNewsCarousel() {
  const slidesContainer = document.getElementById('carouselSlides');
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (!slidesContainer) return;

  const slides = slidesContainer.querySelectorAll('.carousel-slide');
  const total = slides.length;
  let currentIndex = 0;
  let autoPlayTimer = null;

  // 인디케이터 점(dot) 생성
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `dot-btn ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `카드뉴스 ${i + 1}번 보기`);
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goTo(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    currentIndex = (index + total) % total;
    slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

    // 닷 상태 업데이트
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot-btn');
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === currentIndex);
      });
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(currentIndex - 1);
      resetAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(currentIndex + 1);
      resetAutoPlay();
    });
  }

  // 자동 넘김 (4.5초마다)
  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      goTo(currentIndex + 1);
    }, 4500);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  // 마우스 오버 시 일시정지
  const wrapper = document.querySelector('.carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    wrapper.addEventListener('mouseleave', () => startAutoPlay());
  }

  // 터치 스와이프 지원
  let touchStartX = 0;
  let touchEndX = 0;

  slidesContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slidesContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      goTo(currentIndex + 1);
      resetAutoPlay();
    } else if (touchEndX - touchStartX > 50) {
      goTo(currentIndex - 1);
      resetAutoPlay();
    }
  }, { passive: true });

  startAutoPlay();
}

/* ==========================================================================
   4. 라이트박스 이미지 확대 모달
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');

  if (!modal || !modalImg) return;

  const triggerImgs = document.querySelectorAll('.carousel-slide, .poster-img-wrap');
  triggerImgs.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || '확대 이미지';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   5. FAQ 아코디언 컴포넌트
   ========================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!questionBtn || !answer) return;

    questionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = item.classList.contains('open');

      items.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherAns = other.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        item.classList.remove('open');
        answer.style.maxHeight = null;
      }
    });
  });
}

/* ==========================================================================
   6. 소셜 공유 및 캘린더 등록 기능
   ========================================================================== */
function initShareFeatures() {
  const shareLinkBtn = document.getElementById('shareLinkBtn');
  const shareKakaoBtn = document.getElementById('shareKakaoBtn');
  const addCalBtn = document.getElementById('addCalendarBtn');

  if (shareLinkBtn) {
    shareLinkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('🔗 사이트 링크가 복사되었습니다!');
        }).catch(() => {
          showToast('링크 복사에 실패했습니다.');
        });
      } else {
        showToast('🔗 링크: ' + window.location.href);
      }
    });
  }

  if (shareKakaoBtn) {
    shareKakaoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (navigator.share) {
        navigator.share({
          title: '[이마트 리버점] 주말 삼겹살 2,000원 할인 프로모션',
          text: '35,000원 이상 장보면 국내산 삼겹살 500g 1팩 2,000원 즉시 할인! (11/7~8, 11/14~15)',
          url: window.location.href
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('🔗 공유 링크가 복사되었습니다. 카카오톡에 붙여넣어 공유하세요!');
        });
      } else {
        showToast('공유 링크: ' + window.location.href);
      }
    });
  }

  if (addCalBtn) {
    addCalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Emart River//Promotion Calendar//KO
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:이마트 리버점 삼겹살 주말 프로모션 (35000원 이상 2000원 할인)
DESCRIPTION:이마트 리버점 단독! 35000원 이상 결제 시 국내산 삼겹살 500g 2000원 즉시 할인. 영수증당 1팩 한정.
DTSTART;TZID=Asia/Seoul:20261107T100000
DTEND;TZID=Asia/Seoul:20261108T220000
LOCATION:이마트 리버점
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
SUMMARY:이마트 리버점 삼겹살 주말 프로모션 2차 (35000원 이상 2000원 할인)
DESCRIPTION:이마트 리버점 단독! 35000원 이상 결제 시 국내산 삼겹살 500g 2000원 즉시 할인. 영수증당 1팩 한정.
DTSTART;TZID=Asia/Seoul:20261114T100000
DTEND;TZID=Asia/Seoul:20261115T220000
LOCATION:이마트 리버점
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'emart_river_promotion.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📅 캘린더 일정 파일(.ics)이 다운로드되었습니다!');
    });
  }
}

/* ==========================================================================
   7. 토스트 팝업 유틸리티
   ========================================================================== */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toastNotice');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
