// ======== 전역 변수 ========
let currentStep = 0;
const totalSteps = 4;
let selectedSite = '';
let selectedBusNo = '';
let enteredPlate = '';

// ======== DOM 요소 ========
const pages = document.querySelectorAll('.page');
const inputs = {
  busNo: document.getElementById('busNo'),
  photo: document.getElementById('photo')
};
const buttons = {
  b1: document.getElementById('b1'),
  b3: document.getElementById('b3')
};
const preview = document.getElementById('preview');

// 근무지 선택 버튼
const siteButtons = {
  nopo: document.getElementById('site-nopo'),
  jeonggwan: document.getElementById('site-jeonggwan')
};

// 버스번호 버튼 컨테이너
const busnoButtonsDiv = document.getElementById('busno-buttons');

// ======== 버스번호 목록 ========
const BUSNO_LIST = {
  '노포': ['29', '80', '300'],
  '정관': ['73', '73 (오전)', '106', '107', '184', '188']
};

// 29번 노선의 차량번호 리스트
const PLATE_LIST_29 = [
  '2932','2933','3102','3105','3106','3108','3120','3121','3131','3133','3137','3139','3142','3144','3145','3147','3151','3152','3168','3174','3190','3192','3199','3201','3204','3223','3300'
];

// ======== 유효성 검사 함수들 ========
const validators = {
  // 면허판번호 검증 (70가1234 형식)
  plate: (value) => {
    if (!value.trim()) return '면허판 번호를 입력해주세요.';
    const pattern = /^\d{2}[가-힣]\d{4}$/;
    if (!pattern.test(value)) return '올바른 면허판 번호 형식으로 입력해주세요. (예: 70가1234)';
    return null;
  },
  // 사진 검증
  photo: (file) => {
    if (!file) return '사진을 선택해주세요.';
    if (!file.type.startsWith('image/')) return '이미지 파일만 선택 가능합니다.';
    if (file.size > 10 * 1024 * 1024) return '파일 크기는 10MB 이하로 선택해주세요.';
    return null;
  }
};

// ======== 유틸리티 함수들 ========
function showError(message) {
  alert(message);
}

function validateInput(type, value) {
  const validator = validators[type];
  if (!validator) return true;
  const error = validator(value);
  if (error) {
    showError(error);
    return false;
  }
  return true;
}

function updateButtonState(buttonId, isValid) {
  const button = buttons[buttonId];
  if (button) {
    button.disabled = !isValid;
  }
}

function getCurrentPrevBtn() {
  const cards = document.querySelectorAll('.card');
  return cards[currentStep]?.querySelector('.prevBtn');
}

function updatePrevBtn() {
  document.querySelectorAll('.prevBtn').forEach((btn, idx) => {
    btn.disabled = (currentStep === 0);
    btn.onclick = null;
    if (idx === currentStep && currentStep > 0) {
      btn.onclick = () => window.history.back();
    }
  });
}

function showPage(pageIndex, pushHistory = false) {
  // 단계별로 입력값 초기화
  if (pageIndex === 0) {
    selectedSite = '';
    selectedBusNo = '';
    enteredPlate = '';
  } else if (pageIndex === 1) {
    selectedBusNo = '';
    enteredPlate = '';
  } else if (pageIndex === 2) {
    enteredPlate = '';
  }
  pages.forEach((page, index) => {
    page.classList.toggle('active', index === pageIndex);
  });
  currentStep = pageIndex;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  updatePrevBtn();
  updateBreadcrumb();
  if (pushHistory) {
    history.pushState({ pageIndex: currentStep }, '', '');
  }
}

function nextStep() {
  if (currentStep < pages.length - 1) {
    showPage(currentStep + 1, true);
  }
}

// ======== 커스텀 모달 ========
function showModal(message, onConfirm) {
  const modal = document.getElementById('modal');
  const msg = document.getElementById('modal-message');
  const yesBtn = document.getElementById('modal-yes');
  const noBtn = document.getElementById('modal-no');
  msg.textContent = message;
  modal.style.display = 'flex';
  function cleanup() {
    modal.style.display = 'none';
    yesBtn.removeEventListener('click', yesHandler);
    noBtn.removeEventListener('click', noHandler);
  }
  function yesHandler() {
    cleanup();
    onConfirm(true);
  }
  function noHandler() {
    cleanup();
    onConfirm(false);
  }
  yesBtn.addEventListener('click', yesHandler);
  noBtn.addEventListener('click', noHandler);
}

// ======== 근무지 선택 이벤트 리스너 ========
siteButtons.nopo.addEventListener('click', () => {
  showModal('근무지 : 노포(이)가 맞으십니까?', (ok) => {
    if (!ok) return;
    selectedSite = '노포';
    selectedBusNo = '';
    enteredPlate = '';
    renderBusNoButtons('노포');
    updateBreadcrumb();
    nextStep();
  });
});

siteButtons.jeonggwan.addEventListener('click', () => {
  showModal('근무지 : 정관(이)가 맞으십니까?', (ok) => {
    if (!ok) return;
    selectedSite = '정관';
    selectedBusNo = '';
    enteredPlate = '';
    renderBusNoButtons('정관');
    updateBreadcrumb();
    nextStep();
  });
});

// ======== 버스번호 버튼 동적 생성 ========
function renderBusNoButtons(site) {
  busnoButtonsDiv.innerHTML = '';
  BUSNO_LIST[site].forEach(busNo => {
    const btn = document.createElement('button');
    btn.className = 'busno-btn';
    btn.textContent = busNo;
    btn.onclick = () => {
      showModal(`노선번호 : ${busNo}(이)가 맞으십니까?`, (ok) => {
        if (!ok) return;
        selectedBusNo = busNo;
        updateBreadcrumb();
        nextStep();
      });
    };
    busnoButtonsDiv.appendChild(btn);
  });
}

// ======== 사진 업로드 ========
inputs.photo.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const isValid = validateInput('photo', file);
  if (isValid && file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.classList.add('show');
    };
    reader.readAsDataURL(file);
  } else {
    preview.classList.remove('show');
  }
  updateButtonState('b3', isValid);
});

// ======== 제출 버튼 ========
buttons.b3.addEventListener('click', async () => {
  const file = inputs.photo.files[0];
  if (!validateInput('photo', file)) return;
  buttons.b3.disabled = true;
  buttons.b3.textContent = '제출 중...';
  try {
    await submitData();
    showPage(totalSteps); // 완료 화면 표시
  } catch (error) {
    console.error('제출 실패:', error);
    showError('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    buttons.b3.disabled = false;
    buttons.b3.textContent = '제출';
  }
});

// ======== 데이터 제출 함수 ========
async function submitData() {
  const formData = new FormData();
  formData.append('site', selectedSite);
  formData.append('busNo', selectedBusNo);
  formData.append('plate', inputs.plate.value.trim());
  const photoFile = inputs.photo.files[0];
  if (photoFile) {
    formData.append('photo', photoFile);
  }
  formData.append('timestamp', new Date().toISOString());
  // TODO: 실제 백엔드 URL로 변경 필요
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// ======== 키보드 이벤트 ========
document.addEventListener('keydown', (e) => {
  // 버스번호 선택 화면에서는 Enter로 동작하지 않음
  if (currentStep === 1) return;
  const btnMap = {2: 'b2', 3: 'b3'};
  const currentButton = buttons[btnMap[currentStep]];
  if (e.key === 'Enter' && currentButton && !currentButton.disabled) {
    currentButton.click();
  }
});

// ======== 초기화 ========
document.addEventListener('DOMContentLoaded', () => {
  history.replaceState({ pageIndex: 0 }, '', '');
  history.pushState({ pageIndex: 0 }, '', '');
  showPage(0, false);
  updateBreadcrumb();
  console.log('운행전 자가점검시스템이 로드되었습니다.');
});

window.addEventListener('popstate', (event) => {
  const pageIndex = event.state && typeof event.state.pageIndex === 'number' ? event.state.pageIndex : 0;
  showPage(pageIndex, false);
  // history가 1개뿐이면(첫 화면) 더 이상 뒤로가기를 막음
  if (pageIndex === 0 && history.length <= 2) {
    history.pushState({ pageIndex: 0 }, '', '');
  }
});

// ======== 오프라인 지원 ========
window.addEventListener('online', () => {
  console.log('네트워크 연결이 복구되었습니다.');
});
window.addEventListener('offline', () => {
  console.log('네트워크 연결이 끊어졌습니다.');
  showError('네트워크 연결을 확인해주세요.');
});
// ======== PWA 지원 ========
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(registration => {
//         console.log('SW 등록 성공:', registration);
//       })
//       .catch(registrationError => {
//         console.log('SW 등록 실패:', registrationError);
//       });
//   });
// }

const breadcrumb = document.getElementById('breadcrumb');

function updateBreadcrumb() {
  let crumbs = [];
  if (selectedSite) crumbs.push(`<span class="crumb">근무지: ${selectedSite}</span>`);
  if (selectedBusNo) crumbs.push(`<span class="crumb">노선번호: ${selectedBusNo}</span>`);
  if (enteredPlate) crumbs.push(`<span class="crumb">면허판번호: ${enteredPlate}</span>`);
  breadcrumb.innerHTML = crumbs.join('<span class="sep">&gt;</span>');
}

// 면허판번호 입력(3단계) 그리드 버튼만 (입력창 제거)
function renderPlateGrid() {
  // 3단계 카드의 .card-content를 찾음
  const cards = document.querySelectorAll('.card');
  const cardContent = cards[2]?.querySelector('.card-content');
  if (!cardContent) return;
  // 기존 plate-grid/검색창/에러메시지 있으면 제거
  let plateGridDiv = cardContent.querySelector('#plate-grid');
  if (plateGridDiv) cardContent.removeChild(plateGridDiv);
  let filterInput = cardContent.querySelector('#plate-filter');
  if (filterInput) cardContent.removeChild(filterInput);
  let errorMsg = cardContent.querySelector('#plate-filter-error');
  if (errorMsg) cardContent.removeChild(errorMsg);
  // 검색창 생성 (위치 고정)
  filterInput = document.createElement('input');
  filterInput.id = 'plate-filter';
  filterInput.type = 'text';
  filterInput.placeholder = '차량번호 검색(숫자 입력)';
  filterInput.inputMode = 'numeric';
  filterInput.autocomplete = 'off';
  filterInput.style.marginBottom = '0.5rem';
  filterInput.style.width = '100%';
  cardContent.appendChild(filterInput);
  // 에러 메시지 생성
  errorMsg = document.createElement('div');
  errorMsg.id = 'plate-filter-error';
  errorMsg.style.color = '#dc2626';
  errorMsg.style.fontSize = '0.98rem';
  errorMsg.style.height = '1.2em';
  errorMsg.style.marginBottom = '0.5rem';
  errorMsg.style.textAlign = 'left';
  errorMsg.textContent = '';
  cardContent.appendChild(errorMsg);
  // plate-grid 생성 (min-height 고정)
  plateGridDiv = document.createElement('div');
  plateGridDiv.id = 'plate-grid';
  plateGridDiv.style.display = 'grid';
  plateGridDiv.style.gridTemplateColumns = 'repeat(3, 1fr)';
  plateGridDiv.style.gap = '0.7rem';
  plateGridDiv.style.maxHeight = '320px';
  plateGridDiv.style.minHeight = '320px';
  plateGridDiv.style.overflowY = 'auto';
  plateGridDiv.style.overflowX = 'hidden';
  plateGridDiv.style.width = '100%';
  plateGridDiv.style.marginBottom = '1.2rem';
  cardContent.appendChild(plateGridDiv);
  // 렌더링 함수
  function renderGrid() {
    // 애니메이션 적용을 위해 기존 버튼에 exit 클래스 부여 후 제거
    const oldBtns = Array.from(plateGridDiv.children);
    oldBtns.forEach(btn => {
      btn.classList.add('fade-exit');
      setTimeout(() => btn.remove(), 200);
    });
    let list = [];
    if (selectedBusNo === '29') list = PLATE_LIST_29;
    const filter = filterInput.value.trim();
    // 숫자 이외 입력 체크
    if (filter && /[^0-9]/.test(filter)) {
      errorMsg.textContent = '숫자만 입력해주세요!';
      return;
    } else {
      errorMsg.textContent = '';
    }
    const filtered = filter ? list.filter(num => num.includes(filter)) : list;
    // 버튼이 줄어들수록 행이 커지도록
    const rowCount = Math.max(Math.ceil(filtered.length / 3), 1);
    plateGridDiv.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;
    filtered.forEach(num => {
      const btn = document.createElement('button');
      btn.className = 'plate-btn fade-in';
      btn.textContent = num;
      btn.setAttribute('aria-label', `차량번호 ${num}`);
      btn.tabIndex = 0;
      btn.onclick = () => {
        enteredPlate = num;
        updateBreadcrumb();
        nextStep();
      };
      btn.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') btn.click();
      };
      plateGridDiv.appendChild(btn);
      setTimeout(() => btn.classList.remove('fade-in'), 250);
    });
  }
  filterInput.addEventListener('input', renderGrid);
  renderGrid();
}

const origShowPage = window.showPage || showPage;
window.showPage = function(pageIndex, pushHistory) {
  origShowPage.apply(this, arguments);
  if (pageIndex === 2) renderPlateGrid();
}; 