---
layout: default
img: vermeer-writing 
img_link: http://en.wikipedia.org/wiki/A_Lady_Writing_a_Letter
title: Writing Exercise
active_tab: homework
---

Writing Exercise
================

Writing is an essential part of science. How will anyone know or care
about your results if you don't communicate them? As part of your 
homework assignments, we expect you to turn in a report describing
what models you designed and experimented with. Since we have already
given you a concrete problem and dataset, you do not need describe 
these as if you were writing a full scientific paper. So, you should
focus on an accurate technical description of these things:

* __Motivation__: why did you choose the model you experimented with?
* __Description of Model or Algorithm__: describe mathematically or
  algorithmically what you did. Your description should be clear 
  enough that someone else in the class could implement it. What is
  your model? How did you optimize it? How did you align with it? 
  What were the values of any fixed parameters you used?
* __Results__: You most likely experimented with various settings of
  any models you implemented. We want to know how you decided on the
  final model that you submitted for us to grade. What parameters did 
  you try, and what were the results? If you evaluated any qualities
  of the results other than AER, even if you evaluated them 
  qualitatively, how did you do it? Most importantly: __what did you
  learn__?

To help calibrate you for what to expect, we ask you to first read
and evaluate the example writeups below. They are real examples from
others who have implemented good solutions for [Assignment 1](hw1.html),
and if you can reimplement one of these, you are likely to get very
good results. You should read these critically, as if you were 
reviewing for a scientific conference. Ask yourself the following 
questions:

* Do you understand the motivation behind the method?
* Do you understand the method itself? 
* Do you understand the results? 
* Could you implement this method yourself, based on the description in the paper?
* Is it mathematically sound? 
* Are the heuristics and approximations justified?
* Are you convinced by the results? Why or why not?
* Are there other obvious questions that aren't answered?
* Are there any easy additional experiments to do?
* __What did I learn from reading this?__

Focus on clarity rather than novelty. It is fine if the reports
describe models and algorithms that first appeared somewhere else
in the scientific literature. In fact, we expect that to be the 
case for most of the reports. Your sole objective is to decide how
clear the paper is. Once you start to internalize the idea of clear
scientific writing, you can start to apply it to your own writing.

Writing Sample 1
----------------

I implemented IBM2 (seeded with IBM1 probability), trained it both ways 
on the data. Kept all matches, kept match that was reversed in other, and 
kept 40% of the (top) alignments [not counting the others].

I also other things, but the only thing that helped the score was 
training a word stem distribution between IBM1 and IBM2 models, but 
I kept running out of ram when running it on the full data set.

Other things I tried:

- out of vocab word
- distributions on stem and suffixes
- priority queue for selecting the most probable alignments
- training word length distribution (helped a little if trained after IBM2)

Writing Sample 2
----------------

Our model combines three basic insights about word alignment:

1. Words are more likely to be translations of each other if they cooccur frequently.
1. Words at similar positions in each sentence are more likely to be translations of each other.
1. Correspondences tend to be one-to-one.

To model these effects, we use ideas from:

1. Model 1.
1. A simple reparameterization of Model 2 ([Dyer et al. 2013](http://aclweb.org/anthology/N/N13/N13-1073.pdf)).
1. Alignment by agreement ([Liang et al. 2006](http://aclweb.org/anthology//N/N06/N06-1014.pdf)).

The basic model follows the form of Model 1. Given a French sentence
$${\bf f} = f_1...f_n$$ and English sentence $${\bf e} = e_1...e_m$$, we
model alignments of the form $${\bf a} = a_1...a_n$$, where each $$a_i$$
takes a value from 1 to $$m$$, denoting the index of the English word
to which the $$i$$th French word is aligned. We do not model null alignment.
The probability of a particular alignment and the English, given the French,
is then:

<p>$$p({\bf f},{\bf a}|{\bf e}) = \prod_{i=1}^n p(a_i=j|i,j,m,n) \times p(f_i|e_{a_i})$$</p>

We define $$p(a_i|i,j,m,n)$$ as $$\frac{1}{Z_{i,m,n}} e^{\lambda h(i,j,m,n)}$$,
where $$Z_{i,m,n}$$ is a normalization term, $$\lambda$$ is a parameter
that we tune on the development data, and 
$$h(i,j,m,n) = -|\frac{i}{n}-\frac{j}{m}|$$.
We used $$\lambda=1$$ in our submission (Dyer et al. 
learn this parameter along with the others using a stochastic gradient
step in EM). As $$\lambda$$ increases the model prefers alignments that 
are closer to the diagonal. Under this model, the $$a_i$$'s are 
conditionally independent, and the posterior probability that $$f_i$$
aligns to $$e_j$$ is just:

<p>$$p(a_i=j|{\bf f},{\bf e}) = \frac{p(a_i=j|i,j,m,n) \times p(f_i|e_{a_i})}{\sum_{j'\in[1,m]} p(a_i=j'|i,j',m,n) \times p(f_i|e_{a_i})}$$</p>

We can then use this posterior as usual in the expectation maximization
algorithm.

This model enforces that each French word is aligned to exactly one
English word, but there is no similar constraint on the English words,
which can align to arbitrarily many French words. If we enforced a similar
constraint on the English words, inference would be intractable. One
approximation is  to learn translation models $$p_{\theta_1}({\bf f}|{\bf e})$$
and $$p_{\theta_2}({\bf e}|{\bf f})$$---parameterized by $$\theta_1$$
and $$\theta_2$$ respectively---and combine their predictions. We do this
at decoding time by taking the intersection of the most probable alignments
given by each model. We can take it a step further by learning the two models
together, modifying the posteriors so that, in expectation, they
reflect a preference for one-to-one alignments. Denote the event 
that $$f_i$$ aligns to $$e_j$$ by $$x_{ij}=1$$. Then
the posterior probability under both models is proportional to:

<p>$$p(x_{ij}|{\bf f},{\bf e}) \propto p_{\theta_1}(a_i=j|{\bf f},{\bf e}) \times p_{\theta_2}(a_j=i|{\bf e},{\bf f})$$</p>

[Liang et al. 2006](http://aclweb.org/anthology//N/N06/N06-1014.pdf)
show that this can be viewed as a heuristic approximation to a model
that enforces one-to-one alignment on both English and French words.
We simply use this value in the computation of the posterior probability
for both alignment models.

We implemented these models in 92 lines of python code, and
tested several combinations on the development set with 1000 
sentences of training. 

<table class="table table-striped">
<tr><th>Model</th><th>AER</th></tr>
<tr><td>Dice</td><td>0.68</td></tr>
<tr><td>Model 1 p(f|e)</td><td>0.51</td></tr>
<tr><td>Model 1 p(e|f)</td><td>0.45</td></tr>
<tr><td>Model 1 intersection</td><td>0.38</td></tr>
<tr><td>Model 1 joint train</td><td>0.44</td></tr>
<tr><td>Model 1 joint train + intersection</td><td>0.32</td></tr>
<tr><td>Model 2 p(f|e)</td><td>0.45</td></tr>
<tr><td>Model 2 p(e|f)</td><td>0.36</td></tr>
<tr><td>Model 2 intersection</td><td>0.33</td></tr>
<tr><td>Model 2 joint train</td><td>0.37</td></tr>
<tr><td>Model 2 joint train + intersection</td><td><b>0.27</b></td></tr>
</table>

Our final AER on the development set with all training data is 0.177.


Writing Sample 3
----------------

Here is my algorithm:

* Create a new data set as follows:
  - Loop over aligned sentence pairs
  - For each token in the french sentence identify a "corresponding window" 
    of 9 tokens in the english sentence.
  - The index at the center of the "corresponding window" is just the 
    index of the french token times the ratio of the length of the english 
    sentence to the length of the french sentence.
  - For each token in that english window, add a new pair of one token 
    "sentences" (the english token and the original french token) to the 
    new dataset.

* Compute dice's coefficient on the new dataset

__Note__: I didn't really think of the algorithm this way, and I actually 
do the counting as I create the dataset.

* Decoding, loop over sentence pairs:
  - Tentatively align each token in the french sentence with the 
    English token that has the highest Dice's coefficient as computed above.
  - Break ties in Dice score based on distance from french index to 
    "corresponding" English index (same calculation as above).
  - Repeat the process in the other direction and report only those 
    alignments which are chosen in both directions.

Writing Sample 4
----------------

### Implemented solution

I implemented the model described in 
[Dyer et al. 2013](http://aclweb.org/anthology//N/N13/N13-1073.pdf), 
in addition to model 1.

A diagonal prior is imposed on the alignment links, and a 
mean-field approximation is used in the E step to estimate the 
posterior translation distribution with a Dirichlet prior.

Then, I applied several pre-processing steps to improve alignments:
- lowercase the data
- stem German and English with the Snowball stemmer (see stem-corpus.py)
- split the compounds in German using cdec (see csplit.py and uncsplit.py)

Finally, I tuned the hyperparameters of the systems (diagonal 
tension, null alignment probability and Dirichlet prior strength) on 
the dev set to minimize AER using the simplex method.

### Results summary (dev corpus)

<table class="table table-striped">
<tr><th>Model</th><th>AER</th><th>Δ</th></tr>
<tr><td>Baseline</td><td>0.792556</td><td></td></tr>
<tr><td>Model 1</td><td>0.421544</td><td>0.37</td></tr>
<tr><td>+ diagonal prior</td><td>0.290222</td><td>0.13</td></tr>
<tr><td>+ Dirichlet prior</td><td>0.269823</td><td>0.02</td></tr>
<tr><td>+ compound split</td><td>0.257015</td><td>0.01</td></tr>
<tr><td>+ stem</td><td>0.243009</td><td>0.01</td></tr>
<tr><td>+ tune</td><td>0.233541</td><td>0.01</td></tr>
</table>

### Usage

Run the following command to replicate the experiments:

```bash
cat data/dev-test-train.de-en | python csplit.py | python stem-corpus.py | python modelc.py | python uncsplit.py | ./check | ./grade -n 0
```
