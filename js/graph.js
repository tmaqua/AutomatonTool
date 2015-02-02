function state(x, y, label, graph) {
    
    var cell = new joint.shapes.fsa.State({
        position: { x: x, y: y },
        size: { width: 60, height: 60 },
        attrs: { text : { text: label }}
    });
    graph.addCell(cell);
    return cell;
};

function endState(x, y, label, graph) {
    var innerCell = new joint.shapes.fsa.State({
        position: { x: x+5, y: y+5 },
        size: { width: 50, height: 50 },
        attrs: { text : { text: label }}
    });
    
    var outerCell = new joint.shapes.fsa.State({
        position: { x: x, y: y },
        size: { width: 60, height: 60 },
        attrs: { text : { text: label }}
    });

    outerCell.embed(innerCell);
    graph.addCell([outerCell, innerCell]);
    return outerCell;
}

function link(source, target, label, vertices, graph) {
    
    var cell = new joint.shapes.fsa.Arrow({
        source: { id: source.id },
        target: { id: target.id },
        labels: [{ position: .5, attrs: { text: { text: label || '', 'font-weight': 'bold' } } }],
        vertices: vertices || [],
        attrs: {".connection": {stroke: "blue"}, ".marker-target": {fill: "blue"}},
    });
    graph.addCell(cell);
    return cell;
}

function createStartCell(graph) {
	var start = new joint.shapes.fsa.StartState({
		position: { x: 50, y: 50 },
		attrs: { circle: { fill: "white"}},
	});
	graph.addCell(start);
	return start;
}

function createState(graphData, graph) {
    var stateLen = graphData.states.length;
    var linksLen = graphData.links.length;
    var cells = new Array;
    var start = createStartCell(graph);

    for (var i = 0; i < stateLen; i++) {
        // var x = y = 100+100*i;
        var t = 2.0 * Math.PI * (i) / stateLen;
        var x = 230 * Math.cos(t)+400;
        var y = 230 * Math.sin(t)+300;
        var label = graphData.states[i];
        var temp;
        if (graphData.finishState.indexOf(label) == -1) {
            temp = state(x, y, label, graph);
        } else{
            temp = endState(x, y, label, graph);
        }
        
        cells.push(temp);
    }

    for (var i = 0; i < linksLen; i++) {
        var source = graphData.links[i].source;
        var target = graphData.links[i].target;
        var attached = graphData.links[i].attached;

        if (source == target) {
            var temp = cells[serchCell(source, cells)];
            link(temp, temp, attached, [{x: temp.attributes.position.x,
                                         y: temp.attributes.position.y-50},
                                        {x: temp.attributes.position.x+60,
                                         y: temp.attributes.position.y-50},],graph);
            continue;
        }

        var sourceState = cells[serchCell(source, cells)];
        var targerState = cells[serchCell(target, cells)];

        link(sourceState, targerState, attached, [],graph);
    }

    for(var i=0; i<graphData.startState.length; i++){
        link(start, cells[serchCell(graphData.startState[i],cells)], "start", [],graph);
    }
}

function serchCell(name, cells) {
    var cellsLen = cells.length;
    for (var i = 0; i < cellsLen; i++) {
        if (name == cells[i].attributes.attrs.text.text) {
            return i;
        }
    }
    return -1;
}
