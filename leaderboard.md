---
layout: default
img: race
img_link: http://www.flickr.com/photos/nationaalarchief/3198249977/
title: Leaderboard
active_tab: leaderboard
jquery: true
---

Submit your assignments [here](http://jhumtclass.appspot.com). Results will be updated immediately.

<script type="text/javascript" src="http://jhumtclass.appspot.com/leaderboard.js"></script>

<table class="table table-hover table-condensed">
  <thead>
    <tr>
      <th>
        Rank
      </th>
      <th>
        Handle
      </th>
      <th class="text-center">
        <a href="hw0.html">#0</a><br/><span class="small text-muted">Scalar (% N)</span>
      </th>
      <th class="text-center">
        <a href="hw1.html">#1</a><br/><span class="small text-muted">Alignment (AER)</span>
      </th>
      <th class="text-center">
        <a href="hw2.html">#2</a><br/><span class="small text-muted">Model score</span>
      </th>
      <th class="text-center">
        <a href="hw3.html">#3</a><br/><span class="small text-muted">Accuracy</span>
      </th>
      <th class="text-center">
        <a href="hw4.html">#4</a><br/><span class="small text-muted">BLEU</span>
      </th>
      <th class="text-center">
        <a href="hw5.html">#5</a><br/><span class="small text-muted">Accuracy</span>
      </th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>

<script type="text/javascript" src="leaderboard-code.js"></script>

<div class="panel panel-default">
    <div class="panel-heading">Legend</div>
    <div class="panel-body">

   <p>A value of -1 indicates that the assignment file was found but
   contained invalid content.</p>

   <p>The <span class="text-success">oracle (best possible)</span>, <span
   class="text-danger">default</span> and 
   <span class="text-warning">baseline (minimum performance for a B)</span> lines are
   highlighted.
  </div>
</div>
