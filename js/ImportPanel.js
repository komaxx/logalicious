/**
 * Created by matthiasschicker on 04/02/2017.
 */

var logSourceFiles = [];
var rawContent = "";

var loadingDrops = 0;

var importFinishedCallback;

var chosenLogParser;


function readInputFile(file, loadingStartedFunc, loadingDoneFunc){
    // Check for the various File API support.
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser. You\'re fucked.');
        return;
    }

    var reader = new FileReader();
    reader.onloadstart = loadingStartedFunc;
    reader.onerror = function(){
        alert("Could not read file " + file);
        loadingDoneFunc([]);
    };
    reader.onloadend = function () {
        console.log("File loading done.s");
        loadingDoneFunc(reader.result);
    };
    reader.readAsText(file);
}

function chooseParserForCurrentRawInput(){
    chosenLogParser = chooseParser(rawContent);
    hideImporting();
    document.getElementById("import_panel_message").textContent =
        "Using '" + chosenLogParser.name+":' About "
        +chosenLogParser.estimatedLogLines+" log lines will be imported.";
}

function readInputFiles(){
    rawContent = "";
    for (var i = 0, f; f = logSourceFiles[i]; i++) {
        // Read the File objects in this FileList.
        readInputFile(f,
            function (){
                loadingDrops++;
                showImporting();
            }, function(nuRawContent){
                loadingDrops--;
                rawContent = rawContent+nuRawContent;
                if (loadingDrops < 1) {
                    chooseParserForCurrentRawInput();
                }
            }
        );
    }
}

function showImportOverlayForInputFiles(logFiles, finishCallback){
    document.getElementById('import_overlay').style.visibility = "visible";

    importFinishedCallback = finishCallback;
    logSourceFiles = logFiles;

    readInputFiles();
}

function showImportOverlayForPasteEvent(pasteEvent, finishCallback){
    document.getElementById('import_overlay').style.visibility = "visible";

    importFinishedCallback = finishCallback;
    logSourceFiles = [];

    rawContent = "";
    if (pasteEvent.clipboardData.files.length > 0){
        console.log('reading paste data from files');
        logSourceFiles = pasteEvent.clipboardData.files;
        readInputFiles();
    } else {
        rawContent = pasteEvent.clipboardData.getData('text/plain');
        chooseParserForCurrentRawInput();
    }
}


/**
 * We're working. Show an activity flag.
 */
function showImporting(){
    document.getElementById("import_panel_title").textContent = "Importing  ...";
}

/**
 * No longer working. Hide activity flag.
 */
function hideImporting(){
    document.getElementById("import_panel_title").textContent = "Importing";
}

function finishImport(){
    hideImportOverlay();

    console.log("Parsing started...");
    var nuEntries = chosenLogParser.parseAll(rawContent);
    console.log(".. finished");
    console.log("Callback ...");
    importFinishedCallback(nuEntries);
    console.log(".. finished");
}

function initImportOverlay() {
    document.getElementById('btn_confirm_import').addEventListener('click', finishImport, false);
}
