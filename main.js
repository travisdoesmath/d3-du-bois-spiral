data = [
    {
        label: 'cities of over 10,000 inhabitants',
        value: 78139
    },
    {
        label: 'cities from 5,000 to 10,000',
        value: 8025
    },
    {
        label: 'cities from 2,500 to 5,000',
        value: 37699
    },
    {
        label: 'the country and villages',
        value: 734952
    }
]

var spiralArcLength = function(theta) {
	return 0.5 * (theta * Math.sqrt(1 + theta**2) + Math.log(theta + Math.sqrt(1 + theta**2)));
}

var spiralArcLengthDerivative = function(theta) {
	return (1 + theta**2) / Math.sqrt(1 + theta**2);
}

var spiralInverseArcLength = function(length) {
	length = length * scaleFactor;
	var x = Math.sqrt(8*length + 5) * 0.5 - 0.5,
		delta = Infinity,
		precision = 0.0001;

	while (Math.abs(delta) > precision) {
		var newX = x - (spiralArcLength(x) - length)/spiralArcLengthDerivative(x);
		delta = newX - x;
		x = newX;
	}

	return x;
}

function newtonsMethod(fn, fnPrime, startingValue, precision = 0.0001) {
    let delta = Infinity;
    let x = startingValue
    while (delta > precision) {
        let newX = x - fn(x) / fnPrime(x)
        delta = Math.abs(newX - x);
        x = newX;
    }

    return x;
}

function getInverse(fn, fnPrime, y) {
    newFn = x => fn - x
    return newtonsMethod(newFn, fnPrime, y)
}

testFn = x => x**2 - 2
testFnPrime = x => 2*x


let height = 600;
let width = 600;

let margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
}

let chartHeight = height - margin.top - margin.bottom;
let chartWidth = width - margin.left - margin.right;

const svg = d3.select("#chartSvg")
    .attr('height', height)
    .attr('width', width)

const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

let scale = d3.scaleLinear().domain([0,100000]).range([0,400])

let bar1 = g.append('path')
    .attr('d', `M0,0 l${scale(78139)} 0`)
    .style('stroke-width', '10px')
    .attr('stroke', '#5a836c')
    .attr('stroke-linecap', "square")

let bar2 = g.append('path')
    .attr('d', `M${scale(78139)} 0 l${-scale(8025) * 1/Math.sqrt(2)} ${scale(8025) * 1/Math.sqrt(2)}`)
    .style('stroke-width', '10px')
    .style('stroke', '#4e6cad')
    .attr('stroke-linecap', "square")

let bar3 = g.append('path')
    .attr('d', `M${scale(78139) -scale(8025) * 1/Math.sqrt(2)} ${scale(8025) * 1/Math.sqrt(2)} l${scale(37699) * 1/Math.sqrt(2)} ${scale(37699) * 1/Math.sqrt(2)}`)
    .style('stroke-width', '10px')
    .style('stroke', '#f7b414')
    .attr('stroke-linecap', "square")

    //db2a46
let bar4 = g.append('path')
    .attr('d', `M${scale(78139) -scale(8025) * 1/Math.sqrt(2) + scale(37699) * 1/Math.sqrt(2)} ${scale(8025) * 1/Math.sqrt(2) + scale(37699) * 1/Math.sqrt(2)}` + 
//               `l${-scale(734952) * 1/Math.sqrt(2)} ${scale(734952) * 1/Math.sqrt(2)}`)
               `l${-scale(70000) * 1/Math.sqrt(2)} ${scale(70000) * 1/Math.sqrt(2)}`)
    .style('stroke-width', '10px')
    .style('stroke', '#db2a46')
    .attr('stroke-linecap', "square")

let r = d3.scaleLinear()
    .domain([0, 100000])
    .range([0, chartWidth / 4])

let line = d3.lineRadial()
    .radius(d => d[1])
    .angle(d => -d[0] + Math.PI / 2)

let spiralPoints = d3.range(2 * 2*Math.PI, 6.625 * 2*Math.PI, .01).map(t => [-t, 3.5*t-30])

let spiral = g.append("path")
	.datum(spiralPoints)
	.attr("d", line)
    .attr('fill','none')
    .style('stroke-width', '10px')
    .style('stroke', '#db2a46')
    .attr('transform', `translate(${chartWidth/2},${410})`)
