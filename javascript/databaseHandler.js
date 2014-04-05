/*
*   Author: Solveig Hansen 2014
*/

var DatabaseHandler = function(){
};

/*
 * Initializes the dbHandler with values of templating script and where to display results
 * config is an object wich should contains template and container
 */
DatabaseHandler.prototype.init = function(config){
    this.api_url = 'http://plainbrain.net/unbonvinapp/php/api.php?';
    
    this.template = config.template;
    this.container = config.container;

    this.wineTypes = ['Rød', 'rød', 'Rose', 'rose', 'Rosé', 'rosé', 'Hvit', 'hvit',
                      'Champagne', 'champagne', 'Dessertvin', 'dessertvin', 'Søtvin',
                      'søtvin', 'Sherry', 'sherry', 'Musserende', 'musserende', 'Akevitt',
                      'akevitt', 'Tokaji', 'tokaji', 'Portvin', 'portvin', 'Hetvin', 'hetvin',
                      'Cognac', 'cognac', 'Oransje', 'oransje', 'Madeira', 'madeira', 'Rom',
                      'rom'];

    //Defaults to searching all wines sort by asc with a limit (see ../php/api.php)
    this.getWines();

    this.setupSearchSubmit();

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

DatabaseHandler.prototype.setupResultClick = function(){
    //var self = this;
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
    //Checks the value against the predefined types
    if(this.wineTypes.indexOf(value) != -1){
        this.getWineByType(value);
    }
};

//optional param contains the current "sort by" checkbox-input
DatabaseHandler.prototype.getWines = function(param){
    this.req = 'req=all';
    this.fetch(param);
};

DatabaseHandler.prototype.getWineByPrice = function(price, param){
    this.req = 'req=price&price=' + price;
    this.fetch(param);
};

DatabaseHandler.prototype.getWineByName = function(name, param){
    this.req = 'req=name&name=' + name;
    this.fetch(param);
};

DatabaseHandler.prototype.getWineByType = function(type, param){
    this.req = 'req=type&type=' + type;
    this.fetch(param);
};

DatabaseHandler.prototype.getWineByYear = function(year, param){
    this.req = 'req=year&year=' + year;
    this.fetch(param);
};

DatabaseHandler.prototype.fetch = function(param){
    var self = this;
    
    if(param != undefined) this.req += 'param=' + param;
    this.url = this.api_url + this.req;
    console.log(this.url);

    $.getJSON(this.url, function(data){
        if(data.status == "OK"){
            console.log("Data returned OK");
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