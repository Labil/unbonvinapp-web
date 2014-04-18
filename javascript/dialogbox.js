/*
 *  Some popup, dialog and tip boxes
 *  Author: Solveig Hansen 2014
 */

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

        $(markup).hide().appendTo('body').fadeIn();
        $('#popupBox').center();

        setTimeout(function(){
            $.popupbox.hide();
        }, config.time || 3000);
    }

    $.popupbox.hide = function(){
        $('#popupBox').fadeOut(function(){
            $(this).remove();
        });
    }

    /************************* Popup tip with arrow ****************************/

    /* User sends in config.message, and optionally config.title, config.top and config.left displacement values 
        and config.time (how longit should show on screen) */
    $.tipbox = function(config){
        if($('#tipBox').length){
            return false;
        }
        var markup = [
            '<div id="tipBox"><h2>' + config.title + '</h2><p>' + config.message + '</p></div>'
        ].join('');

        $(markup).hide().appendTo('body').fadeIn();
        $('#tipBox').placement(config.top || 500, config.left || 100, null, null, false);

        setTimeout(function(){
            $.tipbox.hide();
        }, config.time || 10000);
    }
    $.tipbox.hide = function(){
        $('#tipBox').fadeOut(function(){
            $(this).remove();
        });
    }

    /************************* back to top button ****************************/

    /* User sends in config.message, and optionally config.top and config.left displacement values */
    $.backToTopButton = function(config){
        if($('#scrollTop').length){
            return false;
        }

        var markup = [
            '<div id="scrollTop">' + config.message + '</div>'
        ].join('');

        $(markup).hide().appendTo('body').fadeIn();
        var elem = $('#scrollTop');
        //default position is bottom right corner, with position:fixed (last param true)
        elem.placementPercent(config.top || null, config.left || null, config.bottom || 10, config.right || 10, config.fixed || true);

        // scroll body back to top on click
        elem.on('click', function(e){
            $('body,html').animate({
                scrollTop: 0,
                complete: function(){
                    $.backToTopButton.hide();
                }
            }, 800);
            e.preventDefault();

        });
    }
    $.backToTopButton.hide = function(){
        $('#scrollTop').fadeOut(function(){
            $('#scrollTop').off();
            $(this).remove();
        });
    }

    /*************************** Loadingbar ************************************/

    $.loadingbar = function(config){
        if($('#loadingbar').length){
            // A confirm is already shown on the page:
            return false;
        }

        var markup = [
            '<div id="loadingbar"><p>' + config.message + '</div>'
        ].join('');

        $(markup).hide().appendTo('body').show();
        $('#loadingbar').center();

    }

    $.loadingbar.hide = function(){
        $('#loadingbar').hide(function(){
            $(this).remove();
        });
    }

})(jQuery);
