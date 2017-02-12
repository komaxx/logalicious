/**
 * @Copyright Matthias Schicker, 2017
 *
 * A process task helps with background execution.
 * It processes a chunk of an array with its 'perEntryFunction'
 * and then pauses to give the UI a chance to work a bit.
 * When done, finishedFunction is called.
 *
 * To use:
 * - create as 'var task = new ProcessTask'
 * - set the actual functionality: 'task.perEntryFunction = function(entry){  <do stuff with entry>  };'
 * - optional: Set a function to be called when all was processed: task.finishedFunction = function(){ <You code> };
 * - Start processing: 'task.startProcessing()'
 */
function ProcessTask(logEntries, chunkSize){
    this.entries = logEntries;
    this.executionPosition = 0;
    this.chunkSize = chunkSize;

    this.perEntryFunction = function(logEntry){
        console.log("logEntry: %o", logEntry)
    };
    this.finishedFunction = function(){
        console.log("DONE");
    };

    this.process = function(task){
        var limit = Math.min(task.executionPosition + task.chunkSize, task.entries.length);
        for (var i = task.executionPosition; i < limit; i++){
            task.perEntryFunction(task.entries, i);
        }

        task.executionPosition += chunkSize;
        if (task.executionPosition < task.entries.length-1){
            // more to do, schedule the next entry
            setTimeout(task.process, 10, task);
        } else {
            task.finishedFunction();
        }
    }

    this.startProcessing = function(){
        // TODO: some initial checks if processing makes sense
        setTimeout(this.process, 10, this);
    }
}
