const scroll = new LocomotiveScroll({
    el: document.querySelector('#main'),
    smooth: true
});


const psContainer = document.querySelector('.ps-container');
psContainer.addEventListener('wheel', e => {
  const { scrollTop, scrollHeight, clientHeight } = psContainer;
  const atTop    = scrollTop === 0 && e.deltaY < 0;
  const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
  if (!atTop && !atBottom) e.stopPropagation();
});


function page4Animation() {
    var elemC = document.querySelector("#elem-container")
    var fixed = document.querySelector("#fixed-image")
    elemC.addEventListener("mouseenter", function () {
        fixed.style.display = "block"
    })
    elemC.addEventListener("mouseleave", function () {
        fixed.style.display = "none"
    })

    var elems = document.querySelectorAll(".elem")
    elems.forEach(function (e) {
        e.addEventListener("mouseenter", function () {
            var image = e.getAttribute("data-image")
            fixed.style.backgroundImage = `url(${image})`
        })
    })
}

function swiperAnimation() {
    var swiper = new Swiper(".mySwiper", {
        slidesPerView: "auto",
        centeredSlides: true,
        spaceBetween: 100,
    });
}

function loaderAnimation() {
    var loader = document.querySelector("#loader")
    var main = document.querySelector("#main")
    
    // Add a class to indicate loading state
    main.classList.add('loading')
    
    setTimeout(function () {
        loader.style.opacity = "0"
        main.classList.remove('loading')
        setTimeout(function () {
            loader.style.display = "none"
        }, 1000)
    }, 4200)
}

swiperAnimation()
page4Animation()
loaderAnimation()


// Fallback in case script loads before DOM is parsed in future rearrangements
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', psTabs);
}