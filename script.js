let lessons = [];
let favorites = [];
const STORAGE_KEYS = {
    lessons: "customLessons",
    favorites: "favoriteLessons"
};

//DOM
const lessonForm = document.getElementById("addLessonForm");
const contactForm = document.getElementById("contactForm");

const titleInput = document.getElementById("lessonTitle");
const descInput = document.getElementById("lessonDescription");

const lessonsList = document.getElementById("lessonsList");
const favoritesList = document.getElementById("favoritesList");

const loadBtn = document.getElementById("loadLessonsBtn");
const notification = document.getElementById("notification");

document.addEventListener("DOMContentLoaded", () => {
    loadFromStorage();
    render();
    bindEvents();
});

//ивенты
function bindEvents() {
    lessonForm.addEventListener("submit", handleAddLesson);
    contactForm.addEventListener("submit", handleContactSubmit);

    loadBtn.addEventListener("click", simulateReload);

    lessonsList.addEventListener("click", handleLessonActions);
    favoritesList.addEventListener("click", handleFavoriteActions);
}

//localStorage
function loadFromStorage() {
    lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.lessons)) || [];
    favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites)) || [];
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.lessons, JSON.stringify(lessons));
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
}

function handleAddLesson(e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    if (!title || !description) {
        showNotice("Заполните все поля", "error");
        return;
    }

    lessons.push({
        id: Date.now().toString(),
        title,
        description
    });

    saveToStorage();
    render();
    lessonForm.reset();
    showNotice("Урок добавлен", "success");
}

function deleteLesson(id) {
    if (!confirm("Удалить урок?")) return;

    lessons = lessons.filter(l => l.id !== id);
    favorites = favorites.filter(f => f !== id);

    saveToStorage();
    render();
}

function addToFavorites(id) {
    if (!favorites.includes(id)) {
        favorites.push(id);
        saveToStorage();
        render();
    }
}

function removeFromFavorites(id) {
    favorites = favorites.filter(f => f !== id);
    saveToStorage();
    render();
}

function handleLessonActions(e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;

    if (btn.classList.contains("add-to-fav")) addToFavorites(id);
    if (btn.classList.contains("delete-lesson")) deleteLesson(id);
}

function handleFavoriteActions(e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    removeFromFavorites(btn.dataset.id);
}

function render() {
    renderList(
        lessons.filter(l => !favorites.includes(l.id)),
        lessonsList,
        "lessons"
    );

    renderList(
        lessons.filter(l => favorites.includes(l.id)),
        favoritesList,
        "favorites"
    );
}

function renderList(list, container, type) {
    container.innerHTML = "";

    if (!list.length) {
        container.innerHTML = `<p class="empty">Список пуст</p>`;
        return;
    }

    list.forEach(lesson => {
        container.appendChild(createCard(lesson, type));
    });
}

function createCard({ id, title, description }, type) {
    const card = document.createElement("div");
    card.className = "lesson-card";

    card.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="actions"></div>
    `;

    const actions = card.querySelector(".actions");

    if (type === "lessons") {
        actions.innerHTML = `
            <button class="add-to-fav" data-id="${id}">В избранное</button>
            <button class="delete-lesson" data-id="${id}">Удалить</button>
        `;
    } else {
        actions.innerHTML = `
            <button class="remove-from-fav" data-id="${id}">
                Убрать из избранного
            </button>
        `;
    }

    return card;
}

//async
function handleContactSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const message = document.getElementById("userMessage").value.trim();

    if (!name || !message) {
        showNotice("Заполните все поля", "error");
        return;
    }

    fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message })
    })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(() => {
            contactForm.reset();
            showNotice("Сообщение отправлено", "success");
        })
        .catch(() => {
            showNotice("Ошибка отправки", "error");
        });
}

function simulateReload() {
    loadBtn.disabled = true;
    setTimeout(() => {
        render();
        loadBtn.disabled = false;
        showNotice("Уроки обновлены", "success");
    }, 700);
}

function showNotice(text, type) {
    notification.textContent = text;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}
