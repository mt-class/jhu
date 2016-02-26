---
layout: default
img: exam
img_link: http://www.flickr.com/photos/gianellbendijo/4034021658/
caption: Image by gianellbendijo (used with permission)
title: Homework 3 | Evaluation
active_tab: homework
---

Evaluation <span class="text-muted">Challenge Problem 3</span>
==============================================================

Automatic evaluation is a key problem in machine translation. 
Suppose that we have two machine translation systems. On one 
sentence, system A outputs:

_This type of zápisníku was very ceněn writers and cestovateli._

And system B outputs:

_This type of notebook was very prized by writers and travellers._

We suspect that system B is better, though we don't necessarily
know that its translations of the words _zápisníku_, _ceněn_,
and _cestovateli_ are correct. But suppose that we also have
access to the following reference translation.

_This type of notebook is said to be highly prized by writers and travellers._

We can easily judge that system B is better. __Your challenge is to 
write a program that makes this judgement automatically__.

Getting started
---------------

If you have a clone of the repository from 
previous homeworks, you can update it 
from your working directory:

    git pull origin master

Alternatively, get a fresh copy:

    git clone https://github.com/alopez/en600.468.git

Under the `evaluate` directory, you now have simple program
that decides which of two machine translation outputs is better.
Test it out!

    python evaluate > eval.out

This assignment uses a very simple evaluation method. Given
machine translations $$h_1$$ and $$h_2$$ and reference translation
$$e$$, it computes $$f(h_1, h_2, e)$$ as follows, where $$\ell(h,e)$$ 
is the count of words in $$h$$ that are also in $$e$$.

<center>
$$f(h_1,h_2,e) = \left\{\begin{array}{lcc}1 & \textrm{if} & \ell(h_1,e) > \ell(h_2,e)\\ 0  & \textrm{if} & \ell(h_1,e) = \ell(h_2,e)\\-1  & \textrm{if} & \ell(h_1,e) < \ell(h_2,e) \end{array}\right.$$
</center>

We can compare the results of this function with those of human 
annotator who rated the same translations.

    python compare-with-human-evaluation < eval.out
    
The Challenge
-------------

Your challenge is to __improve the accuracy of automatic evaluation as 
much as possible__. Improving the metric to use the simple METEOR metric
in place of $$\ell(h, e)$$ is sufficient to pass. Simple METEOR computes
the harmonic mean of precision and recall. That is:

<center>
$$\ell(h,e) = \frac{P(h,e)\cdot R(h,e)}{(1-\alpha)R(h,e)+\alpha P(h,e)}$$
</center>

where $$P$$ and $$R$$ are precision and recall, defined as:

<center>
$$\begin{array}{c}
R(h,e) = \frac{|h\cap e|}{|e|}\\
P(h,e) = \frac{|h\cap e|}{|h|}
\end{array}$$
</center>

Be sure to tune the parameter $$\alpha$$ that balances precision and
recall. This is a very simple 
baseline to implement. However, evaluation is not solved,
and the goal of this assignment is for you to experiment with methods
that yield improved predictions of relative translation accuracy. Some
things that you might try:

* Learn [a classifier](http://aclweb.org/anthology//W/W11/W11-2113.pdf) from the training data.
* Use [WordNet](http://wordnet.princeton.edu/) to match synonyms.
* Compute string similarity using [string subsequence kernels](http://jmlr.org/papers/volume2/lodhi02a/lodhi02a.pdf).
* Use an n-gram language model to better assess fluency.
* Develop a single-sentence variant of [BLEU](http://aclweb.org/anthology//P/P02/P02-1040.pdf).
* Use a dependency parser to [assess syntactic well-formedness](http://ssli.ee.washington.edu/people/jgk/dist/metaweb/mtjournal.pdf).
* Develop a method to automatically assess semantic similarity.
* See what evaluation measures [other people have implemented](http://www.statmt.org/wmt10/pdf/wmt10-overview.pdf).

But the sky's the limit! Automatic evaluation is far from solved, and there
are many different solutions you might invent. You can try anything you want 
as long as you follow the ground rules:

Ground Rules
------------

* You can work in independently or in groups of up to three, under these 
  conditions: 
  1. You must announce the group publicly on piazza.
  1. You agree that everyone in the group will receive the same grade on the assignment. 
  1. You can add people or merge groups at any time before the assignment is
     due. **You cannot drop people from your group once you've added them.**
  We encourage collaboration, but we will not adjudicate Rashomon-style 
  stories about who did or did not contribute.
* You must turn in three things:
  1. Your automatic judgements of the entire dataset, uploaded to the [leaderboard submission site](http://jhumtclass.appspot.com) according to <a href="assignment0.html">the Assignment 0 instructions</a>. You can upload new output as often
     as you like, up until the assignment deadline. 
  1. Your code. Send us a URL from which we can get the code and git revision
     history (a link to a tarball will suffice, but you're free to send us a 
     github link if you don't mind making your code public). This is due at the
     deadline: when you upload your final answer, send us the code.
     You are free to extend the code we provide or roll your own in whatever
     langugage you like, but the code should be self-contained, 
     self-documenting, and easy to use. 
  1. A clear, mathematical description of your algorithm and its motivation
     written in scientific style. This needn't be long, but [it should be
     clear enough that one of your fellow students could re-implement it 
     exactly](hw-writing-exercise.html).
*  You do not need any other data than what we provide. You are
   free to use any code or software you like, __except for those
   expressly intended to evaluate machine translation output__. 
   You must write your own evaluation function. If you want to use 
   part-of-speech taggers, syntactic or semantic parsers, machine
   learning libraries, thesauri, or any other off-the-shelf resources,
   go nuts. But evaluation software like BLEU, TER, METEOR, or their
   many variants are off-limits. You may of course inspect these systems 
   if it helps you understand how they work. If you aren't sure whether 
   something is permitted, ask us. If you want to do system combination, 
   join forces with your classmates.

*Credits: This assignment was designed by [Chris Dyer](http://www.cs.cmu.edu/~cdyer)
 based on one we gave in [2012](http://mt-class.org/past/jhu/2012/hw3.html), which also inspired a 
 [whole](http://aclweb.org/anthology//W/W12/W12-3101.pdf)
 [series](http://aclweb.org/anthology//W/W12/W12-3102.pdf) 
 [of](http://hltc.cs.ust.hk/iwslt/proceedings/paper_34.pdf) 
 [papers](http://aclweb.org/anthology//P/P13/P13-1139.pdf).*
