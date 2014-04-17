/*
 * Author: Solveig Hansen 2014
 */

var SiteManager = function(){
	this.dbHandler;
};

SiteManager.prototype.init = function(){
	
	this.setupChangePageListener();
	//this.currPage = "search.html";
};

SiteManager.prototype.setupChangePageListener = function(){
    var self = this;
    //Default subpage
    this.loadPage("search.html");


    $('#header').find('a').on('click', function(e) {
        e.preventDefault();
        self.loadPage($(this).attr('href'));
    }); 

    //document.title = pagename;
    //window.history.pushState({"html":"/" + pagename, "pageTitle": pagename}, "", "http://plainbrain.net/unbonvinapp/index.html/" + pagename);
};

SiteManager.prototype.loadPage = function(href, optionalQry){
	//If a search query is not sent in, it will be an empty string and the default search will be for all wines
	if(optionalQry == undefined){
		optionalQry = '';
	}
	//hides the tip box if there is one on display before changing page
	$.tipbox.hide();
	//this.currPage = href;
	var self = this;
    $('#content').load(href + ' .content', function(){
    	//Reset the page scrolling so that top of content shows when changing page
    	window.scrollTo(0, 0);
    	self.runScript(href, optionalQry);
    	
    });
};

SiteManager.prototype.showTip = function(title, message){
	$.tipbox({
	    'message'   : message,
	    'title' : title,
	    'top' : 345,
	    'left' : 50,
	    'time' : 15000
	});
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
		    page: "search"
		});	

		this.setupScrollHandler();

		this.showTip("Søketips", "Søk etter vin ved å skrive inn enten navn på vinen, årstall, eller pris. Sistnevnte gir deg alle viner under gitte pris.");
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
		this.dbHandler.setupHandleInsert();
	}

}