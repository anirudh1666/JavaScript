const DUMMY_DATA = [
    {id: 'd1', value: 10, region: 'USA'},
    {id: 'd2', value: 11, region: 'India'},
    {id: 'd3', value: 12, region: 'China'},
    {id: 'd4', value: 6, region: 'Germany'},
];
/*
d3.select('div')         // select to select single element, selectAll to select all. can do select(".class"), select("#id")
  .selectAll('p')        // select all elements within div.
  .data(DUMMY_DATA)       // bind select to data. typically an array.
  .enter()               // give me all missing 'p' that the data is bound. 3 missing in this case.
  .append('p')           // append all missing 'p'.
  .text(data => data.region);    // for each data elem add text to the selected 'p' where text = data elem.*/

/* for svg we use scaling so we use d3-scale to hel;pl us figure out positioning of d3.js svgs.*/ 
const xScale = d3.scaleBand()                // scaleBand = uniform distribution. all bars have same width.
                 .domain(DUMMY_DATA.map(point => point.region))   // tells scaling how many items we have
                 .rangeRound([0, 250])      // put range of div.
                 .padding(0.1);            // adds padding between bars.

const yScale = d3.scaleLinear()            // calculates the different heights.
                 .domain([0, 15])        // lowest and highest value in DUMMY_DATA.
                 .range([200, 0]);       // height in px. since it starts from top-left we switch it so we get it right way round.

const container = d3.select('svg')      // change to 'div' for other way.
                    .classed('container', true)              // use css class e.g. .classed('class_name', true). false if u dont want to add it.
                    .style('border', '1px solid red');       // add css styles. 

                    
/* Select all .bar classes. At the start tehre are none. Bind dummy data to each selected element.
   Then append 'div' in class .bar if there are any missing. In this case it will add 4 divs. use css style
   bar and dispaly = true. then we set the .bar styles.
const bars = container.selectAll('.bar')     
                      .data(DUMMY_DATA)
                      .enter()
                      .append('div')
                      .classed('bar', true)
                      .style('width', '50px')
                      .style('height', data => (data.value * 15) + 'px');*/

/* Now we do it change html div box to svg. svg uses coordinate system so is better for charts.*/

const bars = container.selectAll('.bar')     
                      .data(DUMMY_DATA)
                      .enter()
                      .append('rect')
                      .classed('bar', true)
                      .attr('width', xScale.bandwidth())
                      .attr('height', data => 200 - yScale(data.value))       // since it starts from top left you need to minus
                      .attr('x', data => xScale(data.region))
                      .attr('y', data => yScale(data.value));