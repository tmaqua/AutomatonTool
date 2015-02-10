$(function(){

	// ファイル読み込みボタンが押されたら
	$("#fileInput1").change(function(){
		var fileName = $(this).val();	// 読み込みファイル名取得
		var radio = getFusionRadio();	// 処理番号
		if ((radio == 0 && fileName.match(/\.nfa\b/)) // 処理番号0でNFAが読み込まれたら
			|| (radio != 0 && fileName.match(/\.dfa\b/))) {// 処理番号0以外でDFAが読み込まれたら
				$("#fileNameSpace1").val(fileName);	// ファイルの名前を表示
		}else{
			// ファイル名を表示しない
			$("#fileNameSpace1").val("");
		}
	});

	// ファイル読み込みボタンが押されたら
	$("#fileInput2").change(function(){
		var fileName = $(this).val();	// 読み込みファイル名取得
		var radio = getFusionRadio();	// 処理番号
		if ((radio == 0 && fileName.match(/\.nfa\b/)) // 処理番号0でNFAが読み込まれたら
			|| (radio != 0 && fileName.match(/\.dfa\b/))) {// 処理番号0以外でDFAが読み込まれたら
				$("#fileNameSpace2").val(fileName);	// ファイルの名前を表示
		}else{
			// ファイル名を表示しない
			$("#fileNameSpace2").val("");
		}
	});

	// 各保存ボタンが押されたらダウンロードするデータを決める
	$("#saveNFA").click(function(){
		downloadData = tempData["NFA"];
	});

	$("#saveDFA").click(function(){
		downloadData = tempData["DFA"];
	});

	$("#saveMin").click(function(){
		downloadData = tempData["Min"];
	});

	// モーダルでファイル名入力中にエンターキーが押されたら保存する
	$("#inputFileName").keypress(function(e){
		var pressKey = e.which ? e.which : e.keyCode;
		if (pressKey == 13) {
			writeToLocal(downloadData);
			return false;
		}
	});

	// 最初は遷移図の表示スペース,DOM"file2"を隠す
	$("#graphSpace").hide();
	$("#file2").hide();

	// チェックボックスのデフォルト設定
	setCheckBox();

	// 遷移表表示領域初期化
	initGraphSpace();

});

// ダウンロード用のグラフデータ
var downloadData,tempData;
// 遷移表表示用データ
var graph_src1, graph_src2, graph_nfa, graph_dfa, graph_min;
var paper_src1, paper_src2, paper_nfa, paper_dfa, paper_min;

//*----------------------------------------------------------------
//* DOMの値取得、編集系
//*----------------------------------------------------------------

/**
getFusionRadio()
	fusionRadio の値を取得
	intにして返す
*/
function getFusionRadio(){
	var radio = $("input[name='fusionRadio']:checked").val();
	return parseInt(radio);
}

/**
toHideFileInput2()
	getFusionRadio()の値が0-3だったらDOM"file2"を隠す
	4-7だったら表示
	setCheckBox()によってチェックボックスのデフォルト設定をする
*/
function toHideFileInput2(){
	var radio = getFusionRadio();
	if (radio < 4) {// DOMを隠す
		$("#file2").hide(100);
	} else{
		$("#file2").show(100);
	}
	setCheckBox();
}

/**
getCheckBox_showSrc()
	DOM"checkbox_showSrc"がチェックされているか
	true/false
*/
function getCheckBox_showSrc(){
	return $("#checkbox_showSrc").prop("checked");
}

/**
getCheckBox_toDFA()
	DOM"checkbox_toDFA"がチェックされているか
	true/false
*/
function getCheckBox_toDFA(){
	return $("#checkbox_toDFA").prop("checked");
}

/**
getCheckBox_toMin()
	DOM"checkbox_toMin"がチェックされているか
	true/false
*/
function getCheckBox_toMin(){
	return $("#checkbox_toMin").prop("checked");
}

/**
setCheckBox()
	DOM"fusionRadio"ラジオボタンを選択したらその値によって
	DOM"checkbox_toDFA", "checkbox_toMin"のデフォルトチェックを変える
	"checkbox_showSrc"はチェックを外すようにする
*/
function setCheckBox(){
	var radio = getFusionRadio();
	$("#checkbox_showSrc").prop("checked", false);// チェックしない

	switch(radio){
		case 0:// NFA->DFA
			$("#checkbox_toDFA").prop("checked", false);// チェックしない
			$("#checkbox_toMin").prop("checked", false);// チェックしない
			$("#checkbox_toDFA").prop("disabled", true);// 変更させない
			$("#checkbox_toMin").prop("disabled", false);// 変更を許可
			break;
		case 1:// 最小化
			$("#checkbox_toDFA").prop("checked", false);// チェックしない
			$("#checkbox_toMin").prop("checked", true);// チェックする
			$("#checkbox_toDFA").prop("disabled", true);// 変更させない
			$("#checkbox_toMin").prop("disabled", true);// 変更させない
			break;
		case 2:// 補集合
			$("#checkbox_toDFA").prop("checked", false);// チェックしない
			$("#checkbox_toMin").prop("checked", false);// チェックしない
			$("#checkbox_toDFA").prop("disabled", true);// 変更させない
			$("#checkbox_toMin").prop("disabled", false);// 変更を許可
			break;
		case 3:// 閉包
			$("#checkbox_toDFA").prop("checked", false);// チェックしない
			$("#checkbox_toMin").prop("checked", false);// チェックしない
			$("#checkbox_toDFA").prop("disabled", false);// 変更を許可
			$("#checkbox_toMin").prop("disabled", false);// 変更を許可
			break;
		case 4:// 和集合
			$("#checkbox_toDFA").prop("checked", false);// チェックしない
			$("#checkbox_toMin").prop("checked", false);// チェックしない
			$("#checkbox_toDFA").prop("disabled", true);// 変更させない
			$("#checkbox_toMin").prop("disabled", false);// 変更を許可
			break;
		case 5:// 差集合
			$("#checkbox_toDFA").prop("checked", false);// チェックしない
			$("#checkbox_toMin").prop("checked", false);// チェックしない
			$("#checkbox_toDFA").prop("disabled", true);// 変更させない
			$("#checkbox_toMin").prop("disabled", false);// 変更を許可
			break;
		case 6:// 積集合
			$("#checkbox_toDFA").prop("checked", false);// チェックしない
			$("#checkbox_toMin").prop("checked", false);// チェックしない
			$("#checkbox_toDFA").prop("disabled", true);// 変更させない
			$("#checkbox_toMin").prop("disabled", false);// 変更を許可
			break;
		case 7:// 連接
			$("#checkbox_toDFA").prop("checked", false);// チェックしない
			$("#checkbox_toMin").prop("checked", false);// チェックしない
			$("#checkbox_toDFA").prop("disabled", false);// 変更を許可
			$("#checkbox_toMin").prop("disabled", false);// 変更を許可
			break;
	}
}


//*----------------------------------------------------------------
//* ファイル読み込み
//*----------------------------------------------------------------

/**
fusionRequest()
	ファイル読み込み後,サーバにデータを送る
	そのレスポンスデータで遷移図を作成
*/
function fusionRequest(){
	$("submitButton").prop("disabled", true);// 多重送信防止にボタンを押させないようにする

	var radio = getFusionRadio();	// 処理の番号
	var reader = new FileReader();

	if (radio < 4) {// 0-3の処理
		var file1 = $("#fileInput1")[0].files[0];// 1つ目のファイル
		if (file1) {// ファイルが読み込まれていたら
			try{
				reader.readAsText(file1);// ファイル1取得準備
				reader.onload = function(ev){// ファイル1取得
					var file1Data = JSON.parse(ev.target.result);// file1データをjsonに
					// file1Data をチェック
					if (checkLoadData(file1Data)) {
						// リクエストオブジェクト作成
						var request = new Object;
						request["data1"] = JSON.stringify(file1Data);
						request["data2"] = null;
						request["operator"] = radio;
						request["toMinimum"] = getCheckBox_toMin();
						request["toDFA"] = getCheckBox_toDFA();

						// Ajax通信開始
						$.ajax({
							type:"get",
							url:"/FusionRequest/Fusion",
							data:request,
							contentType: 'application/json',
							dataType: "json",
							success: function(response) {   // 200 OK時
								// 成功時処理
								console.log("***success***");
								console.log(response);

								// 遷移図作成用データ
								var graphData = new Object;
								graphData["srcData1"] = file1Data;
								graphData["srcData2"] = null;
								
								if (response["responseData"]["dfa"] == null) {
									graphData["DFA"] = null;
								} else{
									graphData["DFA"] = convertGatherLink(response["responseData"]["dfa"]);
								}
								if (response["responseData"]["nfa"] == null) {
									graphData["NFA"] = null;
								} else{
									graphData["NFA"] = convertGatherLink(response["responseData"]["nfa"]);
								}
								if (response["responseData"]["minDFA"] == null) {
									graphData["Min"] = null;
								} else{
									graphData["Min"] = convertGatherLink(response["responseData"]["minDFA"]);
								}

								// 遷移図作成
								createGraph(graphData);
							},
							error: function() {// エラー処理
								alert("サーバ側でエラーが発生しました.\n時間をおいて再度試してください.");

								// テスト用コード
								// 遷移図作成用データ
								// var testData = {
								// 	"links": [
								// 		{"source": "[0|0']", "target": "1", "attached": "a"},
								// 		{"source": "[0|0']", "target": "[0|0']", "attached": "b"},
								// 		{"source": "1", "target": "[0|0']", "attached": "b"},
								// 		{"source": "1", "target": "1", "attached": "a"}
								// 	],
								// 	"states": ["[0|0']", "1"],
								// 	"startState": ["[0|0']"],
								// 	"finishState": ["1"],
								// 	"symbols": ["a", "b"],
								// 	"isDFA": true
								// };
								// var graphData = new Object;
								// graphData["srcData1"] = file1Data;
								// graphData["srcData2"] = null;
								// graphData["DFA"] = testData;
								// graphData["NFA"] = testData;
								// graphData["Min"] = testData;

								// // 遷移図作成
								// createGraph(graphData);
							},
							complete: function() {// 完了処理(必ず実行)
								console.log("*** complete ***");
								$("submitButton").prop("disabled", false);
							}
						});
					} else{
						// alert出してボタンを押せるようにして終了
						alert("ファイルの読み込みに失敗しました.\nファイルのデータが間違っている可能性があります.");
   					$("submitButton").prop("disabled", false);
   					return;
					}
				}
			}catch(error){
				alert("ファイルの読み込みに失敗しました.\nファイルが間違っている可能性があります.");
				$("submitButton").prop("disabled", false);
				console.log(error.message);
				return;
			}
		} else{// 読み込まれていなかったら
			// alert出してボタンを押せるようにして終了
			alert("ファイルが入力されていません.");
   		$("submitButton").prop("disabled", false);
   		return;
		}
	} else{// 4-7の処理
		var file1 = $("#fileInput1")[0].files[0];// 1つ目のファイル
		var file2 = $("#fileInput2")[0].files[0];// 2つ目のファイル
		if (file1 && file2) {// ファイルが読み込まれていたら
			try{
				reader.readAsText(file1);// ファイル1取得準備
				reader.onload = function(ev){// ファイル1取得
					var file1Data = JSON.parse(ev.target.result);// file1データをjsonに
					reader.readAsText(file2);// ファイル2取得準備
					reader.onload = function(ev){// ファイル2取得
						var file2Data = JSON.parse(ev.target.result);// file2データをjsonに

						// file1Data と file2Dataをチェック
						if (checkLoadData(file1Data) && checkLoadData(file2Data)) {
							// リクエストオブジェクト作成
							var request = new Object;
							request["data1"] = JSON.stringify(file1Data);
							request["data2"] = JSON.stringify(file2Data);
							request["operator"] = radio;
							request["toMinimum"] = getCheckBox_toMin();
							request["toDFA"] = getCheckBox_toDFA();

							// Ajax通信開始
							$.ajax({
								type:"get",
								url:"/FusionRequest/Fusion",
								data:request,
								contentType: 'application/json',
								dataType: "json",
								success: function(response) {   // 200 OK時
									// 成功時処理
									console.log("***success***");
									console.log(response);

									// 遷移図作成用データ
									var graphData = new Object;
									graphData["srcData1"] = file1Data;
									graphData["srcData2"] = file2Data;

									if (response["responseData"]["dfa"] == null) {
										graphData["DFA"] = null;
									} else{
										graphData["DFA"] = convertGatherLink(response["responseData"]["dfa"]);
									}
									if (response["responseData"]["nfa"] == null) {
										graphData["NFA"] = null;
									} else{
										graphData["NFA"] = convertGatherLink(response["responseData"]["nfa"]);
									}
									if (response["responseData"]["minDFA"] == null) {
										graphData["Min"] = null;
									} else{
										graphData["Min"] = convertGatherLink(response["responseData"]["minDFA"]);
									}
									

									// 遷移図作成
									createGraph(graphData);

								},
								error: function() {// エラー処理
									alert("サーバ側でエラーが発生しました.\n時間をおいて再度試してください.");

									// // testData
									// var testData = {
									// 	"links": [
									// 		{"source": "[0|0'|z]", "target": "1", "attached": "a"},
									// 		{"source": "[0|0'|z]", "target": "[0|0'|z]", "attached": "b"},
									// 		{"source": "1", "target": "[0|0'|z]", "attached": "b"},
									// 		{"source": "1", "target": "1", "attached": "a"}
									// 	],
									// 	"states": ["[0|0'|z]", "1"],
									// 	"startState": ["[0|0'|z]"],
									// 	"finishState": ["1"],
									// 	"symbols": ["a", "b"],
									// 	"isDFA": true
									// };
									// // 遷移図作成用データ
									// var graphData = new Object;
									// graphData["srcData1"] = file1Data;
									// graphData["srcData2"] = file2Data;
									// graphData["DFA"] = testData;
									// graphData["NFA"] = testData;
									// graphData["Min"] = testData;

									// // 遷移図作成
									// createGraph(graphData);
								},
								complete: function() {// 完了処理(必ず実行)
									console.log("*** complete ***");
									$("submitButton").prop("disabled", false);
								}
							});
						} else{
							// alert出してボタンを押せるようにして終了
							alert("ファイルの読み込みに失敗しました.\nファイルのデータが間違っている可能性があります.");
   						$("submitButton").prop("disabled", false);
   						return;
						}
					}
				}
			}catch(error){
				alert("ファイルの読み込みに失敗しました.\nファイルが間違っている可能性があります.");
				$("submitButton").prop("disabled", false);
				console.log(error.message);
				return;
			}
		} else{// 読み込まれていなかったら
			// alert出してボタンを押せるようにして終了
			alert("ファイルが入力されていません.");
   		$("submitButton").prop("disabled", false);
   		return;
		}
	}
}


//*----------------------------------------------------------------
//* 遷移図作成
//*----------------------------------------------------------------

/**
initGraphSpace()
	遷移表表示領域を作成
	表示領域はグローバル
*/
function initGraphSpace(){

	graph_src1 = new joint.dia.Graph;
	graph_src1.on('change:position', function(cell) {
		var parentId = cell.get('parent');
		if (!parentId) return;

		var parent = graph_src1.getCell(parentId);
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

	graph_src2 = new joint.dia.Graph;
	graph_src2.on('change:position', function(cell) {
		var parentId = cell.get('parent');
		if (!parentId) return;

		var parent = graph_src2.getCell(parentId);
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

	graph_nfa = new joint.dia.Graph;
	graph_nfa.on('change:position', function(cell) {
		var parentId = cell.get('parent');
		if (!parentId) return;

		var parent = graph_nfa.getCell(parentId);
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

	graph_dfa = new joint.dia.Graph;
	graph_dfa.on('change:position', function(cell) {
		var parentId = cell.get('parent');
		if (!parentId) return;

		var parent = graph_dfa.getCell(parentId);
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

	graph_min = new joint.dia.Graph;
	graph_min.on('change:position', function(cell) {
		var parentId = cell.get('parent');
		if (!parentId) return;

		var parent = graph_min.getCell(parentId);
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

	paper_src1 = new joint.dia.Paper({
		el: $("#graphSpace_src1"),
		width: 500,
		height: 500,
		gridSize: 1,
		model: graph_src1
	});

	paper_src2 = new joint.dia.Paper({
		el: $("#graphSpace_src2"),
		width: 500,
		height: 500,
		gridSize: 1,
		model: graph_src2
	});

	paper_nfa = new joint.dia.Paper({
		el: $("#graphSpace_NFA1"),
		width: 500,
		height: 500,
		gridSize: 1,
		model: graph_nfa
	});

	paper_dfa = new joint.dia.Paper({
		el: $("#graphSpace_DFA1"),
		width: 500,
		height: 500,
		gridSize: 1,
		model: graph_dfa
	});

	paper_min = new joint.dia.Paper({
		el: $("#graphSpace_Min1"),
		width: 500,
		height: 500,
		gridSize: 1,
		model: graph_min
	});
}

/**
createGraph()
	遷移図を作成・表示
	graphData: サーバからのレスポンスデータ
*/
function createGraph(graphData){
	tempData = graphData; // ダウンロード用にデータをグローバルにコピー

	var showSrc = getCheckBox_showSrc(); // 入力データを表示するか
	var toDFA = getCheckBox_toDFA();	// NFAをDFAにするか
	var toMin = getCheckBox_toMin();	// 最小化するか
	var radio = getFusionRadio(); // 処理の番号
	var radioStr = getProcessStr(radio);

	// 親表示スペース
	$("#graphSpace").show();

	// 最初は子要素全部隠しておく
	$("#graphSpace_src").hide();
	$("#graphSpace_NFA").hide();
	$("#graphSpace_DFA").hide();
	$("#graphSpace_Min").hide();

	// 表示スペース初期化
	clearGraphSpace();

	// 表示スペースの見出しを変更
	$("#graphSpace_NFA_header").text("出力結果:"+ radioStr +"(NFA)");
	$("#graphSpace_DFA_header").text("出力結果:"+ radioStr +"(DFA)");
	$("#graphSpace_Min_header").text("出力結果:"+ radioStr +"(最小化)");

	if (showSrc) {// 入力データを表示
		$("#graphSpace_src").show();
		if (graphData["srcData2"] == null) {
			createGraphData("#graphSpace_src1", graphData["srcData1"]);
		} else{
			createGraphData("#graphSpace_src1", graphData["srcData1"]);
			createGraphData("#graphSpace_src2", graphData["srcData2"]);
		}
	}

	if (radio == 3 || radio == 7) {// 処理が閉包か連接の時
		// 閉包,連接はNFA,DFAが返ってくる
		if (toDFA) {
			$("#graphSpace_NFA").show();
			$("#graphSpace_DFA").show();
			createGraphData("#graphSpace_NFA1", graphData["NFA"]);
			createGraphData("#graphSpace_DFA1", graphData["DFA"]);
		} else{
			$("#graphSpace_NFA").show();
			createGraphData("#graphSpace_NFA1", graphData["NFA"]);
		}
	}else{
		// それ以外の処理はDFAしか返ってこない
		$("#graphSpace_DFA").show();
		createGraphData("#graphSpace_DFA1", graphData["DFA"]);
	}

	if (toMin && radio != 1) {// 最小化されたデータを表示(選択された処理が最小化の時以外)
		// radio = 1の時(最小化の時)はgraphData["DFA"]がすでに最小化になっている
		$("#graphSpace_Min").show();
		createGraphData("#graphSpace_Min1", graphData["Min"]);
	}

	// 遷移図表示スペースにスクロール
	var target = $("#graphSpace");
	var position = target.offset().top;
	var speed = 400;
	$('body,html').animate({scrollTop:position}, speed, 'swing');

}

/**
clearGraphSpace()
	遷移図表示スペースをクリア
*/
function clearGraphSpace(){
	graph_src1.clear();
	graph_src2.clear();
	graph_nfa.clear();
	graph_dfa.clear();
	graph_min.clear();
}

/**
createGraphData()
	指定されたdivに遷移図を作成
	space: 指定divのid
	data: 作成する遷移図データ
*/
function createGraphData(space, data){
	switch(space){
		case "#graphSpace_src1":
			createState(transDataFormat(data), graph_src1);
			break;
		case "#graphSpace_src2":
			createState(transDataFormat(data), graph_src2);
			break;
		case "#graphSpace_NFA1":
			createState(transDataFormat(data), graph_nfa);
			break;
		case "#graphSpace_DFA1":
			createState(transDataFormat(data), graph_dfa);
			break;
		case "#graphSpace_Min1":
			createState(transDataFormat(data), graph_min);
			break;
	}
	return false;
}

