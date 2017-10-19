---
layout: default
img: rosetta
img_url: http://www.flickr.com/photos/calotype46/6683293633/
caption: Rosetta stone (credit&#59; calotype46)
title: Google Cloud Guide 
active_tab: homework
---

<span class="text-muted">Google Cloud Guide
=============================================================

We assume you have registered an account at [Google Cloud](cloud.google.com) and claimed your [coupon](https://piazza.com/class/j76xui0plyx2my?cid=6). If you haven't do so yet, please do it now.

This google cloud guide will guide you through the process of creating a remote GPU host and run experiment on that.

## Delete Your Instance When You Are Done!

### Enter Google Cloud Console 
+ Once you logged in your google account, if you are on [Google Cloud homepage](cloud.google.com), click on `console`.

### Create Project
+ click on the drop-down menu on the right side of "Google Cloud Platform" logo
+ click on '+' to create new project.

> If you have multiple projects, make sure you are on the right project when you logged out and come back.

### Install `gcloud` API

Google Cloud API enables you to ssh to Google Cloud machines like you ssh to any other shared hosts.

+ Follow the instruction [here](https://cloud.google.com/sdk/downloads) to install `gcloud` API on your local machine
+ Open up terminal and type `gcloud init`
+ Follow the instruction to log into your Google account
+ Follow the instruction to select the project you just created
+ Pick a zone that has GPU, `us-east1-c` and `us-east1-d` all seem good choice

### Increase GPU Quota

By default our GPU quota is 0. You need to go through the process of manually increase the GPU quota to be able to use GPU.

+ Open the main menu (the Android-style bars on the left of "Google Cloud Platform" logo) -> IAM & admin -> Quotas
+ Metric -> NVidia K80 GPUs
+ Select a Region, preferably US-east1
+ On the top, "Edit Quotas"
+ Follow the instructions on the right, request 1 K80 GPU
+ Make sure you submit the request
+ Wait for several minutes for manual approval. They are pretty responsive (5-10 minutes) from my experience.

### Create GPU Instance
+ Go to project console
+ Main menu -> Compute Engine -> Images
+ Click on "create image"
+ Toggle "source" into "Cloud Storage file"
+ Select "cs468_instance_image/cs468_cuda_pytorch.tar.gz" for cloud storage file
+ Create image. This may take ~15 minutes.
+ Select the newly created image to create instance.
+ Pick a zone that has GPU, `us-east1-c` and `us-east1-d` all seem good choice, and seems like they don't have to match what you selected when you initialize `gcloud`.
+ Request 1 vCPU, 12GB memory (you need to toggle on "Extend memory")
+ Allow HTTP and HTTPS traffic, if you want to use Github
+ Scroll down, hit create
+ Wait
+ "SSH" -> View `gcloud`command
+ Run the command on local machine, this should act like `ssh`.
+ Once you get on the machine, run `nvidia-smi` to check if you have access to GPU. If you see the following, you are good to go:

```
Thu Oct 12 02:32:08 2017
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 384.81                 Driver Version: 384.81                    |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  Tesla K80           Off  | 00000000:00:04.0 Off |                    0 |
| N/A   32C    P8    29W / 149W |     16MiB / 11439MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                       GPU Memory |
|  GPU       PID   Type   Process name                             Usage      |
|=============================================================================|
|    0      2012      G   /usr/lib/xorg/Xorg                            15MiB |
+-----------------------------------------------------------------------------+
```

+ By default this environment runs Python 2.7.12, if you want Python 3, I have a virtual environment for you -- just run `source py3env/bin/activate`. Both Python environment has PyTorch installed already.

### Storage

It might be a bit of a hassle to transmit data back and forth between the Google Cloud host and your local machine since you won't be able to use `scp` directly. There are two solutions:

+ Have your code on some Git repository. Manage all your changes via that repository.
+ Create a bucket and use the bucket.
  * You can create a bucket from Google Cloud Platform main menu (Android-style bars) -> Storage.
  * Once you created the bucket, you can transmit data following instructions [here](https://cloud.google.com/storage/docs/quickstart-gsutil#create).

### Instance Deletion

You can see all your instances from Main menu -> Compute Engine -> VM Instances. When you are done with your instance, make sure you **Delete** INSTEAD OF stop your instance. You'll still end up being billed for that and since the instances we use are pretty expensive, the bill could add up pretty quickly.

## Delete Your Instance When You Are Done!
