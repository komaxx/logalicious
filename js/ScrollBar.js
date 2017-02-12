/**
 * Created by matthiasschicker on 05/02/2017.
 */

var scrollBarRoot;


function initScrollBar(){
    scrollBarRoot = document.getElementById("scrollbar_svg");

    //scrollBarRoot.appendChild()
}

function refreshScrollBar(logEntries, maxIndex){
    if (logEntries.length < 1) return;
    if (maxIndex==='undefined' || isNaN(+maxIndex) || +maxIndex < 0) maxIndex = logEntries.length-2;

    while (scrollBarRoot.lastChild) {
        scrollBarRoot.removeChild(scrollBarRoot.lastChild);
    }

    var overallHeight = logEntries[+maxIndex].lastLayoutTop;
    if (overallHeight < 1 || isNaN(parseFloat(overallHeight)) || !isFinite(overallHeight)) return;

    var svgns = "http://www.w3.org/2000/svg";


    // warning rows
    var logEntry, i;
    var rect;
    var classString;
    for (i = 0; i < logEntries.length; i++){
        logEntry = logEntries[i];

        if ((logEntry.level != 'w') ||
            logEntry.lastLayoutTop < 1 || logEntry.lastLayoutTop=='undefined') continue;

        rect = document.createElementNS(svgns, 'rect');
        rect.setAttribute('y', Math.min(100, Math.max(0, ((logEntry.lastLayoutTop / overallHeight)*100))) + "%");
        classString = "scroll_bar_line";
        classString = classString + " " + (logEntry.level=='w' ? "scroll_bar_line_w" : "scroll_bar_line_e");
        rect.setAttribute('class', classString);

        scrollBarRoot.appendChild(rect);
    }

    // error rows
    for (i = 0; i < logEntries.length; i++){
        logEntry = logEntries[i];

        if ((logEntry.level != 'e') ||
            logEntry.lastLayoutTop < 1 || logEntry.lastLayoutTop=='undefined') continue;

        rect = document.createElementNS(svgns, 'rect');
        rect.setAttribute('y', Math.min(100, Math.max(0, ((logEntry.lastLayoutTop / overallHeight)*100))) + "%");
        classString = "scroll_bar_line";
        classString = classString + " " + (logEntry.level=='w' ? "scroll_bar_line_w" : "scroll_bar_line_e");
        rect.setAttribute('class', classString);

        scrollBarRoot.appendChild(rect);
    }
}