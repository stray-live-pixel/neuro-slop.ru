This camera angle, the Z height is a
little off.
Make of that what you will. So, GLM 5.2
has been released. Although, it is
currently just restricted to use by
coding plan users. They do mention right
here in what is going to serve as the
entirety of the announcement post we
have for this model that API and chatbot
services will launch next week. The
model will also be officially
open-sourced under the MIT license. So,
before we get into it, please do feel
free to subscribe as I would like that
100k plaque. And really, the next thing
to do is basically start testing this
because this is genuinely like the
entirety of the announcement post for
this model. Obviously, next week when it
drops more officially, not officially,
but publicly, there will be a lot more
information about it. I suppose we could
quickly take a peek at GLM 5.1, which I
would imagine being an iterative point
one update, it is very likely going to
have the same amount of parameters
active and both total. So, if we look at
GLM 51, we can see it was a comparable
model to a lot of at that time
state-of-the-art models. So, hopefully
5.2 is an improvement over this score
right here. And this model, at least
5.1, is a 754
billion parameter mixture of experts
model with They also do mention
something here that is cool, the usable
1 million context support. So, if this
can actually stack up over longer
context lengths and perform well, that
would be very, very good to have,
especially in an open model like this.
Now, the only thing I've done is I did
pay for the subscription, and they list
right here that you can swap to the
latest GLM 5.2 model. I don't know that
I really want to talk about the
subscription because I'm paying for it
out of pocket, but in the past, the
performance has been very, very
lackluster. And they did also massively
increase the price, I think, recently.
So,
the flip side of that is it is going to
be open-source as well. So,
that is reasonable. With that, our next
step really is to just swap into
OpenCode, where I am going to be using
this model. You can feel free to follow
me on X at P Jean Owen. If don't use X,
I understand. Now, with that, we're
going to start just from within build
mode with the tried and true browser OS
test V2, and we'll see what we get. This
is pretty interesting. So, the level
that this is going in the depth of
actually checking the code prior to
serving a result, which on one hand is
frustrating cuz it takes longer, but on
the other hand, it's even checking like,
"Okay, how many times does this tag
appear? How many times does this tag get
closed?" I've noticed Now, I have not at
all even seen a single result from this
model yet, but I am filled with a bit of
confidence just in watching through its
chain of thought for this specific
generation. I generally tend to just
kind of like sit over here and just
watch as they are generating cuz you
kind of can get a feel when seeing the
chain of thought and the process it goes
through as well beyond just looking at
the end result. In terms of like the
model's vibes, for lack of a better
term. All right, it is giving us our
final report, and it's called GTA Clone
Gangster City.
So,
uh I'm very interested to see. And that
total time was around 15 and 1/2
minutes, keeping in mind that I did
begin this just from build mode. So, if
we had started it in plan mode, it would
have taken even longer, but it seemed
like it was doing a lot of checking over
the code. Oh, are you kidding? What is
this garbage dock?
With that out of the way,
let's begin by taking a look. So,
unfortunately, we do have some very odd
things to our dock here.
This almost just looks like the Gemini
logo, but we have our date and time of
the locale. Now, let's check. Is there a
right click?
Yes, there is a right click. Okay, good.
We can also toggle Hyper Drive, which is
inevitably some form of special feature.
Let's just start out by clicking on the
dock. Cool. We have a search function.
Um
And it does work.
I
Oh, okay. So, that's the wallpaper
changing.
That works. All right. Let's check out
Gangster City.
Full screen. Enter the city. F is to
enter exit the car. Shift is to sprint,
and space is the handbrake.
This is not bad.
This is like one of the few results
that's been on par with like the coin 27
b. No, I'm kidding. This is I will say
this arguably may be one of the most
properly city scaled results to this
I've seen before. Now, unfortunately, I
have not yet located any vehicles to um
borrow in this gangster city game. So,
and it even has drawn some yellow on the
road. Look at the amount of buildings
and things like that. That's And we do
have walking animation.
There's a car. Finally.
Decent car model. All right. So, F is to
get in the car.
All right.
Oh, now there's we see many more cars.
This is not bad. Can we
Yep. Okay.
I wonder if there's sound. I can't
imagine there is, but look at this. This
is actually quite a decent result in
terms of the map.
No, there's no sound.
Oh, okay. There are the police and they
said I was looking at it when it was
generating the code. Basically, if the
police car hits you, you're supposed to
lose health and that's exactly what
happened. It also had logic where if you
get away from the police, you start to
lose your wanted level as well. Now,
this is showing that we're going 218
mph. Perhaps some of the speed and scale
is a bit off, but we did finally have a
handbrake.
Okay, which just turns. But,
that like Look at the fog. This is
actually a proper implementation, more
or less, of fog for this scenario where
the buildings appear when we get closer
to them from the fog. This is actually a
very, very good
initial
result.
I guess.
The one thing I'm seeing is this little
local time thing up here is kind of
getting in our way, but that's okay.
Next up, we had space defender. I'm
always significantly less impressed in
the
space games, which
I suppose is
not really going to matter considering
it does not play. Okay, well, Space
Defender doesn't work, so that justifies
the amount of time I spent. Oh, good
god.
Ether browser with the ugliest swapped
gradient I've ever seen in my life.
Hacker news,
look at that. So, these sites are not
loading. However, it did actually put in
a bookmarks toolbar in the browser,
which I've also never seen before. Just
unfortunately, they're not necessarily
working.
Note, sites that block embedding will
appear blank. So, Wikipedia is the only
one that should work, but
the go button doesn't seem to be
functioning here. But still, aside from
that disastrous homepage gradient, that
was pretty cool. We have notes.
They save automatically. New note, and
we can swap between them. That's
interesting. This is kind of like a
macOS aesthetic to it in the way these
notes are
up here. Next up our abacus calculator.
Well done. Kind of iOS / macOS looking.
400
510
+ 2
Good.
Next up, terminal.
All right, a well-done terminal.
Very interesting uh
art. Finally, settings. And our special
feature, press F8 or click the Gemini
logo in the taskbar.
Every open window is lifted off the 2D
desktop and rendered live into a
real-time WebGL scene. They become
textured 3D panels floating in a
starfield that you can orbit through.
Well, I'm going to open everything then.
And then we'll try clicking that. That
is actually a very nicely done
implementation of this. This is very
good. I've seen attempts at this before,
and they have varying levels of success
in terms of how good it looks. This
looks very nice. Now, it did say we
could orbit through these. Perhaps not
like fully, but
that swap effect. That was That was
nice. This This is smooth. Check this
out.
The way it kind of flips them back. I'm
impressed with that, I will say.
That is very nicely done. If someone saw
that imagine seeing this like
screensaver in like a movie from 15
years ago, you'd be like, "Oh, that
person's a sci-fi villain."
That's awesome. I like it. So, next up
I've put this in its own empty folder
and I've begun it from plan mode. We're
giving it the self-contained C++ skate
game with the boardwalk aesthetic style.
I have also appended to the prompt don't
use raylib as sometimes that's just a
waste of time having to answer that
question once plan mode concludes with
its plan. Very quickly got to the point
where it was asking us some follow-up
questions.
We're now being presented with the plan
and I'm happy to note that it very
quickly got to this point. Sometimes I
don't necessarily want to start in plan
mode because it takes so long to get to
the point where it presents us and then
we have to wait for it to build. That
was very quick to give us the plan.
The compilation errors have been fixed,
so we're getting close now. It should
probably just test run this real quick.
Damn.
It's so so frustrating that consistently
we get results that look very good
potentially and then the like boardwalk
just doesn't have any color.
That looked potentially very nice
though. All right, we finally have our
completed skate game. It did take a
while and really the biggest thing that
we're going to notice is just the actual
like ground is not visible. Everything
else here is quite all right, I'm going
to say. Okay, um right as I said that.
Let's Okay, [snorts] we can restart. Now
again, we're going to notice that really
the fable, which is no longer available,
so it's not like it really is a fair
comparison. Um
that result has kind of skewed things,
but I'm going to say I don't know that
I've ever seen a curved rail like it did
there. If I reset again, we do have
walking pedestrians, we have
storefronts. The pieces are here,
they're just not 100% put together the
perfect way.
So, let's try.
Okay, that was a kickflip, I believe.
Well,
attempted kickflip.
Let's see if we can get over
the ramp. Okay.
That was good. We do have storefronts,
we have light posts, we have palm trees.
It did capture the aesthetic as one
would need it to.
Okay, keep moving. I want to see if we
can grind on the curved rail cuz I've
not seen one of those ever put in a
result like this before. All right,
overall, it's
acceptable, and we actually see there's
some water texture out there, too. So,
let's go take a peek at that. Okay, for
some reason I can now suddenly start
moving fine, and then it stops again.
All right, good. We got on the
half-pipe. Good, good.
>> [laughter]
>> And then we landed on this other ramp.
Interesting jittering movement there,
which actually was not horrible. The big
problem is Oh, okay. We didn't get stuck
on the tip of the rail there.
I find this is getting a bit more
redemption as I play it. Obviously, it's
a bit off, but
for an open weight model, I would say
I'm quite pleased. Now, in the meantime,
because the C++ skate test has been
around for a bit of time, I have also in
open code just straight from build mode
initiated a C++ rally game. This is
something I did in the exact same manner
in the Kimmy K 2.7 code test that I
posted yesterday. So, we'll I have some
form of like back-to-back comparison
between the two models at least. And as
this was just started from within build
mode, it will just build it. It isn't
allowed to use raylib here, and we'll
see what we get. All right, so we have
our completed rally game here, and from
what I see in these screenshots that are
just listed right there, this looks
really potentially very impressive. Now,
keep in mind it was allowed to use
raylib, which just makes things a bit
easier, but that is a phenomenal result
comparatively to what I've seen before.
And really, if one were to go back and
look at the K2.7 code video from
yesterday, this is quite a stark
difference. The terrain works well, the
way it actually drew the track around.
Now, the one thing that's not really
listed here is listed. I mean, there's a
steering wheel denoted in the prompt
that should turn when you hit WASD, but
this game is actually
This is a really well-done map for an
initial
I mean, you could build this out into
something
and it would actually feel pretty good.
There's some oddities to like like that
thing we're driving towards. I'm not
quite sure what's gone wrong there, but
this is
This is exceptionally well-done. This
really is exceptionally well-done.
I'm impressed.
And this is a really nice splash screen
as well.
Beautiful. That's really good. That's
really, really good. So, next up, just
from within build mode here, we're going
to do the beautifully detailed static
subway scene, and then following the
completion of this, we'll have it turned
into some form of game. All right, we've
received our static subway scene
results, so I've sent it the follow-up
to just turn it into some form of game.
In the meantime, let's take a peek and
see what we get. Boarding the platform.
All right.
Click to enter. This is nicely done. The
only thing I notice immediately is
basically our height is maybe a bit low,
or maybe that bench was just abnormally
gigantic. So, All right. Let's see. We
do have a bunch of different settings
beyond just brightness. That torus shape
is This scares me on some primal level,
and I'm not quite sure why. So, make of
that what you will. The actual like
boundaries here drawn for the do not
cross line are good. The tiles, it did a
really nice job on the tiles. We see
some that have different colors. It also
has stripes, both red and blue, as well
as that is is a security camera. We have
some signs there. Unfortunately, it
seems like the backing to the sign is
what is inverted, so that's the thing.
We have a clock, though, and the clock
is actually quite well done. It is 3:00
p.m. on the dot or a.m. on the dot.
All right, let's explore this more. We
have nice floating particles. The ground
looks good. Look at that, the daily
times left on the ground. There it does
have like some trash, even a cup on the
ground randomly. We also have the
subway, which is a bit odd. Can we Oh,
wow, there's actually mesh colliders, so
we can't even go beyond the yellow line
there.
And we have that disturbing
UFO thing there in the end. We have
platform one. Let's take a peek at some
of these settings, because it put in
more than just brightness. So, it went
above and beyond. Okay. Ooh. I like
that. That's like a nice scary
aesthetic. I want to try something
because it has flicker. So, if we turn
that up all the way,
Oh, yeah, it does do that. So, it makes
the lights flicker.
That's cool.
Interesting, because the prompt doesn't
say to put in any of this additional
stuff, so that's cool to see. We also
have dust.
Yep, I can't actually see a difference
in terms of particles floating around,
as well.
Let's turn the brightness back up a bit,
and then signage. I'm trying to see what
signage would
affect. All right, let's check our
updated into the FPS game. Oh, wow,
okay, that's quite an FPS splash screen.
Click to enter. Nice eerie sound. We
have ammunition information. Oh, look at
that. That's well done.
So,
someone in the comments yesterday,
because the K2.7 code did the same
thing, where apparently we have to hit
the specific red hit box in the enemy or
we won't do damage.
This ca- This camera angle, the Z height
is a little off.
>> [laughter]
>> Make of that what you will. All right.
Oh, they're behind me, too. Okay.
The big problem is
no damage is getting dealt even when I
do hit that hit box. And then
the low glock hum is
the sound effect is well done.
I don't think it's
Yeah, that Okay.
Look at the like camera shake [music]
when we Oh, wait. Can we Okay, no.
I don't Okay.
>> [laughter]
>> All right, supposedly the two issues are
fixed. Good. It did make us higher. Now,
let's just ensure that the weapon
actually has the ability to defend us.
Okay. This looks much better.
Yep, good.
Good. So, that wasn't working before.
This is good. Now, can we Okay,
unfortunately
we can't see any effects of the
ammunition when it hits the environment,
but that's okay. Overall, this is
This is well done.
Very much so.
Very aggressive camera shake, too, when
the weapon is firing. I'm very pleased
with this.
Next up, we're going to be trying a
newer front-end design test that also
tests the ability of this to make 3D
assets as well as cinematic renders with
said assets. So, this is the test to
create a beautiful website for Slap Ass
Watch Company. It should feature a
high-end hero section with an animation
panning around the watch, which is to be
placed on the table. The scene needs to
be created by the model, and it should
look like something rendered with
KeyShot. All right, let's check out our
watch website. And this is a front-end
design test, and it needs to also create
a 3D model of the watch. Okay.
It's supposed to orbit around it. It is.
It's just orbiting very lightly and
slowly. Okay, so that's the bracelet
link there. Now, I almost feel like this
went a little too hard in terms of
trying to make this look really good and
cinematic because we do see angles of
the watch. There is actually like a
sapphire face to it or something of the
sort. Now, the big issue is either the
reflection from that glass is messing up
the
No, that
hour hand and minute hand are just
placed in the wrong spot. So, I have to
say, I was expecting a bit better.
The overall like design and things like
that. This is what you would probably
expect from a
luxury watch brand. Now, if we scroll
down, we should see some additional
models. Okay, good. This is a little
more in line with what we wanted to see.
Unfortunately, things are just not 100%
there, but the rotation here does show
us a bit more about how it created these
watches. And I have to say again, I
thought it I was expecting a bit better
here to be completely honest. I'm going
to run another test, but in the
meantime, I'm going to give it some
feedback on this result, and we'll see
if how it improves it. So, I scolded a
bit about this watch website, so we
should have an updated version with
improved watch models. Okay, aside from
the Z fighting, that is a significant
improvement in the watch. Look at the
gold glistening there and things like
that. The face is significantly better.
We see a minute hand, hour hand, and a
second hand, as well as just the like
very fine aesthetic of this. Now, we did
also get to see
not experiences, models of these. Look
at that. That is a significant
improvement over what we had before.
Really, the biggest issue is that half
of the watch is just hidden into the
table, but the second hand on this one
is actually moving. This is a big, big
improvement over what we had first
received with this, and I'm very glad
that I kind of scolded it a bit and told
it like, "Hey, what are you doing?" And
then we also have the very, very
high-end one here as well. And both of
these do have their second hands moving.
This is
a big improvement from what we
originally had. The crown is there as
well. Very nice. And then of course,
this one was the 48,500
euro version, and then this one was the
19,900. So, this was the budget option
comparatively to this one. Very, very
cool. Next up, we're going to be doing
the 3D printer simulation test, and I
have added in the additional piece that
it should be able to accept STLs and
then emulate the printing of them. As I
do have an STL here that was generated
by Claude Fable and printed a little
physical momento of the short bit of
time where that model was available. If
anyone's interested in purchasing this
for a high price, let me know. All
right, here's our 3D printer sim result,
and this is one that needs to also be
able to upload and print an STL. Okay,
so far everything looks good.
Wow, that is a very, very tall printer,
but that is okay. We do have something
on the side here. I would assume that's
probably the power supply. The Z rails
look good, and the axis here, everything
looks good. All right, let's just start
it out. We have selectable filament
color, which I do like.
Okay, so sadly, at least for right now,
I'm not seeing any
actual extrusion on the bed. Just
meaning we don't see any orange plastic.
Let me pause this. I'll reset. We'll
make the layer height larger. We'll
change to a more visible color, at least
given this scene, and then we'll see.
Okay, so unfortunately, none of the
plastic is extruding, which is a little
frustrating. I'll just try with one
other shape just to verify. Okay. Well,
then we have something to give it in
terms of feedback. All right, it quickly
fixed the supposed issues that were
preventing us from being able to see the
extruded plastic, so
still nothing. That's frustrating. Oh.
Okay, but that's like come on. What
exactly is
Something's not right here with the
print logic. We can definitely determine
though it is going layer by layer. Uh
all right.
I will give this another chance because
it's going to be open weight. And it's
still like it's doing a very nice job.
All right, this is the third and final
chance for the printer sim to be fixed
just in terms of the plastic actually
visibly
extruding.
Uh-oh. Uh
Unfortunately, we're not getting
forward progress here. It's gotten worse
now. So, this has been given enough time
to try to just get the plastic to
actually properly appear here.
Unfortunately, that is going to be a
fail then and I don't actually have the
previous version to be able to check if
the STL upload would have worked. I
would have guessed it would have, but
unfortunately, it's just been making
things worse. It doesn't quite seem to
grasp the issue that it's having there.
As I was watching it when it was going
through and trying to fix things and it
was like I it was confused as to what
potentially could be happening.
So,
overall though, judging this just like
the model looks good, the materials look
good and things of the sort. So,
not all there. Now, I also wanted to do
a test that I've not really done before
except for when testing Fable. And the
test here was to create a V8 engine
model in an STL format. An STL being
something that could be printed just
like this right here, which was done by
Fable and actually 3D printed. I noticed
this seemed to have some pretty good
understanding of some concepts for 3D
printing just in looking through its
chain of thought here and what it was
doing and functioning and things of the
sort. So, I'm very interested to take a
look at our STL. I can see right here
just from the preview image that it
rendered, this is really quite all
right, and it did actually pay specific
mind to 3D printing. So, it mentions
that here. For the 45° banks are at the
FDM overhead limit, which is correct.
Print as is with supports or scale down
in your slicer. Good orientation, flat
on the oil pan, tree supports for the
banks in the pulley. The source is here,
tweak parameters, etc. All right,
finally. So, let's take a peek at this.
You know what? This did not do a bad job
at all. This does look like a V8 engine.
It has the pulley. It has the oil pan
there. Now, it was correct about placing
it flat on the oil pan,
which now the taper makes it a little
more difficult to print, but in real
life the oil would actually need to go
somewhere down below the engine. So,
that is proper. I will say, given the
fact that I just gave it a simple prompt
to spit out a V8 engine STL model or STL
file that could be printed, I think this
is a very respectable job that it did
here. And the way it did it was just all
programmatically through Python. It even
did include the OpenSCAD file here. So,
if we open this from within OpenSCAD as
well, we get to see it in here, and it
really I mean, I would say just based
off of all this that it did here, this
did a nice job, and I'm very pleased
with the result here, especially for an
open weight model. Doing 3D models
generated programmatically like this is
something that has been difficult for
models for quite a while. Fable was
absolutely like a different galaxy at
capability at doing this, but this right
here is actually quite competent in and
of itself just based off of this one
preview. So, I'm very happy to see this.
Next up, we're going to be giving this
the low poly motorcycle racing game
prompt. This is a more recent test that
I've come up with, and it's always fun
to see the differences. A lot of times
models will just get very confused in
the orientations of how the motorcycles
are supposed to be one created and two
actually positioned on a track. So,
although it may seem simpler on first
glance, there's a lot of like world
orientation capability that needs to go
in to creating something competent here.
Okay, so it's figuring out the gearing
and things of the sort. I've just
started this in build mode again cuz
this does think a lot. So, it will
competently come to a plan before it
even starts riding. All right, let's
take a look at our sport bike racer
game. Okay, this is a very very crowded
start screen, but that's okay cuz it did
put different styles of bikes as well as
different selectable riders. Let me
ensure my speaker is on. Good, it is.
All right.
>> [music]
>> Okay, let me turn this down. So,
this is actually
Now, as I said, a lot of models struggle
with properly placing like the movement.
So, we see the bike wheel is tilting
side to side.
And when we go forward, it seems like it
is doing a wheelie, which the prompt
does say it must, but it seems like the
back is bike words. The back is bike
words. The bike is backwards. That was a
a weird
Nonetheless,
this is actually
It's not perfect, although I'm going to
say the
like
the pieces are there, I suppose could be
said. Let's just try some different So,
okay, let's try the Falcon X and then
this rider. It's probably Okay, so
they're just different colors of the
same thing. I would like to see if I can
turn around. Yeah, that's cool. Some of
the grandstands and things are messed up
and the elevation of the track is
something that always really tricks
models up, but it did a nice job in the
actual tachometer and speedometer. We
have a gear indicator near where my head
is going to be in this video. So, the
lean works as well.
This is something that could be
iteratively refined into being a decent
overall result.
At first glance, it's not 100% there.
And the final thing I had running, just
because I like it, is of course the drum
kit simulation test.
Whoa.
That's very, very good. Now, this test
has been around for a while. So, I see
some issues here just in terms of faces
for the symbols not showing up properly,
but the actual kit model itself, aside
from the sideways bass drum skin,
very good.
Uh the hi-hat's not working.
Nor is the open hi-hat.
Okay, I just went blind from that high
tom, but it works.
I'll take it.
And then
All right, the ride doesn't work. We'll
just check auto play real quick.
Unfortunately, with the symbols not
fully working, it's going to restrict
some
funk groove.
Yep.
And if the hi-hat was working, it would
be much more vibrant. Disco house.
Okay. Yeah. And then finally, half-time
shuffle.
Oh.
All right.
Overall, not bad. Again, we're seeing
some weird like rendering issues with
things not properly appearing, and some
of the Uh now we can see the symbols if
we
go that way. Some of the symbols just
weren't working. So, not bad. So,
overall, that is going to conclude our
first look and test of GLM 5.2, which as
we touched upon in the introduction, is
currently restricted to use by coding
plan subscribers. In the next week, so
basically next week, as it's Saturday
afternoon right now, it will be
available through API, so you can test
it on open router, and then just for
general availability, as well as being
open weight MIT licensed on hugging
face, which is awesome. Now, as a
results overview, I think one of the
things I was very impressed with was the
V8 engine model, which there's just a
screenshot of its preview right there.
It did a nice job, and it was very
careful to craft it specifically to be
3D printing compatible, which I did like
to see. Additionally to that, the sword
by Graysor game was not the best. Those
oftentimes are something the model
struggle with. We did have our C++
skating game, and this was where it was
not allowed to use Raylib, which always
makes things a bit more difficult. In
retrospect, now looking back at this,
this is a very decent attempt. The
movement of the water and things like
that is nice. What really did let this
down is just the lack of a color for the
pavement or boardwalk or anything here,
as well as some oddity in the
>> [laughter]
>> some
some oddity in the end of the pole, uh
as we saw there. Now, I did also do
another C++ test, which was to allow it
to create a rally game, and this used
Raylib, and this was fantastic. This
really, just even from the splash
screen, this was a darn darn good result
for a C++ test, even though it didn't
properly draw the steering wheel as one
had expected, and it was made a little
simpler by allowing it to use Raylib.
This really definitely was one of the
winners here in terms of levels of
impressed I was. The watch website was
very interesting because the first
result was not the best, and then we
kind of yelled at it. Then it really
made a significant improvement to these
watch models, even to the point where
the second hands on them is moving. The
way that they're kind of half cut into
the table here is a little regrettable,
but that's a simple fix. Basically, just
remove the table for this specific hover
effect or preview.
This was cool to see. Additionally, what
else did we have? The subway game, well,
first we had just the static subway
scene, which was good. It put in
additional options that I don't tell it
to, such as adjustable dust and flicker
and things of the sort. Then the actual
game that it created from that was
pretty darn cool. I'm going to turn the
sound off just cuz it's it was like a
weird low hum and things like that. But
this was like just flat out
aggressive gameplay which is cool.
And the movement like the actual walking
of these NPCs was well-done. We see
there's a reloading effect. This was
very cool. Then one of the coolest
things I have to say was definitely the
special feature in the browser OS which
I had in the background for a lot of the
video just when open code was going on
the screen. This was pretty cool. I
think to conclude it, I don't really
know 100% how to judge this because
we're still coming off of the Fable like
magnificence. Though I will say having
just tested Kimmy K2.7 code and being
guessing that this is a smaller model
cuz this is likely the same size as GLM
5.1. I would go out on a limb and say
this is rather impressive especially for
open weights models. This is in my
opinion probably going to come out and
be the best open weight coding model or
in general model
that currently exists just from what I
saw here. I'll notice that in doing
generations it's one-shot generations
were not always like extremely
mind-blowing. But if you gave it the
chance to fix itself for everything
except the 3D printer sim, it would then
go ahead and do a really nice job
cleaning things up. I found that just
watching its chain of thought and
process when it was creating things, it
took a lot of aftercare with the code.
So the best analogy I can think of for
that is basically imagine you're getting
a haircut and they just take the razor
with the specific length and cut off
most of the hair. But then it was like a
barber who afterwards spends like a
significant amount of time just cutting
like every little area making sure there
are no long hairs or stray hairs. That's
kind of what this model felt like where
it would generate the code and then
following that it would really go
through it with a fine-tooth comb to
find things. So it was very interesting
and it does seem quite competent just
based off of what we saw with both that
relay lab rally game as well as the 3D
engine model. There does seem to be some
pretty beefy performance here and in an
open weight model, this is very, very
good. So, that is going to conclude our
testing of GLM 5.2. If you have any
questions, please feel free to leave
them in the comments and thanks for
watching.
