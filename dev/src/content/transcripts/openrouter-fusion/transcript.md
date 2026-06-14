# Полная расшифровка

Hi, welcome to another video.

So if I were to say that a company has made a Fable competitor, which company would come to your mind? Maybe OpenAI, or DeepSeek, or ZAI, or Kimi, or something along those lines. But it is actually OpenRouter, and it is technically not even a model. It is their Fusion API. They say that it is the smartest compound model on the market.

They claim that Fusion achieves Fable-level intelligence at half the price, on their benchmark that they shared here. They show that Fable 5, before it was banned, scores about 66%. Whereas their Fusion models, like Cell Fusion of Opus 4.8, score higher. The Fusion of Opus 4.8 and GPT 5.5 scores even higher. And Opus 4.8, Gemini 3.1 Pro, and GPT 5.5 score even higher. And Fable 5 plus GPT 5.5 scores the highest on their bench.

The benchmark in question here is DracoBench, which was made by Perplexity for deep research tasks. So it is interesting to see here that they are running the model basically on just a deep research task benchmark, and claiming as if the model is just better in all places, which seems a bit misleading, because using multiple models for text is always better in my opinion. Code is a different ballgame altogether, but we'll see. So that is the basics.

Let's talk a bit about how it works. They say, and I quote, when you send a prompt to Fusion, we dispatch it to a panel of models in parallel, each with web search and web fetch enabled. A judge model reads every panel response and produces structured analysis, consensus points, contradictions, partial coverage, unique insights, blind spots. The calling model then writes the final answer grounded in that analysis.

So let's say that you send a prompt about, hey, what is the attention mechanism? Then the prompt is sent to the panel models, and then they all reply back with their individual responses, which are seen by a judge model, which then writes the answer. I mean, it is not anything novel, but hey, if it works, I'd be happy. The main thing here is that it all mostly works like a simple open AI API model, which is kind of cool, I guess.

Now, the reason that I think these kinds of blog posts are misleading is the fact that they claim that it's better than the performance of Fable, but they only share the benchmarks of a deep research benchmark, which is just a bad look. But now I have tested it, and let's have a look.

So let's start with the elevator simulator. The elevator simulator is kind of buggy, to be honest. I mean, it works, but it's not something that is better than maybe just Opus, or even GLM for that matter. So there's that.

Now, the next one is where I asked it to make me a contact lens case. And well, this one is kind of fine. It's not the best, as the proportions of the case are all over the place. But it is fine. I mean, you can easily get this with just Opus as well. So this is not anything unique either.

Then we have the 3JS folding table simulator. And well, this one is also kind of bad. The legs, when folded, overlap each other, which is not practical. And it's just not good at all.

The SVG of a panda eating a burger is kind of fine. Though it seems that this is just the generation from Gemini, because it looks like that. It's quite similar to Gemini Generations.

The bow and arrow simulator game is extremely bad. The targets are very weirdly stacked. And it just doesn't make much sense.

Then there's the math question, which it also fails. And I was unable to run the local model trainer, because no agent supports it well.

So this is mostly just BS and misleading marketing. This API is not good. It might be good for some tasks. But for the majority of tasks, this is just a bad model that costs more and may even give you worse results than just using one model. I don't know why a company of open router's stature is making such misleading marketing claims and talking as if a fusion model can solve and surpass fable, which is not the case in reality at all.

I really appreciate what they have done with fusion. But these claims are just extreme and too much. Even one line of this doesn't make any sense at all. So yeah, don't be fooled. This is not anything that can surpass fable or anything. You can't use it in an agent easily either, because it is not supported by most of them. And even if they do, the time it takes to answer is just too much, because it needs to use different models and then summarize them and use it. So it is not that great, costs a lot, takes a lot of time to respond, and is just not great to use.

I think the thing that made fable crazy was the fact that its raw coding capabilities were crazy. It wasn't even designed for things like deep research for which it is being compared here and being said that this model beats it. So yeah, this is not great. Anyone can make an agentic contraption that is customized to their needs and probably just outperform fable if they want. It was just that fable was out of the box, quite good with whatever task you used it for. It's like those GPT 3.5 projects that used to make the models perform well by asking the model in multiple turns to make the response better, which worked then, but now it is mostly just diminishing returns.

I think open router should stick with what they do best, which is model routing, and work to make it easier, faster, and stuff like that, rather than focusing on trying to become an AI model lab or research company at this point. That is about it overall. It's not so cool.

Anyway, let me know your thoughts in the comments. If you liked this video, consider donating through the super thanks option or becoming a member by clicking the join button. Also give this video a thumbs up and subscribe to my channel. I'll see you in the next one. Until then, bye.
