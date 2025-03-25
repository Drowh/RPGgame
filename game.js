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
    mana: 1,
};

let player = { ...initialPlayerState };
let inventory = { ...initialInventoryState };

// Данные врагов и NPC
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
            xpReward: 20,
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
    sfchik: {
        name: "СФчик",
        hp: 150,
        maxHp: 150,
        str: 20,
        def: 10,
        agi: 8,
        avatar: "image/sfcfik.png",
        xpReward: 100,
        abilities: [
            {
                name: "Минус защита",
                chance: 0.3, // 30% шанс
                effect: (target) => {
                    // Если эффект уже активен, просто обновляем длительность
                    if (enemyAbilityEffects.defenseReduction.turns > 0) {
                        enemyAbilityEffects.defenseReduction.turns = 3;
                        addLog(
                            "СФчик применил 'Минус защита'! Длительность эффекта обновлена: защита снижена на 3 хода."
                        );
                    } else {
                        // Снижаем защиту на 5 и сохраняем значение
                        enemyAbilityEffects.defenseReduction.value = 5;
                        target.def = Math.max(
                            0,
                            target.def - enemyAbilityEffects.defenseReduction.value
                        );
                        enemyAbilityEffects.defenseReduction.turns = 3;
                        addLog(
                            "СФчик применил 'Минус защита'! Ваша защита снижена на 5 на 3 хода!"
                        );
                    }
                },
            },
        ],
    },
    npcs: {
        village: {
            name: "Элара",
            avatar: "image/elara.png",
            dialogues: [
                {
                    text: "Привет, путник! Я Элара. В нашем лесу неспокойно, гоблины нападают на жителей. Не могли бы ты помочь?",
                    options: [
                        { text: "Конечно, я помогу!", next: "quest-offer" },
                        { text: "Извини, мне некогда.", next: "decline" },
                    ],
                },
                {
                    id: "quest-offer",
                    text: "Спасибо! Убей 3 гоблинов в Мрачном Лесу, и я дам тебе награду.",
                    options: [
                        { text: "Принимаю задание!", next: null, action: "accept-quest" },
                        { text: "Подумаю ещё...", next: null },
                    ],
                },
                {
                    id: "decline",
                    text: "Понимаю, у всех свои дела. Если передумаешь, дай знать!",
                    options: [{ text: "Хорошо, я подумаю.", next: null }],
                },
            ],
        },
        villageBlacksmith: {
            name: "Грок",
            avatar: "image/grok.png",
            dialogues: [
                {
                    text: "Я Грок, кузнец этой деревни. Могу предложить тебе усилить оружие, но мне нужны материалы из Древних Руин. Принесёшь?",
                    options: [
                        {
                            text: "Да, я принесу материалы!",
                            next: "quest-offer-blacksmith",
                        },
                        { text: "Не сейчас, Грок.", next: "decline-blacksmith" },
                    ],
                },
                {
                    id: "quest-offer-blacksmith",
                    text: "Отлично! Убей 2 скелетов в Древних Руинах и принеси их кости. Я сделаю тебе меч получше.",
                    options: [
                        {
                            text: "Принимаю задание!",
                            next: null,
                            action: "accept-quest-blacksmith",
                        },
                        { text: "Подумаю ещё...", next: null },
                    ],
                },
                {
                    id: "decline-blacksmith",
                    text: "Хорошо, приходи, когда будешь готов.",
                    options: [{ text: "Хорошо, я подумаю.", next: null }],
                },
            ],
        },
    },
};

// Данные локаций и их фоны
const locations = {
    village: { bgClass: "village-bg" },
    forest: { bgClass: "forest-bg" },
    ruins: { bgClass: "ruins-bg" },
    "sfchik-cave": { bgClass: "sfchik-cave-bg" },
};

// Эффекты зелий
let potionEffects = {
    strength: { turns: 0, value: 0 },
    defense: { turns: 0, value: 0 },
    agility: { turns: 0, value: 0 },
};

// Эффекты способностей врагов
let enemyAbilityEffects = {
    defenseReduction: { turns: 0, value: 0 }, // Для "Минус защиты"
};

// Требуемый опыт для каждого уровня
const xpPerLevel = [100, 150, 200, 250, 300]; // Увеличивается с каждым уровнем

let currentEnemy = null;
let currentNPC = null;
let currentLocation = "village";
let isPlayerTurn = true; // Флаг хода игрока
let activeQuestsDiv = null; // Глобальная переменная для activeQuestsDiv

// Данные квестов
const quests = {
    "goblin-slay": {
        name: "Убить гоблинов",
        description: "Элара попросила убить 3 гоблинов в Мрачном Лесу.",
        target: "Гоблин",
        required: 3,
        current: 0,
        reward: { xp: 50, inventory: { health: 2 } },
        completed: false,
        active: false,
    },
    "skeleton-bones": {
        name: "Собрать кости скелетов",
        description:
            "Грок попросил убить 2 скелетов в Древних Руинах и принести кости.",
        target: "Скелет",
        required: 2,
        current: 0,
        reward: { xp: 70, inventory: { strength: 2 }, stat: { str: 5 } },
        completed: false,
        active: false,
    },
};

// Функция для обновления интерфейса квестов
const updateQuestsUI = () => {
    activeQuestsDiv.innerHTML = "";
    Object.keys(quests).forEach((questId) => {
        const quest = quests[questId];
        if (quest.active) {
            // Показываем все активные квесты, даже завершённые
            const p = document.createElement("p");
            p.textContent = `${quest.name}: ${quest.description} (${quest.current}/${quest.required
                })${quest.completed ? " (Завершён)" : ""}`;
            activeQuestsDiv.appendChild(p);
        }
    });
};

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
        quests: quests,
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
        // Загрузка квестов
        if (progress.quests) {
            Object.keys(progress.quests).forEach((questId) => {
                if (quests[questId]) {
                    quests[questId].active = progress.quests[questId].active;
                    quests[questId].completed = progress.quests[questId].completed;
                    quests[questId].current = progress.quests[questId].current;
                }
            });
        }
    }
};

// Инициализация игры

document.addEventListener("DOMContentLoaded", () => {
    // Определяем элементы интерфейса
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

    // Элементы модального окна
    const dialogueModal = document.getElementById("dialogue-modal");
    const dialogueText = document.getElementById("dialogue-text");
    const dialogueOptions = document.getElementById("dialogue-options");

    // Элементы квестов и инвентаря
    activeQuestsDiv = document.getElementById("active-quests"); // Перемещаем сюда
    const inventoryDiv = document.getElementById("inventory");
    const talkButton = document.getElementById("talk-button");

    // Добавляем обработчик для кнопки "Поговорить"
    talkButton.addEventListener("click", () => {
        console.log("Кнопка 'Поговорить' нажата, currentNPC:", currentNPC);
        if (currentNPC) {
            showDialogue(currentNPC);
        } else {
            console.error("NPC не найден!");
        }
    });

    loadProgress(); // Теперь loadProgress вызывается после инициализации всех элементов
    console.log("Инициализация началась, прогресс загружен:", player, inventory);

    // Функция для отображения диалога
    const showDialogue = (npc, dialogueIndex = 0) => {
        console.log(
            "showDialogue вызвана для NPC:",
            npc.name,
            "с индексом:",
            dialogueIndex
        );

        // Проверяем, есть ли выполненные квесты для этого NPC
        let questCompletedDialogueIndex = -1;
        if (npc.name === "Элара" && quests["goblin-slay"].completed) {
            console.log("Квест 'goblin-slay' завершён, ищем диалог с наградой");
            questCompletedDialogueIndex = npc.dialogues.findIndex(
                (d) => d.id === "quest-complete"
            );
            if (questCompletedDialogueIndex === -1) {
                npc.dialogues.push({
                    id: "quest-complete",
                    text: "Ты убил 3 гоблинов? Отлично! Вот твоя награда.",
                    options: [
                        {
                            text: "Спасибо!",
                            next: null,
                            action: "claim-reward-goblin-slay",
                        },
                    ],
                });
                questCompletedDialogueIndex = npc.dialogues.length - 1;
            }
        } else if (npc.name === "Грок" && quests["skeleton-bones"].completed) {
            console.log("Квест 'skeleton-bones' завершён, ищем диалог с наградой");
            questCompletedDialogueIndex = npc.dialogues.findIndex(
                (d) => d.id === "quest-complete-blacksmith"
            );
            if (questCompletedDialogueIndex === -1) {
                npc.dialogues.push({
                    id: "quest-complete-blacksmith",
                    text: "Ты принёс кости скелетов? Отлично! Вот твой новый меч и немного опыта.",
                    options: [
                        {
                            text: "Спасибо, Грок!",
                            next: null,
                            action: "claim-reward-skeleton-bones",
                        },
                    ],
                });
                questCompletedDialogueIndex = npc.dialogues.length - 1;
            }
        }

        // Если есть диалог с наградой, используем его
        if (questCompletedDialogueIndex !== -1) {
            dialogueIndex = questCompletedDialogueIndex;
        } else {
            // Если квест не активен и мы начинаем диалог с нуля, показываем начальный диалог
            if (dialogueIndex === 0) {
                if (npc.name === "Элара" && !quests["goblin-slay"].active) {
                    dialogueIndex = 0;
                } else if (npc.name === "Грок" && !quests["skeleton-bones"].active) {
                    dialogueIndex = 0;
                }
            }
        }

        const dialogue = npc.dialogues[dialogueIndex];
        if (!dialogue) {
            console.error("Диалог не найден для индекса:", dialogueIndex);
            return;
        }

        // Обновляем текст диалога
        dialogueText.textContent = dialogue.text;

        // Очищаем старые кнопки
        dialogueOptions.innerHTML = "";

        // Создаём новые кнопки
        dialogue.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.textContent = option.text;
            button.addEventListener("click", () => {
                console.log("Нажата кнопка диалога:", option.text);
                if (option.next) {
                    const nextIndex = npc.dialogues.findIndex(
                        (d) => d.id === option.next
                    );
                    showDialogue(npc, nextIndex);
                } else {
                    dialogueModal.classList.add("hidden");
                    if (option.action) {
                        if (option.action === "accept-quest") {
                            acceptQuest("goblin-slay");
                        } else if (option.action === "accept-quest-blacksmith") {
                            acceptQuest("skeleton-bones");
                        } else if (option.action === "claim-reward-goblin-slay") {
                            claimQuestReward("goblin-slay");
                        } else if (option.action === "claim-reward-skeleton-bones") {
                            claimQuestReward("skeleton-bones");
                        }
                    }
                }
            });
            console.log("Создана кнопка для опции:", option.text);
            dialogueOptions.appendChild(button);
        });

        // Лог для проверки, сколько кнопок было создано
        console.log("Всего создано кнопок:", dialogueOptions.children.length);

        // Показываем модальное окно
        dialogueModal.classList.remove("hidden");
    };

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
                `${attacker === player ? "Вы" : attacker.name} нанес ${damage} урона ${defender === player ? "вам" : defender.name
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
            enemyHpBar.style.width = `${(currentEnemy.hp / currentEnemy.maxHp) * 100
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
        console.log(
            `checkBattleEnd: player.hp = ${player.hp}, currentEnemy.hp = ${currentEnemy ? currentEnemy.hp : "нет врага"
            }`
        );
        if (player.hp <= 0) {
            addLog("Вы проиграли! Игра окончена.");
            actions.style.display = "none";
            desc.textContent =
                'Игра окончена. Нажмите "Рестарт", чтобы начать заново.';
            document.getElementById("move-forest").disabled = true;
            document.getElementById("move-village").disabled = true;
            document.getElementById("move-ruins").disabled = true;
            inventoryDiv.style.display = "none";
            return true;
        }
        if (currentEnemy && currentEnemy.hp <= 0) {
            addLog(
                `Вы победили ${currentEnemy.name}! Получено ${currentEnemy.xpReward} опыта.`
            );
            player.xp += currentEnemy.xpReward;
            const requiredXp = xpPerLevel[player.level - 1] || 300;
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
                `Вы нашли ${randomPotion === "health"
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
            // Обновляем прогресс квестов
            updateQuestProgress(currentEnemy.name);
            updateInventory();
            currentEnemy = null;
            enemyAvatar.style.display = "none";
            actions.style.display = "none";
            inventoryDiv.style.display = "none";

            // Восстанавливаем эффекты способностей врагов после боя
            if (enemyAbilityEffects.defenseReduction.turns > 0) {
                player.def += enemyAbilityEffects.defenseReduction.value;
                addLog(
                    `Эффект "Минус защита" снят после боя. Ваша защита восстановлена на ${enemyAbilityEffects.defenseReduction.value}.`
                );
                enemyAbilityEffects.defenseReduction.turns = 0;
                enemyAbilityEffects.defenseReduction.value = 0;
            }

            updateUI();
            saveProgress();
            return true;
        }
        return false;
    };

    // Ход врага
    const enemyTurn = () => {
        if (!currentEnemy || currentEnemy.hp <= 0) return;
        setTimeout(() => {
            if (currentEnemy.hp > 0) {
                const damage = calculateDamage(currentEnemy, player);
                player.hp = Math.max(0, player.hp - damage);
                updateUI();

                // Применяем способности врага
                if (currentEnemy.abilities) {
                    currentEnemy.abilities.forEach((ability) => {
                        if (Math.random() < ability.chance) {
                            if (typeof ability.effect === "function") {
                                ability.effect(player);
                            } else {
                                console.error(
                                    `Способность "${ability.name}" не имеет корректной функции effect!`,
                                    ability
                                );
                            }
                        }
                    });
                }

                console.log(
                    `После хода врага: player.hp = ${player.hp}, currentEnemy.hp = ${currentEnemy.hp}`
                );
                if (!checkBattleEnd()) {
                    updateEffects();
                    addLog("Ваш ход!");
                    isPlayerTurn = true;
                    console.log(`Ход возвращён игроку: isPlayerTurn = ${isPlayerTurn}`);
                    const actions = document.getElementById("actions");
                    actions.style.display = "flex";
                    document.getElementById("attack").disabled = false;
                    document.getElementById("defend").disabled = false;
                    document.getElementById("useItem").disabled = false;
                    console.log("Кнопки разблокированы: attack, defend, useItem");
                } else {
                    console.log("Бой завершён, ход не возвращается игроку");
                }
            }
        }, 500);
    };

    // Функция для принятия квеста
    const acceptQuest = (questId) => {
        quests[questId].active = true;
        addLog(`Вы приняли квест: ${quests[questId].name}`);
        updateQuestsUI();
        saveProgress();
    };

    // Функция для обновления прогресса квеста
    const updateQuestProgress = (enemyName) => {
        Object.keys(quests).forEach((questId) => {
            const quest = quests[questId];
            if (quest.active && !quest.completed && quest.target === enemyName) {
                quest.current++;
                addLog(
                    `Прогресс квеста "${quest.name}": ${quest.current}/${quest.required}`
                );
                if (quest.current >= quest.required) {
                    quest.completed = true;
                    addLog(
                        `Квест "${quest.name}" выполнен! Вернитесь к NPC за наградой.`
                    );
                }
                updateQuestsUI();
                saveProgress();
            }
        });
    };

    // Функция для выдачи награды
    const claimQuestReward = (questId) => {
        const quest = quests[questId];
        player.xp += quest.reward.xp;
        addLog(`Вы получили ${quest.reward.xp} опыта за выполнение квеста!`);

        // Проверка повышения уровня
        const requiredXp = xpPerLevel[player.level - 1] || 300;
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

        // Выдача предметов
        if (quest.reward.inventory) {
            Object.keys(quest.reward.inventory).forEach((item) => {
                inventory[item] += quest.reward.inventory[item];
                addLog(
                    `Вы получили ${quest.reward.inventory[item]} ${item === "health"
                        ? "Зелье здоровья"
                        : item === "strength"
                            ? "Зелье силы"
                            : item === "defense"
                                ? "Зелье защиты"
                                : item === "agility"
                                    ? "Зелье ловкости"
                                    : "Зелье маны"
                    }!`
                );
            });
        }

        // Улучшение характеристик
        if (quest.reward.stat) {
            Object.keys(quest.reward.stat).forEach((stat) => {
                player[stat] += quest.reward.stat[stat];
                addLog(
                    `Ваша характеристика ${stat.toUpperCase()} увеличена на ${quest.reward.stat[stat]
                    }!`
                );
            });
        }

        // Сбрасываем квест
        quest.active = false;
        quest.completed = false;
        quest.current = 0;

        // Удаляем диалог с наградой из npc.dialogues
        if (questId === "goblin-slay") {
            const npc = characters.npcs.village;
            const dialogueIndex = npc.dialogues.findIndex(
                (d) => d.id === "quest-complete"
            );
            if (dialogueIndex !== -1) {
                npc.dialogues.splice(dialogueIndex, 1);
            }
        } else if (questId === "skeleton-bones") {
            const npc = characters.npcs.villageBlacksmith;
            const dialogueIndex = npc.dialogues.findIndex(
                (d) => d.id === "quest-complete-blacksmith"
            );
            if (dialogueIndex !== -1) {
                npc.dialogues.splice(dialogueIndex, 1);
            }
        }

        updateQuestsUI();
        updateInventory();
        updateUI();
        saveProgress();
    };

    // Начальная настройка: показываем NPC в деревне
    enemyAvatar.style.display = "none";
    actions.style.display = "none";
    currentNPC = characters.npcs.village;
    changeAvatar(currentNPC.avatar, currentNPC.name);
    enemyAvatar.style.display = "block";
    enemyHpBar.style.display = "none";
    document.querySelector("#enemy-avatar .health-text").style.display = "none";
    inventoryDiv.style.display = "none"; // Скрываем инвентарь в деревне
    talkButton.style.display = "block"; // Показываем кнопку "Поговорить"
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
    const updateEffects = () => {
        // Обновление эффектов зелий
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

        // Обновление эффектов способностей врагов
        if (enemyAbilityEffects.defenseReduction.turns > 0) {
            enemyAbilityEffects.defenseReduction.turns--;
            if (enemyAbilityEffects.defenseReduction.turns === 0) {
                player.def += enemyAbilityEffects.defenseReduction.value;
                addLog(
                    `Эффект "Минус защита" закончился. Ваша защита восстановлена на ${enemyAbilityEffects.defenseReduction.value}.`
                );
                enemyAbilityEffects.defenseReduction.value = 0;
            }
        }
    };

    // Функция для применения зелья
    const usePotion = (type) => {
        if (inventory[type] <= 0) {
            addLog(
                `У вас нет ${type === "health"
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

        // Копируем "Гоблина" вручную
        const goblinTemplate = characters.enemies.forest;
        currentEnemy = {
            name: goblinTemplate.name,
            hp: goblinTemplate.hp,
            maxHp: goblinTemplate.maxHp,
            str: goblinTemplate.str,
            def: goblinTemplate.def,
            agi: goblinTemplate.agi,
            avatar: goblinTemplate.avatar,
            xpReward: goblinTemplate.xpReward,
        };
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
        inventoryDiv.style.display = "block";
        talkButton.style.display = "none";
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
        document.getElementById("move-sfcfik-cave").disabled = false; // Добавь эту строку

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
        inventoryDiv.style.display = "none";
        talkButton.style.display = "block";
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

        // Копируем "Скелета" вручную
        const skeletonTemplate = characters.enemies.ruins;
        currentEnemy = {
            name: skeletonTemplate.name,
            hp: skeletonTemplate.hp,
            maxHp: skeletonTemplate.maxHp,
            str: skeletonTemplate.str,
            def: skeletonTemplate.def,
            agi: skeletonTemplate.agi,
            avatar: skeletonTemplate.avatar,
            xpReward: skeletonTemplate.xpReward,
        };
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
        inventoryDiv.style.display = "block";
        talkButton.style.display = "none";
        changeBackground(currentLocation);
        isPlayerTurn = true;
        addLog("Ваш ход!");
        saveProgress();
        updateUI();
    });

    document.getElementById("move-sfcfik-cave").addEventListener("click", () => {
        if (player.level < 3) {
            addLog("Вам нужен 3-й уровень, чтобы войти в Пещеру СФчика!");
            return;
        }
        currentLocation = "sfchik-cave";
        desc.textContent = "Вы в Пещере СФчика.";
        addLog("Вы покинули Деревню и вошли в Пещеру СФчика.");
        document.getElementById("move-forest").disabled = true;
        document.getElementById("move-village").disabled = false;
        document.getElementById("move-ruins").disabled = true;
        document.getElementById("move-sfcfik-cave").disabled = true;

        // Создаём копию "СФчика" вручную, чтобы сохранить функции
        const sfchikTemplate = characters.sfchik;
        currentEnemy = {
            name: sfchikTemplate.name,
            hp: sfchikTemplate.hp,
            maxHp: sfchikTemplate.maxHp,
            str: sfchikTemplate.str,
            def: sfchikTemplate.def,
            agi: sfchikTemplate.agi,
            avatar: sfchikTemplate.avatar,
            xpReward: sfchikTemplate.xpReward,
            abilities: sfchikTemplate.abilities.map((ability) => ({
                name: ability.name,
                chance: ability.chance,
                effect: ability.effect, // Сохраняем функцию
            })),
        };
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
        inventoryDiv.style.display = "block";
        talkButton.style.display = "none";
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
            updateEffects();
            enemyTurn();
        }
    });

    document.getElementById("defend").addEventListener("click", () => {
        if (!isPlayerTurn || !currentEnemy) return;
        isPlayerTurn = false;
        player.isDefending = true;
        addLog("Защита увеличена на 50% на 1 ход.");
        updateEffects();
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
                    updateEffects();
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

        // Сбрасываем квесты
        Object.keys(quests).forEach((questId) => {
            quests[questId].active = false;
            quests[questId].completed = false;
            quests[questId].current = 0;
        });

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
        inventoryDiv.style.display = "none"; // Скрываем инвентарь
        talkButton.style.display = "block"; // Показываем кнопку "Поговорить"

        // Очищаем журнал событий
        const events = document.getElementById("events");
        events.innerHTML = "";
        addLog(
            `Вы начали игру заново. Вы в Деревне, безопасной зоне Эридана. Вас встречает ${currentNPC.name}.`
        );

        // Обновляем интерфейс
        updateInventory();
        updateQuestsUI();
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
