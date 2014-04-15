/*
 * Author: Solveig Hansen 2014
 */

var SiteManager = function(){
	this.dbHandler;
};

SiteManager.prototype.init = function(){

	this.setupChangePageListener();
	//Default page is search
	//this.loadPage("search.html");
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
		console.log("optionalQry is undefined...");
		optionalQry = '';
	}
	var self = this;
    $('#content').load(href + ' .content', function(){
    	console.log("Page finished loading");
    	self.runScript(href, optionalQry);

    });
};


SiteManager.prototype.runScript = function(href, qry){

	if(this.dbHandler == undefined){
		console.log("dbHandler not yet defined... initializing");
		this.dbHandler = new DatabaseHandler(this);
	}

	if(href == "search.html"){
		
		this.dbHandler.init({
		    template: $('#winelist-template').html(),
		    container: $('#results'),
		    qryType: "",
		    searchQry: qry
		});	
	}
	else if(href == "edit.html"){
		console.log("Qry in runScript:" + qry);
		this.dbHandler.init({
			template: $('#edit-template').html(),
			container: $('#edit'),
			qryType: "id",
			searchQry: qry
		});
	}
	else if(href =="add.html"){
		this.dbHandler.setupHandleInsert();
	}
}