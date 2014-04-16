(function($){

    $.dialogbox = function(config){
        if($('#dialogOverlay').length){
            // A confirm is already shown on the page:
            return false;
        }
        var buttonHTML = '';
        $.each(config.buttons,function(name,obj){

            // Generating the markup for the buttons:

            buttonHTML += '<a href="#" class="button '+obj['class']+'">'+name+'<span></span></a>';

            if(!obj.action){
                obj.action = function(){};
            }
        });

        var markup = [
            '<div id="dialogOverlay">',
            '<div id="dialogBox">',
            '<p>',config.message,'</p>',
            '<div id="dialogButtons">',
            buttonHTML,
            '</div></div></div>'
        ].join('');

        $(markup).hide().appendTo('body').fadeIn();
        $('#dialogBox').center();

        var buttons = $('#dialogBox .button'),
            i = 0;

        buttons[buttons.length-1].focus();

        $.each(config.buttons,function(name,obj){
            buttons.eq(i++).click(function(){

                // Calling the action attribute when a
                // click occurs, and hiding the dialogbox.

                obj.action();
                $.dialogbox.hide();
                return false;
            });
        });
    }

    $.dialogbox.hide = function(){
        $('#dialogOverlay').fadeOut(function(){
            $(this).remove();
        });
    }


    /*************************** Popup ************************************/

    $.popupbox = function(config){
        if($('#popupBox').length){
            // A confirm is already shown on the page:
            return false;
        }

        var markup = [
            '<div id="popupBox"><p>' + config.message +'</p></div>'
        ].join('');

        $(markup).hide().center().appendTo('body').fadeIn();
        $('#popupBox').center();

        setTimeout(function(){
            $.popupbox.hide();
        }, 3000);
    }

    $.popupbox.hide = function(){
        $('#popupBox').fadeOut(function(){
            $(this).remove();
        });
    }

})(jQuery);
