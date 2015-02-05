//*----------------------------------------------------------------
//* 処理その他
//*----------------------------------------------------------------

/**
getProcessStr()
    num: 処理番号
    numから処理名の文字列を返す
*/
function getProcessStr(num){
    var result;
    switch(num){
        case 0:
            result = "NFA->DFA";
            break;
        case 1:
            result = "最小化";
            break;
        case 2:
            result = "補集合";
            break;
        case 3:
            result = "閉包";
            break;
        case 4:
            result = "和集合";
            break;
        case 5:
            result = "差集合";
            break;
        case 6:
            result = "積集合";
            break;
        case 7:
            result = "連接";
            break;
    }
    return result;
}

//**********************************************************************************
// データ保存
//**********************************************************************************

/**
writeToLocal()
    graphData: 保存するデータ
    graphDataがDFAだったら.dfa,NFAだったら.nfaファイルを作る
    ファイル名は#inputFileNameの値を使う
    writeToLocal()が呼ばれたら自動でダウンロードが始まる
*/
function writeToLocal(graphData){
    var fileName = "";
    if (graphData["isDFA"]) {// DFAだったら
        fileName = $("#inputFileName").val() + ".dfa";// .dfaファイルを作る
    } else{
        fileName = $("#inputFileName").val() + ".nfa";// .nfaファイルを作る
    }
    var json = JSON.stringify(graphData);
    var blob = new Blob([json], {type: "text/plain"});

    if (window.navigator.msSaveBlob) {// ブラウザがIEだったら (IE >= 10)
        console.log("save: Internet Explorer");
        window.navigator.msSaveBlob(blob, fileName); 
    } else {// GoogleChromeとFireFoxだけ
        console.log("save: GoogleChrome, FireFox");
        var url = (window.URL || window.webkitURL);
        var data = url.createObjectURL(blob);
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        a.href = data;
        a.download = fileName;   
        a.dispatchEvent(e);
    }
}



//*----------------------------------------------------------------
//* 遷移図データチェック
//*----------------------------------------------------------------

/**
checkLoadData()
    読み込まれたファイルをチェック
    OK-> true
    NG -> false
*/
function checkLoadData(jsonData){
    
    var isDFA = jsonData["isDFA"];  // DFA(true)/NFA(false)取得
    var links = jsonData["links"];  // 遷移関数取得
    var states = jsonData["states"]; // 状態一覧取得

    var startStateNum = jsonData["startState"].length;  // 初期状態数取得
    var finishStateNum = jsonData["finishState"].length;    // 終了状態数取得
    var linksNum = jsonData["links"].length;    // 遷移関数の数取得

    if (isDFA && startStateNum != 1) {// DFA && 初期状態が２つ以上(もしくは0こ)ある
        return false;
    }

    if (!isDFA && startStateNum == 0) {// NFA && 初期状態が0こ
        return false;
    }

    if(finishStateNum == 0){    // 終了状態が0こ
        return false;
    }

    for (var i = 0; i < linksNum; i++) {
        // 遷移関数で示されている状態が状態一覧にあるか
        if ($.inArray(links[i]["source"],states) < 0 ||
             $.inArray(links[i]["target"],states) < 0 
            ) {
            // なかったらfalse
            return false;
        }
    }

    // チェック通ったらtrue
    return true;
}

//*----------------------------------------------------------------
//* 遷移図データ変換
//*----------------------------------------------------------------

/**
transDataFormat()
    [A|B]となっている表データを{A,B}の形にする
*/
function transDataFormat(data){

    var links = data["links"];
    var linksLength =links.length;
    var states = data["states"];
    var statesLength = states.length;
    var startState = data["startState"];
    var startStateLength = startState.length;
    var finishState = data["finishState"];
    var finishStateLength = finishState.length;

    var newLinks = new Array;
    for (var i = 0; i < linksLength; i++) {
        var tempLink = new Object;
        tempLink["source"] = replaceJavaToJson(links[i]["source"]);
        tempLink["target"] = replaceJavaToJson(links[i]["target"]);
        tempLink["attached"] = links[i]["attached"];
        newLinks.push(tempLink);
    }

    var newStates = new Array;
    for (var i = 0; i < statesLength; i++) {
        newStates.push(replaceJavaToJson(states[i]));
    }

    var newStartState = new Array;
    for (var i = 0; i < startStateLength; i++) {
        newStartState.push(replaceJavaToJson(startState[i]));
    }

    var newFinishState = new Array;
    for (var i = 0; i < finishStateLength; i++) {
        newFinishState.push(replaceJavaToJson(finishState[i]));
    }

    var newData = new Object;
    newData["links"] = newLinks;
    newData["states"] = newStates;
    newData["startState"] = newStartState;
    newData["finishState"] = newFinishState;
    newData["symbols"] = data["symbols"];
    newData["isDFA"] = data["isDFA"];

    return newData;
}

/**
replaceJavaToJson()
    文字列[A|B]を{A,B}に置き換え
    [A|B]の形でない場合置き換わらない
*/
function replaceJavaToJson(str){
    var temp1,temp2,temp3;
    temp1 = str.replace(/\[/g, "{");
    temp2 = temp1.replace(/\]/g, "}");
    temp3 = temp2.replace(/\|/g, ",");
    return temp3;
}

//*----------------------------------------------------------------
//* 遷移図svg作成
//*----------------------------------------------------------------

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
        var t = 2.0 * Math.PI * (i) / stateLen;
        var x = 200 * Math.cos(t)+230;
        var y = 200 * Math.sin(t)+250;
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
