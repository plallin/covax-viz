var margin = {
        top: 20,
        right: 80,
        bottom: 30,
        left: 80
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%d %b %Y").parse,
    formatDate = d3.time.format("%d %b %Y"),
    bisectDate = d3.bisector(function(d) {
        return d.date;
    }).left;

var x = d3.time.scale()
    .range([0, width]);

var yTotal = d3.scale.linear()
    .range([height, 0]);

var yDayAvg = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yTotalAxis = d3.svg.axis()
    .scale(yTotal)
    .orient("left");

var yDayAvgAxis = d3.svg.axis()
    .scale(yDayAvg)
    .orient("left");

var lineTotal = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.total);
    });

var lineFirstDose = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.first_dose);
    });

var lineSecondDose = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.second_dose);
    });

var linePfizerBiontech = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.pfizer_biontech);
    });

var lineModerna = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.moderna);
    });

var lineAstraZeneca = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yTotal(d.astrazeneca);
    });

var lineDayAvg = d3.svg.line()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yDayAvg(d.rolling_day_avg);
    });

var areaDayAvg = d3.svg.area()
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return yDayAvg(d.rolling_day_avg);
    });

var today = new Date();

var svgTotalVax = d3.select("#graph_total").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svgDayAvg = d3.select("#graph_daily_avg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data.csv", function(error, data) {
    if (error) throw error;

    // read data
    data.forEach(function(d) {
        // console.log(d)
        d.date = parseDate(d.date);
        d.total = +d.total;
        d.rolling_day_avg = +d.rolling_day_avg;
    });

    // sort data by date
    data.sort(function(a, b) {
        return a.date - b.date;
    });

    // date of first vaccine
    firstVax = data[0].date

    // x domain (date) is the same for both graph
    x.domain([firstVax, today]);
    yTotal.domain(
        d3.extent(data, function(d) {
            return d.total;
        }));
    yDayAvg.domain(
        d3.extent(data, function(d) {
            return d.rolling_day_avg;
        }));

    // add x axis
    svgAppendx(svgTotalVax, xAxis)
    svgAppendx(svgDayAvg, xAxis)

    // add y axis
    svgAppendy(svgTotalVax, yTotalAxis, "Total number of vaccines")
    svgAppendy(svgDayAvg, yDayAvgAxis, "Daily vaccines, 7 day average")

    // add line to graph
    svgAppendPath(svgTotalVax, data, "line-total", lineTotal, "total")
    svgAppendPath(svgTotalVax, data, "line-first-dose", lineFirstDose, "first dose")
    svgAppendPath(svgTotalVax, data, "line-second-dose", lineSecondDose, "second dose")
    svgAppendPath(svgTotalVax, data, "line-pfizer-biontech", linePfizerBiontech, "Pfizer BioNTech")
    svgAppendPath(svgTotalVax, data, "line-moderna", lineModerna, "Moderna")
    svgAppendPath(svgTotalVax, data, "line-astrazeneca", lineAstraZeneca, "Astra Zeneca")
    svgAppendPath(svgDayAvg, data, "area", areaDayAvg, "")
    svgAppendPath(svgDayAvg, data, "line", lineDayAvg, "")

    // do mouseover thingy
    var focusTotal = svgAppengg(svgTotalVax)
    var focusFirstDose = svgAppengg(svgTotalVax)
    var focusSecondDose = svgAppengg(svgTotalVax)
    var focusPfizerBiontech = svgAppengg(svgTotalVax)
    var focusModerna = svgAppengg(svgTotalVax)
    var focusAstrazeneca = svgAppengg(svgTotalVax)
    var focusDayAvg = svgAppengg(svgDayAvg)

    var allTotalFocus = [focusTotal, focusFirstDose, focusSecondDose, focusPfizerBiontech, focusModerna, focusAstrazeneca]
    var allTotalValues = ["total", "first_dose", "second_dose", "pfizer_biontech", "moderna", "astrazeneca"]

    svgAppendRect(svgTotalVax, data, width, height, allTotalFocus, x, yTotal, allTotalValues, formatDate)
    svgAppendRect(svgDayAvg, data, width, height, [focusDayAvg], x, yDayAvg, ["rolling_day_avg"], formatDate)

    // add labels
    legend = svgTotalVax.append("g")
        .attr("class","legend")
        .attr("transform","translate(50,30)")
        .style("font-size","12px")
        .call(d3.legend)

    // table
    tabulate(data, ["date", "total", "daily", "rolling_day_avg", "comment"]);
});