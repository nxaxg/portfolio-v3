$(document).ready(function () {
    //FUNC:
    //Colapsables
    $('[data-action="collapsesibling"]').click(function (e) {
        e.preventDefault();
        $(this).siblings('[data-module="collapse-body"]').slideToggle();
        $(this).toggleClass('deployed');
    });
    $('[data-action="collapsetarget"]').click(function (e) {
        e.preventDefault();
        $(this).parent().find('[data-module="collapse-body"]').slideToggle();
        $(this).toggleClass('deployed');
    });
    
});