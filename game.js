const logElement = document.getElementById("log");
document.addEventListener("DOMContentLoaded", function () {
  updateLocation();
  restoreDynamicButtons();
});

function logEvent(message) {
  if (!logElement) return; // Защита от ошибок
  logElement.value += message + "\n";
  logElement.scrollTop = logElement.scrollHeight; // Прокрутка вниз
}

// Тестирование
logEvent("Добро пожаловать в Эвермор!");

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

// Объект персонажа
const player = {
  health: 100,
  strength: 10,
  defense: 5,
  level: 1,
  xp: 0,
  levelUpThreshold: 20,
  gold: 0,
};

// Базовый объект врага для сброса характеристик
const baseEnemy = {
  name: "Тень_прошлого",
  health: 50,
  strength: 8,
  defense: 3,
  specialAbility: "Поглощение души",
};

// Объект врага
let enemy = { ...baseEnemy };

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
  gainXP(quest.reward.xp); // Получаем опыт
  player.gold = (player.gold || 0) + quest.reward.gold; // Получаем золото
  updateStats(); // Обновляем характеристики игрока
}

// Функция для генерации случайного события
function exploreLocation() {
  const events = currentLocation.events;
  const randomEvent = events[Math.floor(Math.random() * events.length)];
  logEvent(randomEvent);

  // Если найдено зелье здоровья
  if (randomEvent.includes("нашли зелье")) {
    addItemToInventory("Зелье здоровья");
  }

  // Дополнительная логика для других локаций
  if (randomEvent === "Вы нашли старый меч!") {
    player.strength += 5;
    logEvent("Ваша сила увеличилась на 5!");
    updateStats();
  }

  if (
    randomEvent === "Из кустов выскочил волк!" ||
    randomEvent === "На вас напал Скелет!" ||
    randomEvent === "Вас атакует тень прошлого!"
  ) {
    // Сброс и инициализация enemy в зависимости от события
    enemy = { ...baseEnemy }; // Сбрасываем к базовым значениям

    if (randomEvent.includes("волк")) {
      enemy.name = "Волк";
      enemy.health = 40;
      enemy.strength = 12;
      enemy.defense = 2;
      enemy.specialAbility = null;
    } else if (randomEvent.includes("Скелет")) {
      enemy.name = "Скелет";
      enemy.health = 30;
      enemy.strength = 8;
      enemy.defense = 1;
      enemy.specialAbility = null;
    } else {
      enemy.name = "Тень_прошлого";
      enemy.health = 50;
      enemy.strength = 8;
      enemy.defense = 3;
      enemy.specialAbility = "Поглощение души";
    }

    startBattle();
  }

  if (randomEvent === "Вы нашли сундук с золотом!") {
    logEvent("Вы получили 50 золотых монет!");
    player.gold = (player.gold || 0) + 50; // Добавляем золото игроку
  }
}

// Функция для расчета урона
function calculateDamage(attacker, defender) {
  const damage = Math.max(attacker.strength - defender.defense, 1); // Минимальный урон = 1
  return damage;
}

// Функция для выполнения удара
function performAttack(attacker, defender, isPlayerAttacking) {
  let damage = calculateDamage(attacker, defender);

  // Если атакует враг и у него есть специальная способность
  if (!isPlayerAttacking && attacker.specialAbility) {
    const chance = Math.random(); // Генерируем случайное число от 0 до 1
    if (chance < 0.3) {
      // 30% шанс активации способности
      logEvent(`${attacker.name} использует "${attacker.specialAbility}"!`);
      if (attacker.specialAbility === "Поглощение души") {
        player.strength = Math.max(player.strength - 2, 1); // Временно снижаем силу игрока
        logEvent("Ваша сила временно снижена!");
        updateStats();
      }
    }
  }

  defender.health = Math.max(defender.health - damage, 0);

  if (isPlayerAttacking) {
    logEvent(`Вы атаковали ${defender.name} и нанесли ${damage} урона.`);
    // Анимация для аватарки врага
    const enemyAvatar = document.querySelector('#enemy-avatar img[alt="Враг"]');
    if (enemyAvatar && enemyAvatar.style.display !== "none") {
      enemyAvatar.style.animation = "hit 0.5s";
      setTimeout(() => (enemyAvatar.style.animation = ""), 500);
    }
  } else {
    logEvent(`${attacker.name} атаковал вас и нанес ${damage} урона.`);
    // Анимация для аватарки игрока
    const playerAvatar = document.querySelector("#player-avatar img");
    if (playerAvatar) {
      playerAvatar.style.animation = "hit 0.5s";
      setTimeout(() => (playerAvatar.style.animation = ""), 500);
    }
  }

  updateStats(); // Обновляем характеристики игрока
}

// Функция для завершения боя
function endBattle(isPlayerVictory) {
  if (isPlayerVictory) {
    logEvent(`Вы победили ${enemy.name}!`);
    gainXP(10); // Получаем опыт за победу
  } else {
    logEvent("Вы погибли...");
  }

  // Скрываем аватарки врага
  const enemyAvatars = document.querySelectorAll("#enemy-avatar img");
  enemyAvatars.forEach((avatar) => {
    avatar.style.display = "none";
  });

  // Отключаем кнопку "Атаковать" после завершения боя
  const attackButton = document.getElementById("attack");
  if (attackButton) {
    attackButton.onclick = null;
  }
}

// Функция для начала боя
function startBattle() {
  logEvent(`Вы встретили ${enemy.name}!`);

  // Скрываем все аватарки врагов сначала
  const enemyAvatars = document.querySelectorAll("#enemy-avatar img");
  enemyAvatars.forEach((avatar) => {
    avatar.style.display = "none";
  });

  // Показываем нужную аватарку врага
  const enemyAvatar = document.querySelector(
    `#enemy-avatar img[src="images/${enemy.name.toLowerCase()}.png"]`
  );
  if (enemyAvatar) {
    enemyAvatar.style.display = "block";
  } else {
    // Если не найдена конкретная аватарка, используем первую
    const firstAvatar = document.querySelector("#enemy-avatar img");
    if (firstAvatar) {
      firstAvatar.style.display = "block";
      firstAvatar.src = `images/${enemy.name.toLowerCase()}.png`;
    }
  }

  // Привязка кнопки "Атаковать" к бою
  const attackButton = document.getElementById("attack");
  if (attackButton) {
    attackButton.onclick = () => {
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
}

// Обновленная функция добавления предмета в инвентарь
function addItemToInventory(itemName) {
  const inventoryList = document.getElementById("inventory-list");
  if (!inventoryList) return;

  const listItem = document.createElement("li");
  listItem.textContent = itemName;

  // Добавляем кнопку "Использовать" для каждого предмета
  const useButton = document.createElement("button");
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
    npc: null, // В этой локации нет NPC
  },
  dungeon: {
    name: "Подземелье",
    description: "Темные коридоры, полные ловушек и сокровищ.",
    events: [
      "Вы нашли сундук с золотом!",
      "На вас напал Скелет!",
      "Вы услышали странный шепот...",
    ],
    npc: {
      name: "Хранитель подземелий",
      dialogues: [
        {
          text: "Только достойные могут пройти дальше.",
          options: [
            {
              text: "Я готов доказать свою силу!",
              effect: () => {
                logEvent("Хранитель: 'Докажи это в бою!'");
                startBattle(); // Запускаем бой
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

// Функция для очистки динамических кнопок
function clearDynamicButtons() {
  const dynamicButtonsContainer = document.getElementById("dynamic-buttons");
  if (dynamicButtonsContainer) {
    dynamicButtonsContainer.innerHTML = ""; // Удаляем все динамические кнопки
  }
}

// Функция для восстановления стандартных кнопок
function restoreDynamicButtons() {
  clearDynamicButtons(); // Удаляем старые кнопки

  const dynamicButtonsContainer = document.getElementById("dynamic-buttons");
  if (!dynamicButtonsContainer) return;

  // Создаем кнопки только если их еще нет в контейнере
  if (dynamicButtonsContainer.children.length === 0) {
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
    dynamicButtonsContainer.appendChild(attackButton);

    // Создаем кнопку "Поговорить"
    const talkButton = document.createElement("button");
    talkButton.id = "talk";
    talkButton.textContent = "Поговорить";
    talkButton.addEventListener("click", startDialogue);
    dynamicButtonsContainer.appendChild(talkButton);
  }
}

// Текущая локация
let currentLocation = locations.city;

// Функция для начала диалога
function startDialogue() {
  if (!currentLocation.npc) {
    logEvent("Здесь никого нет, с кем можно поговорить.");
    return;
  }

  // Функция для показа аватара NPC
  function showNpcAvatar(npc) {
    const npcAvatar = document.querySelector("#npc-avatar-img");
    if (npcAvatar) {
      npcAvatar.src = `images/ava_${npc.name.toLowerCase()}.png`;
      npcAvatar.style.display = "block";
    }
  }

  // Функция для скрытия аватара NPC
  function hideNpcAvatar() {
    const npcAvatar = document.querySelector("#npc-avatar-img");
    if (npcAvatar) {
      npcAvatar.style.display = "none";
    }
  }

  // Показываем аватар NPC
  showNpcAvatar(currentLocation.npc);

  const dialogue = currentLocation.npc.dialogues[0];
  logEvent(`${currentLocation.npc.name}: "${dialogue.text}"`);

  // Очищаем динамические кнопки
  clearDynamicButtons();

  const dynamicButtonsContainer = document.getElementById("dynamic-buttons");
  if (!dynamicButtonsContainer) return;

  // Создаем кнопки для каждого варианта ответа
  dialogue.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option.text;
    button.onclick = () => {
      option.effect();
      logEvent(`Ваш выбор: ${option.text}`);
      hideNpcAvatar(); // Скрываем аватар NPC после выбора
      restoreDynamicButtons(); // Восстанавливаем стандартные кнопки
    };
    dynamicButtonsContainer.appendChild(button);
  });
}

// Функция для обновления отображения локации
function updateLocation() {
  // Очищаем секцию с локациями
  let localsSection = document.querySelector("#locals");
  if (localsSection) {
    // Проверяем, существует ли уже секция с локацией
    let locationSection = document.querySelector("#location-section");

    if (!locationSection) {
      // Создаем секцию с локацией и кнопками
      locationSection = document.createElement("section");
      locationSection.id = "location-section";
      locationSection.innerHTML = `
        <h2>Текущая локация</h2>
        <p id="current-location">${currentLocation.name}</p>
        <p id="location-description">${currentLocation.description}</p>
      `;
      localsSection.appendChild(locationSection);

      // Создаем кнопки для перехода между локациями
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
      // Обновляем текст текущей локации
      document.getElementById("current-location").textContent =
        currentLocation.name;
      document.getElementById("location-description").textContent =
        currentLocation.description;

      // Обновляем состояние кнопок
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

    // Проверка на окончание игры
    if (player.level >= 5) {
      endGame();
    }
  }
}

// Функция для сохранения игры
function saveGame() {
  try {
    const gameState = {
      player: { ...player }, // Копируем данные игрока
      currentLocation: currentLocation.name,
      activeQuests: [...activeQuests],
      quests: { ...quests }, // Сохраняем состояние квестов
    };
    localStorage.setItem("savedGame", JSON.stringify(gameState));
    logEvent("Игра сохранена.");
  } catch (error) {
    logEvent("Ошибка при сохранении игры.");
    console.error(error);
  }
}

// Функция для загрузки игры
function loadGame() {
  try {
    const savedGame = localStorage.getItem("savedGame");
    if (savedGame === null) {
      logEvent("Нет сохраненных данных.");
      return;
    }

    const gameState = JSON.parse(savedGame);

    // Восстановление данных игрока
    Object.assign(player, gameState.player);

    // Восстановление активных квестов
    activeQuests = gameState.activeQuests || [];

    // Восстановление состояния квестов
    if (gameState.quests) {
      Object.keys(gameState.quests).forEach((questId) => {
        if (quests[questId]) {
          quests[questId].completed = gameState.quests[questId].completed;
        }
      });
    }

    // Находим текущую локацию по имени
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

// Функция для сброса игры
function resetGame() {
  // Сброс характеристик игрока
  player.health = 100;
  player.strength = 10;
  player.defense = 5;
  player.level = 1;
  player.xp = 0;
  player.levelUpThreshold = 20;
  player.gold = 0;
  player.alignment = undefined;

  // Сброс состояния квестов
  Object.keys(quests).forEach((questId) => {
    quests[questId].completed = false;
  });

  // Очистка активных квестов
  activeQuests = [];

  // Возврат в начальную локацию
  currentLocation = locations.city;

  // Очистка инвентаря
  const inventoryList = document.getElementById("inventory-list");
  if (inventoryList) {
    inventoryList.innerHTML = "";
  }

  // Обновление интерфейса
  updateStats();
  updateLocation();

  // Восстановление стандартных кнопок
  restoreDynamicButtons();

  // Запись в журнал
  logEvent("Игра сброшена. Добро пожаловать в Эвермор!");
}

// Привязка кнопок сохранения, загрузки и сброса
document.getElementById("save").addEventListener("click", saveGame);
document.getElementById("load").addEventListener("click", loadGame);
document.getElementById("reset").addEventListener("click", resetGame);

// Функция для завершения игры
function endGame() {
  if (player.alignment === "hero") {
    logEvent("Вы победили тьму и вернули свет в мир. Героическая концовка!");
  } else if (player.alignment === "neutral") {
    logEvent("Вы выжили, но мир остался во тьме. Нейтральная концовка.");
  } else if (player.alignment === "villain") {
    logEvent(
      "Вы подчинили тьму себе, но стали ее рабом. Антагонистическая концовка."
    );
  } else {
    logEvent(
      "Ваше путешествие завершилось. Но какой след вы оставили в истории Эвермора?"
    );
  }

  logEvent("Спасибо за игру!");

  // Отключаем все кнопки
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    if (button.id !== "reset") {
      // Оставляем доступной только кнопку сброса
      button.disabled = true;
    }
  });
}
