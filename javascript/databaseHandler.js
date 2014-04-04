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

    //Defaults to searching all wines sort by asc with a limit (see ../php/api.php)
    this.getWines();

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
                    name: res.name,
                    year: res.year,
                    country: res.country,
                    stars: res.stars,
                    price: res.price
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
};