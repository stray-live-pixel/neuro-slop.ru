[00:01] [music]
[00:04] So today the workshop uh on generative
[00:08] UI building apps that compose themselves
[00:11] we're going to go through on a very what
[00:14] genui is. I'm going to call it genui
[00:16] from now on because I find generative
[00:19] over and over again is pretty tricky.
[00:22] Um, so, uh, for those of you that don't
[00:24] know me, I think you saw a little
[00:26] introduction video at the start of, uh,
[00:28] the conference today, name's Alan,
[00:30] technical education lead at
[00:32] Bitterbrains. Um, last year I sold my
[00:37] company
[00:38] and I'm lucky enough to be part of the
[00:40] amazing team at Bitterbrains
[00:43] working on Unlearn, which is um, an
[00:45] incredibly exciting project and I'm
[00:48] really excited to be part of this. uh we
[00:50] are pumping out content and we're really
[00:53] excited about featuring developers
[00:56] within this AI area era that we're in at
[00:59] the moment and beyond as well. So um
[01:01] yeah, feel free to go ahead and follow
[01:02] me, hit me up with any questions you
[01:04] have, even if it's after the conference
[01:07] and um I'm always happy to talk about
[01:09] anything to do with AI workflows,
[01:11] anything like that. So let's take a
[01:14] quick look at the agenda today. Um, just
[01:17] before we do start, we had a little bit
[01:19] of an issue with the prep guide going
[01:22] out for the workshop today.
[01:25] If you're a little bit too late for this
[01:26] and you don't want to go ahead and go
[01:28] through the ex, but that should have
[01:29] landed in your inbox now. So, you can go
[01:31] ahead and start uh prepping for the
[01:34] exercise one and two, which we're going
[01:36] to be doing throughout the workflow uh
[01:37] throughout the workshop. uh like having
[01:41] with that you are going to get a huge
[01:43] amount of value out of this workshop
[01:44] even if you don't go through the
[01:46] exercises
[01:48] um so I can see that the connection is
[01:51] going on and off so let me just make
[01:53] sure everything is looking good
[01:57] let me just try and switch over here to
[01:59] see if we can better
[02:03] okay I'm going to continue and uh
[02:05] Maria's going to let me know if there
[02:07] are any issues uh ongoing issues So
[02:10] yeah, I'm really sorry.
[02:14] Okay, so um hope you haven't missed too
[02:17] much just my introduction, but we're
[02:19] going to go through the agenda uh now.
[02:21] So uh just to repeat if anyone missed
[02:24] it, uh the prep guide went out a little
[02:26] bit late. Um so if you want to go ahead
[02:29] and follow through with the exercises
[02:31] that we're going to do throughout the
[02:32] workshop, um feel free to go ahead and
[02:35] check that prep guide if you haven't
[02:37] already. If you don't have time to do
[02:40] the follow the prep guide and if you're
[02:41] not going to be able to follow the
[02:42] exercises, don't worry. You're going to
[02:43] get a huge amount of value out of the
[02:45] workshop anyway um because I'm going to
[02:47] be talking a lot about what Gen UI is
[02:49] and we're going to do some codebased
[02:51] exploration as well.
[02:53] So, the first thing that we're going to
[02:55] cover is what Gen UI is. Um we'll talk
[02:58] about where it's useful. Then we're
[03:00] going to dive into the two pre-made
[03:02] projects that I have for you today. And
[03:04] that will allow us to actually look at
[03:07] uh how Gen UI works within an
[03:09] application. These are both view
[03:11] applications built slightly differently.
[03:13] Um and we'll see them later. Then we'll
[03:16] jump into exercise one where you can
[03:18] either take a break or follow through
[03:19] with the exercise. And then we're going
[03:21] to look at a slightly more advanced way
[03:23] to work with Gen UI and that is tool
[03:26] calls and props. and we'll look at a
[03:28] second uh demo application where you go
[03:31] go into the exercise and you can uh you
[03:34] can play around with the code and and
[03:36] add stuff. We'll jump to a debrief and
[03:39] then we'll go to a Q&A as well. So, just
[03:42] before we get started, if you do have
[03:44] any questions along the way, please feel
[03:45] free to add them into the chat. Um if uh
[03:49] don't please don't worry about, you
[03:50] know, any questions at all and I'll do
[03:53] my best to answer them. Um, and if you
[03:56] have any questions or if you're stuck
[03:57] with anything with the actual exercises
[03:59] and if we don't have time to answer
[04:01] them, feel free to ask me after the
[04:05] conference. So, the first thing we're
[04:08] going to cover is what uh is generative
[04:11] UI.
[04:13] Basically, it's a UI that adapts to the
[04:16] user instead of the user adapting to the
[04:19] UI. So, different UIs for different
[04:22] users when it makes sense. There are
[04:25] tons of examples of this that we use
[04:27] every single day that we probably don't
[04:29] realize that we're using. So, we're
[04:31] going to look at a couple of real world
[04:33] examples of this, but it's essentially a
[04:36] way to instead of just having a fixed UI
[04:38] for every single user, we take things
[04:41] like their prompt, so for example, what
[04:43] they're asking for or the context around
[04:46] what they are doing within your
[04:48] application or any data you have on them
[04:51] and we change the UI using AI. So rather
[04:55] than talk about what this is, let's go
[04:58] ahead and look at a
[05:01] uh sort of demo of this. So imagine
[05:04] you're building an application where you
[05:06] are asking someone they uh where they
[05:09] want to travel to. Basically, they're
[05:11] planning some sort of trip or you're
[05:13] building a dashboard or anything like
[05:15] that that you get complex if statements
[05:17] and tend to get into a mess with. And
[05:20] you start off with something like this.
[05:22] you show a particular panel or a
[05:25] navigation item or something like that
[05:27] under some kind of condition and you
[05:29] probably have an else as well or another
[05:31] if statement next to it. Then uh as your
[05:35] dashboard or whatever you're building
[05:37] gets more complex, you have another if
[05:39] statement within another panel to show
[05:41] something. Um then you have something
[05:43] else. An example I like to think of is
[05:46] booking a trip with children with
[05:48] everyone having different like dietary
[05:50] requirements or something because you
[05:52] might want to uh show specific
[05:55] restaurants. Let's say you have uh two
[05:57] children. Uh you're going to want to
[05:59] show sort of activities for children. It
[06:01] could be anything here. So you basically
[06:03] end up with all of these tiny variables.
[06:06] weather, uh, travel, budget, how to get
[06:10] there, all of this kind of stuff, or or
[06:12] travel within the country that you're
[06:14] traveling to, and you end up with a huge
[06:15] mess. So, basically, it's just really
[06:18] difficult to build intelligent
[06:19] interfaces with a bunch of if
[06:21] statements. And that is what if
[06:23] statements lack. They lack intelligence.
[06:25] We could add as much complexity as we
[06:28] want to this to make it look like it's
[06:30] designed for a person, but we can never
[06:32] truly make it that intelligent. I'm just
[06:35] going to check in on the uh [laughter]
[06:38] the uh stream as well. And it looks
[06:40] good. Okay. So, yeah, a bunch of if
[06:43] statements lack intelligence. And to be
[06:45] really clear, GenUI isn't about killing
[06:48] this uh these complex conditionals. Uh
[06:50] it's a really nice side effect of this.
[06:53] This isn't the goal. We're not going to
[06:55] start to use AI just to get rid of if
[06:57] statements within an interface. Uh it's
[06:59] about intelligently composing what the
[07:01] user sees and about personalizing
[07:03] experiences and the UI and the UX of an
[07:06] application using AI. So we are going to
[07:10] jump in again rather than me just
[07:12] talking about it and look at a demo. And
[07:15] the first demo probably will surprise
[07:17] half of you and not surprise the other
[07:20] half. And that is Google. So let's go
[07:22] ahead and open up Google. And we're just
[07:25] specifically going to come to AI mode.
[07:27] There are hints of Gen UI in in Google
[07:30] elsewhere. Uh but let's just take a look
[07:32] at this. So we've got a couple of um
[07:34] suggested uh queries here. One of them
[07:36] is running routes near me within a 5K
[07:39] loop. Now when we put forward a query
[07:42] like this or I want to buy a camera, can
[07:45] you recommend me some cameras or you
[07:47] know anything like that, we don't expect
[07:49] to get a wall of text and we certainly
[07:51] in this day and age don't expect to get
[07:53] a load of links that we then have to go
[07:55] through. So you can already imagine
[07:57] what's going to come through here. We've
[07:59] got a list of the things that we can
[08:01] click on. It gives us information about
[08:03] each of these uh and we get a little bit
[08:06] more more context. Same for if I want to
[08:08] buy a camera, so like best cameras or
[08:11] something like that. Now in stark
[08:14] contrast to this, if I for example come
[08:17] in and I want to get an answer to a
[08:20] really simple sum or a complex sum, but
[08:22] it works either way. What would we
[08:24] expect here? Well, again, we wouldn't
[08:26] expect anything else but the answer to
[08:30] this sum, which it sounds really, really
[08:33] simple, but actually what's going on
[08:35] behind the scenes here is it's working
[08:36] out what it needs to show to the user
[08:38] based on the context. Um, and this
[08:41] doesn't need to be a prompt like this or
[08:42] a search query like this. We'll see
[08:44] other examples of this through the
[08:45] workshop, but as you can see, it's
[08:48] pretty self-explanatory.
[08:51] So, another example of this which is a
[08:54] little bit more complex
[08:56] in terms of what it displays is the uh
[09:00] very good life goal simulator. So, let's
[09:03] go over to this just here and let's get
[09:06] started. So, I'm not going to go through
[09:08] all of this, but essentially this is
[09:09] just going to help you plan stuff out,
[09:11] whether it's like finance, uh you know,
[09:14] saving things up uh or anything like
[09:16] that. So I went through this earlier and
[09:18] I basically ended up with going through
[09:20] asking a load of qu ask me a load of
[09:23] questions and it gave me like a
[09:25] pre-planned or uh a custom plan
[09:29] dashboard with a budget breakdown. Uh
[09:31] obviously this is all fake data but all
[09:33] of this stuff has been created
[09:36] specifically for me. Now, that's really
[09:38] cool. But also where Genui comes into
[09:41] this is let's say we don't want to focus
[09:43] on everyday spending, housing, and fixed
[09:45] costs or anything like that. Let's say
[09:48] I'm planning
[09:50] for a wedding.
[09:53] And I go ahead and hit next. Now, that
[09:56] isn't something that fits into the
[09:57] existing stuff within this particular
[10:00] app. So, what it's going to do is it's
[10:02] going to create out custom fields for
[10:04] me. It's going to give me like a wedding
[10:06] budget here. So, I can go ahead and uh
[10:09] choose this. Obviously, you wouldn't do
[10:10] that expensive. Um, but yeah, so this is
[10:12] highly customized and this is genu. So,
[10:15] this is a really good example. Um, and
[10:17] I'll link to this a little bit later if
[10:19] you want to go ahead and have more of a
[10:21] look.
[10:22] So, the basic flow here is that we
[10:26] prompt with context and a set of
[10:29] components we want to show. So in the
[10:32] example of Google, it's obviously more
[10:35] complex behind the scenes, but 5 + 5,
[10:37] our agent that we are sending this
[10:40] request to works out that this is a sum
[10:44] and therefore it's just going to show a
[10:45] very basic component over here. So
[10:47] really, really simple. The model picks
[10:49] the components and then the components
[10:51] render out on the page with some data.
[10:54] So basically, we're asking AI, what
[10:58] should I show the user? It can get more
[11:00] complex than this like in what order
[11:01] should I show it or which columns should
[11:04] I create. You can go absolutely wild
[11:06] with this. So we're now going to go in
[11:08] and uh just before we go on to the first
[11:10] exercise, we're going to go into some
[11:12] codebased exploration just to see how
[11:14] this looks in practice. Don't worry if
[11:16] this doesn't make sense or if you're not
[11:17] a Vue developer. We're going to look at
[11:19] a ton of other examples later. So like I
[11:21] said, you will get um as much benefit
[11:23] out of this depending regardless of the
[11:26] language you're working in. So I'm just
[11:28] going to jump into this demo. This is a
[11:31] demo that I built earlier and this is uh
[11:35] called Dashy. Now your task later is
[11:38] going to be to add a new card to this uh
[11:42] dashboard based on whether your role is
[11:45] marketing analytics or dev. And you can
[11:47] see the difference between whether it
[11:49] shows or not or also when it shows based
[11:52] on the week. Now again, this is just a
[11:54] really simple example of two variables
[11:56] here, but you can imagine that if you
[11:57] had a lot more variables than the role
[11:59] and the day, you can end up with some
[12:01] really powerful user interfaces. So just
[12:04] an idea of how this works. Let's say my
[12:06] role is marketing. I see my weekly goals
[12:08] with things that need to be done. Now on
[12:10] a Friday, that might look very
[12:12] different. And this top part obviously
[12:15] wouldn't be shown to the user. This
[12:17] would just all be implied. So when I
[12:19] regenerate the dashboard, uh you can see
[12:21] as well as the greeting that we get.
[12:23] This gives us um potentially the same
[12:26] components, but it gives us the more
[12:28] relevant components and it orders these
[12:30] in the right way as well. So we get a
[12:32] campaign performance here with what
[12:33] we're looking at, an email open rate,
[12:36] etc., etc. Now, the same for developers.
[12:38] If I'm a developer and I come over to a
[12:40] dashboard, of course, I want to see a
[12:42] completely new set of things. So I want
[12:44] to see open PRs. But we do have some
[12:47] things that are shared between different
[12:50] uh teams. So this is just picking out
[12:52] what is best for the variables that I
[12:55] have given in. Okay. So we're going to
[12:58] go over to the codebase now and just
[13:00] take a look at how this works. We're
[13:02] going to start over in this data section
[13:04] here. Um I'm just going to try and
[13:06] increase it as much as possible. So
[13:07] we're going to start over in this data
[13:08] section. So we we have just data. Now
[13:10] I've hardcoded this and we just have
[13:12] some really uh basic hardcoded roles and
[13:15] days but this data would likely come
[13:17] from like your database or again
[13:18] anything the user is giving you there
[13:20] and then maybe user settings. Now we
[13:23] have this data next to the widgets that
[13:27] we want to show. So we have a widget
[13:29] catalog. Um now next to these we kind of
[13:33] have a prompt. Now, we'll dive into this
[13:36] a little bit more later in a bit more
[13:38] detail, but effectively when we pass
[13:41] this widget catalog over to an AI agent,
[13:44] it needs to know what this actually
[13:45] does. And it can usually infer that by a
[13:47] name of a component. Campaign
[13:49] performance is pretty obvious, but we
[13:51] want to give the agent as much context
[13:54] or the model as much context as
[13:55] possible. So, we have some really basic
[13:57] descriptions here. So, we export these
[14:00] uh widgets. These map up nicely to the
[14:03] actual widgets that we have. Now, within
[14:05] this codebase, uh, these are like
[14:07] incredibly simple. They're all
[14:08] hardcoded. The data doesn't come from a
[14:10] database anywhere. They're just
[14:12] basically fake, which is fine for this
[14:14] demo. Um, and then what happens when we
[14:18] actually render out the dashboard? Well,
[14:20] at the top here, we have these
[14:21] components ready to go. So, when our
[14:24] model says these are the components that
[14:26] you should use for this specific
[14:28] context, we've got them ready. We have a
[14:30] widget map. Again, this is just purely
[14:33] for iteration purposes. And we have all
[14:35] the data that we need here. And then
[14:37] down here, we go ahead and we send a
[14:39] request over to the API. Wherever that
[14:43] lives, it doesn't matter. Now, let's
[14:45] take a real quick look at the API here
[14:46] because this is where the magic happens.
[14:49] We have a system prompt here, which is
[14:52] like any other prompt that you would
[14:53] send over to a model if you were
[14:55] integrating AI into one of your
[14:57] applications. So this says pick five to
[15:00] six uh five to seven widgets in the
[15:01] order they should appear. We give some
[15:04] basic guidelines. Simple as that. Now
[15:06] down here this goes ahead and I'm having
[15:09] happen to be using anthropic but you can
[15:11] use anything here and we'll talk about
[15:12] that uh for the exercise in a moment. We
[15:16] choose a model. I've happened to choose
[15:18] haiku here just because it's incredibly
[15:20] fast but you could use a more advanced
[15:22] model something more appropriate if you
[15:24] wanted to.
[15:25] >> Sorry to interrupt. You pass in the
[15:26] system prompt and a very basic prompt
[15:28] here. Design a dashboard for name which
[15:30] is me ro which would be today or today
[15:34] is the day today whatever day it is.
[15:38] >> And then we have this dashboard schema.
[15:41] So let's take a look at this real quick
[15:43] um over in this schema and we're going
[15:46] to look at some ZOD objects later but
[15:49] effectively we've built up an object
[15:50] here which is type safe because we know
[15:53] that when we get the data back from the
[15:55] model we need to it we need it to be in
[15:57] a very very consistent format. We want a
[16:01] greeting that come back from our model
[16:05] which is this and we want a list of
[16:07] widgets. So we want an array of widgets
[16:10] as objects with an id
[16:13] uh in this structure as well. So we will
[16:15] get this structure back every single
[16:17] time as we pass this over. And if we
[16:20] just take a look at the API here, we are
[16:23] using
[16:24] >> the versel AI SDK for this. It's
[16:28] incredibly easy to use and powerful
[16:31] limit specifically using this SDK. You
[16:33] can use absolutely anything.
[16:35] >> Okay. So as this all comes together, we
[16:38] land on this page. We send
[16:41] request over. We get back this data and
[16:44] what do we do with it? Well, in our
[16:45] case, we get back a list of ordered
[16:47] widgets.
[16:49] So let's have a look here. Yeah. Um
[16:53] Oh, okay. Let sorry, let me just share
[16:55] reshare my screen and
[17:00] okay, sorry. Um all right, so let's uh
[17:04] go through this again. I don't think
[17:05] anyone Okay, let's have a look here.
[17:10] Right. Okay, I'm gonna go. We We've got
[17:12] time. We've got time. Don't worry.
[17:14] Sorry. Sorry, folks. I'm going to try
[17:15] and keep an eye on the chat here. Um,
[17:18] okay. So, let's uh go through this again
[17:21] really, really, really quickly, but
[17:23] we're all good. So, we know how this
[17:24] works because you've just been watching
[17:26] that while I've been explaining what's
[17:27] happening in my editor. Let's take a
[17:29] look at what's actually happening in my
[17:31] editor. So, um, okay. In here, we'll
[17:34] start within this data section here.
[17:36] We've got, uh, a bunch of data that
[17:38] we're going to send down to, um, our API
[17:41] or the the, uh, AI API, whichever one
[17:44] we're using. Uh, within here, we have a
[17:47] list of widgets. So you can see here we
[17:50] have this widget catalog with ids and
[17:53] then basic descriptions which are kind
[17:55] of like the prompts um for when our
[17:59] agent or the model should pick these uh
[18:03] components. So we export these. We have
[18:05] all this data available and then inside
[18:08] of our uh index page here, let's just go
[18:12] up to the top. We have all of these
[18:13] components imported. We have these ready
[18:15] to go. These are just basic fake ones
[18:17] for this particular demo. Okay. So down
[18:20] here we have this widget map um which is
[18:22] just as we iterate through and get that
[18:24] data back from the AI we know which ones
[18:26] to show. And then just down here we'll
[18:29] come back to this in a moment. We have
[18:31] uh the ability to well when we generate
[18:34] this when we land on the page this sends
[18:36] a request to our backend which can be
[18:38] absolutely anything. It could be a
[18:39] separate backend. Uh this one happens to
[18:41] be combined. So inside of the back end
[18:44] we have our system prompt which um gives
[18:47] us it gives the agent or the model some
[18:49] instructions. So pick five to seven
[18:51] widgets in the order they should appear.
[18:53] Uh gives some guidelines uh down here
[18:56] and then goes ahead and sends this off.
[18:59] So we are using anthropic here but this
[19:01] would work with anything. Um and we
[19:04] choose the model we pass in the system
[19:07] prompt and then we pass in a basic
[19:08] prompt specific to this request. Now we
[19:12] have this dashboard schema. Uh let's go
[19:14] over to this just here. This uses a uh
[19:17] zod object. So zod allows us to
[19:20] construct our type safe uh structures to
[19:23] things. Um so in our case we've got this
[19:26] object defined here with a greeting
[19:28] which if we go over you've seen this
[19:30] again you've just been staring at it for
[19:32] the last 5 10 minutes. Uh this is the
[19:34] greeting and then these are the widgets.
[19:37] So here we're not really doing much.
[19:39] We're just saying this is the structure
[19:40] I want back. If you've ever prompted or
[19:43] sent something over to uh a model before
[19:45] and asked for a response back in JSON
[19:47] and you want to use that response to do
[19:50] something in your apps, you'll know that
[19:52] uh the benefit of constructing up how
[19:54] you want this to come back. So with all
[19:56] that, let's take a look at how this
[19:58] comes together. And you can see here
[20:01] that when we do generate this, this gets
[20:04] put into uh a bunch of columns. So this
[20:07] just generates out how we should see the
[20:10] amount of columns based on the amount of
[20:11] widgets that have been returned. And
[20:13] then really all we do is we iterate
[20:17] through these. So let's go ahead and
[20:19] just um console log out here on the
[20:24] value of dashboard and let's just see
[20:25] what this looks like within the browser.
[20:28] So let's give this a refresh and there
[20:31] we go. So this is the the response
[20:33] object that we get back. Hopefully
[20:34] that's big enough for everyone to see.
[20:36] And these are the list of widgets. So
[20:38] you can see that sure enough it gives us
[20:41] our greeting and it gives us the widget
[20:43] IDs that we passed over to the model.
[20:45] Now if this is still confusing, think of
[20:48] it uh like this. So I'm going to go
[20:51] ahead and just in fact I'll show you
[20:54] that in just a m I'll show you that in
[20:56] just a moment, but because
[20:56] [clears throat] we're going to get on
[20:57] with the um the the workshop exercise in
[21:00] a minute. But we know that these ids map
[21:02] up to the components that we have. So
[21:06] all we need to do in this case is go
[21:09] ahead and do a V4
[21:13] on
[21:15] a look there the rolls. There we go. So
[21:17] the columns that we built up based on
[21:19] the components and then we just iterate
[21:21] over the widgets that we have in here,
[21:23] pull them out of the widget map and we
[21:25] display those widgets dynamically. That
[21:28] is a super simple idea of what Gen UI
[21:32] looks like. So, what we're going to do,
[21:35] um, hopefully you managed to do the prep
[21:38] beforehand, although we did send that
[21:40] out late. Um, we have a prep guide just
[21:42] over here, and we have the first
[21:44] exercise over here, which I'm going to
[21:46] cut a little bit short. Um, but we're
[21:48] going to probably do this for like 10
[21:50] minutes, adding a widget to this
[21:53] catalog. So that's going to force you
[21:54] into that code base and look through the
[21:56] way that this works. Um, so go ahead and
[21:59] pull down the repository, create out a
[22:01] fake component and add it for a specific
[22:04] role. So a really good idea here would
[22:07] be to go ahead and build this a very
[22:10] specific component out just for
[22:12] developers that only developers are
[22:14] going to see. And that way you'll know
[22:17] that this is working and that'll give
[22:18] you a really good idea. We'll get to
[22:20] more complex versions of this as we get
[22:22] into exercise two and I'll explain how
[22:24] that works behind the scenes. Um, but
[22:26] for now, I'm going to go ahead and hit
[22:28] pause here. I'm going to give you 10
[22:29] minutes to dive into this if you want to
[22:31] or if you want to take a break and I
[22:34] will be back hopefully with no more
[22:36] issues. So, I will see you in about 10
[22:39] minutes. Perfect. Okay, great. So, I
[22:42] know that people can hear me now and I
[22:43] am keeping a close eye on this. So I'm
[22:46] so sorry about what what uh what
[22:48] happened before. Okay. So whether you
[22:50] did the exercise or not, hopefully uh
[22:53] now genu in its most basic form uh
[22:57] should make sense. I had some really
[22:59] really good questions and comments in
[23:02] the chat about this being and feeling a
[23:05] little bit strange in handing this over
[23:08] to AI and letting it do it for the first
[23:11] reason that um yeah, sure it could
[23:13] probably pick the wrong things. It's not
[23:16] as deterministic and also this kind of
[23:19] stuff could just be solved with some
[23:21] conditionals and that is absolutely
[23:23] right. Now we're going to look at a more
[23:25] advanced example now. Um, and hopefully
[23:28] this should cement um those those
[23:30] [clears throat] queries. So, we're going
[23:32] to go on to looking at tool calls and
[23:35] props which are a little bit more
[23:36] advanced. So,
[23:39] we basically register what we call tools
[23:42] up front which yes are mapped to
[23:46] components but they're a little bit more
[23:47] powerful than this and they have a lot
[23:49] more flexibility. The previous example
[23:51] that we saw just mapped up component ids
[23:55] and basically gave it through to an AI
[23:57] and said just give me back the component
[23:59] ids. Um what we do with tools is we
[24:02] register these up front again with a
[24:04] predefined schema and crucially props
[24:07] that we want generated as part of these.
[24:10] So these are a lot more flexible. So, a
[24:13] little bit of code here, but we will be
[24:14] diving into the uh second example that
[24:18] we have to actually show you what this
[24:20] kind of looks like. Um, but this is a
[24:22] tool registration. Now, again, we have a
[24:25] description which is kind of like a
[24:27] prompt. So, as an example, if we're
[24:30] booking to go somewhere,
[24:32] this is a destination card. So, when a
[24:35] user mentions they are traveling to a
[24:37] city or a country, imagine this being as
[24:39] part of like a search engine. we would
[24:42] want to show this destination card but
[24:44] critically from what they the data
[24:47] they've given us we also have this input
[24:49] schema which is the shape of the props
[24:51] that the model fills in for us. So
[24:54] rather than just choosing a component to
[24:57] show what we're now doing is we're
[24:59] creating a we're using this tool to fill
[25:02] in this data from the model. So with
[25:05] this we get into the next stage of more
[25:07] powerful genui where we actually have uh
[25:10] something come back to us which we can
[25:12] use. We'll see an example of this soon.
[25:15] So we basically make the SDK in the next
[25:18] step aware of our tools much like what
[25:20] we did with the components. So again
[25:22] we're using the AI SDK here uh from
[25:25] versell and we're using anthropic but
[25:28] this could be anything. We pass in all
[25:30] of the tools that we've registered. For
[25:32] example, show destination, show flight,
[25:34] show hotel, all of that kind of stuff.
[25:36] And we have some sort of prompt or we
[25:38] have richer context around this uh thing
[25:41] that we're sending over. Then we can,
[25:45] and this is one way we're going to do
[25:46] it, map the call tools to our
[25:48] components. So we do pretty much what we
[25:50] did before where we have a map tool to a
[25:53] particular destination card. Now, where
[25:56] this gets a lot more powerful is that
[25:58] when you think of a tool, the uh if we
[26:01] just go back here, the input schema
[26:04] could also determine what we get back
[26:06] from here. This could be a true or false
[26:08] value based on what a model has chosen.
[26:10] If you need something to be really
[26:11] intelligent, you could then use that the
[26:14] props that you get back or the input
[26:16] that you get back to them conditionally
[26:18] render things. So the intelligence sits
[26:20] at the top level and then your
[26:21] components just render when the the
[26:24] model tells you and that doesn't solve
[26:26] the problem of this being
[26:27] non-deterministic. That's not the point
[26:29] of this. But it does make this a lot
[26:31] more um of a a better replacement for
[26:34] just a bunch of if statements. Um so
[26:36] yeah, we we map these up and we just
[26:39] iterate through. So here is what this
[26:43] kind of looks like as your model is
[26:46] thinking through. So imagine that we're
[26:48] booking a destination to uh Tokyo. We
[26:51] have a start date and an end date. And
[26:53] maybe our application already knows that
[26:55] we have two children. And just to keep
[26:57] things simple, we're all vegan. So what
[27:00] happens next is we have this stream of
[27:03] the model thinking through. So we're
[27:05] actually going to in the next example
[27:07] look at streaming this. So uh think of
[27:09] this as like a chat GBT or a Claude.
[27:11] They're heading to Tokyo. That's the
[27:13] anchor for everything else. So, it knows
[27:14] to pick that tool that it's aware of.
[27:17] And it knows to fill in the city. Then,
[27:20] yeah, we've got two kids, so let's keep
[27:22] the little ones busy. It knows we've got
[27:24] children, and it can call that specific
[27:27] tool. So, it can work that out, free
[27:29] work that out by itself. The family's
[27:31] vegan, so dining needs a bit of thought.
[27:33] So, again, it goes ahead and uses the
[27:35] add dining tool and passes through the
[27:38] diet, vegan, the vegan diet, and then it
[27:40] will just go ahead and suggest things.
[27:41] And then if you look over here, our UI
[27:44] updates with the weather uh as a last
[27:46] step. So we could we could set this to
[27:48] be like a nonimportant tool call at the
[27:51] very end which just adds nicities to the
[27:54] UI. Um so that would just give you like
[27:57] maybe a visual element to this which
[27:59] isn't super important for the actual
[28:01] output of the UI but is a nicity to
[28:04] have. So this is basically how this
[28:06] works. So, just before we go on to
[28:08] exercise two, let's hop over to the uh
[28:11] for me project. So, again, don't worry
[28:13] if you haven't pulled this down or
[28:15] you're not going to have time to pull
[28:16] this down. Um, let me just go ahead and
[28:18] show you what this does. So, this is a
[28:22] slightly different example and I've
[28:24] included this stream on the right hand
[28:26] side. I'm just checking that you can
[28:27] actually see this. Yes, this uh stream
[28:30] on the right hand side which will show
[28:31] you when the specific tools are actually
[28:34] getting called based on uh my prompt. So
[28:37] imagine a form builder. We all know what
[28:39] form builders are, but this form builder
[28:42] takes a prompt and builds a form for us.
[28:45] And this is perfect because we know that
[28:47] for an input, an input isn't just an
[28:49] input. An input could be required. It
[28:52] could have a maximum length. And this is
[28:54] where if we just go back really quickly
[28:56] to the presentation, this is where this
[28:59] input schema really helps. So we can
[29:02] control not only what components are
[29:04] shown, but what values our components
[29:06] have as well. Let's just pop that back
[29:08] to where we were. So let's give this a
[29:12] go. I need to hire a software engineer.
[29:13] We click the generate button. This goes
[29:15] ahead and sends across this very simple
[29:17] prompt over to um the model API. And
[29:20] this basically just generates a form for
[29:22] us. So you can see on the right hand
[29:23] side all of the tools that are being
[29:25] called here. So we've got a set title
[29:27] tool which sets the uh title for this
[29:30] full name, email address, phone number,
[29:32] all the kind of things you would expect
[29:33] on an application. Now like I said,
[29:36] let's say that we yeah we're building
[29:38] this format, but I don't think phone
[29:39] number should be a required field. It's
[29:42] a nice to have. So let's say don't
[29:45] require phone number. So the difference
[29:48] is now when this text uh when this tool
[29:52] actually gets called uh the model will
[29:55] know that we don't want this required.
[29:56] So it will send back required false and
[29:59] then when we pass that through to the
[30:00] component as an actual prop it will go
[30:02] ahead and you know not make this
[30:04] required. So again pretty
[30:06] straightforward in this example but you
[30:08] can see this rich data that you get back
[30:10] can actually be really really helpful.
[30:14] Okay, so the second exercise here again
[30:18] uh is to look through the code, figure
[30:20] out what this looks like, which I'm
[30:22] going to do in just a second. But we
[30:24] want to add a warning component to this
[30:27] form. Now, this is slightly different
[30:29] because a warning component component
[30:32] isn't something that we're going to
[30:33] iterate through. It's not going to be a
[30:35] part of this form. It's going to be like
[30:37] a warning up here. And we want this
[30:39] warning to appear when we ask for
[30:41] something that's potentially legally uh
[30:44] just could get us into trouble or we
[30:45] shouldn't be asking it. As an example,
[30:48] uh I want might want to say include
[30:51] marital status.
[30:54] So when I click generate on here, I kind
[30:56] of want a warning saying, "Yeah, you
[30:58] probably shouldn't be asking about that
[31:00] on a job application." This doesn't work
[31:03] at the moment, but I do have a branch
[31:05] which I'm going to show you the solution
[31:06] to in a minute. And again we'll cut this
[31:08] down to 10 minutes. So let's have a
[31:10] really quick look through the code here
[31:12] because this is similar to before but we
[31:14] are streaming this instead. So again we
[31:17] have a very similar setup here. We have
[31:19] a bunch of tools and we have a bunch of
[31:22] components. Now tools are different. Uh
[31:24] we saw that in the presentation. Uh
[31:26] let's just take a look at add text
[31:28] field. So we define out a tool with a
[31:31] description. So this is like the prompt
[31:33] we send through and we have this input
[31:35] schema. We have a base field shape. So
[31:37] all of our uh fields get a relatively
[31:40] similar structure. Um but then we have a
[31:42] placeholder as well. So we might want to
[31:44] include a placeholder for this. For more
[31:47] advanced ones like uh let's just take a
[31:49] look at a slider for example. These are
[31:51] a lot more advanced. We have a min max
[31:53] and a step of on an HTML uh slider
[31:56] field. So we have our tools which are
[32:00] output here or exported here. We have
[32:03] our components that we can map up to if
[32:05] we want to. Um, and then we have our
[32:08] composable which will go ahead and
[32:10] actually send this request through. So,
[32:12] very similar to the last example, we
[32:14] send this through to an API. Um, and we
[32:16] get back a response. So, let's just take
[32:19] a look at this response here.
[32:22] So, we'll just console log this out.
[32:25] Let's console log inputs out and we'll
[32:28] take a look at this. And it should just
[32:30] pop up in here.
[32:36] And you'll see a very similar structure
[32:37] to this where we get back the data like
[32:40] this. That's pretty much what's coming
[32:41] out onto the stream. Then we go ahead
[32:45] and on our app here like we did before
[32:48] when we submit this through. So we've
[32:50] got this initial prompt in here. When we
[32:53] submit this through um just let's go
[32:55] down here with this use form stream uh
[32:58] generate method. We collect up the form
[33:00] fields and then we iterate through them.
[33:02] So we basically just create a computed
[33:04] property go through collect them all up
[33:07] and if we search for this we just
[33:10] iterate through these. Now the exercise
[33:13] two we don't want to iterate through
[33:15] these. What we want to do is create a
[33:17] new tool a new component but we want to
[33:20] show this above the form field
[33:22] somewhere. So I'll come back to the
[33:23] solution. If you don't use Vue that's
[33:25] absolutely fine. if you just want to
[33:27] take a break and then we'll come back
[33:28] and I'll show you in the branch of this
[33:31] uh how I built it. Um but it's also
[33:33] available in the GitHub repo as well. So
[33:35] I am going to give you 10 minutes to
[33:38] just have a look through this if you
[33:40] want or have a go at building this out
[33:43] and then we will come back and look at
[33:45] the solution together and then we'll
[33:47] recap um which should answer some of the
[33:49] questions that I saw in the chat as
[33:52] well. So, let's go for another 10
[33:55] minutes on this and we will come back
[33:57] and look at the solution in a minute.
[34:00] Okay, folks. Um, I'm back and we are
[34:03] going to take a minute just to look
[34:05] around the solution here for those of
[34:07] you that either didn't do it did do it
[34:09] uh or are just interested. So, uh let's
[34:13] go over to the codebase here. Uh, I'm
[34:15] just going to switch over to the feature
[34:19] branch for add warning and yeah, let's
[34:22] take a look. So, we'll demo this out in
[34:24] the browser first, of course. So, I'm
[34:26] going to do exactly the same prompt that
[34:28] I did before, um, which is ask about
[34:31] marital status.
[34:34] And let's hit generate.
[34:39] And yep, that goes through. And you can
[34:40] see that we've got this warning. Now,
[34:42] this warning might not appear first. So
[34:44] sometimes this could come later. It just
[34:46] depends on how the model thinks this
[34:48] through. It does still do this, but
[34:51] obviously that's not what we've done. If
[34:53] you wanted to add guard rails in place,
[34:55] and I saw quite a few questions about
[34:58] guardrails security, whether we wanted
[35:01] to uh what we'd get if we typed I want a
[35:03] burger in, for example, which I'm
[35:05] willing to uh do now to see what this
[35:08] actually gives us. And yeah, it gives us
[35:11] a burger order form, which you would
[35:13] kind of expect. So you would have to add
[35:16] guard rails here. Of course, this is a
[35:18] very new thing. Gen UI is pretty new.
[35:21] Um, so you would have to either include
[35:23] this in your prompt for the specific
[35:26] components. For example, uh the checkbox
[35:29] uh the radio box. You might have a set
[35:31] of requirements in there, etc., etc. But
[35:33] we can see the warning here now. And
[35:35] we've seen a demo of this. So this works
[35:38] by again creating out an ad warning
[35:40] tool. I've kept this really really
[35:42] simple in my solution by having some
[35:44] just text which is a warning text but of
[35:48] course you could make this more complex.
[35:49] So you could have if you wanted to uh a
[35:52] title, you could have a main body of
[35:56] text and then maybe you could offer like
[35:58] some alternative things that you could
[36:00] ask uh or or prompt on. So you could
[36:03] have some suggested prompts because it
[36:05] doesn't have to just be a legal reason.
[36:07] It could just be anything at all. So uh
[36:09] we can we can add as much input schema
[36:11] here as we want. Uh we obviously have
[36:13] the warning component uh which maps up
[36:16] and everything is exported uh as usual
[36:19] under our let's just have a look here
[36:22] under our index. So we have a warning
[36:25] about illegal stuff which maps to add
[36:27] warning. This is just part of the
[36:28] prompt. Um, and we have this obviously
[36:31] exported as part of our tools. Now,
[36:34] where this differs, we don't need to mod
[36:36] modify anything else about this solution
[36:38] because the goal here is just to be able
[36:40] to add a new component when it's uh
[36:42] suitable. Uh, over in app, the
[36:45] difference here is that we have this
[36:46] warning. Now, my solution is pretty
[36:48] basic and something that probably
[36:50] wouldn't scale, but the way I thought
[36:52] about this is we might actually have
[36:54] multiple warnings. Remember, these tools
[36:56] can be called multiple times. So, we
[36:58] don't just want to pluck out the first
[37:00] one. We're iterating through any
[37:03] warnings we get back here. And I'm just
[37:05] doing a filter here. Of course, you
[37:07] could make this more elegant, faster.
[37:09] This was just a really quick solution.
[37:11] Um, and you would iterate through
[37:13] passing in the data that you need. So,
[37:16] um, yeah, this is uh the solution for
[37:18] this. And if you want to look into this
[37:20] solution, the either of the exercise
[37:22] code bases that we've uh used throughout
[37:24] this workshop, they are available on
[37:26] GitHub. uh you can grab them from the
[37:29] prep guide. So feel free to have a look
[37:31] and there are plenty of other genuine uh
[37:34] genuine examples around the web as well.
[37:37] Okay, so with that done, we are going to
[37:40] debrief, wrap up and just talk about
[37:42] some crucial things as well. And
[37:44] hopefully this answers some of the
[37:45] questions that I've seen in the chat. So
[37:47] today we've just looked at one very
[37:50] simple pattern. We've had an hour and a
[37:51] half. We couldn't look at absolutely
[37:53] everything although I would have loved
[37:54] to but we've looked at one pattern and
[37:56] that pattern can kind of take two forms.
[37:59] The first one is the user says something
[38:02] like we're off to Tokyo or they give
[38:04] like a free form uh thing. We saw an
[38:06] example of that with a form builder.
[38:09] Then we have model calls. It the model
[38:11] as long as it's aware of these works out
[38:13] what it needs to call and it renders
[38:16] something on the UI. The other way that
[38:20] we can use this pattern is things that
[38:21] we know about the user. So for this
[38:23] example, you can see the JSON at the
[38:26] very top um we know the user is a
[38:29] returning user. We know that their
[38:31] active hours are usually in the
[38:32] evenings. We know that the top feature
[38:35] that they use is a calendar. So
[38:37] therefore the model fills in a
[38:38] predefined shape of what this UI is
[38:41] going to look like. So it structures the
[38:43] widgets with the calendar first, which
[38:45] is an intelligent way of doing this. You
[38:47] could do this with if statement of
[38:49] course but it's a lot harder. Let me get
[38:51] a list of these preferences as well with
[38:53] the layout theme show tips. Now one of
[38:55] the things I wanted to do is uh just
[38:58] mention briefly that this kind of stuff
[39:00] you don't need to keep sending requests
[39:02] over to uh an API an AI service API
[39:06] every single time. You can of course
[39:07] cache this data if you don't want to you
[39:10] know use uploader tokens. So taking this
[39:13] we can pass the widgets into our
[39:14] dashboard. We can pass the preferences
[39:16] out into our dashboard and we can build
[39:18] up what the user should see. And of
[39:20] course, again, this is a really simple
[39:21] example. Now, the fun part is what other
[39:23] stuff can we do with this that we
[39:25] wouldn't have had time to demo today
[39:27] that you could probably try out in your
[39:29] spare time or as part of any projects
[39:31] you're working on. So, let's have a look
[39:34] at these. I'm just checking that
[39:36] everyone still hear me and we sound we
[39:38] seem good. So, for example, a help
[39:40] widget. So, let's say I'm searching the
[39:42] docs for how to cancel my plan. Instead
[39:45] of just showing us a link to a
[39:47] documentation of how to cancel, why
[39:49] don't we show the user a button where
[39:51] they can cancel their plan. That's just
[39:53] an example, but we could do anything
[39:54] like this. You could see how useful this
[39:56] could be, giving users actions rather
[39:59] than instructions.
[40:01] A search bar that composes an answer for
[40:03] you. We've already seen an example of
[40:05] this in Google in like travel planning,
[40:08] all of that kind of stuff. So rather
[40:10] than just give us a list of links for a
[40:13] trip to Tokyo, it actually gives us more
[40:15] rich information. The one I really love
[40:18] is an onboarding flow. So for example,
[40:20] if we're new to an application and the
[40:23] user asks in free text what their goal
[40:26] is when using your application. Let's
[40:28] say we have a really complex uh SAS app
[40:31] and I say, well, I want to do this. This
[40:33] is my goal for your uh platform. Well,
[40:36] our onboarding flow could adapt to what
[40:39] the user wants to learn. And we can only
[40:41] really do that with something as
[40:43] intelligent as an AI model for it to
[40:45] actually work out what it needs to do.
[40:48] Uh settings page, which is another
[40:49] really good example. So, for example, it
[40:52] could reorder a settings page around an
[40:54] action. For example, if a user is just
[40:57] about to renew their account, billing
[40:59] might go to the top of a list. It's a,
[41:02] you know, it's a silly example, but this
[41:04] could help some people and it can get
[41:05] rid of that friction. Um, accessibility
[41:08] as well is another one, and this is, uh,
[41:11] something that comes up a lot in Genui,
[41:13] adapts to the user's needs. So, for
[41:14] example, if it knows that the user has
[41:17] um, low vision, it will simplify certain
[41:20] things for their needs. And there's
[41:22] loads of obviously loads of examples for
[41:24] accessibility that this could help out
[41:26] with as well, which would be harder to
[41:28] do with a traditional bunch of if
[41:30] statements.
[41:32] Again, crucially, we need to think about
[41:33] whether we're doing this uh whether we
[41:36] should go and use generative AI or UI or
[41:39] we should just, you know, leave it as it
[41:41] is. So, I would reach for it when the
[41:43] surface is open-ended or personalized.
[41:46] And they're pretty much all the examples
[41:47] we've seen today. If input varies a lot
[41:50] from user to user. Um so if you know
[41:54] that lots of users have lots of
[41:55] different goals with each with your
[41:57] application or what you're building that
[42:00] is what we need to do. We need well that
[42:02] is what we can do. We can change around
[42:03] the UI or you're composing from many
[42:06] possible pieces. Again we've seen an
[42:07] example of that through like uh the
[42:10] Google AI search for example. Now we can
[42:13] stay deterministic when we have critical
[42:15] regulated or high stakes flows when we
[42:17] absolutely need
[42:20] flows to be deterministic every single
[42:23] time. Whether it needs to be predictable
[42:25] and testable. Testing these kind of
[42:28] things is another thing. Uh it can be
[42:30] very hard to test a uh generative UI and
[42:34] latency and cost matter more than
[42:36] flexibility. Of course, I've seen some
[42:38] comments already. This is going to cost
[42:41] more. it's going to be a lot slower or a
[42:43] little bit slower depending on the
[42:44] model. So really important to bear these
[42:46] things in mind and crucially like with
[42:49] everything in AI and beyond use it when
[42:53] it improves things. In this case the UI
[42:55] and the UX, not just because you can. Uh
[42:59] I think this is a really cool thing to
[43:00] do with AI, but we don't just want to
[43:02] sprinkle it into our apps just because
[43:04] it's cool and just because we can do it.
[43:06] It needs to actually have some benefit
[43:08] for the user.
[43:10] So
[43:12] lastly, this is really early and the
[43:13] patterns and tech are still evolving
[43:15] within Genui. If you Google Genui, you
[43:17] actually don't get that many results
[43:19] out. You'll get some sort of highle
[43:21] overviews, but it's actually pretty uh
[43:24] hard to find any good examples of this.
[43:26] There are some really good examples from
[43:28] Google. Flutter have a really good
[43:30] framework for this. Um, but it is still
[43:32] evolving. So, it's just something to
[43:34] watch out for. And hopefully this has
[43:36] given you a taste of what's possible.
[43:39] Okay, we're going to go to uh I guess
[43:41] Q&A now. I just leave this in my
[43:43] presentation, but I'll let Daniel do
[43:45] that. Um and yeah, let's let's go ahead.
[43:48] Um and yeah, thanks so much for joining.
[44:02] Hey, Alex, can you hear me?
[44:05] Okay, good.
[44:08] your name now,
[44:10] >> right? Sorry. Let me just switch over my
[44:12] uh mic again. Sorry.
[44:15] >> No worries. Enjoyed the workshop, by the
[44:18] way.
[44:21] >> Um okay, I can't hear you. So, that's
[44:24] another issue. I'm going to
[44:26] I'm just going to um
[44:30] have a look and see what is going on
[44:32] here.
[44:34] >> Awesome. Yeah, it makes it difficult to
[44:36] ask questions. uh when the ones you're
[44:38] asking questions to cannot hear you. So,
[44:43] uh we'll wait for Alex to get set up
[44:45] here. Can you hear me? Testing one, two,
[44:47] three.
[44:49] Hello world.
[44:52] Uh what are some other good testing
[44:55] slogans that you use
[44:58] when you're testing something, whether
[45:00] that be audio or, you know, your next
[45:03] application that you're building. Uh I
[45:05] use testy mcester on forms like all the
[45:08] time. Right.
[45:10] We are getting comments uh saying that
[45:13] this was an excellent workshop. So
[45:15] really definitely appreciate that Alex
[45:17] and I tuned into some of it and 100%
[45:20] agree with that. Super super cool what
[45:22] we can do um with AI, not just in terms
[45:26] of workflow but in terms of how we can
[45:27] enhance our applications. Pretty
[45:30] stinking cool.
[45:33] All right.
[45:36] So, Alex, it looks like the video has
[45:39] cut out on you. That's what I'm seeing.
[45:42] So, we'll give Alex just a moment. Uh
[45:46] oh. Oh, has the moment passed?
[45:53] [laughter]
[45:54] Oh, in the chat. So, someone says, "Can
[45:56] you hear me indefinitely?" is the way
[45:58] that they go. Um that reminds me of that
[46:00] old I think it was a Verizon commercial.
[46:02] It's like, "Can you hear me now? Can you
[46:04] hear me now? Maybe that was
[46:06] >> Can you hear me?
[46:06] >> Hey. Hey. Yeah, I can hear you, Alex.
[46:09] >> We got there. It's not It's not my day.
[46:10] It's not my day, but here we are.
[46:12] [laughter]
[46:14] >> No worries. So, getting some comments in
[46:15] the chat. They people really enjoyed
[46:17] your workshop and um really appreciate
[46:19] the the expertise you've shared.
[46:22] >> Brilliant. That's great to hear. Great
[46:24] to hear.
[46:25] >> Um so, are you ready for some uh Q&A?
[46:28] >> I am indeed. Yes. Let's go.
[46:31] >> Excellent. Um, the first question we
[46:33] have for you is, is it similar to SDUI?
[46:38] >> That is a great question because I don't
[46:40] know what SDUI is. So, um, that's
[46:43] something for me to look up. So, thank
[46:45] you.
[46:46] >> Yeah, fair. I'm I'm not familiar with
[46:48] the term either. And if this was your
[46:50] question, feel free to elaborate in the
[46:51] the comment section.
[46:54] Um, okay. So, next question. Uh, how do
[46:57] you evaluate the correctness in
[47:00] generative UI when correctness is no
[47:02] longer visual fidelity but consistency
[47:04] of user intent across dynamically
[47:07] composed interfaces?
[47:13] How do you evaluate correctness when
[47:15] correctness? Uh,
[47:19] I'm gonna that's a really wellworded
[47:22] question. I'm going to say that yeah, I
[47:26] I I guess this comes into testing and
[47:29] like yeah, evaluating what comes out of
[47:31] the model. Uh and I saw quite a few
[47:34] questions about that in the chat as
[47:36] well. Um so yeah, this this kind of
[47:39] stuff is very um it can feel very uneasy
[47:43] of course because you're letting the
[47:45] model decide what you're going to
[47:46] display to the user and you're never
[47:48] going to see what the user sees. It's
[47:52] like just throwing something out there
[47:53] and letting the user, you know, see
[47:55] something generated by a model. How do
[47:58] you know what they're even seeing? Um,
[48:00] and it's a really good question because
[48:02] again, this is evolving. I would say we
[48:04] would want guard rails like from the
[48:07] very beginning in terms of the prompt
[48:09] that we give it. Um, and really I guess
[48:12] it's the same with any other application
[48:14] that uses AI. Um, that you would
[48:17] basically just have like a um, let's
[48:20] give an example. when you hop on to
[48:22] claude or chat GBT it's this is
[48:25] generated with AI take it you know just
[48:28] be careful with the output so I think
[48:31] probably guard rail set up but then
[48:34] making users aware that this is uh AI
[48:38] generated and customized with AI and
[48:40] then possibly having a backup for this
[48:43] as well um and then just monitoring
[48:45] [clears throat]
[48:45] you know user feedback it's really hard
[48:47] to say because it's so early but yeah I
[48:49] guess um I guess that that's probably
[48:52] the direction that I would go in as with
[48:54] anything I do in AI.
[48:56] >> Sure. Definitely. I I really think that
[48:59] monitoring piece I think is so
[49:01] important. I'm um even just in like
[49:03] textual feedback from an AI if you have
[49:05] a if there's a goal for it to have like
[49:07] the only way you can know if it's
[49:09] meeting that goal is constantly
[49:11] monitoring the the input and and the
[49:13] output of it and does this is this doing
[49:15] what I want to do, right?
[49:17] >> Absolutely. Yeah.
[49:18] >> Very interesting. Um okay. Um
[49:22] uh it's another wording of that
[49:24] question. Maybe this was the one I
[49:26] should have given. So yeah, how do you
[49:27] test that non-deterministic output? Um
[49:30] let's go on. Let's see.
[49:35] Okay, this is an interesting one. Uh so
[49:37] do you have any thoughts uh on
[49:39] leveraging a small language model
[49:41] pre-trained on Vue or any of these
[49:44] others um as the reference engine for
[49:46] Gen UI rather than an expensive call to
[49:48] a foundation model?
[49:50] >> That is a great question because um I
[49:52] was thinking about this um when I was
[49:55] when I was creating the workshop. I feel
[49:58] like I'm going to guess a lot of
[50:01] companies um would rely on an internal
[50:04] model for this. And actually this very
[50:06] closely relates to rag as well because
[50:09] you know if you have a rag pipeline that
[50:11] pulls data either out of your database
[50:13] or um you know any documents that you
[50:16] have internally in your company um it's
[50:20] a very similar thing in the sense that
[50:22] you want this to be as closed off as
[50:24] possible. So um yeah, I don't really
[50:26] have any thoughts on it other than yes,
[50:29] this would be really hard to do for a
[50:31] small indie project. You know, training
[50:33] your own model, for example, or using a
[50:35] uh model on your own hardware would be
[50:37] really difficult for this. Um but yeah,
[50:40] it's definitely possible. Um what I
[50:42] would say is that um from experimenting
[50:46] with this, it's actually very difficult
[50:48] for this to go very very wrong. Um, it's
[50:52] when you give the right context to a
[50:55] model, it generally responds properly.
[50:58] Users can't modify your prompt.
[51:00] Obviously, there's the issue of prompt
[51:02] engineering as well. So, that could, you
[51:04] know, they could try to to to prompt
[51:06] engineer their way out of your existing
[51:08] prompt. Um, but yeah, it's definitely a
[51:10] solution for bigger companies with with
[51:14] more budget. But I think it's a cool
[51:15] thing to experiment with and see. Um,
[51:17] and you know, like I said, don't just
[51:19] use it for the sake of it. use it if
[51:20] it's really going to be helpful.
[51:23] >> Yeah, excellent point. And I think your
[51:25] example with the burger is a good case
[51:26] and point of this is like how much could
[51:29] they really abuse it, right? It's it's a
[51:31] matter of what kind of context it has to
[51:33] begin with.
[51:34] >> Yeah, exactly. Yeah. Yeah.
[51:36] >> Interesting. All right. Um, let me see.
[51:40] Let's do one
[51:45] one more question before we go.
[51:50] So the visibility of components is
[51:53] nondeterministic
[51:54] but a list of components are
[51:56] deterministic. So can we automate each
[51:58] of these components separately or in a
[52:01] group? Please correct me if I'm wrong.
[52:05] >> Um list of components are deterministic.
[52:09] Can we automate each component
[52:11] separately
[52:12] um or in a group? I'm not really sure
[52:14] what that is asking, but I'm gonna
[52:20] Yeah. So, so yeah, it's nondeterministic
[52:24] for what is actually going to be shown
[52:27] the list of components. Um,
[52:30] yeah.
[52:35] Can we automate each component
[52:37] separately in agree if you uh let's
[52:39] could could we follow up on that
[52:41] question because that would be like in
[52:43] the chat I'll stick around and and I'd
[52:44] be happy to answer it but um let's let's
[52:47] talk about this.
[52:49] >> Absolutely. Cool. Cool. So yeah, if this
[52:51] was your question definitely clarify
[52:54] more in the chat. Um
[53:02] I feel like a news reporter right now.
[53:04] This is awesome. Uh yeah. Uh let's see
[53:08] what's coming in through the line. Um so
[53:09] it sounds like we actually have time for
[53:11] two or three more questions. So let me
[53:14] get back to the drawing board then,
[53:16] Alex.
[53:17] >> Um
[53:20] what actually just just something to
[53:22] kind of shoot the breeze with you on
[53:24] before I find another question.
[53:26] >> Um that last question kind of triggered
[53:28] a thought in my head. Um, when you
[53:30] talked about rag, like I could even
[53:32] seeing rag being a part of this UI
[53:34] generation in terms of like
[53:36] >> yeah,
[53:36] >> caching previously generated stuff and
[53:39] then finding that previously previously
[53:40] generated stuff when it when it's needed
[53:43] again so that you don't have to spend
[53:44] more tokens to generate it a second
[53:46] time, right?
[53:47] >> Yeah. No, that's definitely that's a
[53:49] really good point. I mean like as like
[53:50] as I was going through um this kind of
[53:53] stuff and building the examples, rag
[53:55] just kept coming up in my mind like this
[53:57] just feels part of the same pipeline.
[53:59] It's you know it's could be incredibly
[54:01] useful. Um and it's very there's a lot
[54:04] of crossover here. Like I know you know
[54:06] with rag you could build out a chat
[54:08] interface where you ask how do like the
[54:10] example of how can I cancel my account?
[54:13] Yes, rag can find the right article for
[54:15] you and point you to the right place. Um
[54:19] whereas with this it's more like let's
[54:21] just give the user a button so they can
[54:22] actually click on that component button.
[54:24] But yeah there's a lot of crossover and
[54:26] yeah so that's a really good point.
[54:30] Cool. Cool. All right. So I have found
[54:32] the next question here. And so uh what
[54:36] do you think is the limit for this
[54:37] approach right now? Um and what kind of
[54:39] products is GUI ready for and which one
[54:42] is is it not ready for? I think um with
[54:46] um with the research that I've done um
[54:49] through building with GenUI, I think
[54:51] accessibility is one where this can be
[54:54] um this can be uh has has the most
[54:58] benefit is the safest way to start
[55:02] working with this um approach and also
[55:05] for applications that are very
[55:10] similar in the amount of components they
[55:12] output. So, for example, I've spoken a
[55:15] couple of times about like a travel
[55:16] booking application. Like you pretty
[55:18] much are always going to have the same
[55:20] components. They're just going to vary
[55:22] in the data that you have and in the
[55:24] order that you want them in. And I think
[55:26] for things like that, this can work
[55:28] really well. I think for um as I said in
[55:32] the workshop in one of the slides
[55:34] anything that is critical that you need
[55:37] to be able to rely on users uh seeing
[55:39] things or applications where things sort
[55:42] of need to be static all the time. Let's
[55:45] take the example of say like a Jira
[55:47] dashboard. Like I don't think anyone
[55:49] would want that to move around every
[55:51] single day because I think with complex
[55:53] software, you know, it's great, but with
[55:55] complex software, you want things to be
[55:58] um you want things to be as simple as
[56:00] possible in terms of like where users go
[56:02] to find things. And I think even one of
[56:04] the examples I gave of having a settings
[56:07] section where let's say your user is uh
[56:10] due to be build soon moving an you know
[56:14] like maybe showing them the a billing
[56:16] section first even that is sort of
[56:19] pushing it. I think really the key thing
[56:21] to uh be aware of is this should be uh
[56:26] used on a case-byase basis if you think
[56:29] it's going to be useful for your users
[56:32] not necessarily as a general rule for a
[56:35] certain type of application. So, I
[56:37] think, you know, if if this is going to
[56:39] benefit people, then absolutely use it
[56:41] and it's worth the cost and it's worth
[56:43] the slight time delay in sending a
[56:45] request over or that you can cash, then
[56:47] I think it's I think it's good to do.
[56:49] But I think um like with anything, if
[56:52] you're starting to use GenUI or anything
[56:54] similar, cuz this could of course
[56:56] change, things, you know, trends come
[56:58] and go. Um if you're starting to use it
[57:01] and you actually halfway through
[57:03] realize, why am I doing this? it's
[57:06] probably a good idea to step back and go
[57:07] maybe let's keep it simple like you know
[57:09] like with anything we've all been there
[57:11] we get carried away by like cool stuff
[57:13] um which is actually ends up being more
[57:15] complex than we we intended it to be so
[57:18] yeah just there I don't think there's
[57:19] any hard and fast rules I think it's
[57:21] just uh you know thinking thinking
[57:22] sensibly about these things
[57:25] >> sure so you're saying we still have to
[57:27] use our human thought process every once
[57:29] in a while right
[57:29] >> absolutely yeah [laughter]
[57:31] absolutely yeah
[57:33] >> awesome all right uh This is a really
[57:36] interesting one. Uh I think we're going
[57:37] to maybe have time for about two more
[57:40] here, but this one's really interesting.
[57:42] Um DB schema is deterministic.
[57:45] I might argue with that slightly uh
[57:48] depending on how Anyways, I'll just read
[57:49] the question. Uh DB schema is
[57:52] deterministic. How would generative UI
[57:54] fill the DB requirements?
[57:58] >> Um so I'm guess again I'm I'm struggling
[58:00] with that. What I'm guessing that means
[58:02] if you're storing stuff
[58:06] back from
[58:07] >> Yeah, that's kind of what I'm reading
[58:10] from it. Like if if you're generating
[58:12] this stuff and you want to save it,
[58:15] >> maybe even like the form submission,
[58:17] right? Maybe they're worried about the
[58:18] form submission.
[58:19] >> Yeah. So, yeah, that's that's a really
[58:21] good point. Um, so with the with the for
[58:24] me example that I built, I didn't get to
[58:26] the stage where I was like, well, you
[58:28] know, we've built this, we we've
[58:30] generated something, but then how do we
[58:32] store it? Um, you have to you'd have to
[58:36] come up with a solution of how to store
[58:37] that. Now, my gut instinct would be
[58:40] something a little bit looser. So for
[58:42] example uh we get back a uh a schema for
[58:45] the the a schema if you want to call it
[58:47] a schema but for the components that we
[58:49] want to render I would probably probably
[58:51] start by this is just me but start by
[58:53] storing that as like loose JSON or
[58:55] something like that and then I can take
[58:57] it from the database and then I can do
[58:58] something with it. Um but I guess the
[59:01] key thing with um with Gen UI is that
[59:04] there's not really much to store because
[59:07] the whole point of it is what's on the
[59:09] surface. So a component that you you
[59:12] that you show based on genui of course
[59:15] might store something in the database
[59:17] but that's its own little world. It's
[59:18] its own little sort of you know capsuled
[59:21] off uh section. So um yeah there are
[59:24] complex situations like the forming
[59:26] example that I built that could require
[59:29] that. Um I don't [clears throat] have a
[59:31] a super clear answer for that other than
[59:33] I would just experiment with it and of
[59:35] course it depends on how complex things
[59:37] get. But um yeah, it's a good question
[59:38] and if I was wrong in what you were
[59:40] asking again, feel free to follow up and
[59:42] I'll chat with you.
[59:45] >> Awesome. Well, uh that actually I think
[59:47] wraps up our time, Alex. Um I promised
[59:50] you one more question, but we are at the
[59:52] mark. So, thank you once again so very
[59:54] much uh for joining and for putting on
[59:56] the awesome workshop.
[59:58] >> Great. Thanks so much, Daniel. And
[59:59] thanks everyone for joining. Really
[60:01] appreciate your time.