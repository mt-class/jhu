---
layout: default
img: rosetta
img_url: http://www.flickr.com/photos/calotype46/6683293633/
caption: Rosetta stone (credit&#59; calotype46)
title: Homework 1 | Alignment
active_tab: homework
---

Alignment <span class="text-muted">Challenge Problem 1</span>
=============================================================

Aligning words is a key task in machine translation. We start with
a large _parallel corpus_ of aligned sentences. For example, we might
have the following sentence pair from the proceedings of the bilingual 
Canadian parliament:

*le droit de permis passe donc de $ 25 à $ 500*.

*we see the licence fee going up from $ 25 to $ 500*.

Getting documents aligned at the _sentence_ level like this is
relatively easy: we can use paragraph boundaries and simple cues
like the length and order of each sentence. But to learn a translation
model we need alignments at the _word_ level. That's where you come
in. **Your challenge is to write a program that aligns words 
automatically.** For example, given the sentence above, your program
would ideally output these pairs:

*le -- the,
droit -- fee,
permis -- license,
passe -- going,
passe -- up,
donc -- from,
$ -- $,
25 -- 25,
à -- to,
$ -- $,
50 -- 50*

Your program can leave words unaligned (e.g. *we* and *see*) or 
multiply aligned (e.g. *passe* aligned to *going up*). It will be
faced with difficult choices. Suppose it sees this sentence pair:

*I want to make it clear that we have to let this issue come to a vote today*.

*il est donc essentiel que cette question fasse le objet de un vote aujourd' hui .*

Your program must make a choice about how to align the words of the non-literal
translations *I want to make it clear* and *il est donc essentiel*. Even
experienced bilinguals will disagree on examples like this. So word alignment
does not capture every nuance, but it is still very useful.

Getting Started
---------------

Run this command:

    git clone https://github.com/alopez/dreamt.git

In the `aligner` directory you will find a python program called
`align`, which contains a complete but very simple alignment algorithm.
It first computes [Dice's coefficient](http://en.wikipedia.org/wiki/Dice's_coefficient/)
between every pair of English and French words. It then aligns
words with a coefficient over 0.5. Run it on 1000 sentences:

    ./align -n 1000 > dice.a

This command stores the output in `dice.a`. To compute accuracy, run:

    ./grade < dice.a

This compares the alignments against human-produced alignments, computing 
[alignment error rate](http://aclweb.org/anthology-new/P/P00/P00-1056.pdf), 
which balances precision and recall. It will also show you the comparison 
in a grid. Look at the terrible output of this heuristic method -- it's 
better than chance, but not any good. Try training on 10,000 sentences:

    ./align -n 10000 | grade

Performance should improve, but only slightly! Try changing the
threshold for alignment. How does this affect alignment error rate?

The Challenge
-------------

Your task is to _improve the
alignment error rate as much as possible_. It shouldn't be hard: you've 
probably noticed that thresholding a Dice coefficient is a bad idea because 
alignments don't compete against one another. A good way to correct this is 
with a probabilistic model like IBM Model 1. It forces all of the English 
words in a sentence to compete as the explanation for each foreign word.

Formally, IBM Model 1 is a probabilistic model that generates each word of 
the foreign sentence $${\bf f}$$ independently, conditioned on some word 
in the English sentence $${\bf e}$$. The likelihood of a particular 
alignment $${\bf a}$$ of the foreign sentence therefore 
factors across words: 
$$P({\bf f}, {\bf a} | {\bf e}) = \prod_i P(a_i = j | |{\bf e}|) \times P(f_i | e_j)$$.  
In Model 1, we fix $$P(a_i = j | |e|)$$ to be uniform 
(i.e. equal to $$\frac{1}{|{\bf e}|}$$), so the likelihood 
only depends upon the conditional word translation parameters $$P(f | e)$$.

To compute the iterative EM update, for every pair of an English word type
$$e$$ and a French word type $$f$$, count up the expected 
number of times tokens $$f$$ are aligned to tokens of
$$e$$ and normalize over values of $$e$$. That will give you a new
estimate of the translation probabilities $$P (f |e)$$, which leads 
to new expectations, and so on. We recommend developing on a small 
data set (1000 sentences) with a few iterations of EM. When you see
improvements on this small set, try it out on the complete data.

Developing a Model 1 aligner should be enough to beat our baseline system
and earn seven points. But alignment isn't a solved problem, and the goal of
this assignment isn't for you to just implement a well-known algorithm. To 
get full credit you must experiment. Here are some ideas:

* Implement an [HMM alignment model](http://aclweb.org/anthology-new/C/C96/C96-2141.pdf).
* [Use *maximum a posteriori* inference under a Bayesian prior.](http://aclweb.org/anthology/P/P11/P11-2032.pdf).
* Train a French-English model and an English-French model and [combine their predictions](http://aclweb.org/anthology-new/N/N06/N06-1014.pdf).
* Train a [supervised discriminative alignment model](http://aclweb.org/anthology-new/P/P06/P06-1009.pdf) on the annotated development set.
* Train an [unsupervised discriminative alignment model](http://aclweb.org/anthology-new/P/P11/P11-1042.pdf).
* Seek out additional [inspiration](http://scholar.google.com/scholar?q=word+alignment).

But the sky's the limit! You can try anything as long as you
follow the ground rules:

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
  1. A clear, mathematical description of your algorithm and its motivation
     written in scientific style. We will review examples in class.
* You may only use data or code resources other than the ones we
  provide _with advance permission_. We will ask you to make 
  your resources available to everyone. If you have a cool idea 
  using the Berkeley parser, or a French-English dictionary, that's 
  great. But we want everyone to have access to the same resources, 
  so we'll ask you to share the parses. This kind of 
  constrained data condition is common in real-world evaluations of AI 
  systems, to make evaluations fair. A few things are off-limits:
  Giza++, the Berkeley Aligner, or anything else that
  already does the alignment for you. You must write your
  own code. If you want to do system combination, join
  forces with your classmates.

If you have any questions or you're confused about anything, just ask.

*Credits: This assignment is adapted from one originally developed by 
[Philipp Koehn](http://homepages.inf.ed.ac.uk/pkoehn/)
and later modified by [John DeNero](http://www.denero.org/)*
