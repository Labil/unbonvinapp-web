/*
*   Author: Solveig Hansen 2014
*/

var DatabaseHandler = function(){
};

/*
 * Initializes the dbHandler with values of templating script and where to display results
 * config is an object wich should contains template and container, and an array of the page id's
 */
DatabaseHandler.prototype.init = function(config){
    this.api_url = 'http://plainbrain.net/unbonvinapp/php/api.php?';
    
    this.template = config.template;
    this.container = config.container;
    //hardcoded default param --> which is the same as the checkbox that is checked by default.

    this.param = "asc";

    this.wineTypes = ['Rød', 'rød', 'Rose', 'rose', 'Rosé', 'rosé', 'Hvit', 'hvit',
                      'Champagne', 'champagne', 'Dessertvin', 'dessertvin', 'Søtvin',
                      'søtvin', 'Sherry', 'sherry', 'Musserende', 'musserende', 'Akevitt',
                      'akevitt', 'Tokaji', 'tokaji', 'Portvin', 'portvin', 'Hetvin', 'hetvin',
                      'Cognac', 'cognac', 'Oransje', 'oransje', 'Madeira', 'madeira', 'Rom',
                      'rom'];

    //Defaults to searching all wines sort by asc with a limit (see ../php/api.php)
    this.getWines();

    this.setupSearchSubmit();
    this.setupCheckboxClick();

    this.pages = [];
    for(var i = 0; i < config.pages.length; i++){
        this.pages[i] = config.pages[i];
        console.log(this.pages[i]);
    }

    this.setupChangePageListener();

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

DatabaseHandler.prototype.setupInsertSubmit = function(){
    var self = this;
    $('#insert-form').submit(function(evt){
        evt.preventDefault();
        var val = $('#search_box').val();
        var data = {
            name: $('#name').val(),
            type: $('#type').val(),
            grape: $('#grape').val(),
            country: $('#country').val(),
            region: $('#region').val(),
            score: $('#region').val(),
            prodnum: $('#prodnum').val(),
            price: $('#price').val(),
            stars: $('#stars').val(),
            aroma: $('#aroma').val(),
            taste: $('#taste').val(),
            conclusion: $('#conclusion').val(),
            source: $('#source').val()

        }
        self.clearResults();
        self.handleSearch(val);

    });

};

DatabaseHandler.prototype.handleInsert = function(data){

};

DatabaseHandler.prototype.setupChangePageListener = function(){
    var self = this;

    $('#header').find('a').on('click', function(e) {
        e.preventDefault();
        self.changePage($(this).data('page'), $(this).data('pagename'));
    }); 
};

DatabaseHandler.prototype.changePage = function(page, pagename){
    var currPage = parseInt(page);
    this.pages[currPage].show();
    this.pages[currPage].siblings().hide();
    document.title = pagename;
    window.history.pushState({"html":"/" + pagename, "pageTitle": pagename}, "", "http://plainbrain.net/unbonvinapp/index.html/" + pagename);
};

DatabaseHandler.prototype.setupResultClick = function(){
    var clickOpen = function(){
        var first_row = $(this);
        first_row.nextAll(':lt(2)').slideDown(500);
        first_row.off('click');
        first_row.on('click', clickClose);
    };
    var clickClose = function(){
        var first_row = $(this);
        first_row.nextAll(':lt(2)').slideUp(200);
        first_row.off('click');
        first_row.on('click', clickOpen);
    };
    $('.main_result').on('click', clickOpen);
};


DatabaseHandler.prototype.clearResults = function(){
    this.container.empty();
};
//TODO: Add params
DatabaseHandler.prototype.handleSearch = function(value){
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
        console.log("Fant ingen viner");
        this.outputWineNotFound();
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

DatabaseHandler.prototype.outputWineNotFound = function(){
    this.container.append('<table class="no-result-list"><tr><td>Beklager, ingen viner funnet. Prøv igjen med et annet søkeord!</td></tr></table>');
};

DatabaseHandler.prototype.fetch = function(){
    var self = this;
    console.log("this is param at time of fetch: " + this.param);
    if(this.param != undefined) this.req += '&param=' + this.param;
    this.url = this.api_url + this.req;
    console.log(this.url);

    $.getJSON(this.url, function(data){
        if(data.status == "OK"){
            if(data.returned_rows <= 0){
                self.outputWineNotFound();
                return;
            }
            console.log("Data length: " + data.returned_rows);

            self.result = $.map(data.result, function(res){
                return {
                    id: res.id,
                    type: res.type,
                    name: res.name,
                    year: res.year,
                    country: res.country,
                    stars: res.stars,
                    price: res.price,
                    region: res.region,
                    conclusion: res.conclusion + ". ",
                    taste: res.taste + ". ",
                    aroma: res.aroma + ". "
                };

            });

            self.attachTemplate();
        }
    })
    .fail(function(d, textStatus, error){
        console.error("getJSON failed, status: " + textStatus + ", error: "+error)
    });
};

DatabaseHandler.prototype.attachTemplate = function(){
    var template = Handlebars.compile(this.template);
    this.container.append(template(this.result));

    this.setupResultClick();
};