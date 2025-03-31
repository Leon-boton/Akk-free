
// батон новая
function toggleSidebarAlt(btn) {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('active');
  btn.classList.toggle('active');
}

//всплывающие увед
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
//конец

document.getElementById("openStudentArchive").addEventListener("click", () => {
  window.location.href = "archive.html"; // переход на страницу архива
});

// Данные аккаунтов
// Загружаем активные аккаунты
let accounts = JSON.parse(localStorage.getItem('accounts')) || [];

// Загружаем корзину (удалённые аккаунты)
let trashAccounts = JSON.parse(localStorage.getItem('trashAccounts')) || [];

// Сохраняем в localStorage
function saveToLocal() {
  localStorage.setItem('accounts', JSON.stringify(accounts));
}

function saveTrash() {
  localStorage.setItem('trashAccounts', JSON.stringify(trashAccounts));
}

// Обновляем счётчики
function updateCounter() {
  const total = accounts.length;
  const active = accounts.filter(a => a.active).length;
  const inactive = total - active;
  document.getElementById('counter').textContent = `Всего: ${total} | Активных: ${active} | Не активных: ${inactive}`;
}

// Отрисовка карточек
function renderTable() {
  const container = document.getElementById('accountTable');
  container.innerHTML = "<p style='text-align:center;'>Загрузка аккаунтов...</p>";

  setTimeout(() => {
    container.innerHTML = ''; // очищаем после небольшой задержки

    const fragment = document.createDocumentFragment();

    accounts.filter(acc => !acc.archived).forEach((acc) => {
      const card = document.createElement('div');
      card.className = `card ${acc.active ? 'active' : 'inactive'}`;
      card.dataset.id = acc.id;

      card.innerHTML = `
        <p><b>Логин:</b> ${acc.login}</p>
        <p><b>Пароль:</b> ${acc.password}</p>
        <p><b>Статус:</b> ${acc.active ? 'Активирован' : 'Не активирован'}</p>

        <div class="fab-container">
          <div class="fab-blur"></div>
          <div class="fab-main"><span></span></div>
          <div class="fab-actions">
            <button style="--i: 0;" class="copy-btn"><i class="fas fa-copy"></i></button>
            <button style="--i: 1;" class="toggle-btn"><i class="fas fa-toggle-on"></i></button>
            <button style="--i: 2;" class="delete-btn"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      `;

      fragment.appendChild(card);
    });

    container.appendChild(fragment);
    attachFabListeners();
    updateCounter();
  }, 30); // чуть-чуть задержка для эффекта и плавности
}

// Навешиваем кнопки на карточки
function attachFabListeners() {
  document.querySelectorAll('.fab-main').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.card');
      card.classList.toggle('open');
      e.stopPropagation();
    });
  });

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = e.currentTarget.closest('.card');
      const id = parseInt(card.dataset.id);
      const acc = accounts.find(a => a.id === id);
      if (acc) {
        navigator.clipboard.writeText(`Логин: ${acc.login}\nПароль: ${acc.password}`);
        alert("Скопировано!");
      }
addToHistory(`📋 Скопирован логин и пароль: ${acc.login}`);//хуй
    });
  });

  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = e.currentTarget.closest('.card');
      const id = parseInt(card.dataset.id);
      toggleStatus(id);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = e.currentTarget.closest('.card');
      const id = parseInt(card.dataset.id);
      deleteAccount(id);
    });
  });
}

// Добавление аккаунта
function addAccount() {
  const login = document.getElementById('newLogin').value.trim();
  const password = document.getElementById('newPassword').value.trim();

  if (login && password) {
    const newAccount = {
      id: Date.now(),
      login,
      password,
      active: false,
      archived: false
    };
    accounts.push(newAccount);
    saveToLocal();
    renderTable();
addToHistory(`➕ Добавлен аккаунт: ${login}`);

    // Очистка полей
    document.getElementById('newLogin').value = '';
    document.getElementById('newPassword').value = '';
  } else {
    alert('Заполни логин и пароль');
  }
}

// Активация/Деактивация аккаунта + отправка в архив
function toggleStatus(id) {
  const acc = accounts.find(a => a.id === id);
  if (!acc) return;

  acc.active = !acc.active;

  if (acc.active) {
    acc.archived = true;
    acc.updatedAt = new Date().toLocaleString("ru-RU");
    alert(`✅ Аккаунт ${acc.login} активирован и отправлен в архив`);
addToHistory(`✅ Аккаунт ${acc.login} активирован и в архив`);
  }

  saveToLocal();
  renderTable();
  
}

// Удаление аккаунта
function deleteAccount(id) {
  const acc = accounts.find(a => a.id === id);
  if (!acc) return;
  const confirmDelete = confirm(`Удалить аккаунт: ${acc.login}?`);
  if (!confirmDelete) return;
 // Добавляем в корзину
  trashAccounts.push({ ...acc, deletedAt: new Date().toLocaleString('ru-RU') });
  saveTrash();

  // Удаляем из активных
  accounts = accounts.filter(a => a.id !== id);
  saveToLocal();
  renderTable();
addToHistory(`❌ Удалён аккаунт: ${acc.login}`);
}

// Инициализация при загрузке
if (sessionStorage.getItem('restored') === 'true') {
  sessionStorage.removeItem('restored');
  renderTable();
} else {
  renderTable();
}

// показ сколько активных || неактивных
const total = accounts.length;
const active = accounts.filter(a => a.active).length;
const inactive = total - active;

document.getElementById('counter').innerText = `Всего: ${total} | Активных: ${active} | Не активных: ${inactive}`; 

//без  интернета
 if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('SW зарегистрирован'))
    .catch(err => console.error('SW ошибка регистрации:', err));
}

 //генератор паролей
 // генерация пароля
function generatePassword(length = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

document.getElementById("generate-btn").addEventListener("click", () => {
  document.getElementById("password").value = generatePassword();
});

// копирование пароля
document.getElementById("copy-btn").addEventListener("click", () => {
  const passwordField = document.getElementById("password");
  navigator.clipboard.writeText(passwordField.value).then(() => {
    alert("Пароль скопирован!");
    document.getElementById("generatorModal").style.display = "none"; // Закрыть модалку
  });
});
// меню 
document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.getElementById("menuButton");
  const sidebar = document.getElementById("sidebar");

  menuButton.addEventListener("click", function () {
    sidebar.classList.toggle("active");
    menuButton.classList.toggle("open");
  });

  // Закрытие меню при клике вне его области
  document.addEventListener("click", function (event) {
  const isClickInsideSidebar = sidebar.contains(event.target);
  const isClickOnMenuButton = menuButton.contains(event.target);
  const isClickInsideModal = event.target.closest(".modal-content"); // модалки

  if (!isClickInsideSidebar && !isClickOnMenuButton && !isClickInsideModal) {
    sidebar.classList.remove("active");
    menuButton.classList.remove("open");
  }
});
});

//клик в меню
// Открыть/закрыть модалку
const modal = document.getElementById("modal");
const openCreateBtn = document.getElementById("openCreateModal");
const closeModalBtn = document.getElementById("closeModal");

openCreateBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

function closeModal() {
  modal.style.display = "none";
}

// Закрытие при клике вне окна
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Кнопка "Генератор кодов"
document.getElementById("openGenerator").addEventListener("click", () => {
  document.getElementById("password").scrollIntoView({ behavior: "smooth" });
});

//
// генератор модалка
const generatorModal = document.getElementById("generatorModal");
const openGeneratorBtn = document.getElementById("openGenerator");
const closeGeneratorBtn = document.getElementById("closeGeneratorModal");

openGeneratorBtn.addEventListener("click", () => {
  generatorModal.style.display = "block";
});

closeGeneratorBtn.addEventListener("click", () => {
  generatorModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === generatorModal) {
    generatorModal.style.display = "none";
  }
});

//


// закрыть при сахронений 
function closeMenu() {
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("menuButton").classList.remove("open");
}


//история
// История действий
let historyLog = JSON.parse(localStorage.getItem('history')) || [];

function addToHistory(action) {
  const time = new Date().toLocaleTimeString();
  historyLog.unshift(`[${time}] ${action}`);
  localStorage.setItem('history', JSON.stringify(historyLog));
}

function renderHistory() {
  const logContainer = document.getElementById("historyLog");
  if (logContainer) {
    logContainer.innerHTML = historyLog.map(entry => `<div class="log-entry">${entry}</div>`).join('');
  }
}

// Модалка истории
const historyModal = document.getElementById("historyModal");
const openHistoryBtn = document.getElementById("openHistory");
const closeHistoryBtn = document.getElementById("closeHistoryModal");

if (openHistoryBtn && historyModal && closeHistoryBtn) {
  openHistoryBtn.addEventListener("click", () => {
    renderHistory();
    historyModal.style.display = "block";
  });

  closeHistoryBtn.addEventListener("click", () => {
    historyModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === historyModal) {
      historyModal.style.display = "none";
    }
  });
}

//очистить историю
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    const confirmClear = confirm("Очистить всю историю?");
    if (confirmClear) {
      historyLog = [];
      localStorage.removeItem("history");
      renderHistory();
      addToHistory("🧹 История очищена пользователем");
    }
  });
}

// отправть инструкцию
const avitoModal = document.getElementById("avitoModal");
const closeAvitoModal = document.getElementById("closeAvitoModal");
const copyAndGoAvitoBtn = document.getElementById("copyAndGoAvitoBtn");

// Открытие из меню
document.getElementById("openAvito").addEventListener("click", () => {
  avitoModal.style.display = "block";
  //closeMenu();
});

// Закрытие модалки
closeAvitoModal.addEventListener("click", () => {
  avitoModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === avitoModal) {
    avitoModal.style.display = "none";
  }
});

// 🔥🔥🔥Копировать и открыть Авито
document.getElementById("copyAndGoAvitoBtn").addEventListener("click", () => {
  const message = document.getElementById("clientText")?.value.trim();
  if (!message) return alert("Введите сообщение для копирования");

  navigator.clipboard.writeText(message).then(() => {
    window.location.href = "https://www.avito.ru/";
  }).catch(() => {
    alert("Не удалось скопировать текст");
  });
});

//создать студ фэк
// ======= МОДАЛКА генерации студента =======
// ======= МОДАЛКА генерации студента =======
const fakeModal = document.getElementById("fakeModal");
const genFakeBtn = document.getElementById("genFakeBtn");
const fakeStatus = document.getElementById("fakeStatus");
const closeFakeModal = document.getElementById("closeFakeModal");

document.getElementById("generateFakeStudent").addEventListener("click", () => {
  fakeModal.style.display = "block";
  //closeMenu?.();
});
closeFakeModal.addEventListener("click", () => {
  fakeModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === fakeModal) fakeModal.style.display = "none";
});

// ======= ИСТОРИЯ студентов =======
let studentHistory = JSON.parse(localStorage.getItem("studentHistory")) || [];

function saveStudentHistory() {
  localStorage.setItem("studentHistory", JSON.stringify(studentHistory));
}

function renderStudentHistory() {
  const container = document.getElementById("studentHistoryLog");
  if (!container) return;
  container.innerHTML = studentHistory.map(s => `
    <div class="student-entry">
      <b>${s.name}</b> (${s.birthday})<br>
      Email: ${s.email || '-'}<br>
      Телефон: ${s.phone || '-'}<br>
      Адрес: ${s.address || '-'}<br>
      Девичья фамилия матери: ${s.maiden || '-'}<br>
      <i>Создано: ${s.createdAt}</i>
    </div>
  `).join('<hr>');
}

function addStudentToHistory(student) {
  const entry = {
    name: student.name,
    birthday: student.birthday,
    email: student.email,
    phone: student.phone,
    address: student.address,
    maiden: student.maiden,
    createdAt: new Date().toLocaleString("ru-RU")
  };
  studentHistory.unshift(entry);
  saveStudentHistory();
  renderStudentHistory();
}

// ======= ГЕНЕРАЦИЯ фейк-студента =======
genFakeBtn.addEventListener("click", async () => {
  fakeStatus.textContent = "Генерация...";
  genFakeBtn.disabled = true;

  try {
    const rand = Math.random();
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://www.fakenamegenerator.com/advanced.php?t=country&n[]=us&c[]=us&gen=1&age-min=18&age-max=21&rand=${rand}`
    )}`;

    const res = await fetch(proxyUrl);
    const data = await res.json();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');

    const name = doc.querySelector("h3")?.textContent.trim();
    const address = doc.querySelector(".adr")?.textContent.trim();

    const getField = (label) => {
      const dt = Array.from(doc.querySelectorAll("dl dt")).find(dt => dt.textContent.includes(label));
      return dt ? dt.nextElementSibling?.textContent.trim() : "";
    };

    const student = {
      name,
      address,
      birthday: getField("Birthday"),
      email: getField("Email Address"),
      phone: getField("Phone"),
      maiden: getField("Mother's maiden name")
    };

    addStudentToHistory(student);
    fakeStatus.textContent = "✅ Готово!";
    fakeModal.style.display = "none";
  } catch (e) {
    console.error(e);
    fakeStatus.textContent = "Ошибка генерации";
  } finally {
    genFakeBtn.disabled = false;
    setTimeout(() => (fakeStatus.textContent = ""), 3000);
  }
});

// ======= ИСТОРИЯ модалка =======
const studentHistoryModal = document.getElementById("studentHistoryModal");
const closeStudentHistoryModal = document.getElementById("closeStudentHistoryModal");

document.getElementById("openStudentHistory").addEventListener("click", () => {
  renderStudentHistory();
  studentHistoryModal.style.display = "block";
  //closeMenu?.();
});
closeStudentHistoryModal.addEventListener("click", () => {
  studentHistoryModal.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === studentHistoryModal) studentHistoryModal.style.display = "none";
});

// ======= ОЧИСТКА истории =======
document.getElementById("clearStudentHistoryBtn").addEventListener("click", () => {
  if (confirm("Удалить всю историю студентов?")) {
    studentHistory = [];
    localStorage.removeItem("studentHistory");
    renderStudentHistory();
    addToHistory?.("🧹 История студентов очищена");
  }
});


// карзина
document.getElementById("trashShortcut").addEventListener("click", () => {
  window.location.href = "deleted.html"; // или другой путь к корзине
});

// карзина действия вост
function renderTrash() {
  const container = document.getElementById('trashContainer');
  container.innerHTML = '';

  if (trashAccounts.length === 0) {
    container.innerHTML = '<p>Корзина пуста.</p>';
    return;
  }

  trashAccounts.forEach(acc => {
    container.innerHTML += `
      <div class="card deleted">
        <p><b>Логин:</b> ${acc.login}</p>
        <p><b>Пароль:</b> ${acc.password}</p>
        <p><b>Удалён:</b> ${acc.deletedAt}</p>
        <button class="btn" onclick="restoreAccount(${acc.id})">Восстановить</button>
      </div>
    `;
  });
}
function restoreAccount(id) {
  const acc = trashAccounts.find(a => a.id === id);
  if (!acc) return;

  // Добавляем обратно в активные
  const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
  accounts.push({ ...acc, archived: false, active: false });
  localStorage.setItem('accounts', JSON.stringify(accounts));

  // Удаляем из корзины
  trashAccounts = trashAccounts.filter(a => a.id !== id);
  localStorage.setItem('trashAccounts', JSON.stringify(trashAccounts));

  renderTrash();
}