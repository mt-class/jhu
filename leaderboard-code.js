// The current assignment number (0-indexed)
var assignment_number = 0;

// The maximum assignment number (0-indexed)
var max_assignment_number = 5;

var rows = "";
var scoreranks = new Array();
for (i = 0; i < data.length; i++) {
    var user = data[i][0];

    rows += '<tr id="' + user + '">';
    var prevscore = (i == 0) ? -1 : data[i-1][1+assNo];
    var score = data[i][1+assignment_number];
    if (score != prevscore) {
        scoreranks[score] = i;
        rows += '<td>' + (i+1) + '</td>';
    } else {
        rows += '<td></td>';
    }

    var rank = scoreranks[score];
    
    for (j = 0; j < data[i].length; j++)
        rows += '<td>' + data[i][j] + '</td>';
    for (j = data[i].length; j < max_assignment_number + 2; j++)
        rows += '<td></td>';
    rows += "</tr>";
}

$('tbody:last').append(rows);

$("#baseline").addClass('warning');
$("#default").addClass('danger');
$("#oracle").addClass('success');

