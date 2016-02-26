---
layout: default
img: voynich
img_link: http://en.wikipedia.org/wiki/Voynich_manuscript 
caption: The Voynich manuscript
title: Homework 2 | Decoding
active_tab: homework
---

Decoding <span class="text-muted">Challenge Problem 2</span>
=============================================================

Decoding is process of taking input in French:

_<center>
honorables sénateurs , que se est - il passé ici , mardi dernier ?
</center>_

...And finding its best English translation under your  model:

_<center>
honourable senators , what happened here last Tuesday ?
</center>_

To decode, we need a model of English sentences conditioned on the
French sentence. You did most of the work of creating
such a model in [Homework 1](hw1.html). In this assignment,
we will give you some French sentences and a probabilistic model consisting of
a phrase-based translation model $$p_{\textrm{TM}}(\textbf{f},\textbf{a} \mid \textbf{e})$$
and an n-gram language model $$p_{\textrm{LM}}(\textbf{e})$$. __Your 
challenge is to find the most probable English translation under 
the model.__ We assume a noisy channel decomposition.

<center>
$$\begin{align*} \textbf{e}^* & = \arg \max_{\textbf{e}} p(\textbf{e} \mid \textbf{f}) \\ & = \arg \max_{\textbf{e}} \frac{p_{\textrm{TM}}(\textbf{f} \mid \textbf{e}) \times p_{\textrm{LM}}(\textbf{e})}{p(\textbf{f})} \\ &= \arg \max_{\textbf{e}} p_{\textrm{TM}}(\textbf{f} \mid \textbf{e}) \times p_{\textrm{LM}}(\textbf{e}) \\ &= \arg \max_{\textbf{e}} \sum_{\textbf{a}} p_{\textrm{TM}}(\textbf{f},\textbf{a} \mid \textbf{e}) \times p_{\textrm{LM}}(\textbf{e}) \end{align*}$$
</center>

Getting Started
---------------

If you have a clone of the repository from 
[homework 1](hw1.html), you can update it 
from your working directory:

    git pull origin master

Alternatively, get a fresh copy:

    git clone https://github.com/alopez/en600.468.git

Under the `decode` directory, you now have simple decoder.
Test it out!

    python decode > output

This creates the file `output` with translations of `data/input`.
You can compute $$p(\textbf{e} \mid \textbf{f})$$ using `compute-model-score`.

    python compute-model-score < output

This command sums over all possible ways that the model could have 
generated the English from the French, including translations
that permute the phrases. This sum is
intractable, but the phrase dictionary is fixed and sparse, 
so we can compute it in a few minutes. It is still easier to do this 
than it is to find the optimal translation. But if you look at this
command you may get some hints about how to do the assignment!

The decoder generates the most probable translations 
that it can find, using three common approximations. 

First, it seeks the _Viterbi approximation_ to the most probable 
translation. Instead of computing the intractable sum over
all alignments for each sentence, we simply find the best 
single alignment and use its translation.

<center>$$\begin{align*} \textbf{e}^* &= \arg \max_{\textbf{e}} \sum_{\textbf{a}} p_{\textrm{TM}}(\textbf{f},\textbf{a} \mid \textbf{e}) \times p_{\textrm{LM}}(\textbf{e}) \\ &\approx \arg \max_{\textbf{e}} \max_{\textbf{a}} p_{\textrm{TM}}(\textbf{f},\textbf{a} \mid \textbf{e}) \times p_{\textrm{LM}}(\textbf{e}) \end{align*}$$</center>

Second, it translates French phrases into English without
changing their order. So, it only reorders words  if 
the reordering has been memorized as a phrase pair.
For example, in the first sentence, we see that
_<span class="text text-primary">mardi</span>
<span class="text text-danger">dernier</span>_
is correctly translated as
_<span class="text text-danger">last</span>
<span class="text text-primary">Tuesday</span>_.
If we consult `data/tm`, we will find that the model
has memorized the phrase
pair `mardi dernier ||| last Tuesday`. But in the
second sentence, we see that 
_<span class="text text-danger">Comité</span> 
<span class="text text-primary">de sélection</span>_
is translated as 
_<span class="text text-danger">committee</span> 
<span class="text text-primary">selection</span>_,
rather than the more correct
_<span class="text text-primary">selection</span>
<span class="text text-danger">committee</span>_. 
To show that this is a search problem rather than
a modeling problem, we can generate the latter output
by hand and check that the model really prefers it.

    head -2 data/input | tail -1 > example
    python decode -i example | python compute-model-score -i example
    echo a selection committee was achievement . | python compute-model-score -i example

The scores are reported as log-probabilities, and higher
scores (with lower absolute value) are better. We 
see that the model prefers
_<span class="text text-primary">selection</span>
<span class="text text-danger">committee</span>_, 
but the decoder does not consider this word order.

Finally, our decoder uses strict pruning. As it consumes the input
sentence from left to right, it keeps only the highest-scoring
output up to that point. You can vary the number of number
of outputs kept at each point in the translation using the
`-s` parameter. See how this affects the resulting model score.

    python decode | python compute-model-score
    python decode -s 10000 | python compute-model-score

The Challenge
-------------

Your task is to __find the most probable English translation__.
Our model assumes that any segmentation of the French sentence into
phrases followed by a one-for-one substitution and permutation of
those phrases is a valid translation. We make the 
simplifying assumption that segmentation and ordering
probabilities are uniform across all sentences, hence constant.
This means that $$p(\textbf{e},\textbf{a} \mid \textbf{f})$$ is proportional to
the product of the n-gram probabilities in $$p_{\textrm{LM}}(\textbf{e})$$
and the phrase translation probabilities in $$p_{\textrm{TM}}(\textbf{f},\textbf{a} \mid \textbf{e})$$. To 
avoid numerical underflow we work in logspace, seeking
$$\arg \max_{\textbf{e}} \max_{\textbf{a}} \log p_{\textrm{TM}}(\textbf{f},\textbf{a} \mid \textbf{e}) + \log p_{\textrm{LM}}(\textbf{e})$$. The
baseline decoder works with log probabilities, so you can
simply follow what it does. 

To pass, you must implement a beam-search 
decoder like the one we have given you 
that is also capable of _swapping adjacent phrases_. To get 
full credit, you __must__ additionally experiment with another decoding algorithm.
Any permutation of phrases is a valid translation, so we strongly suggest
searching over all or some part of this larger space. This search is
NP-Hard, so it will not be easy. You 
can trade efficiency for search effectiveness
by implementing histogram pruning or threshold pruning, or by using 
reordering limits as described in the textbook (Chapter 6). Or, you might
consider implementing other approaches to solving this combinatorial
optimization problem:

* [Implement a greedy decoder](http://www.iro.umontreal.ca/~felipe/bib2webV0.81/cv/papers/paper-tmi-2007.pdf).
* [Use chart parsing to search over many permutations in polynomial time](http://acl.ldc.upenn.edu/C/C04/C04-1030.pdf).
* [Use a traveling salesman problem (TSP) solver](http://aclweb.org/anthology-new/P/P09/P09-1038.pdf).
* [Use finite-state algorithms](http://mi.eng.cam.ac.uk/~wjb31/ppubs/ttmjnle.pdf).
* [Use Lagrangian relaxation](http://aclweb.org/anthology//D/D13/D13-1022.pdf).
* [Use integer linear programming](http://aclweb.org/anthology-new/N/N09/N09-2002.pdf).
* [Use A* search](http://aclweb.org/anthology-new/W/W01/W01-1408.pdf).

These methods all attempt to approximate or solve the Viterbi approximation to decoding.
You can also try to approximate $$p(\textbf{e} \mid \textbf{f})$$ directly.

* [Use variational algorithms](http://aclweb.org/anthology//P/P09/P09-1067.pdf).
* [Use Markov chain Monte Carlo algorithms](http://aclweb.org/anthology//W/W09/W09-1114.pdf).

But the sky's the limit! There are many ways to decode.
You can try anything you want as long as you follow the ground rules:

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
  1. Your translations of the entire dataset, uploaded to the [leaderboard submission site](http://jhumtclass.appspot.com) according to <a href="assignment0.html">the Assignment 0 instructions</a>. You can upload new output as often
     as you like, up until the assignment deadline. 
  1. Your code. Send us a URL from which we can get the code and git revision
     history (a link to a tarball will suffice, but you're free to send us a 
     github link if you don't mind making your code public). This is due at the
     deadline: when you upload your final answer, send us the code.
     You are free to extend the code we provide or roll your own in whatever
     langugage you like, but the code should be self-contained, 
     self-documenting, and easy to use. 
  1. A clear, mathematical description of your algorithm and its motivation
     written in scientific style. This needn't be long, but it should be
     clear enough that one of your fellow students could re-implement it 
     exactly. [We will review examples in class before the due date](hw-writing-exercise.html).
*  You do not need any other data than what we provide. You can
   free to use any code or software you like, __except for those
   expressly intended to decode machine translation models__. 
   You must write your own decoder. If you want to use finite-state
   libraries, solvers for traveling salesman problems, or
   integer linear programming toolkits, that is fine. 
   But machine translation software including (but not limited to)
   Moses, cdec, Joshua, or phrasal is off-limits. You may of course inspect 
   these systems if it helps you understand how they work. But be warned: they are
   generally quite complicated because they provide a great deal of other
   functionality that is not the focus of this assignment.
   It is possible to complete the assignment with a modest amount
   of python code. If you aren't sure whether something is permitted, 
   ask us. If you want to do system combination, join forces with 
   your classmates.


*Credits: [Chris Dyer](http://www.cs.cmu.edu/~cdyer) made many improvements to this assignment.*
