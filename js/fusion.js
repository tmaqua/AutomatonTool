$(function(){

	// ファイル読み込みボタンが押されたら
	$("#fileInput1").change(function(){
		var fileName = $(this).val();	// 読み込みファイル名取得
		if (fileName.match(/\.dfa\b|\.nfa\b/)) {	// ファイル拡張子が.nfa .dfaだったら
			// ファイルの名前を表示
			$("#fileNameSpace1").val(fileName);
		} else{
			// ファイル名を表示しない
			$("#fileNameSpace1").val("");
		}
	});

	// ファイル読み込みボタンが押されたら
	$("#fileInput2").change(function(){
		var fileName = $(this).val();	// 読み込みファイル名取得
		if (fileName.match(/\.dfa\b|\.nfa\b/)) {	// ファイル拡張子が.nfa .dfaだったら
			// ファイルの名前を表示
			$("#fileNameSpace2").val(fileName);
		} else{
			// ファイル名を表示しない
			$("#fileNameSpace2").val("");
		}
	});

	// 最初は遷移図の表示スペース,DOM"file2"を隠す
	$("#graphSpace").hide();
	$("#file2").hide();

	// チェックボックスのデフォルト設定
	setCheckBox();
});

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
	if (radio < 3) {// DOMを隠す
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
							url:"FusionRequest/Fusion",
							data:request,
							contentType: 'application/json',
							dataType: "json",
							success: function(response) {   // 200 OK時
								//json Arrayの先頭が成功フラグ、失敗の場合2番目がエラーメッセージ
								if (!response[0]) {    // サーバが失敗を返した場合
									alert("Transaction error. " + response[1]);
									return;
								}
								// 成功時処理
								console.log("***success***");
								console.log(response);

								// 遷移図作成用データ
								var graphData = new Object;
								graphData["srcData1"] = file1Data;
								graphData["srcData2"] = null;
								graphData["DFA"] = response["responseData"]["dfa"];
								graphData["NFA"] = response["responseData"]["nfa"];
								graphData["Min"] = response["responseData"]["min"];

								// 遷移図作成
								createGraph(graphData);

							},
							error: function() {// エラー処理
								alert("サーバ側でエラーが発生しました.\n時間をおいて再度試してください.");
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
								url:"FusionRequest/Fusion",
								data:request,
								contentType: 'application/json',
								dataType: "json",
								success: function(response) {   // 200 OK時
									//json Arrayの先頭が成功フラグ、失敗の場合2番目がエラーメッセージ
									if (!response[0]) {    // サーバが失敗を返した場合
										alert("Transaction error. " + response[1]);
										return;
									}
									// 成功時処理
									console.log("***success***");
									console.log(response);

									// 遷移図作成用データ
									var graphData = new Object;
									graphData["srcData1"] = file1Data;
									graphData["srcData2"] = file2Data;
									graphData["DFA"] = response["responseData"]["dfa"];
									graphData["NFA"] = response["responseData"]["nfa"];
									graphData["Min"] = response["responseData"]["min"];

									// 遷移図作成
									createGraph(graphData);

								},
								error: function() {// エラー処理
									alert("サーバ側でエラーが発生しました.\n時間をおいて再度試してください.");
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
//* ファイルチェック
//*----------------------------------------------------------------

/**
checkLoadData()
	読み込まれたファイルをチェック
	OK-> true
	NG -> false
*/
function checkLoadData(jsonData){
	
	var isDFA = jsonData["isDFA"];	// DFA(true)/NFA(false)取得
	var links = jsonData["links"];	// 遷移関数取得
	var states = jsonData["states"]; // 状態一覧取得

	var startStateNum = jsonData["startState"].length;	// 初期状態数取得
	var finishStateNum = jsonData["finishState"].length;	// 終了状態数取得
	var linksNum = jsonData["links"].length;	// 遷移関数の数取得

	if (isDFA && startStateNum != 1) {// DFA && 初期状態が２つ以上(もしくは0こ)ある
		return false;
	}

	if (!isDFA && startStateNum == 0) {// NFA && 初期状態が0こ
		return false;
	}

	if(finishStateNum == 0){	// 終了状態が0こ
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
//* 遷移図作成
//*----------------------------------------------------------------

/**
createGraph()
	遷移図を作成・表示
	graphData: サーバからのレスポンスデータ
*/
function createGraph(graphData){
	var showSrc = getCheckBox_showSrc(); // 入力データを表示するか
	var toDFA = getCheckBox_toDFA();	// NFAをDFAにするか
	var toMin = getCheckBox_toMin();	// 最小化するか
	var radio = getFusionRadio(); // 処理の番号

	// 最初は全部隠しておく
	$("#graphSpace_src").hide();
	$("#graphSpace_NFA").hide();
	$("#graphSpace_DFA").hide();
	$("#graphSpace_Min").hide();

	// 表示スペース初期化
	initGraphSpace();

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
			createGraphData("#graphSpace_NFA1", graphData["NFA"]);
			createGraphData("#graphSpace_DFA1", graphData["DFA"]);
		} else{
			createGraphData("#graphSpace_NFA1", graphData["NFA"]);
		}
	}else{
		// それ以外の処理はDFAしか返ってこない
		createGraphData("#graphSpace_DFA1", graphData["DFA"]);
	}

	if (toMin && radio != 1) {// 最小化されたデータを表示(選択された処理が最小化の時以外)
		// radio = 1の時(最小化の時)はgraphData["DFA"]がすでに最小化になっている
		createGraphData("#graphSpace_Min1", graphData["Min"]);
	}
}

/**
initGraphSpace()
	遷移図表示スペースを初期化
*/
function initGraphSpace(){
	$("#graphSpace_src1").empty();
	$("#graphSpace_src2").empty();
	$("#graphSpace_NFA1").empty();
	$("#graphSpace_DFA1").empty();
	$("#graphSpace_Min1").empty();
}

/**
createGraphData()
	指定されたdivに遷移図を作成
	space: 指定divのid
	data: 作成する遷移図データ
*/
function createGraphData(space, data){
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
		el: $(space),
		width: 800,
		height: 600,
		gridSize: 1,
		model: graph
	});

	createState(data, graph);
}


