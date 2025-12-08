/* NEON BREACH - CORE ENGINE
    Author: Gemini AI
    Optimization: RequestAnimationFrame, Batch DOM Updates
*/

// --- YAPILANDIRMA VE SABİTLER ---
const CONFIG = {
    autoSaveInterval: 5000,
    currencyUpdateInterval: 10000,
    baseTraceChance: 0.005, // Her frame'de değil, her tıklamada kontrol
    baseGlitchChance: 0.01,
    eyeDuration: 4000
};

const THEMES = [
    { id: 'neon-green', name: 'Cyber Green', color: '#00ff41', cost: 0, purchased: true },
    { id: 'neon-blue', name: 'Neon Blue', color: '#00f3ff', cost: 1000, purchased: false },
    { id: 'red-alert', name: 'Red Terminal', color: '#ff0055', cost: 2500, purchased: false },
    { id: 'magenta-pulse', name: 'Magenta Pulse', color: '#ff00ff', cost: 5000, purchased: false },
    { id: 'gold-lux', name: 'Gold Luxury', color: '#ffd700', cost: 10000, purchased: false }
];

const DATA_TYPES = [
    { name: "Çerez Dosyası", val: 5, rarity: "Low" },
    { name: "Kullanıcı Logları", val: 15, rarity: "Medium" },
    { name: "Kredi Kartı ID", val: 50, rarity: "High" },
    { name: "Şirket E-postaları", val: 120, rarity: "Premium" },
    { name: "Devlet Sırrı", val: 500, rarity: "BlackMarket" }
];

// --- GAME STATE (MERKEZİ VERİ) ---
const Game = {
    state: {
        hp: 0,
        money: 0,
        strikes: 0,
        glitchLevel: 0,
        infiltration: 0,
        inventory: [],
        currencies: { USD: 0, EUR: 0, GOLD: 0, BTC: 0 },
        rates: { USD: 30, EUR: 32, GOLD: 2000, BTC: 1000000 },
        themes: JSON.parse(JSON.stringify(THEMES)), // Deep copy
        currentTheme: 'neon-green',
        upgrades: {
            clickPower: { lvl: 1, cost: 50, name: "Brute Force" },
            autoClick: { lvl: 0, cost: 200, name: "Botnet" },
            riskReducer: { lvl: 0, cost: 500, name: "Proxy VPN" },
            glitchStab: { lvl: 0, cost: 750, name: "Error Handler" }
        }
    },
    
    flags: {
        isTracing: false,
        isGlitching: false,
        isRebooting: false
    },

    // --- SİSTEM BAŞLANGICI ---
    system: {
        init: function() {
            Game.saveSystem.load();
            Game.ui.applyTheme(Game.state.currentTheme);
            Game.system.bootSequence();
        },

        bootSequence: function() {
            const lines = [
                "BIOS DATE 01/01/2077 14:02:55 VER 1.0.2",
                "CPU: NEURO-CORE X9 128-CORE PROCESSOR",
                "Checking Memory... 64TB OK",
                "Loading Kernel... OK",
                "Mounting File System... OK",
                "Initializing Secure Layer... DONE",
                "SYSTEM READY."
            ];
            const screen = document.getElementById('bios-text');
            const bar = document.getElementById('boot-bar');
            let i = 0;

            const interval = setInterval(() => {
                screen.innerText += lines[i] + "\n";
                bar.style.width = ((i + 1) / lines.length * 100) + "%";
                i++;
                if (i >= lines.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        document.getElementById('boot-screen').classList.add('hidden');
                        document.getElementById('main-menu').classList.remove('hidden');
                    }, 1000);
                }
            }, 500);
        },

        startGame: function() {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('game-container').classList.remove('hidden');
            Game.loops.start();
            Game.ui.initListeners();
            Game.ui.updateAll();
        }
    },

    // --- TEMEL MEKANİKLER ---
    mechanics: {
        click: function() {
            if (Game.flags.isRebooting) return;
            
            // CEZALAR
            if (Game.flags.isTracing) {
                Game.mechanics.addStrike();
                return;
            }
            if (Game.flags.isGlitching) {
                Game.mechanics.increaseGlitch(10);
            }

            // KAZANÇ
            const power = Game.state.upgrades.clickPower.lvl * 1.5;
            Game.state.hp += power;
            
            const infilSpeed = 1 + (Game.state.upgrades.clickPower.lvl * 0.2); // Sızma hızı upgrade'e bağlı
            Game.state.infiltration += infilSpeed;

            if (Game.state.infiltration >= 100) {
                Game.state.infiltration = 0;
                Game.mechanics.loot();
            }

            // RASTGELE OLAY TETİKLEME
            Game.mechanics.checkEvents();
            Game.ui.renderFrame(); // UI Update
        },

        loot: function() {
            const item = DATA_TYPES[Math.floor(Math.random() * DATA_TYPES.length)];
            Game.state.inventory.push(item);
            Game.ui.log(`Veri Çekildi: [${item.rarity}] ${item.name}`);
            Game.ui.updateInventory();
        },

        checkEvents: function() {
            const riskMitigation = Game.state.upgrades.riskReducer.lvl * 0.2;
            
            // Trace Check
            if (!Game.flags.isTracing && Math.random() < (CONFIG.baseTraceChance / (1 + riskMitigation))) {
                Game.mechanics.startTrace();
            }
            // Glitch Check
            if (!Game.flags.isGlitching && Math.random() < (CONFIG.baseGlitchChance / (1 + riskMitigation))) {
                Game.mechanics.startGlitch();
            }
        },

        startTrace: function() {
            Game.flags.isTracing = true;
            document.getElementById('trace-overlay').classList.remove('hidden');
            Game.ui.log("UYARI: SISTEM IZLENIYOR!");
            
            setTimeout(() => {
                Game.flags.isTracing = false;
                document.getElementById('trace-overlay').classList.add('hidden');
                Game.ui.log("Tehdit geçti.");
            }, CONFIG.eyeDuration);
        },

        addStrike: function() {
            Game.state.strikes++;
            Game.ui.log("!!! TESPİT EDİLDİN: STRIKE +1 !!!");
            if (Game.state.strikes >= 10) {
                alert("GAME OVER - POLİSLER KAPIDA");
                Game.saveSystem.resetSave();
            }
            Game.ui.updateHeader();
        },

        startGlitch: function() {
            Game.flags.isGlitching = true;
            document.body.classList.add('glitch-active');
            Game.ui.log("SİSTEM HATASI: GLITCH TESPİT EDİLDİ");
            
            setTimeout(() => {
                if(!Game.flags.isRebooting) {
                    Game.flags.isGlitching = false;
                    document.body.classList.remove('glitch-active');
                }
            }, 3000);
        },

        increaseGlitch: function(amount) {
            const stab = Game.state.upgrades.glitchStab.lvl * 0.5;
            Game.state.glitchLevel += Math.max(1, amount - stab);
            Game.ui.updateHeader();

            if (Game.state.glitchLevel >= 100) {
                Game.mechanics.triggerReboot();
            }
        },

        triggerReboot: function() {
            Game.flags.isRebooting = true;
            Game.saveSystem.save();
            document.getElementById('reboot-overlay').classList.remove('hidden');
            
            let timer = 15;
            const el = document.getElementById('reboot-timer');
            const int = setInterval(() => {
                timer--;
                el.innerText = timer;
                if(timer <= 0) {
                    clearInterval(int);
                    location.reload();
                }
            }, 1000);
        }
    },

    // --- MARKET & EKONOMİ ---
    market: {
        sellAll: function(vendor) {
            if(Game.state.inventory.length === 0) return;

            let multi = 1;
            let risk = 0;

            switch(vendor) {
                case 'p2p': multi = 0.8; risk = 0; break;
                case 'broker': multi = 1.0; risk = 0.1; break;
                case 'crypto': multi = 1.4; risk = 0.3; break;
                case 'darknet': multi = 2.0; risk = 0.6; break;
            }

            if(Math.random() < risk) {
                Game.mechanics.addStrike();
                Game.ui.log("SATIŞTA YAKALANDIN!");
                return;
            }

            let total = 0;
            Game.state.inventory.forEach(i => total += i.val * multi);
            Game.state.inventory = [];
            Game.state.money += total;
            
            Game.ui.log(`Satış Başarılı: +${total.toFixed(2)} TL`);
            Game.ui.updateInventory();
            Game.ui.updateHeader();
        }
    },

    bank: {
        updateRates: function() {
            for(let key in Game.state.rates) {
                const change = 1 + (Math.random() * 0.1 - 0.05);
                Game.state.rates[key] *= change;
            }
            Game.ui.updateBank();
        },
        buy: function() {
            const amount = parseFloat(document.getElementById('exchange-amount').value);
            const type = document.getElementById('currency-select').value;
            const rate = Game.state.rates[type];

            if(amount > 0 && Game.state.money >= amount) {
                Game.state.money -= amount;
                Game.state.currencies[type] += amount / rate;
                Game.ui.updateHeader();
                Game.ui.updateBank();
            }
        },
        sell: function() {
            const type = document.getElementById('currency-select').value;
            const holding = Game.state.currencies[type];
            const rate = Game.state.rates[type];

            if(holding > 0) {
                Game.state.money += holding * rate;
                Game.state.currencies[type] = 0;
                Game.ui.updateHeader();
                Game.ui.updateBank();
            }
        }
    },

    // --- UI YÖNETİMİ ---
    ui: {
        initListeners: function() {
            // Tab Geçişleri
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                    document.querySelectorAll('.nav-btn').forEach(nb => nb.classList.remove('active'));
                    document.getElementById(e.target.dataset.tab).classList.add('active');
                    e.target.classList.add('active');
                });
            });

            // Hack Butonu
            document.getElementById('hack-btn').addEventListener('click', Game.mechanics.click);

            // Göz Takibi (Optimization: Throttle yapmadan doğrudan transform güncellemesi)
            document.addEventListener('mousemove', (e) => {
                if(!Game.flags.isTracing) return;
                const eye = document.querySelector('.eye-ball');
                const socket = document.querySelector('.eye-socket');
                const rect = socket.getBoundingClientRect();
                
                const eyeX = rect.left + rect.width / 2;
                const eyeY = rect.top + rect.height / 2;
                const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
                const dist = Math.min(30, Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 5); // Limit movement
                
                eye.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
            });
        },

        updateAll: function() {
            this.updateHeader();
            this.renderFrame(); // Barlar
            this.updateInventory();
            this.updateBank();
            this.updateUpgrades();
        },

        renderFrame: function() {
            // Sadece hızlı değişenleri update et (RAF içinde çağrılabilir)
            document.getElementById('hp-display').innerText = Math.floor(Game.state.hp);
            document.getElementById('infiltration-bar').style.width = Math.min(100, Game.state.infiltration) + "%";
            document.getElementById('infiltration-text').innerText = '%' + Math.floor(Game.state.infiltration);
        },

        updateHeader: function() {
            document.getElementById('money-display').innerText = Game.state.money.toFixed(2);
            document.getElementById('strike-display').innerText = Game.state.strikes;
            document.getElementById('glitch-display').innerText = Game.state.glitchLevel.toFixed(1);
        },

        updateInventory: function() {
            const list = document.getElementById('inventory-list');
            list.innerHTML = "";
            Game.state.inventory.forEach(item => {
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `<div>${item.name}</div><small>${item.rarity}</small>`;
                list.appendChild(div);
            });
        },

        updateBank: function() {
            const list = document.getElementById('currency-list');
            list.innerHTML = "";
            for(let key in Game.state.currencies) {
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `<b>${key}</b><br>Kur: ${Game.state.rates[key].toFixed(2)}<br>Sahip: ${Game.state.currencies[key].toFixed(4)}`;
                list.appendChild(div);
            }
        },
        
        updateUpgrades: function() {
            const list = document.getElementById('upgrade-list');
            list.innerHTML = "";
            for(let key in Game.state.upgrades) {
                const u = Game.state.upgrades[key];
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `<b>${u.name}</b> (Lvl ${u.lvl})<br>Maliyet: ${u.cost} HP`;
                div.onclick = () => {
                    if(Game.state.hp >= u.cost) {
                        Game.state.hp -= u.cost;
                        u.lvl++;
                        u.cost = Math.floor(u.cost * 1.5);
                        Game.ui.updateAll();
                    }
                };
                list.appendChild(div);
            }
        },

        log: function(msg) {
            const ul = document.getElementById('log-list');
            const li = document.createElement('li');
            li.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
            ul.prepend(li);
            if(ul.children.length > 20) ul.lastChild.remove();
        },

        // --- TEMA SİSTEMİ ---
        openThemeModal: function() {
            document.getElementById('theme-modal').classList.remove('hidden');
            const list = document.getElementById('theme-list');
            list.innerHTML = "";
            Game.state.themes.forEach(theme => {
                const div = document.createElement('div');
                div.className = 'card';
                div.style.borderColor = theme.color;
                div.innerHTML = `<h4 style="color:${theme.color}">${theme.name}</h4>
                                 <p>${theme.purchased ? "SATIN ALINDI" : theme.cost + " TL"}</p>`;
                div.onclick = () => {
                    if(theme.purchased) {
                        Game.ui.applyTheme(theme.id);
                    } else if(Game.state.money >= theme.cost) {
                        Game.state.money -= theme.cost;
                        theme.purchased = true;
                        Game.ui.applyTheme(theme.id);
                        Game.ui.updateHeader();
                        Game.ui.openThemeModal(); // Refresh UI
                    } else {
                        alert("Yetersiz Bakiye!");
                    }
                };
                list.appendChild(div);
            });
        },

        closeThemeModal: () => document.getElementById('theme-modal').classList.add('hidden'),

        applyTheme: function(themeId) {
            const theme = Game.state.themes.find(t => t.id === themeId);
            if(theme) {
                document.documentElement.style.setProperty('--primary', theme.color);
                Game.state.currentTheme = themeId;
            }
        }
    },

    // --- DÖNGÜLER ---
    loops: {
        start: function() {
            // UI Loop (60 FPS için optimize)
            const loop = () => {
                Game.ui.renderFrame();
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);

            // Auto Clicker
            setInterval(() => {
                if(!Game.flags.isRebooting && Game.state.upgrades.autoClick.lvl > 0) {
                    Game.state.hp += Game.state.upgrades.autoClick.lvl;
                }
            }, 1000);

            // Döviz ve Timer
            setInterval(() => {
                Game.bank.updateRates();
            }, CONFIG.currencyUpdateInterval);

            // Geri Sayım Görseli
            let t = 10;
            setInterval(() => {
                t--;
                const el = document.getElementById('currency-timer');
                if(el) el.innerText = t;
                if(t<=0) t=10;
            }, 1000);

            // Auto Save
            setInterval(() => Game.saveSystem.save(), CONFIG.autoSaveInterval);
            
            // Glitch Azaltma
            setInterval(() => {
                if(Game.state.glitchLevel > 0 && !Game.flags.isGlitching) {
                    Game.state.glitchLevel = Math.max(0, Game.state.glitchLevel - 1);
                    Game.ui.updateHeader();
                }
            }, 1000);
        }
    },

    // --- KAYIT SİSTEMİ ---
    saveSystem: {
        save: function() {
            if(Game.state.strikes >= 10) return;
            localStorage.setItem('neonBreachSave', JSON.stringify(Game.state));
            console.log("Game Saved");
        },
        load: function() {
            const data = localStorage.getItem('neonBreachSave');
            if(data) {
                try {
                    const parsed = JSON.parse(data);
                    Game.state = { ...Game.state, ...parsed };
                } catch(e) { console.error("Save Load Error", e); }
            }
        },
        resetSave: function() {
            localStorage.removeItem('neonBreachSave');
            location.reload();
        }
    }
};

// --- INIT ---
window.addEventListener('DOMContentLoaded', Game.system.init);
                                                                                                       
