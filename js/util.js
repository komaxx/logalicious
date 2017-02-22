/**
 * Created by matthiasschicker on 06/02/2017.
 */

function makeDeltaTimeHtmlString(timeDeltaMs){
    var deltaString = "";

    if (timeDeltaMs < 0){
        timeDeltaMs = -timeDeltaMs;
        deltaString = "-";
    }

    var days = Math.floor(timeDeltaMs / (1000 * 60 * 60 * 24));
    timeDeltaMs -=  days * (1000 * 60 * 60 * 24);

    var hours = Math.floor(timeDeltaMs / (1000 * 60 * 60));
    timeDeltaMs -= hours * (1000 * 60 * 60);

    var minutes = Math.floor(timeDeltaMs / (1000 * 60));
    timeDeltaMs -= minutes * (1000 * 60);

    var seconds = Math.floor(timeDeltaMs / (1000));
    timeDeltaMs -= seconds * (1000);


    if (days > 0){
        deltaString = days + " d, ";
    }
    var emphasized = false;
    if (hours > 0){
        deltaString = deltaString + "<strong>";
        emphasized = true;
    }
    deltaString = deltaString + ("0"+hours).substr(-2) +"h ";
    if (!emphasized && minutes > 0){
        deltaString = deltaString + "<strong>";
        emphasized = true;
    }
    deltaString = deltaString + ("0"+minutes).substr(-2) +"m ";
    if (!emphasized && seconds > 0){
        deltaString = deltaString + "<strong>";
        emphasized = true;
    }
    deltaString = deltaString + ("0"+seconds).substr(-2) +",";
    if (!emphasized){
        deltaString = deltaString + "<strong>";
    }
    deltaString = deltaString + ("00"+timeDeltaMs).substr(-3) + "s</strong>";

    return deltaString;
}

function hasClass(element, classToCheck){
    var classesString = element.getAttribute('class');
    if (classesString==null || classesString.length < 1){
        return false;
    }

    var classes = classesString.split(" ");
    for (var i = 0; i < classes.length; i++){
        if (classes[i] == classToCheck){
            return true;
        }
    }
    return false
}

function addClass(element, classToAdd){
    if (hasClass(element, classToAdd)){
        console.log("Element "+element + " already has class " + classToAdd);
    }
    var classString = element.className;
    if (classString==null || classString==""){
        element.setAttribute('class', classToAdd);
    } else {
        element.setAttribute('class', classString + " " + classToAdd);
    }
}

function removeClass(element, classToRemove){
    if (element==null){
        console.log("Can not remove class " + classToRemove + " from NULL element");
        return;
    }
    var classesString = element.className;
    if (classesString==null || classesString.length < 1){
        console.log("Not removing "+classToRemove+" from element without classes: " + element);
        return;
    }

    var classes = classesString.split(" ");

    classes = classes.filter(function(element){
        return element != classToRemove;
    });

    element.setAttribute('class', classes.join(" "));
}