// Элементы интерфейса
const logElement = document.getElementById("log");

// После загрузки DOM
document.addEventListener("DOMContentLoaded", function () {
  updateLocation();
  restoreDynamicButtons();
  updateStats();
});

// Функция для логирования событий
function logEvent(message) {
  if (!logElement) return;
  logElement.value += message + "\n";
  logElement.scrollTop = logElement.scrollHeight;
}

logEvent("Добро пожаловать в Эвермор!");

// Квесты
const quests = {
  ancientArtifact: {
    id: "ancientArtifact",
    title: "Древний артефакт",
    description: "Найдите древний артефакт в Темном лесу.",
    goal: "findArtifact",
    reward: { xp: 20, gold: 50 },
    completed: false,
  },
};

let activeQuests = [];

// Объект игрока
const player = {
  health: 100,
  strength: 10,
  defense: 5,
  level: 1,
  xp: 0,
  levelUpThreshold: 20,
  gold: 0,
  alignment: undefined,
  originalStrength: 10, // для временного эффекта в бою
};

// Базовый объект врага
const baseEnemy = {
  name: "тень_прошлого",
  health: 50,
  strength: 8,
  defense: 3,
  specialAbility: "Поглощение души",
};

// Объект врага
let enemy = { ...baseEnemy };

// Флаг для контроля активации способности "Поглощение души" в одном бою
let enemyUsedSoulDrain = false;

// Обновление статистик в интерфейсе
function updateStats() {
  document.getElementById("health").textContent = player.health;
  document.getElementById("strength").textContent = player.strength;
  document.getElementById("defense").textContent = player.defense;
  document.getElementById("level").textContent = player.level;
  document.getElementById("xp").textContent = player.xp;
}

// Тестовое изменение характеристик
player.health -= 10;
logEvent("Вы потеряли 10 здоровья.");
updateStats();

// Функции работы с квестами
function startQuest(questId) {
  const quest = quests[questId];
  if (!quest || quest.completed) {
    logEvent("Этот квест недоступен.");
    return;
  }
  activeQuests.push(quest);
  logEvent(`Вы приняли квест: "${quest.title}".`);
  logEvent(quest.description);
}

function completeQuest(questId) {
  const quest = quests[questId];
  if (!quest || quest.completed) {
    logEvent("Этот квест уже завершён или недоступен.");
    return;
  }
  quest.completed = true;
  logEvent(`Вы выполнили квест: "${quest.title}"!`);
  gainXP(quest.reward.xp);
  player.gold += quest.reward.gold;
  updateStats();
}

// Функция исследования локации
function exploreLocation() {
  const events = currentLocation.events;
  const randomEvent = events[Math.floor(Math.random() * events.length)];
  logEvent(randomEvent);

  if (randomEvent.includes("нашли зелье")) {
    addItemToInventory("Зелье здоровья");
  }
  if (randomEvent === "Вы нашли старый меч!") {
    player.strength += 5;
    logEvent("Ваша сила увеличилась на 5!");
    updateStats();
  }
  if (
    randomEvent === "Из кустов выскочил волк!" ||
    randomEvent === "На вас напал скелет!" ||
    randomEvent === "Вас атакует тень прошлого!"
  ) {
    // Инициализация врага по событию
    enemyUsedSoulDrain = false; // сбрасываем флаг
    enemy = { ...baseEnemy };

    if (randomEvent.includes("волк")) {
      enemy.name = "волк";
      enemy.health = 40;
      enemy.strength = 12;
      enemy.defense = 2;
      enemy.specialAbility = null;
    } else if (randomEvent.includes("скелет")) {
      enemy.name = "скелет";
      enemy.health = 30;
      enemy.strength = 8;
      enemy.defense = 1;
      enemy.specialAbility = null;
    } else {
      enemy.name = "тень_прошлого";
      enemy.health = 50;
      enemy.strength = 8;
      enemy.defense = 3;
      enemy.specialAbility = "Поглощение души";
    }
    startBattle();
  }
  if (randomEvent === "Вы нашли сундук с золотом!") {
    logEvent("Вы получили 50 золотых монет!");
    player.gold += 50;
  }
}

// Расчёт урона
function calculateDamage(attacker, defender) {
  return Math.max(attacker.strength - defender.defense, 1);
}

// Функция атаки
function performAttack(attacker, defender, isPlayerAttacking) {
  let damage = calculateDamage(attacker, defender);

  if (!isPlayerAttacking && attacker.specialAbility) {
    const chance = Math.random();
    if (!enemyUsedSoulDrain && chance < 0.3) {
      logEvent(`${attacker.name} использует "${attacker.specialAbility}"!`);
      player.strength = Math.max(player.strength - 2, 1);
      enemyUsedSoulDrain = true;
      logEvent("Ваша сила временно снижена!");
      updateStats();
    }
  }

  defender.health = Math.max(defender.health - damage, 0);

  if (isPlayerAttacking) {
    logEvent(`Вы атаковали ${defender.name} и нанесли ${damage} урона.`);
    const enemyAvatar = document.querySelector(
      `#enemy-avatar img[src="images/${enemy.name}.png"]`
    );
    if (enemyAvatar && enemyAvatar.style.display !== "none") {
      enemyAvatar.classList.add("hit-animation");
      setTimeout(() => enemyAvatar.classList.remove("hit-animation"), 500);
    }
  } else {
    logEvent(`${attacker.name} атаковал вас и нанес ${damage} урона.`);
    const playerAvatar = document.querySelector("#player-avatar img");
    if (playerAvatar) {
      playerAvatar.classList.add("hit-animation");
      setTimeout(() => playerAvatar.classList.remove("hit-animation"), 500);
    }
  }
  updateStats();
}

// Завершение боя
function endBattle(isPlayerVictory) {
  // Восстанавливаем силу игрока
  player.strength = player.originalStrength;
  updateStats();

  if (isPlayerVictory) {
    logEvent(`Вы победили ${enemy.name}!`);
    gainXP(10);
  } else {
    logEvent("Вы погибли...");
  }

  // Скрываем аватарки врагов
  document.querySelectorAll("#enemy-avatar img").forEach((avatar) => {
    avatar.style.display = "none";
  });

  enemy = { ...baseEnemy }; // сброс врага
}

// Функция, вызываемая при нажатии кнопки «Атаковать»
// Если бой активен (враг существует и имеет здоровье > 0), происходит обмен ударами
// Иначе выводится сообщение о том, что враг не найден.
function attackHandler() {
  if (enemy && enemy.health > 0) {
    performAttack(player, enemy, true);
    if (enemy.health <= 0) {
      endBattle(true);
      return;
    }
    performAttack(enemy, player, false);
    if (player.health <= 0) {
      endBattle(false);
    }
  } else {
    logEvent("Сейчас нет врага для атаки.");
  }
}

// Начало боя
function startBattle() {
  logEvent(`Вы встретили ${enemy.name}!`);
  document.querySelectorAll("#enemy-avatar img").forEach((avatar) => {
    avatar.style.display = "none";
  });

  const enemyAvatar = document.querySelector(
    `#enemy-avatar img[src="images/${enemy.name}.png"]`
  );
  if (enemyAvatar) {
    enemyAvatar.style.display = "block";
  } else {
    const firstAvatar = document.querySelector("#enemy-avatar img");
    if (firstAvatar) {
      firstAvatar.src = `images/${enemy.name}.png`;
      firstAvatar.style.display = "block";
    }
  }

  player.originalStrength = player.strength;
}

// Добавление предмета в инвентарь
function addItemToInventory(itemName) {
  const inventoryList = document.getElementById("inventory-list");
  if (!inventoryList) return;

  const listItem = document.createElement("li");
  listItem.textContent = itemName;

  const useButton = document.createElement("button");
  useButton.textContent = "Использовать";
  useButton.onclick = () => useItem(itemName, listItem);

  listItem.appendChild(useButton);
  inventoryList.appendChild(listItem);
  logEvent(`Добавлено в инвентарь: ${itemName}`);
}

// Использование предмета
function useItem(itemName, listItem) {
  if (itemName === "Зелье здоровья") {
    player.health = Math.min(player.health + 20, 100);
    logEvent("Вы использовали зелье здоровья. Здоровье восстановлено.");
  }
  listItem.remove();
  updateStats();
}

// Локации и NPC
const locations = {
  city: {
    name: "Заброшенный город",
    description: "Темные улицы, разрушенные здания, тени прошлого.",
    events: [
      "Вы нашли старый меч!",
      "Вас атакует тень прошлого!",
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
                startQuest("ancientArtifact");
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
    npc: null,
  },
  dungeon: {
    name: "Подземелье",
    description: "Темные коридоры, полные ловушек и сокровищ.",
    events: [
      "Вы нашли сундук с золотом!",
      "На вас напал скелет!",
      "Вы услышали странный шепот...",
    ],
    npc: {
      name: "Хранитель-подземелий",
      dialogues: [
        {
          text: "Только достойные могут пройти дальше.",
          options: [
            {
              text: "Я готов доказать свою силу!",
              effect: () => {
                logEvent("Хранитель: 'Докажи это в бою!'");
                startBattle();
              },
            },
            {
              text: "Я не готов...",
              effect: () => {
                logEvent("Хранитель: 'Возвращайся, когда будешь готов.'");
              },
            },
          ],
        },
      ],
    },
  },
};

// Функция очистки динамических кнопок
function clearDynamicButtons() {
  const dynamicButtonsContainer = document.getElementById("dynamic-buttons");
  if (dynamicButtonsContainer) {
    dynamicButtonsContainer.innerHTML = "";
  }
}

// Восстановление стандартных кнопок (включая постоянную кнопку "Атаковать")
function restoreDynamicButtons() {
  clearDynamicButtons();
  const dynamicButtonsContainer = document.getElementById("dynamic-buttons");
  if (!dynamicButtonsContainer) return;

  // Постоянная кнопка "Атаковать"
  const attackButton = document.createElement("button");
  attackButton.id = "attack";
  attackButton.textContent = "Атаковать";
  attackButton.addEventListener("click", attackHandler);
  dynamicButtonsContainer.appendChild(attackButton);

  // Кнопка "Исследовать"
  const exploreButton = document.createElement("button");
  exploreButton.id = "explore";
  exploreButton.textContent = "Исследовать";
  exploreButton.addEventListener("click", exploreLocation);
  dynamicButtonsContainer.appendChild(exploreButton);

  // Кнопка "Поговорить"
  const talkButton = document.createElement("button");
  talkButton.id = "talk";
  talkButton.textContent = "Поговорить";
  talkButton.addEventListener("click", startDialogue);
  dynamicButtonsContainer.appendChild(talkButton);
}

// Текущая локация
let currentLocation = locations.city;

// Начало диалога с NPC
function startDialogue() {
  if (!currentLocation.npc) {
    logEvent("Здесь никого нет, с кем можно поговорить.");
    return;
  }

  function showNpcAvatar(npc) {
    const npcAvatar = document.querySelector("#npc-avatar-img");
    if (npcAvatar) {
      npcAvatar.src = `images/ava_${npc.name.toLowerCase()}.png`;
      npcAvatar.style.display = "block";
    }
  }

  function hideNpcAvatar() {
    const npcAvatar = document.querySelector("#npc-avatar-img");
    if (npcAvatar) {
      npcAvatar.style.display = "none";
    }
  }

  showNpcAvatar(currentLocation.npc);
  const dialogue = currentLocation.npc.dialogues[0];
  logEvent(`${currentLocation.npc.name}: "${dialogue.text}"`);

  clearDynamicButtons();
  const dynamicButtonsContainer = document.getElementById("dynamic-buttons");
  if (!dynamicButtonsContainer) return;

  dialogue.options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option.text;
    button.onclick = () => {
      option.effect();
      logEvent(`Ваш выбор: ${option.text}`);
      hideNpcAvatar();
      restoreDynamicButtons();
    };
    dynamicButtonsContainer.appendChild(button);
  });
}

// Обновление отображения локации
function updateLocation() {
  let localsSection = document.querySelector("#locals");
  if (localsSection) {
    let locationSection = document.querySelector("#location-section");
    if (!locationSection) {
      locationSection = document.createElement("section");
      locationSection.id = "location-section";
      locationSection.innerHTML = `
        <h2>Текущая локация</h2>
        <p id="current-location">${currentLocation.name}</p>
        <p id="location-description">${currentLocation.description}</p>
      `;
      localsSection.appendChild(locationSection);

      Object.keys(locations).forEach((key) => {
        const location = locations[key];
        const button = document.createElement("button");
        button.id = `move-to-${key}`;
        button.textContent =
          location === currentLocation
            ? `Вы находитесь в ${location.name}`
            : `Перейти в ${location.name}`;
        button.disabled = location === currentLocation;
        button.addEventListener("click", () => {
          currentLocation = location;
          logEvent(`Вы перешли в ${currentLocation.name}.`);
          logEvent(currentLocation.description);
          updateLocation();
        });
        locationSection.appendChild(button);
      });
    } else {
      document.getElementById("current-location").textContent =
        currentLocation.name;
      document.getElementById("location-description").textContent =
        currentLocation.description;
      Object.keys(locations).forEach((key) => {
        const location = locations[key];
        const button = document.getElementById(`move-to-${key}`);
        if (button) {
          button.textContent =
            location === currentLocation
              ? `Вы находитесь в ${location.name}`
              : `Перейти в ${location.name}`;
          button.disabled = location === currentLocation;
        }
      });
    }
  }
}

// Получение опыта и повышение уровня
function gainXP(amount) {
  player.xp += amount;
  logEvent(`Вы получили ${amount} опыта.`);
  if (player.xp >= player.levelUpThreshold) {
    player.level++;
    player.xp = 0;
    player.levelUpThreshold += 10;
    logEvent(`Вы достигли уровня ${player.level}!`);
    player.health += 20;
    player.strength += 5;
    player.defense += 3;
    logEvent("Ваши характеристики увеличились!");
    updateStats();
    if (player.level >= 5) {
      endGame();
    }
  }
}

// Сохранение игры
function saveGame() {
  try {
    const gameState = {
      player: { ...player },
      currentLocation: currentLocation.name,
      activeQuests: [...activeQuests],
      quests: { ...quests },
    };
    localStorage.setItem("savedGame", JSON.stringify(gameState));
    logEvent("Игра сохранена.");
  } catch (error) {
    logEvent("Ошибка при сохранении игры.");
    console.error(error);
  }
}

// Загрузка игры
function loadGame() {
  try {
    const savedGame = localStorage.getItem("savedGame");
    if (savedGame === null) {
      logEvent("Нет сохраненных данных.");
      return;
    }
    const gameState = JSON.parse(savedGame);
    Object.assign(player, gameState.player);
    activeQuests = gameState.activeQuests || [];
    if (gameState.quests) {
      Object.keys(gameState.quests).forEach((questId) => {
        if (quests[questId]) {
          quests[questId].completed = gameState.quests[questId].completed;
        }
      });
    }
    for (const key in locations) {
      if (locations[key].name === gameState.currentLocation) {
        currentLocation = locations[key];
        break;
      }
    }
    updateStats();
    updateLocation();
    logEvent("Игра загружена.");
  } catch (error) {
    logEvent("Ошибка при загрузке игры.");
    console.error(error);
  }
}

// Сброс игры
function resetGame() {
  player.health = 100;
  player.strength = 10;
  player.defense = 5;
  player.level = 1;
  player.xp = 0;
  player.levelUpThreshold = 20;
  player.gold = 0;
  player.alignment = undefined;
  Object.keys(quests).forEach((questId) => {
    quests[questId].completed = false;
  });
  activeQuests = [];
  currentLocation = locations.city;
  const inventoryList = document.getElementById("inventory-list");
  if (inventoryList) {
    inventoryList.innerHTML = "";
  }
  updateStats();
  updateLocation();
  restoreDynamicButtons();
  logEvent("Игра сброшена. Добро пожаловать в Эвермор!");
}

// Завершение игры
function endGame() {
  if (player.alignment === "hero") {
    logEvent("Вы победили тьму и вернули свет в мир. Героическая концовка!");
  } else if (player.alignment === "neutral") {
    logEvent("Вы выжили, но мир остался во тьме. Нейтральная концовка.");
  } else if (player.alignment === "villain") {
    logEvent(
      "Вы подчинили тьму себе, но стали её рабом. Антагонистическая концовка."
    );
  } else {
    logEvent(
      "Ваше путешествие завершилось. Но какой след вы оставили в истории Эвермора?"
    );
  }
  logEvent("Спасибо за игру!");
  document.querySelectorAll("button").forEach((button) => {
    if (button.id !== "reset") {
      button.disabled = true;
    }
  });
}

// Привязка событий для сохранения, загрузки и сброса игры
document.getElementById("save").addEventListener("click", saveGame);
document.getElementById("load").addEventListener("click", loadGame);
document.getElementById("reset").addEventListener("click", resetGame);

// Изначально восстанавливаем стандартные кнопки
restoreDynamicButtons();
