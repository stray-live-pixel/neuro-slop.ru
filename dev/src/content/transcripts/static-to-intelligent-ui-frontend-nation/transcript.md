[00:01] [music]
[00:04] >> All right, so let's start. I'm quite
[00:06] excited. So,
[00:09] the talk, the next shift in front-end
[00:11] engineering.
[00:12] So, over the last 20 years,
[00:15] I can say front-end engineering has gone
[00:17] through multiple transformations.
[00:20] I can say like we moved from static
[00:21] website to dynamic applications, and
[00:24] then from dynamic applications to highly
[00:26] interactive experiences. And today we
[00:28] are entering into another shift. And
[00:31] that's the shift where interfaces are no
[00:33] longer just screen that user interacts
[00:36] with, you know, the time and shift has
[00:37] everything changed, and that's what I
[00:38] want to talk about. They are becoming
[00:40] systems that understand intent, provide
[00:43] guidance, and collaborate with users.
[00:46] Today, I want to share what I have
[00:48] learned while building products in the
[00:49] new era. Not about one framework, not
[00:52] about one product, not about AI hype.
[00:54] So, it's all about new user experience
[00:57] that are changing when AI becomes a part
[00:59] of product experience.
[01:01] So, let's move next.
[01:03] Yeah, so why am I here today? It's
[01:06] always been pleasure to be part of
[01:07] front-end nation.
[01:08] So, today's talk is not about AI models.
[01:11] It's not about prompt engineering, and
[01:13] it's definitely not a talk about
[01:14] replacing developers. Over the years,
[01:17] through open source communities,
[01:19] conferences, and product building, I've
[01:22] had thousands of developer
[01:24] all around the world. And recently, you
[01:27] know, I noticed something interesting,
[01:29] you know, AI is not just changing how we
[01:31] build softwares. It's changing how user
[01:34] interact with the softwares. It's not
[01:36] about UI, it's not about UX. It's all
[01:38] about interaction. That's where I want
[01:40] to, you know, keep more highlight within
[01:42] these two days' talks. So, what happens
[01:44] to user interface when AI becomes part
[01:47] of product experience? Experience.
[01:48] That's the real question. Because when
[01:50] that happens, many of the front-end
[01:52] patterns we relied for on the years will
[01:55] start to change.
[01:58] Speaking of my
[01:59] speaking about me like before we jump
[02:01] into a little context about me for more
[02:03] than two decades, I've been building
[02:05] products, contributing to open source,
[02:08] and growing developer communities all
[02:09] around the world. But
[02:12] I'm not here as a theorist I can say and
[02:15] here more like a practitioner, you know,
[02:16] someone actively building products where
[02:19] AI is already changing how you use it
[02:21] and interact with software. So, that's
[02:22] what I want to build today.
[02:25] Now, my journey with open source has
[02:27] always been interesting. This year I
[02:29] mean like this journey with open source
[02:31] really taught me that community doesn't
[02:33] just make you a better developer.
[02:35] Actually, it makes you a better
[02:36] entrepreneur. It makes you a good leader
[02:39] and also build it on top of it. So, what
[02:41] this journey taught me is like community
[02:43] enhanced my entrepreneurship skills and
[02:46] three core lessons which I learned out
[02:47] of this community is like people come
[02:50] before the platforms, trust come before
[02:52] the direction, and consistency comes
[02:55] before success. These are the three core
[02:56] pillars which I learned. And as a bonus
[02:59] I can say from this community
[03:02] I learned faster. I also failed faster.
[03:05] I made my mentors. I stayed strong and I
[03:08] grew with confidence. So, this is what
[03:10] my journey with open source is all
[03:12] about. And about like contribution me
[03:16] along with my team, these are not just
[03:17] the numbers which I want to present like
[03:19] an achievement, but the real achievement
[03:21] for me was like the conversations behind
[03:24] it like every product I can say every
[03:26] package, every event, community like in
[03:28] in the news and everywhere. It that was
[03:31] the initiative, you know, that exposed
[03:33] us to thousands of developers and to go
[03:35] through real world problems. So, you
[03:37] know, after seeing the same challenges
[03:39] again and again, we started noticing
[03:41] that something interesting and then that
[03:43] was the way users interact with software
[03:45] that has been changing over the period
[03:47] of time.
[03:48] So, that was just like a little context
[03:51] to everyone.
[03:52] Now, we are entering into phase two,
[03:54] which is uh the heart of the talk.
[03:57] So far, we talked about the journey.
[03:59] Now, let's talk about the shift. The way
[04:02] we build software is changing, but more
[04:04] importantly, the way user interact with
[04:07] software is changing. So,
[04:10] static UI versus intelligent UI.
[04:13] This is the main core pillar of today's
[04:15] talk, where I'll present that how
[04:16] intelligent UIs can be built. So, front
[04:19] end has never been static, as we know.
[04:21] We move from static websites to dynamic
[04:23] applications, from dynamic applications
[04:26] to mobile first experiences, from mobile
[04:28] first experiences to component driven
[04:30] development. So, that has been, you
[04:32] know, entire shift, and now we are
[04:34] entering into another shift. For years,
[04:37] interfaces were built around actions.
[04:39] Actions like click, search, fill a form,
[04:43] navigate, and then user does the work.
[04:45] But, intelligent interfaces work
[04:47] completely differently. User expresses
[04:50] the intent, the system understands the
[04:52] context, and the interface suggests
[04:55] actions. And humans at the end will stay
[04:57] in control.
[04:58] So, that's the real shift, where the
[05:01] entire front end and entire migration is
[05:04] happening. The front end is no longer
[05:06] just presenting information. It's
[05:08] becoming orchestration layer between
[05:11] human intent and system capability. That
[05:14] is where static UI versus intelligent UI
[05:16] comes into the picture.
[05:18] Now, intelligent products don't appear
[05:21] out of nowhere. They emerge when three
[05:23] forces work together: people,
[05:26] community, and products.
[05:29] People create ideas, community validates
[05:32] ideas, and product scale ideas. When
[05:35] these three state connected, innovation
[05:37] happens much faster. And that's exactly
[05:41] how next generation or of interfaces
[05:43] being built. So, I made like the people
[05:45] are I can say the real actors. The crew
[05:48] is community and the end product is the
[05:50] final movie. So, these are the three
[05:52] action forces because of which, you
[05:54] know, intelligent products are created.
[05:57] So,
[05:58] today I'm not going to talk about the
[05:59] product which we created, but I I want
[06:02] to give that as an example so that you
[06:04] can connect that how intelligent
[06:06] interfaces are being created. So, across
[06:08] the conference, across the meetups,
[06:10] across the developer communities, I kept
[06:12] hearing the same frustration. It was
[06:13] like, "Too much setup is going, too much
[06:16] repetition is going, too much time spent
[06:18] behind building the same patterns again
[06:20] and again." But, what caught my
[06:21] attention was not the problem itself.
[06:24] Actually, it was how developer wanted to
[06:26] interact with tools. They didn't want
[06:28] more buttons. They wanted to have easy
[06:31] interface, easy to edit, and wanted to
[06:33] have complete outcome. And that's what
[06:36] we found as a different mindset. So,
[06:38] pain was repeated and then we thought
[06:40] that let's try to create something as
[06:42] part of community loop, I can say. So,
[06:45] maybe it was not my pain. It was like
[06:47] acceptance to find a solutions out of
[06:49] everyone. And then we tested with like
[06:51] one simple idea, not a product, not a
[06:53] feature list, just a question. What if
[06:55] software could move closer to the intent
[06:58] instead of forcing users to workflow?
[07:00] So, the response was, you know, quite
[07:02] immediate that let's do it and that told
[07:05] us something important. Developers were
[07:07] ready for different way of interacting
[07:08] with software. What interested me was
[07:10] not the adoption, but it was the pattern
[07:13] behind the
[07:14] adaptation. And for years, user learned
[07:16] the system. Then, we did like one wait
[07:19] list and then we found that a lot of
[07:21] people are looking for the same thing
[07:23] and then we thought that how about we
[07:24] created it?
[07:26] So, before we move forward, I I don't
[07:28] want to go much in product because I
[07:29] want to show you more about the
[07:31] interactive and interactions behind it.
[07:34] Also, the architecture and front-end
[07:35] designs, but to give you an idea, I
[07:37] would like to play 1 minute of video
[07:39] which will give you an idea and then
[07:41] we'll go back to the product itself.
[07:43] So,
[07:44] what's important here is not the
[07:46] product, it's the interaction model. So,
[07:48] let's look at what actually makes
[07:49] experience like
[07:54] >> [music]
[08:02] [music]
[08:07] [music]
[08:14] [music]
[08:23] [music]
[08:28] [music]
[08:32] [music]
[08:38] [music]
[08:43] [music]
[08:51] [music]
[08:56] >> Okay, so let's go in real.
[09:00] Let me share my screen once again. Okay.
[09:04] So, this is the home page. We don't want
[09:07] to go more in detail about the product
[09:10] because it's just a video which gives
[09:11] you an idea. But, let's create something
[09:14] real time, something in real.
[09:16] So, I was thinking that how about we can
[09:19] create like Front End Nation kind of
[09:20] conference with one feature like about
[09:23] voting system with a good UI, with
[09:26] vibrant gradients, with smooth
[09:27] animations, and also let's create an
[09:29] admin panel through which you can get an
[09:31] idea about unique visitors, top
[09:32] speakers. So, let's build something in
[09:35] real. So, let me just think.
[09:39] Okay, then I just created a simple
[09:42] prompt. So, it mentioned that build a
[09:44] modern conference speaker voting website
[09:46] inspired by Frontend Nation featuring a
[09:48] premium dark theme, vibrant gradients,
[09:51] like a
[09:52] glassmorphism UI, smooth animation, and
[09:55] a full responsive design. Display all
[09:56] speakers in a grid. So, I just made a
[09:59] simple prompt because we don't have much
[10:01] time to write a prompt, but I just
[10:02] wanted to be more specific because I
[10:04] also want to create an interactive UI
[10:06] and admin panel as well. So, now I'll go
[10:09] with build or let's create a prototype
[10:11] and then here we have different options.
[10:14] We can create build as well.
[10:16] And then we hit the button.
[10:19] So, here you can see it started
[10:21] containing, installing Laravel
[10:23] framework, building your project
[10:24] containers, like creating separate
[10:27] rooms, and then it's setting up your
[10:29] secure network, creating data storage
[10:30] spaces around application file.
[10:33] So, you know, there are different steps.
[10:34] Setup is done. Now, the build is in
[10:36] progress. That is happening real time.
[10:38] That's the power of the product itself.
[10:41] Now, the configuration is taking place.
[10:42] So, the progress is there. The project
[10:44] is being made and the launch. So, once
[10:47] the launch is done, then it will start
[10:49] creating the files.
[10:51] So,
[10:52] as you can see now it's thinking. Now,
[10:55] the build mode is there, then the code
[10:57] generation will take place.
[11:02] So, I think let it just create. As you
[11:05] can see, it's modifying web.php
[11:08] file and code generation has started.
[11:11] It will take a couple of minutes to
[11:12] build it.
[11:14] So, meanwhile it builds, I think you can
[11:17] see the code as well. All the code is
[11:19] also being generated.
[11:21] The previous there. So, let it create
[11:23] it. Meanwhile, I'll go back to
[11:26] the presentation.
[11:28] So, we'll just wait for like several
[11:31] minutes and
[11:33] we'll see what it creates.
[11:37] Okay.
[11:40] Now, meanwhile it is creating the
[11:43] application itself, let's go and think
[11:46] about how the architecture works and
[11:48] then we'll go with like creating
[11:50] components or making the libraries. So,
[11:53] today users don't just want to click
[11:55] through complete complicated flows. They
[11:57] want to express what they want to get
[11:59] closer to the outcome. That's where
[12:01] Laracopilot fits. It helps move front
[12:04] end from static UI to intelligent UI.
[12:06] So, in this diagram you can see like 1 2
[12:08] 3 4 5. These are the steps. So, it's not
[12:11] about the product itself. In case, for
[12:13] example, if you also want to build
[12:16] something on your own instead of static
[12:18] just creating dynamic components, you
[12:20] can use these flows. So, instead of only
[12:23] building interfaces where users do all
[12:25] the work,
[12:26] the AI itself with the help of product
[12:28] create interfaces where system
[12:30] understands intent, suggests actions,
[12:33] supports visual editing, and connects
[12:35] the front end back end integrations and
[12:37] deployments at the same time.
[12:39] So, I can see in the other tab that it's
[12:41] already generating files.
[12:43] So far front end developers, Laracopilot
[12:45] the product is not about replacing
[12:47] creativity. It is removing repetitive
[12:49] work,
[12:50] boiler plates, and set of frictions. So,
[12:52] developers can focus more on experience,
[12:55] flow, usability, and product quality.
[12:58] That's the reason which matters because
[13:00] we want to make it front end more simple
[13:02] and it's not just about front end, but
[13:04] front end is no longer just about how
[13:06] app looks. It's about how intelligent
[13:10] intelligently the app helps the user
[13:12] move from idea to outcome.
[13:16] Now, let's move to the next phase. So,
[13:19] in first phase it it was introduction,
[13:21] then it was all about product in which
[13:23] you can create your entire web app. Now,
[13:26] about static UI to intelligent
[13:28] interfaces. I would like to
[13:30] give a few ideas to you. So, for those
[13:32] who are online, I would recommend them
[13:34] that you can scan the QR or you can take
[13:36] a picture and then you can just see it
[13:38] later on.
[13:39] But I thought that, you know, that that
[13:41] is another heart of the heart of the
[13:44] talk that instead of creating static
[13:47] image, how about let me present you the
[13:49] intelligent interface which is built
[13:51] using AI intelligence only.
[13:54] So, let me explain what exactly we
[13:56] created
[13:57] via intelligence
[13:59] UI. So,
[14:01] I'll just
[14:03] share you
[14:05] the city map.
[14:07] Okay.
[14:09] So, welcome
[14:12] to your own city map. So,
[14:16] this is the orchestration of how
[14:18] actually we work internally and we
[14:20] created our own workflow like our own
[14:22] city after dark. So, it's a hyper real
[14:25] working model. So, instead of creating
[14:27] it static, we thought that how about we
[14:29] create it complete dynamic. So, let's
[14:31] start the tour.
[14:33] Okay, so here it is.
[14:36] So, this is entire orbit. This is one of
[14:39] our internal way that how actually our
[14:41] entire development works internally,
[14:43] which I thought to create using dynamic
[14:47] UI so that, you know, in modern days
[14:49] that is also another classic examples
[14:51] that instead of static UI, how you can
[14:55] create dynamic intelligent UIs which,
[14:57] you know, can create a complete
[14:58] different aspect. That's where the
[15:00] modern web engineering takes place. So,
[15:03] this is the orbit. So, as you can see,
[15:05] you can see all different
[15:08] layers, all different buildings. It's a
[15:10] marketing headquarters, somewhere it's
[15:12] like GPU reactors, all different layers
[15:14] in the orbit. And you can also look from
[15:16] the top down. You know, it's an
[15:17] interesting where you can see
[15:18] everything. So,
[15:20] we can go in depth, but I don't want to
[15:22] go in depth on each layer, but let's see
[15:25] that let's take a tour.
[15:27] So, we're going to take a tour of one of
[15:29] the feature. Okay, let's see that how we
[15:32] ship a feature. So, this is
[15:35] uh the interactive UI and at the same
[15:37] time we have our agent X in the back
[15:39] end, which helps us to create building
[15:42] the system. So, the agent X uses the
[15:45] same model using the same tool, which
[15:48] you know, I'll give you an idea.
[15:50] So,
[15:51] the first step is
[15:53] your request becomes your user story.
[15:55] So, that's our first tower, where you
[15:57] can see on the right side that your
[15:59] conversations converted into a story and
[16:02] then the user story will convert it into
[16:03] a request and then it will go to the
[16:06] agent.
[16:08] Next
[16:09] is
[16:10] architecture part. So, the architecture
[16:12] is decided. That is where agent will
[16:15] produce the C4 and you know, it will get
[16:18] more ideas that what kind of
[16:20] architecture it has to be done. The
[16:21] business analyst will come into the
[16:22] picture. So, these are also, you know,
[16:24] multiple skills across multiple agents
[16:26] are created in the back end. So, the
[16:28] architecture once it's decided, then it
[16:31] will go to task decomposition layer. So,
[16:33] in this exactly the entire architecture
[16:36] is done, analysis is done. Now, all the
[16:39] task are converted into different
[16:40] splits. This is how actually agent X
[16:42] works in the background. So, in this
[16:45] it breaks into different roles, which
[16:47] leave task into estimates, acceptance
[16:50] criteria, and dependencies. Then,
[16:53] the next model comes where the real
[16:56] development happens, which is your
[16:57] developer swarm. So, developer swarm
[17:00] will decide that which model has to be
[17:02] done, which kind of AI has to be done,
[17:05] which LLM has to be done, and then this
[17:06] development swarm will start developing
[17:09] the code. This is where real engineering
[17:11] comes into the picture.
[17:13] And then this will become the validation
[17:16] quorum. You must be thinking that this
[17:18] looks more like animation, but in real
[17:21] this also works in the background in the
[17:22] same manner.
[17:24] But it's more like programming point of
[17:25] view, so I thought that in this talk
[17:27] instead of stating how about I created
[17:31] more like a dynamic so that you can
[17:33] connect that how dynamic or how
[17:35] intelligent UI works.
[17:36] So, in this we have like a different
[17:39] kind of checks,
[17:40] whether like everything is done okay,
[17:42] not okay, CICD code quality, ADR,
[17:46] everything will come into this part.
[17:48] And then it will go next to your CICD
[17:51] packages
[17:52] where
[17:53] the entire deployment takes place. And
[17:55] once the entire deployment takes place,
[17:58] then it is your production. So, this
[18:01] entire is a complete tool which I can
[18:04] say is an orbit. And this is the orbit
[18:06] which gives an idea that how the
[18:08] development happens in the back.
[18:10] So,
[18:12] let's go back in slides.
[18:15] Let me share my screen again.
[18:21] Okay.
[18:24] Now, behind the screens, I want to show
[18:27] you that how the architecture and what
[18:30] are the meaning points behind it.
[18:31] So, let me quickly show you that how the
[18:34] product works behind the scenes. So, we
[18:36] have different layers like first is AI
[18:38] layer which understands the idea.
[18:41] Then the product generation layer which
[18:42] creates a front end, back end, and
[18:44] database all together.
[18:46] Then it's a web container which gives an
[18:48] instant live preview.
[18:50] That preview will give you an idea of
[18:52] the app immediately. And then it comes
[18:54] the deployment layer which helps us to
[18:56] ship the product as a real hosted
[18:58] output. And that's where as a product
[19:00] combination of this all layers will make
[19:04] it complete dynamic web app. So, it's
[19:06] not about generating UI, it connects the
[19:08] full journey like from front end to back
[19:10] end to preview, to editing, to
[19:12] interactions, and to deployment. So,
[19:14] this is how actually entire
[19:17] Copilot product works. So, for the
[19:19] front-end teams, this shift is pretty
[19:20] clear that from building static screens
[19:23] to building live full-stack product
[19:25] experiences. That's what happens in the
[19:27] background. So,
[19:33] now
[19:34] let me give you an idea that how
[19:35] real-time integration works. And then
[19:38] we'll go and have a real look within the
[19:48] >> [music]
[19:56] [music]
[20:04] >> Everything is in the same time, and the
[20:06] code is also generated [music] in the
[20:07] same
[20:08] way.
[20:09] Actually, we recently
[20:12] Yeah, yeah.
[20:14] Okay. So, in the video it was, yep.
[20:18] Then, just give me a moment.
[20:22] And then few examples, but before
[20:25] we go to examples, let me show you in
[20:28] real let's do a real testing.
[20:31] So,
[20:32] uh let's see where the
[20:36] programming where the page is being.
[20:38] Just give me a moment.
[20:43] What's happening around? Okay, so it's
[20:45] still generating.
[20:47] So, the page preview is already
[20:48] happening, but we can go
[20:51] we can go more in apps.
[20:53] So, for example, I build the same.
[20:57] So, here as you can see
[21:00] you can build it. Just give me a moment.
[21:02] I think I shared my screen already. Yep,
[21:03] it's already done.
[21:06] So,
[21:08] as you can see what it built from the
[21:10] same prompt. This is speaker board.
[21:13] You can see it. You can scroll down.
[21:17] And then you can upvote.
[21:20] You can upvote here.
[21:22] You can vote.
[21:24] So, it's work like this.
[21:26] At the same time, you can see the code.
[21:28] Now in preview,
[21:31] we have visual edit.
[21:32] So, here for example,
[21:35] you can change the color,
[21:37] opacity, you can change the background.
[21:39] So, you know, it's happening at the same
[21:41] time.
[21:42] And then you can save the changes.
[21:45] So, that's what happens, you know, it
[21:46] changed the code at the same time.
[21:49] It changed the preview.
[21:51] It uses visual edit. This is exactly
[21:54] what I wanted to present today that how
[21:55] from static UI you can create your
[21:58] dynamic app. So, what happened right now
[22:01] that your entire prompt created this
[22:03] entire preview.
[22:05] That preview has dynamic features. That
[22:08] features
[22:09] has already code done, which you can
[22:11] save, which you can sync with GitHub. At
[22:14] the same time, you can see the preview.
[22:16] At the same time, you can edit the
[22:18] preview.
[22:19] Like through visual edit, like here you
[22:21] can do whatever you want to do. You can
[22:22] change. You can do the typography. I
[22:24] mean like there are a lot of other
[22:25] features which you can do as well.
[22:27] So, it's you know, your complete visual
[22:29] editor from front-end developers. So,
[22:31] without writing single line of code,
[22:33] everything is there in front of you.
[22:35] Also, not only that,
[22:37] but uh discard.
[22:40] You know, the same prompt actually
[22:42] created admin panel as well. So, let me
[22:44] type admin@
[22:48] .com.
[22:50] admin123
[22:55] So, okay. So, that's it. So, what
[22:58] happened that just right now we created
[23:00] a prompt. We have the code, we have the
[23:03] front end, we edited the front end with
[23:05] a visual edit, the code is
[23:07] deployed, the code is changed at the
[23:09] same time you also have a admin panel in
[23:11] which you have the numbers, you have the
[23:13] speakers details about the up vote, down
[23:16] vote, vote analytics, everything all
[23:19] together
[23:20] just at the same time. And at the same
[23:22] time your code is being deployed. So
[23:24] from just writing a single prompt, here
[23:27] also you can just see the code,
[23:29] everything is there like from public,
[23:31] from routes, from views, admin, layout,
[23:34] speakers, index blade. So what happened
[23:38] that we are
[23:40] keep shipping more and more features,
[23:42] but recently we shipped a features
[23:44] because I just wanted to present
[23:45] something different apart from just
[23:47] creating a full stack web app, I wanted
[23:48] to present that how dynamic UI can be
[23:50] generated at the same time without
[23:52] writing single line of code. That's the
[23:55] power of AI and that's the power where
[23:57] from static UI you can generate dynamic
[24:00] templates. So
[24:02] let's go back in presentation.
[24:07] So
[24:08] okay.
[24:10] Now few examples.
[24:13] So
[24:14] you can scan, you can just look over the
[24:16] project gallery.
[24:19] And then in project gallery
[24:22] I think if you can see, these are like
[24:24] some of the projects.
[24:27] These are the projects which like you
[24:29] can try like you can create games, you
[24:31] can create examination portal, you can
[24:32] create courses, the fitness apps, art
[24:35] gallery, AI native OS.
[24:37] So the best part is that you just write
[24:39] a prompt, you make a project, you edit,
[24:41] you change colors, you make your dynamic
[24:44] UI without writing single line of code.
[24:46] So every project has its own, you know,
[24:50] its own features. So for example
[24:52] here it is grow your wealth with
[24:54] confidence.
[24:55] And the same thing you can edit as well.
[24:59] So,
[25:00] coming back.
[25:02] >> [sighs]
[25:08] >> So, these are couple of examples which I
[25:10] just want to present.
[25:12] So, at last, as you have seen that how
[25:15] from a single prompt you can completely
[25:17] create dynamic UI and also edit. So, for
[25:20] us it's I mean like this product as a
[25:21] Laravel Co-pilot, it's not just point of
[25:23] this talk, it's about the proof of
[25:25] something bigger. So, most products
[25:27] start with features and search for
[25:28] users. Here we started with users and we
[25:30] waited for features and that's how
[25:32] actually we enjoy being part of it.
[25:36] So, at last,
[25:37] I just want to say
[25:39] consistency is the ultimate superpower.
[25:42] Nothing starts big, it starts with a
[25:44] small step. The world does not need more
[25:46] observers, it needs people who show up
[25:49] again and again. Nothing big happens
[25:51] overnight, it happens when you don't
[25:53] quit.
[25:55] So, if you are building any of this,
[25:58] you can connect with me on my website
[26:00] vishal.life and you can also scan this
[26:04] QR code. You can get in touch with me if
[26:06] you want to build something. We are
[26:08] always there. If you're a front-end
[26:09] engineer, you want to you you have your
[26:11] own idea, then you're most welcome.
[26:15] So, with this note, I can say that
[26:16] everything you have seen today starts
[26:19] small
[26:20] and
[26:21] when you think and when you implement,
[26:23] everything happens for a reason.
[26:25] So,
[26:26] thank you very much.
[26:27] Thank you for
[26:29] being here. Thank you for being part of
[26:31] my talk.