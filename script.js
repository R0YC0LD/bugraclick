// Değişkenler
let score = 1000;
let isGameOver = false;

// DOM Elementleri
const counterDisplay = document.getElementById('counter');
const body = document.body;
const endScreen = document.getElementById('end-screen');
const endMessage = document.getElementById('end-message');
const restartBtn = document.getElementById('restart-btn');

// Ekrana tıklama olayını dinle (Tüm ekran)
document.addEventListener('click', (e) => {
    // Eğer oyun bittiyse veya tıklanan yer restart butonuysa işlem yapma
    if (isGameOver || e.target.id === 'restart-btn') return;

    handleGameLogic(e.clientX, e.clientY);
});

// Oyun Mantığı
function handleGameLogic(x, y) {
    // 1. TROLL MEKANİĞİ: Puanı arttırmak yerine rastgele azalt
    // 5 ile 20 arasında rastgele bir sayı üret
    const randomDrop = Math.floor(Math.random() * 16) + 5; 
    score -= randomDrop;

    // 2. Görsel Güncelleme
    updateDisplay();
    triggerVisualEffects(x, y);

    // 3. Kazanma/Kaybetme Kontrolü
    checkWinCondition();
}

function updateDisplay() {
    counterDisplay.innerText = score;
    
    // Sayaca anlık bir "büyüme" efekti ver (Jitter hissi)
    counterDisplay.classList.add('shake');
    setTimeout(() => {
        counterDisplay.classList.remove('shake');
    }, 100);
}

// Tıklanan yerde +1 animasyonu oluşturur (Oyuncuyu kandırmak için)
function triggerVisualEffects(x, y) {
    const floatText = document.createElement('div');
    floatText.classList.add('plus-one');
    floatText.innerText = "+1";
    
    // Tıklanan konuma yerleştir (Hafif sapma ile daha doğal dursun)
    const randomX = Math.random() * 20 - 10; 
    floatText.style.left = `${x + randomX}px`;
    floatText.style.top = `${y}px`;

    document.body.appendChild(floatText);

    // Animasyon bitince DOM'dan sil (Performans için önemli)
    setTimeout(() => {
        floatText.remove();
    }, 800);
}

function checkWinCondition() {
    // KAYBETME DURUMU (Süreklilik arz eden sonuç)
    if (score <= 0) {
        score = 0;
        updateDisplay();
        endGame(false);
    } 
    // KAZANMA DURUMU (Teorik olarak kodlandı ama pratikte ulaşılamaz)
    else if (score >= 2000) {
        endGame(true);
    }
}

function endGame(isWin) {
    isGameOver = true;
    endScreen.classList.remove('hidden');

    if (isWin) {
        // Bu kısım oyuncu asla buraya gelemeyeceği için çalışmayacak :)
        body.style.backgroundColor = "#2ed573"; // Yeşil
        endMessage.innerText = "Kazandın! Aşırı hızlı tıkladın!";
    } else {
        // Kaybetme Senaryosu
        body.style.backgroundColor = "#ff4757"; // Kırmızı
        endMessage.innerText = "Kaybettin – Daha hızlı tıklamalıydın!";
    }

    // Restart butonunu 1 saniye gecikmeli göster
    setTimeout(() => {
        restartBtn.classList.remove('hidden');
    }, 1000);
}

// Restart Butonu İşlevi
restartBtn.addEventListener('click', () => {
    resetGame();
});

function resetGame() {
    score = 1000;
    isGameOver = false;
    
    // UI Sıfırlama
    counterDisplay.innerText = score;
    body.style.backgroundColor = "#1a1a1a"; // Eski rengine dön
    endScreen.classList.add('hidden');
    restartBtn.classList.add('hidden');
}
