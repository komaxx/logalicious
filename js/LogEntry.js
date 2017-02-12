/**
 * Created by matthiasschicker on 03/02/2017.
 */


function LogEntry(rawLine, timeStamp, level, source, message){
    this.rawLine = rawLine;
    this.rawLineIndex = -1;

    this.timeStamp = timeStamp;
    this.level = level;
    this.source = source;
    this.message = message;

    this.id = timeStamp+message;


    this.lastLayoutTop = 0;

    this.fits = function(filter){
        return filter.acceptedLevels.contains(this.level);
    }
}

