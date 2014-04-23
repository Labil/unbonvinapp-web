/*
 * Author: Solveig Hansen, 2014
 */

var BarChart = function(winedata, container){
	var data = winedata.slice();
	var colors = {
		'Rød':'#690b19',
		'Hvit': '#f9d37e',
		'Rose': '#ea9aa7',
		'Annet': '#AAAAAA',
		'Champagne': '#f9e4d1',
		'Dessertvin': '#ffb19a',
		'Søtvin': '#ba2e40',
		'Sherry': '#cc1164',
		'Musserende': '#ffb19a',
		'Akevitt': '#f3e9dd',
		'Portvin': '#640d15',
		'Tokaji':'#c96f00',
		'Hetvin':'#531e24',
		'Cognac':'#983a0c',
		'Oransje':'#983a0c',
		'Madeira':'#982900',
		'Rom':'#5c0027'
	};
	//console.log(data);

	var width = 960,
		height = 500,
		radius = Math.min(width, height) / 2;
	
	var arc = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(0);

	var pie =d3.layout.pie()
		.sort(null)
		.value(function(d){
			return d.frequency;
		});

	var svg = d3.select(container).append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width/2 +
			"," + height/2 + ")");


	var g = svg.selectAll(".arc")
		.data(pie(data))
		.enter()
		.append("g")
		.attr("class", "arc");

	g.append("path")
		.attr("d", arc)
		.style("fill", function(d, i){
			return colors[data[i].type];
		})
		.on("mouseover", function(d) {
	        svg.append("path")
	          .attr("d", d3.select(this).attr("d"))
	          .attr("id", "arcSelection")
	          .style("fill", "none")
	          .style("stroke", "#fff")
	          .style("stroke-width", 2);
	    })
		.on("mouseout", function(d) {
		    d3.select("#arcSelection").remove();
		});
	
	g.append("text")
		.attr("transform", function(d) { 
			return "translate(" + arc.centroid(d) + ")"; 
		})
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text(function(d, i){
			return data[i].type;
		});

/////////////////////////////////////////////////	
	/*var w = 960, h = 500;

	var svg = d3.select(container)
		.append("svg")
		.attr("width", w)
		.attr("height", h);

	var max_count = 0;
	for(var d in data){
		console.log(data[d].frequency);
		max_count = Math.max(data[d].frequency, max_count);
	}

	var dx = w / max_count;
	var dy = h / data.length;

	//bars
	var bars = svg.selectAll(".bar")
		.data(data)
		.enter()
		.append("rect")
		.attr("class", function(d, i){
			return "bar " + d.type;
		})
		.attr("x", function(d, i){
			return 0;
		})
		.attr("y", function(d, i){
			return dy * i;
		})
		.attr("width", function(d, i){
			return dx * d.frequency;
		})
		.attr("height", dy);

	//labels
	var text = svg.selectAll("text")
		.data(data)
		.enter()
		.append("text")
		.attr("x", 5)
		.attr("y", function(d, i){
			return dy * i + 15;
		})
		.text(function(d){
			return d.type + " (" + d.frequency + ")";
		})
		.attr("font-size", "15px")
		.style("font-weigth", "bold");*/

////////////////////////////////////////////////////
	
	/*var margin = {
		top: 40,
		right: 20,
		bottom: 30,
		left: 40
	};
	var width = 960 - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;
	var formatPercent = d3.format(".0%");
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);
	var y = d3.scale.linear()
		.range([height, 0]);
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickFormat(formatPercent);
	
	var svg = d3.select(container).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," +
			margin.top + ")");

	d3.tsv("data.tsv", type, function(error, data){
		x.domain(data.map(function(d){
			return d.type;
		}));
		y.domain([0, d3.max(data, function(d){
			return d.frequency;
		})]);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Frequency");

		svg.selectAll(".bar")
			.data(data)
			.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(d){
					return x(d.type);
				})
				.attr("width", x.rangeBand())
				.attr("y", function(d){
					return y(d.frequency);
				})
				.attr("height", function(d){
					return height - y(d.frequency);
				});
	});

	function type(d){
		d.frequency = +d.frequency;
		return d;
	}*/
};