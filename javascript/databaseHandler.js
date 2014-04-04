/*
*   Author: Solveig Hansen 2014
*/

var DatabaseHandler = function(){
};

DatabaseHandler.prototype.init = function(config){
    this.url = 'http://plainbrain.net/unbonvinapp/php/api.php?req=name&name=A';
    console.log(this.url);
    this.template = config.template;
    this.container = config.container;

    this.fetch();
};

DatabaseHandler.prototype.fetch = function(){
    var self = this;
    console.log("fetching");

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
    .done(function(){
        console.log("Done");
    })
    .fail(function(d, textStatus, error){
        console.error("getJSON failed, status: " + textStatus + ", error: "+error)
    })
    .always(function(){
        console.log("always");
    });
};

DatabaseHandler.prototype.attachTemplate = function(){
    var template = Handlebars.compile(this.template);
    this.container.append(template(this.result));
};