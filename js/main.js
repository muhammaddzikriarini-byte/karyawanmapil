document.addEventListener('DOMContentLoaded', function(){
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    // toggle mobile hamburger menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(){
            navToggle.classList.toggle('is-active');
            navMenu.classList.toggle('is-open');
        });

        // Close menu when a link is clicked (mobile)
        var navbarLinks = navMenu.querySelectorAll('.nabvar__link');
        navLinks.forEach(function (link){
            link.addEventListener('click', function (){
                navToggle.classList.remove('is-active');
                navMenu.classList.remove('is-open');
            });
        });
    }

    // Add shadow to navbar after scrolling down a bit
    var navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function (){
        if (window.scrollY > 10 ) {
            navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.26)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
});