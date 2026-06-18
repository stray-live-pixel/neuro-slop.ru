[00:00] Here's your monthly reminder that you
[00:01] shouldn't be prompting coding agents
[00:03] anymore. You should be designing loops
[00:05] that prompt your agents. I don't know
[00:06] about y'all, but this memo didn't make
[00:08] it to me. Of course, I've seen loops
[00:10] before. Things like the Ralph loop
[00:12] really helped me think about how agents
[00:13] can do more over time, but it also
[00:15] massively increased the error rate of
[00:17] the changes that I was having my agents
[00:19] make. They were really cool, but they
[00:20] didn't seem that productive. And I found
[00:22] myself going back to the usual, which
[00:24] was asking the model to make a plan,
[00:26] reading the plan, saying, "Yeah, that
[00:27] looks good. go do this part and then the
[00:28] next part, then the next part, then
[00:30] having another agent review it, then
[00:31] bringing the feedback back to the first
[00:33] agent and just the usual looping of
[00:35] work, but I was the one running the
[00:37] loop. I was the one doing the
[00:38] handholding and bringing things from
[00:40] part one to part two and making sure all
[00:42] of my agents had the context they needed
[00:44] to build well. And Pete, as always, is a
[00:46] bit ahead of the curve. I have been a
[00:48] huge fan of him since way before the
[00:50] open claw chaos because he knew how to
[00:52] think about building with agents in a
[00:54] fundamentally different way that made
[00:56] him way more productive. I think of Pete
[00:58] as an experimental figure in many ways
[01:00] where rather than being the role model
[01:02] we should all be copying, he's the
[01:04] person figuring out what the future
[01:05] looks like in a weird jank duct tape
[01:07] version now and we can all learn from
[01:09] that and see where things are going. At
[01:12] least that's how I used to think about
[01:13] him and honestly I'll admit I still do
[01:15] in a lot of ways. But then I started
[01:17] building more with loops. I started
[01:19] getting my agents to prompt themselves.
[01:21] I started setting up systems where
[01:22] agents would review code, give feedback,
[01:24] adjust it, and then trigger re-reviews.
[01:26] I started building systems that would
[01:28] watch poll requests and watch existing
[01:30] issues on other repos to tell me when
[01:32] updates happen. I started using Hermes
[01:34] agent to bring context to me instead of
[01:36] to go out and find it for me. And I've
[01:38] accepted now that Pete's right. We
[01:41] should still be writing prompts, though.
[01:44] More importantly, I would argue now that
[01:46] the majority of your agent runs should
[01:48] probably not be running with prompts
[01:50] that you wrote. That is a crazy thing
[01:52] for me to say because it was one of
[01:53] those like I never thought I would see
[01:55] the day things. But now that I've
[01:57] explored it myself and I've shipped a
[01:58] lot of code using these types of loops,
[02:01] I have a lot of thoughts I want to
[02:02] share. But I have one other thing I want
[02:04] to share quickly first, which is today's
[02:06] sponsor. AI should be good at design. It
[02:08] knows all the things it needs to about
[02:10] code, designs, visuals, and more. But
[02:11] every time I try to have it redesign
[02:13] things that I'm working on, it just
[02:14] doesn't do it right. At least that was
[02:16] my experience before I started using
[02:18] today's sponsor, Magic Patterns. These
[02:20] guys really cracked good design flows
[02:22] with AI. They're not trying to replace
[02:24] your whole stack or be a full site
[02:26] generator. They're trying to work within
[02:27] the real constraints of your real
[02:28] codebase on just the front end in order
[02:30] to get great designs out. The first
[02:32] thing that makes them different is the
[02:33] design system selector. Unlike other
[02:36] tools that will just generate a bunch of
[02:37] slop code, you can pick between existing
[02:40] realbased systems like the one that they
[02:41] provide, a wireframe system, or even
[02:43] classics like Shaden, Shakra, Mantine,
[02:45] and MUI. Or you can create your own, and
[02:48] you can also import things from Figma 2,
[02:50] which is super helpful. You can then
[02:51] switch between different models,
[02:52] obviously, the ones that we all love and
[02:54] know are decent design, like the Opus
[02:56] line, Gemini 31, but also their auto
[02:58] router has really impressed me. It was
[03:00] able to grab the real SVGs for the logos
[03:02] for the things that I wanted to put on
[03:03] there once I showed them where they
[03:04] were. I can open up the preview and send
[03:06] this to other people on my team, which
[03:07] has already been super helpful. I can
[03:09] also leave comments on any point on the
[03:11] screen to tell the agent what else I
[03:13] wanted to fix, which has been a
[03:15] lifesaver when you're working on these
[03:16] types of things. They even have a visual
[03:18] editor for when you want to edit fonts,
[03:20] content, and things yourself. So, when
[03:21] you notice the agent's just not getting
[03:23] something right, don't fight it. Change
[03:25] it yourself. This is a small thing, but
[03:26] it's one of my favorites. The ability to
[03:28] choose different frames to test your
[03:30] site in to see how it looks on like a
[03:32] mobile display or an iPad display is so
[03:35] helpful as you're trying to get these
[03:37] fine-tuned pieces right. I can't tell
[03:39] you how many times I had a design that
[03:40] seemed good, but as soon as I shipped it
[03:42] and opened it on my phone, it was awful.
[03:43] No more. Just do it here. Starting to
[03:45] see why companies like Door Dash, Vappy,
[03:47] Granola, and more are leaning so hard on
[03:49] what Magic Patterns has built? These
[03:51] guys get it. Design better with AI at
[03:53] soy.link/magicpatterns.
[03:55] So, this post by Pete is the one that
[03:57] started this new era of looping
[03:59] discourse. But this is not the tweet
[04:02] that got me to go try loops. It was this
[04:04] one. Here's a simple loop. Tell Codeex
[04:07] to maintain your repos. Wake up every 5
[04:10] minutes and direct work to threads. That
[04:12] makes it easy to parallelize and steer
[04:14] work as needed. He uses an orchestrator
[04:16] skill combined with his triaging and
[04:17] auto review and computer use skills so
[04:20] some work can land autonomously. This
[04:22] helped a lot click for me in particular
[04:26] of your agent directing work to threads.
[04:30] I didn't realize Codeex had a feature
[04:32] where a thread in Codeex could spin up
[04:35] another thread in Codeex. And now that I
[04:37] know it has that, I have been pushing it
[04:39] much harder. I want to contextualize
[04:41] this in a bit of a weird way. I'm going
[04:43] to reference the article Anthropic did
[04:45] about recursive self-improvement because
[04:47] they did a great job describing how our
[04:50] work has changed over time. Previously,
[04:52] a person would use a computer and they
[04:54] eventually would use that to build a
[04:55] chatbot or an AI model. Once we had the
[04:58] AI model, the person could use the
[05:00] computer to ask the chatbot questions
[05:02] and get outputs that they could then use
[05:04] in their code to make better software
[05:07] and eventually maybe make a better
[05:08] model, too. But the loop was the person
[05:11] uses the computer asks the chatbot a
[05:13] question. It gives a result to the
[05:14] person who then copy paste it into their
[05:16] code and then asks another question. I
[05:18] know a lot of people use stuff like my
[05:20] chat service T3 chat as a way to just do
[05:23] code but they would bring it code
[05:24] questions and then copy paste the
[05:26] answers. It really kind of emphasized
[05:28] the whole like coding is just copy paste
[05:29] meme. Chat bots pushed it way further
[05:31] but now we've gone far beyond that
[05:33] because copyping is not the best use of
[05:35] our time. So instead of copy pasting the
[05:37] result from the chatbot into our
[05:38] codebase, we started to just use our
[05:40] IDEs, our terminals and other tools to
[05:42] talk to the model and get it to edit the
[05:44] code directly and that's where things
[05:46] have been for a while now. But then we
[05:47] had another big change with workflows
[05:50] and sub aents. I know a lot of people
[05:52] haven't even made this move yet and I
[05:54] was hesitant to do it myself. Obviously,
[05:56] tools like Cloud Code and Cursor will do
[05:58] some amount of this to go explore and
[06:00] find things in your codebase, but the
[06:02] idea of telling my agent to spin up five
[06:05] agents to go break up work was something
[06:07] I just wasn't that interested in,
[06:09] especially when I saw all the crazy [ __ ]
[06:11] people were doing, trying to create
[06:13] different personas and roles for all of
[06:15] those workers where they had a skill
[06:17] that wrote down in markdown files, this
[06:19] is the adversarial reviewer, this is the
[06:21] security reviewer, this is the groer and
[06:24] finder, this is the exploration agent
[06:26] that made no [ __ ] sense. And I would
[06:28] argue that still makes no [ __ ] sense.
[06:30] The idea of predefining personas to go
[06:33] do things in your codebase fundamentally
[06:35] misses the cool part of agents and AI as
[06:38] a whole. It's dynamic. The agent can
[06:41] build the context it needs and do the
[06:43] things it needs to without having
[06:45] everything pre-built and hardcoded ahead
[06:48] of time. Imagine a coding template for a
[06:50] project where every file is already
[06:52] created and you have to edit things in
[06:53] the existing files. It's stupid. And
[06:56] that's how I felt about most of the sub
[06:58] aent stuff that people were doing.
[07:00] Workflows pushed me hard here. And the
[07:02] video I just recently published about
[07:04] the things I like about cloud code goes
[07:06] a little more in depth there on the
[07:07] things I like about workflows. The idea
[07:09] of your agents constructing this method
[07:12] that they're going to use to tackle a
[07:14] problem was really enticing to me. But
[07:16] now I'm going a bit further. Closing the
[07:18] loop where the model doesn't just pick
[07:21] and spin up what sub aents it needs. It
[07:23] audits the work it does and then sends
[07:25] the result back to run again and again
[07:29] and again and again. I am not at the
[07:32] fully autonomous loop point yet. I am
[07:35] not claiming the same things people like
[07:37] Boris are claiming where they're writing
[07:39] the loop and now the code is just
[07:41] happening by itself with no oversight.
[07:43] That is stupid. But I wanted a taste. I
[07:47] wanted to get an idea of how this could
[07:49] work so I could play with it myself and
[07:52] see what benefits exist. So I started to
[07:55] play a bit. I started to do stuff like
[07:57] this. I had Claude Code spin up a PR for
[08:01] a pretty big refactor. I used sub agents
[08:03] a bunch to go address specific concerns
[08:05] and take over specific parts of the
[08:07] codebase. I didn't even say how to break
[08:08] it up. I let Opus figure that out
[08:10] itself. Man, I miss mythos right now.
[08:12] But one specific thing I did do was tell
[08:15] the agent to monitor the PR for comments
[08:19] because I have a lot of awesome code
[08:21] review tools that are watching my PRs
[08:23] when they're filed and leaving feedback.
[08:26] And I moved away from copy pasting code
[08:28] out of chat bots and into my codebase.
[08:30] And instead I found myself copy pasting
[08:33] the comments that things like code
[08:35] rabbit reptile and macroscope would
[08:37] leave and pasting those into the agent
[08:39] so that it would go address them. It
[08:41] wasn't great. So what I started doing
[08:43] instead, and this was the first step
[08:45] into heavier looping for me, and I would
[08:47] highly recommend you guys try the same
[08:48] because it's actually really cool. Once
[08:50] you have your setup in such a way where
[08:52] you have different work trees that are
[08:54] monitoring and working around specific
[08:56] pieces of work where this code is in a
[08:58] directory that is specific to this PR,
[09:01] that means I don't care about this
[09:02] directory. It's not blocking other work.
[09:04] Once you have this broken out, in this
[09:07] case I'm sating to another machine on my
[09:09] network that is running this codebase
[09:11] that has this fork of this codebase,
[09:12] this work tree for it and then I told it
[09:15] monitor the comments, watch the PR, wait
[09:18] for comments to come in and when they
[09:20] come in address them and it did it and
[09:24] it's been doing it now for like 6 plus
[09:27] hours. It has made a ton of improvements
[09:30] through this. And then I had a taste and
[09:33] then I got really excited to play more.
[09:35] I wanted to push the limits of how much
[09:39] I could land without having to do the
[09:42] follow-up prompting myself. And I'll be
[09:44] honest, I still found myself hopping
[09:46] over the codeex and saying, "Hey, can
[09:48] you review this code?" And then copy
[09:49] pasting the result of that review over.
[09:51] I played a little bit more there where I
[09:53] told Claude, hey, when you're done, run
[09:55] codeex with this command to get it to
[09:58] give feedback and then address what it
[09:59] gives as feedback. And that worked
[10:01] pretty well, too. But this is still for
[10:04] traditional work where I have one PR
[10:06] that does one thing that is being
[10:08] watched by my agent to address the
[10:11] comments that come in. There's a lot of
[10:13] work that can't be broken down into just
[10:15] one PR. I recently ran into one of those
[10:18] pieces of work. I have been rebuilding
[10:20] the isolate layer inside of Lakebed to
[10:23] make it a little more financially
[10:25] reasonable to deploy the way I want to
[10:27] deploy it. I did a deep dive on
[10:30] performance and alternative runtime
[10:32] options for how we could architect this
[10:34] with 55 and it had really good
[10:36] suggestions, but one of the things it
[10:38] pointed out was that my data
[10:39] architecture had a lot of room to
[10:42] improve that could help performance even
[10:44] more than runtime changes. Here's where
[10:46] it gave that feedback. The isolate
[10:48] architecture may not be the first
[10:49] scaling bottleneck. Current subscription
[10:51] validations rerun every query
[10:53] subscription for an app after each
[10:54] mutation. For hot apps, we should
[10:56] implement dependency aware invalidation,
[10:58] mutation coalescing, per app
[10:59] invalidating batches, shared results for
[11:01] identical subscription arguments, and
[11:03] back pressure and maximum refresh
[11:05] frequency. This is when I realized there
[11:07] was a lot of work that needed to be
[11:08] done. So I asked up front from these
[11:11] features you think we should implement,
[11:13] which should be done separately and
[11:14] which should be done in tandem. Would it
[11:16] be realistic to do all of this in one
[11:18] PR? It very quickly said, "No, I would
[11:20] not implement all of this. It's one
[11:22] project, but at least three PRs, current
[11:24] implementation synchronously, yada
[11:25] yada." And then it broke up what the
[11:27] different PRs could look like. I asked
[11:29] if they could be worked on separately or
[11:30] should they be stacked. It said they
[11:32] should be mostly stacked, but there's
[11:34] some opportunity for parallelizing. I
[11:36] then told it to write an HTML plan. My
[11:39] beloved, thank you again to our friend
[11:41] Thoric for introducing me to this
[11:43] wonderful pattern where it is so much
[11:45] easier to see what my agents want to do
[11:47] and read it in a way that I can even
[11:48] open on my phone. It's so nice. And it
[11:50] wrote these plans for each of the
[11:53] portions that it needed to complete. I
[11:55] also told it here after the plan like
[11:58] please make the plans piece to create a
[12:00] new thread with the first plan as a
[12:02] starting point. And it did. It created a
[12:04] PR by itself in a new thread to go
[12:08] implement that first plan and then it
[12:11] landed and I did my usual thing where I
[12:13] had a bunch of back and forth review. I
[12:15] spun up another thread to review it. I
[12:17] copy pasted back and forth. It got into
[12:19] a good state so I merged it. I then
[12:21] asked to make a fresh thread for part
[12:23] two which it did. It only took a few
[12:25] seconds but I realized I should be
[12:27] looping harder. This is the single
[12:29] message I have sent to an agent that has
[12:31] impacted my psychosis the most. Would it
[12:33] be possible to make a workflow of some
[12:35] form that first will spin up a separate
[12:37] thread to make the PR, second, spin up
[12:39] another thread to review that PR when
[12:42] it's filed. Three, puts the thread from
[12:44] one in a loop reviewing comments until
[12:46] it gets all approvals. And then fourth,
[12:48] the thread would merge the PR and
[12:51] trigger another one for the next piece.
[12:53] I didn't think it'd be able to do this,
[12:54] but I was curious how it would try. And
[12:57] it made a kind of broken diagram showing
[13:00] the workflow it had in mind. It said it
[13:02] would use a heartbeat attached to this
[13:04] thread pulling every 5 to 10 minutes. On
[13:05] each wake up, it would read the
[13:07] implementation thread status, detect
[13:09] file PRs, create a fresh review thread
[13:11] when a new PR has a new Shaw head, send
[13:14] actionable findings back, re-review
[13:16] after the fixes are pushed, yada yada,
[13:18] and then pull latest main before
[13:20] creating the next work tree. So, I said
[13:22] make the workflow and use it to file the
[13:24] remaining PRs. And it did it. This was
[13:27] Sunday at 2:29 a.m. and it eventually
[13:30] finished and broke everything in my
[13:31] editor pretty aggressively at 6:50 a.m.
[13:35] I set this off before going to bed and I
[13:37] woke up the next day with four stacked
[13:40] PRs reviewed to hell and back all
[13:44] merged. It was [ __ ] awesome. Do I
[13:47] think you should do this on real
[13:48] production code bases that have millions
[13:50] of users? Probably not. At least not
[13:53] yet. But god damn is it cool to spin up
[13:56] work in this way where complex
[13:59] multi-stage problems that need their own
[14:02] breakdowns that need their own poll
[14:04] requests that need their own reviews and
[14:06] cycles and loops because that's the
[14:08] craziest thing here. I asked the model
[14:10] if I could make this loop and it made a
[14:13] loop that makes sub loops dynamically.
[14:16] This isn't a hard-coded every time I
[14:18] make a change I spin up one reviewer
[14:20] that reviews it and then they go back
[14:22] and forth. This is a dynamic workflow
[14:25] that was created based on the specific
[14:27] needs of this specific problem I was
[14:30] solving. My loops created loops and they
[14:33] did a great job at it. This was real
[14:35] code that landed and sadly I couldn't
[14:38] have Fable come in and review it because
[14:39] this was after the ban. But the idea of
[14:42] your agents being able to orchestrate
[14:44] dynamic work in a way that is
[14:46] specifically tailored to the problem is
[14:49] so cool. Throughout most of my career,
[14:51] when I worked at real companies, we
[14:53] would follow some form of the
[14:55] traditional agile sprint loop where we
[14:59] would put tickets inside of our backlog
[15:02] and then once every week or two weeks,
[15:04] the start of the week, we would pull up
[15:06] the backlog and decide what was worth
[15:08] working on and how long we thought it
[15:10] would take and then try to make sure
[15:12] work that's blocking other work was
[15:13] prioritized accordingly, that everybody
[15:15] had unblocked work to do. But the actual
[15:18] flow of all of this was pretty static.
[15:20] It was the classic agile waterfally
[15:24] structure and we kind of had to force
[15:26] our work to fit that shape. The most
[15:28] productive teams were the ones that
[15:30] would build their own alternative shape
[15:32] around the problems they were trying to
[15:34] solve. That is what makes this so cool.
[15:37] The shape of the loop, the shape of the
[15:40] structure, the shape of how work happens
[15:44] can be dynamically generated based on
[15:46] the shape of the work that you're doing.
[15:49] And you can use this for all sorts of
[15:51] crazy stuff. You can use this to monitor
[15:54] poll requests that need to be merged.
[15:56] You can use this on a schedule to every
[15:59] morning start your day with feedback on
[16:01] what PRs are worth merging and what ones
[16:02] are worth forgetting about. I use this
[16:04] type of thinking to find the best
[16:06] solution for a 5G hotspot. And since I
[16:08] had a loop checking what the best deals
[16:10] were, I got early information about the
[16:12] new Verizon plan they just put out
[16:13] because my loop pointed it out to me
[16:15] randomly on Discord. It's so cool. And
[16:18] again, to my earlier point, I wrote a
[16:20] handful of prompts in this thread. I
[16:22] wrote most of the prompts. Actually, no,
[16:24] I didn't cuz it got in that schedule
[16:26] after. But up until the schedule
[16:28] started, I wrote all the prompts and I
[16:31] read the responses and I said, "Yeah,
[16:33] that sounds good. Let's see what
[16:34] happens." And then I did see what
[16:36] happened. And what happened was kind of
[16:38] [ __ ] awesome. So, what I would highly
[16:40] recommend you do here, the info you take
[16:43] from here, is to think about the work
[16:45] you do before, during, and after you
[16:48] prompt your agent. When your agent
[16:50] completes its task, pay attention to
[16:52] what you do next. For me, what would
[16:55] happen is I would tell the agent to
[16:56] build the thing and then once it built
[16:58] it, I would run the thing and go see if
[17:01] it worked. And if it did, I would commit
[17:03] the thing and then push the thing and
[17:05] then make a pull request on GitHub for
[17:07] the thing. I would then wait for my code
[17:09] review agents to give feedback. I would
[17:11] address that feedback. I would then ask
[17:13] my team for feedback. I would address
[17:14] that feedback and then I would merge it.
[17:17] Start from where you started there. The
[17:19] first thing I did after the changes were
[17:22] completed was run a dev server. Tell the
[17:24] agent to do that. I then checked if the
[17:26] work worked. Tell the agent to do that,
[17:29] too. Computer use has gotten really
[17:31] good. After I verified the work, I would
[17:33] then commit. Tell the agent to do that
[17:34] once it's verified things are correct.
[17:36] Tell it to push up the code and file a
[17:38] PR once it's ready. Then I would go get
[17:41] those code review comments and copy
[17:43] paste them into the agent to fix. Tell
[17:44] the agent to do that itself, too. Maybe
[17:46] tell the agent to spin up other threads
[17:48] to do its own reviews. The other spicier
[17:51] way of putting this is that we are
[17:53] looking at the code too early. If you
[17:56] are reading the code your agent put out
[17:58] before another agent read it and gave
[18:00] feedback on it, you're wasting your own
[18:02] time. That's time that the agent could
[18:04] have spent instead that you could have
[18:06] used to find other work worth doing or
[18:08] to relax a little or go spin up a side
[18:10] project. I don't know what you're going
[18:11] to do with your free time, but I have
[18:13] had far too many instances where I read
[18:15] agent code. was like, "That's obviously
[18:16] wrong." And then told it to go fix it.
[18:18] They can figure that [ __ ] out
[18:19] themselves, too. And now when the human
[18:22] comes in, all the [ __ ] is gone and
[18:24] you can focus on the hard stuff. It's so
[18:26] much more fun. Try to find where you
[18:28] have to be involved and see what it
[18:30] takes to prompt yourself out of it. I'm
[18:32] not saying you need a bunch of custom
[18:34] skills. I have almost none here. I'm not
[18:36] saying that you need to build fancy
[18:37] plugins or install a bunch of [ __ ] I'm
[18:39] just using stock codecs. I'm not even
[18:41] using T3 Code for this. I do hope to get
[18:43] these features added to T3 code soon cuz
[18:44] they're really cool, but I'm just using
[18:46] stock codecs with a normal account here.
[18:48] There is one catch though, cost. You
[18:52] will burn many more tokens when you run
[18:55] things in loops like this. And if it's
[18:57] going down the wrong path, it might go
[18:59] down that wrong path for longer to burn
[19:02] more tokens and potentially cost you
[19:03] more money. If you're paying API prices,
[19:06] you probably shouldn't be doing loops
[19:07] yet. That said, you might be surprised
[19:10] how far you can go with them. Remember
[19:13] that loop I mentioned earlier that I was
[19:15] using Opus and Claude code for where
[19:17] it's watching the PR and updating it
[19:19] constantly? Not only is it doing that,
[19:21] I've noticed that every time it gets
[19:24] feedback, it spins up a workflow with
[19:26] eight steps or more to address all of
[19:29] it. I had one agent spend under 10
[19:31] minutes leaving feedback. And based on
[19:33] that feedback, the Opus workflow ran for
[19:36] eight hours and did over three million
[19:39] tokens down to address like three small
[19:41] comments. It was brutal. It was absurd.
[19:44] If I was blocked during that time, it
[19:46] would have been very rough. And
[19:47] honestly, I was kind of blocked at that
[19:48] point because this is a big overhaul and
[19:50] I want this in before doing other
[19:51] changes cuz I'm unfucking the the
[19:54] TypeScript that looks like Python that
[19:56] GPT 5.5 wrote. Because as great as the
[19:59] model is at writing code that functions,
[20:01] it does not write code I like looking
[20:02] at. Anthroic models write better-looking
[20:04] code. I wanted to do this with Fable.
[20:06] Fable was taken. So instead, I burned a
[20:08] shitload of Opus tokens. This thread is
[20:11] so long that it's like breaking my SSH
[20:13] and clawed code. I can't even scroll up
[20:15] far enough to get to my first prompt
[20:17] because this thread is just so much [ __ ]
[20:19] going on. Very little of which has
[20:21] involved me at all. So, how was my
[20:23] usage? I do have two Claude code
[20:26] accounts right now, so I'm sure this
[20:27] burned through it really aggressively,
[20:29] right? Well, this combined with
[20:31] everything else I have been working on
[20:33] for the last few days using Opus, still
[20:36] has me at only 29% of my weekly limit,
[20:40] which expires in 8 hours. I was maxing
[20:43] out my limits with Fable. And with Opus
[20:45] in a loop like this, I'm not even close
[20:48] to getting my limits. And I've had like
[20:51] five of these types of loops running in
[20:53] that time. Really big piles of changes
[20:56] happening. And it doesn't [ __ ]
[20:58] matter. It's not getting close to my
[21:00] limits. I am on the $200 plan. I will
[21:02] also say that I ran a workflow using the
[21:05] new Claude code with Opus48 when it came
[21:07] out on the $100 plan and I hit the five
[21:10] hour limit instantaneously. I have never
[21:12] come close to the five hour limit with
[21:14] Opus and Loops. And I'm also not coming
[21:17] close to the weekly limit with it either
[21:18] on that $200 plan. So if you're already
[21:20] on a $200 plan or you're willing to be
[21:23] on one and you find that your usage is
[21:26] not getting like lethal, like you're not
[21:28] getting close to maxing out, start
[21:30] looping more. And since you can't use
[21:32] these plans at normal companies usually
[21:34] because of the differences in
[21:35] restrictions in how you're supposed to
[21:36] use an enterprise plan at API prices, go
[21:39] use this for crazy [ __ ] that you don't
[21:40] think should be possible. I would also
[21:42] recommend experimenting with the tools
[21:44] that are included with our harnesses
[21:46] now. A lot of them are pretty powerful.
[21:48] Codex's ability to spin up new threads
[21:50] is really, really cool. Both Codeex and
[21:53] Claude Code have a /goal primitive which
[21:56] allows you to get one thread going
[21:58] forever on a task where it keeps
[22:00] double-checking at the end of a turn,
[22:02] did you finish the work? If no, okay,
[22:04] keep going. That type of like linear
[22:06] neverending loop is different from a
[22:09] dynamic workflow like I showed earlier
[22:10] where it creates dynamic work based on a
[22:14] pre-planned goal versus a
[22:16] traditional/goal where it just keeps
[22:19] plugging along on that one thread until
[22:20] it completes. I have a goal running
[22:22] right now that's over 12 hours in that's
[22:25] trying to rewrite Hermes agent in Rust
[22:27] so that I can run it in isolates that
[22:28] are much smaller and use less resources
[22:30] cuz my Hermes agent uses over a gig of
[22:32] RAM. It is getting close. It'll probably
[22:34] work. It probably won't be production
[22:36] ready. It probably won't be something I
[22:37] want to put out there and sell or
[22:38] anything, but it's a fun use of my spare
[22:40] tokens. And it's really interesting to
[22:42] see what types of problems can be solved
[22:44] when you throw these crazy rate limits
[22:46] at them. The point I'm trying to make
[22:48] here is that you should be treating
[22:50] these limits like challenges. If you're
[22:52] on the expensive plan, you should be
[22:54] trying to get close to maxing it out
[22:56] because that's just money you're losing
[22:57] if you're not. The 70% I'm not going to
[23:00] hit in my weekly limit here at 8 hours
[23:03] is thousands of dollars of inference
[23:05] that I paid for that I could have done
[23:07] that I didn't do. But again, I need to
[23:10] be realistic with you guys. In all of
[23:13] May on this computer, I did about $1900
[23:17] of inference. I didn't pay that
[23:19] obviously cuz I'm using the
[23:20] subscriptions with Cloud Code and
[23:22] Codeex. But this month, June, which
[23:24] we're only 17 days into, I'm at nearly
[23:27] $6,000 of usage. But that's just this
[23:30] computer.
[23:32] As I mentioned earlier, I'm using
[23:34] multiple computers. My Mac Mini has
[23:38] another $2,600
[23:40] of inference on it. I'm at 10 grand for
[23:42] the month across all of my machines. And
[23:45] that's on three of those $200 plans. Two
[23:48] Cloud Code one codecs. And I haven't
[23:50] used the second Claude code account
[23:52] since Fable was taken from us. That's a
[23:54] shitload of value that I'm getting given
[23:56] for relatively cheaply. To spend $600
[24:00] and get back 10 grand of inference, that
[24:02] means you can do a lot. And if you're
[24:04] not pushing loops to their limits,
[24:06] you're not using that as much as you
[24:07] could be. I've been having way more fun
[24:09] with loops than I expected to. And I'm
[24:11] curious if you guys will as well. Take a
[24:13] look at what you do when you're done
[24:14] prompting. see what additional steps you
[24:17] take and ask the model, can you do this?
[24:20] You might be surprised at what it's
[24:21] capable of. I know for a fact that I was
[24:23] very surprised myself. What I'm trying
[24:25] to say here is that loops are cool, not
[24:26] because the technology or the mindset's
[24:28] really cool, but the idea of letting
[24:30] agents do more is unbelievably powerful.
[24:33] You take anything from this video, it
[24:35] really should be that. Ask your agent to
[24:36] do the next step and see if it impresses
[24:38] you. I know it impressed me. Let me know
[24:41] how it goes. And until next time, peace
[24:43] nerds.