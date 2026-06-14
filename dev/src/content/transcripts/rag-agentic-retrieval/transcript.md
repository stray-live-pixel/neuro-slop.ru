I see it's a full room, so I appreciate everyone coming out.
So welcome to the talk about RAG is dead, right?
So my name is Kuba.
I'm a deployed engineer at TurboPuffer.
So for those that don't know what TurboPuffer is, we are a full-text search and vector
search database built from first principles on top of object storage.
If you would love to learn more, just come find me after the talk if you have
any questions.
So let's get started.
So this talk is about how RAG is dead, how tool-rich retrieval is becoming a default for
serious agentic search.
So if you guys have been on Twitter or other social media platforms, or I guess X they
call it now, you might have seen a lot of tweets like this about how RAG is dead.
You can see there's lots of tweets, especially in the end of 2025 and in the
early of this year about how RAG is dead, agentic file search is all we need, and
there's a lot of content about this now.
But interestingly, if you're to look at something like the Google search volume over
the last couple of years, you can see that in 2023, as AI starts, we have this increase,
caps out a little bit in 2024, settles down for about a year, and about midway
through 2025, we hit this new inflection point where search volume just goes through
the roof.
So take that, Twitter.
So let's clarify first.
What is RAG and what is agentic search?
These are kind of two terms a lot of people are throwing out these days.
So RAG, what a lot of people think RAG is is just simple vector search.
They just think that this is just simply embedding a bunch of your corpus of
content, passing an embedding vector, and getting it back, passing it
through your LLM.
And at TurboPuffer, what we think this actually means, if you break down
RAG into retrieval, augmented generation.
Retrieval is not just vector search.
It's a lot of different things.
It could be vector search, full-text search using stuff like BM25, grepping,
globbing, using RedX, using other just basic filters, and the augmented
generation is obviously just passing it into your LLM of choice.
And then agentic search.
This is kind of the terms people are throwing out a lot these days.
And generally, when people start talking about agentic search, what they
usually talk about is essentially just file system grep.
So if you guys are familiar with something like Cloud Code, or Cloud
Code Codex, a lot of people call this agentic search.
And this just essentially is grepping through your file system.
And this is why these terms are so correlated.
And what we actually believe it is and the definition we want to give
it is it's really giving the agents a set of tools to progressively
and iteratively find and reason over context.
So with Cloud Code, if you guys are familiar with it, it can read your
file, start grepping through your file system, read a file, decide that it
hasn't found what it needed to actually complete the task, and it will find
something again.
And then keep doing this until it's reached a happy state where it can
continue on with the task.
So we're going to take a step back and talk about one of the companies
that use TurboPuffer that we believe is doing an excellent job
with agentic search.
This is a company called Cursor.
You might have heard of them.
Fun fact, they're actually one of TurboPuffer's very first customers.
And they have this excellent blog post that came out in the beginning
of 2026 about how they index code bases.
So for those unaware, when you open up a new code base or a new branch
in Cursor, what happens is that Cursor will start embedding your code base.
So what they'll do is chunk out your parse, chunk and embed your code
base, and make it available for semantic search.
And this blog post goes into an excellent technical detail of how they
do this.
Just to give you the gist, essentially the cool thing they do is that they
found that most people working on a team, let's say there's 100 engineers,
when they open up code bases, they're normally the same code base
99% of the time because you have a team of 100 people most of the time
working on one, two, maybe a few code bases.
And it's really expensive to have to re-chunk, re-embed,
and re-upload these code bases every single time.
So they essentially use like Merkle trees,
which essentially is this crypto hash tree,
to calculate similarities between code bases people open on the same team.
And if they're similar enough, they will essentially copy over the data
and then only update and re-chunk and re-embed
the files that have changed and use TurboPuffer in order
to make sure this is done securely.
And yeah, just excellent blog posts.
They do some really cool stuff.
And you may think, this is a lot of work.
Why do they do this?
Well, the reason they do this is also covered in a different blog post
about how they use semantic search.
Again, they use TurboPuffer for this.
And what they find is, on average, across models,
I think it's like a 12.5% or 13.5% increase in answer accuracy.
This is across their internal cursor context benchmark.
So not a public benchmark, but you can trust the numbers they give us.
And you can see on the right side, their composer model,
this is before Composer 2, they had almost a 24% increase in answer accuracy.
So giving semantic search to these models really
can drive real performance gains.
And you can see on the bottom right, this
is from an online A-B test they did,
which is also covered in their blog post,
about how it's almost like a 2.6% code retention in large code bases.
And there was a 2.2% decrease in dissatisfied user requests.
And you might be thinking, oh, well, these numbers aren't that big,
like 2.6%, 2.2%, not that large.
But they also cover that semantic search isn't
used in every single query.
So in their online A-B test, if you give these tools to 100 random
queries, not every 100 query will actually
benefit from the existence of a semantic search tool.
So that's why these numbers look kind of small.
And now let's talk a little bit about Cloud Code.
So Cloud Code doesn't use vector search,
as covered by the suite from Boris Cherny.
So those unfamiliar with Boris, he's essentially
the founding father of Cloud Code.
And he says that in early iterations of Cloud Code,
they actually did use RAG in a local vector DB,
but they found that it just didn't really work out for them.
But this is something that is important to understand.
It's something we've kind of taken on a lot internally,
understanding here at TurboPuffer,
is this idea that embeddings and semantic search
are kind of cache compute.
And you may be thinking, cache compute,
like kind of throwing out a lot of terms at me right now.
I don't know exactly what that means.
And I think it's best to walk through an example
of essentially almost a Cloud Code-looking trace
and a cursor-looking trace of how these agents would
understand your code base.
So on the left is kind of a per-session discovery
of Cloud Code.
So for example, if we were to ask the agent to understand
how metadata filtering works, what it would have to do
is grep, read, assess, and repeat,
and try to find the files it needs in order
to gain this understanding on a per-session basis.
So what this means is you could have 10 agents
on 10 different days across 10 developers,
and they can be asking the same question multiple times
every day.
Every time, the agent's going to have to kind of repeat
the exact steps to gain the same understanding
of this code base.
And this could cost quite a few tokens.
6,000 doesn't seem like a lot here,
but just remember this is like one sub-step of an agent.
And then on the right is kind of a more cursor-looking
trace, where there's this upfront cost of indexing,
but then we're able to allow for this lightweight tool
to help the agent kind of retrieve
this information at runtime.
So obviously, there's this upfront cost of parsing
the code base, embedding it, and making it available.
But this is like a one-time cost.
And then at runtime, the agent can just
query something like, how is metadata filtered?
It can get some simple results,
and it would save a lot of tokens, a lot of time,
and just a lot of money.
And this just helps the agent to become a lot faster.
A lot of people on the team now
that maybe were big cloud code users here at TurboPuffer,
they've actually started switching to Cursor
just because of how fast it's becoming,
especially with their Composer 2 models
and also the semantic understanding.
It's just become what we're finding really, really good.
So from RAG to agent retrieval.
So what we're finding now is that a lot of people
are no longer doing the simple RAG, the Twitter, quote,
unquote, RAG, of just doing a vector search once
and throwing it into the context windows.
What we're finding is that this worked back in 2023,
early 2024, kind of the beginnings of AI.
But a lot of the more sophisticated customers
are doing agentic search, and it's
giving real, real big performance gains
and kind of unlocking new products.
And what we're finding is they're doing a ton of calls.
These agents are reasoning through several steps.
They're searching semantically or through full text,
et cetera, as needed.
And they're only fetching what's
needed for that specific use case.
But the important thing to know is that retrieval
is no longer just this simple one-time call to vector DB.
It's becoming super iterative, and these agents
are really understanding what they're searching
and searching to understand more, in a sense.
And it's kind of like an interesting loop.
Google's Jeff Dean, he went on a show or podcast,
whatever, and he had this really good quote
that we like to use that we also
thought was super interesting.
He was talking a little bit, I believe,
about how Gemini's models were kind of having
these really big context windows.
And I forget the exact question the host asked them.
But he was saying, big context windows,
it doesn't matter if you get to a trillion context window
size, what you really need is stage retrieval,
like a lightweight mechanism to narrow down
these trillion tokens into essentially millions
at a time.
And the exact quote is, you
don't need a trillion at once,
you need the right million.
This is something we think a lot about here at Total Puffer.
We have customers that embed, have trillions of tokens
inside Total Puffer.
And as we see, the really important part
is just getting down to this right 100,000, right 10,000,
right million in order to pass into these context windows.
That's about it for a talk.
If you have any questions about any specifics,
I'd love to either have them asked now,
or you can find me after the talk.
I would appreciate you guys coming out.
