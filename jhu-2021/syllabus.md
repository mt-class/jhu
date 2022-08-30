---
layout: default
img: cover
img_link: http://www.statmt.org/book/
title: Syllabus
img2: nmt-book.jpg
img2_link: http://www.statmt.org/nmt-book/
active_tab: main_page 
---

<table class="table table-striped"> 
  <tbody>
    <tr>
      <th nowrap>Date</th>
      <th>Topic</th>
      <th>Readings (starred=graduate level)</th>
    </tr>
    {% for lecture in site.data.syllabus.past %}
    <tr>
      <td nowrap>{{ lecture.date | date: "%b %d" }}</td>
      <td>
        {% if lecture.slides %}<a href="{{ lecture.slides }}">{{ lecture.title }}</a>
        {% else %}{{ lecture.title }}{% endif %}
      {% if lecture.links %}
	<br/>
        {% for link in lecture.links %}
	  [<a href="{{ link.url }}">{{ link.text }}</a>]
        {% endfor %}
      {% endif %}
  {% if lecture.language %}
	<br/><a href="lin10.html">Language in 10</a>: <a href="{{ lecture.language_slides }}">{{ lecture.language }}</a>
        {% endif %}
      </td>
      <td>
        {% if lecture.reading %}
          <ul class="fa-ul">
          {% for reading in lecture.reading %}
            <li>
            {% if reading.optional %}<i class="fa-li fa fa-star"> </i>
            {% else %}<i class="fa-li fa"> </i> {% endif %}
            {{ reading.author }},
            {% if reading.url %}
            <a href="{{ reading.url }}">{{ reading.title }}</a>
            {% else %}
            {{ reading.title }} 
            {% endif %}
            </li>
          {% endfor %}
          </ul>
        {% endif %}
      </td>
    </tr>
    {% endfor %}

  </tbody>
</table>

