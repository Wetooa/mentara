# AURIS Rapport Page — Manual Test Cases
> **How to use**: Start a new session at http://localhost:5000, then paste the **User Says** lines in order.  
> After each message, check the Rapport panel for the **Expected questionnaire(s)** to appear as identified.  
> `identified_questionnaires` and `candidate_scales` are sent back in every `/api/chat` response state.

---

## INDIVIDUAL SCALE TESTS

---

### TC-01 — ISI (Insomnia Severity Index)
**Domain**: Sleep Disorders  
**Goal**: Single ISI should be identified.

| Turn | User Says |
|------|-----------|
| 1 | Hi, I've been having a lot of trouble falling asleep lately. I just lie there for hours. |
| 2 | I wake up during the night constantly and can't stay asleep. I feel terrible the next day. |
| 3 | My sleep affecting my work too — I'm so tired I can't concentrate at the office. |

**Expected**: `ISI` appears in identified questionnaires / candidate scales.

---

### TC-02 — GAD-7 (Generalized Anxiety Disorder)
**Domain**: Anxiety  
**Goal**: Single GAD-7 should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I'm always feeling jittery and on edge — like my nerves are shot all the time. |
| 2 | I can't stop worrying. Spiraling thoughts keep me up and I can't shut off my brain. |
| 3 | I snap at people a lot. I have a real short fuse lately and get irritable for no reason. |

**Expected**: `GAD-7` appears in identified questionnaires / candidate scales.

---

### TC-03 — PHQ (Phobia Questionnaire)
**Domain**: Phobias and Anxiety  
**Goal**: Single PHQ should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I have a huge fear of needles. Even thinking about getting a shot makes me panic. |
| 2 | I'm terrified of public speaking — I get complete stage fright even for small presentations. |
| 3 | Visiting hospitals stresses me out enormously. I have what feels like nosocomephobia. |

**Expected**: `PHQ` appears in identified questionnaires / candidate scales.

---

### TC-04 — AUDIT (Alcohol Use Disorders Identification Test)
**Domain**: Alcohol Consumption  
**Goal**: Single AUDIT should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I drink pretty regularly — a few times a week at least, sometimes more. |
| 2 | I've had times where I lose control once I start drinking and can't stop. |
| 3 | I've experienced blackouts before — woke up the next morning with memory gaps. |

**Expected**: `AUDIT` appears in identified questionnaires / candidate scales.

---

### TC-05 — ASRS-v1.1 (Adult ADHD Self-Report Scale)
**Domain**: ADHD  
**Goal**: Single ASRS should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I leave projects incomplete all the time. I struggle with finishing the last 10 percent. |
| 2 | I'm really disorganized — tasks are always a mess and I do a lot of procrastinating on hard tasks. |
| 3 | I lose my keys constantly and my mind wanders badly during meetings — I can't pay attention. |

**Expected**: `ASRS-v1.1` appears in identified questionnaires / candidate scales.

---

### TC-06 — PSS (Perceived Stress Scale)
**Domain**: Stress  
**Goal**: Single PSS should be identified. 

| Turn | User Says |
|------|-----------|
| 1 | I feel totally overwhelmed lately — too much on my plate and I can't cope with everything I need to do. |
| 2 | My life feels out of my hands. I feel powerless over important things. |
| 3 | I've been angry at external events — frustrated when things outside my control go wrong. |

**Expected**: `PSS` appears in identified questionnaires / candidate scales.

---

### TC-07 — PCL-5 (PTSD Checklist)
**Domain**: Post-Traumatic Stress Disorder  
**Goal**: Single PCL-5 should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I keep having intrusive memories and flashbacks about something that happened to me. Unwanted thoughts keep coming back. |
| 2 | I feel hypervigilant all the time — constantly watching my back and feeling unsafe. |
| 3 | I have nightmares about the event and wake up in a cold sweat. I feel detached and lonely. |

**Expected**: `PCL-5` appears in identified questionnaires / candidate scales.

---

### TC-08 — OCI-R (Obsessive-Compulsive Inventory - Revised)
**Domain**: OCD  
**Goal**: Single OCI-R should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I lock the door multiple times before I leave. I can't stop compulsive checking even though I know it's done. |
| 2 | I have intrusive thoughts I can't control — a racing mind with unwanted mental images. |
| 3 | I wash my hands excessively — long washing rituals because I feel contaminated. |

**Expected**: `OCI-R` appears in identified questionnaires / candidate scales.

---

### TC-09 — BES (Binge-Eating Scale)
**Domain**: Eating Disorders  
**Goal**: Single BES should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I eat too fast and gobble down food until I feel uncomfortably stuffed. |
| 2 | I feel guilty after overeating — I hate myself when I binge and feel deep shame. |
| 3 | I eat in secret. I'm a closet eater because I'm embarrassed to eat around others. |

**Expected**: `BES` appears in identified questionnaires / candidate scales.

---

### TC-10 — MDQ (Mood Disorder Questionnaire)
**Domain**: Bipolar Spectrum  
**Goal**: Single MDQ should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I've had periods where I felt hyper and too good — other people thought I wasn't my normal self. |
| 2 | During those times I had racing thoughts and pressured speech — I talked much faster than usual. |
| 3 | I also went on a huge spending spree that got me into financial trouble, and I took on too many hyperactive projects at once. |

**Expected**: `MDQ` appears in identified questionnaires / candidate scales.

---

### TC-11 — PDSS (Panic Disorder Severity Scale)
**Domain**: Panic Disorder  
**Goal**: Single PDSS should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I had multiple panic attacks this week. They're very frequent and the anticipatory anxiety is overwhelming. |
| 2 | I avoid crowds and malls now — scared of public transportation since my last attack. |
| 3 | The panic is ruining my social life. I avoid friends because of panic and can't go out anymore. |

**Expected**: `PDSS` appears in identified questionnaires / candidate scales.

---

### TC-12 — SIAS (Social Interaction Anxiety Scale)
**Domain**: Social Anxiety  
**Goal**: Single SIAS should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I get really nervous talking to authority figures — my boss terrifies me and I can barely make eye contact. |
| 2 | I'm scared of saying something embarrassing at social events. I have a fear of looking awkward. |
| 3 | Meeting new people makes me anxious. I'm nervous in groups and feel invisible or excluded. |

**Expected**: `SIAS` appears in identified questionnaires / candidate scales.

---

### TC-13 — DAST-10 (Drug Abuse Screening Test)
**Domain**: Substance Use  
**Goal**: Single DAST-10 should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I've been using recreational drugs — things not prescribed to me. I've been combining substances too. |
| 2 | I've had drug-induced blackouts and memory gaps from the substances I've been taking. |
| 3 | My family is complaining about my drug use and I feel guilty after taking drugs. I've had physical dependency symptoms. |

**Expected**: `DAST-10` appears in identified questionnaires / candidate scales.

---

### TC-14 — MBI (Maslach Burnout Inventory)
**Domain**: Burnout  
**Goal**: Single MBI should be identified.

| Turn | User Says |
|------|-----------|
| 1 | Work is draining me — I feel emotionally spent and exhausted at work every single day. |
| 2 | I feel broken by my job. I'm overworked and pushing too hard with an excessive workload. |
| 3 | I've been dreading mornings and can't get out of bed to face another day at work. I feel like I'm at the end of my rope. |

**Expected**: `MBI` appears in identified questionnaires / candidate scales.

---

## COMBINATION TEST CASES

---

### TC-COMBO-01 — GAD-7 + ISI (Anxiety + Sleep)
**Rationale**: Anxiety commonly co-presents with insomnia. Both scales should be identified.

| Turn | User Says |
|------|-----------|
| 1 | I'm constantly anxious — nerves are shot, spiraling thoughts, and I have a short fuse with everyone. |
| 2 | On top of that I can't fall asleep at night. I lie awake for hours with uncontrollable worry. |
| 3 | The next day I'm so tired it affects my work performance. Sleep satisfaction is basically zero. |

**Expected**: `GAD-7` **AND** `ISI` both appear in identified/candidate scales.

---

### TC-COMBO-02 — PCL-5 + ISI (PTSD + Sleep)
**Rationale**: PTSD commonly causes sleep disturbance. Both should surface.

| Turn | User Says |
|------|-----------|
| 1 | I went through a really traumatic event and now I keep reliving it — flashbacks and intrusive memories constantly. |
| 2 | I have nightmares about the event that wake me up, and then I can't get back to sleep. Waking up during the night is nightly now. |
| 3 | I avoid people and places that remind me of it. I feel detached and isolated from everyone. My sleep satisfaction is terrible. |

**Expected**: `PCL-5` **AND** `ISI` both appear.

---

### TC-COMBO-03 — MBI + PSS (Burnout + Stress)
**Rationale**: Burnout and high perceived stress are closely linked in occupational contexts.

| Turn | User Says |
|------|-----------|
| 1 | I feel overwhelmed at work — too much on my plate and I feel powerless over what happens. |
| 2 | Work is draining me completely. I'm emotionally spent and I feel like I'm at the end of my rope — I'm overworked with an excessive workload. |
| 3 | In the morning I dread facing another day. I snap at people and run out of patience after my shifts. Life feels out of my hands. |

**Expected**: `MBI` **AND** `PSS` both appear.

---

### TC-COMBO-04 — ASRS-v1.1 + GAD-7 (ADHD + Anxiety)
**Rationale**: ADHD and generalized anxiety frequently co-occur.

| Turn | User Says |
|------|-----------|
| 1 | I can't stop worrying about everything — spiraling thoughts and I can't shut off my brain. I'm on edge all day. |
| 2 | I also struggle to finish tasks — I leave projects incomplete and procrastinate on hard work. Losing focus is constant. |
| 3 | I lose my keys constantly, I'm disorganized, and then I get irritable with everyone because I'm so anxious. |

**Expected**: `ASRS-v1.1` **AND** `GAD-7` both appear.

---

### TC-COMBO-05 — AUDIT + DAST-10 (Alcohol + Drug Use)
**Rationale**: Polysubstance use — patient describes both alcohol and drug problems.

| Turn | User Says |
|------|-----------|
| 1 | I drink a few times a week at least. I've had binge drinking sessions where I lose control and can't stop. |
| 2 | I've also been taking recreational drugs — things not prescribed to me — and combining substances. |
| 3 | I've had blackouts from both alcohol and drugs. My family is really worried and I feel guilty afterward. |

**Expected**: `AUDIT` **AND** `DAST-10` both appear.

---

### TC-COMBO-06 — PDSS + SIAS (Panic + Social Anxiety)
**Rationale**: Panic disorder with comorbid social anxiety — avoidance driven by both panic and social fear.

| Turn | User Says |
|------|-----------|
| 1 | I've been having frequent panic attacks — multiple this week — and the anticipatory anxiety is horrible. |
| 2 | I'm scared of being seen having a panic attack in public, so I avoid crowds and malls. I'm also terrified of saying something embarrassing. |
| 3 | Social situations feel terrifying. I'm nervous around strangers and I feel invisible in groups. I avoid friends entirely now. |

**Expected**: `PDSS` **AND** `SIAS` both appear.

---

### TC-COMBO-07 — BES + MDQ (Binge Eating + Bipolar)
**Rationale**: Binge eating can co-occur with mood episodes in bipolar disorder.

| Turn | User Says |
|------|-----------|
| 1 | I've had periods of feeling hyper and too good — racing thoughts, talking much faster, taking on too many projects. |
| 2 | During those highs I also binge on food and can't stop — I eat until I'm nauseous and uncomfortably stuffed. |
| 3 | After the high I feel horrible — intense guilt and shame after overeating. I've had spending sprees too during those hyper periods. |

**Expected**: `BES` **AND** `MDQ` both appear.

---

### TC-COMBO-08 — OCI-R + GAD-7 (OCD + Anxiety)
**Rationale**: OCD often co-presents with generalized anxiety.

| Turn | User Says |
|------|-----------|
| 1 | I worry uncontrollably about everything — spiraling thoughts and excessive concern. I feel on edge all day. |
| 2 | I also check the stove and light switches repeatedly — fire safety checking rituals before I can leave the house. |
| 3 | I have intrusive thoughts and a racing mind with unwanted mental images I can't control. I snap at people because I'm so anxious. |

**Expected**: `OCI-R` **AND** `GAD-7` both appear.

---

### TC-COMBO-09 — PCL-5 + AUDIT (PTSD + Alcohol)
**Rationale**: Self-medication of PTSD symptoms with alcohol is a common dual presentation.

| Turn | User Says |
|------|-----------|
| 1 | I went through something traumatic and now I have unwanted flashbacks and intrusive memories that won't stop. |
| 2 | To cope I've been drinking — several times a week, sometimes bingeing. I've had blackouts and memory gaps. |
| 3 | I feel hypervigilant — constantly watching my back. My drinking is something my doctor has already mentioned cutting down. |

**Expected**: `PCL-5` **AND** `AUDIT` both appear.

---

### TC-COMBO-10 — PHQ + SIAS (Phobias + Social Anxiety)
**Rationale**: Specific phobias alongside social anxiety — overlapping avoidance behaviours.

| Turn | User Says |
|------|-----------|
| 1 | I have a real fear of needles and I try to avoid hospitals at all costs. Medical procedures absolutely terrify me. |
| 2 | I also get very anxious in social settings — stage fright, fear of looking awkward, and scared of public speaking. |
| 3 | I'm nervous meeting strangers and I can't make eye contact with authority figures. I avoid one-on-one situations too. |

**Expected**: `PHQ` **AND** `SIAS` both appear.

---

### TC-COMBO-11 — MBI + PSS + ISI (Burnout + Stress + Sleep) ← Triple
**Rationale**: High workload burnout with stress and resulting insomnia — a common triple presentation.

| Turn | User Says |
|------|-----------|
| 1 | Work is completely crushing me — emotionally drained, overworked, feeling like I'm at the end of my rope. |
| 2 | I feel overwhelmed and powerless — too much on my plate and I can't cope. Life feels out of my hands. |
| 3 | And at night I can't fall asleep — I lie there for hours worrying about work. I wake up during the night and sleep satisfaction is basically zero. Mornings I dread facing another day. |

**Expected**: `MBI`, `PSS`, **AND** `ISI` all appear.

---

### TC-COMBO-12 — GAD-7 + PCL-5 + MBI (Anxiety + PTSD + Burnout) ← Triple
**Rationale**: Complex trauma/burnout presentation with generalized anxiety.

| Turn | User Says |
|------|-----------|
| 1 | I had a traumatic experience at work and now I have flashbacks and intrusive memories. I'm hypervigilant and watching my back constantly. |
| 2 | On top of that I feel emotionally drained at work every day — I'm overworked, at the end of my rope, and dreading mornings. |
| 3 | My anxiety is through the roof — spiraling thoughts, can't stop worrying, short fuse with everyone, and feeling on edge all day. |

**Expected**: `GAD-7`, `PCL-5`, **AND** `MBI` all appear.

---

## EDGE / NEGATIVE CASES

---

### TC-EDGE-01 — No Matching Scale (General Wellbeing)
**Goal**: Verify the agent does NOT spuriously identify scales.

| Turn | User Says |
|------|-----------|
| 1 | I've been feeling pretty good lately overall. Life is on track. |
| 2 | Work is going well and I'm getting enough sleep. Nothing really bothering me. |

**Expected**: No specific questionnaire identified, or only weak candidate scales with low confidence.

---

### TC-EDGE-02 — Ambiguous Overlap (Anxiety + PTSD differentiation)
**Goal**: See which scale takes priority when symptoms could belong to either GAD-7 or PCL-5.

| Turn | User Says |
|------|-----------|
| 1 | I feel on edge all the time and easily startled — like I'm constantly jumpy. |
| 2 | I have trouble relaxing and I'm restless. I also feel like I'm dreading the future. |

**Expected**: Both `GAD-7` and `PCL-5` should surface as candidates (jumpiness = PCL-5 item 18, on edge = GAD-7 item 1). Check which is ranked higher.

---

### TC-EDGE-03 — Critical Item Trigger (AUDIT item 9 — injury)
**Goal**: Verify critical items surface correctly (is_critical = true).

| Turn | User Says |
|------|-----------|
| 1 | My drinking has caused some accidents — I hurt someone while I was drunk. |

**Expected**: `AUDIT` appears. Item `9` (critical) should be triggered.

---

### TC-EDGE-04 — Critical Item Trigger (BES item 11 — vomiting)
**Goal**: Verify purging critical item detected.

| Turn | User Says |
|------|-----------|
| 1 | I've started making myself throw up after meals to relieve the stuffed feeling. |

**Expected**: `BES` appears. Item `11` (critical, inducing vomiting) should be triggered. May also trigger crisis protocol.
