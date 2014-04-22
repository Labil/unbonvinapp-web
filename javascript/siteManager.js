/*
 * Author: Solveig Hansen 2014
 */

var SiteManager = function(){
	this.dbHandler;
	this.currentPage;
};

SiteManager.prototype.init = function(){
	this.isLoggedIn = false;
	this.checkLoggedIn();
	//Default subpage
	this.loadPage("search.html");

	this.setupChangePageListener();
	this.setupScrollHandler();
	this.setupWindowResizeHandler();
	this.handleWindowStartWidth();
};

/* This bloated function handles a lot of different screen/window sizes */
SiteManager.prototype.setupWindowResizeHandler = function(){
	var self = this;
	$(window).on('resize', function(){
	      var win = $(this); //this = window
	      var logo = $('#logo');
	      var menu = $('.horizontal');
	      var contentContainer = $('#content');
	      var filterLi = $('ul.filter li.marginright');
	      var menuLi = $('ul.horizontal li.marginright');

	      if(win.width() < 900){
	      	
	      		$('h4').css('font-size', '20px');
	      }
	      else if(win.width() > 900){
	      		$('h4').css('font-size', '29px');
	      }
	      if(win.width() <= 800){
	      		logo.hide();
	      		self.hideSearchTip();
	      		menu.css('margin-left', '0');
	        	menuLi.css('margin-right', '50px');
	        	filterLi.css('margin-right', '7px');
	        	contentContainer.css('width', '95%');

	      }
	      else if(win.width() <= 1200){
	        	logo.hide();
	        	self.hideSearchTip();
	        	menu.css('margin-left', '0');
	        	menuLi.css('margin-right', '120px');	
	        	contentContainer.css('width', '95%');
	        	filterLi.css('margin-right', '25px');
	      }
	      else if(win.width() <= 1300){
	      		logo.show();
	      		menu.css('margin-left', logo.outerWidth()/3 + "px");
	      		menuLi.css('margin-right', '30px');
	      		contentContainer.css('width', '95%');
	      		filterLi.css('margin-right', '30px');
	      }
	      else if(win.width() <= 1550){
	      		logo.show();
	      		menu.css('margin-left', logo.outerWidth()/3 + "px");
	      		menuLi.css('margin-right', '65px');
	      		contentContainer.css('width', '85%');
	      		filterLi.css('margin-right', '30px');
		  }
	      else if(win.width() > 1500){
	      		logo.show();
	      		menu.css('margin-left', '0');
	      		menuLi.css('margin-right', '120px');
	      		contentContainer.css('width', '75%');
	      		filterLi.css('margin-right', '30px');
	      }
	});
};

/* Forces the resize event to trigger on page load */
SiteManager.prototype.handleWindowStartWidth = function(){
	$(window).trigger('resize');
};

SiteManager.prototype.setupChangePageListener = function(){
    var self = this;
   
    $('#header').find('a').on('click', function(e) {
        e.preventDefault();
        self.loadPage($(this).attr('href'));
    }); 

    //document.title = pagename;
    //window.history.pushState({"html":"/" + pagename, "pageTitle": pagename}, "", "http://plainbrain.net/unbonvinapp/index.html/" + pagename);
};

SiteManager.prototype.checkLoggedIn = function(){
	var self = this;
	$.getJSON('http://plainbrain.net/unbonvinapp/php/sessions.php?', function(data){
		console.log("Is logged in: " + data.is_logged_in);
	    self.isLoggedIn = data.is_logged_in;
	})
	.fail(function(d, textStatus, error){
	    console.error("Checking if logged in failed in sessions.php, status: " + textStatus + ", error: "+error);
	});
};

SiteManager.prototype.loadPage = function(href, optionalQry){
	this.currentPage = href;
	//If a search query is not sent in, it will be an empty string and the default search will be for all wines
	if(optionalQry == undefined){
		optionalQry = '';
	}
	//hides the tip box if there is one on display before changing page
	$.tipbox.hide();
	var self = this;
	if(this.isLoggedIn == false){
		if(href == 'add.html'){
			href = 'not_logged_in.html';
		}
	}
    $('#content').load(href + ' .content', function(){
    	//Reset the page scrolling so that top of content shows when changing page
    	//Use this over window.scrollTo(0, 0) because else the scroll event handler 
    	//won't trigger and the back to top-button will bug out
    	$('body,html').animate({
    	    scrollTop: 0,
    	}, 100);
    	self.runScript(href, optionalQry);
    	
    });
};

SiteManager.prototype.showSearchTip = function(title, message){
	var winW = $(window).width();
	//No tip on too small screens, it doesn't fit anywhere
	if(winW < 1300){
		return;
	}
	var headerH =  $('#header').outerHeight() + 10;
	$.tipbox({
	    'message'   : message,
	    'title' : title,
	    'top' : headerH,
	    'left' : 50,
	    'time' : 15000
	});
};

SiteManager.prototype.hideSearchTip = function(){
	$.tipbox.hide();
};

SiteManager.prototype.setupScrollHandler = function(){

	var self = this;
	var toTopVisible = false;

	$(window).scroll(function(event){
		var scrollTop = $(window).scrollTop();
		if(scrollTop > 300 && toTopVisible == false){
			self.toggleScrollToTop();
			toTopVisible = true;
		}
		else if(scrollTop < 100 && toTopVisible == true){
			self.toggleScrollToTop();
			toTopVisible = false;
		}
	});
};

SiteManager.prototype.toggleScrollToTop = function(){
	if($.backToTopButton({
		'message' : 'Tilbake til toppen',
		'bottom' : 10,
		'left' : 5 
	}) == false){
		$.backToTopButton.hide();
	}
};

SiteManager.prototype.runScript = function(href, qry){

	if(this.dbHandler == undefined){
		//console.log("dbHandler not yet defined... initializing");
		this.dbHandler = new DatabaseHandler(this);
	}

	if(href == "search.html"){
		
		this.dbHandler.init({
		    template: $('#winelist-template').html(),
		    container: $('#results'),
		    qryType: "",
		    searchQry: qry,
		    page: "search",
		    isLoggedIn : this.isLoggedIn
		});	

		this.showSearchTip("Søketips", "Søk etter vin ved å skrive inn enten navn på vinen, årstall, eller pris. Sistnevnte gir deg alle viner under gitte pris.");

	}
	else if(href == "edit.html"){
		this.dbHandler.init({
			template: $('#edit-template').html(),
			container: $('#edit'),
			qryType: "id",
			searchQry: qry,
			page: "edit"
		});
	}
	else if(href =="add.html"){
		this.dbHandler.setupSubmit("insert");
	}
	else if(href == "not_logged_in.html"){
		this.dbHandler.setupLoginButton();
	}
	

}