/*
*   Author: Solveig Hansen 2014
*/

var DatabaseHandler = function(siteMgr){
    this.siteMgr = siteMgr;
    this.currPage = "";

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
    //hardcoded default param --> which is the same as the checkbox that is checked by default.
    this.param = "asc";
    this.lastQuery = "";
    if(config.qryType == "id"){
        this.getWineById(config.searchQry);
    }
    else{
        //If searchQuery is empty, it will query all wines by default
        this.handleSearch(config.searchQry);
    }

    this.currPage = config.page;

    this.setupSearchSubmit();
    this.setupCheckboxClick();

};

DatabaseHandler.prototype.setupCheckboxClick = function(){
    var self = this;
    $('.checkbox').on('click', function(){
        if($(this).is(':checked')){
            $('input:checkbox').removeAttr('checked'); //clears all checkboxes
            this.checked = true; //Adds check to this
            self.param = this.value;
        }
        else{
            console.log("Checkbox unchecked");
            self.param = "";
        }
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

DatabaseHandler.prototype.setupHandleInsert = function(){
    var form = $('#insert-form');
    var self = this;

    form.submit(function(evt){
        evt.preventDefault();
        var formdata = form.serialize(); //Makes data into a string to be passed with ajax
        var dataObj = form.serializeObject(); //Make form data into a js object, might send object with ajax, TODO: clean this up
        
        $.post(self.api_url + "req=insert", formdata, function(response) {
            console.log(response);
            self.clearMessages();
            form.find('input').val(''); //clears the form of previous entries
            self.outputMessage('Vinen ble lagt til');

        })
        .fail(function() {
            self.clearMessages(d, textStatus, error);
            self.outputMessage('Oops, noe gikk galt. Vinen ble ikke lagt til. Prøv igjen :)');
            console.error("The request failed, status: " + textStatus + ", error: "+error);
        });
        
    });
};
/* These two should maybe be  refactored and joined but for now I'm just getting stuff to work */
DatabaseHandler.prototype.setupHandleEdit = function(){
    console.log("Setting up hadnling edig");
    var form = $('#insert-form');
    console.log(form);
    var self = this;

    form.submit(function(evt){
        evt.preventDefault();
        var formdata = form.serialize(); //Makes data into a string to be passed with ajax
        var dataObj = form.serializeObject(); //Make form data into a js object, might send object with ajax, TODO: clean this up
        
        $.post(self.api_url + "req=edit", formdata, function(response) {
            console.log(response);
            self.clearMessages();
            //form.find('input').val(''); //clears the form of previous entries
            self.outputMessage('Endringene ble lagret.');

        })
        .fail(function(d, textStatus, error) {
            self.clearMessages();
            self.outputMessage('Oops, noe gikk galt. Endringene ble ikke lagret. Prøv igjen :)');
            console.error("The request failed, status: " + textStatus + ", error: "+error);
        });
    });
};

/* When user clicks on "edit wine" in wine result list */
DatabaseHandler.prototype.handleEditRequest = function(wineId){
    if(wineId == "" || wineId == null){
        this.outputMessage("Vinen du prøver å endre har ikke noen gyldig id... Legg inn vinen på nytt i stedet.");
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
        self.outputMessage("Vinen ble slettet.");
        self.reloadSearchAfterDelete();

    })
    .fail(function() {
        self.clearMessages();
        self.outputMessage('Oops, noe gikk galt. Vinen ble ikke slettet. Prøv igjen :)');
    });
};

DatabaseHandler.prototype.clearMessages = function(){
    $('.message').empty();
};

DatabaseHandler.prototype.reloadSearchAfterDelete = function(){
    $('#search_box').val(this.lastQuery);
    this.handleSearch(this.lastQuery);
};

//TODO: clean up this method
DatabaseHandler.prototype.setupResultClick = function(){

    var self = this;

    var clickOpen = function(){
        var first_row = $(this);
        first_row.nextAll(':lt(3)').slideDown(500);
        first_row.off('click');
        first_row.on('click', clickClose);

        var wineId = first_row[0].id;
        //var wineName = first_row.data('name');
        $('.result-list').find('a.'+wineId).on('click', function(e){
            e.preventDefault();
            var type = $(this).data('func');

            if(type == "edit"){
                self.handleEditRequest(wineId);
            }
            else if(type == "delete"){
                self.handleDeleteRequest(wineId);
                

            }
        });
    };
    var clickClose = function(){
        var first_row = $(this);
        first_row.nextAll(':lt(3)').slideUp(200);
        first_row.off('click');
        first_row.on('click', clickOpen);
    };
    $('.main_result').on('click', clickOpen);
};


DatabaseHandler.prototype.clearResults = function(){
    this.container.empty();
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
    //TODO: fix better regex... I suck at regex :p
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

DatabaseHandler.prototype.insertNewWine = function(){
    this.req = 'req=insert';
};

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

DatabaseHandler.prototype.outputMessage = function(message){
    if($('.no-result-list').length){
        // There is already a message on display, so we should just add our message to that table
        $('.no-result-list').append('<td>' + message + '</td>');
    }
    else{
        $('.message').append('<table class="no-result-list"><tr><td>' + message +'</td></tr></table>');
        $( '.message' ).slideDown(400).delay(2000).slideUp(200).fadeOut(200);

    }
};

DatabaseHandler.prototype.fetch = function(){
    var self = this;
    if(this.param != undefined) this.req += '&param=' + this.param;
    this.url = this.api_url + this.req;
    console.log(this.url);

    $.getJSON(this.url, function(data){
        if(data.status == "OK"){
            if(data.returned_rows <= 0){
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

            if(self.currPage == "search"){
                self.setupResultClick();
            }
            else if(self.currPage == "edit"){
                self.setupHandleEdit();
            }
        }
    })
    .fail(function(d, textStatus, error){
        self.clearMessages();
        self.outputMessage('Beklager, noe gikk galt med forespørselen din. Prøv igjen, og eventuelt kontakt systemadministrator hvis feilen vedvarer!');
        console.error("getJSON failed, status: " + textStatus + ", error: "+error);
    });
};

DatabaseHandler.prototype.attachTemplate = function(){
    var template = Handlebars.compile(this.template);
    this.container.append(template(this.result));
};