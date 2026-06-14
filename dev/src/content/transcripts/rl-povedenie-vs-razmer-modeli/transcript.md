The last presentation I have to give this conference, so I'm feeling already a little
bit of the euphoria of like, ah, it's all done.
I know we're at also closer to the end of the whole sequence, has it been, I mean,
I keep finding these conferences to be like some of the highest signal that I get,
like wherever I go, so generally people feel like they're getting what they came
for here.
I'm just curious because we're at Snorkel, we put in a sponsorship and we want to
know that people are getting what they want or they know they're going to come
back because we want to sponsor next time, we want to know people are happy
about it.
Did you guys see what you wanted to see?
Yeah?
Yeah, really good.
Brilliant, brilliant.
So now that it is 3.45, I'm going to go ahead and start the official
thing.
So my name is Coby Crawford.
I'm a developer advocate at Snorkel.
We call ourselves the Frontier AI Data Lab and what we're doing right now,
our main thing is starting from the research-backed work that Snorkel has
been doing since its inception, we've been working on a variety of things
about data quality and at this point now where we're focused is actually
providing data sets where we assure a certain level of quality.
We're very attentive to being very, very motivated about making sure that
data is high quality and part of how we get to high quality is we always
make sure to have sort of an expert in the loop as part of the process.
So we have expert contributors that we work with and we bring people in to
provide their expertise to make sure that the data that we generate is of
top quality and then for the top labs that want to use our data to
improve their models and get the hill climbing done in the right way,
that's what we do at Snorkel.
Because of that, you know, a lot of what goes on is still more research
and this is a talk that's talking about some of the work that we did that our
research team did and one of the keys in this research is that we're looking
at how the best quality data can be best applied and like where it is that
we need to be looking for where there are opportunities to get that done.
So in this particular case, talking about stop making models bigger,
I mean, it's a nice punchy title, of course, we don't really mean like
models shouldn't be large intrinsically, but the point broadly speaking is that
sometimes we find great wins to be had with the right data applied to the
right to the right problems statement.
And so this is something we're going to talk about a specific use case that
we that our research team discovered and and in partnership with the RLM
team, which is a research group with the part of UC Berkeley.
And so the UC Berkeley team over there, RLM, the agenda project,
their lab partnered with us on this particular work.
So the goals, as I said, is making a four billion parameter model outperform
a two hundred thirty five billion parameter model on a tool use tasks for
financial analysis.
So we'll start with the research objective and then we'll iterate through
talking about the approach that we that was used for this particular
process and then talk about the results and happy to report that we got
what we were looking for.
So so so good things to be had.
So a couple of quick level setting backgrounds of what we're talking about
here. First is that as we see enterprise use cases take on some greater
complexity, we have obviously we've got the massive explosion of what
people are doing in terms of personal assistance.
And as people are working in the context of enterprise, a lot of times
you still need a sort of a more constrained choice about how to
implement something and make sure that it's reliable and like when
you're looking for things that are going to be done for enterprise
production use cases, you kind of also have to make sure there's a lot
of safety and security things done.
So these other kind of priorities that fold into what people typically
want to do.
We're looking at these things and saying, OK, well, these are the
enterprise use cases that people have.
And as people try to solve the problems of making the models perform
at the level that makes it like acceptable for actually being deployed
as a production service, we see very often that people choose like,
well, OK, we don't get the performance that we wanted with this right now.
We'll just drop in a larger model.
It'll be smarter. It has greater reasoning skills.
And we'll just sort of expect that the important performance will
improve commensurate with the additional load of the size of the
model and the greater inference cost that goes along with that.
And in some cases, that might not always be the right thing.
So we see people saying, you know, just go get a bigger model.
They'll solve the problem.
And sometimes maybe that isn't quite the answer.
In this case, what we're trying to do is to say, can we take a
smaller model and then use RL with the right data to yield the kind of
performance gains that we're looking for and to deliver the kind of
application functionality that we want.
And so that's the target here.
And again, for these various reasons, cost, speed, security,
and then the idea that in general, you know, you start with a really big
model and make your POC and make it work and have everybody's happy
that it works and it's like, OK, now what do we do to productionize it?
And you want to roll the production.
You want to think about how you're able to deploy that.
Do you need to keep everything on premise?
Do you have the ability to deploy and run your service yourself so that you
don't have to have external dependencies and worry about the data
export aspects and data control, especially in the context of financial
data and health care and other domains like that.
People have to be concerned about those aspects as well.
So for getting a smaller model to be able to perform as well as larger
models, we feel like in the particular case of talking about tool use for
financial analysis, that RL is the right time to be making the kind of training.
You're talking about like changing the behavior.
And so that's kind of more of a behavior thing than RL is kind of better
for behavior than say, talking about like changing the core data
and knowledge that's inside of that.
So that's that's an intuition about like how we've approached it.
And that's part of what's going on here.
So a larger model, sometimes it's more like taking a sledgehammer
to crack a walnut.
It's like just adding all of this capability is like this.
And the RLM team that we worked with, they talked about this and
their description of it was the Terence Tao effect.
Terence Tao, the famous mathematician, who's, I forget what awards he's won
and whatnot, but well known for being generally brilliant about mathematics
across the board and therefore like could approach and
manage any kind of mathematical problem.
But that much brilliance might not necessarily be what a financial
analyst actually has to have.
They don't have to know all the kinds of math.
They don't have to do latent digital Dirichlet algorithm stuff
to talk about doing a SQL query and getting some math, getting some,
some data's back and then doing some addition and subtraction, right?
So the, the idea that you must always get to a much smarter model
to do something or deeper reasoning to get something done well
is the thing we're challenging here.
So here is that 235 billion quen 3 model
responding to the question in this environment that we built.
I'm going to talk about the environment a little bit more in detail later.
But I point this out to sort of show,
here's a reasoning model, a smarter model and
its response in the context of needing to actually use tools.
So the response that it got, that it generated to the question,
what is the year over year growth rate of YouTube ads revenue from 23 to 24,
began with making a query to find an existing some values.
But the, the query it chose was to a non-existent table.
The table didn't exist.
It didn't actually inspect the environment and inspect the tools
to find out what tables it could query.
It just threw a query out without doing that.
So the table, it wasn't there and didn't get anything back.
It guesses again, still doesn't get anything back, and
then having not gotten anything back in either of those two attempts,
it falls back to just hallucinating an answer.
And so, out comes this hallucinated answer.
It's completely, you know, don't know what the weights told it to say, but
that what came out and, you know, it's, it's not very useful.
So even though the model is incredible in terms of, like,
much better at reasoning than a much smaller model would be,
that greater reasoning did not help it when it needed to use the tools.
We're gonna come back to the same question again,
against the model that we fine-tuned that's only the four billion parameters.
And you're gonna see the difference,
and we'll talk a little bit more about those differences later.
So put a pin in that, come back,
we'll see that, that year over year question from, come back.
So here, this is what we're talking about, summarizing it again.
No discipline in tool use, even though it has all the,
the abilities to reason that it has.
Moving forward to then what we did for this attempt to use RL to make
the smaller model work well.
The first thing is to generate a high-quality data set.
At Snorkel, our general approach is, again, to have experts in the loop.
I don't know if I said, I say it again now, but
I don't think if I said it right.
We have experts in the loop for the data that we do.
The way we generate data, and the way we work on it,
is we have a platform that we've used internally for interacting with things.
We solicit the work and
support of experts on various tasks and very topics.
So if we need somebody who is in the financial analysis space already,
then we get them and pull them in.
We'll work with people at the PhD level for their domains of expertise.
And also, of course, people who are deep in the industry and
have been working for some time, and they know their space well.
The process of doing that, that's one of the things that we put an emphasis on,
is how we work at Snorkel for our data generation.
And then, broadly speaking, naturally that can be augmented with
other kinds of things, but that's one of the key about what we want to do
in terms of emphasizing quality as a core element.
So we have the data set, and then we go through and
make sure there's a verification step done to make sure that the tasks
that are defined from that data set are actually appropriately fitted to the task.
And they're actually good tasks in terms of it can be queried.
You know that you're gonna get the results that you need from it, and
that we should be able to have a verifiable answer that we're looking for.
So we do all the verification steps to make sure that everything's correct on
that front.
And that's another part of what it means to put together the data set and
have it ready for use.
Data quality, again, is a big emphasis for us, so
we need to make sure that's the key.
And then it was time to do RL with it, and the way that this was done.
We were talking about very few surprises in terms of like,
you've seen the state of the art in this space.
GRPO, again, we started with a four billion parameter model.
And then the environment that we used, the RLM framework.
Again, through the UC Berkeley partnership,
they're the developers of that framework.
And we have our FinQA environment that we've built.
And we're gonna talk a little bit more about the details about that
environment in just a moment.
But then, this is something that was able to be done in a 21 hour job.
And the total cost of running that job was under $500 per run.
So RL does not have to be a very expensive thing
to be able to get non-trivial performance gains.
And if you're already working with models that you want to host yourself,
if you're already thinking about what you'd like to do to be able to do
things we have on premise kind of solutions or things where you're doing
it with smaller models, and you aren't already thinking that you can improve
the models the way that you want, this is like a call to action that you
actually can, that it's actually a very tractable thing to get a model
that you want to work with actually up to the performance levels that you
need using RL, even if Karpati doesn't like it.
So our FinQA environment is something that we built.
It's set up for being able to host the kinds of questions that are being done here.
It provides a specific set of tools.
It's set up where everything is built into the environment, so
there's no external dependencies that might be in some
remote data center that you don't have access to.
So when you deploy the environment, it's fully self-contained.
Kind of roll out that if you've worked with something like Harbor before,
or if you've worked with OpenENV,
you're familiar with the same thing about using an environment like this.
And this is an environment that we've actually built and
published, it's available on Prime Intellect's infrastructure as well.
So it's something you can load up right there at Prime Intellect.
Also on OpenENV and actually saved into the OpenENV repo on GitHub.
And then the OpenENV, the PyTorch folks and
Hugging Face folks team up and host these in Hugging Face spaces.
So these kinds of things are accessible and easy to find if you wanted to take
a look at them and see how you might take them and apply them to your needs.
And then again, getting started with RL is actually easier and
easier these days.
We have the FinQA setup where we have 290 samples that way and
we have our more advanced 79 samples called FinQA reasoning that requires
multi-table queries and so there's enough of the reasoning that has to be
done across that to make, we've identified that these are harder tasks.
And so we have essentially two benchmarks that are built
inside of this environment.
So that's the setup of how we get this done.
We're going to go about talking about the evals and the results that we got
working with this now, given the RL that we just did on this 4 billion
parameter model.
So we did it.
It performs better than the 235 billion parameter model
with that RL training loop.
And the performance in terms of passive one was essentially double of
what it had been percentage wise in terms of solving problems.
So it's a very significant uplift that was done with this $500 loop.
And again, the right data set and is really a key.
You want to get the questions and
answers to be actually things that are really going to help the model learn.
But what is also interesting is what was important about what
the model needed to learn.
So just to give you a little flavor of what that 4 billion parameter model
looks like in terms of how it behaves.
And if you recall what we talked about earlier,
the 235 billion parameter model tried some queries without knowing
what the tables were, didn't find anything, and then hallucinated an answer.
This 4 billion parameter model, having been fine tuned on this data set,
tries a table and actually first discovers the tables by using the tool,
get table names.
The tool existed for the other model as well, and
it just didn't choose to try it.
So the first thing it did was actually query to find out what tables
it had available to it.
So that's already like win, all right.
The second thing is then from there it went on to actually inspect the schema.
Let me find out what's in that table so I know how to make the right SQL query.
And so it's like does get table info to get the information back,
to know what to query it.
Following that, it runs a query, actually ran into an error.
It actually asked for the revenue column, but
that column was not actually a part of the data in the table.
Given that error, it actually corrected.
It self corrected, it observed the error, responded to that error by actually
correcting to find the actual column that it needed.
And so you're seeing both the error correction that it had learned how to do
as well as the use of the tools to discover the right information in
the first place.
So between those two, those behaviors are the real keys to succeeding at
these questions.
And this is actually something like maybe not quite intuitive about like
where it is that the model was failing.
The reality is that what it needed to do, and
here it is getting the correct answer, the reality is what it needed to do
was to learn how to use tools.
Couple interesting things that go along with it that are more fun and
also really useful and good for our situation here.
The training data that we talked about at the beginning,
there were single table questions,
multi table questions included in the overall data set.
And as part of the ablation study, one of the things that they said was,
let's take a look and see if we train with single table only.
Train with multi table mixed in so the full data set will cross both types.
Or try to do some curriculum learning and actually start with single table,
let the model climb a bit, and then progressively add multi table.
And it turned out the single table only training was actually
the one that yielded the greatest uplift for these kinds of questions.
So that was a nice pleasant surprise.
And the other surprising thing was that even though the single table
only training regime was the best training regime.
The uplift that we see in terms of the model's performance on that harder
benchmark that has multi table questions was a similar doubling in
percentage improvement.
So the harder multi question,
multi table Q&A in the FinQA reasoning question set
also saw 13.9 to 26.6 percentage jump after this training.
So interestingly enough, again, the tool discipline,
this knowing how to use the tools that are in the environment turned out to
be a bigger deal than anything else in terms of how to make these models
actually get better at what they need to do in this space.
So turned out it wasn't the reasoning that was the issue.
It was the tool use.
We focused only on single step for the best performance and
were able to fix that core failure mode.
And given that core failure mode being fixed, it turned out that that
then made the model better in terms of the improvement generalizing to
other question sets.
So that means that's the key to take away from this,
is that sometimes the idea is to find the specific behavior that's really
the problem.
And one of the things, go back to what we do at Snorkel,
one of the things that our research team has been talking about a lot
lately is building rubrics as part of our evals.
And then those rubrics, by breaking down the rightness or
wrongness of a model's response into a full list of different
questions that can be answered.
And looking at each of those individual questions,
you can then start to use the rubric as a way to find and
find where the actual problem is among all the multiple possible arenas.
So instead of simply knowing yes or no at the final,
which is good for the RL part, you can use the rubric to help you do
an analysis of what are the behaviors that you wanna actually generate
data sets to help you with.
So you make decisions about which data sets you need or
which data you wanna work with,
based on what you see coming out of the richer feedback that the rubric gives you.
And then the RL still gets a single value as a GRPO,
just usually works with a single value, that's part of how it works.
So you use that for the actual RL cycle.
So that's the summary of what we did with that.
We think it's a really interesting result to know.
And again, the opportunity of what you can do with
solving the right questions or right problems really helps.
This link here is to a blog post that we have about this.
So if you have questions about the details of this particular study and
you wanna see more about it, you can drill down within that.
It also links to a partner post from the Agentsica team over at UC Berkeley.
So their post also has additional information you can see from them.
And this is the significant thing we wanted to talk about.
So thank you for your time.
And I don't know how much time we have left for questions or not.
How are we doing?
Are we already at time?
Looks like it.
Yeah, sorry, okay.
So I'm sorry we don't have questions.
I'll hang out right outside if anybody has any follow-up questions they
wanna ask.
And thank you very much.
Appreciate it.
