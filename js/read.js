$(function(){

	// ファイル読み込みボタンが押されたら
	$("#fileInput").change(function(){
		var fileName = $(this).val();	// 読み込みファイル名取得

		if (fileName.match(/\.dfa\b|\.nfa\b/)) {	// ファイル拡張子が.nfa .dfaだったら
			// ファイルの名前を表示
			$("#fileNameSpace").val(fileName);
		} else{
			// ファイル名を表示しない
			$("#fileNameSpace").val("");
		};
	});

	// 新規作成時にエンターキーが押された場合の処理
	$("#symbols").keypress(function(e){
		if (e.which == 13) {
			newCreateGrid();
			return false;
		}
	});
	$("#states").keypress(function(e){
		if (e.which == 13) {
			newCreateGrid();
			return false;
		}
	});

	// モーダルでファイル名入力中にエンターキーが押されたら保存する
	$("#inputFileName").keypress(function(e){
		if (e.which == 13) {
			writeToLocal(createGraphData());
			return false;
		}
	});

	// 最初は遷移表、遷移図の表示スペースを隠す
	$("#gridSpace").hide();
	$("#graphSpace").hide();

});

//**********************************************************************************
// 入力・読み込み用関数
//**********************************************************************************

/**
checkInputData()
	入力された記号文字列と状態数をチェック
	OK-> true
	NG -> false
*/
function checkInputData() {
	var inputSymbols= $("#symbols").val();	// 入力された記号データ
	var inputStateNum = $("#states").val();	// 入力された状態数

	if (inputSymbols == "" && inputStateNum == "") {// データが入力されていなかったら
		alert("データが入力されていません.\n作成に失敗しました.");
		return false;
	} else{
		if (inputSymbols == "") {	// 記号データが未入力
			alert("記号が入力されていません.\n作成に失敗しました.");
			return false;
		}
		if (inputStateNum == "") {	// 状態数が未入力
			alert("状態数が入力されていません.\n作成に失敗しました.");
			return false;
		}
		if (isNaN(parseInt(inputStateNum))) {// 状態数が数字以外
			alert("状態数に数字が入力されていません.\n作成に失敗しました.");
			return false;
		}
	}

	// チェックを通り抜けたら
	return true;
}


/**
newCreateGrid ()
	状態遷移表新規作成
*/
function newCreateGrid () {
	if (checkInputData()) { // チェック通ったら作成

		// 遷移表は表示、遷移図は隠す
		$("#gridSpace").show(100);
		$("#graphSpace").hide();

		var inputSymbols= $("#symbols").val(); // 記号文字列取得
		var symbols = splitComma(inputSymbols);// 記号文字列を記号の配列に変換
		var inputStateNum = $("#states").val();// 状態数取得
		
		// 前回の遷移表,遷移図を削除
		$("#myGrid").empty();
		$("#paper").empty();

		// 状態遷移表データ作成
		var gridData = createGridData(symbols, inputStateNum);
		new Grid("myGrid", {
			srcType : "json", 
			srcData : gridData, 
			allowGridResize : true, 
			allowColumnResize : true, 
			allowClientSideSorting : false, 
			allowSelections : false, 
			allowMultipleSelections : false, 
			showSelectionColumn : true,
			colBGColors : ["#F5F5F5"],
			fixedCols : 3
		});

		// 表を編集可能にする
		$(".g_BodyStatic").attr("contenteditable", "true");

		// ログ表示スペース初期化
		$("#description").val("");
		
	} else{ // 通らなかったら
		// 遷移表,遷移図隠す
		$("#gridSpace").hide();
		$("#graphSpace").hide();
		return;
	}
}

/**
loadGrid ()
	状態遷移表読み込み
*/
function loadGrid () {
	var file = $("#fileInput")[0].files[0]; // ファイルの情報取得
	var reader = new FileReader();

	if (file) {// ファイルが読み込まれていたら
		reader.readAsText(file);
		reader.onload = function(ev){// ファイル読み込み後の処理
			try{// 読み込み(文字列)->JSON変換

				// 文字列をJSONに変換
				var fileData = JSON.parse(ev.target.result);
				var transFormatData = transDataFormat(fileData);
				// console.log(fileData);

				// 未完成データを編集可能にしたいのでエディタ画面でのファイル読み込みチェックは行わない
				// ファイルのフォーマットだけ調べる
				if (checkFileFormat(transFormatData)) { // チェック通ったら遷移表作成

					// 遷移表は表示、遷移図は隠す
					$("#gridSpace").show(100);
					$("#graphSpace").hide();

					// 前回の遷移表,遷移図を削除
					$("#myGrid").empty();
					$("#paper").empty();

					// 状態遷移表データ作成
					var gridData = loadGridData(transFormatData);
					new Grid("myGrid", {
						srcType : "json", 
						srcData : gridData, 
						allowGridResize : true, 
						allowColumnResize : true, 
						allowClientSideSorting : false, 
						allowSelections : false, 
						allowMultipleSelections : false, 
						showSelectionColumn : true,
						colBGColors : ["#F5F5F5"],
						fixedCols : 3
					});

					// 表を編集可能にする
					$(".g_BodyStatic").attr("contenteditable", "true");

					// ログ表示スペース初期化
					$("#description").val() ;

				} else{// 通らなかったらアラート
					alert("ファイルの形式が間違っている可能性があります");
					// 遷移表、遷移図を隠す
					$("#gridSpace").hide();
					$("#graphSpace").hide();

					return;
				}

			}catch(error){
				alert("ファイルの読み込みに失敗しました");
				// 遷移表、遷移図を隠す
				$("#gridSpace").hide();
				$("#graphSpace").hide();

				console.log(error.message);
				return;
			}
		}
	}else {// 読み込まれていなかったらアラート
		alert("ファイルが読み込まれていません");
		return;
	}
}


//**********************************************************************************
// 状態遷移表用関数
//**********************************************************************************

/**
createGridData()
	遷移表新規作成
		symbols : 記号データ ["a", "b", "c", "d"]
		statesNum : 状態数 >=1
	[
		["状態", "初期状態", "終了状態", "symbol1", "symbol2", ...],
		["state1", checkBox, checkBox, 遷移先, 遷移先],
			.
			.
	]
*/
function createGridData (symbols, statesNum) {
	var tableData = new Object;

	var symbolsLength = symbols.length;	// 記号の数
	// symbolsの先頭に文字列を入れる -> ["状態", "初期状態", "終了状態", "a", ...] 
	symbols.unshift("終了状態");
	symbols.unshift("初期状態");
	symbols.unshift("状態");

	var head = [];
	// 表のヘッダ?作成 -> [ ["状態", "初期状態", "終了状態", "a", ...] ]
	head.push(symbols);
	
	var body = new Array;
	// 表の欄作成
	for (var i = 0; i < statesNum; i++) {
		var gridRow = new Array;
		// 表の列作成
		gridRow.push(i.toString(10));	//　状態名を i に
		// 初期状態チェックボックス
		gridRow.push("<input type='checkbox' name='startCheck' value='"+ i +"'>");
		// 終了状態チェックボックス
		gridRow.push("<input type='checkbox' name='endCheck' value='"+ i +"'>");
		// 空白を記号の数だけ
		for (var j = 0; j < symbolsLength; j++) {
			gridRow.push("");
		}

		// 一列完成
		body.push(gridRow);
	}
	tableData["Head"] = head;
	tableData["Body"] = body;
	// console.log(tableData);

	return tableData;
}


/**
loadGridData()
	状態遷移表読み込み
		tableObject
			{
				"links": [
					{"source": "0", "target": "1", "attached": "a"},
				],
				"states": ["0", "1"],
				"startState": ["0"],
				"finishState": ["0"],
				"symbols": ["a", "b"],
				"isDFA": true
			}
*/
function loadGridData(tableObject){
	var head = [];
	var body = [];
	var tableData = new Object;

	var finishState = tableObject["finishState"];	// 終了状態取得
	var isDFA = tableObject["isDFA"];	// DFA(true) NFA(false)取得
	var links = tableObject["links"];	// 遷移関数取得
	var startState = tableObject["startState"];	// 初期状態取得
	var states = tableObject["states"];	// 状態一覧取得
	var symbols = tableObject["symbols"];	// 記号一覧取得

	// symbolsの先頭に文字列を入れる -> ["状態", "初期状態", "終了状態"]
	symbols.unshift("終了状態");
	symbols.unshift("初期状態");
	symbols.unshift("状態");
	head.push(symbols);

	var statesNum = states.length;
	var symbolsLength = symbols.length;
	var linksLength = links.length;

	// 表の欄作成
	for (var i = 0; i < statesNum; i++) {
		var gridRow = new Array;
		gridRow.push(states[i])

		if ($.inArray(states[i], startState) == -1) {// 状態states[i] が初期状態ではなかったら
			gridRow.push("<input type='checkbox' name='startCheck' value="+ states[i] +">");
		} else{	// 初期状態なのでチェックをつける
			gridRow.push("<input type='checkbox' name='startCheck' value="+ states[i] +" checked='checked'>");
		}
    
		if ($.inArray(states[i], finishState) == -1) {// 状態states[i] が終了状態ではなかったら
			gridRow.push("<input type='checkbox' name='endCheck' value="+ states[i] +">");
		} else{// 終了状態なのでチェックをつける
      	gridRow.push("<input type='checkbox' name='endCheck' value="+ states[i] +" checked='checked'>");
		}
   
   	// 遷移関数を走査して欄を作っていく
		for (var j = 3; j < symbolsLength; j++) {
			var hitLinks = new Array;
			for (var k = 0; k < linksLength; k++) {
				if (states[i] == links[k]["source"] 
					&& $.inArray(symbols[j], splitComma(links[k]["attached"])) > -1) {
						hitLinks.push(links[k]["target"]);
				}
			}

			// hitLinks: 状態states[i]から遷移する記号一覧
			if (hitLinks.length == 0) {// 0なら空白
				gridRow.push("");
			} else{
				for (var l = 0; l < hitLinks.length; l++) {
					gridRow.push(hitLinks[l]);
				}
			}
		}
		body.push(gridRow);
	}

	tableData["Head"] = head;
	tableData["Body"] = body;

	// console.log(tableData);

	if (isDFA) {
		$("input[name=radioDFA]").val(["1"]);
	} else{
		$("input[name=radioDFA]").val(["0"]);
	}

	return tableData;
}

/**
getStates()
	遷移表内データ取得
	状態名取得 -> [state1, state2, ...]
*/
function getStates () {
	var fixedBody = $("#myGrid").find(".g_BodyFixed").find(".g_Cl0").find(".g_C");
	var len = fixedBody.length;
	var stateArray = new Array;

	for (var i = 0; i < len; i++) {
		stateArray.push(fixedBody[i].innerHTML);
	}

	return stateArray;
}

/**
getInputSymbol()
	遷移表内データ取得
	記号名取得 -> [symbol1, symbol2, ...]
*/
function getInputSymbol () {
	var staticHead = $("#myGrid").find(".g_HeadStatic").find(".g_C");
	var len = staticHead.length;
	var inputSymbolArray = new Array;
	
	for (var i = 0; i < len; i++) {
		inputSymbolArray.push(staticHead[i].innerHTML);
	}

	return inputSymbolArray;
}

/**
getStateTransitionFunction()
	遷移表内データ取得
	遷移関数取得
*/
function getStateTransitionFunction () {
	var staticHead = $("#myGrid").find(".g_HeadStatic").find(".g_C");
	var headLength = staticHead.length;

	var fixedBody = $("#myGrid").find(".g_BodyFixed").find(".g_Cl0").find(".g_C");
	var bodyLength = fixedBody.length;

	var stateTransitionFunctionArray = new Array;

	for (var i = 0; i < bodyLength; i++) {
		var tempArray = new Array;
		for (var j = 3; j < headLength+3; j++) {
			var temp = $("#myGrid").find(".g_BodyStatic").find(".g_Cl"+j).find("div")[i].innerHTML;
			if(temp == "&nbsp;" || temp == "<br>"){ temp = "";};
			tempArray.push(unescape(temp));
		}
		stateTransitionFunctionArray.push(tempArray);
	}

	return stateTransitionFunctionArray;
}

/**
getStartStateCheck()
	初期状態チェック
	初期状態の配列を返す -> ["state1", "state2"]
*/
function getStartStateCheck() {
	var resultArray = new Array;

	// startCheck　チェックボックスがチェックされていたら
	$("[name='startCheck']:checked").each(function(){
  		resultArray.push($(this).val());
	});
	return resultArray;
}

/**
getFinishStateCheck()
	終了状態チェック
	終了状態の配列を返す -> ["state1", "state2"]
*/
function getFinishStateCheck() {
	var resultArray = new Array;

	// endCheck　チェックボックスがチェックされていたら
	$("[name='endCheck']:checked").each(function(){
  		resultArray.push($(this).val());
	});
	return resultArray;
}

/**
getDFARadio()
	DFA or NFAチェック
	DFA -> true
	NFA -> false
*/
function getDFARadio() {
	// radioDFA ラジオボタンの状態を取得
	var radio = $("[name='radioDFA']:checked").val();

	if (radio == 1) {
		return true;	// DFA
	} else{
		return false;	// NFA
	}
}


/**
createGraphData ()
	遷移表から遷移図データ生成
	{
		links: [
			遷移元,遷移先,遷移する記号
		]
		states: 状態名一覧
		symbols: 記号一覧
		finishState: 終了状態一覧
		startState: 初期状態一覧
		isDFA: true/false(DFA/NFA)
	}
*/
function createGraphData () {
	var graphData = new Object;
	var links = new Array;
	var finishStates = new Array;

	var symbols = getInputSymbol();	// 記号データ
	var states = getStates();	// 状態一覧
	var targets = getStateTransitionFunction();	// 遷移関数

	var symbolsLength = symbols.length;	// 記号データ数
	var statesLength = states.length;	// 状態数

	var isDFA = getDFARadio();	// DFA(true) or NFA(false)

	var temp, attached;
	for (var i=0; i<statesLength; i++) {

		var attaches = new Array;

		for (var j = 0; j < symbolsLength; j++) {
			attached = symbols[j];
			temp = targets[i][j];
			var tempObj = new Object;
			if (temp != "") {
				for (var k = j+1; k < symbolsLength; k++) {
					if (temp == targets[i][k]) {
						attached += "," + symbols[k];
					}
				}
				if (serchInAttached(attaches, attached)) {continue;}
				attaches.push(attached);
				tempObj["source"] = states[i];
				tempObj["target"] = targets[i][j];
				tempObj["attached"] = attached;
				links.push(tempObj);
			}
		}
	}
	graphData["links"] = links;
	graphData["states"] = states;
	graphData["startState"] = getStartStateCheck();
	graphData["finishState"] = getFinishStateCheck();
	graphData["symbols"] = symbols;
	graphData["isDFA"] = isDFA;

	// console.log(graphData);
	return graphData;
}

/**
validateForGrid()
	遷移表内データチェック
	DFA / NFAで処理が変わる
	DFA
		遷移先がない
		遷移先が複数存在している
		遷移不可能(遷移先が状態名一覧のなかに無い)
		初期状態が未選択
		初期状態が複数選択されている
		終了状態が未選択
	NFA
		遷移不可能(遷移先が状態名一覧のなかに無い)
		初期状態が未選択
		終了状態が未選択
*/
function validateForGrid () {

	var inputData = getStateTransitionFunction();
	var inputDataLength = inputData.length;
	var transitionable = getStates();
	var resultArray = new Array;
	var startState = getStartStateCheck();
	var finishState = getFinishStateCheck();
	var isDFA = getDFARadio();
	var flag = false;

	for (var i = 0; i < inputDataLength; i++) {
		var inputDataRows = inputData[i];
		var inputDataRowsLength = inputDataRows.length;
		for (var j = 0; j < inputDataRowsLength; j++) {
			// var symbols = splitString(inputDataRows[j]);
			var symbols = getTranslateArray(inputDataRows[j]);
			if (isDFA) {
				if (symbols.length == 1 && symbols[0] == "") {
					var tempObj = {
						"i": i,
						"j": j,
						"errorType": "何も入力されていない"
					};
					resultArray.push(tempObj);
				}else if(symbols.length >= 2){
					var tempObj = {
						"i": i,
						"j": j,
						"errorType": "遷移先が複数存在"
					};
					resultArray.push(tempObj);
				}else{
					if ($.inArray(symbols[0],transitionable) < 0) {
						var tempObj = {
							"i": i,
							"j": j,
							"errorType": "遷移不可能"
						};
						resultArray.push(tempObj);
					}
				}
			} else{
				if (symbols.length == 1 && symbols[0] == "") {
					continue;
				}else{
					for (var k = 0; k < symbols.length; k++) {
						if ($.inArray(symbols[k],transitionable) < 0) {
							var tempObj = {
								"i": i,
								"j": j,
								"errorType": "遷移不可能"
							};
							resultArray.push(tempObj);
							break;
						}
					}
				}
			}
		}
	}

	if (resultArray.length == 0) {
		flag = true;
	}

	if(finishState.length == 0){
		resultArray.unshift("終了状態未入力\n");
		flag = false;
	}else{
		resultArray.unshift(-1);
	}
	if(startState.length == 0){
		resultArray.unshift("初期状態未入力\n");
		flag = false;
	}else if(isDFA && startState.length >=2){
		resultArray.unshift("初期状態が複数存在\n");
		flag = false;
	}else{
		resultArray.unshift(-1);
	}
	
	printError(resultArray);
	return flag;
}

/**
printError()
	エラー内容表示
	表示先 -> #description
	validateForGrid() 後に実行
*/
function printError(resultArray){
	var textArea = $("#description");
	var text = textArea.val() + "\n";
	var len = resultArray.length;

	var date = new Date();
	var str = text +date.getHours() + "h" + date.getMinutes() + "m" + date.getSeconds() + "s:\n";

	if (resultArray[0] == -1 &&
		 resultArray[1] == -1 &&
		 resultArray.length == 2) {
		str += "OK!\n";
	}

	if(resultArray[0] != -1){
		str += resultArray[0];
	}
	if(resultArray[1] != -1){
		str += resultArray[1];
	}
	
	for (var i = 2; i < len; i++) {
		var tempI = resultArray[i]["i"];
		var tempJ = resultArray[i]["j"];
		var tempE = resultArray[i]["errorType"];
		str += tempI;
		str += "行目の";
		str += tempJ;
		str += "列目: ";
		str += tempE;
		str += "\n";
	}

	textArea.val(str);
}

//**********************************************************************************
// 状態遷移図
//**********************************************************************************

/**
checkFileFormat()
	fileData: ファイルのデータ
	ファイルの形式だけ調べる
*/
function checkFileFormat(fileData){
	if ("links" in fileData 
		&& "states" in fileData 
		&& "startState" in fileData 
		&& "finishState" in fileData
		&& "symbols" in fileData
		&& "isDFA" in fileData) {
		console.log("valid data");
		return true;
	} else{
		console.log("invalid data");
		return false;
	}

}

//**********************************************************************************
// 状態遷移図
//**********************************************************************************

function showGraph(){

	// グラフ表示前に表のチェック
	if (validateForGrid()) {//チェック通ったら
		// 遷移図スペースを表示
		$("#graphSpace").show(100);

		// 前回の遷移図を削除
		$("#paper").empty();

		var graphData = createGraphData();
		var graph = new joint.dia.Graph;
		graph.on('change:position', function(cell) {
			var parentId = cell.get('parent');
			if (!parentId) return;

			var parent = graph.getCell(parentId);
			var parentBbox = parent.getBBox();
			var cellBbox = cell.getBBox();

			if (parentBbox.containsPoint(cellBbox.origin()) &&
				parentBbox.containsPoint(cellBbox.topRight()) &&
				parentBbox.containsPoint(cellBbox.corner()) &&
				parentBbox.containsPoint(cellBbox.bottomLeft())) {
				return;
			}
			cell.set('position', cell.previous('position'));
		});

		var paper = new joint.dia.Paper({
			el: $('#paper'),
			width: 800,
			height: 600,
			gridSize: 1,
			model: graph
		});

		createState(graphData, graph);

		// 遷移図表示スペースにスクロール
		var target = $("#graphSpace");
      var position = target.offset().top;
      var speed = 400;
      $('body,html').animate({scrollTop:position}, speed, 'swing');
	}else{
		alert("作成に失敗しました.\nログを確認して下さい.");
		return;
	}
}




