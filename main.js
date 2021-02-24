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

let scale = d3.scaleLinear().domain([0,100000]).range([0,351])

function newtonsMethod(fn, fnPrime, startingValue, precision = 0.0001) {
    let delta = Infinity;
    let x = startingValue
    for (let i = 0; i < 10; i++) {
        let newX = x - fn(x) / fnPrime(x)
        delta = Math.abs(newX - x);
        x = newX;
    }
    
    return x;
}


let height = 600;
let width = 600;

let margin = {
    top: 38,
    right: 20,
    bottom: 20,
    left: 15
}

let chartHeight = height - margin.top - margin.bottom;
let chartWidth = width - margin.left - margin.right;


let lineWidth = 10; //24
let w = 21.5 //36
let r0 = 19.5;
//let L = scale(734952);
//let L = scale(665000);
let L = scale(648000)

function r(t) {
    return r0 + w/(2 * Math.PI) * t;
}

function l(t1, t2) {
    let a = r0;
    let b = w / (2*Math.PI);
    let I = t => 0.5 * ((a + b * t) * Math.sqrt((a + b * t)**2 + b**2)/b + b * Math.log((a + b*t) + Math.sqrt((a + b * t)**2 + b**2)))
    return I(t2) - I(t1);
} 

// get theta0 and theta1
thetaFn = t => Math.sin(Math.PI/4 + t) - (2*Math.PI*r0 / w + t) * Math.sin(Math.PI/4 - t)
thetaFnPrime = t => Math.cos(Math.PI/4 + t) - Math.sin(Math.PI/4 - t) + (2*Math.PI*r0 / w + t) * Math.cos(Math.PI/4 - t)

function binarySearch(f, targetValue, interval, precision = 0.0001) {
    if (Math.abs(interval[1] - interval[0]) < precision) return 0.5 * (interval[0] + interval[1]);

    // assuming f is monotonic on interval
    y0 = f(interval[0])
    y1 = f(0.5*(interval[0] + interval[1]))
    y2 = f(interval[1])
    if (y2 > y0) {
        // f is increasing
        if (targetValue > y2 || targetValue < y0) throw 'no solution on interval'
        if (targetValue < y1) {
            return binarySearch(f, targetValue, [interval[0], 0.5 * (interval[0] + interval[1])], precision)
        } else if (targetValue > y1) {
            return binarySearch(f, targetValue, [0.5 * (interval[0] + interval[1]), interval[1]], precision)
        } else {
            return 0.5 * (interval[0] + interval[1]);
        }
    }
    if (y2 < y0) {
        // f is decreasing
        if (targetValue < y2 || targetValue > y0) throw 'no solution on interval'
        if (targetValue > y1) {
            return binarySearch(f, targetValue, [interval[0], 0.5 * (interval[0] + interval[1])], precision)
        } else if (targetValue < y1) {
            return binarySearch(f, targetValue, [0.5 * (interval[0] + interval[1]), interval[1]], precision)
        } else {
            return 0.5 * (interval[0] + interval[1]);
        }
    }
}

getThetas = function(L, r0) {
    let found = false;
    let c_i = 0;
    while (!found) {
        let theta1 = newtonsMethod(thetaFn, thetaFnPrime, Math.PI * c_i)
        if (l(0, theta1) > L) {
            let theta0 = binarySearch(t => l(t, theta1), L, [0, theta1])
            if (r(theta0) > r0) return [theta0, theta1]
        }
        c_i += 2;
    }
}

thetas = getThetas(L, r0)

const svg = d3.select("#chartSvg")
    .attr('height', height)
    .attr('width', width)
    // .style('background-image', 'url(original.png)')

const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

let bar1 = g.append('path')
    .attr('d', `M0,0 l${scale(78139)} 0`)
    .style('stroke-width', `${lineWidth}px`)
    .attr('stroke', '#5a836c')
    .attr('stroke-linecap', "square")

let bar2 = g.append('path')
    .attr('d', `M${scale(78139)} 0 l${-scale(8025) * 1/Math.sqrt(2)} ${scale(8025) * 1/Math.sqrt(2)}`)
    .style('stroke-width', `${lineWidth}px`)
    .style('stroke', '#4e6cad')
    .attr('stroke-linecap', "square")

let bar3 = g.append('path')
    .attr('d', `M${scale(78139) -scale(8025) * 1/Math.sqrt(2)} ${scale(8025) * 1/Math.sqrt(2)} l${scale(37699) * 1/Math.sqrt(2)} ${scale(37699) * 1/Math.sqrt(2)}`)
    .style('stroke-width', `${lineWidth}px`)
    .style('stroke', '#f7b414')
    .attr('stroke-linecap', "square")

    //db2a46
let bar4 = g.append('path')
    .attr('d', `M${scale(78139) -scale(8025) * 1/Math.sqrt(2) + scale(37699) * 1/Math.sqrt(2)} ${scale(8025) * 1/Math.sqrt(2) + scale(37699) * 1/Math.sqrt(2)}` + 
//               `l${-scale(734952) * 1/Math.sqrt(2)} ${scale(734952) * 1/Math.sqrt(2)}`)
               `l${-(scale(734952) - L) * 1/Math.sqrt(2)} ${(scale(734952) - L) * 1/Math.sqrt(2)}`)
    .style('stroke-width', `${lineWidth}px`)
    .style('stroke', '#db2a46')
    .attr('stroke-linecap', "square")

let line = d3.lineRadial()
    .radius(d => d[1])
    .angle(d => -d[0] + Math.PI / 2)

let spiralPoints = d3.range(thetas[0], thetas[1], .01).map(t => [-t, r(t)])

let spiralCenterX = scale(78139) -scale(8025) * 1/Math.sqrt(2) + scale(37699) * 1/Math.sqrt(2) + -(scale(734952) - L) * 1/Math.sqrt(2) + r(thetas[1]) * Math.cos(thetas[1])
let spiralCenterY = scale(8025) * 1/Math.sqrt(2) + scale(37699) * 1/Math.sqrt(2) + (scale(734952) - L) * 1/Math.sqrt(2) + r(thetas[1]) * Math.sin(thetas[1])

let spiral = g.append("path")
	.datum(spiralPoints)
	.attr("d", line)
    .attr('fill','none')
    .style('stroke-width', `${lineWidth}px`)
    .style('stroke', '#db2a46')
    // .style('stroke', 'black')
    // .style('opacity', 0.5)
    //.attr('transform', `translate(${chartWidth/2 + 10 },${418})`)
    .attr('transform', `translate(${spiralCenterX},${spiralCenterY}) rotate(180)`)