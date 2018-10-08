// @ts-nocheck
/* eslint-disable no-undef */

const svg = d3.select('svg');

const margin = {
  top: 20,
  right: 80,
  bottom: 30,
  left: 50,
};

const width = svg.attr('width') - margin.left - margin.right;

const height = svg.attr('height') - margin.top - margin.bottom;

const percentagePadding = 10;

const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

const heading = svg
  .append('text')
  .attr('x', width / 2)
  .attr('y', margin.top * 2)
  .style('font-family', 'Arial')
  .style('font-weight', 'bold')
  .text('Anteil der täglich Rauchenden ab 16 Jahren von 1972 bis 2014 in %');

const xScale = d3.scaleTime().range([0, width]);

const yScale = d3.scaleLinear().range([height, 0]);

const zScale = d3.scaleOrdinal(d3.schemeCategory10);

const line = d3
  .line()
  .curve(d3.curveBasis)
  .x(d => xScale(d.year))
  .y(d => yScale(d.percentage));

d3.tsv('ergebnisse_im_ueberblick_rauchen.tsv')
  .then((data) => {
    const structuredData = data.columns.slice(1).map(id => ({
      id,
      values: data.map(d => ({ year: d.Jahr, percentage: +d[id] })),
    }));

    xScale.domain(d3.extent(data, d => +d.Jahr));

    yScale.domain([
      d3.min(structuredData, c => d3.min(c.values, d => 0)),
      d3.max(structuredData, c => d3.max(c.values, d => d.percentage + percentagePadding)),
    ]);

    zScale.domain(structuredData.map(d => d.id));

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('D')))
      .append('text')
      .attr('transform', `translate(${width},0)`)
      .attr('x', -10)
      .attr('y', -5)
      .attr('fill', '#000')
      .style('font-style', 'italic')
      .text('Jahr');

    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('fill', '#000')
      .style('font-style', 'italic')
      .text('Prozent %');

    const smokers = g
      .selectAll('.smokers')
      .data(structuredData)
      .enter()
      .append('g')
      .attr('class', 'smokers');
      // .on('mouseover', (d) => {
      //   tooltip
      //     .transition()
      //     .duration(200)
      //     .style('opacity', 1);
      //   tooltip
      //     .html(`${d.id}`)
      //     .style('left', `${d3.event.pageX}px`)
      //     .style('top', `${d3.event.pageY - 28}px`);
      // })
      // .on('mouseout', () => {
      //   tooltip
      //     .transition()
      //     .duration(500)
      //     .style('opacity', 0);
      // });

    smokers
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(d.values))
      .style('stroke', d => zScale(d.id));


    smokers
      .append('text')
      .datum(d => ({ id: d.id, value: d.values[d.values.length - 1] }))
      .attr('transform', d => `translate(${xScale(d.value.year)},${yScale(d.value.percentage)})`)
      .attr('x', 3)
      .attr('dy', '0.35em')
      .style('font', '10px sans-serif')
      .text(d => d.id);
  })
  .catch(err => console.error(err));
