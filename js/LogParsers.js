// abstract / class object

function isPlausibleTimeStamp(testTimeStamp){
    var testMS = +testTimeStamp;
    if (isNaN(testMS) || !isFinite(testMS)) return false;

    var nowMs = (new Date()).getTime();
    var upperBound = nowMs + (3*60*60*1000);
    var lowerBound = nowMs - (365 * 24*60*60*1000);
    return (testMS<upperBound) && (testMS>lowerBound);
}

function LogParser(){
    this.name = "abstract";
    this.splitFunction = function(rawInput){ return rawInput.split('\n'); };
    this.timeStampParser = function(logLine){ return logLine.substr(0,10); };
    this.levelParser = function(logLine){ return logLine.substr(10,1); };
    this.messageParser = function(logLine){ return logLine.substr(12); };
    this.sourceParser = function(logLine){ return logLine.substr(14, 10); };

    this.estimatedLogLines = 0;

    /**
     * With some log entry separators, it's possible that single lines were separated.
     * This function tries to estimate if that's the case.
     */
    this.combineEntriesFunc = function(parser, logEntries){ return logEntries; };

    this.sortFunc = function(logEntries){
        return logEntries.sort(function(a, b){
            var ret  = a.timeStamp-b.timeStamp;
            if (ret == 0){
                ret = a.rawLineIndex-b.rawLineIndex;
            }
            return ret;
        });
    };


    // a value between 0 and 1
    function implausibleSplitting(rawInput, logLines, parser) {
        if (logLines==null || logLines==='undefined' || logLines.length < 2) return true;
        var averageLineLength = rawInput / logLines.length;
        if (averageLineLength < 30){
            console.log("The lines with split-function %o are too short. Discarded as implausible.", parser.splitFunction);
            return true;
        } else if (averageLineLength > 1000){
            console.log("The lines with split-function %o are too long. Discarded as implausible.", parser.splitFunction);
            return true;
        }
        return false;
    }

    function takeSampleLines(loadedLines) {
        var ret = [];

        for (var i = 0; i < 15 && loadedLines.length > 0; i++){
            ret.push( loadedLines[  Math.round((Math.random() * loadedLines.length)) ] )
        }

        return ret;
    }

    function parseLine(line, parser, lineIndex){
        var ret = new LogEntry(line,
            parser.timeStampParser(line),
            parser.levelParser(line),
            parser.sourceParser(),
            parser.messageParser(line));
        ret.rawLineIndex = lineIndex;
        return ret;
    }

    this.estimateFitting = function(rawInput){
        var logLines = this.splitFunction(rawInput);
        this.estimatedLogLines = logLines.length;
        if (implausibleSplitting(rawInput, logLines, this)) return 0;

        var sampleLines = takeSampleLines(logLines);
        var sampleParsed = [];
        for (var i = 0; i < sampleLines.length; i++){
            sampleParsed.push(parseLine(sampleLines[i], this, i));
        }

        var plausibleResults = sampleParsed.reduce(function(total, logEntry){
            return total + (isPlausibleTimeStamp(logEntry.timeStamp) ? 1 : 0);
        }, 0);

        return plausibleResults/sampleParsed.length;
    };


    this.removeEmptyLogEntries = function (logEntries) {
        return logEntries.filter(function(entry){
            return (entry.id.trim().length > 5)
        });
    };

    this.parseAll = function(rawInput){
        var logLines = this.splitFunction(rawInput);
        logLines = logLines.filter(function ignoreEmptyLines(line){
            return line.trim().length > 1;
        });

        // actual parsing
        var ret = [];
        var i;
        for (i=0; i<logLines.length; i++){
            ret.push(parseLine(logLines[i], this, i));
        }

        // cleanups
        ret = this.removeEmptyLogEntries(ret);

        ret = this.combineEntriesFunc(this, ret);
        ret = this.sortFunc(ret);

        return ret;
    }
}


// ///////////////////////////////////////////////////////////////
// Android file parser

var androidFileParser = new LogParser();
androidFileParser.name = "AndroidFileLogParser";
androidFileParser.splitFunction = function (rawInput) {
    return rawInput.split('\n');
};
androidFileParser.timeStampParser = function(logLine){
    return logLine.substr(2, 13);
};
androidFileParser.levelParser = function(logLine){
    return logLine.substr(0,1).toLowerCase();
};
androidFileParser.messageParser = function(logLine){
    return logLine.substr(16);
};
androidFileParser.sourceParser = function(logLine){
    return "";
};


// ///////////////////////////////////////////////////////////////
// Android LogCat parser

var logCatParser = new LogParser();
logCatParser.name = "AndroidLogCatParser";
logCatParser.splitFunction = function (rawInput) {
    return rawInput.split('\n');
};
logCatParser.timeStampParser = function(logLine){
    var month = logLine.substr(0,2);
    var day   = logLine.substr(3,2);
    var hour  = logLine.substr(6,2);
    var minute =logLine.substr(9,2);
    var second =logLine.substr(12,2);
    var ms     =logLine.substr(15,3);

    var date = new Date(2017, +month - 1, +day, hour, minute, second, ms);
    return date.getTime();
};
logCatParser.levelParser = function(logLine){
    return logLine.substr(19,1).toLowerCase();
};
logCatParser.messageParser = function(logLine){
    return logLine.substr(21);
};
logCatParser.sourceParser = function(logLine){
    return "";
};


// ///////////////////////////////////////////////////////////////
// iOS console parser

var iOSConsole = new LogParser();
iOSConsole.name = "iOSConsoleParser";
iOSConsole.splitFunction = function (rawInput) {
    return rawInput.split('\n');
};
iOSConsole.timeStampParser = function(logLine){        // e.g. '10.02 13:27:139 [..]'
    var day    =logLine.substr(0,2);
    var month  =logLine.substr(3,2);
    var hour   =logLine.substr(6,2);
    var minute =logLine.substr(9,2);
    var second =logLine.substr(12,2);
    var ms     =logLine.substr(14,1) + '00';

    var date = new Date(2017, +month - 1, +day, hour, minute, second, ms);
    return date.getTime();
};
iOSConsole.levelParser = function(logLine){
    var ret = logLine.substr(16, 1);
    if (ret==='_') return 'i';
    if (ret===' ') return 'v';
    return ret.toLocaleLowerCase();
};
iOSConsole.messageParser = function(logLine){
    return logLine.substr(18);
};
iOSConsole.sourceParser = function(logLine){
    return "";
};
iOSConsole.combineEntriesFunc = function(parser, logEntries){
    var ret = [];

    var currentEntry, testEntry, j;
    for (var i = 0; i < logEntries.length-1;){
        currentEntry = logEntries[i];
        i++;

        if (isPlausibleTimeStamp(currentEntry.timeStamp)){
            for (j = i; j < logEntries.length; j++){
                testEntry = logEntries[j];
                if (!isPlausibleTimeStamp(testEntry.timeStamp)){
                    currentEntry.message = currentEntry.message +"  "+ testEntry.rawLine;
                    i++;
                } else {
                    break;
                }
            }
        } // else: the current entry is already bad. Do not attempt to combine;
        ret.push(currentEntry);
    }

    return ret;
};

// ///////////////////////////////////////////////////////////////
// iOS log file parser

var iOSFileParser = new LogParser();
iOSFileParser.name = "iOSFileParser";
iOSFileParser.splitFunction = function (rawInput) {
    return rawInput.split('|v|');
};
iOSFileParser.timeStampParser = function(logLine){        // e.g. '10.02 13:27:139 [..]'
    var day    =logLine.substr(0,2);
    var month  =logLine.substr(3,2);
    var hour   =logLine.substr(6,2);
    var minute =logLine.substr(9,2);
    var second =logLine.substr(12,2);
    var ms     =logLine.substr(14,1) + '00';

    var date = new Date(2017, +month - 1, +day, hour, minute, second, ms);
    return date.getTime();
};
iOSFileParser.levelParser = function(logLine){
    var ret = logLine.substr(16, 1);
    if (ret==='_') return 'i';
    if (ret===' ') return 'v';
    return ret.toLocaleLowerCase();
};
iOSFileParser.messageParser = function(logLine){
    return logLine.substr(18);
};
iOSFileParser.sourceParser = function(logLine){
    return "";
};
iOSFileParser.combineEntriesFunc = function(parser, logEntries){
    var ret = [];

    var currentEntry, testEntry, j;
    for (var i = 0; i < logEntries.length-1;){
        currentEntry = logEntries[i];
        i++;

        if (isPlausibleTimeStamp(currentEntry.timeStamp)){
            for (j = i; j < logEntries.length; j++){
                testEntry = logEntries[j];
                if (!isPlausibleTimeStamp(testEntry.timeStamp)){
                    currentEntry.message = currentEntry.message +"  "+ testEntry.rawLine;
                    i++;
                } else {
                    break;
                }
            }
        } // else: the current entry is already bad. Do not attempt to combine;
        ret.push(currentEntry);
    }

    return ret;
};


// //////////////////////////////////////////////////////////////
// parser selection

function chooseParser(rawInput){
    var bestCandidate = {};
    bestCandidate.parser = {};
    bestCandidate.confidence = -1;

    [ androidFileParser, logCatParser, iOSConsole , iOSFileParser ].forEach(function (logParser){
        var nowConfidence = logParser.estimateFitting(rawInput);
        if (nowConfidence > bestCandidate.confidence){
            bestCandidate.parser = logParser;
            bestCandidate.confidence = nowConfidence;
        }
    });

    return bestCandidate.parser;
}

// parser selection
// //////////////////////////////////////////////////////////////////////
// dev / debug


function fakeParse(){
    var ret = [];
    var nowTime = Date.now();

    /*
     for (var i = 0; i < 1000; i++){
     // nowTime = nowTime + Math.round((Math.random() * 900));
     nowTime = nowTime + 10* i;

     var level = 'i';
     if (i%80==0) level = 'e';
     else if (i%40==0) level = 'w';

     var nuLogEntry = new LogEntry(nowTime, level,
     "[Source source]", "Super long message. Really a lot. ksdf saf glg gb lgru ljg slkguhr ldskfjb lrugh lsfkjb rlugih sljvb?");
     ret.push(nuLogEntry);
     }
     //*/

    ret.push(new LogEntry('', nowTime, 'i', 's', "This is a log parser and browser."));
    ret.push(new LogEntry('', nowTime, 'i', 'o', "Made for the KoMaXX Android and iOS log framework."));
    ret.push(new LogEntry('', nowTime, 'x', 'u', ""));
    ret.push(new LogEntry('', nowTime, 'i', 'r', "Paste your log or Drag&drop a log file in here to start."));

    return ret;
}
