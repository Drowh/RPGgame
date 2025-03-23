// Глобальные данные

// Начальное состояние игрока
const initialPlayerState = {
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    str: 10,
    def: 5,
    agi: 8,
    level: 1,
    xp: 0,
    isDefending: false,
};

// Начальное состояние инвентаря
const initialInventoryState = {
    health: 1,
    strength: 1,
    defense: 1,
    agility: 1,
    mana: 1
};

let player = { ...initialPlayerState };
let inventory = { ...initialInventoryState };

// Данные врагов и NPC
const characters = {
  enemies: {
    forest: {
      name: "Гоблин",
      hp: 50,
      maxHp: 50,
      str: 8,
      def: 3,
      agi: 6,
      avatar: "image/goblin.png",
      xpReward: 20, // Награда за победу
    },
    ruins: {
      name: "Скелет",
      hp: 70,
      maxHp: 70,
      str: 12,
      def: 5,
      agi: 4,
      avatar: "image/skeleton.png",
      xpReward: 30,
    },
  },
  npcs: {
    village: {
      name: "Элара",
      avatar: "image/elara.png",
    },
    villageBlacksmith: {
      name: "Грок",
      avatar: "grok.png",
    },
  },
};

// Данные локаций и их фоны
const locations = {
  village: { bgClass: "village-bg" },
  forest: { bgClass: "forest-bg" },
  ruins: { bgClass: "ruins-bg" },
};


// Эффекты зелий
let potionEffects = {
  strength: { turns: 0, value: 0 },
  defense: { turns: 0, value: 0 },
  agility: { turns: 0, value: 0 },
};

// Требуемый опыт для каждого уровня
const xpPerLevel = [100, 150, 200, 250, 300]; // Увеличивается с каждым уровнем

let currentEnemy = null;
let currentNPC = null;
let currentLocation = "village";
let isPlayerTurn = true; // Флаг хода игрока



// Функции для сохранения и загрузки прогресса
const saveProgress = () => {
  const progress = {
    player: {
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp,
      maxMp: player.maxMp,
      str: player.str,
      def: player.def,
      agi: player.agi,
      level: player.level,
      xp: player.xp,
    },
    inventory: inventory,
  };
  localStorage.setItem("gameProgress", JSON.stringify(progress));
};

const loadProgress = () => {
  const savedProgress = localStorage.getItem("gameProgress");
  if (savedProgress) {
    const progress = JSON.parse(savedProgress);
    player.hp = progress.player.hp;
    player.maxHp = progress.player.maxHp;
    player.mp = progress.player.mp;
    player.maxMp = progress.player.maxMp;
    player.str = progress.player.str;
    player.def = progress.player.def;
    player.agi = progress.player.agi;
    player.level = progress.player.level;
    player.xp = progress.player.xp;
    inventory.health = progress.inventory.health;
    inventory.strength = progress.inventory.strength;
    inventory.defense = progress.inventory.defense;
    inventory.agility = progress.inventory.agility;
    inventory.mana = progress.inventory.mana;
  }
};

// Инициализация игры
document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  console.log("Инициализация началась, прогресс загружен:", player, inventory);
  const desc = document.getElementById("desc");
  const actions = document.getElementById("actions");
  const enemyAvatar = document.getElementById("enemy-avatar");
  const enemyImg = enemyAvatar.querySelector("img");
  const enemyHpBar = document.getElementById("enemy-hp-bar");
  const enemyHpText = document.getElementById("enemy-hp");
  const enemyMaxHpText = document.getElementById("enemy-max-hp");
  const playerHpBar = document.getElementById("player-hp-bar");
  const playerHpText = document.getElementById("hp");
  const playerMaxHpText = document.getElementById("max-hp");
  const xpBar = document.getElementById("xp-bar");
  const xpText = document.getElementById("xp");
  const levelText = document.getElementById("level");

  // Функция для смены аватарки с плавным переходом
  const changeAvatar = (newSrc, newAlt) => {
    enemyImg.classList.add("hidden");
    setTimeout(() => {
      enemyImg.src = newSrc;
      enemyImg.alt = newAlt;
      enemyImg.classList.remove("hidden");
    }, 300);
  };

  // Функция для смены фона
  const changeBackground = (location) => {
    document.body.className = locations[location].bgClass;
  };

  // Функция для расчета урона
  const calculateDamage = (attacker, defender) => {
    let damage = Math.max(
      0,
      attacker.str -
        (defender.isDefending ? Math.floor(defender.def * 1.5) : defender.def)
    );
    const dodgeChance = (defender.agi - attacker.agi) * 2;
    if (Math.random() * 100 < dodgeChance) {
      damage = 0;
      addLog(
        `${defender === player ? "Вы" : defender.name} уклонился от атаки!`
      );
    } else if (damage > 0) {
      addLog(
        `${attacker === player ? "Вы" : attacker.name} нанес ${damage} урона ${
          defender === player ? "вам" : defender.name
        }.`
      );
    }
    if (damage > 0) {
      if (attacker === player) {
        const enemyImg = document.querySelector("#enemy-avatar img");
        enemyImg.classList.remove("shake");
        void enemyImg.offsetWidth;
        enemyImg.classList.add("shake");
      } else {
        const playerImg = document.querySelector("#player-avatar img");
        playerImg.classList.remove("shake");
        void playerImg.offsetWidth;
        playerImg.classList.add("shake");
      }
    }
    return damage;
  };

  // Функция для обновления интерфейса
  const updateUI = () => {
    // Проверка на наличие элементов
    if (!playerHpText || !playerHpBar || !xpText || !xpBar || !levelText) {
      console.error("Ошибка: Не все элементы интерфейса найдены для updateUI");
      return;
    }

    // Обновление полоски здоровья игрока (вверху интерфейса)
    playerHpText.textContent = Math.floor(player.hp);
    playerMaxHpText.textContent = player.maxHp;
    playerHpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;

    // Обновление характеристик в stats (в <div id="stats">)
    document.querySelector("#stats #hp").textContent = Math.floor(player.hp);
    document.querySelector("#stats #max-hp").textContent = player.maxHp;
    document.querySelector("#stats #mp").textContent = Math.floor(player.mp);
    document.querySelector("#stats #max-mp").textContent = player.maxMp;
    document.querySelector("#stats #str").textContent = player.str;
    document.querySelector("#stats #def").textContent = player.def;
    document.querySelector("#stats #agi").textContent = player.agi;

    // Обновление здоровья врага
    if (currentEnemy) {
      enemyHpText.textContent = Math.floor(currentEnemy.hp);
      enemyMaxHpText.textContent = currentEnemy.maxHp;
      enemyHpBar.style.width = `${
        (currentEnemy.hp / currentEnemy.maxHp) * 100
      }%`;
    }

    // Обновление полосы опыта
    const requiredXp = xpPerLevel[player.level - 1] || 300;
    xpText.textContent = player.xp;
    document.getElementById("required-xp").textContent = requiredXp;
    xpBar.style.width = `${(player.xp / requiredXp) * 100}%`;
    levelText.textContent = player.level;
  };

  // Функция для проверки конца боя
  const checkBattleEnd = () => {
    if (player.hp <= 0) {
      addLog("Вы проиграли! Игра окончена.");
      actions.style.display = "none";
      desc.textContent =
        'Игра окончена. Нажмите "Рестарт", чтобы начать заново.';
      document.getElementById("move-forest").disabled = true;
      document.getElementById("move-village").disabled = true;
      document.getElementById("move-ruins").disabled = true;
      return true;
    }
    if (currentEnemy && currentEnemy.hp <= 0) {
      addLog(
        `Вы победили ${currentEnemy.name}! Получено ${currentEnemy.xpReward} опыта.`
      );
      player.xp += currentEnemy.xpReward;
      const requiredXp = xpPerLevel[player.level - 1] || 300; // Если уровень выше 5, требуется 300 XP
      if (player.xp >= requiredXp) {
        player.level++;
        player.xp -= requiredXp;
        player.maxHp += 20;
        player.hp = player.maxHp;
        player.maxMp += 10;
        player.mp = player.maxMp;
        player.str += 5;
        player.def += 3;
        player.agi += 3;
        addLog(
          `Вы достигли уровня ${player.level}! Характеристики улучшены: HP +20, MP +10, STR +5, DEF +3, AGI +3.`
        );
      }
      const potions = ["health", "strength", "defense", "agility", "mana"];
      const randomPotion = potions[Math.floor(Math.random() * potions.length)];
      inventory[randomPotion]++;
      addLog(
        `Вы нашли ${
          randomPotion === "health"
            ? "Зелье здоровья"
            : randomPotion === "strength"
            ? "Зелье силы"
            : randomPotion === "defense"
            ? "Зелье защиты"
            : randomPotion === "agility"
            ? "Зелье ловкости"
            : "Зелье маны"
        }!`
      );
      updateInventory();
      currentEnemy = null;
      enemyAvatar.style.display = "none";
      actions.style.display = "none";
      updateUI();
      saveProgress();
      return true;
    }
    return false;
  };

  // Ход врага
  const enemyTurn = () => {
    if (!currentEnemy) return;
    setTimeout(() => {
      if (currentEnemy.hp > 0) {
        const damage = calculateDamage(currentEnemy, player);
        player.hp = Math.max(0, player.hp - damage);
        updateUI();
        if (!checkBattleEnd()) {
          addLog("Ваш ход!");
          isPlayerTurn = true;
        }
      }
    }, 500);
  };

  // Начальная настройка: показываем NPC в деревне
  enemyAvatar.style.display = "none";
  actions.style.display = "none";
  currentNPC = characters.npcs.village;
  changeAvatar(currentNPC.avatar, currentNPC.name);
  enemyAvatar.style.display = "block";
  enemyHpBar.style.display = "none";
  document.querySelector("#enemy-avatar .health-text").style.display = "none";
  changeBackground(currentLocation);

  // Начальное сообщение
  addLog(
    `Вы прибыли в Деревню, безопасную зону Эридана. Вас встречает ${currentNPC.name}.`
  );

  // Функция для обновления инвентаря
  const updateInventory = () => {
    document.getElementById("health-potion").textContent = inventory.health;
    document.getElementById("strength-potion").textContent = inventory.strength;
    document.getElementById("defense-potion").textContent = inventory.defense;
    document.getElementById("agility-potion").textContent = inventory.agility;
    document.getElementById("mana-potion").textContent = inventory.mana;
  };

  // Функция для управления эффектами зелий
  const updatePotionEffects = () => {
    if (potionEffects.strength.turns > 0) {
      potionEffects.strength.turns--;
      if (potionEffects.strength.turns === 0) {
        player.str -= potionEffects.strength.value;
        potionEffects.strength.value = 0;
        addLog("Эффект Зелья силы закончился.");
      }
    }
    if (potionEffects.defense.turns > 0) {
      potionEffects.defense.turns--;
      if (potionEffects.defense.turns === 0) {
        player.def -= potionEffects.defense.value;
        potionEffects.defense.value = 0;
        addLog("Эффект Зелья защиты закончился.");
      }
    }
    if (potionEffects.agility.turns > 0) {
      potionEffects.agility.turns--;
      if (potionEffects.agility.turns === 0) {
        player.agi -= potionEffects.agility.value;
        potionEffects.agility.value = 0;
        addLog("Эффект Зелья ловкости закончился.");
      }
    }
  };

  // Функция для применения зелья
  const usePotion = (type) => {
    if (inventory[type] <= 0) {
      addLog(
        `У вас нет ${
          type === "health"
            ? "Зелья здоровья"
            : type === "strength"
            ? "Зелья силы"
            : type === "defense"
            ? "Зелья защиты"
            : type === "agility"
            ? "Зелья ловкости"
            : "Зелья маны"
        }!`
      );
      return false;
    }
    inventory[type]--;
    if (type === "health") {
      player.hp = Math.min(player.maxHp, player.hp + 50);
      addLog("Вы использовали Зелье здоровья и восстановили 50 HP.");
    } else if (type === "strength") {
      player.str += 20;
      potionEffects.strength = { turns: 2, value: 20 };
      addLog("Вы использовали Зелье силы! Сила +20 на 2 хода.");
    } else if (type === "defense") {
      player.def += 20;
      potionEffects.defense = { turns: 2, value: 20 };
      addLog("Вы использовали Зелье защиты! Защита +20 на 2 хода.");
    } else if (type === "agility") {
      player.agi += 20;
      potionEffects.agility = { turns: 2, value: 20 };
      addLog("Вы использовали Зелье ловкости! Ловкость +20 на 2 хода.");
    } else if (type === "mana") {
      player.mp = Math.min(player.maxMp, player.mp + 35);
      addLog("Вы использовали Зелье маны и восстановили 35 MP.");
    }
    console.log("Обновление UI перед начальным запуском");
    updateInventory();
    updateUI();
    return true;
  };

  // Обработчики переходов
  document.getElementById("move-forest").addEventListener("click", () => {
    currentLocation = "forest";
    desc.textContent = "Вы в Мрачном Лесу.";
    addLog("Вы покинули Деревню и вошли в Мрачный Лес.");
    document.getElementById("move-forest").disabled = true;
    document.getElementById("move-village").disabled = false;
    document.getElementById("move-ruins").disabled = true;

    // Показываем врага
    currentEnemy = JSON.parse(JSON.stringify(characters.enemies.forest)); // Создаем копию врага с полным здоровьем
    currentNPC = null;
    changeAvatar(currentEnemy.avatar, currentEnemy.name);
    enemyAvatar.style.display = "block";
    enemyHpBar.style.display = "block";
    document.querySelector("#enemy-avatar .health-text").style.display =
      "block";
    enemyHpBar.style.width = "100%";
    enemyHpText.textContent = currentEnemy.hp;
    enemyMaxHpText.textContent = currentEnemy.maxHp;
    actions.style.display = "flex";
    changeBackground(currentLocation);
    isPlayerTurn = true;
    addLog("Ваш ход!");
    saveProgress();
    updateUI();
  });

  document.getElementById("move-village").addEventListener("click", () => {
    currentLocation = "village";
    desc.textContent = "Вы в Деревне, безопасной зоне.";
    addLog("Вы вернулись в Деревню.");
    document.getElementById("move-forest").disabled = false;
    document.getElementById("move-village").disabled = true;
    document.getElementById("move-ruins").disabled = false;

    // Восстановление здоровья и маны
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    addLog("Ваши здоровье и мана полностью восстановлены!");
    updateUI();

    // Показываем NPC
    currentEnemy = null;
    currentNPC = characters.npcs.village;
    changeAvatar(currentNPC.avatar, currentNPC.name);
    enemyAvatar.style.display = "block";
    enemyHpBar.style.display = "none";
    document.querySelector("#enemy-avatar .health-text").style.display = "none";
    actions.style.display = "none";
    changeBackground(currentLocation);
    saveProgress();
  });

  document.getElementById("move-ruins").addEventListener("click", () => {
    currentLocation = "ruins";
    desc.textContent = "Вы в Древних Руинах.";
    addLog("Вы покинули Деревню и вошли в Древние Руины.");
    document.getElementById("move-forest").disabled = true;
    document.getElementById("move-village").disabled = false;
    document.getElementById("move-ruins").disabled = true;

    // Показываем врага (Скелет)
    currentEnemy = JSON.parse(JSON.stringify(characters.enemies.ruins)); // Создаем копию врага с полным здоровьем
    currentNPC = null;
    changeAvatar(currentEnemy.avatar, currentEnemy.name);
    enemyAvatar.style.display = "block";
    enemyHpBar.style.display = "block";
    document.querySelector("#enemy-avatar .health-text").style.display =
      "block";
    enemyHpBar.style.width = "100%";
    enemyHpText.textContent = currentEnemy.hp;
    enemyMaxHpText.textContent = currentEnemy.maxHp;
    actions.style.display = "flex";
    changeBackground(currentLocation);
    isPlayerTurn = true;
    addLog("Ваш ход!");
    saveProgress();
    updateUI();
  });

  // Обработчики боевых действий
  document.getElementById("attack").addEventListener("click", () => {
    if (!isPlayerTurn || !currentEnemy) return;
    isPlayerTurn = false;
    player.isDefending = false;
    const damage = calculateDamage(player, currentEnemy);
    currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
    updateUI();
    if (!checkBattleEnd()) {
      updatePotionEffects();
      enemyTurn();
    }
  });

  document.getElementById("defend").addEventListener("click", () => {
    if (!isPlayerTurn || !currentEnemy) return;
    isPlayerTurn = false;
    player.isDefending = true;
    addLog("Защита увеличена на 50% на 1 ход.");
    updatePotionEffects();
    enemyTurn();
  });

  document.getElementById("useItem").addEventListener("click", () => {
    if (!isPlayerTurn || !currentEnemy) return;
    const items = document.querySelectorAll("#items .item");
    items.forEach((item) => {
      item.classList.toggle("highlighted");
      item.onclick = () => {
        if (!isPlayerTurn || !currentEnemy) return;
        const type = item.dataset.type;
        if (usePotion(type)) {
          isPlayerTurn = false;
          items.forEach((i) => {
            i.classList.remove("highlighted");
            i.onclick = null;
          });
          updatePotionEffects();
          enemyTurn();
        }
      };
    });
  });

  // Функция сброса игры
  const resetGame = () => {
    // Сбрасываем игрока и инвентарь
    player = { ...initialPlayerState };
    inventory = { ...initialInventoryState };
    currentEnemy = null;
    currentNPC = characters.npcs.village;
    currentLocation = "village";
    isPlayerTurn = true;

    // Очищаем localStorage
    localStorage.removeItem("gameProgress");

    // Сбрасываем интерфейс
    desc.textContent = "Вы в Деревне, безопасной зоне.";
    enemyAvatar.style.display = "none";
    actions.style.display = "none";
    changeAvatar(currentNPC.avatar, currentNPC.name);
    enemyAvatar.style.display = "block";
    enemyHpBar.style.display = "none";
    document.querySelector("#enemy-avatar .health-text").style.display = "none";
    changeBackground(currentLocation);
    document.getElementById("move-forest").disabled = false;
    document.getElementById("move-village").disabled = true;
    document.getElementById("move-ruins").disabled = false;

    // Очищаем журнал событий
    const events = document.getElementById("events");
    events.innerHTML = "";
    addLog(
      `Вы начали игру заново. Вы в Деревне, безопасной зоне Эридана. Вас встречает ${currentNPC.name}.`
    );

    // Обновляем интерфейс
    updateInventory();
    updateUI();
  };

  // Рестарт
  document.getElementById("reset").addEventListener("click", () => {
    if (
      confirm(
        "Вы уверены, что хотите сбросить прогресс? Все данные будут потеряны!"
      )
    ) {
      resetGame();
    }
  });

  // Начальное обновление интерфейса
  updateInventory();
  updateUI();
});

// Функция добавления записи в журнал
function addLog(message) {
  const events = document.getElementById("events");
  const p = document.createElement("p");
  p.textContent = message;
  events.appendChild(p);
  // Принудительно прокручиваем вниз
  setTimeout(() => {
    events.scrollTop = events.scrollHeight;
  }, 10); // Задержка 10 мс для гарантированного обновления DOM
}
