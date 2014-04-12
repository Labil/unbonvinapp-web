/*
 * Author: Solveig Hansen 2014
 */

var SiteManager = function(){
	this.dbHandler;
};

SiteManager.prototype.init = function(){

	this.setupChangePageListener();
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

SiteManager.prototype.loadPage = function(href){
	var self = this;
    $('#content').load(href + ' .content', function(){
    	console.log("Page finished loading");
    	self.runScript(href);

    });
};

SiteManager.prototype.runScript = function(href){

	if(href == "search.html"){
		if(this.dbHandler == undefined){
			console.log("dbHandler not yet defined... initializing");
			this.dbHandler = new DatabaseHandler();
		}
		this.dbHandler.init({
		    template: $('#winelist-template').html(),
		    container: $('#results')
		});	
	}
}