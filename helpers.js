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