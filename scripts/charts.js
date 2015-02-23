window.chart = (function() {
    var colors = ['#5DA5DA', '#4D4D4D', '#FAA43A', '#60BD68', '#F17CB0', '#B2912F', '#B276B2', '#DECF3F', '#F15854'];
    
    // Helper functions
    function setAttributes(element, attrs) {
        for (var key in attrs) element.setAttribute(key, attrs[key]);
    }

    function createSVGElement(tagName, attrs) {
        var obj = document.createElementNS('http://www.w3.org/2000/svg', tagName);
        setAttributes(obj, attrs);
        return obj;
    }
    function circle(r, cx, cy, attrs) {
        var obj = createSVGElement('circle', {
            'r': r,
            'cx': cx,
            'cy': cy
        });
        setAttributes(obj, attrs);
        return obj;
    }
    function rect(x, y, w, h, attrs) {
        var obj = createSVGElement('rect', {
            'x': x,
            'y': y,
            'width': w,
            'height': h
        });
        setAttributes(obj, attrs);
        return obj;
    }
    function line(x1, y1, x2, y2, attrs) {
            var obj = createSVGElement('line', {
                'x1': x1,
                'y1': y1,
                'x2': x2,
                'y2': y2
            });
            setAttributes(obj, attrs);
            return obj;
        }
    function text(x, y, txt, attrs) {
        var obj = createSVGElement('text', { 'x': x, 'y': y, 'text-anchor': 'middle' });
        obj.textContent = txt;
        return obj;
    }
    
    // alert(Math.log(w) / Math.log(10));
    var chart = {
        line: function(w, h, data, options) {
            var svg = createSVGElement('svg', {
                'class': 'line',
                'width': w,
                'height': h
            });
            // Grid
            var d = '';
            for (var i = 0; i <= Math.max(w, h); i += 10)
                d += 'M0 ' + i + ' H' + w + ' M' + i + ' 0 V' + h + ' ';
            svg.appendChild(createSVGElement('path', {
                'class': 'grid',
                'd': d
            }));
            // Axes
            svg.appendChild(createSVGElement('path', {
                'class': 'axes',
                'd': 'M0,0 V' + h + ' M0,' + h + ' H' + w
            }));
            
            // Points
            if (data.length > 0) {
                var xo = Math.min.apply(Math, data[0].value), sx = w / (Math.max.apply(Math, data[0].value) - xo);
                for (var s = 1; s < data.length; ++s) {
                    var yo = Math.min.apply(Math, data[s].value), sy = h / (Math.max.apply(Math, data[s].value) - yo);

                    var points = '';
                    for (var i = 0; i < data[0].value.length; ++i) {
                        var x = Math.floor((data[0].value[i] - xo) * sx), y = h - Math.floor((data[s].value[i] - yo) * sy);
                        svg.appendChild(circle(3, x, y, { 'style': 'stroke:none;fill:' + colors[s % 9] }));
                        points += x + ',' + y + ' ';
                    }
                    svg.appendChild(createSVGElement('polyline', {
                        'style': 'stroke:' + colors[s % 9],
                        'points': points
                    }));
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
            var m = 1.1 * Math.max.apply(Math, data), d = '';
            for (var i = 0; i <= w; i += 10) d += 'M0 ' + i + ' H' + w + ' ';
            var element = createSVGElement('path', {
                'class': 'grid',
                'd': d
            });
            svg.appendChild(element);
            var sets = 4,
                dw = Math.floor((w - 5 * (sets + 2)) / data.length);
            for (var i = 0; i < data.length; ++i) {
                element = rect(i * dw + 5 * (Math.floor(i / sets) + 1), h - Math.floor(h * data[i] / m), dw - 1, Math.floor(h * data[i] / m));
                element.setAttribute('style', 'fill:' + colors[i % sets]);
                svg.appendChild(element);
            }
            svg.appendChild(line(0, 0, 0, h - 1, {
                'class': 'axes'
            }));
            svg.appendChild(line(0, h - 1, w - 1, h - 1, {
                'class': 'axes'
            }));
            return svg;
        },
        pie: function(r, data, options) {
            var svg = createSVGElement('svg', {
                'class': 'pie',
                'width': 2 * r,
                'height': 2 * r
            });
            var i, total = 0;
            for (i = 0; i < data.length; ++i) 
                total += data[i].value;
            if (total > 0 && i > 1) {
                var startAngle, endAngle = 0;
                for (i = 0; i < data.length; ++i) {
                    startAngle = endAngle;
                    endAngle = startAngle + 2.0 * Math.PI * data[i].value / total;
                    var slice = createSVGElement('path', {
                        'style': 'fill:' + colors[i % 9],
                        'd': 'M' + r + ',' + r + ' L' + Math.floor(r + r * Math.cos(startAngle)) + ',' + Math.floor(r + r * Math.sin(startAngle)) + ' A' + r + ',' + r + ' 0 ' + (2.0 * data[i].value > total ? 1 : 0) + ',1 ' + Math.floor(r + r * Math.cos(endAngle)) + ',' + Math.floor(r + r * Math.sin(endAngle))
                    });
                    var title = createSVGElement('title');
                    title.textContent = Math.floor(1000 * data[i].value / total) / 10.0 + '%';
                    slice.appendChild(title);
                    svg.appendChild(slice);
                }
                return svg;
            }
            svg.appendChild(circle(r, r, r));
            return svg;
        },
        donut: function(r, data, options) {
            var svg = chart.pie(r, data, options);
            if (svg.children[0].tagName !== 'circle') svg.appendChild(circle(0.667 * r, r, r));
            svg.setAttribute('class', 'donut');
            return svg;
        },
        bubble: function(w, h, data, options) {
            var svg = createSVGElement('svg');
            return svg;
        },
        map: function(w, h, data, options) {
            var svg = createSVGElement('svg');
            return svg;
        },
        radar: function(r, data, options) {
            var s = 0;
            var svg = createSVGElement('svg', {
                'class': 'radar',
                'width': 2 * r,
                'height': 2 * r
            });
            var m = 1.1 * Math.max.apply(Math, data), a = 2.0 * Math.PI / data.length, d = '', points = '';
            for (var i = 0; i < data.length; ++i) {
                d += 'M' + r + ',' + r + ' l' + Math.floor(r * Math.cos(a * i)) + ',' + Math.floor(r * Math.sin(a * i)) + ' ';
                points += Math.floor(r + r * data[i] / m * Math.cos(a * i)) + ',' + Math.floor(r + r * data[i] / m * Math.sin(a * i)) + ' ';
                svg.appendChild(circle(3, Math.floor(r + r * data[i] / m * Math.cos(a * i)), Math.floor(r + r * data[i] / m * Math.sin(a * i)), { 'style': 'stroke:none;fill:' + colors[s % 9] }));
            }
            svg.insertBefore(createSVGElement('path', {
                'd': d
            }), svg.firstChild);
            svg.appendChild(createSVGElement('polygon', {
                'style': 'stroke:' + colors[s % 9],
                'points': points 
            }));

            return svg;
        },
        gauge: function(r, data, options) {
            var panel = document.createElement('span');
            for (var i = 0; i < data.length; ++i) {
                var svg = createSVGElement('svg', {
                        'class': 'gauge',
                        'width': 2 * r,
                        'height': 2 * r
                    }),
                    sr = Math.floor(0.667 * r);
                    
                svg.appendChild(text(r, r, (Math.floor(1000 * data[i].value) / 10) + '%', { 'font-size': Math.floor(0.333 * r) + 'px' }));
                svg.appendChild(text(r, Math.floor(1.5 * r), data[i].label, { 'font-size': Math.floor(0.333 * r) + 'px' }));
                var v = 1.0 - (data[i].value - Math.floor(data[i].value));
                var element = createSVGElement('path', {
                    'd': 'M0,' + r + ' A' + r + ',' + r + ' 0 1,1 ' + Math.floor(r + r) + ',' + r + ' H' + Math.floor(r + sr) + ' A' + sr + ',' + sr + ' 0 0,0 ' + (r - sr) + ',' + r + ' z'
                });
                svg.appendChild(element);
                element = createSVGElement('path', {
                    'style': 'stroke:none;fill:' + colors[i % 9],
                    'd': 'M0,' + r + ' A' + r + ',' + r + ' 0 0,1 ' + Math.floor(r + r * Math.cos(Math.PI * v)) + ',' + Math.floor(r - r * Math.sin(Math.PI * v)) + 
                    ' L' + Math.floor(r + sr * Math.cos(Math.PI * v)) + ',' + Math.floor(r - sr * Math.sin(Math.PI * v)) + ' A' + sr + ',' + sr + ' 0 0,0 ' + (r - sr) + ',' + r + ' z'
                });
                svg.appendChild(element);
                panel.appendChild(svg);
            }            
            return panel;
        },
        // data: { resource, { start, end } }
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