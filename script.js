// Smooth scroll to contact
function scrollToContact() {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

// Simple demo spinner game
let isSpinning = false;
const prizes = ['Free Consultation', '10% Off', 'Branded Swag', 'VIP Access'];

function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    const spinner = document.getElementById('spinner');
    const button = document.getElementById('spin-button');
    const result = document.getElementById('result');

    spinner.style.display = 'block';
    button.disabled = true;
    button.textContent = 'Spinning...';

    // Simulate spin delay
    setTimeout(() => {
        spinner.style.display = 'none';
        const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
        result.textContent = `You won: ${randomPrize}!`;
        button.disabled = false;
        button.textContent = 'Spin Again!';
        isSpinning = false;
    }, 2000);
}

// Form submission (placeholder - integrate with a service like EmailJS)
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thanks for signing up! We\'ll be in touch soon.');
    this.reset();
});