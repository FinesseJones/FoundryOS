# BUSINESS_DNA_SCHEMA.md

Version: 1.0

Status: Canonical Architecture Specification

Owner: AI Content Foundry (TACF)

---

# Purpose

The Business DNA Schema is the canonical knowledge model for every customer onboarded into the AI Content Foundry ecosystem.

Every AI agent reads from this schema.

Every analysis writes to this schema.

Every automation references this schema.

No agent maintains its own independent understanding of the business.

Business DNA is the single source of truth.

---

# Design Principles

1. Learn Once. Reuse Everywhere.
2. Never duplicate knowledge.
3. Every field must be explainable.
4. Every update is versioned.
5. Human approval overrides AI assumptions.
6. The schema grows without breaking existing agents.
7. Memory compounds over time.

---

# High-Level Architecture

Customer

↓

Website

Social Media

Documents

Videos

Emails

CRM

Products

Services

↓

Business DNA Engine

↓

Business DNA Profile

↓

Persistent Business Memory

↓

AI Agents

↓

Customer Outcomes

---

# Business DNA Object

```yaml
BusinessDNA:

  metadata:
    business_id:
    organization_name:
    legal_name:
    created_at:
    updated_at:
    schema_version:
    onboarding_completed:
    confidence_score:
    last_analysis:

  company:

    mission:

    vision:

    core_values:

    brand_story:

    elevator_pitch:

    unique_value_proposition:

    slogan:

    tagline:

    company_stage:

    founded_year:

    headquarters:

    industry:

    sub_industry:

    business_model:

    revenue_model:

    service_area:

    primary_language:

    secondary_languages:

    target_markets:

  offerings:

    products:

    services:

    flagship_offer:

    recurring_offers:

    seasonal_offers:

    pricing_model:

    guarantees:

    memberships:

    subscriptions:

    upsells:

    downsells:

  customer:

    ideal_customer_profile:

    buyer_personas:

    demographics:

    psychographics:

    customer_goals:

    customer_pain_points:

    customer_objections:

    buying_triggers:

    purchase_journey:

    decision_makers:

    average_customer_value:

    retention_strategy:

  brand:

    archetype:

    personality:

    emotional_positioning:

    communication_style:

    tone:

    writing_style:

    vocabulary:

    forbidden_words:

    preferred_words:

    preferred_phrases:

    cta_style:

    emoji_usage:

    punctuation_style:

    reading_level:

    humor_level:

    professionalism_level:

    inclusivity_guidelines:

    accessibility_guidelines:

  visual_identity:

    logo:

    color_palette:

    typography:

    photography_style:

    illustration_style:

    iconography:

    imagery_guidelines:

    design_system:

  content_strategy:

    content_pillars:

    messaging_framework:

    storytelling_style:

    educational_topics:

    promotional_topics:

    authority_topics:

    engagement_topics:

    posting_frequency:

    campaign_calendar:

    seasonal_campaigns:

    launch_templates:

    hashtags:

    keywords:

    seo_keywords:

    negative_keywords:

  channels:

    website:

      url:

      cms:

      seo_score:

      accessibility_score:

      mobile_score:

      speed_score:

      trust_score:

      conversion_score:

    blog:

    instagram:

    facebook:

    linkedin:

    youtube:

    tiktok:

    pinterest:

    x:

    email:

    podcast:

    community:

  audience:

    audience_size:

    engagement_rate:

    highest_performing_topics:

    weakest_topics:

    audience_questions:

    audience_sentiment:

    customer_language:

    testimonials:

    reviews:

    social_proof:

  competitors:

    direct:

    indirect:

    market_position:

    differentiators:

    weaknesses:

    opportunities:

    pricing_comparison:

    messaging_comparison:

  analytics:

    website_traffic:

    conversion_rate:

    lead_sources:

    revenue_sources:

    top_content:

    lowest_content:

    content_roi:

    customer_lifetime_value:

    acquisition_cost:

    retention_rate:

  compliance:

    legal_requirements:

    regulated_industry:

    disclaimers:

    privacy_requirements:

    accessibility_requirements:

    brand_guidelines:

  operations:

    team_members:

    approval_workflow:

    publishing_permissions:

    business_hours:

    contact_information:

    internal_notes:

  ai_preferences:

    default_model:

    creativity_level:

    reasoning_level:

    approval_required:

    auto_publish:

    preferred_platforms:

    preferred_content_length:

    preferred_output_format:

  learning:

    successful_posts:

    unsuccessful_posts:

    lessons_learned:

    evolving_voice:

    customer_feedback:

    ai_feedback:

    optimization_history:

    experiments:

    winning_patterns:

    failed_patterns:

    next_recommendations:

  security:

    impersonation_attempts:

    harmful_comments:

    reputation_alerts:

    phishing_mentions:

    moderation_history:

    crisis_events:

    security_score:

  integrations:

    connected_platforms:

    api_keys_present:

    oauth_connections:

    sync_status:

    last_sync:

  memory:

    long_term_memory:

    short_term_memory:

    episodic_memory:

    semantic_memory:

    conversation_history:

    important_events:

    milestones:

    archived_versions:
```

---

# Agent Access Matrix

## Brand Intelligence Agent

Read:

* company
* offerings
* customer
* brand
* visual_identity
* competitors

Write:

* brand
* analytics
* recommendations
* confidence_score

---

## Content Strategy Agent

Read:

* brand
* offerings
* audience
* content_strategy
* analytics

Write:

* campaign_calendar
* content_plans
* recommendations

---

## Publishing Agent

Read:

* channels
* campaign_calendar
* approvals

Write:

* publishing_history
* schedule
* delivery_status

---

## Website Agent

Read:

* website
* visual_identity
* brand

Write:

* website_audit
* redesign_recommendations

---

## Learning Agent

Read:
Everything

Write:
learning
analytics
recommendations
confidence_score

---

## Security Agent (Future)

Read:
comments
reviews
messages

Write:
security
alerts
risk_score

---

# Versioning Rules

Every Business DNA change creates:

* timestamp
* source
* confidence
* AI model used
* human approval status

No data is permanently deleted.

Historical versions remain queryable.

---

# Confidence Scores

Every field stores confidence.

Example:

```yaml
brand:
  tone:
    value: Professional and approachable
    confidence: 0.97
    source:
      website
      instagram
      onboarding_form
```

---

# Learning Rules

The Business DNA is never static.

Every interaction may improve:

* Voice
* Messaging
* Audience understanding
* Offers
* Content performance
* Brand consistency
* Customer preferences

The Learning Agent continuously proposes updates.

Humans approve strategic changes.

---

# North Star Principle

The purpose of Business DNA is not to describe a business.

The purpose of Business DNA is to enable every AI agent to think, communicate, and make decisions as if it were a deeply embedded member of that business.

Every future AI capability within AI Content Foundry begins and ends with Business DNA.
