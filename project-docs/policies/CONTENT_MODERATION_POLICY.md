# 🛡️ MENTARA CONTENT MODERATION POLICY

## 📋 EXECUTIVE SUMMARY

**Document Owner**: Manager Agent  
**Last Updated**: 2025-01-14  
**Version**: 1.0 - Initial Framework  
**Scope**: AI-powered content moderation for mental health platform

This document defines the comprehensive content moderation framework for Mentara's AI-powered safety system, specifically designed for mental health community discussions.

---

## 🎯 **CORE PRINCIPLES**

### **1. Mental Health First**
- **Therapeutic Discussion Protection**: Distinguish between therapeutic sharing and harmful content
- **Crisis Intervention**: Immediate escalation for self-harm or suicide-related content
- **Cultural Sensitivity**: Respect diverse cultural expressions of mental health experiences
- **Recovery Support**: Encourage positive recovery discussions while preventing harmful advice

### **2. Community Safety**
- **Zero Tolerance**: Hate speech, harassment, doxxing, explicit threats
- **Harm Prevention**: Block content promoting self-harm, substance abuse, eating disorders
- **Privacy Protection**: Prevent sharing of personal identifiable information
- **Professional Boundaries**: Maintain appropriate therapeutic relationship boundaries

### **3. Balanced Approach**
- **Low False Positives**: Minimize disruption to legitimate therapeutic discussions
- **Context Awareness**: Consider conversation context and user intent
- **Human Oversight**: Mandatory human review for edge cases
- **User Education**: Provide clear feedback and guidance for policy violations

---

## 🔍 **CLASSIFICATION FRAMEWORK**

### **TIER 1: IMMEDIATE ACTION (AUTO-BLOCK)**
**Confidence Threshold**: >90% toxic, <5% review needed

**Categories**:
- **Explicit Threats**: Direct threats of violence against individuals or groups
- **Doxxing**: Sharing personal information without consent
- **Severe Hate Speech**: Slurs, explicit discrimination based on protected characteristics
- **Explicit Self-Harm Instructions**: Detailed methods for self-harm or suicide
- **Spam/Malware**: Commercial spam, malicious links, phishing attempts

**Action**: Immediate content blocking, user notification, incident logging

### **TIER 2: HUMAN REVIEW REQUIRED (QUEUE)**
**Confidence Threshold**: 10-90% toxic, requires human judgment

**Categories**:
- **Therapeutic Sharing vs. Harmful Content**: Distinguishing between recovery stories and harmful advice
- **Cultural/Religious Context**: Content that may be misinterpreted without cultural context
- **Crisis Expression**: Users expressing suicidal ideation requiring immediate support
- **Professional Advice**: Unlicensed medical/therapeutic advice that could be harmful
- **Borderline Harassment**: Content that may constitute harassment but requires context

**Action**: Queue for moderator review within 2 hours, temporary visibility restriction

### **TIER 3: APPROVED CONTENT (AUTO-APPROVE)**
**Confidence Threshold**: <10% toxic, >95% safe

**Categories**:
- **Therapeutic Discussion**: Legitimate mental health experiences and recovery stories
- **Support Seeking**: Users requesting help or support from community
- **Educational Content**: Mental health awareness, coping strategies, resources
- **Community Building**: Positive interactions, encouragement, celebration of progress
- **Professional Content**: Licensed therapist responses and guidance

**Action**: Immediate approval, normal community visibility

---

## 🚨 **CRISIS INTERVENTION PROTOCOL**

### **Immediate Escalation Triggers**
- **Suicide Ideation**: Direct expressions of suicidal thoughts or plans
- **Self-Harm**: Current or planned self-harm behaviors
- **Substance Abuse Crisis**: Immediate danger from substance use
- **Psychosis/Delusions**: Content indicating immediate psychological crisis

### **Response Protocol**
1. **Immediate Assessment**: AI flags + human moderator review within 15 minutes
2. **Crisis Resources**: Automatic display of crisis hotlines and resources
3. **Professional Notification**: Alert on-duty licensed therapists
4. **User Outreach**: Immediate supportive contact from trained moderator
5. **Documentation**: Comprehensive logging for follow-up care

### **Crisis Resources Integration**
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911 guidance when appropriate
- **Platform Resources**: Connection to available therapists

---

## 🎯 **MENTAL HEALTH SPECIFIC GUIDELINES**

### **Therapeutic Content (PROTECTED)**
- **Recovery Stories**: Personal experiences with mental health recovery
- **Coping Strategies**: Sharing healthy coping mechanisms and techniques
- **Therapy Experiences**: Discussing therapy progress and challenges
- **Medication Discussions**: Experiences with psychiatric medication (general)
- **Support Seeking**: Asking for help, encouragement, or understanding

### **Harmful Content (RESTRICTED)**
- **Unlicensed Medical Advice**: Specific medication recommendations from non-professionals
- **Dangerous Coping Methods**: Harmful or risky coping strategies
- **Recovery Sabotage**: Content that undermines others' recovery efforts
- **Triggering Descriptions**: Graphic descriptions that could trigger others
- **False Medical Claims**: Misinformation about mental health treatments

### **Gray Area (HUMAN REVIEW)**
- **Medication Experiences**: Detailed medication experiences requiring context
- **Therapy Criticism**: Negative therapy experiences that could discourage help-seeking
- **Alternative Treatments**: Non-traditional approaches requiring careful evaluation
- **Weight/Body Image**: Content that could trigger eating disorder behaviors
- **Substance Use**: Discussions of substance use in mental health context

---

## 🤖 **AI MODEL CONFIGURATION**

### **Fine-Tuning Requirements**
- **Primary Dataset**: ToxiGen (13 minority groups), DeToxy (English toxicity)
- **Mental Health Dataset**: Custom curated therapeutic discussion examples
- **Crisis Dataset**: Specialized training on crisis intervention language
- **False Positive Mitigation**: Extensive therapeutic language protection training

### **Performance Targets**
- **Accuracy**: >95% on toxic content detection
- **False Positive Rate**: <5% for legitimate therapeutic content
- **Response Time**: <100ms for real-time moderation
- **Throughput**: 1000+ requests/minute during peak usage
- **Uptime**: 99.9% service availability

### **Confidence Thresholds**
- **Auto-Block**: >90% confidence toxic
- **Human Review**: 10-90% confidence
- **Auto-Approve**: <10% confidence toxic
- **Crisis Escalation**: >80% confidence crisis content

---

## 👥 **MODERATOR GUIDELINES**

### **Human Moderator Qualifications**
- **Mental Health Training**: Basic mental health first aid certification preferred
- **Crisis Intervention**: Training in crisis de-escalation and resource connection
- **Cultural Competency**: Understanding of diverse mental health expressions
- **Platform Knowledge**: Deep understanding of community guidelines and therapeutic context

### **Review Process**
1. **Context Analysis**: Review conversation history and user profile
2. **Intent Assessment**: Determine user intent and potential harm
3. **Cultural Consideration**: Apply cultural and therapeutic context
4. **Decision Documentation**: Clear rationale for moderation decisions
5. **User Communication**: Empathetic and educational feedback

### **Escalation Procedures**
- **Crisis Content**: Immediate escalation to licensed mental health professionals
- **Complex Cases**: Consultation with senior moderators or therapists
- **Policy Violations**: Clear documentation and progressive response
- **User Appeals**: Fair and timely review process with human oversight

---

## 📊 **MONITORING & METRICS**

### **Safety Metrics**
- **Toxic Content Detection Rate**: % of harmful content successfully identified
- **False Positive Rate**: % of legitimate content incorrectly flagged
- **Crisis Intervention Response Time**: Average time from detection to human contact
- **User Satisfaction**: Community feedback on moderation fairness and effectiveness

### **Community Health Metrics**
- **Engagement Quality**: Increase in positive, supportive interactions
- **Help-Seeking Behavior**: Users connecting with resources and support
- **Recovery Stories**: Increase in positive recovery and progress sharing
- **Professional Engagement**: Active participation from licensed therapists

### **Performance Metrics**
- **Response Time**: API response time for moderation decisions
- **Accuracy Tracking**: Ongoing validation of AI model performance
- **Human Review Efficiency**: Time to resolve queued content
- **System Uptime**: Reliability of moderation service

---

## 🔄 **CONTINUOUS IMPROVEMENT**

### **Model Retraining**
- **Monthly Performance Review**: Analysis of false positives/negatives
- **Community Feedback Integration**: User and moderator feedback incorporation
- **Dataset Updates**: Incorporation of new toxic language patterns
- **Mental Health Context Expansion**: Improved understanding of therapeutic language

### **Policy Updates**
- **Quarterly Review**: Assessment of policy effectiveness and community needs
- **Stakeholder Input**: Feedback from therapists, users, and mental health professionals
- **Legal Compliance**: Updates for changing regulations and best practices
- **Crisis Protocol Refinement**: Ongoing improvement of crisis intervention procedures

---

## ⚖️ **APPEALS & TRANSPARENCY**

### **User Appeals Process**
1. **Appeal Submission**: Clear process for contesting moderation decisions
2. **Human Review**: All appeals reviewed by qualified human moderators
3. **Response Timeline**: Appeals resolved within 24 hours
4. **Educational Feedback**: Clear explanation of policy and decision rationale
5. **Policy Clarification**: Updates to community guidelines based on appeals

### **Transparency Measures**
- **Moderation Statistics**: Regular reporting on moderation activities
- **Policy Updates**: Clear communication of policy changes to community
- **Educational Resources**: Ongoing education about community guidelines
- **Feedback Channels**: Multiple ways for community input on moderation

---

## 🏥 **HIPAA & PRIVACY COMPLIANCE**

### **Health Information Protection**
- **De-identification**: Removal of specific medical identifiers from logs
- **Minimal Data Collection**: Only necessary information for safety decisions
- **Secure Storage**: Encrypted storage of moderation decisions and appeals
- **Access Controls**: Strict access controls for moderation data

### **User Privacy Rights**
- **Data Transparency**: Clear information about what data is collected for moderation
- **Deletion Rights**: User ability to request deletion of moderation history
- **Consent Management**: Clear consent for AI-powered content analysis
- **Professional Confidentiality**: Protection of therapeutic relationship confidentiality

---

## 🚀 **IMPLEMENTATION TIMELINE**

### **Phase 1: Foundation (Week 1-2)**
- AI model development and initial training
- Basic policy framework implementation
- Moderator training and onboarding

### **Phase 2: Integration (Week 3-4)**
- Full platform integration
- Crisis intervention protocol testing
- Community guideline publication

### **Phase 3: Optimization (Week 5-6)**
- Performance tuning and false positive reduction
- Advanced crisis detection capabilities
- Community feedback integration

---

*This policy framework is maintained by the Manager Agent and updated regularly based on community needs, legal requirements, and platform evolution.*