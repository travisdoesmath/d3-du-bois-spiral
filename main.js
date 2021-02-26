data = [
    {
        label: 'in cities of over 10k inhabitants',
        value: 78139
    },
    {
        label: 'in cities from 5k to 10k',
        value: 8025
    },
    {
        label: 'in cities from 2.5k to 5k',
        value: 37699
    },
    {
        label: 'in the country and villages',
        value: 734952
    }
]

let scale = d3.scaleLinear().domain([0,100000]).range([0,351])

let height = 627;
let width = 487;

let margin = {
    top: 28,
    right: 20,
    bottom: 20,
    left: 23
}

let chartHeight = height - margin.top - margin.bottom;
let chartWidth = width - margin.left - margin.right;

let lineWidth = 10
let w = 21.7
let r_0 = 8

function r(t) {
    return r_0 + w/(2 * Math.PI) * t;
}

function rPrime(t) {
    return w/(2 * Math.PI);
}

function x(t) {
    return r(t) * Math.cos(t);
}

function xPrime(t) {
    return rPrime(t) * Math.cos(t) + r(t) * Math.sin(t);
}

function y(t) {
    return -r(t) * Math.sin(t);
}

function yPrime(t) {
    return -rPrime(t) * Math.sin(t) + r(t) * Math.cos(t);
}

function l(t1, t2) {
    let a = r_0;
    let b = w / (2*Math.PI);
    let I = t => 0.5 * ((a + b * t) * Math.sqrt((a + b * t)**2 + b**2)/b + b * Math.log((a + b*t) + Math.sqrt((a + b * t)**2 + b**2)))
    return I(t2) - I(t1);
} 

thetaFn = t => Math.sin(Math.PI/4 + t) - (2*Math.PI*r_0 / w + t) * Math.sin(Math.PI/4 - t)
thetaFnPrime = t => Math.cos(Math.PI/4 + t) - Math.sin(Math.PI/4 - t) + (2*Math.PI*r_0 / w + t) * Math.cos(Math.PI/4 - t)

getParamaters = function(L, r_0, x_0, x_m) {
    let found = false;
    let c_i = 0;
    while (!found) {
        let theta_1 = newtonsMethod(thetaFn, thetaFnPrime, Math.PI * c_i-1)
        let l_1 = Math.sqrt(2) * (x_0 - x_m - x(theta_1))
        let l_2 = L - l_1
        if (l(0, theta_1) > l_2 && yPrime(theta_1) < 0 && l_1 > 0) {
            let theta_0 = binarySearch(t => l(t, theta_1), l_2, [0, theta_1])
            console.log('theta_0', theta_0, 'r(theta_0)', r(theta_0))
            if (r(theta_0) > r_0) {
                console.log('c_i: ', c_i)
                return {
                    theta_0: theta_0,
                    theta_1: theta_1,
                    l_1: l_1,
                    l_2: l_2,
                    r_0: r_0,
                }
            }
        }
        c_i += 1
        if (c_i > 100) throw 'unable to find parameters'
    }
}

const svg = d3.select("#chartSvg")
    .attr('height', height)
    .attr('width', width)

const showOriginalButton = d3.select('#showOriginal').on('click', function() {
    if (svg.style('background-image') == 'url("original.png")') {
        svg.style('background-image', 'none')
        d3.select(this).text('Show Original')
    } else {
        svg.style('background-image', 'url("original.png")')
        d3.select(this).text('Hide Original')
    }
})

let showAnnotations = true;
const annotationsButton = d3.select('#annotations').on('click', function() {
    if (showAnnotations) {
        svg.selectAll('text')
            .transition()
            .style('opacity', 0)
        d3.select(this).text('Show Annotations')
        showAnnotations = false;
    } else {
        svg.selectAll('text')
            .transition()
            .style('opacity', 1)
        d3.select(this).text('Hide Annotations')
        showAnnotations = true;
    }
})

const defs = svg.append('defs')

const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

let line = d3.lineRadial()
    .radius(d => d[1])
    .angle(d => -d[0] + Math.PI / 2)

let x_0 = 0, y_0 = 0, x_1 = 0, y_1 = 0;

colors = ['#5a836c', '#4e6cad', '#f7b414', '#db2a46']
for (let i = 0; i < data.length; i++) {
    datum = data[i]

    if (i == 0) {

        x_1 = scale(datum.value)

        g.append('path')
            .attr('d', `M${x_0},${y_0} L${x_1} ${y_1}`)
            .style('stroke-width', `${lineWidth}px`)
            .attr('stroke', colors[i])

        g.append('text')
            .attr('x', x_0)
            .attr('y', y_0 + lineWidth)
            .attr('dy', 10)
            .text(datum.value.toLocaleString())

        g.append('text')
            .attr('x', x_0)
            .attr('y', y_0 + lineWidth)
            .attr('dy', 24)
            .text(datum.label)
            .attr('font-size', '12px')

        x_0 = x_1 - (0.5*Math.sqrt(2) * lineWidth);
        y_0 += (0.5*lineWidth)

    } else if (i < data.length - 1) {

        defs.append('marker')
            .attr('viewBox', '0 0 1 1')
            .attr('refX', '1')
            .attr('refY', '0.5')
            .attr('markerWidth', '1')
            .attr('markerHeight', '1')
            .attr('markerUnits','strokeWidth')
            .attr('orient','auto')
            .attr('id', `marker${i}-start`)
            .append('path')
            .attr('d', d => i % 2 == 0 ? 'M1 0 L0 1 L1 1 z' : 'M0 0 L1 1 L1 0 z')
            .attr('fill', colors[i])
            .style('shape-rendering', 'crispedges')

        defs.append('marker')
            .attr('viewBox', '0 0 1 1')
            .attr('refY', '0.5')
            .attr('markerWidth', '1')
            .attr('markerHeight', '1')
            .attr('markerUnits','strokeWidth')
            .attr('orient','auto')
            .attr('id', `marker${i}-end`)
            .append('path')
            .attr('d', d => i % 2 == 0 ? 'M0 0 L1 0 L0 1' : 'M0 0 L1 1 L0 1')
            .attr('fill', colors[i])
            .style('shape-rendering', 'crispedges')

        x_1 = x_0 + (-1)**i * scale((datum.value)) * 0.5 * Math.sqrt(2);
        y_1 = y_0 + (scale(datum.value)) * 0.5 * Math.sqrt(2)

        g.append('path')
            .attr('d', `M${x_0 + (-1)**i * lineWidth * 0.25 * Math.sqrt(2)} ${y_0 + lineWidth * 0.25 * Math.sqrt(2)}` + 
                       `L${x_1 - (-1)**i * lineWidth * 0.25 * Math.sqrt(2)} ${y_1 - lineWidth * 0.25 * Math.sqrt(2)}`)
            .style('stroke-width', `${lineWidth}px`)
            .style('stroke', colors[i])
            .attr('marker-start', `url('#marker${i}-start')`)
            .attr('marker-end', `url('#marker${i}-end')`)
            .style('shape-rendering', 'crispedges')

        g.append('text')
            .attr('x', 0.5 * (x_0 + x_1) - (-1)**i * 15)
            .attr('y', 0.5 * (y_0 + y_1))
            .attr('dy', 10)
            .attr('text-anchor', i % 2 == 0 ? 'end' : 'start')
            .text(datum.value.toLocaleString())

        g.append('text')
            .attr('x', 0.5 * (x_0 + x_1) - (-1)**i * 15)
            .attr('y', 0.5 * (y_0 + y_1))
            .attr('dy', 24)
            .attr('text-anchor', i % 2 == 0 ? 'end' : 'start')
            .text(datum.label)
            .attr('font-size', '12px')

        x_0 = x_1;
        y_0 = y_1;

    } else {
        let L = scale(datum.value);
        let x_m = 0.5 * chartWidth - 5;

        params = getParamaters(L, r_0, x_0, x_m)

        x_1 = x_0 - (scale(datum.value) - params.l_2) * 0.5 * Math.sqrt(2)
        y_1 = y_0 + (scale(datum.value) - params.l_2) * 0.5 * Math.sqrt(2)
        
        defs.append('marker')
            .attr('viewBox', '0 0 1 1')
            .attr('refX', '1')
            .attr('refY', '0.5')
            .attr('markerWidth', '1')
            .attr('markerHeight', '1')
            .attr('markerUnits','strokeWidth')
            .attr('orient','auto')
            .attr('id', `marker${i}-start`)
            .append('path')
            .attr('d', d => i % 2 == 0 ? 'M1 0 L0 1 L1 1 z' : 'M0 0 L1 1 L1 0 z')
            .attr('fill', colors[i])
            .style('shape-rendering', 'crispedges')

        g.append('path')
        .attr('d', `M${x_0 + (-1)**i * lineWidth * 0.25 * Math.sqrt(2)} ${y_0 + lineWidth * 0.25 * Math.sqrt(2)}` +
                   `L${x_1} ${y_1}`)
        .style('stroke-width', `${lineWidth}px`)
        .style('stroke', colors[i])
        .attr('marker-start', `url('#marker${i}-start')`)

        let spiralPoints = d3.range(params.theta_0, params.theta_1 + .01, .01).map(t => [-t, r(t)])

        let spiralCenterX = x_1 - x(params.theta_1)
        let spiralCenterY = y_1 + y(params.theta_1)

        g.append("path")
            .datum(spiralPoints)
            .attr("d", line)
            .attr('fill','none')
            .style('stroke-width', `${lineWidth}px`)
            .style('stroke', '#db2a46')
            .attr('transform', `translate(${spiralCenterX},${spiralCenterY})`)

        g.append('text')
            .attr('x', spiralCenterX + 0.25 * w)
            .attr('y', spiralCenterY)
            .attr('dy', 5)
            .attr('text-anchor', 'middle')
            .text(datum.value.toLocaleString())

        let textSpiralPoints = d3.range( params.theta_1 + 1.47 * Math.PI, params.theta_1 + Math.PI, -.01).map(t => [-t, r(t)])

        g.append("path")
            .datum(textSpiralPoints)
            .attr('id', 'spiralTextPath')
            .attr("d", line)
            .attr('fill','none')
            .attr('transform', `translate(${spiralCenterX},${spiralCenterY})`)

        g.append('text').append('textPath').attr('href','#spiralTextPath')           
            .text(datum.label)
            
    }

}


// let bar1 = g.append('path')
//     .attr('d', `M0,0 l${scale(78139)} 0`)
//     .style('stroke-width', `${lineWidth}px`)
//     .attr('stroke', '#5a836c')
//     .attr('stroke-linecap', "square")

// let bar2 = g.append('path')
//     .attr('d', `M${scale(78139)} 0 l${-scale(8025) * 1/Math.sqrt(2)} ${scale(8025) * 1/Math.sqrt(2)}`)
//     .style('stroke-width', `${lineWidth}px`)
//     .style('stroke', '#4e6cad')
//     .attr('stroke-linecap', "square")

//     //db2a46
// let bar4 = g.append('path')
//     .attr('d', `M${scale(78139) -scale(8025) * 1/Math.sqrt(2) + scale(37699) * 1/Math.sqrt(2)} ${scale(8025) * 1/Math.sqrt(2) + scale(37699) * 1/Math.sqrt(2)}` + 
//                `l${-(scale(734952) - params.l_2) * 1/Math.sqrt(2)} ${(scale(734952) - params.l_2) * 1/Math.sqrt(2)}`)
//     .style('stroke-width', `${lineWidth}px`)
//     .style('stroke', '#db2a46')
//     // .attr('stroke-linecap', "square")

// let bar3 = g.append('path')
//     .attr('d', `M${scale(78139) -scale(8025) * 1/Math.sqrt(2)} ${scale(8025) * 1/Math.sqrt(2)} l${scale(37699) * 1/Math.sqrt(2)} ${scale(37699) * 1/Math.sqrt(2)}`)
//     .style('stroke-width', `${lineWidth}px`)
//     .style('stroke', '#f7b414')
//     //.attr('stroke-linecap', "square")
//     .attr('marker-start', 'url(#right-triangle)')
//     .attr('marker-end', 'url(#left-triangle)')


//let spiralPoints = d3.range(thetas[0], thetas[1], .01).map(t => [-t, r(t)])
