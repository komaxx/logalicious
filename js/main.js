var logEntries = [];

var selectedLogEntryId = null;
var relativeDateAnchor = null;



function getLogEntryForId(id){
    for (var i = 0; i < logEntries.length; i++){
        if (logEntries[i].id == id) return logEntries[i];
    }
    return null;
}

function reassignRelativeDates(){
    var row;
    if (relativeDateAnchor == 'undefined' || relativeDateAnchor == null){
        logEntries.forEach(function(entry){
            row = document.getElementById(entry.id);
            row.setRelativeDate("");
        });
    } else {
        logEntries.forEach(function(entry){
            row = document.getElementById(entry.id);
            row.setRelativeDate(entry.timeStamp - relativeDateAnchor);
        });
    }
}

function rowClicked(){
    console.log("CLICK %o", this);

    removeClass(document.getElementById(selectedLogEntryId), "log_entry_selected");

    if (selectedLogEntryId == this.id){ // unselected
        selectedLogEntryId = "";
    } else {
        selectedLogEntryId = this.id;
        addClass(this, "log_entry_selected");

        var selectedLogEntry = getLogEntryForId(selectedLogEntryId);
        if (selectedLogEntry != null && selectedLogEntry.timeStamp){
            relativeDateAnchor = selectedLogEntry.timeStamp;
        } else {
            relativeDateAnchor = null;
        }
    }

    reassignRelativeDates();
}

function repopulateLogEntryList(log){
    var listRoot = document.getElementById("log_list_root");
    while (listRoot.childNodes.length > 0){
        listRoot.removeChild(listRoot.lastChild);
    }

    if (relativeDateAnchor == 'undefined' || relativeDateAnchor == null){
        for(var i = 0; i<log.length; i++){
            if (log[i].timeStamp){
                relativeDateAnchor = log[i].timeStamp;
                break;
            }
        }
    }

    // adding
    var addTask = new ProcessTask(log, 10);
    addTask.perEntryFunction = function(log, index){
        var entry = log[index];
        var lastEntry = index<1 ? entry : log[index-1];

        var nuNode = createLogEntryRow();
        setupRowFromLogEntry(nuNode, entry);

        nuNode.addEventListener('click', rowClicked);


        var marginTopUnitless = 0;
        var insertedRowHeight = 0;

        // if delta-time larger than x insert a snip row
        var delta = +entry.timeStamp - +lastEntry.timeStamp;
        if (!isNaN(delta) && delta < 100000000){
            if (delta > 800){
                var bigGapRow = createBigGapRow(delta);
                if (delta < 5*60*1000){
                    bigGapRow.style.background= "none";
                }
                listRoot.appendChild(bigGapRow);
                insertedRowHeight = bigGapRow.clientHeight;
                marginTopUnitless = 0;
            } else {
                marginTopUnitless = delta / 30;

                if (marginTopUnitless > 7){
                    var smallGapRow = createSmallGapRow(delta);
                    smallGapRow.style.height = marginTopUnitless + "px";
                    smallGapRow.style.paddingTop = (marginTopUnitless - 8) + "px";
                    listRoot.appendChild(smallGapRow);

                    insertedRowHeight = smallGapRow.clientHeight;
                    marginTopUnitless = 0;
                } else {
                    marginTopUnitless = Math.max(1, marginTopUnitless / 2);
                }
            }
        } // else: margin does not make sense

        nuNode.style.marginTop = marginTopUnitless+"px";
        listRoot.appendChild(nuNode);

        entry.lastLayoutTop = lastEntry.lastLayoutTop + +nuNode.clientHeight + +marginTopUnitless + +insertedRowHeight;

        refreshScrollBar(logEntries, index);
    };
    addTask.finishedFunction = function () {
        console.log("DONE! refreshing scroll bar");
        refreshScrollBar(logEntries);
    };
    addTask.startProcessing();
}


// ////////////////////////////////////////////////////////////////////
// import overlay

function hideImportOverlay(){
    document.getElementById('import_overlay').style.visibility = "hidden";
}

function levelKnown(level) {
    return level=='i' || level=='w' || level=='e' || level=='m';
}

function importComplete(importedEntries){
    logEntries = importedEntries;
    repopulateLogEntryList(logEntries);
    //refreshScrollBar(logEntries);
}

// import overlay
// ////////////////////////////////////////////////////////////////////
// drop handling

function showDropOverlay (event) {
    console.log('show');
    document.getElementById('drop_overlay').style.visibility = 'visible';
    document.getElementById('drop_catcher').style.visibility = 'visible';
}

function hideDropOverlay (event) {
    console.log('hide');
    document.getElementById('drop_overlay').style.visibility = 'hidden';
    document.getElementById('drop_catcher').style.visibility = 'hidden';
}

function allowDrag(e) {
    if (true) {  // TODO Test that the item being dragged is a valid one
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
    }

    return false;
}

function handleDrop(e) {
    console.log("DROP Data: %o", event.dataTransfer.files[0]);

    e.preventDefault();
    e.stopPropagation();
    hideDropOverlay();

    logSourceFiles = e.dataTransfer.files;
    showImportOverlayForInputFiles(logSourceFiles, importComplete);

    return false;
}

function initDropHandling() {
    var dropCatcher = document.getElementById('drop_catcher');

    window.addEventListener('dragenter', showDropOverlay);

    dropCatcher.addEventListener('dragenter', allowDrag, true);
    dropCatcher.addEventListener('dragover', allowDrag, true);

    dropCatcher.addEventListener('dragleave', hideDropOverlay);
    dropCatcher.addEventListener('drop', handleDrop);
}

// drop handling
// ////////////////////////////////////////////////////////////////////
// paste handling

function initPasteHandling() {
    document.addEventListener('paste', function(e) {
        showImportOverlayForPasteEvent(e, importComplete);
    });
}


// paste handling
// ////////////////////////////////////////////////////////////////////


initDropHandling();
initPasteHandling();
initImportOverlay();
initScrollBar();

logEntries = fakeParse();

repopulateLogEntryList(logEntries);
refreshScrollBar(logEntries);
