Imagine you are this engineer, a production data jog field hours ago.
The dashboard went stale, you have spent all day checking the logs, the schema, and the upstream data.
And now it is past midnight.
The same question keeps coming back. What change?
The failure itself may be small, but the expensive part is everything around it.
Inspection, diagnosis, choosing a safe response, rerunning the job,
and confirming that we did not make the data worse.
Hi, I'm Annemarie Benzon. In this talk, I will show an RL guided system
that selects bounded remediation action for ETL failures.
The central question is not simply whether an agent can act,
but whether it can act usefully, explainably, and within boundaries
that an operations team would actually trust.
Cloud ETL failures are rarely arrived as one clean, well-labeled exemption.
We see late or unavailable sources, schema drift,
daytime incompatibilities, now break spikes, type changes,
and runtime errors that do not match anything in the runbook.
The usual response is a human workflow.
Inspect the logs, form a diagnosis, a temporary pair, rerun the job,
and validate the output. Each step is reasonable.
The latency comes from head-offs, incomplete contacts,
and the need to avoid an unsafe fix.
In the capstone evaluation, the manual recovery baseline
was modeled at roughly 2.5 working days.
This represents an incident moving through normal queuing,
investigation, and approval.
So the engineering objective is specific.
Compress that loop for routine, recognizable failures,
while escalating the cases that are uncertain, novel, or high-risk.
This diagram shows the end-to-end AWS architecture from my capstone.
An existing AWS Glue ETL job emits a job-filled event.
Amazon EventBridge catches that event and triggers
the Lambda function that runs the agent.
Lambda gathers evidence from two read-only sources.
CloudWatch provides the error logs, while the GlueData catalog
provides the current schema metadata.
The system uses those signals to classify the failure,
assess the data quality and operational risk,
and construct the state pass to the RL decision engine.
The policy then proposes a bounded response.
The safety layer checks that proposal before the executor
can use the Glue API to re-trigger the job
or apply an approved remediation.
Amazon S restores agent artifacts, audit logs,
and quarantine outputs.
Finally, the job is rerun and validated.
So this is close operational loop.
Monitor, diagnose, score, decide,
check safety, act, and verify recovery.
The capstone implementation uses synthetic data
provided by the client.
The public repository preserves this pattern
through a sanitized generalized deployment template.
The intelligence layer deliberately separates three concerns.
Deterministic anomaly rules establish observable facts
if failed to disappear, a type change,
or the null rate cross a threshold.
The Q learning policy handles contextual action selection.
Given the current incident state,
should the system retry, coerce the schema, rollback,
quarantine, escalate, or simply log the event.
Then, a safety override sits outside the learned policy.
For example, if the anomaly is critical
and the policy proposes a passive action such as logging,
the override converts that choice into an escalation.
This separation is the design thesis of the project,
rules for facts, learning for bounded choices,
and guardrails for authority.
Before selecting an action,
the system has to establish what actually happened.
The schema profiler extracts structure,
types, nesting, and null rate statistics.
The drift detector compares the current profiler
with a baseline area and identifies additions,
removals, and type changes.
The data quality analyzer checks completeness,
validity, and consistency.
The error classifier maps log patterns into failure families,
and the risk score turns those signals
into an operational risk level.
These components are deterministic by design.
For directly observable data conditions,
an explicit rule is easier to validate,
explain, and audit than an opaque inference.
With richer and representative incident history,
some classifiers could become learned components.
But ML ready is not the same as ML required.
The simplest reliable component should own each decision.
The policy receives a compact state,
failure category, risk level, retry count,
drift severity, and data quality condition.
It then selects from six actions.
Retry, covers, rollback, quarantine, escalate, or log.
I use tabular key learning because the state and action
spaces are small.
The Q-table is cheap to evaluate,
and every decision can be inspected directly.
For this state, these were action values,
and this action won't.
Technically, each incident is modeled
as single step contextual decision implemented
with tabular key learning,
rather than as a long horizontal control task.
That formulation is deliberate.
The system needs to choose one safe operational response
from a bounded action set.
The value of the learned policy here
is not sophistication for its own sake.
It is structured way to learn action preferences
from outcomes while retaining a decision surface
that an engineer can expect.
The learned policy does not have final authority.
It proposes an action.
The safety layer evaluates the proposal
against the anomaly severity
and the system's operational constraints.
Passive actions are overridden for critical conditions
and high risk or unknown cases are escalated.
Every proposal override execution result
and validation outcome is written
to an audit record.
Notice that escalation is included
in the action space.
That's not agent giving up.
It is the system correctly recognizing
the boundary of its evidence or authority.
For an operational agent,
the ability to say,
I should not do this automatically
is a capability.
If success is measured only by non-escalation,
the optimization target is wrong.
Here's one failure path.
The agent receives a glue-style job failure event.
The log classifier detects a daytime format
with 0.9 confidence.
Based on the encoded state,
the policy proposes schema coercion.
The safety overrides does not fire
because this is not classified
as a critical anomaly.
But the executor then discovers
that automatic coercion is not available
for this specific case.
The system does not pretend
that the fix happened.
It records the proposed action,
reports that execution was unavailable,
and sends the incident for manual review.
This example shows two distinct controls,
policy safety and implementation capability.
An action can be safe in principle
and still be unavailable
in the current environment.
A robust agent must represent
both conditions explicitly.
To make the work independently reviewable
without exposing the client context,
I build a sanitized public benchmark
around the generalized AWS Lambda-style architecture.
The capstone implementation
used client-provided synthetic data.
The public repository uses newly generalized
synthetic schemas, records, logs,
and incident scenarios.
It contains no client documents,
infrastructure identifiers,
or business-specific values.
I ran four controlled experiment groups
and repeated the robustness evaluation
across 36 from 42 through 71.
The reported aggregates include
95% confidence intervals.
This preserves the system design
and experimental logic
in a form that other engineers
can inspect and rerun
while maintaining the confidentiality boundary.
On the controlled benchmark,
the rule-based anomaly detector
has a precision of 1,
recall of 0.8,
and an F1 score of 0.889.
That means the detector was conservative.
The anomalies it flag were correct
in this benchmark,
but it still missed some positive cases.
For operations, that distinction matters.
Perfect precision does not mean perfect detection.
For cases where the RL-guided workflow
resolving the incident successfully,
mean resolution time was about 5.24 minutes
across the 30 runs,
the simulated success rate was 74.63%,
plus or minus 1.51 percentage points.
The non-escalation rate was
88.63% plus or minus 0.89 points.
The chart compares that minute-scale result
with the modeled manual baseline
of 2.5 working days,
or that is 216,000 seconds.
Within the benchmark,
that is approximately a 99.85% reduction in MTTR.
This figure's quantified performance
within the controlled benchmark.
Within that scope,
they show that the architecture can automate
the fast path for known failure conditions.
Production validation is the next evaluation boundary.
The ablation results are, in my view,
the most useful part of the project.
The RL policy matched the equivalent deterministic policy,
a difference of 0 percentage points
within a 0.19 point confidence interval.
On this compact state space,
the learned policy maintained the same success level
as the hand-defined policy.
By contrast, the deterministic action selection
beat random selection by 15.63 points
and enabling the safety override
reduced non-escalation by about 15.03 points.
That decrease is intentional.
The guarded system escalates more often
when autonomy would be inappropriate.
So where did the reliability come from?
Primarily from structured state,
sensible decision logic,
and external safety constraints,
not from RL alone.
That is a useful engineering result.
In the current benchmark,
RL provides an inspectable learned decision surface
rather than an immediate success rate advantage.
Its value becomes more significant
as incident histories become richer,
action outcomes vary by context,
and manually maintaining every preference
becomes difficult.
This slide defines the current validation boundary.
The results come from synthetic scenarios.
The agent responds after a failure signal.
It does not predict a failure before it happens.
Real incident diversity may exceed the current state space.
Some remediation actions are simulated
or deliberately bounded,
and online learning in a production environment
would require strict approval gates,
versioned policies, rollback support,
and continuous monitoring.
The result is credible visibility demonstration
of the system design
with a clear path toward production validation.
The next step is a shadow mode deployment
on representative incident traces
where recommendations can be compared with human decisions
before the agent receives execution authority.
There are five takeaways I would leave with an engineering theme.
First, use deterministic logic for facts
that can be measured directly.
Second, use learning only
where contextual action selection adds real value.
Third, place safety constraints outside the learned policy
so a policy update cannot silently redefine its own authority.
Fourth, treat escalation and post-action validation
as first-class outcomes, not exemption paths.
And fifth, evaluate across repeated seeds
and compare against simple baselines.
A single favorable run is a demo, not evidence.
A practical self-healing system
does not need the largest possible model.
It needs a clear state, bounded action,
reproducible evaluation, observable decisions,
and the discipline to stop
when uncertainty exists its authority.
This brings us back to the engineer in the opening video.
The goal is not to eliminate human judgment.
It is to stop spending that judgment
on the same recognizable failure at two in the morning.
Before, the response is manual log inspection,
schema tracing, delayed dashboards,
and recovery process measured in working days.
After, the routine path becomes event-triggered diagnosis
and RL-guided but safety-constrained action,
explicit validation and recovery measured in minutes
when the case is supported.
The unusual or high-risk failures
are still go to the humans.
That is the point.
Human attention is to serve for incidents
where context, trade-offs, or authority
genuinely require it.
The code, synthetic benchmark, experiment scripts,
and reproducibility instructions
are available in the GitHub repository on-screen.
If you work on agent reliability,
data quality, or protection incident automation,
I would especially value your feedback
on state representation, reward design,
and safety boundary.
Thank you for watching.
