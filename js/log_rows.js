
function createLogEntryRow(){
    var rowRootNode = document.createElement("DIV");

    var topLine = document.createElement("DIV");
    rowRootNode.appendChild(topLine);

    var dateNode = document.createElement("SPAN");
    dateNode.setAttribute("class", "log_entry_date");
    topLine.appendChild(dateNode);
    rowRootNode.setDate = function (dateString){
        dateNode.textContent = dateString;
    };

    var relativeDateNode = document.createElement("SPAN");
    relativeDateNode.setAttribute("class", "log_entry_relative_date");
    topLine.appendChild(relativeDateNode);
    rowRootNode.setRelativeDate = function (relativeDateMs) {
        if (relativeDateMs == "") relativeDateNode.innerHTML = "";
        else relativeDateNode.innerHTML = makeDeltaTimeHtmlString(relativeDateMs);
    };

    var messageNode = document.createElement("SPAN");
    messageNode.setAttribute("class", "log_entry_message");
    rowRootNode.appendChild(messageNode);
    rowRootNode.setMessage = function (messageString) {
        messageNode.textContent = messageString;
    };

    return rowRootNode;
}

function setupRowFromLogEntry(rowRoot, logEntry) {
    rowRoot.setAttribute("id", logEntry.id);

    if (logEntry.level === 'e') {
        rowRoot.setAttribute("class", "log_entry_root log_row_type_e");
    } else if (logEntry.level === 'w') {
        rowRoot.setAttribute("class", "log_entry_root log_row_type_w");
    } else if (logEntry.level === 'm' || logEntry.level === 'i') {
        rowRoot.setAttribute("class", "log_entry_root log_row_type_i");
    } else if (logEntry.level === 'v' || logEntry.level === 'd') {
        rowRoot.setAttribute("class", "log_entry_root log_row_type_d");
    } else {
        rowRoot.setAttribute("class", "log_entry_root log_row_type_unknown");
    }

    var date = new Date(+logEntry.timeStamp);

    var dateString = ("0"+date.getHours()).substr(-2);
    dateString = dateString + ":" + ("0"+date.getMinutes()).substr(-2);
    dateString = dateString + ":" + ("0"+date.getSeconds()).substr(-2);
    dateString = dateString + "," + ("00"+date.getMilliseconds()).substr(-3);

    rowRoot.setDate(dateString);
    rowRoot.setRelativeDate("");
    rowRoot.setMessage(logEntry.message);
}

function createBigGapRow(timeDeltaMs){
    var rowRootNode = document.createElement("DIV");
    rowRootNode.setAttribute("class", 'big_gap_row');


    var textNode = document.createElement("SPAN");
    textNode.setAttribute('class', 'big_gap_text');
    rowRootNode.appendChild(textNode);

    textNode.innerHTML = "[[ " + makeDeltaTimeHtmlString(timeDeltaMs) + " ]]";

    return rowRootNode;
}

function createSmallGapRow(timeDeltaMs){
    var rowRootNode = document.createElement("DIV");
    rowRootNode.setAttribute("class", 'small_gap_row');
    rowRootNode.textContent = "< " + timeDeltaMs + "ms >";
    return rowRootNode;
}