/*
*   Author: Solveig Hansen 2014
*/
/* Creates the handler and initializes some values that should be available from the beginning and not be reloaded 
 * @siteMgr is the manager that is in charge of changing subpages when user clicks on naviagtion menu
 * @wineTypes defines all the different types of wines, to be used when user inputs search query
 * @api_url is the url to the server api
 */
var DatabaseHandler = function(siteMgr){
    this.siteMgr = siteMgr;

    this.wineTypes = ['Rød', 'rød', 'Rose', 'rose', 'Rosé', 'rosé', 'Hvit', 'hvit',
                      'Champagne', 'champagne', 'Dessertvin', 'dessertvin', 'Søtvin',
                      'søtvin', 'Sherry', 'sherry', 'Musserende', 'musserende', 'Akevitt',
                      'akevitt', 'Tokaji', 'tokaji', 'Portvin', 'portvin', 'Hetvin', 'hetvin',
                      'Cognac', 'cognac', 'Oransje', 'oransje', 'Madeira', 'madeira', 'Rom',
                      'rom'];
    this.api_url = 'http://plainbrain.net/unbonvinapp/php/api.php?';
};

/*
 * Initializes the dbHandler with values of templating script and where to display results
 * config is an object wich should contains template and container
 */
DatabaseHandler.prototype.init = function(config){
    
    this.template = config.template;
    this.container = config.container;
    this.param = $('#filter input:checked').val(); //default filter
    this.lastQuery = "";//last search value for reload after delete
    //Loading edit page
    if(config.qryType == "id"){
        this.getWineById(config.searchQry);
    }
    //Loading search page
    else{
        //If searchQuery is empty, it will query all wines by default
        this.handleSearch(config.searchQry);
        this.setupSearchSubmit();
        this.setupCheckboxClick();
    }
};

DatabaseHandler.prototype.setupCheckboxClick = function(){
    var self = this;
    $('.checkbox').on('click', function(){
        if($(this).is(':checked')){
            $('input:checkbox').removeAttr('checked'); //clears all checkboxes
            this.checked = true; //Adds check to this
            self.param = this.value;
        }
        else self.param = "";
    });
};

DatabaseHandler.prototype.setupSearchSubmit = function(){
    var self = this;
    $('#search_form').submit(function(evt){
        evt.preventDefault();
        var val = $('#search_box').val();
        self.clearResults();
        self.handleSearch(val);
    });
};

DatabaseHandler.prototype.toggleLoadingBar = function(){
    if($.loadingbar({
        'message' : 'Laster inn viner...'
    }) != false){}
    else $.loadingbar.hide();
};

DatabaseHandler.prototype.clearMessages = function(){
    $('.message').empty();
};

DatabaseHandler.prototype.reloadSearchAfterDelete = function(){
    $('#search_box').val(this.lastQuery);
    this.handleSearch(this.lastQuery);
};

DatabaseHandler.prototype.clearResults = function(){
    this.container.empty();
};

DatabaseHandler.prototype.setupSubmit = function(type){
    if(type == "edit"){
        var req = 'req=edit';
        var successMsg = 'Endringene ble lagret.';
        var failMsg = 'Oops, noe gikk galt. Endringene ble ikke lagret. Prøv igjen :)';
    }
    else if(type == "insert"){
        var req = 'req=insert';
        var successMsg = 'Vinen ble lagt til';
        var failMsg = 'Oops, noe gikk galt. Vinen ble ikke lagt til. Prøv igjen :)';
    }
    else return;

    var notDoneMsg = 'Vennligst fyll inn alle obligatoriske felter først :)';
    var form = $('#insert-form');
    var self = this;

    form.submit(function(evt){
        evt.preventDefault();
        //Some simple check that the minimum required fields are filled in:
        if($('#id').val() == "" || $('#type').val() == "" || $('#stars').val() == ""){
            self.popupMessage(notDoneMsg);
            return;
        }
        var formdata = form.serialize(); //Makes data into a string to be passed with ajax
        
        $.post(self.api_url + req, formdata, function(response) {
            self.clearMessages();
            if(type == "insert")
                form.find('input').val(''); //clears the form of previous entries
            //TODO here it can be a dialog box with a quetion about returning to the search results or staying on the page
            self.popupMessage(successMsg);

        })
        .fail(function(d, textStatus, error) {
            self.clearMessages();
            self.popupMessage(failMsg);
            console.error("The request failed, status: " + textStatus + ", error: "+error);
        });
    });
};

/* When user clicks on "edit wine" in wine result list */
DatabaseHandler.prototype.handleEditRequest = function(wineId){
    if(wineId == "" || wineId == null){
        this.popupMessage("Vinen du prøver å endre har ikke noen gyldig id... Legg inn vinen på nytt i stedet.");
        return;
    }
    this.siteMgr.loadPage("edit.html", wineId);
};

DatabaseHandler.prototype.handleDeleteRequest = function(wineId){
    var self = this;

    $.dialogbox({
        'message'   : 'Er du sikker på at du ønsker å slette denne vinen?',
        'buttons'   : {
            'Slett'   : {
                //Now this is dependent on flatUI for the button styling, 
                //should be specified in the dialogbox.css instead, but I'm lazy for the moment
                'class' : 'btn btn-block btn-lg btn-danger',
                'action': function(){
                    self.deleteWine(wineId);
                }
            },
            'Avbryt'    : {
                'class' : 'btn btn-block btn-lg btn-default',
                'action': function(){}  // Nothing to do in this case. Might delete this action
            }
        }
    });
};

DatabaseHandler.prototype.deleteWine = function(wineId){
    var self = this;

    $.post(self.api_url + "req=delete", { id : wineId}, function(response) {
        self.clearMessages();
        self.clearResults();
        self.popupMessage("Vinen ble slettet.");
        self.reloadSearchAfterDelete();

    })
    .fail(function() {
        self.clearMessages();
        self.popupMessage('Oops, noe gikk galt. Vinen ble ikke slettet. Prøv igjen :)');
    });
};

DatabaseHandler.prototype.setupEditDeleteListeners = function(wineId){
    var self = this;
    $('.result-list').find('a.'+ wineId).on('click', function(e){
        e.preventDefault();
        var type = $(this).data('func');

        if(type == "edit") self.handleEditRequest(wineId);
        else if(type == "delete") self.handleDeleteRequest(wineId);
    });
};

DatabaseHandler.prototype.setupResultClick = function(){
    var self = this;
    var clickOpen = function(){
        var clicked = $(this);
        clicked.nextAll(':lt(2)').slideDown(500);
        clicked.off('click');
        clicked.on('click', clickClose);
        var wineId = clicked[0].id;
        self.setupEditDeleteListeners(wineId);
    };
    var clickClose = function(){
        var clicked = $(this);
        clicked.nextAll(':lt(2)').slideUp(200);
        clicked.off('click');
        clicked.on('click', clickOpen);
    };
    $('.main_result').on('click', clickOpen);
};

DatabaseHandler.prototype.handleSearch = function(value){
    this.clearMessages();
    this.lastQuery = value;
    //Search for year
    if(value.search(/^\d{4}$/) != -1){
        //No wines from before 1900s in this DB -> assuming it is searhing for expensive wine
        //Unless first digit it 2, then it could be 2010
        if(parseInt(value[1]) != 0 && parseInt(value[1]) < 9)
            this.getWineByPrice(value);
        else
            this.getWineByYear(value);
    }
    //Gets wines where price is less than value
    else if(value.search(/^\d{2}$/) != -1 || value.search(/^\d{3}$/) != -1){
        this.getWineByPrice(value);
    }
    //Checks the value against the predefined types (Red, white etc)
    else if(this.wineTypes.indexOf(value) != -1){
        this.getWineByType(value);
    }
    else if(value.search(/^[A-Za-z]/) != -1){
        this.getWineByName(value);
    }
    else if(value.length > 0){
        this.outputMessage("Beklager, søkeordet er ugyldig. Prøv igjen med et annet søkeord!");
    }
    else{
        //Else just queries for all wines
        this.getWines();
    }
};

/*DatabaseHandler.prototype.insertNewWine = function(){
    this.req = 'req=insert';
};*/

//optional param contains the current "sort by" checkbox-input
DatabaseHandler.prototype.getWines = function(){
    this.req = 'req=all';
    this.fetch();
};

DatabaseHandler.prototype.getWineByPrice = function(price){
    this.req = 'req=price&price=' + price;
    this.fetch();
};

DatabaseHandler.prototype.getWineByName = function(name){
    this.req = 'req=name&name=' + name;
    this.fetch();
};

DatabaseHandler.prototype.getWineByType = function(type){
    this.req = 'req=type&type=' + type;
    this.fetch();
};

DatabaseHandler.prototype.getWineByYear = function(year){
    this.req = 'req=year&year=' + year;
    this.fetch();
};

DatabaseHandler.prototype.getWineById = function(id){
    this.req = 'req=id&id=' + id;
    this.fetch();
};

DatabaseHandler.prototype.popupMessage = function(message){
    $.popupbox({
        'message'   : message
    });
};

DatabaseHandler.prototype.outputMessage = function(message){

    if($('.no-result-list').length){
        // There is already a message on display, so we should just add our message to that table
        $('.no-result-list').append('<td>' + message + '</td>');
    }
    else{
        $('.message').append('<table class="no-result-list"><tr><td>' + message +'</td></tr></table>');
        //$( '.message' ).slideDown(400).delay(2000).slideUp(200).fadeOut(200);
        $( '.message' ).slideDown();
    }
};

DatabaseHandler.prototype.fetch = function(){
    var self = this;
    this.toggleLoadingBar();

    if(this.param != undefined) this.req += '&param=' + this.param;
    this.url = this.api_url + this.req;
    //console.log(this.url);
    $.getJSON(this.url, function(data){
        if(data.status == "OK"){
            if(data.returned_rows <= 0){
                self.toggleLoadingBar();
                self.outputMessage('Beklager, ingen viner funnet. Prøv igjen med et annet søkeord!');
                return;
            }
            self.result = $.map(data.result, function(res){
                //Makes sure we have a type for it is used to display the colored border beneath each wine
                if(res.type == "" || res.type == null){
                    res.type = "Annet";  
                } 
                return {
                    id: res.id,
                    type: res.type,
                    name: res.name,
                    year: res.year,
                    grape: res.grape,
                    country: res.country,
                    stars: res.stars,
                    price: res.price,
                    region: res.region,
                    score: res.score,
                    prodnum: res.prodnum,
                    conclusion: res.conclusion,
                    taste: res.taste,
                    aroma: res.aroma,
                    source: res.source
                };
            });
            self.attachTemplate();
            //Turns the loading bar off after search is done
            self.toggleLoadingBar();

            if(self.siteMgr.currentPage == "search.html")
                self.setupResultClick();
            else if(self.siteMgr.currentPage == "edit.html")
                self.setupSubmit('edit');
        }
    })
    .fail(function(d, textStatus, error){
        self.clearMessages();
        self.toggleLoadingBar();
        self.outputMessage('Beklager, noe gikk galt med forespørselen din. Prøv igjen, og eventuelt kontakt systemadministrator hvis feilen vedvarer!');
        console.error("getJSON failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.attachTemplate = function(){
    var template = Handlebars.compile(this.template);
    this.container.append(template(this.result));
};