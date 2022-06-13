$(document).ready(function () {

    $(window).on('click', function(e) {
        $('#sidebar').removeClass('visible');
    });

    $('#sidebarCollapse').on('click', function(event) {
        event.stopPropagation();
        $('#sidebar').toggleClass('visible');
    });

});