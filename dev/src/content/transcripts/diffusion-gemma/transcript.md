in some ways this one's a little better because the car is actually not sucked into the ground.
Google has released a very exciting open source model called Diffusion Gemma. Now aside from
being Apache 2.0 licensed, this is something that really may represent one of the future
directions of AI that can run quickly and efficiently on basically your at-home gaming PC.
So for today's video we're going to be taking a look at this with some technical things thrown
in because I personally have a difficult time conceptualizing sometimes like the Diffusion
models and how they work. I find it can be difficult to grasp with some of the examples
that do exist. So we're going to get started by just taking a quick peek at some of the
interesting things of note about this model. Please do feel free to subscribe as I do want
that 100k plaque and let's take a peek at Diffusion Gemma. So Diffusion Gemma as they
say right here is a 26 billion parameter mixture of experts model with 4 billion active,
so comparable to Gemma 4 26B-A4B at least in terms of some of the benchmarks we'll be seeing
here and we will also run some side to side comparisons not only to get a feel for the speed
differential with this model but also the quality of the outputted results as that is a
consideration especially with an experimental model like this. Now they do mention right here and
this specific benchmark was performed on an H100 GPU which is still not something a consumer
is going to have in their home but we can see right here that the speed for the Diffusion Gemma
model versus the regular Gemma 4 26B with MTP which just means that it's going to be a little
faster in generating tokens this is significantly significantly faster and considering that increase
in speed the drop-off in intelligence is not really comparable to the massive boost in speed
that one gets so this is very exciting for local AI and basically the next section is going
to give us specific insight into why the thing that is important here for folks who are going
to be interested in local AI as is very popular right now they basically say most language models
act like a typewriter generating one token at a time from left to right the gist of this
paragraph is essentially that that works very well for big data centers where models are being
served to a large number of users at one time so the requests can be batched together and
that efficiently utilizes those GPUs as they are set up in a data center to serve many different
users a home user like you or I who is just playing with this on our system has a different
basically bounds in what their GPU is able to do so a model like that that is working
traditionally in autoregressive LLM is not going to take full advantage efficiently of
our GPU there's going to be a lot of waiting happening as it generates that one token
at a time this diffusion model essentially inverts that because it keeps the GPU busy
while it's generating those batches of 256 tokens at a time so it does more work in that same
amount of time more properly utilizing the GPUs computational ability I guess could be said
diffusion gemma utilizes your hardware to its full potential the processors using a large
or doing a larger chunk of work at once and it upgrades your model inference from a single
sequential typewriter to a massive printing press that stamps an entire block of text
simultaneously TLDR a home user with say a 5090 will have their GPU more efficiently utilized for
this model therefore it runs faster it's a better fitting setup for a single user setup
so there is a section here on how text diffusion works and they pretty simply list it in three
steps one the canvas the model starts with a canvas of random placeholder tokens two the
model makes multiple passes this is iterative refinement locking in correct tokens and using
them as context clues to refine the rest and then finally the text converges into high quality
output now I personally find this graph a little difficult to conceptualize so I've have
a different example here that I'd like to kind of ascribe these three steps to this was made
with the help of Claude Fabel rest in peace but basically this is a 3d model of a keyboard
and the whole thing that we're going to see here is these blank keys are essentially what
we see in step one where the model is going to start with a canvas of random placeholder
tokens assume any blank key here is attributable or the same to that step one blank tokens now
the task here is basically step by step as this denoises it's going to converge towards one of
four keyboard layouts this is actually using a real diffusion model that was trained on this
laptop and it has awareness of for real keyboard layouts quarty vorac colmak and azerty so as this
starts to refine its predictions and actually denoise it's going to lock in keys which will
lead us to seeing step two right here where the model makes multiple passes locking in
correct tokens and using them as context clues to refine the rest so when we start to see keys
here that are locked in those will then be used in the next denoising step to refine
the rest or in this specific example point it towards one of these specific keyboard layouts
because it knows oh if q is right here then this is very likely going to be quarty or something of
the sort now i understand it can still be a little difficult for this to make sense so let's
just start by manually initiating the first step where this is actually going to be what we
see right here where we have our noisy canvas and it is going to perform a denoising step
now keep in mind them being blank right here is not one-to-one an example of how this is showing
it right here but more or less this is just designed to be a visual thing so okay that's
where we start with the noisy canvas and now it is going to predict a few and then it is
going to remask these so what we just saw there is it made a first pass and prediction
and these are predictions of keys that it was confident enough at to actually save so these
are not getting remasked which is just basically when these go back to blank from where they
were now in step two they say that the model is locking incorrect tokens and using them as context
clues to refine the rest so b and h being right here in our example we see h has eliminated the
dvorak keyboard option now this is a simplified example because there's only four potential
correct options in reality this is a gigantic neural network with 262 000 potential like
vocabulary pieces or something the point i'm trying to say is this is a much simpler explanation
but the process is the same so we're going to run another denoising step right here and okay
it has predicted another key and if we hover over these keys that have been remasked we're
actually seeing potential probability distributions of what this key may be depending on the canvas
as it sits right now so that really ties back into step two right here where it iteratively
refines if we go back right here multiple passes locking incorrect tokens and using them
as context clues to refine the next so these are all being used as context clues which can
be seen by the fact that the actual probability distributions for what any of these specific
keys could be will change as we run additional steps so i think this one let's find one
that's like not 100 certain and that would be this position 37 so let's run one other step
and see how our probability distribution changes with some more tokens locked in
okay i do believe those two got inverted in terms of their percentage but i don't actually
100 remember so okay so things are changing a bit and as we run steps we'll see more keys
are actually getting filled in and these would just essentially be locked in as the denoising
step processes okay that still seems to be going and it's still fairly unsure about this
one i've played with this so i know this key is one that generally does not get properly
confidently generated until much later in the process but we can see that slightly the
percentages are changing as to what this is expecting it to be and we'll just keep running
steps right here and the elimination of potential keyboard layouts that we see here
is a function of this specific demonstration that simplifies kind of what happens in the
actual diffusion process but just for a simple visual demo i find it can be helpful to see like
oh okay so that token being that can actually allow this to eliminate something so now it's
swapped back so now it's more likely that m will appear there whereas these had kind of
flip-flop a bit and then finally it got to a point where it knew enough tokens to know
definitively that okay the actual layout is qwerty again that's a simplification of what
happens and also the caveat of this demo is basically this just starts completely randomly
like a roll of the dice in reality when speaking with something like diffusion gemma here the
prompt that we actually send it will heavily influence like it won't just randomly start
picking letters here it will have some context as to where to i guess begin for lack of a
better term so really this is something i just wanted to show because i found that it
actually helped me personally to better conceptually understand what's going on in the
diffusion process keep in mind i'm not a google deep mind scientist and i whip this together with
a now deceased model claude fable so i mean i will put this on github in the link in the
description but be sure to like run it through an llm if you're confused about anything though
if we do auto right here this is actually a trained diffusion model that's running locally
on the system a potato computer will be able to train the model as the example will be
on github so no worries about that and then if you click auto you get to see the process
happen just in real time i was manually clicking step by step just so we could get a better look at
some of these things and finally before we get to playing with this this is just the actual model
on hugging face here it is apache 2.0 which is awesome and there are a bunch of different
quantizations as well for using mac systems there are mlx and i do believe this is now
supported in unsloth studio when i first started playing with this it wasn't so there
was kind of a patch to llama cpp that allowed me to use this therefore the speeds
that we're going to see here are not going to be anywhere close to what's listed in that specific
announcement post where it's doing like 1100 tokens per second and that's because i'm not
necessarily running this in the most gpu optimized way but the whole point of it is
just to see that there is a speed up even without any like real optimization for how this
should be served additionally to that we're going to do side by side tests just of how
the results compare to its non-diffusion sibling so to begin we're just going to
run some side-by-side speed comparisons with the same context length from a 5090 mobile laptop so
this laptop has 24 gigs of video ram i am just running this at a low context length of 2048
tokens i have thinking disabled and we're basically going to send it something simple
just to get a feel for the speed and what we're going to see right here this is just
a cool visual trick this is not actually visualization of the diffusion process
onslaught does have a command line thing that you can use if you go and click on their
documentation right here in the run diffusion gemma guide there is actually a command line
way where you can see the diffusion process happen in real time this just is simplified
just to make it look pretty okay so we see right here that the total speed was 93.6 tokens
per second which really is not great but this is a 5090 laptop system and this is a four bit
quantization of a 26 billion parameter mixture of experts model now we're going to go into
lm studio instead i now have the non-diffusion version of this model in lm studio here this
is the gemma 426ba4b and this is the qat version which just means that it hypothetically
performs better even at this four bit quant than the non-qat version it's called quantization
aware training and it makes it perform better when it's quantized versus just the standard
model being quantized down to four bit i know that may seem confusing it's not super important
right now but just know that this will have good quality comparatively so i'm giving this
the same exact prompt we have the same exact low context length set and thinking is also
disabled here so we're going to see immediately the token speed that we get and we'll be able
to compare them side by side and right there we see that we got 61.3 tokens per second
in very similar testing environments with the same prompt sent to it and the same total
context length set so the differential right there just between the two was 94 tokens per second
versus 61 tokens per second and this is not in an optimized way i'm not serving this through
vllm or using like a special version that would accelerate it more on this specific nvidia card
because i'm just more focused on the display of the diffusion model i suppose here however
let's just do something else now so i'm just instructing this to write a few paragraphs
about the imac g3 okay and this did actually think so that may have messed up our first
initial test i don't know why the thinking toggle button isn't working here fable must
have messed that up and we see okay we got a few paragraphs as well as thinking at a speed
of 114.2 tokens per second now it is very possible that there was an unfair result run
here because we didn't actually run the lm studio version with thinking enabled so let's fix that
all right so now we're back in lm studio and i have this time ensured that thinking is toggled
on here as well as i missed it the first time i do apologize for my incompetence there
and we've just asked it to write a few paragraphs about the imac g3
and we see that was 57 tokens per second versus what we got online for the same exact prompt
the same context length which was 114 tokens per second so that is quite a speed difference
i understand this is not a scientifically accurate test setup but more or less it gives
us some understanding of okay on the same exact system both with four bit quantized models
this one is running significantly faster and that is what is very cool about the entirety
like of the diffusion text model specifically for local ai is because it's going to properly
utilize the gpu in the way that a single user is going to get more benefit out of it
and really what was said in the announcement post there where they said that an autoregressive
lm like what we see and what we're using in lm studio is better suited for a data center
because it's not as fast right here but if there's a thousand of me speaking to this right now
the architecture works more efficiently for a data center to be serving this to a bunch
of different people with batched requests and things like that but a single person at home
is going to get more out of the diffusion model in terms of speed now let's talk a
little about some of the downsides of this and this is going to bring me into a next
test where i'm going to need a system that's going to be able to handle a significantly
longer bit of context than this laptop right here so i'm going to use my rtx 6000 pro
blackwell card right now and that is on the beige box behind me and it's running here it's
the same exact model the same exact quantization the same gguf everything the only thing is i'll
be able to really extend the context length here so we can do some true side-by-side testing
in terms of the result quality so i'm going to be giving this a simpler version of the tried
and true browser os test i have begun this just using the web interface that i have hooked up
to the system behind me with a longer context length as well as thinking enabled and i'm also
going to just begin it from lm studio which is actually running locally on the system
so from this point on any speed differential we notice is not at all comparable because
one is a laptop one is a desktop with a big beefy card so we're only focused on comparing quality
of the results right now as that's important as well though this is experimental and they
do specifically mention that all right so i now have two browser os results one created by the
regular gemma 4 26b 4b 4 bit quant qat version so a good 4 bit quant of the normal version so
that is right here and we'll open that and take a look at it okay there is no right click
i'm not going to spend a lot of time going through these but just to give ourselves a sense
of quality comparability between some random stuff we have a clock that is the correct time
we have a start menu okay and it just tells us like there is no start menu but all right
a decent notepad that opens when you click once a decent calculator 55 times 6 330 good
and then a somewhat functional terminal actually okay so this is overall not a bad result
for a model of this size especially that heavily quantized now let's take a peek at what we
received from the diffusion version of this model okay we have a gradient background there
still is no right click but there is a clock the correct time in our locale there is also
a start menu which just doesn't do anything so okay we have a notepad good very similar
in terms of the notepad our calculator much simpler and like the aesthetic before times
300 and where's the equal sign okay so that's perhaps like a good demonstration of some of
the differences okay so 54 times 3 would be 162 but that's okay so just a good thing there
and then a browser which is very interesting okay i didn't expect this to whip out a
functional browser from the 4-bit diffusion version but nonetheless it did and it actually
led us to wikipedia which would work in this because it's not going to block embedding so
impressive but just a good simple demonstration of some of the quality differential in a non
like controlled environment so let's do another one so the next one is going to be in a single
html file make me a 3d driving game and it is also running online here with the 6000 pro all
right let's take a look at our 3d driving games now first we'll start with the we'll
start with the normal model now so this is the one that was run through lm studio the
non-diffusion model okay you know what pretty solid we even have some obstacles can we lose
interesting so if we hit those sorry sometimes i get like sucked into actually playing these
games i have to remember this isn't like a normal model test but really this is not
bad for the quantization and an moe model very very solid output now let's take a peek
at what we got from the diffusion model and it's you see the relation between the two being
how similar the actual yellow obstacles they put our would almost go out on a limb and say
in some ways this one's a little better because the car is actually not sucked into the ground
but the entire point of this is just to showcase that for the speed increase we get with the
diffusion model the loss in intelligence is not huge comparatively to the gain in speed
and depending on the type of task you're going to do that may be a very very acceptable
trade-off this is dare i say good and let's just do one more maybe like a beautiful
static front end for something we'll go back to the throwback test that i liked to run very often
so we'll do the classic steve's pc repair website generation and we'll also go and run
that from within lm studio again i would like to reiterate that everything we're doing now is
purely a quality based comparison because the lm studio version right here is running locally
on this laptop and then the version that's running on the web right here is running on
the big desktop behind me so there's no comparison of speedier only quality and finally
let's take a look at the comparison between our steve's pc repair websites i think this time
now we'll just stick to the normal we'll start with the non-diffusion version okay this looks
quite good everything here is arranged nicely we do have some slight hover effects on these
cards the icons it's chosen to use are nice and well done even the header up here goes
translucent when you scroll down and there's a competent contact card as well as a footer
so overall nicely done now let's take a peek at the diffusion model result
okay again very similar i do see perhaps a bit less eloquence in terms of the hero section right
here it's less high tech modern a bit simpler nice hover effect though and if we scroll down
yeah we can definitely see this is slightly worse just in terms of overall quality although
now that i see it again it's a sort of a toss-up this one's more together and coherent
but that is a good looking contact card when judged independently and we also have a footer
and the header does go translucent as well so really the whole point of this is just to
give a few side-by-side examples from the diffusion model versus the non-diffusion model
same quantization the non-diffusion model was the qat version so we'll produce some
strong results just as we saw here overall i wanted to just do a video on this model
because while it may not be the most interesting thing to test by itself it's very exciting from
a research and directional standpoint especially for local ai which is very hot topic right now
because of what happened with fable i'm not going to waste anyone's time making a video
where i just give my opinions on the situation i don't like doing stuff like that i personally
am you just don't i don't know i don't enjoy that i'd rather test models i will say i see a
lot of folks fear-mongering saying like buy a gpu go into debt if you have to that is probably
one of the dumbest reactions to that specific scenario that i could imagine yes it shows that
intelligence can be taken away at any point in time if it is a model that does not exist
locally with you i don't think somebody should go spend five thousand dollars on a dgx spark
to protect themselves against that i think a proper trade-off and probably what a
non-reactionary person would say is go buy a hard drive with a couple terabytes and download some
of the models that are available on hugging face so if the day comes when things are actually
really being taken away from us you have them and then at that point you can go into debt
and buy the system then that will inevitably be more powerful than the gold box you would buy
now kind of accomplishing the same thing without the fear-mongering of giving people
advice to spend money they don't have when till that point a twenty dollar a month chat gpt or
clod subscription will fill the void better than a dgx spark that you take a loan out on so
i am a bit you know i have opinions but i try not to let them come in the channel too much
so back to the diffusion gemma that is going to conclude our first look and test of this
model it is very very exciting from a development standpoint again i will put the link for the
keyboard demo on hugging not hugging face on github i'll put that in the description
i'm not a deep mind research scientist so take it with a grain of salt but more or less it's
just a visual aid i think to help conceptualize some of what's going on here and overall it's
really cool to see this and play with it so i wanted to cover it some folks had suggested
i will or would and i have so thanks for the suggestions and if you have any questions
leave them in the comments thanks for watching
