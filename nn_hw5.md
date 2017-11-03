---
layout: default
img: cover
img_link: http://www.statmt.org/book/
title: Homework 4 | Multi-word Cloze
active_tab: homework
---

<span class="text-muted">Homework 5:</span> Neural Machine Translation
=============================================================

Due: November 17th, 2017

Imagine it's 2022 and you are training a German-English neural machine translation (NMT) system. Suddenly, a nuclear bomb is detonated in Los Angeles and caused a massive [blackout](https://en.wikipedia.org/wiki/Blade_Runner_Black_Out_2022). As a result, all the neural machine translation codebase in the world is destroyed. Fortunately, you placed your data and the most recent model dump in [this Google drive folder](https://drive.google.com/drive/folders/1FBynY6BiNeRceMqLlvP9jyF27KFt1xh8?usp=sharing), which is preserved during the blackout.

**Your challenge is to build a neural machine translation system with the best possible translation quality with these resources.** To save your computation resource usage, you can start training by loading the preserved model dump. Because this model is not trained until convergence, you can definitely improve over this model by running a few more training iterations (which is normally called "continued training") and beat the baseline. (To give you an idea of how large the data is, it'll take about 10 hours to run the full training on one Tesla K80 GPU of Google Cloud Platform. The model dump you have has been trained for about 6 hours.)

However, to be able to run continued training, you need to restore the NMT codebase by implementing your own neural machine translation model. The model we are looking for you to implement is a attention-based neural machine translation model, which is described by [(Bahdanau et al. 2015)](https://arxiv.org/pdf/1409.0473.pdf) and [(Luong et al. 2015)](https://arxiv.org/pdf/1508.04025.pdf) as well as [(Koehn 2017)](http://mt-class.org/jhu/assets/nmt-book.pdf). You will then run contineud training starting with your model dump and test your final model by translating the test set and submit the translation to the [leaderboard submission site](http://jhumt2017leaderboard.appspot.com). To make your life easier, you don't have to implement beam search to beat the baseline model. After that, you may earn full credit by implementing at least one more improvement over the baseline attention-based neural machine translation model. Here are several ideas:

+ Implement one of the [deep architectures](https://arxiv.org/pdf/1707.07631.pdf). We don't expect you to do much, as it'll take enormous time and resource to train a lot of deep models. For example, if you can train a two-level stacked encoder, that'll count as your improvement.
+ Implement ensemble of multiple models, as introduced in page 41 of this [slide](http://www.statmt.org/eacl2017/practical-nmt.pdf).
+ Adding a [coverage model](http://www.aclweb.org/anthology/P16-1008) as what we had in SMT decoding.
+ Play with one of the character-based models, like [this one](https://arxiv.org/pdf/1610.03017.pdf) or [this one](https://arxiv.org/pdf/1511.04586.pdf).
+ Implement beam search. You may also experiment with multiple [beam search strategies](http://www.aclweb.org/anthology/W/W17/W17-3207.pdf).

Neural machine translation is a very active resesarch field in recent years and there are new ideas popping up every day, so be creative and don't be constrained by the list above! If your idea does not fit into the two-week homework span, you can consider making this your [final project](http://mt-class.org/jhu/project.html). Note that some of these ideas may require you to train part or all the model from scratch, so it may take longer than the original continued training. 

Setup
--------------

Pull or check out the [starter code](https://github.com/shuoyangd/en600.468). Download the necessary data files from [here](https://drive.google.com/drive/folders/1FBynY6BiNeRceMqLlvP9jyF27KFt1xh8?usp=sharing).

As you have seen in homework 4, you need to preprocess the training data into a list of word indexes. The only difference for this homework is that you need to do this respectively for German and English.

```
python preprocess.py --train_file trn.de --dev_file dev.de --test_file devtest.de --vocab_file model.src.vocab --data_file hw5.de
python preprocess.py --train_file trn.en --dev_file dev.en --test_file devtest.en --vocab_file model.trg.vocab --data_file hw5.en
```

The format of the data is the same as the last homework. The data dump on each side of the parallel corpus contains a tuple `(train_data, dev_data, test_data, vocab)`, each data being a list of torch tensors of size (sent_len,), while the vocabulary is an instance of `torchtext.vocab.Vocab`. 

A starter code (`train.py`) has been provided for you, which is also pretty similar from what you have seen in the last homework.

Parameter File Format
--------------

The file `model.param` is a Python dictionary that contains the model dump that's been trained for 7 epochs on the data provided to you. Although the keys should be self-explanatory, here is a brief description of what they are:

#### word embeddings
+ `encoder.embeddings.emb_luts.0.weight` torch.Size([src_vocab_size, src_word_emb_size] = [36616, 300]): the source word embedding
+ `decoder.embeddings.emb_luts.0.weight` torch.Size([trg_vocab_size, trg_word_emb_size] = [23262, 300]): the target word embedding

#### forward source encoding:
+ `encoder.rnn.weight_ih_l0` torch.Size([4 * encoder_hidden_size, src_word_emb_size] = [2048, 300]): the input connection to the gates of the LSTM, see [here](https://discuss.pytorch.org/t/lstm-gru-gate-weights/2807) for how the weights are arranged
+ `encoder.rnn.weight_hh_l0` torch.Size([4 * encoder_hidden_size, encoder_hidden_size] = [2048, 512]): the hidden connection to the gates of the LSTM, see [here](https://discuss.pytorch.org/t/lstm-gru-gate-weights/2807) for how the weights are arranged
+ `encoder.rnn.bias_ih_l0` torch.Size([4 * encoder_hidden_size] = [2048]): bias term for the input connections, same arrangement as above
+ `encoder.rnn.bias_hh_l0` torch.Size([4 * encoder_hidden_size] = [2048]): bias term for the hidden connections, same arrangement as above

#### backward source encoding (same thing as above):
+ `encoder.rnn.weight_ih_l0_reverse` torch.Size([2048, 300])
+ `encoder.rnn.weight_hh_l0_reverse` torch.Size([2048, 512])
+ `encoder.rnn.bias_ih_l0_reverse` torch.Size([2048])
+ `encoder.rnn.bias_hh_l0_reverse` torch.Size([2048])

#### decoder
+ `decoder.rnn.layers.0.weight_ih` torch.Size([4 * decoder_hidden_size, trg_word_emb_size + 2 * encoder_hidden_size] = [4096, 1324])
+ `decoder.rnn.layers.0.weight_hh` torch.Size([4 * decoder_hidden_size, decoder_hidden_size] = [4096, 1024])
+ `decoder.rnn.layers.0.bias_ih` torch.Size([4 * decoder_hidden_size] = [4096])
+ `decoder.rnn.layers.0.bias_hh` torch.Size([4 * decoder_hidden_size] = [4096])

#### attention
The global general attention described in [(Luong et al. 2015)](https://arxiv.org/pdf/1508.04025.pdf) was used in the model. Consult [here](https://github.com/shuoyangd/OpenNMT-py/blob/en600.468/onmt/modules/GlobalAttention.py) for how the attention should exactly implemented.

+ `decoder.attn.linear_in.weight` torch.Size([1024, 1024])
+ `decoder.attn.linear_out.weight` torch.Size([1024, 2048])

Cloud Guide (2017)
--------------

To avoid further nuclear attacks, your supervisor from LAPD has instructed you to use Google Cloud to run GPU training. Please read through [this note](http://mt-class.org/jhu/cloud.html) so you know how to use the Google Cloud GPU host.

Please keep in mind that you should use your GPU hours wisely since the $50 credit will only give you ~60 hours of GPU usage. **Always debug on CPU before running your program on GPU!**

Deep Learning Framework Choice Policy (2017)
---------------

We understand people may have different preferences for deep learning frameworks, but as new frameworks come out everyday, it is not possible for us as instructors and TAs to cover knowledge of all the frameworks. As of 2017, we will use [PyTorch](http://pytorch.org) for all the starter code and is only able to help if you are using PyTorch. PyTorch is quickly gaining popularity among NLP/MT/ML research community and is, from our perspective, relatively easy to pick up as a beginner.

If you prefer using another framework, we welcome contribution of your starter code (and you'll get credit as contributors in a homework that'll likely to be used in the coming years), but again, we are not able to help if you run into problems with the framework.

Your choice of framework will not affect the grade of your homework.

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
  1. Your translation of the whole test set, uploaded to the [leaderboard submission site](http://jhumt2017leaderboard.appspot.com/leaderboard.html). You can upload new output as often as you like, up until the assignment deadline. 

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
*  As most of the storage media is destroyed during blackout, you shouldn't access any other data than what we provide.
   You are free to use any code or software you like, but you must write your own NMT model.
   If you want to use POS tagger, parser, or word embedding builders, that is fine. 
   But any module or program that already implement NMT models for you are off-limit.
   If you aren't sure whether something is permitted, ask us.
   If you want to do system combination, join forces with your classmates.
*  The deadline for the leaderboard is 11-17-2017 at 11:59pm.


*Credits: This assignment was developed by [Shuoyang Ding](http://sding.org/). The idea of blackout was borrowed from the anime short [Blade Runner: Blackout 2022](https://www.youtube.com/watch?v=rrZk9sSgRyQ). 
