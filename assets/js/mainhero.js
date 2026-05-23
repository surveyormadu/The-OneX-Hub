// Function to animate numbers
const animateNumbers = () => {
    const counters = document.querySelectorAll('.swiper-slide-active .count-up');
    const speed = 200; // The lower the slower

    counters.forEach(counter => {
        const updateCount = () => {
            // Some targets might have decimal points
            const target = parseFloat(counter.getAttribute('data-target'));
            const count = parseFloat(counter.innerText) || 0;
            const isFloat = counter.getAttribute('data-target').includes('.');

            const inc = target / speed;

            if (count < target) {
                counter.innerText = isFloat ? (count + inc).toFixed(1) : Math.ceil(count + inc);
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target;
            }
        };

        counter.innerText = '0';
        updateCount();
    });
};

// Thumbs swiper — must be initialised BEFORE the main slider
var thumbsSwiper = new Swiper('.bg-slider-thumbs', {
    slidesPerView: 'auto',
    spaceBetween: 0,
    watchSlidesProgress: true,
    allowTouchMove: false,
});

//Swiper slider
var swiper2 = new Swiper(".bg-slider", {
    loop: true,
    spaceBetween: 0,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    navigation: {
      nextEl: '.swiper-button-next.custom-nav',
      prevEl: '.swiper-button-prev.custom-nav',
    },
    autoplay: {
        delay: 7000,
        disableOnInteraction: false,
    },
    thumbs: {
        swiper: thumbsSwiper,
    },
    on: {
      init: function () {
        setTimeout(animateNumbers, 500); // slight delay for visual sync
      },
      slideChangeTransitionStart: function () {
        setTimeout(animateNumbers, 100);
      }
    }
});

// Autoplay after 7 seconds of inactivity
let autoplayTimer;
const startAutoplayTimer = () => {
    clearTimeout(autoplayTimer);
    autoplayTimer = setTimeout(() => {
        if(swiper2 && swiper2.autoplay) {
          swiper2.autoplay.start();
        }
    }, 7000); // 7 seconds
};

// Start timer on page load
startAutoplayTimer();

// Reset timer on user activity
const resetAutoplayTimer = () => {
    swiper2.autoplay.stop();
    startAutoplayTimer();
};

// Listen for user interactions
document.addEventListener('mousemove', resetAutoplayTimer);
document.addEventListener('click', resetAutoplayTimer);
document.addEventListener('keydown', resetAutoplayTimer);
document.addEventListener('scroll', resetAutoplayTimer);
document.addEventListener('touchstart', resetAutoplayTimer);

//Navigation bar effects on scroll
window.addEventListener("scroll", function(){
    const header = document.querySelector("header");
    header.classList.toggle("sticky", window.scrollY > 0);
});

//Responsive navigation menu toggle
const menuBtn = document.querySelector(".nav-menu-btn");
const closeBtn = document.querySelector(".nav-close-btn");
const navigation = document.querySelector(".navigation");

menuBtn.addEventListener("click", () => {
    navigation.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    navigation.classList.remove("active");
});

// Scroll progress bar (fills left -> right as user scrolls)
(function(){
    const progress = document.getElementById('scrollProgress');
    if(!progress) return;

    function updateProgress(){
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progress.style.width = pct + '%';
    }

    window.addEventListener('scroll', () => requestAnimationFrame(updateProgress));
    window.addEventListener('resize', () => requestAnimationFrame(updateProgress));
    // init
    requestAnimationFrame(updateProgress);
})();