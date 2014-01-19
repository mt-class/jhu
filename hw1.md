---
layout: default
img: rosetta
img_url: http://www.flickr.com/photos/calotype46/6683293633/
caption: Rosetta stone (credit&#59; calotype46)
title: Homework 1 | Alignment
---

Alignment <span class="text-muted">Challenge Problem 1</span>
=============================================================

Aligning words is a key task in data-driven machine translation. We start with
a large _parallel corpus_ where the translation of each sentence
is known. So the input consists of sentence pairs like this one:

<center>
<i>le droit de permis passe donc de $ 25 à $ 500 . &mdash;
we see the licence fee going up from $ 25 to $ 500 .</i>
</center>

It is relatively easy to obtain data in this form, though not completely trivial. 
This particular example is from the Canadian Hansards, proceedings of government
meetings that are required to be published in both English and French.
To align the sentences
we can exploit document boundaries and structural cues arising from the fact that the 
documents are translations of each other, such as the fact that translated sentences will be 
in the same order, of similar length, and so forth. The problem is that we
don't know the word-to-word correspondences in each sentence. That's where you come
in: _your challenge is to write a program that aligns the words automatically_. For the
sentence above, you might output the following correspondences:

<center>
<i>le &mdash; the</i>, 
<i>droit &mdash; fee</i>, 
<i>permis&mdash; license</i>, 
<i>passe&mdash;going</i>,
<i>passe&mdash;up</i>,
<i>donc&mdash;from</i>,
<i>$ &mdash; $</i>,
<i>25 &mdash; 25</i>,
<i>à &mdash; to</i>,
<i>$ &mdash; $</i>,
<i>50 &mdash; 50</i>
</center>

Some words might be unaligned (e.g. *we* and *see*), while some words 
might be aligned to multiple words in the corresponding sentence (e.g. *passe*
is aligned to *going up*). Sometimes words aren't exact translations of each
other. That's ok: even experienced bilinguals will sometimes disagree on the best
alignment of a sentence.
But while word alignment doesn't capture every nuance, it is very useful for 
learning translation models or bilingual dictionaries.

Getting Started
---------------

Run this command:

`git clone https://github.com/alopez/dreamt.git`

We have provided you with a very simple aligner written in Python
and around two million words of the Canadian Hansards.  
The source code of the aligner is contained in file called `align`
under the directory `aligner`.
The baseline algorithm works in two phases. First, we train models.  
The aligner observes the training sentences and then gives a score, between 
0 and 1, to each possible alignment. The baseline aligner simply 
computes [Dice's coefficient](http://en.wikipedia.org/wiki/Dice's_coefficient/)
between pairs of English and foreign words.  
It then aligns all pairs of words with a score over 0.5.
Run the baseline heuristic model 1,000 sentences
using the command:

`align -n 1000 &gt; dice.a`

This runs the aligner and stores the output in `dice.a`. To view and
score the alignments, run this command:

`grade &lt; dice.a`

This command scores the alignment quality by comparing the output alignments
against a set of human alignment annotations using a metric called the 
_alignment error rate_, which balances precision and recall of the
guessed alignments (<a href="http://aclweb.org/anthology-new/P/P00/P00-1056.pdf">paper</a>). Look at 
the terrible output of this heuristic model -- it's better than chance, but 
not any good. Try training on 10,000 sentences instead of 1,000, by specifying 
the change on the command line:

`align -n 10000 | grade`

Performance should improve, but only slightly!  Another experiment that 
you can do is change the threshold criterion used 
by the aligner.  How does this affect alignment error rate?

The Challenge
-------------

Your task for this assignment is to _improve the
alignment error rate as much as possible_. It shouldn't be hard to 
improve it at least some: you've probably noticed that thresholding a Dice 
coefficient is a bad idea because alignments don't compete against one 
another. A good way to correct this is with a probabilistic model like IBM Model 1.
It forces all of the English words in a sentence to compete 
as the explanation for each foreign word.


Formally, IBM Model 1 is a probabilistic model that generates each word of 
the foreign sentence \( {\bf f} \) independently, conditioned on some word 
in the English sentence \( {\bf e} \).  
The likelihood of a particular alignment \( {\bf a} \) of the foreign sentence therefore 
factors across words: 
\( P({\bf f}, {\bf a} | {\bf e}) = \prod_i P(a_i = j | |{\bf e}|) \times P(f_i | e_j) \).  
In Model 1, we fix \( P(a_i = j | |e|) \) to be uniform 
(i.e. equal to \( \frac{1}{|{\bf e}|} \)), so the likelihood 
only depends upon the conditional word translation parameters \( P(f | e) \).


The iterative EM update for this model is straightforward. For every 
pair of an English word type
\( e \) and a French word type \( f \), you count up the expected 
(fractional) number of times tokens \(f\) are aligned to tokens of
 \(e\) and normalize over values of \(e\). That will give you a new
estimate of the translation probabilities \(P (f |e)\), which leads 
to new alignment posteriors, and so on. We recommend developing on a small 
data set (1000 sentenes) and only 
a few iterations of EM.  When you are finished, you should see some 
improvements in your alignments.

Developing a Model 1 aligner should be enough to beat our baseline system
and earn seven points. But alignment isn't a solved problem, and the goal of
this assignment isn't for you to just implement a well-known algorithm (in
fact, you are not required to implement Model 1 at all, as long as you can 
beat it). To get full credit you'll need to experiment.
Here are some ideas:

<ul class="real">
  <li>Implement an HMM aligner
    <a href="http://aclweb.org/anthology-new/C/C96/C96-2141.pdf">(paper)</a>.
  </li>
  <li>Add a sparse prior to word alignment probabilities and learn the model using Bayesian inference
    <a href="http://aclweb.org/anthology/P/P11/P11-2032.pdf">(paper)</a>.
  </li>
  <li>Train a French-English model and an English-French model, then 
    combine their predictions in some way 
    <a href="http://aclweb.org/anthology-new/N/N06/N06-1014.pdf">(paper)</a>.
  </li>
  <li>Train a supervised discriminative feature-based aligner using the annotated development set.
    <a href="http://aclweb.org/anthology-new/P/P06/P06-1009.pdf">(paper)</a>.
  </li>
  <li>Train an unsupervised feature-based aligner using the annotated development set.
    <a href="http://aclweb.org/anthology-new/P/P11/P11-1042.pdf">(paper)</a>.
  </li>
  <li><a href="http://scholar.google.com/scholar?q=word+alignment">Seek out
    additional inspiration</a>.
  </li>
</ul>

But the sky's the limit! You can try anything you want as long as you
follow the ground rules:

Ground Rules
------------

* You may work in independently or in groups of any size, under these 
  conditions: 
  1. You must notify us by posting a public note to piazza.
  1. Everyone in the group will receive the same grade on the assignment. 
  1. You can add people or merge groups at any time before the assignment is
     due. HOWEVER, you cannot drop people from your group once you've added them.
     _Collaboration is fine with us_, but 
     adjudicating Rashomon-style stories about who did or did not
     contribute is not. 
* You must turn in three things:
  1. An alignment of the entire dataset, uploaded to BASE_URL/assignment1.txt
     following the <a href="assignment0.html">Assignment 0 instructions</a>. You can upload new output as often
     as you like, up until the assignment deadline. The output will be evaluated 
     using a secret metric, but the `grade` program will give you a good
     idea of how well you're doing, and you can use the `check` program
     to see whether your output is formatted correctly. Whoever has
     the highest score at the deadline will receive the most bonus points.
  1. Your code. Send us a URL from which we can get the code and git revision
     history (a link to a tarball will suffice, but you're free to send us a 
     github link if you don't mind making your code public). This is due at the
     deadline: when you upload your final answer, send us the code.
     You are free to extend the code we provide or roll your own in whatever
     langugage you like, but the code should be self-contained, 
     self-documenting, and easy to use. 
  1. A brief description of your algorithm, posted to piazza. This can
     be of any length, as long as it is clear what you did.
     You have an additional two days to do this.
* You may only use data or code resources other than the ones we
  provide _with advance permission_. We'll probably ask you to make 
  your resources available to everyone. So if, say, you have a cool idea 
  for using the Berkeley parser, or a French-English dictionary, that's 
  great. But to make things fair everyone should have access to the same 
  set of resources, so we'll ask you to share the parses. This kind of 
  constrained data condition is common in real-world evaluations of AI 
  systems, to make evaluations fair. In keeping with this philosophy, 
  we're much more likely to approve your request if 
  you ask _early_. Do not ask the night before the assignment. 
  A few things are off-limits:
  Giza++, the Berkeley Aligner, or anything else that
  already does the alignment for you. You must write your
  own code for alignment. If you want to do system combination, join
  forces with your classmates.

If you have any questions or you're confused about anything, just ask.

*Credits: This assignment is adapted from one originally developed by 
[Philipp Koehn](http://homepages.inf.ed.ac.uk/pkoehn/)
and later modified by [John DeNero](http://www.denero.org/)*
