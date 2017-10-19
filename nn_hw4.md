---
layout: default
img: rosetta
img_url: http://www.flickr.com/photos/calotype46/6683293633/
caption: Rosetta stone (credit&#59; calotype46)
title: Homework 4 | Multi-word Cloze
active_tab: homework
---

<span class="text-muted">Homework 4:</span> Multi-word Cloze 
=============================================================

Due: November 2nd, 2017

<!-- A language model predicts the probability of the next word $w_i$ given its context:

$$P(w_i\mid w_1, w_2, \ldots, w_{i-1})$$

You have learned about count-based n-gram language models and feed-forward neural n-gram language models, and although they're more computationally efficient and scalable, you've heard about their limitation introduced by a fixed context window. In this homework, we move up to language models that are theoretically able to look at unlimited context - the recurrent neural language model. -->

A cloze is a problem when you fill in missing words in a sentence, for example, if you have input:

```
we 're talking <blank> years ago before anyone heard <blank> asbestos having <blank> questionable properties .
speculators <blank> calling for a degree <blank> liquidity that is not there in the <blank> .
```

The correct answer for the example is:

```
about of any
are of market
```

**Your challege is to achieve high accuracy on filling the missing words**. This is a very similar problem to language modeling, except that the prediction is no longer monotonic (left-to-right), and that the context is no longer complete. As a baseline, you should build a recurrent neural language model to solve this task. After that, you are expected to implement at least one other model to improve over the baseline.

This homework serves as a tutorial for you to get up to speed on deep learning implementation as well as problem solving before we implement more complicated neural machine translation model (which is your next homework), so don't be surprised by its length. After finishing this homework, you should be familiar with a deep learning framework (which means PyTorch as of 2017) and be able to implement your ideas in it. Also, you should be able to run your program on a remote host equipped with GPU and speed up your training.

<!-- Your challenge, as with most language model tasks, is to **build the language model with the lowest perplexity on the test set**. -->

Cloud Guide (2017)
--------------

We'll be using Google Cloud as GPU support for this year. Before you proceed to part IV, please read through [this note](http://mt-class.org/jhu/cloud.html) so you know how to use the Google Cloud GPU host.

Please keep in mind that you should use your GPU hours wisely since the $50 credit will only give you ~60 hours of GPU usage.

Deep Learning Framework Choice Policy (2017)
---------------

We understand people may have different preferences for deep learning frameworks, but as new frameworks come out everyday, it is not possible for us as instructors and TAs to cover knowledge of all the frameworks. As of 2017, we will use [PyTorch](http://pytorch.org) for all the starter code and is only able to help if you are using PyTorch. PyTorch is quickly gaining popularity among NLP/MT/ML research community and is, from our perspective, relatively easy to pick up as a beginner.

If you prefer using another framework, we welcome contribution of your starter code (and you'll get credit as contributors in a homework that'll likely to be used in the coming years), but again, we are not able to help if you run into problems with the framework.

Your choice of framework will not affect the grade of your homework.

Part O: Setup 
---------------

To start with, install [pytorch](http://pytorch.org). Their homepage has a really foolproof installation guide, just follow that and you'll be fine.

Now, check out the [starter code](https://github.com/shuoyangd/en600.468) (note that this is a different repository from what you checked out previously). There might be several dependencies you want to install:

    pip install -r requirements.txt

Then, download the preproceed data file [here](https://drive.google.com/open?id=0Bwx3D6Nc6za4R0pSc1V3QWQwQUk).

> Note: Before we start to explain the starter code, if you don't know what is a tensor, take 30 seconds to acquaint yourself with the notion of tensors in PyTorch by reading the first few paragraphs of this [PyTorch document](http://pytorch.org/docs/0.2.0/tensors.html) as we'll be using this term pretty pervasively.

The preprocessing script will collect the tokens in the training data and form a vocabulary, it will then convert sentences in training set, dev set and test set into list of torch tensors, with each tensor holding the word indexes for once sentence. The vocabulary is an instance of vocabulary implementation in [torchtext](https://github.com/pytorch/text/blob/master/torchtext/vocab.py).
Finally, it will dump a binarized version of the data as well as the vocabulary onto disk, to the path you specify with `--data_file` option. Run the preprocessing script on your data now, e.g.:

    python preprocess.py --train_file data/train.en.txt --dev_file data/dev.en.txt --test_file data/test.en.txt.cloze --data_file data/hw4_data.bin

Now `data/hw4_data.bin` contains a tuple `(train_data, dev_data, test_data, vocab)`. You can unpack this binary dump with the following python code:
    
    train_data, dev_data, test_data, vocab = torch.load(open("data/hw4_data.bin", 'rb'), pickle_module=dill)

The train.py and train_bi.py script will start by generating "batches" for the training and dev data, which you'll learn about later. It then iterates through this "batched" training data (which is a torch tensor of size `(sequence_length, batch_size)`) and perform parameter updates for the model to minimize the loss function.
Normally, each pass through the data is called an "epoch". At the end of each epoch, the training script evaluate the current model on the dev data to see how well it does.
If the evaluation result on the dev set stops improving, the training process will terminate (called "early stopping") in order to avoid over-fitting.
In our training script, we evaluate on dev data by computing the same loss function as on the training data.

Currently train.py and train_bi.py will not work because there is no model for it to train. So now it's time to implement your model!

Part I: Uni-directional RNN Language Model
---------------

For this part, you will be needing to implement a uni-directional RNN language model in the class `RNNLM` in `models.py`. This part is going to be pretty long because we are assuming no prior experience with deep learning frameworks. If you have used PyTorch/Theano/Tensorflow/MXNet before, you may only read the first and the last section and skim through the middle parts.

You will run starter code `train.py` to train your model. 

### The Model 

The uni-directional RNN language model is described in [(Mikolov et al. 2010)](http://www.fit.vutbr.cz/research/groups/speech/publi/2010/mikolov_interspeech2010_IS100722.pdf). There are three parts in the model:

+ The word embedding layer, which is simply a lookup table that stores the vector representation for each word type in the training data, including the special token "<unk>" reserved for unknown words. The vector representations should be queried by word indexes.
+ The simple recurrent layer, scans one token in the left-to-right order at each timestep and computes the hidden state of each timestep by $$h_t = \sigma(W_x x_t + W_h h_{t - 1})$$ (bias terms omitted).
+ The output layer, which first performs an linear transformation on the hidden states of the recurrent layer into a vector that has the same size as the full vocabulary, and then applies [softmax function](https://en.wikipedia.org/wiki/Softmax_function) over this vector, and then a element-wise log. The resulting vector is the output of this network.

The output of the network is essentially the probability distribution $$p(w_i\mid w_1, w_2, \ldots, w_{i-1})$$ in the log space. To train this network, we would like to maximize the log probability of the training corpus, which is the objective function (a.k.a. negative loss function, which is why we always minimize loss function instead of maximize them) of the training: $$\mathcal{R} = \prod_{i\in\mathcal{I}} log p(w_i\mid w_1, w_2, \ldots, w_{i-1})$$ where $$\forall i \in \mathcal{I}$$, $$w_i$$ is a token in the sentence. This loss function as well as the parameter updates are both already implemented for you in the starter code.

For further detail of the model, either consult the [original paper](http://www.fit.vutbr.cz/research/groups/speech/publi/2010/mikolov_interspeech2010_IS100722.pdf), the [slides from class](http://mt-class.org/jhu/slides/lecture-nn-lm.pdf), or section 4.4 of the [brand new NMT textbook](http://mt-class.org/jhu/assets/nmt-book.pdf). 

### Think in Tensors

Naïvely, you could implement these three layers simply by using native python lists and loop over them. But the way to program in PyTorch as well as most of other deep learning framework is to think of these kind of models as a "tensor processor", where you accomplish all the funcionalities by performing operations on tensors. Once you fit your implementation into this tensor processing norm, the framework would be able to do automatic backward computation (such as auto-gradient) as well as GPU scale-up for you, but at the beginning this kind of formalization could be a bit hard.

As an example, instead of implementing word embedding layer as a python dictionary, you should store all the vector representations as a tensor of size `(vocab_size, embedding_dimension)`, and implement queries by tensor indexing, like what the following code does:

```
>>> import torch
>>> vocab_size = 5
>>> embedding_size = 10
>>> X = torch.randn(vocab_size, embedding_size)  # random word embedding
>>> X

 0.5578  1.1588 -0.6637  0.1458 -0.3391 -0.3781  0.4258  0.3408 -2.2261 -1.0726
 1.1827  0.2591  0.4138  0.3177  1.2661 -1.3385  1.5432  0.3045  2.7213 -0.5656
-0.0122  0.3016  1.0126 -0.7579 -0.9274 -0.9733  0.7564 -0.5552  0.1879 -0.3284
-1.1219 -0.5541 -0.2973  1.2250 -0.8776  1.0481  0.1458  1.0012  1.0648 -2.4254
 1.5937 -0.0791 -0.3738  1.7690  0.4109 -1.0781 -2.2902  1.3497  0.3475  0.4289
[torch.FloatTensor of size 5x10]

>>> sequence_length = 3
>>> word_idx = torch.LongTensor([1, 2, 3]) # (sequence_length,)
>>> word_idx

 1
 2
 3
[torch.LongTensor of size 3]

>>> embedding_query = X[word_idx, :]
>>> embedding_query

 1.1827  0.2591  0.4138  0.3177  1.2661 -1.3385  1.5432  0.3045  2.7213 -0.5656
-0.0122  0.3016  1.0126 -0.7579 -0.9274 -0.9733  0.7564 -0.5552  0.1879 -0.3284
-1.1219 -0.5541 -0.2973  1.2250 -0.8776  1.0481  0.1458  1.0012  1.0648 -2.4254
[torch.FloatTensor of size 3x10]
```

As you see, a word embedding query (represented by `word_idx`) with size `(sequence_length, )` would return a result with size `(sequence_length, word_embedding)`, where each row in the result is the word embedding for the word we wish to query. Now we have formalized the word embedding layer all in terms of tensor processing.

As a practice, try to figure out yourself what would be the tensor operations of simple recurrent layer and output layer (much more intuitive than embedding layer). Especially, it's helpful to know what is the input and output tensor shapes of these layers. For this part, you can always check with documents of the corresponding modules ([torch.nn.RNN](http://pytorch.org/docs/master/nn.html#torch.nn.RNN) and [torch.nn.Linear](http://pytorch.org/docs/master/nn.html#torch.nn.Linear)) to see if you get it right (don't do it for Part II though, as you will see later). 

By the way, we used [advanced indexing](https://docs.scipy.org/doc/numpy-1.13.0/reference/arrays.indexing.html#advanced-indexing) in the code above. If you are not familiar with it, it might worth to spend some time to follow the link and figure out.

### Implement in Modules

After you understand how to think of neural network layers as tensor processors, you are ready to learn how to implement "tensor processors" in PyTorch. Very roughly, the way PyTorch programs are organized is that all the layers need to be a sub-class of `torch.nn.Module`. Two methods needs to be implemented in order to extend this class: the constructor that initialize all the parameters and sub-modules, and the `forward` function that performs the forward computation. There is no need to define a `backward` function, as long as the input, the output and all intermediate buffers you create within `forward` function (presumably torch tensors) are wrapped as `torch.autograd.Variable`, which will keep track of all the computations that's been done on the tensor and trigger gradient computation when the `backward` call is made.

For more details on how to work with modules, the official PyTorch tutorial website has a easy-to-follow [writeup](http://pytorch.org/tutorials/beginner/pytorch_with_examples.html#).

### Compute in Batches

In the above explanations we have hidden one important implementation trick to make it easier for you to understand, now it's time to reveal it to you.

Most, if not all deep learning frameworks have done pretty aggressive optimization with tensor operations, including exploiting possible parallelism of the hardware (both for CPU and GPU) to speed up computation. To take full advantage of this fact, it is desirable to perform operations on larger scale tensors. Hence, it is a common practice to group smaller tensors that share same operations into larger ones. This process of grouping is called batching. Mathematically, batching will also make gradient updates more stable, because of the lower variance resulted from averaging gradient over various training instances, but overall people perform batching to write faster deep learning code. 

Unfortunately, batching will make code slightly more complicated. Let's take the embedding example again, but this time, our query is of size `(sequence_length, batch_size)`.

```
>>> import torch
>>> vocab_size = 5
>>> embedding_size = 10
>>> X = torch.randn(vocab_size, embedding_size)  # random word embedding
>>> X

 0.5883 -1.3217 -0.5142 -0.5934 -0.4687 -2.2186 -1.9876  0.4508  0.3883  0.3241
-0.8598 -0.2357 -0.0703 -1.1962 -0.7464  0.3632 -1.1609  0.8448 -0.7326  2.4659
-2.1067 -2.1339 -1.9302 -0.5674 -0.6261  0.7696 -1.0888 -0.5124 -1.0489 -0.1636
-0.1572  0.2262 -1.4140  1.2446 -1.2651 -1.5595  0.5617  1.0791 -1.4255 -1.3502
-0.7687  2.0456 -0.7290  1.3525  1.9921 -1.5313 -0.3329  0.6492 -0.9950 -1.0017
[torch.FloatTensor of size 5x10]

>>> sequence_length = 3
>>> batch_size = 2
>>> word_idx = torch.LongTensor([[0, 3], [1, 3], [2, 3]])  # (sequence_length, batch_size)
>>> embedding_query = X[word_idx, :]
>>> embedding_query.size()
torch.Size([3, 2, 10])
>>> embedding_query[:, 0, :]

 0.5883 -1.3217 -0.5142 -0.5934 -0.4687 -2.2186 -1.9876  0.4508  0.3883  0.3241
-0.8598 -0.2357 -0.0703 -1.1962 -0.7464  0.3632 -1.1609  0.8448 -0.7326  2.4659
-2.1067 -2.1339 -1.9302 -0.5674 -0.6261  0.7696 -1.0888 -0.5124 -1.0489 -0.1636
[torch.FloatTensor of size 3x10]

>>> embedding_query[:, 1, :]

-0.1572  0.2262 -1.4140  1.2446 -1.2651 -1.5595  0.5617  1.0791 -1.4255 -1.3502
-0.1572  0.2262 -1.4140  1.2446 -1.2651 -1.5595  0.5617  1.0791 -1.4255 -1.3502
-0.1572  0.2262 -1.4140  1.2446 -1.2651 -1.5595  0.5617  1.0791 -1.4255 -1.3502
[torch.FloatTensor of size 3x10]
```

Note that this time the returned result is of size `(sequence_length, batch_size, embedding_size)` instead, with each "slice" in the batched query result corresponding to one column of the query. Essentially, we are performing the same operations as in the example before, but we batched the queries such that the amount of operation that can be performed with two function calls be done in one, enabling the deep learning framework to exploit more parallelism during computation whenever possible.

Again, as a practice, figure out yourself how would batch work for the other two layers. Note that we have placed the batch dimension as the second dimension (following the convention used in PyTorch modules), but you are free to implement whatever you feel most comfortable with.

You don't have to worry about how to make batched data -- the starter code has already taken care of this for you. You only need to consider how to make your module capable of processing batched data.

### Deliverables

+ **1.1 (Code)** Implement a uni-directional RNN language model (`RNNLM`) in `models.py` that scans the sentence from left to right. Your implementation should be able to take word index input of size `(sequence_length, batch_size)` and output `(sequence_length, batch_size, vocab_size)` representing probability distribution for each word input. Note that your implementation should be able to deal with arbitrary batch size. **You are not allowed to use anything in `torch.nn` packge other than `torch.nn.Modules`**.
+ **1.2 (Writeup)** After you finished your implementation, run the training script to check your implementation. The program prints negative log probability on dev set after each epoch. As a sanity check, your negative log probability on dev set should reach around 5.60 after first epoch (~5 minutes on my laptop CPU) with the following command:

```
python train.py --data_file hw4_data --optimizer Adam -lr 1e-2 --batch_size 48
```

with word embedding size 32 and hidden dimension 16 and a trainable start state. Report your **converged** dev negative log probability at this setting. If you are curious, try a few other hyperparameter combinations and report result as well.

Part II: Bi-directional RNN Language Model
---------------

### The Model

Recall a uni-directional RNN Language model outputs the $$p(w_i\mid w_1, w_2, \ldots, w_{i-1})$$ in the log space. However, for some tasks we would like to take advantage of both the preceding context and the following context to be able to predict a word (as in machine translation). Hence, people designed bi-directional RNN language model to solve the problem, where it outputs $$p(w_i\mid w_1, w_2, \ldots, w_{i-1}, w_{i+1}, \ldots, w_n)$$ instead.

The way to model this probability distribution is to have two RNNs in the same network. One scanning sentence from left to right, the other from right to left. After scanning is completed for both RNNs, the respective hidden states for each token step are concatenated and passed onto the final output layer. So now, the concatenated hidden state for each token has both the forward (preceding) context and the backward (following) context. In summary, here is the new model architecture.

+ The word embedding layer, which is simply a lookup table that stores the vector representation for each word type in the training data, including the special token "<unk>" reserved for unknown words. The vector representations should be queried by word indexes.
+ Two simple recurrent layers, scans one token in the left-to-right order and right-to-left order at each timestep, respectively, and then computes the hidden state of each timestep.
+ The concatenation layer, which concatenates the hidden state corresponding to the same input tokens.
+ The output layer, which first performs an linear transformation on the concatenated hidden states into a vector that has the same size as the full vocabulary, and then applies [softmax function](https://en.wikipedia.org/wiki/Softmax_function) over this vector, and then a element-wise log. The resulting vector is the output of this network.

**Hint on RNN Layers**: be careful how you align the output hidden states for the two directions -- note that as the probability model above indicates, your hidden state for a timestep should not see the corresponding word you are trying to predict. As sanity checks: (1) if you are getting negative log likelihood below 1.0, you are doing it wrong. (2) if you implement it in the same way as [torch.nn.RNN](http://pytorch.org/docs/master/nn.html#torch.nn.RNN), you are doing it wrong. 

However, the case is different in neural machine translation implementation, where the implementation schema in `torch.nn.RNN` is correct. Try to understand why it is different (not required in the writeup).

### Deliverables

+ **2.1 (Code)** Implement a bi-directional RNN language model (`BiRNNLM`) in `models.py` that scans the sentence in both ways. Your implementation should be able to take word index input of size `(sequence_length, batch_size)` and output `(sequence_length, batch_size, vocab_size)` representing probability distribution for each word input. Note that your implementation should be able to deal with arbitrary batch size. **You are not allowed to use anything in `torch.nn` packge other than `torch.nn.Modules`**.
+ **2.2 (Writeup)** Check your implementation using the same setup as in deliverable 1.2 (the only caveat is that to maintain the same number of parameters for fair comparison, your hidden dimension for each RNN direction should be 8). You should be able to reach negative log probability of around 4.85 on dev set after first epoch. Again report your **converged** dev negative log probability at this setting. If you are curious, try a few other hyperparameter combinations and report result as well.

PART III: Multi-word Cloze
---------------

### The Setup

The special thing about multi-word cloze as opposite to single word cloze is that your language model context may be incomplete. To make your life simpler, you will start with a hacky solution where we pass a reserved token `<blank>` to represent blanks in cloze task, which already exists in the dictionary created by the preprocessing script. The word embedding for this reserved token is randomly initialized and not updated during training because you have not seen blanks in training data. With this hack, you can predict words that should go in each blanks by naïvely using the bi-directional rnn language model you implemented in the previous part. Implementing this should be sufficient for you to beat the baseline on the leaderboard and earn a passing grade.

To earn full credit for the homework, you need to implement at least one more improvements over the baseline model. Here are a few ideas:

+ Implement LSTM or GRU. [This blog post](http://colah.github.io/posts/2015-08-Understanding-LSTMs/) would be a great starting point for you to understand them.
+ Implement dropout. Read [the original paper](https://www.cs.toronto.edu/~hinton/absps/JMLRdropout.pdf) or [this blogpost](http://iamtrask.github.io/2015/07/28/dropout/) to find out what it is. Note you have to do it differently for training and evaluation.
+ Implement [CNN language model that does even better than LSTM](http://proceedings.mlr.press/v70/dauphin17a/dauphin17a.pdf).
+ Representing `<blank>` with a random embedding is not a great solution. Can you come up with a better one? 
+ Solving this task with language model may not be the best strategy at the first place. You can come up with novel network structure of your own!

Cloze has very clear pedagogical motivation in language learning, but to the best of our knowledge, it is not a task with rich NLP/ML literature, so any improvement you achieve on the task may advance the state-of-the-art!

### Deliverables

+ **3.1 (Code)** Write a script to load your bi-directional RNN language model and do the multi-word cloze task. Because batching is not a must for decoding step (due to small data scale) and no optimization is happening during decoding, you should be able to proceed without a starter code. Your input data has already been converted into binary format for you by `preprocess.py` (the test set). Your output should have filled words for each sentence in the corresponding line, with the words in the same sentence segmented by a single space (as the example in the beginning). Submit the output to the [leaderboard submission site](http://jhumt2017leaderboard.appspot.com). You should be able to beat the baseline in terms of model performance.
+ **3.2 (Code & Writeup)** Implement an improvement model and describe it in your writeup. Note that for this part you *can* use things in `torch.nn` package **except** for all recurrent and dropout layers. Submit your improved output to the [leaderboard submission site](http://jhumt2017leaderboard.appspot.com).

Part IV: GPU
---------------

We designed the whole homework with the intention that you should be able to train everything on CPU, but your knowledge of deep learning frameworks won't be complete if you cannot run your code on GPU. We have included starter code for you to run your experiments on GPU. It should cover most of the implementations, but you may still need to manually convert the type of the tensor to their cuda counterpart if you created them outside your module constructor. As it's generally not very hard to port PyTorch code from CPU to GPU, we'll leave up to you to figure out the details. [Here](http://pytorch.org/docs/master/notes/cuda.html) and [here](http://pytorch.org/tutorials/beginner/former_torchies/tensor_tutorial.html#cuda-tensors) are some relevant resources in the PyTorch documents.

You can test your code on GPU with Google Cloud. Check out the [cloud guide](http://mt-class.org/jhu/cloud.html). Again, keep in mind that you have only 60 hours of GPU time and you need most of it for the next homework, so please use it wisely. **Remember to delete your instance -- you'll still be billed if you only stop it.**

### Deliverables

+ **4.1 (Writeup)** Describe how much speedup you got on GPU compared to CPU. You can also try several different batch size to see how batch size influence the speed. You may only measure the time for one epoch through the data to minimize GPU usage.

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
  1. Your answer for all the cloze blanks, uploaded to the [leaderboard submission site](http://jhumt2017leaderboard.appspot.com/leaderboard.html). You can upload new output as often as you like, up until the assignment deadline. 

  1. Your code. Send us a URL from which we can get the code and git revision
     history (a link to a tarball will suffice, but you're free to send us a 
     github link if you don't mind making your code public). This is due at the
     deadline: when you upload your final answer, send us the code.
     You are free to extend the code we provide or roll your own in whatever
     langugage you like, but the code should be self-contained, 
     self-documenting, and easy to use. 
  1. A clear, mathematical answer for each bullet point with writeup requirements.
     This needn't be long, but it should be clear enough that one of your fellow students could re-implement it 
     exactly. If you modified your algorithm or have more than 1 algorithm, explain each modification/algorithm clearly. Give the dev scores for each modification/algorithm, and the test score for your final choice.
*  You do not need any other data than what we provide. You can
   free to use any code or software you like, but you must write
   your own RNN modules. If you want to use finite-state
   libraries, solvers for traveling salesman problems, or
   integer linear programming toolkits, that is fine. 
   But any module or program that already implement recurrent
   network units for you are off-limit.
   If you aren't sure whether something is permitted, 
   ask us. If you want to do system combination, join forces with 
   your classmates.
*  The deadline for the leaderboard is 11-02-2017 at 11:59pm.

*Credits: This assignment was mostly developed by [Shuoyang Ding](http://sding.org/). [Adi Renduchintala](https://arendu.github.io) contributed the idea of multi-word cloze and helped extensively with testing this homework.*
