const logElement = document.getElementById("log");

function logEvent(message) {
  if (!logElement) return; // Защита от ошибок
  logElement.value += message + "\n";
  logElement.scrollTop = logElement.scrollHeight; // Прокрутка вниз
}

// Тестирование
logEvent("Добро пожаловать в Эвермор!");

// Объект персонажа
const player = {
  health: 100,
  strength: 10,
  defense: 5,
  level: 1,
};

// Функция для обновления характеристик в интерфейсе
function updateStats() {
  document.getElementById("health").textContent = player.health;
  document.getElementById("strength").textContent = player.strength;
  document.getElementById("defense").textContent = player.defense;
  document.getElementById("level").textContent = player.level;
}

// Инициализация характеристик при загрузке игры
updateStats();

// Тестирование изменения характеристик
player.health -= 10; // Пример: Игрок теряет здоровье
logEvent("Вы потеряли 10 здоровья.");
updateStats();


// Функция для генерации случайного события
function exploreLocation() {
  const events = [
    "Вы нашли зелье здоровья!",
    "Вас атакует тень прошлого!",
    "Здесь пусто и темно...",
  ];

  const randomEvent = events[Math.floor(Math.random() * events.length)];
  logEvent(randomEvent);

  // Если найдено зелье здоровья, добавляем его в инвентарь
  if (randomEvent === events[0]) {
    addItemToInventory("Зелье здоровья");
  }

  // Если встречен враг, начинаем бой
  if (randomEvent === events[1]) {
    startBattle();
  }
}

// Привязка функции к кнопке "Исследовать"
document.getElementById('explore').addEventListener('click', exploreLocation);

// Временная функция для добавления предметов в инвентарь
function addItemToInventory(itemName) {
  const inventoryList = document.getElementById('inventory-list');
  const listItem = document.createElement('li');
  listItem.textContent = itemName;
  inventoryList.appendChild(listItem);
  logEvent(`Добавлено в инвентарь: ${itemName}`);
}

// Временная функция для начала боя
function startBattle() {
  logEvent("Бой начался!");
  // Здесь будет реализован пошаговый бой
}

// Объект врага
const enemy = {
  name: "Тень прошлого",
  health: 50,
  strength: 8,
  defense: 3,
};


// Функция для расчета урона
function calculateDamage(attacker, defender) {
  const damage = Math.max(attacker.strength - defender.defense, 1); // Минимальный урон = 1
  return damage;
}

// Функция для выполнения удара
function performAttack(attacker, defender, isPlayerAttacking) {
  const damage = calculateDamage(attacker, defender);
  defender.health = Math.max(defender.health - damage, 0);

  if (isPlayerAttacking) {
    logEvent(`Вы атаковали ${defender.name} и нанесли ${damage} урона.`);
    // Анимация для аватарки врага
    const enemyAvatar = document.querySelector('#enemy-avatar img');
    enemyAvatar.style.animation = 'hit 0.5s';
    setTimeout(() => enemyAvatar.style.animation = '', 500);
  } else {
    logEvent(`${attacker.name} атаковал вас и нанес ${damage} урона.`);
    // Анимация для аватарки игрока
    const playerAvatar = document.querySelector('#player-avatar img');
    playerAvatar.style.animation = 'hit 0.5s';
    setTimeout(() => playerAvatar.style.animation = '', 500);
  }

  updateStats(); // Обновляем характеристики игрока
}

// Функция для завершения боя
f// Функция для завершения боя
function endBattle(isPlayerVictory) {
  if (isPlayerVictory) {
    logEvent(`Вы победили ${enemy.name}!`);
    gainXP(10); // Получаем опыт за победу
  } else {
    logEvent("Вы погибли...");
  }

  // Скрываем аватарку врага
  const enemyAvatar = document.querySelector('#enemy-avatar img');
  enemyAvatar.style.display = 'none';

  // Отключаем кнопку "Атаковать" после завершения боя
  document.getElementById('attack').onclick = null;
}

// Функция для начала боя
// Функция для начала боя
function startBattle() {
  logEvent(`Вы встретили ${enemy.name}!`);

  // Показываем аватарку врага
  const enemyAvatar = document.querySelector('#enemy-avatar img');
  enemyAvatar.style.display = 'block';
  enemyAvatar.src = `images/${enemy.name.toLowerCase()}.png`; // Пример: "images/волк.png"

  // Привязка кнопки "Атаковать" к бою
  document.getElementById('attack').onclick = () => {
    performAttack(player, enemy, true);

    if (enemy.health <= 0) {
      endBattle(true); // Завершаем бой с победой игрока
      return;
    }

    performAttack(enemy, player, false);

    if (player.health <= 0) {
      endBattle(false); // Завершаем бой с поражением игрока
    }
  };
}


// Обновленная функция добавления предмета в инвентарь
function addItemToInventory(itemName) {
  const inventoryList = document.getElementById('inventory-list');
  const listItem = document.createElement('li');
  listItem.textContent = itemName;

  // Добавляем кнопку "Использовать" для каждого предмета
  const useButton = document.createElement('button');
  useButton.textContent = "Использовать";
  useButton.onclick = () => useItem(itemName, listItem);

  listItem.appendChild(useButton);
  inventoryList.appendChild(listItem);
  logEvent(`Добавлено в инвентарь: ${itemName}`);
}

// Функция для использования предмета
function useItem(itemName, listItem) {
  if (itemName === "Зелье здоровья") {
    player.health = Math.min(player.health + 20, 100); // Восстанавливаем здоровье (не более максимума)
    logEvent("Вы использовали зелье здоровья. Здоровье восстановлено.");
  }

  // Удаляем предмет из интерфейса и инвентаря
  listItem.remove();
  updateStats();
}




// Обновленный объект с локациями и NPC
const locations = {
  city: {
    name: "Заброшенный город",
    description: "Темные улицы, разрушенные здания, тени прошлого.",
    events: [
      "Вы нашли старый меч!",
      "Вас атакует стая крыс!",
      "Здесь пусто и холодно...",
    ],
    npc: {
      name: "Старец-маг",
      dialogues: [
        {
          text: "Ты пробудился... Тьма поглотила этот мир.",
          options: [
            {
              text: "Как мне спасти мир?",
              effect: () => {
                logEvent("Старец: 'Ищи свет...'");
                player.alignment = "hero";
              },
            },
            {
              text: "Мне всё равно.",
              effect: () => {
                logEvent("Старец: 'Жаль... Ты мог бы стать героем.'");
                player.alignment = "neutral";
              },
            },
            {
              text: "Я использую тьму для своей выгоды.",
              effect: () => {
                logEvent("Старец: *хмурится* 'Тьма поглотит и тебя...'");
                player.alignment = "villain";
              },
            },
          ],
        },
      ],
    },
  },
  forest: {
    name: "Темный лес",
    description: "Мрак и шепот деревьев. Что-то наблюдает за вами.",
    events: [
      "Вы встретили странного путника.",
      "Из кустов выскочил волк!",
      "Вы нашли древний алтарь.",
    ],
    npc: null, // В этой локации нет NPC
  },
};

// Функция для очистки динамических кнопок
function clearDynamicButtons() {
  const dynamicButtonsContainer = document.getElementById('dynamic-buttons');
  if (dynamicButtonsContainer) {
    dynamicButtonsContainer.innerHTML = ''; // Удаляем все динамические кнопки
  }
}

// Функция для восстановления стандартных кнопок
function restoreDynamicButtons() {
  clearDynamicButtons(); // Удаляем старые кнопки

  const dynamicButtonsContainer = document.getElementById("dynamic-buttons");
  if (!dynamicButtonsContainer) return;

  // Проверяем, есть ли уже кнопки
  if (
    document.getElementById("explore") ||
    document.getElementById("attack") ||
    document.getElementById("talk")
  ) {
    return; // Если кнопки уже есть, выходим
  }

  // Создаем кнопку "Исследовать"
  const exploreButton = document.createElement("button");
  exploreButton.id = "explore";
  exploreButton.textContent = "Исследовать";
  exploreButton.addEventListener("click", exploreLocation);
  dynamicButtonsContainer.appendChild(exploreButton);

  // Создаем кнопку "Атаковать"
  const attackButton = document.createElement("button");
  attackButton.id = "attack";
  attackButton.textContent = "Атаковать";
  attackButton.addEventListener("click", startBattle);
  dynamicButtonsContainer.appendChild(attackButton);

  // Создаем кнопку "Поговорить"
  const talkButton = document.createElement("button");
  talkButton.id = "talk";
  talkButton.textContent = "Поговорить";
  talkButton.addEventListener("click", startDialogue);
  dynamicButtonsContainer.appendChild(talkButton);
}


// Инициализация динамических кнопок при загрузке игры
restoreDynamicButtons();

// Функция для начала диалога
function startDialogue() {
  if (!currentLocation.npc) {
    logEvent("Здесь никого нет, с кем можно поговорить.");
    return;
  }

  const dialogue = currentLocation.npc.dialogues[0];
  logEvent(`${currentLocation.npc.name}: "${dialogue.text}"`);

  // Очищаем динамические кнопки
  clearDynamicButtons();

  const dynamicButtonsContainer = document.getElementById('dynamic-buttons');
  if (!dynamicButtonsContainer) return;

  // Создаем кнопки для каждого варианта ответа
  dialogue.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.textContent = option.text;
    button.onclick = () => {
      option.effect();
      logEvent(`Ваш выбор: ${option.text}`);
      restoreDynamicButtons(); // Восстанавливаем стандартные кнопки
    };
    dynamicButtonsContainer.appendChild(button);
  });
}

// Привязка кнопки "Поговорить"
document.getElementById('talk').addEventListener('click', startDialogue);

// Текущая локация
let currentLocation = locations.city;

// Функция для обновления отображения локации
function updateLocation() {
  const locationDisplay = document.getElementById('current-location');
  if (!locationDisplay) {
    const locationSection = document.createElement('section');
    locationSection.innerHTML = `
      <h2>Текущая локация</h2>
      <p id="current-location">${currentLocation.name}</p>
      <button id="move-to-forest">Перейти в Темный лес</button>
      <button id="move-to-city">Вернуться в Заброшенный город</button>
    `;
    document.querySelector('main').appendChild(locationSection);

    document.getElementById('move-to-forest').addEventListener('click', () => {
      currentLocation = locations.forest;
      logEvent(`Вы перешли в ${currentLocation.name}.`);
      updateLocation();
    });

    document.getElementById('move-to-city').addEventListener('click', () => {
      currentLocation = locations.city;
      logEvent(`Вы вернулись в ${currentLocation.name}.`);
      updateLocation();
    });
  } else {
    locationDisplay.textContent = currentLocation.name;
  }
}

// Инициализация локации при загрузке игры
updateLocation();

// Обновление функции исследования
function exploreLocation() {
  const randomEvent =
    currentLocation.events[Math.floor(Math.random() * currentLocation.events.length)];
  logEvent(randomEvent);

  if (randomEvent === "Вы нашли старый меч!") {
    player.strength += 5;
    logEvent("Ваша сила увеличилась на 5!");
    updateStats();
  }

  if (randomEvent === "Из кустов выскочил волк!") {
    enemy.name = "Волк";
    enemy.health = 40;
    enemy.strength = 12;
    enemy.defense = 2;
    startBattle();
  }
}


// Добавляем опыт и уровень в объект игрока
player.xp = 0;
player.levelUpThreshold = 20;

// Функция для получения опыта
function gainXP(amount) {
  player.xp += amount;
  logEvent(`Вы получили ${amount} опыта.`);

  if (player.xp >= player.levelUpThreshold) {
    player.level++;
    player.xp = 0;
    player.levelUpThreshold += 10; // Увеличиваем порог для следующего уровня
    logEvent(`Вы достигли уровня ${player.level}!`);

    // Повышаем характеристики
    player.health += 20;
    player.strength += 5;
    player.defense += 3;
    logEvent("Ваши характеристики увеличились!");

    updateStats();
  }
}

// Обновление боя: добавляем опыт за победу
function startBattle() {
  // Показываем аватарку врага
  const enemyAvatar = document.querySelector("#enemy-avatar img");
  enemyAvatar.style.display = "block";
  enemyAvatar.src = `images/${enemy.name.toLowerCase()}.png`; // Пример: "images/волк.png"

  logEvent(`Вы встретили ${enemy.name}!`);

  document.getElementById("attack").onclick = () => {
    performAttack(player, enemy, true);

    if (enemy.health <= 0) {
      logEvent(`Вы победили ${enemy.name}!`);
      gainXP(10); // Получаем опыт за победу
      document.getElementById("attack").onclick = null;
      return;
    }

    performAttack(enemy, player, false);

    if (player.health <= 0) {
      logEvent("Вы погибли...");
      document.getElementById("attack").onclick = null;
    }
  };
}

// Создаем объект для звуков
const sounds = {
  attack: new Audio('sounds/attack.mp3'),
  heal: new Audio('sounds/heal.mp3'),
  backgroundMusic: new Audio('sounds/background-music.mp3'),
};

// Функция для воспроизведения звука
function playSound(sound) {
  sound.currentTime = 0; // Начинаем с начала
  sound.play();
}

// Добавляем звуки в механики
document.getElementById('attack').addEventListener('click', () => {
  playSound(sounds.attack);
});

function useItem(itemName) {
  if (itemName === "Зелье здоровья") {
    playSound(sounds.heal);
    player.health = Math.min(player.health + 20, 100);
    logEvent("Вы использовали зелье здоровья. Здоровье восстановлено.");
  }
}

// Включаем фоновую музыку
sounds.backgroundMusic.loop = true;
sounds.backgroundMusic.volume = 0.3; // Уменьшаем громкость
sounds.backgroundMusic.play();


// Функция для сохранения игры
function saveGame() {
  try {
    const gameState = {
      player: { ...player }, // Копируем только необходимые данные
      currentLocation: currentLocation.name,
    };
    localStorage.setItem('savedGame', JSON.stringify(gameState));
    logEvent("Игра сохранена.");
  } catch (error) {
    logEvent("Ошибка при сохранении игры.");
    console.error(error);
  }
}

// Функция для загрузки игры
function loadGame() {
  try {
    const savedGame = localStorage.getItem('savedGame');
    if (!savedGame) {
      logEvent("Нет сохраненных данных.");
      return;
    }

    const gameState = JSON.parse(savedGame);
    Object.assign(player, gameState.player);

    // Находим текущую локацию по имени
    currentLocation = locations[Object.keys(locations).find(
      key => locations[key].name === gameState.currentLocation
    )];

    updateStats();
    updateLocation();
    logEvent("Игра загружена.");
  } catch (error) {
    logEvent("Ошибка при загрузке игры.");
    console.error(error);
  }
}

// Привязка кнопок сохранения и загрузки
document.getElementById('save').addEventListener('click', saveGame);
document.getElementById('load').addEventListener('click', loadGame);

// Функция для завершения игры
function endGame() {
  if (player.alignment === "hero") {
    logEvent("Вы победили тьму и вернули свет в мир. Героическая концовка!");
  } else if (player.alignment === "neutral") {
    logEvent("Вы выжили, но мир остался во тьме. Нейтральная концовка.");
  } else if (player.alignment === "villain") {
    logEvent("Вы подчинили тьму себе, но стали ее рабом. Антагонистическая концовка.");
  }

  logEvent("Спасибо за игру!");
  document.getElementById('explore').disabled = true;
  document.getElementById('attack').disabled = true;
  document.getElementById('talk').disabled = true;
}

// Добавляем триггер для финала (например, достижение определенного уровня)
if (player.level >= 5) {
  endGame();
}

