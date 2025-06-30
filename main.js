// ======== 전역 변수 ========
let currentStep = 0;
const totalSteps = 4;
let selectedSite = '';
let selectedBusNo = '';
let enteredPlate = '';

// ======== DOM 요소 ========
const pages = document.querySelectorAll('.page');
const inputs = {
  plate: document.getElementById('plate'),
  photo: document.getElementById('photo')
};
const buttons = {
  b2: document.getElementById('b2'),
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

function showPage(pageIndex) {
  pages.forEach((page, index) => {
    page.classList.toggle('active', index === pageIndex);
  });
  currentStep = pageIndex;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function nextStep() {
  if (currentStep < totalSteps - 1) {
    showPage(currentStep + 1);
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

// ======== 면허판번호 입력 ========
inputs.plate.addEventListener('input', (e) => {
  const isValid = validateInput('plate', e.target.value);
  updateButtonState('b2', isValid);
  enteredPlate = e.target.value;
  updateBreadcrumb();
});

buttons.b2.addEventListener('click', () => {
  if (validateInput('plate', inputs.plate.value)) {
    enteredPlate = inputs.plate.value;
    updateBreadcrumb();
    nextStep();
  }
});

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
  showPage(0);
  updateBreadcrumb();
  console.log('운행전 자가점검시스템이 로드되었습니다.');
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