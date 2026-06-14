My name is Max, I am VP of Research and Development at Together AI, and today I'm going to tell
you about our research project which is called Road to 5 million sequence length, breaking
memory barriers in context parallelism.
So to begin, I'll first say a few words about Together AI and who we are.
Together AI is an AI native cloud which provides services and infrastructure for AI developers
and builders at all stages of development, starting from creating a model where you just
might need a GPU cluster with heavily optimized computes and highly reliable systems, all
the way through model shaping where you can take existing models and customize them
for your tasks, in terms of performance, in terms of speed, in terms of quality, through
services such as the Funtunyook or reinforcement learning.
Also we are an inference provider, so if you have an app which is reliant on open
source model inference, you can work with us and we'll provide you with the fastest
way to launch and use AI models with more than 200 models in our portfolio, options
for deployment which include serverless and dedicated inference, and a ton of advanced
optimizations which I will not be able to speak about today.
The purpose of this talk is focused on model training, customization, and Funtuny
in particular.
I'll start by asking a question.
I think in the last few months, or at least a year or so, we're seeing a lot of interest
in the community, both on the system side and on the research side, in training long
context models.
The primary reasons for that are twofold, I would say.
First of all, with the explosion in popularity of agents, you can see a lot of different
applications where you might want to put as many tokens as you want in your context and
you want the model to leverage that context effectively.
Second, with the development of applications such as video generation, you might often
need to keep track of multiple different frames or even multiple frames per second
which can occupy quite a few tokens in your context pretty quickly.
And you also need models that have good sense of temporal consistency, which means
that they are able to see what was happening a few seconds or ideally a few minutes ago.
To do that all effectively, you need to make sure that the models are able to process
that context and work with it correctly at the training time.
But even if you're not at the scales of millions of tokens in the context length,
it's still quite important to understand where the memory goes because who knows,
maybe you might be able to reinvest it in some other ways and speed up your
training overall.
So the problem here is that if you are taking a standard transformer-based language
model and trying to extend its context, you can run into two bottlenecks.
Bottle neck number one is that you are faced with quadratic computation because,
long story short, for transformer-based models you have pairwise interactions
across all the elements in a sequence.
The second problem is more insidious, one might say.
As you continue scaling your context, your memory keeps growing linearly,
which is not as bad, but still pretty difficult to deal with,
unless you apply a range of specific techniques.
And this is an example from Hugging Face's blog post on model training,
which shows that the sequence length growth can affect your memory limits
pretty considerably.
Yeah, here's the slide.
And our goal of that project was to see how far exactly we are able to get
with a range of existing techniques that are pretty well known to some in the
community, as well as some further optimizations that we wanted to leverage
to push this a bit further ahead.
So let's say you're taking a model which is a standard LAMO3B architecture,
you're trying to fit three million training tokens into your context,
and you're taking all of this on an 8100 GPU node.
The first stage you'll see is that even with just the model parameters,
you're not able to fit it into the GPU.
You run out of memory just by trying to place the model.
Of course, the next stage is to apply Fully Chartered Data Parallelism,
where all the parameters are basically chunked across the 8 GPUs that you have,
which is great, but still doesn't solve the problem.
You see that the memory usage for the model drops quite significantly,
but you still are running out of memory because of all the attention activations.
The next point that we've leveraged, and I encourage you to use as well,
is taking advantage of context parallelism.
In particular, there is a pretty well-known technique called DeepSpeed
Ulysses, first introduced by Microsoft.
The idea is that instead of computing all of your multi-head attention
on every GPU separately for the whole sequence,
you can do something more clever.
In particular, you can try to compute the attention for different heads
at different points in time or on different GPUs
through communicating these activations as they are required,
in such a way that one GPU is only responsible for one attention head here,
but it's still computing the attention over the whole sequence.
That technique is quite effective at addressing the problem,
and it also allows you to utilize the best possible attention
implementation, like flash attention 1, 2, 3, 4,
to optimize that part of the computation.
And then you aggregate the results, as you would have previously.
So if you apply Ulysses context parallelism,
the utilization drops quite significantly, like approximately 8x here,
as it should, but we are still quite far from our goal
of being able to fit that onto just a single H100 node.
So what happens next is that we can try to recompute the activations
as they are needed to us at the backward pass.
That technique is known as activation checkpointing,
and it's available in pretty much all of the deep learning frameworks
these days that you could use.
You just need to enable it in a correct way that does not
impose too much of a computational burden on you.
With that, with activation checkpointing,
you can drop the activation usage by a further factor of 8,
but still something else needs to be done.
The next optimization is also connected
to the storage of activations.
You can try to store some of the inputs to each transformer block,
not on the GPU, but instead, offload them to CPU
when they are not required.
This is not very impactful for the performance,
because you can offload it and prefetch
when you are trying to back propagate
to the corresponding layer.
This optimization, to the best of our knowledge,
was first implemented by onslaught,
and it allows you to drastically expand the context window.
The next point is that you're getting with offloading
next to 37 gigabytes of data,
but then comes the other part of out-of-memory usage.
What happens next is that you can essentially
tile all of the computations across the sequence length
in case they are element-wise.
So all the loss computations, all the MLPs,
they can be chunked to avoid creating these huge buffers
that would be 3 million along one of the dimensions.
That's Arctic Sequence Length training,
and even with these optimizations,
you're finally getting to a point where 3 million is possible.
But what if you wanted to go further?
And here we actually need to do something else,
which is the primary optimization
we've done in our work, dubbed Untitled Ulysses,
and you could describe it as a further,
deeper analysis and expansion
of this context parallelism technique.
So what we found was that even trying to compute
one set of heads at a time is already enough
to saturate the computational capacity of the GPU
within one iteration,
which means that if you have multiple different heads
scheduled to be executed on one GPU,
you can divide it in chunks
and then essentially iterate through these chunks over time.
So we have one group of heads which are being recomputed,
then you compute attention over them,
you store the partial result,
then you follow up with the next stage,
which can reuse all the buffers
you've allocated at the previous stage.
So the advantage here is that instead of allocating
this huge buffer, as you would have before,
like here in this slide, you allocate a buffer
which is smaller, but you reuse it across
like two or more different iterations.
And that allows you to further save
on the activation memory for your training
without any significant impact to the throughput
at smaller scales.
So here you can see the results that we've measured
across different context parallelism techniques.
As you can see, both at the 8 billion scale
and at the 32 billion scale,
we are matching quite closely
the most memory optimized implementations
of transformer training,
while being able to scale even further,
like 5 million tokens,
and sometimes even being more performant
at shorter constants.
The relation between the chunk size
or the number of heads you compute at the same time
and the throughput is quite straightforward.
So if your chunk is larger,
your memory utilization is higher,
but at the same time,
you can run the whole model a bit faster.
So by stacking all of these techniques together
and applying the pipe on top,
you can, for example, free up a bit of additional memory
in your training if you need it,
and reinvest it somewhere else,
for example, among the stages.
Or you could say that we're interested in training
across not 3 by 5 million context lengths.
And then you pipe is the technique that will save you,
by contrast to everything else.
So as a takeaway,
I think one of the things
that could be quite insightful here
is that training models with large context lengths
is a very interesting and challenging goal,
but the bottlenecks might appear
where you least expect.
So tooling like the PyTorch Profiler,
which we elaborate on a ton in our paper,
or other techniques can help you a lot,
and also check out our paper for more results.
All of that is public at the moment,
and we have an upcoming thread
which will illustrate the method in more depth.
Thank you very much for listening,
and now we are ready for questions.
Thank you.
So I'm really enjoying it from the middle,
so it'll be like some second context.
I'm just curious about the,
so the QKB, there was a quantization
of the parameters, is that correctly understood?
Not exactly, it was just the query key
and value matrices of the transformer layer.
So you multiply them here in the attention part,
which creates most of the complexity,
because all of the queries have to result
in all of these pairwise interactions with keys.
And the problem is that if you have a sequence
which is like three million in length,
it means that technically in the standard,
most vanilla way, you would have just allocated
that whole big tensor which has three million in,
which is three million in size along one of the axes.
And that's pretty significant, as you could imagine,
which means that you have to resort to
not just one technique, which is U-pipe,
but a range of other approaches to somehow
help you execute these computations
without running out of your memory.
So yeah, that's the key idea and the key challenge
of working with transformers at this scale.
Cool.
In that case, thank you very much for questions
and for listening.
I hope you enjoyed.
Thanks for watching.
If you did, please give it a thumbs up.
And if you did, please subscribe.
I'll see you next time.
Bye.
