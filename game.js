// Глобальные данные
let player = {
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  str: 10,
  def: 5,
  agi: 8,
  level: 1,
  xp: 0,
  isDefending: false, // Флаг защиты
};

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

// Инвентарь
let inventory = {
    health: 1,    // Зелье здоровья (+50 HP)
    strength: 1,  // Зелье силы (+20 STR на 2 хода)
    defense: 1,   // Зелье защиты (+20 DEF на 2 хода)
    agility: 1,   // Зелье ловкости (+20 AGI на 2 хода)
    mana: 1       // Зелье маны (+35 MP)
};

// Эффекты зелий
let potionEffects = {
    strength: { turns: 0, value: 0 },
    defense: { turns: 0, value: 0 },
    agility: { turns: 0, value: 0 }
};

let currentEnemy = null;
let currentNPC = null;
let currentLocation = "village";
let isPlayerTurn = true; // Флаг хода игрока

// Инициализация игры
document.addEventListener("DOMContentLoaded", () => {
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
      attacker.str - (defender.isDefending ? defender.def * 2 : defender.def)
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
    // Анимация пошатывания
    if (damage > 0) {
      if (attacker === player) {
        document.querySelector("#enemy-avatar img").classList.add("shake");
      } else {
        document.querySelector("#player-avatar img").classList.add("shake");
      }
    }
    return damage;
  };

  // Функция для обновления интерфейса
  const updateUI = () => {
    playerHpText.textContent = player.hp;
    playerMaxHpText.textContent = player.maxHp;
    playerHpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
    if (currentEnemy) {
      enemyHpText.textContent = currentEnemy.hp;
      enemyMaxHpText.textContent = currentEnemy.maxHp;
      enemyHpBar.style.width = `${
        (currentEnemy.hp / currentEnemy.maxHp) * 100
      }%`;
    }
    xpText.textContent = player.xp;
    xpBar.style.width = `${player.xp % 100}%`;
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
      if (player.xp >= 100) {
        player.level++;
        player.xp -= 100;
        addLog(`Вы достигли уровня ${player.level}!`);
      }
      // Награда: случайное зелье
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
    currentEnemy = characters.enemies.forest;
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
  });

  document.getElementById("move-village").addEventListener("click", () => {
    currentLocation = "village";
    desc.textContent = "Вы в Деревне, безопасной зоне.";
    addLog("Вы вернулись в Деревню.");
    document.getElementById("move-forest").disabled = false;
    document.getElementById("move-village").disabled = true;
    document.getElementById("move-ruins").disabled = false;

    // Показываем NPC
    currentEnemy = null;
    currentNPC = characters.npcs.village;
    changeAvatar(currentNPC.avatar, currentNPC.name);
    enemyAvatar.style.display = "block";
    enemyHpBar.style.display = "none";
    document.querySelector("#enemy-avatar .health-text").style.display = "none";
    actions.style.display = "none";
    changeBackground(currentLocation);
  });

  document.getElementById("move-ruins").addEventListener("click", () => {
    currentLocation = "ruins";
    desc.textContent = "Вы в Древних Руинах.";
    addLog("Вы покинули Деревню и вошли в Древние Руины.");
    document.getElementById("move-forest").disabled = true;
    document.getElementById("move-village").disabled = false;
    document.getElementById("move-ruins").disabled = true;

    // Показываем врага (Скелет)
    currentEnemy = characters.enemies.ruins;
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
    addLog("Вы заняли оборонительную стойку!");
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

  // Рестарт
  document.getElementById("reset").addEventListener("click", () => {
    location.reload();
  });

  // Начальное обновление интерфейса
  updateUI();
  updateInventory();
});

// Функция добавления записи в журнал
function addLog(message) {
  const events = document.getElementById("events");
  const p = document.createElement("p");
  p.textContent = message;
  events.appendChild(p);
  events.scrollTop = events.scrollHeight;
}
