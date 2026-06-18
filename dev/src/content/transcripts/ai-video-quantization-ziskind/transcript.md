[00:00] Here's a thing that nobody tells you. If
[00:01] you're running an AI video model
[00:03] locally, you're running it quantized.
[00:05] You just are. Comfy UI, probably the
[00:07] most popular tool for generating videos.
[00:10] It has your GGUF version. And most
[00:12] workflows assume you grab the Q4 on day
[00:14] one and never looked back. Basically
[00:16] means the model weights are quantized
[00:18] down to four bits. But nobody actually
[00:20] tells you what you give up to get there.
[00:21] So, I wanted to check it out. I took two
[00:24] video models and I ran each one all the
[00:27] way down an eightstep ladder from full
[00:30] precision at fp16 down all the way to
[00:32] two bits. Some of these look okay at two
[00:34] bits actually, but we'll go through
[00:35] that. WAN 2.2 14 billion parameters text
[00:39] to video and LTX 2.3 22 billion
[00:43] parameter model. This one is a bit
[00:45] spicier, and that's because it generates
[00:47] the video and the audio together, which
[00:49] means now the picture and the sound can
[00:52] break separately. I ran the same prompt,
[00:54] the same seed, the same settings every
[00:57] single time. And as we walk down the
[00:59] ladder, only one thing actually changes,
[01:02] just the quantization. And all of this
[01:04] on a custom Linux box that I built
[01:06] running an RTX Pro 6000 Blackwell.
[01:10] That's 96 gigs of RAM, which comfortably
[01:12] fit all the precision models that I
[01:14] have. Now, here's what I didn't expect.
[01:17] Two completely different architectures
[01:19] built by two completely different teams,
[01:21] and they eventually kind of fall apart
[01:23] in the same way. Let's go through it.
[01:28] So, this is the reference for when I got
[01:31] FP16.
[01:33] Looking good. Looking good. For LTX,
[01:35] it's basically the same thing. is BF-16
[01:38] just slightly different quantization but
[01:40] they're both full format or full
[01:42] precision and this is what everything
[01:44] else we're going to compare gets
[01:45] compared against for when I ran five
[01:48] prompts some are simple objects some are
[01:51] humans some busy scenes for LTX I
[01:54] measured a couple more things whether
[01:56] the words stayed correct
[01:58] >> does this support the new Phantom 5090
[02:00] >> and whether the audio still sounded
[02:01] intelligible
[02:02] >> did you try turning it off and on again
[02:04] >> then I scored the videos with some
[02:06] common ben benchmarks like SSIM, LPIPS,
[02:08] and prompt alignment tests, plus the
[02:10] test of my actual eyeballs and ear
[02:12] holes. But enough about my holes. Uh,
[02:15] let's see the next level so we can
[02:16] actually get something to compare it
[02:17] against, shall we? So, here's WAN FP16.
[02:20] The whole model is 27 GB. Quite chunky.
[02:23] And I do see pretty good character
[02:25] consistency. It looks pretty good except
[02:27] the very beginning two frames or so
[02:29] where it looks like an old I don't know
[02:31] TV CRT screen, but after that it
[02:34] balances out and the character remains
[02:36] pretty consistent throughout. The leaves
[02:38] look normal. Let's see. LTX.
[02:40] >> Does this support the new Phantom 5090?
[02:42] >> Oh yeah, 24 lanes.
[02:45] Wait,
[02:48] THEY LIED TO US AGAIN.
[02:50] >> DOES THIS support the new Phantom 509?
[02:52] >> That's crazy. Yeah, my prompt had him
[02:54] doing something funny, but uh that was
[02:57] just nuts. That's me and Dan at
[02:58] MicroEnter. But our voices are just not
[03:01] at all the same. Although the voices are
[03:04] very clear, very consistent. And after
[03:06] analyzing both the image quality and the
[03:09] audio quality on this one, it's kind of
[03:11] hard to see, but these are our
[03:12] baselines. And I will go through these
[03:15] very soon here. This tiny thing has
[03:17] quietly become one of the most useful
[03:18] tools I carry. As someone who constantly
[03:20] is bouncing between meetings,
[03:22] conferences, and content, I need a
[03:23] better way to keep track of the details.
[03:25] The hard part for me is I cannot stay
[03:27] fully present, listen, and get footage
[03:30] and take clean notes all at the same
[03:31] time. So now I use Plaude Notepin S like
[03:34] a second brain for meetings, interviews,
[03:36] and event days. Most note-taking setups
[03:39] still leave me doing the worst part
[03:40] afterwards, sorting out who said what
[03:42] and what actually matters. This thing is
[03:44] actually really simple to use. One click
[03:46] starts the recording. The physical
[03:48] button helps mark key moments and then
[03:51] it organizes everything for me after. It
[03:53] can capture up to 20 hours non-stop and
[03:56] then turns that into transcripts with
[03:58] speaker labels, clean summaries, and
[04:00] actionable to-do lists instead of one
[04:02] giant recording that I never revisit. I
[04:04] also really like Ask Plaude. It lets me
[04:06] pull up past information or think
[04:07] through next steps without digging
[04:09] through everything manually. The big win
[04:11] for me is less mental load and better
[04:13] followthrough. And I'm saying that as
[04:15] someone who's been using Plot since
[04:17] 2024, I went through all the different
[04:19] versions. Obviously, use it where
[04:21] recording is appropriate and always get
[04:23] permission, but as a workflow tool, this
[04:25] thing has really been useful for me. Use
[04:27] my code, Alex 15 off for 15% off.
[04:30] There's also a Prime Day deal plus
[04:32] 30-day free return policy. Check the
[04:33] link in the description.
[04:37] Now, we cut to half the bits, and this
[04:39] is where it gets weird. eight bits per
[04:40] weight, but specifically the FP8 format.
[04:44] So, floating points, half the bytes of
[04:46] FP16. FP8 is natively supported on this
[04:49] GPU. So, that should be a slam dunk. FP8
[04:52] is 14 GB on disk. How's the quality? So,
[04:54] here I started with the simplest thing
[04:56] that I rendered. And this is a just a
[04:58] glass of water just sitting there.
[04:59] Camera is moving around just a little
[05:01] bit. Whatever changes you see here is
[05:03] just the model basically rendering
[05:05] things differently. Even though the seat
[05:06] is exactly the same, the FP16 version
[05:08] looks just a little bit more realistic
[05:10] to me, except for what are these lines
[05:12] walking across the table? I don't know,
[05:14] it might be raining or something or
[05:15] something else is moving in the room on
[05:17] the right. It's a little choppier and a
[05:19] little bit more blurry, but if it wasn't
[05:21] next to the FP16 image, it would just
[05:23] pass. Here's how things change. FP8 is
[05:25] already off the baseline here. This is
[05:27] the static detail video.19 on LPIPS. And
[05:31] LPIPS is basically like my eyeballs in
[05:34] software. If it was zero, that would
[05:36] mean it's identical. And the higher the
[05:38] numbers, it means it's more different
[05:39] from the original. Now, here's the
[05:41] surprise. The very next level down, it's
[05:44] not really down. It's parallel. I'd say
[05:46] it's Q80. So, it's still 8 bits per
[05:49] weight, but in a different format. It's
[05:52] integer 8 with kant grouping. On the
[05:54] glass video, Q8 lands at 07. It's almost
[05:59] identical to full precision, while FP8
[06:01] is about twice that much. And yeah, look
[06:03] at that. The glass actually looks almost
[06:06] identical to the FP16 in the video
[06:09] itself, according to my balls in the
[06:11] eye. Q8 pretty much the same disc size
[06:13] as FP8, but better fidelity. And guess
[06:16] what? The average across all the five
[06:19] prompts here, FP8 is still about twice
[06:22] as far from baseline as Q8. So FP8, the
[06:25] format with hardware acceleration that
[06:27] everybody said was the future. It drifts
[06:29] further and further from full precision
[06:31] than the older INT8 approach. Same
[06:34] number of bits. The difference is just
[06:36] where it spends that precision. And here
[06:38] is the kicker. The red car. A simple
[06:40] motion prompt. There's FP16. At FP8, the
[06:44] car drives backwards. Not in any other
[06:47] quantization does this happen. Just FP8.
[06:50] And this time it's not just slightly
[06:52] different rendering. It's just wrong. So
[06:54] more bits is not the same as better. The
[06:56] format does more work than the bit count
[06:59] does. Remember that because we're about
[07:00] to watch the same exact surprise happen
[07:03] in a completely different model.
[07:07] FP8 again. Same hardware acceleration,
[07:10] same expected slam dunk.
[07:12] >> Does this support the new Phantom 5090?
[07:14] >> Looks about the same, right? Watch the
[07:15] face and listen at the end.
[07:17] >> Oh yeah, 24 lanes.
[07:20] Wait,
[07:21] >> they lied to us again.
[07:24] >> Did you catch that?
[07:27] Whisper picks it up. Word error rate on
[07:30] FP8 is.18. And basically, word error
[07:33] rate is just how many words drifted from
[07:36] the baseline transcript. Zero is
[07:38] identical. This is the only quantization
[07:41] between BF-16 and Q3KM with a nonzero
[07:45] WER word error rate. The model added a
[07:48] laugh that does not exist in the
[07:50] baseline audio. SSIM 87, LPIPS is at
[07:55] 0.07. Pretty good. By the way, the top
[07:58] three are for video quality comparisons.
[08:01] And the bottom two for LTX only are for
[08:03] audio. And here we have MEL spectrogram
[08:05] MSSE 26.7.
[08:07] And for video, by the way, the SSIM is
[08:10] the pixel match. So one would be
[08:14] identical. Obviously BF16 is identical
[08:16] to itself. So that's one. And here on
[08:18] FP8, we're sliding down 2.8. And Mel
[08:21] MSSE down here is the audio fingerprint.
[08:24] So zero would be identical in this case.
[08:26] Anything higher than that is drift.
[08:28] >> Does this support the new Phantom 5090?
[08:30] >> Oh yeah. 24 lanes.
[08:34] >> Wait.
[08:38] >> So compare that to Q80.
[08:41] One level down on the ladder. sort of
[08:44] more like horizontal. Same 8 bits per
[08:47] weight. Of course, different format
[08:49] though. Look at the difference between
[08:50] BF16 and Q80. There's a huge difference
[08:53] in the amount of space it takes. 46 GB
[08:56] versus 23, but they look identical. Even
[08:58] the motion blur in those exact moments,
[09:01] in those frames, is exactly the same,
[09:03] but FB8 not. And Q8 is better on every
[09:07] single metric, both video and audio. So
[09:11] FBA underperformed in Juan WAN J one, I
[09:15] don't know how to say that properly,
[09:17] don't ask me. And uh it also
[09:20] underperformed in LTX. Two different
[09:23] model architectures, two different
[09:25] teams, two different training runs.
[09:27] Weird, right? Maybe not. So if you've
[09:29] got a choice between FB8 and Q8 for a
[09:33] video model right now, take Q8. I'm
[09:35] going to skip over levels between Q6 and
[09:39] Q5 because they do get a little bit
[09:42] worse, but there's no real big jumps
[09:45] here until you get to Q4. In fact, with
[09:48] these glasses, Q4 looks pretty good to
[09:50] me, too. Same thing with the car. I see
[09:52] slight differences with the detail of
[09:55] the car itself, but overall, the motion,
[09:58] the clarity looks pretty good. Let's
[10:00] take a look at the lady here. Q6 and Q5,
[10:03] both 12 and 11 GB respectively on disk.
[10:06] It definitely looks like the same exact
[10:08] lady. So, what happens at Q4? Can we
[10:10] save more space and actually get away
[10:12] with it?
[10:16] Q4, 9 GB on disc. This is the kind of
[10:19] thing you'd run on a 24 gig consumer
[10:22] GPU. And this is where most of the
[10:23] community lives. And if you watch this
[10:26] in isolation, you probably think, well,
[10:28] it's fine. Sure, the face is a little
[10:31] bit fuzzier and a little bit not as
[10:33] crisp, but it's passable. The forest
[10:36] still moves, but if you compare it, Al
[10:38] Pips says we are at.34. That's further
[10:44] away than FP8. For a complex scene,
[10:46] we're at.35. What about that glass of
[10:49] water? Not so bad here. 2 for Elps. That
[10:52] character consistency is getting there.
[10:54] Let me show you. Notice anything
[10:55] different about her hair? And also, it
[10:57] kind of doesn't look like the same woman
[10:59] anymore. Here's the complex scene. It's
[11:00] a little bit harder to tell here. Tokyo
[11:03] night market. Quarter disc size of FB16,
[11:06] but it still holds together. This is
[11:08] kind of like the sweet spot over here.
[11:10] And you can stop here if you don't have
[11:13] any reason to get any smaller. Red car
[11:15] looks fine. And do comment down below if
[11:18] you notice any weirdnesses that I didn't
[11:20] notice. We save a ton of space in LTX
[11:23] 2.3. The Q4 is only 14 GB here. There's
[11:26] some extra weirdness going on here with
[11:29] the face there and my eyes and Dan's
[11:31] eyes and the unexpected reaction makes
[11:34] its reappearance.
[11:35] >> YOU LIED TO US AGAIN.
[11:36] >> BUT LOOK AT THE Mel spectrogram here. We
[11:39] just jumped to 46.9.
[11:41] One level up at Q5 it was just 9.9. So
[11:46] the audio fidelity just dropped roughly
[11:49] five times in a single step. Now check
[11:51] the top row. The video metrics. SSIM is
[11:54] 088 basically right where it was. L PIPS
[11:56] is 0.07. The picture is right about
[11:59] where it was for FP8. So it's definitely
[12:02] gradually getting worse here. And Q4
[12:04] shows a big change at least in the
[12:06] objective measurements, but not as much
[12:08] as audio. So that's finding number two.
[12:10] Audio degrades before video here. Even
[12:13] though it might not be perceived as such
[12:16] or might not be as noticeable as video,
[12:18] if you're only watching the picture,
[12:20] you're going to miss that. And why does
[12:21] this matter? The picture degrading is
[12:23] something you might catch on a rewatch,
[12:26] but the audio degrading is something the
[12:28] viewer hears immediately. You ever watch
[12:30] a YouTube video with terrible audio? I
[12:32] hope I hope my audio is actually decent
[12:34] here. Can't be perfect, but I try. But
[12:37] you can put up with pretty bad video.
[12:40] However, if you hear terrible audio,
[12:42] people will just click away right away.
[12:44] Very different tolerance levels. So
[12:46] models like LTX, the ones that support
[12:48] audio, have to take extra special care.
[12:54] All right, two bits per weight. This is
[12:56] 5 GB for when this is the bottom of the
[13:00] ladder. And it shows that glass is
[13:05] pretty bad looking. There's even
[13:07] differences frame to frame. Look at the
[13:09] lady. Woo, that's terrible. And Q3 is
[13:12] very similar to Q4 where it does mess
[13:15] with the hair quite a bit from the
[13:17] original and doesn't look at all like
[13:19] the original. But Q2 is a whole
[13:21] different level that's completely
[13:22] unusable here at this point. Look at
[13:24] this character consistency chart. L Pips
[13:27] is 0.54. Tokyo market the complex scene
[13:31] we're at.57
[13:33] even worse. Both up about 60% from Q4.
[13:37] Now, LTX at the same two bits does the
[13:40] exact same thing. Look at that first
[13:41] frame. Looks pretty good, right? This is
[13:43] image to video, by the way, in case you
[13:44] didn't know. Small model, 8.3 GB. But
[13:47] look what happens if I play this. Does
[13:49] this support the new Phantom 5090? Oh
[13:51] yeah, 24 lanes.
[13:54] Wait,
[13:57] THEY LIED TO US AGAIN.
[13:59] >> OH MY GOD, that one just like tugs at
[14:01] the heartstrings. The audio is very
[14:03] different. It sounds robotic until he
[14:06] screams. Then it sounds like more of a
[14:08] somebody trying to get an Oscar. But
[14:09] look how terrible the video quality is
[14:12] at every frame. Anything that's moving
[14:14] is basically completely destroyed and
[14:16] smashed.
[14:20] Whoa. Look at the transcript here. Word
[14:23] error rate here for Q3 and Q2. It went
[14:26] from they lied to us again to they lie
[14:29] to us again. Caps in the middle of the
[14:31] sentence. These are not the prompts, by
[14:33] the way. These are the transcripts for
[14:35] that uh whisper test that are generated
[14:37] from the video. And for LTX, it's not
[14:39] just this one skit. LTX again. This is
[14:42] BF16. FP8 looking like a very different
[14:46] person. Q8, Q6, Q5
[14:49] look like BF-16. Pretty much pretty much
[14:51] the same person. But the leaves are
[14:53] wrong. Even in BF-16, those are not
[14:56] maple leaves. I don't know what that is.
[14:58] like a starfish in the shape of a leaf
[15:00] or a leaf in the shape of a starfish. I
[15:02] guess the shirt is also very difficult
[15:05] here. Every single one of these has a
[15:07] different shirt. Q5 and Q4 are kind of
[15:10] the same. And look what happens with Q3.
[15:12] We have a different person here.
[15:16] >> Can you tell which one of me is the real
[15:18] one?
[15:19] >> She's not even looking at the camera.
[15:20] Forget about Q2.
[15:24] >> Can you tell which one of me is the real
[15:26] one? Yeah, it's not you. Actually, it's
[15:28] none of them. But some of these could
[15:30] pass for a real one.
[15:34] >> Can you tell which one of me is the real
[15:36] one?
[15:36] >> Did you notice the audio difference
[15:38] between BF-16 and Q2? Huge difference.
[15:42] This one sounds real. Here's Q2 again.
[15:44] >> Can you tell which one of me is the real
[15:46] one?
[15:46] >> Totally fake at this point, right? This
[15:48] is what her charts look like. Pretty
[15:50] gradual. SSIM, L PIPS, also pretty
[15:53] gradual, but you know, it gets up there.
[15:55] They all have a little bump on FP8 which
[15:57] makes it equivalent to Q4Q3.
[16:00] Let's check out the tech support scene.
[16:02] BF16. Listen to the audio too.
[16:05] >> Did you try turning it off and on again?
[16:10] >> I AM THE IT DEPARTMENT.
[16:15] >> Not sure what's going on over there.
[16:17] Something's going on with FP8. The lady
[16:19] is totally different.
[16:20] >> Try turning it off and on again.
[16:25] I AM THE IT DEPARTMENT.
[16:32] Look at her. She's not impressed. And
[16:34] the lady looks different in pretty much
[16:36] every single one of these. Her shirt
[16:38] color is different. The wall decorations
[16:41] are different. What's on the computer
[16:43] screen is different. But once we get to
[16:45] the 11 GB Q3, things just start melting
[16:48] down. Check this out.
[16:50] >> Did you try turning it off and on again?
[16:54] I AM THE IT DEPARTMENT.
[16:59] >> Kind of looks like Mr. Smith from the
[17:02] Matrix. You know, she's trying to push
[17:03] his buttons and she's winning. Q2.
[17:06] >> Did you try turning it off and on again?
[17:11] >> I am the
[17:14] IT department.
[17:16] >> Did you?
[17:17] >> Wow, that one is like way off the rails.
[17:19] First of all, the lady sounds robotic.
[17:21] The video is just totally destroyed.
[17:26] So faces are still the hardest part.
[17:29] Whisper for Q2 and Mel Spectrogram for
[17:32] Q2 all just are off the chart. Terrible.
[17:36] So by now it looks like two bits just
[17:38] wrecks everything. But here's what I did
[17:40] not expect. The glass of water scene
[17:43] SSIM is at 74 at two bits per weight. It
[17:47] doesn't look great when I'm examining
[17:48] with my balls of eye, but the numbers
[17:51] are saying it's okay. So, take these
[17:54] tests also with a grain of salt. I
[17:56] didn't come up with these tests. These
[17:57] are pretty much standard tests. So,
[18:00] yeah. Haven't shown you this one yet.
[18:02] The marble rolling down the ramp. And
[18:04] even though each one of these frames by
[18:06] themselves might look okay, the physics
[18:09] of this thing is just terrible at every
[18:12] single weight level. Even at full
[18:15] precision here, the ball just doesn't
[18:17] roll like a real ball. And then two
[18:20] balls get merged. That's just the model,
[18:22] not the quantization. It's just wrong,
[18:26] not necessarily worse. Although at Q2,
[18:29] you could pretty much say it's worse.
[18:30] So, finding number three, I'd say, is
[18:32] that there's no universal cliff. And
[18:35] that's true in both models. If the thing
[18:38] you're making is a single hard object in
[18:40] motion, you can probably ride this all
[18:43] the way down. But if you're making
[18:44] humans in it, the floor is a lot higher.
[18:47] Bottom line, run Q4 unless you've got a
[18:50] reason not to. And the sweet spot
[18:52] doesn't move when you switch model
[18:53] architectures. But also, if your output
[18:55] has audio, listen to it at Q4. The
[18:58] picture will trick you, but the voice
[19:00] will not. And if you remember one thing
[19:02] from this whole video, let it be this.
[19:05] Format matters more than bit count. The
[19:07] full ladders are linked down below.
[19:09] Every clip and every chart. And thanks
[19:11] to this rig, I was able to generate
[19:13] these videos pretty fast. If you want to
[19:15] know whether this 96 GB RTX Pro 6000 rig
[19:18] was actually worth it, that video is
[19:20] over here. Thanks for watching and I'll
[19:22] see you next time.