window.chart = (function() {
    var colors = ['#5DA5DA', '#4D4D4D', '#FAA43A', '#60BD68', '#F17CB0', '#B2912F', '#B276B2', '#DECF3F', '#F15854'];
    
    // Helper functions
    function setAttributes(element, attrs) {
        for (var key in attrs) 
            if (attrs[key]) element.setAttribute(key, attrs[key]);
    }

    function createSVGElement(tagName, attrs) {
        var obj = document.createElementNS('http://www.w3.org/2000/svg', tagName);
        setAttributes(obj, attrs);
        return obj;
    }
    function circle(r, cx, cy, attrs) {
        var obj = createSVGElement('circle', {
            'r': Math.round(r),
            'cx': Math.round(cx),
            'cy': Math.round(cy)
        });
        setAttributes(obj, attrs);
        return obj;
    }
    function rect(x, y, w, h, attrs) {
        var obj = createSVGElement('rect', {
            'x': Math.round(x),
            'y': Math.round(y),
            'width': Math.round(w),
            'height': Math.round(h)
        });
        setAttributes(obj, attrs);
        return obj;
    }
    function text(x, y, txt, attrs) {
        var obj = createSVGElement('text', { 'x': Math.round(x), 'y': Math.round(y), 'text-anchor': 'middle' });
        setAttributes(obj, attrs);
        obj.textContent = txt;
        return obj;
    }

    function grid(w, h, xmin, xmax, ymin, ymax, options) {
        var obj = createSVGElement('g');
        
        // Grid: optionally present
        var dx = Math.floor((xmax - xmin) / w), dy = Math.floor((ymax - ymin) / h);
        var factor = Math.floor(Math.log(dx) / Math.log(10));

        if (!options || options['grid'] !== false) {
            var d = '';
            for (var i = Math.max(w, h); i >= 0 ; i -= 10)
                d += 'M0 ' + i + ' H' + w + ' M' + i + ' 0 V' + h + ' ';
            obj.appendChild(createSVGElement('path', {
                'class': 'grid',
                'd': d,
                'data-param': null
            }));
        }
        // Axes: always present
        obj.appendChild(createSVGElement('path', {
            'class': 'axes',
//            'd': 'M' + -Math.floor(xo * sx) + ',0 V' + h + ' M0,' + h + Math.floor(yo * sy) + ' H' + w
        }));
/*        
        var xo = Math.min.apply(Math, data[0].value), sx = w / (Math.max.apply(Math, data[0].value) - xo), yo = Number.POSITIVE_INFINITY, sy;
        for (var s = 1; s < data.length; ++s) {
            yo = Math.min(yo, Math.min.apply(Math, data[s].value)), sy = h / (Math.max.apply(Math, data[s].value) - yo);
        }
        sy *= 0.9;
*/
        return obj;
    }
    
    // Data argument includes one or more data sets each includes an array and optionally label.
    var chart = {
        line: function(w, h, data, options) {
            var svg = createSVGElement('svg', {
                'class': 'line',
                'width': w,
                'height': h
            });
            // Points
            if (data.length > 1) {
                var xmin = Math.min.apply(Math, data[0].value), xmax = Math.max.apply(Math, data[0].value), ymin = Number.POSITIVE_INFINITY, ymax = Number.NEGATIVE_INFINITY;
                for (var s = 1; s < data.length; ++s) {
                    ymin = Math.min(ymin, Math.min.apply(Math, data[s].value)), ymax = Math.max(ymax, Math.max.apply(Math, data[s].value));
                }

                svg.appendChild(grid(w, h, xmin, xmax, ymin, ymax, options));

                var sx = w / (xmax - xmin), sy = h / (ymax - ymin);
                for (var s = 1; s < data.length; ++s) {
                    var points = '', I = Math.min(data[0].value.length, data[s].value.length);
                    for (var i = 0; i < I; ++i) {
                        var x = (data[0].value[i] - xmin) * sx, y = h - (data[s].value[i] - ymin) * sy;
                        svg.appendChild(circle(3, x, y, { 'style': 'stroke:none;fill:' + colors[(s-1) % 9] }));
                        points += Math.round(x) + ',' + Math.round(y) + ' ';
                    }
                    svg.appendChild(createSVGElement('polyline', {
                        'style': 'stroke:' + colors[(s-1) % 9],
                        'points': points
                    }));
                }
            } else {
                // At least two data sets
            }
            return svg;
        },
        polar: function(r, data, options) {
            var svg = createSVGElement('svg', {
                'class': 'polar',
                'width': 2 * r,
                'height': 2 * r
            });
            var xmin = Math.min.apply(Math, data[0].value), xmax = Math.max.apply(Math, data[0].value), ymin = Number.POSITIVE_INFINITY, ymax = Number.NEGATIVE_INFINITY;
            for (var s = 1; s < data.length; ++s) {
                ymin = Math.min(ymin, Math.min.apply(Math, data[s].value)), ymax = Math.max(ymax, Math.max.apply(Math, data[s].value));
            }

            // x, y & r, theta
            if (!options || options['mode'] !== 'XY') {
                for (var i = 0; i < data[0].value.length; ++i) {
                    for (var s = 1; s < data.length; ++s) {
                        data[s].value[i] *= Math.sin(data[0].value[i]);
                    }
 //                   data[s].value[i] *= Math.sin(data[0].value[i]);
                }
            }
            
            return svg;
        },
        histogram: function(w, h, data, options) {
            var svg = createSVGElement('svg', {
                'class': 'histogram',
                'width': w,
                'height': h
            });
            var mh = 0, Mh = Number.NEGATIVE_INFINITY;
            for (var s = 0; s < data.length; ++s) {
                mh = Math.min(mh, Math.min.apply(Math, data[s].value)), Mh = Math.max(Mh, Math.max.apply(Math, data[s].value));
            }
            // Grid
            var dh = 0.95 * h / (Mh - mh), d = '';
            if (!options || options['grid'] != false) {
                for (var i = w; i >= 0; i -= 10) 
                    d += 'M0 ' + i + ' H' + w + ' ';
                svg.appendChild(createSVGElement('path', {
                    'class': 'grid',
                    'd': d
                }));
            }
            // Bars
            var dw = (w - (data[0].value.length + 1)) / (data.length * data[0].value.length);
            for (var i = 0; i < data[0].value.length; ++i) {
                for (var s = 0; s < data.length; ++s) {
                    var element;
                    if (data[s].value[i] > 0)
                        element = rect((s + data.length * i) * dw + i, h - (data[s].value[i] - mh) * dh, dw - 1, data[s].value[i] * dh, { 'style': 'fill:' + colors[s % 9] });
                    else
                        element = rect((s + data.length * i) * dw + i, h + (mh * dh), dw - 1, -data[s].value[i] * dh, { 'style': 'fill:' + colors[s % 9] });
                    svg.appendChild(element);
                }
            }
            // Axes
            svg.appendChild(createSVGElement('path', {
                'class': 'axes',
                'd': 'M0,0 V' + h + ' M0,' + Math.floor(h + mh * dh) + ' H' + w
            }));
            return svg;
        },
        pie: function(r, data, options) {
            var svg = createSVGElement('svg', {
                'class': 'pie',
                'width': 2 * r,
                'height': 2 * r
            });
            var sum = 0;
            for (var s = 0; s < data.length; ++s) 
                sum += data[s].value[0];
            if (sum > 0 && s > 1) {
                var startAngle, endAngle = 0;
                for (var s = 0; s < data.length; ++s) {
                    startAngle = endAngle;
                    endAngle = startAngle + 2.0 * Math.PI * data[s].value[0] / sum;
                    var slice = createSVGElement('path', {
                        'style': 'fill:' + colors[s % 9],
                        'd': 'M' + r + ',' + r + ' L' + Math.floor(r + r * Math.cos(startAngle)) + ',' + Math.floor(r + r * Math.sin(startAngle)) + ' A' + r + ',' + r + ' 0 ' + (2.0 * data[s].value[0] > sum ? 1 : 0) + ',1 ' + Math.floor(r + r * Math.cos(endAngle)) + ',' + Math.floor(r + r * Math.sin(endAngle))
                    });
                    var title = createSVGElement('title');
                    title.textContent = data[s].label + ' ' + Math.floor(1000 * data[s].value[0] / sum) / 10.0 + '%';
                    slice.appendChild(title);
                    svg.appendChild(slice);
                }
            } else
                svg.appendChild(circle(r, r, r, { 'style': 'fill:' + colors[0] }));
            return svg;
        },
        donut: function(r, data, options) {
            var svg = chart.pie(r, data, options);
            if (svg.firstChild.tagName !== 'circle') svg.appendChild(circle(0.667 * r, r, r));
            svg.setAttribute('class', 'donut');
            return svg;
        },
        bubble: function(w, h, data, options) {
            var svg = createSVGElement('svg', {
                'class': 'bubble',
                'width': w,
                'height': h
            });
            if (data.length === 3) {
                var xo = Math.min.apply(Math, data[0].value), sx = w / (Math.max.apply(Math, data[0].value) - xo),
                    yo = Math.min(yo, Math.min.apply(Math, data[1].value)), sy = h / (Math.max.apply(Math, data[1].value) - yo);

                if (!options || options['grid'] != false)
                    svg.appendChild(grid(w, h));
    
                sy *= 0.9;
                // Axes
                svg.appendChild(createSVGElement('path', {
                    'class': 'axes',
                    'd': 'M' + -Math.floor(xo * sx) + ',0 V' + h + ' M0,' + h + Math.floor(yo * sy) + ' H' + w
                }));
    
                var I = data[0].value.length;
                for (var i = 0; i < I; ++i) {
                    var x = (data[0].value[i] - xo) * sx, y = h - (data[1].value[i] - yo) * sy;
                    svg.appendChild(circle(data[2].value[i], x, y, { 'style': 'fill:none;stroke:' + colors[0] }));
                }
            }
            return svg;
        },
        map: function(w, h, data, options) {
            var svg = createSVGElement('svg');
            return svg;
        },
        radar: function(r, data, options) {
            var svg = createSVGElement('svg', {
                'class': 'radar',
                'width': 2 * r,
                'height': 2 * r
            });
            var m = Number.POSITIVE_INFINITY, M = Number.NEGATIVE_INFINITY;
            for (var s = 0; s < data.length; ++s)
                m = Math.min(m, Math.min.apply(Math, data[s].value)), M = Math.max(M, Math.max.apply(Math, data[s].value));
            var dr = Math.abs(M - m);
            
            // Axes
            var a = 2 * Math.PI / data[0].value.length, d = '';
            for (var i = 0; i < data[0].value.length; ++i)
                d += 'M' + r + ',' + r + ' l' + Math.floor(r * Math.cos(a * i)) + ',' + Math.floor(r * Math.sin(a * i)) + ' ';
            svg.appendChild(createSVGElement('path', {
                'd': d
            }));
            svg.appendChild(circle(r * Math.abs(m) / dr, r, r, { 'style': 'fill:none'}));
            // Points
            for (var s = 0; s < data.length; ++s) {
                var points = '';
                for (var i = 0; i < data[s].value.length; ++i) {
                    var x = Math.floor(r + r * (data[s].value[i] - m) / dr * Math.cos(a * i)), y = Math.floor(r + r * (data[s].value[i] - m) / dr * Math.sin(a * i));
                    points += x + ',' + y + ' ';
                    svg.appendChild(circle(3, x, y, { 'style': 'stroke:none;fill:' + colors[s % 9] }));
                }
                svg.appendChild(createSVGElement('polygon', {
                    'style': 'stroke:' + colors[s % 9],
                    'points': points 
                }));
            }
            return svg;
        },
        gauge: function(r, data, options) {
            var panel = document.createElement('span');
            
            var m = 0, M = 1.0;
            if (options && options['min']) m = options['min'];
            if (options && options['max']) M = options['max'];

            for (var s = 0; s < data.length; ++s) {
                var svg = createSVGElement('svg', {
                        'class': 'gauge',
                        'width': 2 * r,
                        'height': 2 * r
                    }),
                    sr = Math.floor(0.667 * r),
                    v = (data[s].value - m) / (M - m);
                
                if (data[s].units === undefined) data[s].units = '';
                svg.appendChild(text(r, r, data[s].value + data[s].units, { 'font-size': Math.floor(0.333 * r) + 'px' }));
                svg.appendChild(text(r, Math.floor(1.4 * r), data[s].label, { 'font-size': Math.floor(0.25 * r) + 'px' }));
                v = 1.0 - (v - Math.floor(v));
                var element = createSVGElement('path', {
                    'd': 'M0,' + r + ' A' + r + ',' + r + ' 0 1,1 ' + Math.floor(r + r) + ',' + r + ' H' + Math.floor(r + sr) + ' A' + sr + ',' + sr + ' 0 0,0 ' + (r - sr) + ',' + r + ' z'
                });
                svg.appendChild(element);
                element = createSVGElement('path', {
                    'style': 'stroke:none;fill:' + colors[s % 9],
                    'd': 'M0,' + r + ' A' + r + ',' + r + ' 0 0,1 ' + Math.floor(r + r * Math.cos(Math.PI * v)) + ',' + Math.floor(r - r * Math.sin(Math.PI * v)) + 
                    ' L' + Math.floor(r + sr * Math.cos(Math.PI * v)) + ',' + Math.floor(r - sr * Math.sin(Math.PI * v)) + ' A' + sr + ',' + sr + ' 0 0,0 ' + (r - sr) + ',' + r + ' z'
                });
                svg.appendChild(element);
                panel.appendChild(svg);
            }            
            return panel;
        },
        gantt: function(w, h, data, options) {
            var svg = createSVGElement('svg', {
                'class': 'gantt',
                'width': w,
                'height': h
            });
            var text = createSVGElement('text');
            text.textContent = 'GANTT';
            svg.appendChild(text);
            return svg;
        }
    };
    return chart;
})();