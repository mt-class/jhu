/****************************************************************
 * VARIABLES
 ****************************************************************/

// the chart containing hypotheses
var CHART = new Object();
CHART.size = function() {
    var size = -1;
    for (var key in this)
        size++;
    return size;
};

// this maps DP state signatures to valid CSS element IDS
var IDS = new Object();
IDS.size = function() {
    var size = -1;
    for (var key in this)
        size++;
    return size;
}

// number of hypotheses added
var NUM_HYPOTHESES = 0;

// start- and end-of-sentence
var SOS = "&lt;s&gt;";
var EOS = "&lt;/s&gt;";

// the stacks that hypotheses are placed in
var STACKS = Array();

// lowest LM score
var LM_FLOOR = -100;

// how fast to fade chart items in and out
var FADE_SPEED = 3000;

var AUTOMATE_DELAY = 1000; // ms

/****************************************************************
 * INITIALIZATION CODE
 ****************************************************************/

/*
 * Build lists of source- and target-language words.
 */
var row = $("<div></div>").attr('id', 'sourcebox');
for (i = 0; i < WORDS.length; i++) {
    
    var word = WORDS[i][0];

    // This function creates the list of translations when a source
    // word is clicked.  It has to be a separate function like this
    // due to Javascript's lexical binding.
    var clickfunc = function(index) {
        return function() {
            // make sure the list is created
            var list = create_translations_list(index);

            // animate it
            if (list.is(":visible")) {
                list.slideUp();
                $("#source" + index).find('p').css({border: "1px solid #dddddd", 
                                                    'border-radius': '3px'});
            } else {
                list.slideDown();
                $("#source" + index).find('p').css({border: "1px solid black",
                                                    'border-radius': '3px'});
            }
        }
    };

    var label = "source" + i;
    var td = $("<div></div>")
        .addClass("source")
        .attr("id",label)
        .append($("<p></p>")
                .append(word)
                .click(clickfunc(i)));
    row.append(td);
    // document.write("<td><p class='source' id='" + label + "'>" + word + "</p></td>");
    // $("td#" + label).click(function() { translation_options(i); });
}

$("#content :first")
    .before(row)
    .before($("<div></div>").css({"clear":"both"}))
    .before($("<div></div>").
            attr("id","stacks"))
;

// document.writeln("</tr></table></p>");

$("#automate").click(function() { automate() });

/****************************************************************
 * FUNCTIONS
 ****************************************************************/

/*
 * Builds the list of target-language translations of a given source
 * word, creating it if necessary, and inserts it into the source word div.
 */
function create_translations_list(i) {
    var id = "targetlist" + i;

    var list = $("#" + id);
    if (list.size() == 0) {
        list = $("<ul></ul>")
            .attr("id", "targetlist" + i)
            .addClass("translation")
            .hide();

        var num_candidates = min($("#numcandidates").val(), WORDS[i].length - 1);
        for (j = 1; j <= num_candidates; j++) {
            var word, score;
            if (WORDS[i][j] instanceof Array) {
                word = WORDS[i][j][0];
                score = WORDS[i][j][1];
            } else {
                word = WORDS[i][j];
                score = 0;
            }
            var label = "target" + i + "-" + j;

            var item = $("<li></li>")
                .attr("id", label)
                .addClass("translation")
                .text(word + " ")
                .append($("<span></span>").addClass("score").text(sprintf('%.2f',score)))
                .data('word', word)
                .data('pos', i)
                .data('score', score)
                .data('itemno', j)
                .click(function() { 
                    /* Use the word to extend a hypothesis if one is
                     * selected.
                     */
                    if (count_selected() == 1) {
                        var hypothesis = $(".selected");
                        if (is_legal($(".selected"), $(this))) {
                            var pos = $(this).data('pos');
                            if (hypothesis.data('pos')[pos] != 1) {
                                extend_item(hypothesis, $(this));
                                // get_stack(item.data('stack')).append(item.fadeIn());
                            }
                        }
                    }
                })
                .hover(function(e) {
                    /* On hovering, we highlight the word if one other
                     * item is selected and this word is a valid
                     * extension of that hypothesis (according to
                     * various constraints). 
                     */
                    var num_selected = count_selected();
                    switch(num_selected) {
                    case 0:
                        // nothing can be done if nothing is selected
                        $(this).addClass('illegal');
                        message("Select a hypothesis to extend.");
                        break;
                    case 1:
                        if (is_legal($(".selected"), $(this))) {
                            $(this).addClass('hilite');
                        } else {
                            $(this).addClass('illegal');
                        }

                    }
                },function(e) {
                    $(this).removeClass("hilite illegal");
                });
            // .draggable({
            //     cancel: "a.ui-icon",
            //     revert: function(dropped) {
            //         return true;
            //     },
            //     cursor: "move",
            // });
            list.append(item);
            // document.writeln("<p class='target' id='" + label + "'>" + word + "</p>");
            // document.write(p.html());
        }
        // list.append($("<br></br>").css({"clear":"both"}));

        $("#source" + i).append(list);
    }

    return list;
}

/*
 * Takes two JQuery objects representing a hypothesis and a word, and
 * return true if the extension is legal under the current set of
 * constraints.
 */

function is_legal(hypothesis, word) {
    // only highlight if this is a valid extension of that hyp.
    // a word is illegal if it is already covered
    if (hypothesis.data('pos')[word.data('pos')]) {
        return false;
    } else {
        var permitted_distance = $("#constraints").val();
        var lastpos = hypothesis.data('lastpos');
        var curpos = word.data('pos');
        // permitted
        if (permitted_distance == "0")
            return true;
        else if (permitted_distance == "+1") {
            if (curpos == lastpos + 1)
                return true;
            else 
                return false;
        } else {
            // if we're extending the empty hypothesis, or the
            // distance is within the permitted distance, we can
            // extend
            if (lastpos == -1 || (abs(curpos - lastpos) <= permitted_distance) ){
                return true;
            } else {
                return false;
            }
        }
    }
}


/*
 * Returns the requested stack, adding it if it doesn't already exist.
 * Handles different stack scenarios (single, word-based,
 * coverage-based).
 */
function get_stack(which) {
    // If we're doing just one stack, make sure it exists and return it
    if ($("#numstacks").val() == "one") {
        // create the stack if it doesn't exist
        if (STACKS.length == 0) {
            var stackdiv = $("<div></div>")
                .attr("id", "stack" + i)
                .addClass('stack-header')
                .append($("<h3></h3>")
                        .text("Stack"))
                .append("<div></div>");
            $("div#stacks").append(stackdiv);
            STACKS.push(stackdiv);
        }

        return STACKS[0];
    } else {
        for (i = STACKS.length; i <= which; i++) {
            var stackdiv = $("<div></div>")
                .attr("id", "stack" + i)
                .addClass('stack-header')
                .append($("<h3></h3>")
                        .click(function() {
                            if ($(this).next().is(':visible'))
                                $(this).next().slideUp();
                            else
                                $(this).next().slideDown();
                        })
                        .text("Stack (" + i + ")"))
                .append("<div></div>");

            if (i == WORDS.length)
                stackdiv.addClass("stack-complete");

            if (i == 0)
                $("div#stacks").append(stackdiv);
            else 
                $("div#stacks :first").before(stackdiv);

            STACKS.push(stackdiv);
            // $("#debug").append("<p>creating stack " + i + "</p>");
            // debug("creating stack " + i)
        }
        return STACKS[which].children(':last');
    }
}

$(".source")
    .click(function() {
        make_start_item();
    });

function compute_dpstate(phrase) {

    if ($("#dp").attr('checked')) {
        var histsize = 1;

        var words = phrase.split(' ');
        if (words.length > histsize) {
            phrase = "...";
            for (i = words.length - histsize; i < words.length; i++)
                phrase += " " + words[i];
        }
    }
    
    // debug("returning " + phrase);

    return phrase;
}

function make_start_item() {
    // disable options once the user has started clicking around
    $(".options").attr('disabled', 'disabled');

    var empty_word_item = $("<div></div>")
        .data('word', SOS)
        .data('pos', -1)
        .data('score', 0);

    var item = make_item(empty_word_item);

    var key = item.data('key');
    if (! (key in CHART)) {
        // create the chart entry
        CHART[key] = item;

        // update the chart size display
        $("#chartsize").text(CHART.size());

        // display it
        if (! item.is(':visible')) {
            var stack = get_stack(item.data('stack'));
            stack.append(item.fadeIn());
        }
    }

    return CHART[key];
}


/*
 * This function maps from cell signatures to unique names, which
 * names are valid as CSS Id identifiers.  This allows us to easily
 * select cells visually by referring to this latter name.  
 */
function id(key) {
    if (! (key in IDS)) {
        IDS[key] = "cell" + IDS.size();
    }

    return IDS[key];
}

function make_item(worditem, olditem) {
    var obj = $("<div></div>")
        .addClass("stack");

    var words = (olditem ? (olditem.data('words') + " ") : "") + worditem.data('word');
    var pos   = worditem.data('pos');

    obj.data('words', compute_dpstate(words));
    obj.data('pos',   olditem ? olditem.data('pos').slice(0) : new Array());
    if (pos != -1)
        obj.data('pos')[pos] = 1;
    obj.data('covered', create_coverage_display(obj.data('pos')));
    obj.data('key', obj.data('words') + " ||| " + obj.data('covered'));
    obj.data('lastpos', -1);
    obj.data('stack', olditem ? (olditem.data('stack') + 1) : 0);
    obj.data('backpointer', olditem ? olditem : null);
    obj.data('word', worditem);
    obj.attr('id', id(obj.data('key')));

    // scoring
    var score = worditem.data('score');
    if (olditem) {
        score += olditem.data('score');
        score += bigram_score(olditem.data('words'), worditem.data('word'));
        message("ITEM: p(" + worditem.data('word') + " | " + olditem.data('words') + ") = " + bigram_score(olditem.data('words'), worditem.data('word')));
        message("ITEM: p(" + worditem.data('word') + " | " + WORDS[worditem.data('pos')][0] + ") = " + worditem.data('score'));
    }
    obj.data('score', score);


    // debug('make_item(' + words + ',' + pos + ')');
    // debug("obj stack = " + obj.data('stack') + " wordslen = " + WORDS.length);

    // check if the item is complete, and if so, extend it
    if (obj.data('stack') == WORDS.length) {
        obj.data('words', obj.data('words') + " " + EOS);
        obj.data('score', obj.data('score') + bigram_score(obj.data('words'), EOS));
        obj.data('complete', true);

        var translation = follow_backpointers(obj);

        message("Translation: '" + translation + "' (" + sprintf('%.2f', obj.data('score')) + ")");
    } else {
        obj.data('complete', false);
    }

    obj.append(obj.data('words'))
        .append($("<br></br>"))
        .append(sprintf('%.2f', obj.data('score')))
        .append($("<br></br>"))
        .append(obj.data('covered'))
        .hide()
        .click(function () { 
            var obj = this; toggle_selection(obj); 
        })
        // .droppable({
        //     accept: ".translation",
        //     hoverClass: "highlight",
        //     tolerance: 'intersect',
        //     drop: function(event, ui) {
        //         extend_item($(this), ui.draggable);
        //         // get_stack(item.data('stack')).append(item.fadeIn());
        //     },
        // })
        .hover(function () { 
            $(this).addClass("stackhilite");
            
            // highlight backpointers
            $("." + $(this).attr('id')).addClass("dp-hilite");
            var obj = $(this).data('backpointer');
            while (obj) {
                obj.addClass('dp-hilite');
                obj = obj.data('backpointer');
            }
        }, function () { 
            if (! ($(this).hasClass("selected")))
                $(this).removeClass("stackhilite");

            // un-hilite DP backpointers
            $("." + $(this).attr('id')).removeClass('dp-hilite');
            var obj = $(this).data('backpointer');
            while (obj) {
                obj.removeClass('dp-hilite');
                obj = obj.data('backpointer');
            }
        });

    if (obj.data('complete'))
        obj.addClass("item-complete");

    return obj;

        // over: function(event, ui) {
        //     var item = ui.draggable.data('item');
        //     var word = item.words;
        //     var pos  = item.pos;
        //     if (item.pos[pos] == 1)
        // }
}


/**
 * Takes an existing item and a new word and creates a new item that
 * also covers that word.
 */
function extend_item(olditem,worditem) {
    var item = make_item(worditem, olditem);

    // If the item is not in the chart or has a better score, add it
    var key = item.data('key');
    if (! (key in CHART) || CHART[key].data('score') < item.data('score')) {
        // if there is an old item, delete it
        if (key in CHART) {
            var olditem = CHART[key];
            // remove it
            olditem.fadeOut(FADE_SPEED);
            // remove anything tagged with it
            var id = olditem.attr('id');
            $("." + id).removeClass(id);

            message("Replacing existing, lower-scoring stack item.");
        // } else {
        //     message("Adding new item to the stack.");
        }

        // record the current item
        CHART[key] = item;

        // mark the backpointer items with this item's class id, so
        // that we can highlight them
        item.data('backpointer').addClass(item.attr('id'));
            // add this item's class to the word
        item.data('word').addClass(item.attr('id'));

        // update the chart size display
        $("#chartsize").text(CHART.size());

        if (! item.is(":visible")) {
            var stack = get_stack(item.data('stack'));
            // if the stack is empty, just append it (empty means that
            // it just has the title element, so it's of size 1)
            var num_children = stack.children().size();
            if (num_children == 0) {
                stack.append(item.fadeIn(FADE_SPEED));
            } else {
                // otherwise, insert it into the appropriate position on the stack
                var itemscore = item.data('score');
                stack.children().each(function(index) {

                    // If we find an element we're greater than,
                    // insert before it.  This maintains a sorted list
                    // so long as the long was sorted before
                    var score = $(this).data('score');
                    if (itemscore > score) {
                        $(this).before(item.fadeIn(FADE_SPEED));

                        // returning false exits the each()
                        return false;
                    } else if (index + 1 == num_children) {
                        // end of the list
                        $(this).after(item.fadeIn(FADE_SPEED));
                    } else {
                        return true;
                    }
                });

                // remove entries that fall outside the beam
                var stacksize = $("#stacksize").val();
                // if (stack.children().size() - 1 > stacksize)
                    // message("Pruning the stack of " + (stack.children.size() - stacksize - 1) + " candidates");
                stack.children().each(function(index) {
                    // skip the first element (the stack title)
                    if (index >= stacksize) {
                        var key = $(this).data('key');
                        $(this).fadeOut(FADE_SPEED);
                        delete CHART[key];
                    }
                });
            }
        }
    } else {
        // add the item only to remove it
        CHART[key].after(item.fadeIn(FADE_SPEED).addClass('X').text('X').fadeOut(FADE_SPEED));
        message("Deleting item, since it has a lower probability than an existing item in the chart.");
    }

    // update the chart size display
    $("#hypotheses").text(++NUM_HYPOTHESES);

    return CHART[key];
}


// This function takes an array with 1s denoting source-language words
// that have been consumed.  It returns a nice HTML display of it.  It
// assumes access to the global "words" array (to determine sentence
// length only).
function create_coverage_display(array) {
    var covered = "";
    for (i = 0; i < WORDS.length; i++) {
        if (array[i] == 1) {
            covered += "◉";
        } else {
            covered += "◎";
        }
    }
    return covered;
}


function translation_options() {
    // for (i = 1; i < WORDS[index].length; i++) {
    // $("div#debug").append("<p>" + i + "/" + j + "</p>");
    ensure_stack_exists(2);
    $("div#debug").append("<p>MATT</p>");
    // }
}

// Converts an ID to the word it represents.
function id2word(label) {
    var matches = label.match(/(\d+)-(\d+)/);
    var i = matches[1];
    var j = matches[2];
    return WORDS[i][j];
}

function id2index(label) {
    var matches = label.match(/(\d+)-(\d+)/);
    var i = matches[1];
    return i;
}

function deselect_item(div) {
    // deselect this item
    $(div).removeClass("selected stackhilite");
    // debug("DESELECT: num=" + count_selected());
}

function select_item(div) {
    // deselect all other items
    $(".selected").removeClass("selected stackhilite");

    // select this item
    $(div).addClass("stackhilite selected");
}

function toggle_selection(div) {
    if ($(div).data('complete')) {
        log("Translation: " + follow_backpointers($(div)));
    }

    if (! ($(div).hasClass("selected"))) 
        select_item(div);
    else 
        deselect_item(div);
}

function highlight(o) {
    $(o).addClass('highlight');
    debug("highlighting DIV:'" + $(o).id + "'");
}


// returns the number of current selected objects
function count_selected() {
    var num = $(".selected").size();
    return num;
}

var last_message = "";
function log(message) {
    if (message != last_message)
        $("#debug > div").prepend("<p>" + message + "</p>");

    last_message = message;
}

function debug(message) {
    $("#debug > div").prepend("<p>" + message + "</p>");
}

function min(a,b) {
    if (a < b)
        return a;
    else
        return b;
}

function abs(a) {
    if (a < 0)
        return -a;
    return a;
}

function bigram_score(history, word) {
    var oldword = history.split(' ').pop();

    if (BIGRAM != undefined) {
        if (oldword in BIGRAM) {
            if (word in BIGRAM[oldword]) {
                return BIGRAM[oldword][word];
            }
        }
    }

    return LM_FLOOR;
}

function message(text) {
    $("#message").text(text);
    log(text);
}

/*
 * Automates the visualization by simulating click events.  This is
 * somewhat complicated by the fact that calls to click() are not
 * blocking; they are passed to some event model and return
 * immediately, so you don't direct control over timing, which is
 * crucial to have.
 *
 * Here I implemented the following nasty workaround to accommodate
 * this.  We break down the steps of the algorithm into click events
 * wrapped in functions that call execute the click and then schedule
 * the next event.  We therefore create a new function each time that
 * has enough information to compute the next move.
 */
function automate() {

    AUTOMATE_DELAY = $("#delay").val();
    $("#automate").attr('disabled', 'disabled');

    // expand all the source boxes
    for (var i = 0; i < WORDS.length; i++)
        $("#source" + i + " p").click();

    // schedule the first event
    // the arguments are: automate_click(stackno, hypno, sourceno, transno)
    window.setTimeout(automate_click(get_stack(0).children(':first'),0,1), AUTOMATE_DELAY);
}

function automate_click(item, i, j) {
    // log('automate_click(' + item.html() + ',' + i + ',' + j);

    // select the hypothesis (if not selected)
    var stackno = item.data('stack');
    
    // quit if this is the last stack
    if (stackno == WORDS.length)
        return;

    var stack = get_stack(item.data('stack'));

    if (! item.hasClass("selected")) {
        item.click();
        item.addClass('stackhilite');
    }

    // click on the word
    var wordobj = $("#target" + i + "-" + j);
    wordobj.click();
    wordobj.addClass('hilite');
    setTimeout(function() { wordobj.removeClass('hilite') }, AUTOMATE_DELAY);

    // if there's another translation of this word, do that next
    if (wordobj.next().length != 0) {
        setTimeout(function() { automate_click(item, i, j+1) }, AUTOMATE_DELAY);
    } else {
        // otherwise, find the next valid source word, moving through
        // the options until we find one that's not covered
        var nexti = i + 1;
        while (nexti < WORDS.length && item.data('pos')[nexti] == 1)
            nexti++;

        // if there's an uncovered word, do that next
        if (nexti < WORDS.length) {
            setTimeout(function() { automate_click(item, nexti, 1) }, AUTOMATE_DELAY);
        } else {
            // otherwise, move on to the next hypothesis if possible
            var nextitem = item.next();
            while (nextitem.length != 0 && nextitem.is(":hidden"))
                nextitem = nextitem.next();

            // if we ended up at a valid one, run it
            if (nextitem.length != 0) {
                setTimeout(function() { automate_click(nextitem, 0, 1) }, AUTOMATE_DELAY); 
            } else { 
                // otherwise, move on to the next stack
                var newitem = get_stack(stackno+1).children(':first');
                setTimeout(function() { automate_click(newitem, 0, 1) }, AUTOMATE_DELAY);
            }
        }
    }        
}


/*
 * Builds up the translation by following the backpointers.
 */
function follow_backpointers(item) {
    if (item.data('backpointer'))
        return follow_backpointers(item.data('backpointer')) + " " + item.data('word').data('word');

    return "";
}
