// The current assignment number (0-indexed)
var assignment_number = 4;

// The maximum assignment number (0-indexed)
var max_assignment_number = 5;

var rows = "";
var scoreranks = new Array();
for (i = 0; i < data.length; i++) {
    var user = data[i][0];

    rows += '<tr id="' + user + '">';
    var prevscore = (i == 0) ? -1 : data[i-1][1+assignment_number];
    var score = data[i][1+assignment_number];
    if (score != prevscore) {
        scoreranks[score] = i;
        rows += '<td>' + (i+1) + '</td>';
    } else {
        rows += '<td></td>';
    }

    var rank = scoreranks[score];

    if (hidden_users[user])
      rows += "<td><i><strike>" + user + "</strike></i>";
    else
      rows += '<td>' + user
    if (names[user])
      rows += ' (' + names[user] + ')';
    rows = rows + '</td>';
    for (j = 1; j < data[i].length; j++)
        rows = rows + '<td class="score">' + data[i][j] + '</td>';
    for (j = data[i].length; j < max_assignment_number + 2; j++)
        rows += '<td></td>';
    rows += "</tr>";
}

$('tbody:last').append(rows);
$("td.score").addClass("text-right");
$("#baseline").addClass('warning');
$("#default").addClass('danger');
$("#oracle").addClass('success');

