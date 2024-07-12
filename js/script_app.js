document.addEventListener("DOMContentLoaded", function () {

    const $buttonMobileApp = document.querySelector('.in__button_mobile');
    const $sidebar = document.querySelector('.in__main_siderbar');
    const $sidebarClose = document.querySelector('.in__main_siderbar_footer_mobile');

    $buttonMobileApp.addEventListener('click', () => {
        $sidebar.classList.add('active')
    })
    $sidebarClose.addEventListener('click', () => {
        $sidebar.classList.remove('active')
    })
})  