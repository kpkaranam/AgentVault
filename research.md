# AgentVault: IAM & Authentication for AI Agents
## Complete Research, Landscape Analysis & Open-Source Architecture

**Version:** 1.0  
**Date:** March 16, 2026  
**Author:** Pavan (ppaei-opsec) + Claude Research  
**Status:** Architecture Proposal  
**License:** Apache 2.0 (proposed)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Part I — Existing IAM & OAuth for Human Login](#2-part-i--existing-iam--oauth-for-human-login)
3. [Part II — Current Landscape of AI Agent Authentication](#3-part-ii--current-landscape-of-ai-agent-authentication)
4. [Part III — Agent-to-Agent & MCP Authentication Frameworks](#4-part-iii--agent-to-agent--mcp-authentication-frameworks)
5. [Part IV — Real-Time Production Use Cases](#5-part-iv--real-time-production-use-cases)
6. [Part V — Human vs Agent IAM: A Fundamental Comparison](#6-part-v--human-vs-agent-iam-a-fundamental-comparison)
7. [Part VI — Benefits of Implementing Agent IAM](#7-part-vi--benefits-of-implementing-agent-iam)
8. [Part VII — Challenges & Limitations of Current Methods](#8-part-vii--challenges--limitations-of-current-methods)
9. [Part VIII — Future Developments & Standards Trajectory](#9-part-viii--future-developments--standards-trajectory)
10. [Part IX — The Open-Source Opportunity](#10-part-ix--the-open-source-opportunity)
11. [Part X — AgentVault: The Proposed Solution](#11-part-x--agentvault-the-proposed-solution)
12. [Part XI — Implementation Roadmap](#12-part-xi--implementation-roadmap)
13. [Part XII — References & Sources](#13-part-xii--references--sources)

---

## 1. Executive Summary

AI agents represent a fundamentally new identity type that existing IAM systems were never designed to handle. Every major cloud provider and identity vendor shipped agent-specific identity products in 2025, the IETF has over eight active drafts on agent authentication, and the industry has converged on OAuth 2.1 as the foundational protocol — but critical gaps in cross-organizational trust, delegation chains, and runtime behavior verification remain unsolved.

**The problem:** 91% of organizations are already deploying AI agents, yet only 10% have a strategy for managing their identities. The gap between agent adoption and agent governance is the defining security challenge of 2026.

**The cost problem:** Commercial agent IAM solutions from Microsoft, Okta/Auth0, and AWS charge per identity, per token, or per user — making them prohibitively expensive for startups, open-source projects, and organizations deploying agent fleets at scale. At 10,000 agents, commercial IAM licensing alone can exceed $300K/year.

**The proposed solution:** AgentVault — a composable, standards-based, fully open-source IAM stack purpose-built for AI agent ecosystems, built on Keycloak, SPIFFE/SPIRE, OPA/Cedar, AGNTCY, and OpenTelemetry. Zero vendor lock-in. Enterprise-grade security at zero licensing cost.

---

## 2. Part I — Existing IAM & OAuth for Human Login

### 2.1 Foundational Protocols

The current human identity landscape rests on three pillars:

**OAuth 2.0 / 2.1** handles authorization — delegated access to resources without sharing credentials. OAuth 2.1 (currently in IETF draft) consolidates best practices by making PKCE mandatory and deprecating the implicit grant. The core flow involves a Client requesting authorization from an Authorization Server, which issues access tokens that the client presents to a Resource Server.

**OpenID Connect (OIDC)** adds an authentication layer on top of OAuth — proving who you are via ID tokens (JWTs containing claims about the authenticated user). OIDC introduces the concept of an Identity Provider (IdP) that authenticates users and issues ID tokens alongside access tokens.

**SAML 2.0** handles enterprise SSO through XML-based assertions. While older, it remains deeply embedded in enterprise environments, particularly for workforce identity federation between corporate IdPs and SaaS applications.

### 2.2 Major Vendors & Their Approaches

**Okta / Auth0**
- Okta dominates enterprise workforce identity; Auth0 (acquired for $6.5B in 2021) handles developer-facing CIAM
- Auth0's Fine-Grained Authorization (FGA) is built on the OpenFGA relationship-based access control model, inspired by Google's Zanzibar paper
- Supports OAuth 2.0, OIDC, SAML, with Universal Login for consistent auth experiences
- Cost: Enterprise tiers range from $6-36/user/month; advanced features require premium plans

**Microsoft Entra ID (formerly Azure AD)**
- Deep integration with the Microsoft 365 ecosystem
- Conditional Access policies evaluate sign-in risk, device compliance, location, and application sensitivity
- Privileged Identity Management (PIM) for just-in-time role activation
- Workload Identity Federation based on the SPIFFE standard for non-human identities
- Cost: Included in Microsoft 365 enterprise licenses; standalone plans $6-12/user/month

**AWS IAM**
- JSON-based policies with Effect/Action/Resource/Condition structure enabling powerful ABAC
- AWS Cognito for customer-facing identity; IAM Identity Center for cross-account SSO
- IAM Roles for service-to-service authentication; STS for temporary credentials
- Cost: IAM is free; Cognito charges per MAU ($0.0055-0.025/MAU)

**Google Cloud IAM**
- Supports Allow Policies, Deny Policies, and Principal Access Boundary policies
- Managed Workload Identities based on SPIFFE for mTLS between services
- Context-Aware Access for conditional resource access
- Cost: IAM is free; premium features via BeyondCorp Enterprise

**Keycloak (CNCF Incubation Project)**
- Primary open-source alternative supporting OAuth 2.0, OIDC, SAML
- Full self-hosted control; zero licensing cost
- Fine-grained authorization services with UMA (User-Managed Access) support
- Extensible via Service Provider Interfaces (SPIs)
- As of version 26.4: native MCP authorization support and SPIFFE SVID authentication

### 2.3 Evolution of Authorization Models

Authorization has evolved beyond simple role-based access control:

| Model | Description | Example Tools |
|-------|-------------|---------------|
| **RBAC** | Permissions assigned to roles; users assigned to roles | Keycloak, Entra ID |
| **ABAC** | Evaluates attributes of users, resources, environment at decision time | AWS IAM, OPA |
| **ReBAC** | Models permissions based on entity relationships | Auth0 FGA, Google Zanzibar |
| **PBAC** | Policy engines externalize authorization logic into code | OPA (Rego), Cedar, Cerbos |

### 2.4 The Shared Assumption That Agents Break

All of these systems were designed with a shared assumption: **the entity requesting access is either a human being or a deterministic service with static, pre-defined behavior.** AI agents break both assumptions:

- Agents are not human (cannot use biometrics, passwords, MFA)
- Agents are not deterministic (behavior varies based on prompts, context, model version)
- Agents may spawn sub-agents autonomously
- Agents may cross organizational boundaries
- Agent behavior is probabilistic, not predictable

---

## 3. Part II — Current Landscape of AI Agent Authentication

### 3.1 The 2025 Explosion

2025 marked a tipping point where every major identity vendor launched dedicated AI agent authentication products, creating an entirely new product category in less than 12 months.

### 3.2 Microsoft Entra Agent ID

The most comprehensive offering to date:

- **Announced:** Build (May 2025), expanded at Ignite (November 2025)
- **Core concept:** Agent identity as a first-class construct in the Entra admin center — placed alongside users, groups, and devices
- **Key features:**
  - Specialized identity object distinct from service principals
  - Mandatory human sponsor accountable for agent behavior
  - Agent Registry: centralized metadata repository with automatic discovery from Copilot Studio and Azure AI Foundry
  - Structural ceiling: blocks high-privilege roles (Global Administrator, Privileged Role Administrator) from agent identities
  - Conditional Access, Identity Protection anomaly detection, and network-level traffic inspection all extend to agent identities
  - ID Governance: access reviews, lifecycle workflows, entitlement management for agent identities

### 3.3 Okta / Auth0 for AI Agents

Multi-layered approach reaching GA in November 2025:

- **Auth0 for AI Agents (4 capabilities):**
  1. User authentication via Universal Login for agent-initiated flows
  2. Token Vault managing OAuth tokens for 35+ third-party services with automatic refresh
  3. Async authorization using CIBA for human-in-the-loop approval workflows
  4. Fine-Grained Authorization for RAG ensuring agents only access documents the underlying user is authorized to see

- **Cross App Access (XAA) Protocol** (June 2025):
  - Open standard extending OAuth to govern agent-to-app and app-to-app interactions
  - Built on the IETF Identity Assertion Authorization Grant (ID-JAG)
  - Supported by AWS, Salesforce, Google Cloud, Box, Glean, Grammarly
  - Shifts access control from individual applications to the enterprise IdP

### 3.4 AWS Bedrock AgentCore Identity

GA in 2025 with:
- Automatic workload identity assignment for every agent runtime
- Token vault for credential storage
- Identity directory cataloging all agent identities
- Cedar-based fine-grained policy evaluation
- Supports both user-delegated access (OAuth 2.0 Authorization Code) and M2M (Client Credentials)
- CloudTrail integration for immutable audit logs

### 3.5 Google Cloud Agentic IAM

Announced at Security Summit 2025:
- Auto-provisions per-agent identities based on the SPIFFE standard with X.509 certificates
- Tied to agent lifecycle within Vertex AI Agent Engine
- Agents receive mTLS-bound credential tokens secured by Context-Aware Access policies
- Tokens can only be used from the intended trusted runtime, preventing credential theft

### 3.6 Other Notable Vendors

| Vendor | Product | Key Differentiator |
|--------|---------|-------------------|
| **CyberArk** | Secure AI Agents (Dec 2025) | Privilege controls for agent identities; acquired Venafi ($1.54B) for machine identity |
| **Stytch** | Connected Apps | Transforms any SaaS into OAuth 2.0/OIDC IdP with MCP server integration; `isAgent` detection |
| **1Password** | 1Password for AI Agents | Runtime credential injection; agents never see or store secrets |
| **Composio** | Unified Auth SDK | Abstraction layer over 100+ integrations with SOC 2-compliant managed credential lifecycle |
| **Akeyless** | AI Agent Identity Provider | SecretlessAI: replaces embedded secrets with just-in-time identity-based authentication |
| **Aembit** | Workload IAM | Non-human identity management with SPIFFE integration |
| **Descope** | MCP Auth SDKs | Drag-and-drop auth flows with native agent support |

---

## 4. Part III — Agent-to-Agent & MCP Authentication Frameworks

### 4.1 Google's Agent-to-Agent (A2A) Protocol

**Overview:**
- Announced April 2025; donated to Linux Foundation June 2025
- Enables communication between opaque agentic applications (agents don't share internal state)
- 150+ supporting organizations including Adobe, Salesforce, SAP, ServiceNow, IBM
- Apache 2.0 licensed

**Authentication Model:**
- Built entirely on standard web mechanisms — deliberately does NOT invent new auth protocols
- Each A2A server publishes an AgentCard at `/.well-known/agent.json`
- AgentCards describe capabilities and security requirements using OpenAPI 3.2-compatible security scheme objects
- Supported auth mechanisms:
  - API key authentication
  - HTTP Bearer tokens
  - OAuth 2.0 (authorization code, client credentials, device code, implicit)
  - OpenID Connect Discovery
  - Mutual TLS (mTLS)
- Credential acquisition happens out-of-band

**Version 0.3 additions:**
- Signed AgentCards using JWS (JSON Web Signature) to prevent tampering
- gRPC transport support
- Enhanced enterprise security features

**Enterprise Security Features:**
- Authentication & Authorization with standard HTTP auth, OpenAPI security schemes, and OAuth 2.0
- Audit logging with correlation IDs for cross-agent traceability
- Rate limiting, input validation, and content security policies
- Data handling policies including PII classification and retention rules

### 4.2 Anthropic's Model Context Protocol (MCP) Authorization

**Overview:**
- Standardizes how AI agents connect to tools, APIs, and data sources
- Complementary to A2A's agent-to-agent focus (MCP = agent-to-tool, A2A = agent-to-agent)
- Open specification maintained by Anthropic

**Authorization Evolution Through 2025:**

| Date | Spec Update | Key Changes |
|------|-------------|-------------|
| **March 2025** | Initial auth spec | OAuth 2.1 with mandatory PKCE as baseline |
| **June 2025** | Resource server model | MCP servers classified as OAuth 2.0 Resource Servers; `/.well-known/oauth-protected-resource` metadata; mandatory Resource Indicators (RFC 8707) |
| **November 2025** | Enterprise features | Client ID Metadata Documents; Enterprise-Managed Authorization via XAA; Step-Up Authorization for incremental scope requests |

**Key Technical Details:**
- MCP servers MUST expose `/.well-known/oauth-protected-resource` metadata
- Resource Indicators (RFC 8707) prevent token mis-redemption across servers
- Dynamic Client Registration (RFC 7591) for MCP clients
- Step-Up Authorization enables agents to start with minimal permissions and request more as needed
- Enterprise-Managed Authorization allows corporate SSO-based delegation without OAuth redirects

### 4.3 IETF Standards Drafts (8+ Active)

The IETF has become the primary arena for agent authentication standardization:

**draft-klrc-aiagent-auth-00 (March 2026)**
- Co-authored by representatives from Defakto Security, AWS, Zscaler, and Ping Identity
- Core position: "agents are workloads" — build on existing WIMSE architecture and OAuth 2.0
- Covers: agent identifiers, credentials, attestation, transport-layer auth (mTLS), application-layer auth (WIMSE Proof Tokens, HTTP Message Signatures), delegation, human-in-the-loop
- Most pragmatic and widely supported approach

**draft-goswami-agentic-jwt-00 (Agentic JWT)**
- Introduces cryptographic agent checksums
- Binds system prompts and tool configurations to tokens
- Prevents token reuse across different agent configurations

**draft-oauth-transaction-tokens-for-agents (v03)**
- Extends OAuth Transaction Tokens with `actor` and `principal` context fields
- Enables delegation chains with full provenance tracking
- Currently at version 03, actively iterated

**draft-ietf-wimse-arch-06 (WIMSE Architecture)**
- Workload Identity in a Multi-System Environment
- Now explicitly addresses AI agents as "a special case of delegated workloads"
- Foundation for most other agent auth proposals

**SCIM Agent Extension**
- Makes agents first-class citizens in enterprise identity provisioning (SCIM)
- Enables standardized lifecycle management: creation, attribute updates, deprovisioning
- WorkOS and SSOJet have published implementation guides

**draft-huang-acme-scalable-agent-enrollment**
- Extends ACME certificate enrollment for scalable agentic AI identity
- Builds on Let's Encrypt-style automated certificate management

**draft-ccc-wimse-twi-extensions (Confidential Computing)**
- WIMSE extensions for Trusted Execution Environments
- Enables hardware-based attestation that an agent runs in a secure isolated environment

**OpenID Connect for Agents (OIDC-A) 1.0 Proposal**
- Introduces agent-specific claims: `agent_type`, `agent_model`, `agent_provider`, `agent_instance_id`, `delegation_chain`
- Uses formats compatible with IETF Remote Attestation Procedures (RATS)

### 4.4 Comparison: Agent Auth vs Traditional Service-to-Service Auth

| Dimension | Traditional (mTLS/SPIFFE/Service Mesh) | Agent Auth |
|-----------|----------------------------------------|------------|
| Identity granularity | All replicas share same SPIFFE ID | Each agent instance needs unique identity |
| Behavior predictability | Static, deterministic | Probabilistic, context-dependent |
| Credential management | Infrastructure-managed (sidecar) | Application-layer awareness needed |
| Human involvement | None | Human-in-the-loop for consent/approval |
| Delegation | N/A or simple | Complex chains: human→agent→sub-agent |
| Permission scoping | Static roles/policies | Dynamic, context-aware, task-based |
| Session lifecycle | Long-lived, predictable | Ephemeral, unpredictable, may span hours |
| Cross-org trust | Service mesh federation | No universal mechanism exists |
| Accountability | Service owner | Human sponsor + agent identity + delegation chain |

---

## 5. Part IV — Real-Time Production Use Cases

### 5.1 Enterprise SaaS Platforms

**Salesforce Agentforce (GA since 2024)**
- Public/private action model: public actions require no auth, private actions trigger OTP verification
- Integration with MuleSoft for API-mediated agent authentication
- Role-based access control for agent operations

**ServiceNow AI Agents**
- RBAC with least-privilege rules
- A2A protocol support added December 2025
- **CVE-2025-12420 (BodySnatcher):** Critical vulnerability where Virtual Agent API channel providers shipped with identical static secrets across ALL customer instances, enabling impersonation attacks. Demonstrates the immaturity of agent auth even in major platforms.

**Microsoft Copilot Studio**
- Automatically creates Entra Agent ID identities for each agent
- SharePoint deployment handles authentication transparently
- Multi-agent orchestration with identity propagation

### 5.2 AI Coding Agents

| Agent | Auth Mechanism | Key Details |
|-------|---------------|-------------|
| **GitHub Copilot Coding Agent** | OAuth via GitHub Actions | Runs in isolated containers; permissions of assigning user; MCP server support |
| **Cursor** | MCP + OAuth | External service authentication via MCP servers |
| **Devin** | OAuth + sandbox | Creates sandbox environments; authenticates to GitHub via OAuth for autonomous PR submission |

### 5.3 Multi-Agent Orchestration

**Snowflake Intelligence**
- Multi-agent orchestration using Personal Access Tokens between master and sub-agents
- External access integration for third-party service authentication

**AWS Multi-Agent Guidance**
- Reference architectures with LangGraph-powered supervisor agents on Amazon ECS
- AgentCore Identity for credential management across agent fleet

### 5.4 Production Delegation Patterns

| Pattern | Description | Implemented By |
|---------|-------------|----------------|
| **Delegated Access** | Agent inherits user's identity via token exchange | Auth0, Microsoft Entra |
| **Just-in-Time Credentials** | Credentials issued per invocation, auto-expire after task | Auth0, Oso, 1Password |
| **Capability Tokens** | Time-limited, scope-limited tokens (e.g., "read Bob's calendar for 60 min") | Custom implementations |
| **Credential Injection** | API gateway injects credentials; agent never stores them | 1Password, Akeyless |
| **Human-in-the-Loop** | CIBA-based async approval for high-risk operations | Auth0, Keycloak |

### 5.5 Industry-Specific Deployments

**Financial Services:**
- Ping Identity's "Identity for AI" embeds least-privilege access into banking agent workflows
- Know Your Agent (KYA) framework from Sumsub for autonomous payment verification
- Delegated authority patterns for trading and compliance agents

**Healthcare:**
- AWS AgentCore and Google Vertex AI Agent Engine support HIPAA workloads
- Human-in-the-loop verification recommended before agents access patient records
- HIPAA "minimum necessary" standard enforced via fine-grained authorization

---

## 6. Part V — Human vs Agent IAM: A Fundamental Comparison

### 6.1 Identity Verification

| Aspect | Human | AI Agent |
|--------|-------|----------|
| Primary mechanism | Biometrics, passwords, MFA | Cryptographic credentials (X.509, JWT) |
| Knowledge-based | Security questions, PINs | N/A — agents have no "knowledge" to verify |
| Identity source | Government ID, corporate directory | Workload identity (SPIFFE), DID, platform registration |
| Attestation | Physical presence, device trust | Runtime attestation: model version, provider, configuration hash |
| Uniqueness | Biological uniqueness | Must be synthetically assigned per-instance |

### 6.2 Permission Scoping

Human IAM assigns roles that map to expected job functions. Agent IAM faces a harder problem: agents are "creative" in how they use permissions. An autonomous coding agent might decide to cross-reference customer data with financial records to "improve its analysis," exceeding anticipated access patterns.

The Cloud Security Alliance recommends ABAC for agents that considers:
- Agent attributes (model, version, provider, configuration)
- Data labeling and classification
- Tool sets available to the agent
- Environmental conditions (time, location, network)
- Anomaly scores from behavioral monitoring

### 6.3 Session Management

| Aspect | Human | AI Agent |
|--------|-------|----------|
| Session duration | Hours; explicit logout | May run continuously; no concept of "logout" |
| Token lifetime | Long-lived refresh tokens | Should be ephemeral: 15-30 min with auto-rotation |
| Concurrency | Single session typical | May spawn sub-agents asynchronously |
| Session state | Stateful, server-side | Potentially stateless across invocations |
| Cross-timezone | Rare concern | Common in distributed agent orchestration |

### 6.4 Audit Trails

When agents act, audit trails fragment. As Aembit documented: when an agent acts on behalf of a user, spawning subagents and making decisions across multiple services, the question "who did this?" no longer has a simple answer. Traditional logging captures events but loses the context needed to establish accountability. When agents inherit user OAuth tokens, logs attribute activity to the agent rather than the requester.

### 6.5 Delegation Chains

Perhaps the hardest unsolved problem: human → agent → sub-agent delegation.

**Challenges:**
- MIT researchers proposed delegation tokens binding user, agent, and scope into a single verifiable artifact
- The OpenID Foundation identified that "delegation rules like 'read-only' or 'two-hop max' rarely survive the jump across trust domains"
- Advanced token formats like Biscuits and Macaroons support offline fine-grained control with built-in scope attenuation
- Revocation across delegation chains remains deeply problematic — no mechanism to propagate revocation down a chain of offline tokens

---

## 7. Part VI — Benefits of Implementing Agent IAM

### 7.1 Security Benefits

**Preventing Authorization Bypass:**
In one documented case, a new hire with limited permissions asked an organizational AI agent to analyze customer churn data and received detailed sensitive information they could never access directly. Nothing was misconfigured; the agent simply had broader access than the user. Dedicated agent IAM with task-based authorization prevents this.

**Credential Protection:**
Dynamic credential injection eliminates static API keys, making prompt injection attacks targeting credential extraction ineffective. Agents never see or store credentials — they're injected at request time by the Token Vault.

**Blast Radius Containment:**
The Salesloft/Drift breach (August 2025) demonstrated that a single compromised AI chat agent exposed over 700 companies in 10 days via stolen OAuth tokens. Just-in-time credential issuance with 15-30 minute expiration structurally limits the window of compromise.

**Gartner Prediction:** By 2028, 25% of enterprise breaches will be traced to AI agent abuse.

### 7.2 Access Control Granularity

- Fine-grained authorization ensures agents access only data required for specific tasks
- Task-based authorization replaces the dangerous pattern of mirroring user permissions onto agents
- Context-aware policies restrict agent actions based on data sensitivity, time, target application, and anomaly scores
- Critical for RAG architectures where agents query enterprise knowledge bases

### 7.3 Compliance & Governance

| Framework | Requirement | How Agent IAM Helps |
|-----------|-------------|---------------------|
| **SOC 2** | Access control, monitoring, audit trails | Immutable audit logs, behavioral monitoring |
| **HIPAA** | Minimum necessary access, audit controls | Fine-grained authorization, HITL for patient data |
| **GDPR** | Right to erasure, data minimization, lawful basis | Data classification in policies, consent tracking |
| **ISO/IEC 42001** | AI management system requirements | Agent lifecycle governance, risk assessment |
| **NIST AI RMF** | AI risk management | Documented controls, behavioral monitoring |
| **SOX** | Financial controls, segregation of duties | Delegation chain integrity, approval workflows |

### 7.4 Trust Boundaries Between Agents

Proper trust boundaries prevent lateral movement and contain blast radius. Each agent operates within defined boundaries, can only communicate with authorized peers, and cannot escalate privileges beyond its delegation chain.

---

## 8. Part VII — Challenges & Limitations of Current Methods

### 8.1 No Universal Agent Identity Standard

Companies are creating separate identity systems rather than adopting common standards. The OIDC-A 1.0 proposal, SCIM Agent Extension, and 8+ IETF drafts all compete — none has achieved broad adoption. Production deployments are outpacing standardization efforts.

### 8.2 Token Management at Agent Scale

- Short-lived tokens improve security but require high-performance credential generation
- Long-lived tokens create risk — OAuth tokens and API keys become high-value targets
- Cross-domain revocation barely exists: when Drift revoked credentials on August 20, companies like Cloudflare were not notified until August 23
- Efficient revocation infrastructure for millions of ephemeral tokens doesn't exist

### 8.3 Over-Permissioning as the Default

- Agent permissions frequently granted broadly to avoid friction
- Agents accumulate permissions over time (permission creep)
- Inherited over-privilege: agents receive user's full permissions, vastly exceeding minimum necessary
- This is the "admin API key" antipattern at enterprise scale

### 8.4 The Confused Deputy Problem (Amplified)

The confused deputy problem is dramatically amplified with AI agents:
1. Agent has Alice's OAuth token
2. Agent processes an external PDF containing hidden prompt injection
3. Prompt injection causes the agent to search Drive and Slack for internal documents
4. Agent has Alice's permissions but NOT Alice's intent

Most current frameworks do not implement context-aware authorization. OWASP acknowledges: "given the stochastic nature of generative AI, it is unclear if there are fool-proof methods of prevention for prompt injection."

### 8.5 Cross-Organizational Agent Trust

- Each domain validates credentials in isolation
- No shared defense when tokens are compromised
- Tokens crossing trust domains shed their limitations
- OpenID Shared Signals Framework proposed but not widely implemented
- No universal peer-to-peer agent trust mechanism exists

### 8.6 Cost Barriers to Adoption

| Provider | Pricing Model | Cost at 10,000 Agents/Year |
|----------|--------------|---------------------------|
| Microsoft Entra | Per-user/month ($6-36) | $720K - $4.3M |
| Okta | Per-user/month ($2-15) | $240K - $1.8M |
| Auth0 | Per-MAU + base | Varies; $100K+ at scale |
| AWS AgentCore | Per-request + storage | Varies; $50K+ at scale |
| **Open Source** | **$0 licensing** | **$24K-60K infra only** |

---

## 9. Part VIII — Future Developments & Standards Trajectory

### 9.1 Standards Convergence (Expected 2027-2028)

The IETF's pragmatic "agents are workloads plus extensions" approach is gaining the most traction:
- WIMSE working group architecture now explicitly addresses AI agents
- Transaction Tokens being extended with agent-specific context
- SCIM Agent Extension will enable standardized lifecycle management
- Confidential Computing Consortium extending WIMSE for hardware-based attestation

### 9.2 Vendor Roadmaps

| Vendor | Direction | Timeline |
|--------|-----------|----------|
| **Microsoft** | Entra Agent ID as centerpiece of Agent 365; cross-platform partnerships | 2026-2027 |
| **Okta** | Verifiable Digital Credentials for agents | FY27 |
| **Google** | Agent identity built into Vertex AI with SPIFFE-based mTLS | 2026 |
| **AWS** | Co-authoring core IETF standards; shipping AgentCore Identity | 2026 |

### 9.3 Industry Analyst Projections

- **Gartner:** Named "IAM Adapts to AI Agents" as top 6 cybersecurity trend for 2026
- **Gartner:** By 2027, AI agents will reduce time to exploit account exposures by 50%
- **Gartner:** Guardian Agents will capture 10-15% of the agentic AI market by 2030
- **Market size:** NHI access management projected at $18-39B by 2030-2036
- **Forrester:** IAM market forecast of $27.5B by 2029, driven by AI identity sprawl
- **Rubrik Zero Labs:** Non-human identities already outnumber human identities 82-to-1

### 9.4 Open Research Frontiers

1. **Trust bootstrapping:** How does a freshly deployed agent prove its identity before receiving credentials?
2. **Cross-organizational trust fabrics:** No universal peer-to-peer agent trust mechanism
3. **Agent capability attestation:** IETF RATS-compatible formats for proving agent integrity
4. **Runtime behavior verification:** Beyond static permissions to dynamic behavioral analysis
5. **Consent fatigue:** When agents operate at machine speed, humans cannot meaningfully review each authorization decision
6. **Guardian Agents:** Supervisory AI systems that monitor and contain other agents' actions

---

## 10. Part IX — The Open-Source Opportunity

### 10.1 The Case for Democratizing Agent IAM

Security infrastructure becoming a cost barrier creates a perverse outcome: the organizations most vulnerable (startups, smaller companies, open-source projects) are the least protected. Agent IAM should be as accessible as Let's Encrypt made TLS certificates.

### 10.2 What Already Exists (Open Source)

**Production-Ready Components:**

| Component | Project | License | Status |
|-----------|---------|---------|--------|
| Identity Server | Keycloak 26.4+ | Apache 2.0 | ✅ Native MCP auth + SPIFFE SVID support |
| Workload Identity | SPIFFE/SPIRE | Apache 2.0 | ✅ CNCF Graduated; production at scale |
| Policy Engine | OPA | Apache 2.0 | ✅ CNCF Graduated; universal policy engine |
| Policy Engine | Cedar | Apache 2.0 | ✅ AWS-backed; fine-grained authorization |
| Observability | OpenTelemetry | Apache 2.0 | ✅ CNCF Graduated; distributed tracing |
| Secrets Management | HashiCorp Vault | BSL 1.1 | ✅ Industry standard (note: BSL, not Apache) |
| Secrets Management | Infisical | MIT | ✅ Open-source Vault alternative |
| A2A Protocol | A2A Project | Apache 2.0 | ✅ Linux Foundation; 150+ organizations |
| MCP | Model Context Protocol | Open Spec | ✅ Anthropic; de facto standard |

**Early-Stage but Promising:**

| Component | Project | License | Status |
|-----------|---------|---------|--------|
| Agent Identity | AGNTCY Identity | Apache 2.0 | 🔶 Linux Foundation; DIDs + VCs for agents |
| Agent Discovery | AGNTCY Directory | Apache 2.0 | 🔶 Agent discovery with OASF |
| Agent Messaging | AGNTCY SLIM | Apache 2.0 | 🔶 Secure messaging with SPIRE integration |
| Keycloak + SPIRE for MCP | keycloak-agent-identity | Open Source | 🔶 MCP DCR with SPIFFE |
| MCP Gateway | mcp-gateway-registry | Open Source | 🔶 Enterprise MCP gateway with Keycloak/Entra |
| Agent Identity Protocol | HUMAN Verified AI Agent | Open Source | 🔶 HTTP Message Signatures (RFC 9421) |
| Zero-Trust Framework | Agentic AI IAM SDK | Open Source | 🔶 Research-backed; DIDs + VCs |

### 10.3 What's Missing

The gap isn't in the building blocks — it's in the **integration and operational simplicity:**

1. **Unified Token Vault** with automatic refresh for 30+ third-party services (Auth0's key differentiator)
2. **Human-in-the-loop** async authorization workflows (beyond basic CIBA)
3. **Cross-organizational trust** federation (nobody has solved this well, even commercially)
4. **Simple admin console** making agent identity management accessible to non-experts
5. **Delegation chain manager** with cryptographic proof and revocation propagation
6. **Behavioral anomaly detection** purpose-built for agent access patterns
7. **Opinionated, composable integration** that "just works" out of the box

---

## 11. Part X — AgentVault: The Proposed Solution

### 11.1 Vision

AgentVault is a composable, standards-based, fully open-source IAM stack purpose-built for AI agent ecosystems. It provides enterprise-grade agent authentication, authorization, delegation, and audit at zero licensing cost, built entirely on proven open-source foundations.

**Design Principles:**
1. **Standards-first:** OAuth 2.1, SPIFFE, A2A, MCP — no proprietary protocols
2. **Composable:** Every component swappable without rewriting
3. **Keycloak as the hub:** Extend a production-proven platform, don't reinvent
4. **Zero-trust by default:** SPIFFE mTLS, ephemeral credentials, least-privilege
5. **Human accountability:** Every agent action traceable to a human sponsor
6. **Democratized access:** $0 licensing; infrastructure costs only

### 11.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER 4: INTEROPERABILITY                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Agent Discovery   │  │ Cross-Org Trust  │  │ Audit & Comply   │  │
│  │ AGNTCY Directory  │  │ SPIFFE Federation│  │ OpenTelemetry    │  │
│  │ + A2A AgentCards  │  │ + OpenID SSF     │  │ + SigStore       │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                    LAYER 3: RUNTIME SECURITY                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Token Vault &     │  │ Behavioral       │  │ Human-in-the-    │  │
│  │ Credential Inject │  │ Anomaly Detection│  │ Loop Gateway     │  │
│  │ Vault + Plugin    │  │ OTel + ML Models │  │ CIBA + WebSocket │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                    LAYER 2: AUTHENTICATION & AUTHORIZATION           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ OAuth 2.1 + MCP  │  │ Policy Engine    │  │ Delegation Chain │  │
│  │ Auth Gateway      │  │ (Fine-Grained)   │  │ Manager          │  │
│  │ Keycloak as MCP   │  │ OPA / Cedar      │  │ TxTokens +       │  │
│  │ AuthZ Server      │  │ + Keycloak AuthZ │  │ Macaroons        │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                    LAYER 1: IDENTITY                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Agent Identity    │  │ Workload Identity│  │ DID-based        │  │
│  │ Registry          │  │ (Zero-Trust)     │  │ Portable Identity│  │
│  │ Keycloak + SPI    │  │ SPIFFE / SPIRE   │  │ AGNTCY Identity  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.3 Layer 1: Identity — "Who is this agent?"

**Component 1: Agent Identity Registry (Keycloak + Custom SPI)**

Keycloak is extended via a custom Service Provider Interface (SPI) to add agent-specific identity attributes:

```
Agent Identity Object:
├── agent_id: UUID (unique per instance)
├── agent_type: enum (autonomous | delegated | orchestrator | guardian)
├── agent_model: string (e.g., "claude-sonnet-4-20250514")
├── agent_provider: string (e.g., "anthropic")
├── agent_version: semver
├── human_sponsor: reference to Keycloak user (MANDATORY)
├── delegation_chain: array of delegation token references
├── runtime_attestation: hash of configuration + model + tools
├── capability_declarations: array of declared capabilities
├── max_delegation_depth: integer (default: 2)
├── created_at: timestamp
├── last_active: timestamp
└── status: enum (active | suspended | revoked | expired)
```

This extends Keycloak's entity model so agents appear alongside users, groups, and devices in the admin console. The mandatory human sponsor ensures every agent action is ultimately accountable to a person.

**Component 2: Workload Identity (SPIFFE/SPIRE)**

Every agent runtime gets a cryptographic SPIFFE ID:

```
spiffe://example.org/agent/trading-bot/v2/instance-abc123
         └─ trust domain ─┘└─ agent type ─┘└ver┘└─ instance ─┘
```

SPIRE issues short-lived X.509 SVIDs (Verifiable Identity Documents) with automatic rotation, typically every 60 seconds. This enables zero-trust mTLS between agents without shared secrets.

Federation across organizational boundaries via SPIFFE trust bundles:
```
Org A Trust Domain ←→ Trust Bundle Exchange ←→ Org B Trust Domain
spiffe://org-a.com/*    Mutual verification     spiffe://org-b.com/*
```

**Component 3: DID-based Portable Identity (AGNTCY Identity)**

For cross-organizational scenarios where SPIFFE federation isn't practical:
- Agents carry portable, self-sovereign identities using `did:web` or `did:key` methods
- Verifiable Credentials attest to capabilities, certifications, and authorization grants
- Agent identity survives provider switches and organizational changes

### 11.4 Layer 2: Authentication & Authorization — "What can this agent do?"

**Component 4: OAuth 2.1 + MCP Auth Gateway (Keycloak)**

Keycloak 26.4+ natively serves as an MCP Authorization Server:

```
MCP Client (Agent) → Keycloak (AuthZ Server) → MCP Server (Tool)
                     ├── /.well-known/oauth-authorization-server
                     ├── SPIFFE SVID authentication
                     ├── Client Credentials (M2M)
                     ├── Authorization Code + PKCE (HITL)
                     ├── Resource Indicators (RFC 8707)
                     └── Step-Up Authorization
```

**Component 5: Policy Engine (OPA / Cedar)**

Context-aware authorization evaluating multiple dimensions:

```rego
# Example OPA policy for agent authorization
package agentvault.authz

default allow = false

allow {
    # Agent identity verified
    input.agent.status == "active"
    
    # Delegation chain valid and within depth limit
    count(input.delegation_chain) <= input.agent.max_delegation_depth
    
    # Scope attenuation: each hop can only narrow, never widen
    scope_attenuated(input.delegation_chain)
    
    # Data sensitivity check
    input.resource.classification <= input.agent.max_data_classification
    
    # Time-based restriction
    within_business_hours(input.timestamp, input.agent.timezone_restriction)
    
    # Anomaly score below threshold
    input.agent.anomaly_score < 0.7
    
    # Human sponsor is active and authorized
    input.agent.human_sponsor.status == "active"
}
```

```cedar
// Example Cedar policy for agent authorization
permit(
    principal in AgentGroup::"trading-agents",
    action in [Action::"read", Action::"execute-trade"],
    resource in Portfolio::"equities"
) when {
    principal.anomaly_score < 0.7 &&
    principal.delegation_depth <= 2 &&
    context.time.hour >= 9 && context.time.hour <= 16 &&
    resource.data_classification <= "CONFIDENTIAL"
};
```

**Component 6: Delegation Chain Manager**

Manages human→agent→sub-agent delegation with cryptographic proof chains:

```
Delegation Token Structure (extending IETF Transaction Tokens):
{
  "iss": "https://keycloak.example.org/realms/agents",
  "sub": "agent:trading-bot-v2:instance-abc123",
  "act": {                                          // Actor (the agent)
    "sub": "agent:trading-bot-v2:instance-abc123",
    "agent_type": "delegated",
    "spiffe_id": "spiffe://example.org/agent/trading-bot/v2/instance-abc123"
  },
  "may_act": {                                      // Can delegate further
    "max_depth": 1,                                 // Only 1 more hop allowed
    "allowed_scopes": ["portfolio:read"],            // Scope attenuation
    "expires_in": 900                                // 15 minutes max
  },
  "principal": {                                    // The human who delegated
    "sub": "user:alice@example.org",
    "name": "Alice Johnson",
    "role": "portfolio-manager"
  },
  "delegation_chain": [                             // Full provenance
    {
      "delegator": "user:alice@example.org",
      "delegatee": "agent:trading-bot-v2",
      "scopes": ["portfolio:read", "portfolio:trade"],
      "timestamp": "2026-03-16T10:00:00Z"
    }
  ],
  "scope": "portfolio:read portfolio:trade",
  "exp": 1710590400,                               // Short-lived: 30 min
  "nbf": 1710588600,
  "iat": 1710588600,
  "jti": "txn_abc123def456"
}
```

### 11.5 Layer 3: Runtime Security — "Is this agent behaving correctly?"

**Component 7: Token Vault & Credential Injection**

Agents NEVER see or store credentials. Built on HashiCorp Vault (or Infisical as a fully OSS alternative):

```
Agent Request Flow:
1. Agent needs to call Salesforce API
2. Agent SDK sends request to AgentVault Gateway
3. Gateway verifies agent identity (SPIFFE SVID)
4. Gateway checks authorization (OPA/Cedar policy)
5. Gateway retrieves Salesforce OAuth token from Vault
6. Gateway injects token into request headers
7. Gateway forwards request to Salesforce
8. Agent never sees the Salesforce credential

Token Lifecycle:
- Tokens stored encrypted at rest in Vault
- Automatic refresh before expiration
- 15-30 minute maximum lifetime
- Automatic revocation on agent deprovisioning
- Pluggable connector framework for 50+ services
```

**Component 8: Behavioral Anomaly Detection**

Real-time monitoring via OpenTelemetry:

```
Monitored Signals:
├── API call frequency (requests/min vs baseline)
├── Data volume accessed (bytes vs typical)
├── Scope utilization (using permissions never used before?)
├── Service access patterns (accessing unusual endpoints?)
├── Delegation chain anomalies (unexpected sub-agent spawning?)
├── Geographic anomalies (requests from unexpected regions?)
├── Temporal anomalies (activity outside expected hours?)
└── Content patterns (requesting unusual data categories?)

Anomaly Score → Policy Engine:
  0.0 - 0.3: Normal → Auto-approve
  0.3 - 0.7: Suspicious → Enhanced logging + reduced scope
  0.7 - 0.9: High Risk → Human-in-the-loop required
  0.9 - 1.0: Critical → Immediate suspension + alert
```

**Component 9: Human-in-the-Loop Gateway**

Implements OAuth 2.0 CIBA for async human approval:

```
Sensitive Operation Flow:
1. Agent attempts action classified as "requires-approval"
2. CIBA backchannel request sent to Keycloak
3. Keycloak pushes notification to human sponsor via:
   - Slack / Microsoft Teams webhook
   - Email with one-click approve/deny
   - Mobile push notification
   - Custom webhook
4. Human reviews: agent identity, requested action, context, risk score
5. Human approves/denies within configurable timeout (default: 5 min)
6. Agent receives approval token or denial
7. Full decision recorded in audit log

Configurable Policies:
- Auto-approve: read-only operations, low-sensitivity data
- Require approval: write operations, financial transactions > $X, PII access
- Always block: admin operations, cross-tenant access, privilege escalation
```

### 11.6 Layer 4: Interoperability — "How do agents find and trust each other?"

**Component 10: Agent Discovery & Registry**

```
Agent Discovery Flow:
1. Client queries AGNTCY Directory: "I need a document-analysis agent"
2. Directory returns matching AgentCards with capabilities
3. Client verifies AgentCard signature (JWS)
4. Client checks agent's SPIFFE identity via trust bundle
5. Mutual TLS established
6. A2A protocol session initiated

AgentCard (at /.well-known/agent.json):
{
  "name": "document-analyzer-v3",
  "description": "Analyzes and summarizes documents",
  "url": "https://agents.example.org/doc-analyzer",
  "capabilities": ["document-analysis", "summarization", "extraction"],
  "security": {
    "schemes": {
      "oauth2": {
        "type": "oauth2",
        "flows": {
          "clientCredentials": {
            "tokenUrl": "https://keycloak.example.org/realms/agents/protocol/openid-connect/token",
            "scopes": { "documents:read": "Read documents", "documents:analyze": "Analyze documents" }
          }
        }
      },
      "mtls": { "type": "mutualTLS" }
    }
  },
  "identity": {
    "spiffe_id": "spiffe://example.org/agent/doc-analyzer/v3",
    "did": "did:web:example.org:agents:doc-analyzer-v3"
  }
}
```

**Component 11: Cross-Org Trust Federation**

```
SPIFFE Federation:
Org A SPIRE Server ←→ Trust Bundle Exchange ←→ Org B SPIRE Server

OpenID Shared Signals Framework:
- Real-time revocation propagation between organizations
- Event types: credential-compromise, session-revoked, agent-suspended
- Push-based notification via SSE (Server-Sent Events)
- Prevents replay of compromised tokens across org boundaries

XAA (Cross-App Access) Protocol Support:
- Enterprise IdP-mediated agent authorization
- No direct OAuth redirect required between organizations
- IdP vouches for agent identity and permissions
```

**Component 12: Audit & Compliance Engine**

```
Audit Record Structure:
{
  "trace_id": "abc123...",                    // OpenTelemetry distributed trace
  "timestamp": "2026-03-16T10:30:00Z",
  "who": {
    "human_sponsor": "alice@example.org",     // Ultimate accountability
    "agent_identity": "agent:doc-analyzer:v3:instance-xyz",
    "spiffe_id": "spiffe://example.org/agent/doc-analyzer/v3/instance-xyz"
  },
  "what": {
    "action": "document:analyze",
    "resource": "doc:quarterly-report-q1-2026",
    "resource_classification": "CONFIDENTIAL"
  },
  "why": {
    "delegation_chain": [...],                // Full provenance
    "policy_decision": "ALLOW",
    "policy_id": "policy:doc-access-q1"
  },
  "how": {
    "tools_used": ["mcp:pdf-reader", "mcp:summarizer"],
    "anomaly_score": 0.12,
    "tokens_consumed": 4500
  },
  "outcome": {
    "status": "success",
    "data_accessed_bytes": 245000
  }
}

Stored in:
- OpenTelemetry → Jaeger/Tempo for distributed tracing
- SigStore/Rekor for tamper-proof log integrity
- SIEM export (Splunk, Elastic, etc.) via OTel Collector
```

### 11.7 Comparison vs Commercial Solutions

| Capability | AgentVault (OSS) | Microsoft Entra Agent ID | Auth0 for AI Agents | AWS AgentCore Identity |
|---|---|---|---|---|
| **License Cost** | **$0 forever** | $6-36/user/mo | $23-240/mo base | Pay per use |
| **Agent as First-Class Identity** | ✅ Keycloak SPI | ✅ Native | ⚠️ Client-based | ✅ Workload ID |
| **MCP Authorization** | ✅ Keycloak 26.4+ | ⚠️ Indirect | ✅ Native | ✅ Native |
| **A2A Protocol Support** | ✅ AGNTCY + A2A | ⚠️ Copilot Studio only | ❌ Not yet | ⚠️ Partial |
| **SPIFFE/Zero-Trust mTLS** | ✅ SPIRE native | ❌ | ❌ | ⚠️ IAM Roles |
| **Token Vault** | ✅ Vault + plugin | ⚠️ Key Vault | ✅ 35+ services | ✅ Native |
| **Fine-Grained AuthZ** | ✅ OPA/Cedar | ✅ Conditional Access | ✅ FGA/OpenFGA | ✅ Cedar |
| **Human-in-the-Loop** | ✅ CIBA flow | ✅ Approval workflows | ✅ CIBA | ⚠️ Step Functions |
| **Cross-Org Federation** | ✅ SPIFFE + SSF | ⚠️ Entra B2B | ⚠️ Organizations | ⚠️ Cross-account |
| **Delegation Chains** | ✅ TxTokens | ⚠️ Sponsor model | ⚠️ Token exchange | ⚠️ STS |
| **Behavioral Monitoring** | ✅ OTel + ML | ✅ Identity Protection | ⚠️ Logs only | ✅ CloudTrail |
| **Self-Hosted Option** | ✅ Always | ❌ Cloud only | ❌ Cloud only | ❌ Cloud only |
| **Vendor Lock-in** | **None** | High (Azure) | Medium | High (AWS) |

---

## 12. Part XI — Implementation Roadmap

### Phase 1: Foundation (Months 1-3)

**Goal:** Agent identity + basic auth working end-to-end

| Task | Details | Effort |
|------|---------|--------|
| Keycloak Agent SPI | Custom SPI extending entity model with agent attributes | 3-4 weeks |
| SPIRE deployment | Kubernetes-native SPIRE with agent SVID issuance | 1-2 weeks |
| Keycloak + SPIRE integration | SPIFFE SVID authentication in Keycloak | 2 weeks |
| Basic MCP auth | Keycloak as MCP authorization server | 1-2 weeks |
| Client Credentials flow | M2M agent authentication | 1 week |
| Admin console extensions | Agent management UI in Keycloak admin | 2-3 weeks |
| Basic OPA integration | Simple scope-based policies | 1-2 weeks |

**Deliverable:** An agent can register, receive a SPIFFE identity, authenticate via OAuth 2.1 to an MCP server, with basic policy evaluation. All managed through Keycloak admin console.

### Phase 2: Security Hardening (Months 4-6)

**Goal:** Production-grade security with delegation and HITL

| Task | Details | Effort |
|------|---------|--------|
| Token Vault | Vault integration with pluggable service connectors | 3-4 weeks |
| Credential injection sidecar | Kubernetes sidecar for transparent credential injection | 2-3 weeks |
| Delegation Chain Manager | Transaction token issuance and validation | 3-4 weeks |
| CIBA HITL gateway | Human approval workflows with Slack/Teams notifications | 2-3 weeks |
| Advanced OPA/Cedar policies | Context-aware, data-classification-aware policies | 2-3 weeks |
| Step-Up Authorization | Progressive scope escalation for MCP | 1-2 weeks |

**Deliverable:** Full delegation chains working, human-in-the-loop for sensitive operations, agents never see credentials. Policy engine evaluates multi-dimensional context.

### Phase 3: Intelligence & Federation (Months 7-9)

**Goal:** Behavioral monitoring, cross-org trust, and discovery

| Task | Details | Effort |
|------|---------|--------|
| Behavioral anomaly detection | OpenTelemetry integration with ML-based scoring | 4-6 weeks |
| SPIFFE Federation | Cross-org trust bundle exchange | 2-3 weeks |
| OpenID Shared Signals | Real-time revocation propagation | 2-3 weeks |
| AGNTCY Directory integration | Agent discovery with signed AgentCards | 2-3 weeks |
| A2A protocol auth | Full A2A authentication support | 2-3 weeks |
| SigStore audit logging | Tamper-proof compliance logs | 1-2 weeks |

**Deliverable:** Agents from different organizations can discover, authenticate, and collaborate with full behavioral monitoring and real-time revocation.

### Phase 4: Ecosystem & Community (Months 10-12)

**Goal:** Developer experience, documentation, and community

| Task | Details | Effort |
|------|---------|--------|
| SDK packages | Python, TypeScript, Go, Rust SDKs | 4-6 weeks |
| Helm charts | One-command Kubernetes deployment | 2-3 weeks |
| Docker Compose dev environment | Local development setup | 1 week |
| Framework integrations | LangChain, CrewAI, AutoGen adapters | 3-4 weeks |
| Comprehensive documentation | Architecture guides, tutorials, API docs | 3-4 weeks |
| Compliance templates | SOC 2, HIPAA, GDPR policy templates | 2-3 weeks |
| Community governance | Contributing guidelines, RFC process | 1-2 weeks |

**Deliverable:** Production-ready release with SDKs, Helm charts, framework integrations, and comprehensive documentation. Ready for community adoption.

### Estimated Infrastructure Cost (Production Deployment)

| Component | Resources | Monthly Cost (AWS/GCP) |
|-----------|-----------|----------------------|
| Keycloak (HA) | 2x pods, 2 vCPU, 4GB RAM each | $150-200 |
| SPIRE Server (HA) | 2x pods, 1 vCPU, 2GB RAM each | $80-120 |
| SPIRE Agents | DaemonSet, minimal resources | $50-100 |
| Vault (HA) | 3x pods, 2 vCPU, 4GB RAM each | $200-300 |
| OPA | Sidecar or 2x pods | $50-80 |
| PostgreSQL (managed) | db.r6g.large equivalent | $200-400 |
| OpenTelemetry Collector | 2x pods | $50-80 |
| Jaeger/Tempo | Storage-dependent | $100-300 |
| Load Balancer | ALB/NLB | $50-100 |
| **Total** | | **$930-1,680/month** |

Compare: Commercial agent IAM at 1,000 agents: $20,000-100,000+/month in licensing alone.

---

## 13. Part XII — References & Sources

### Standards & Specifications

1. **IETF draft-klrc-aiagent-auth-00** — AI Agent Authentication and Authorization (March 2026). Authors from Defakto Security, AWS, Zscaler, Ping Identity. https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/
2. **IETF draft-goswami-agentic-jwt-00** — Secure Intent Protocol: JWT Compatible Agentic Identity and Workflow Management. https://datatracker.ietf.org/doc/draft-goswami-agentic-jwt/
3. **IETF draft-oauth-transaction-tokens-for-agents-03** — Transaction Tokens For Agents. https://datatracker.ietf.org/doc/draft-oauth-transaction-tokens-for-agents/
4. **IETF draft-ietf-wimse-arch-06** — Workload Identity in a Multi System Environment (WIMSE) Architecture. https://datatracker.ietf.org/doc/draft-ietf-wimse-arch/
5. **IETF draft-ccc-wimse-twi-extensions-00** — WIMSE Extensions for Trustworthy Workload Identity. https://datatracker.ietf.org/doc/draft-ccc-wimse-twi-extensions/
6. **IETF draft-huang-acme-scalable-agent-enrollment-00** — Extending Certificate Enrollment Protocols for Scalable Agentic AI Identity. https://www.ietf.org/archive/id/draft-huang-acme-scalable-agent-enrollment-00.html
7. **A2A Protocol Specification** — Agent2Agent Protocol (Linux Foundation). https://a2a-protocol.org/latest/
8. **MCP Authorization Specification** — Model Context Protocol Authorization (Anthropic). https://spec.modelcontextprotocol.io/
9. **OIDC-A 1.0 Proposal** — OpenID Connect for Agents. https://subramanya.ai/2025/04/28/oidc-a-proposal/

### Vendor Documentation & Announcements

10. **Microsoft Entra Agent ID** — Official documentation. https://learn.microsoft.com/en-us/entra/agent-id/
11. **Auth0 for AI Agents GA** — November 2025 announcement. https://auth0.com/blog/auth0-for-ai-agents-generally-available/
12. **AWS Bedrock AgentCore Identity** — Documentation. https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html
13. **Okta Cross App Access (XAA)** — June 2025 announcement. https://www.okta.com/newsroom/press-releases/okta-introduces-cross-app-access/
14. **Google Cloud Agentic IAM** — Security Summit 2025. https://cloud.google.com/blog/products/identity-security/security-summit-2025
15. **CyberArk Secure AI Agents** — December 2025. https://www.cyberark.com/press/cyberark-introduces-first-identity-security-solution-purpose-built-to-protect-ai-agents/
16. **Keycloak 26.4 Release Notes** — MCP and SPIFFE support. https://www.keycloak.org/2025/09/keycloak-2640-released

### Open-Source Projects

17. **AGNTCY Identity** (Linux Foundation) — https://github.com/agntcy/identity
18. **AGNTCY Project** — https://docs.agntcy.org/
19. **Keycloak** (CNCF Incubation) — https://github.com/keycloak/keycloak
20. **SPIFFE/SPIRE** (CNCF Graduated) — https://spiffe.io/
21. **Open Policy Agent** (CNCF Graduated) — https://www.openpolicyagent.org/
22. **Cedar** (Apache 2.0) — https://www.cedarpolicy.com/
23. **OpenTelemetry** (CNCF Graduated) — https://opentelemetry.io/
24. **Keycloak Agent Identity** — MCP DCR with SPIFFE. https://github.com/christian-posta/keycloak-agent-identity
25. **MCP Gateway Registry** — Enterprise MCP gateway. https://github.com/agentic-community/mcp-gateway-registry
26. **HUMAN Verified AI Agent** — HTTP Message Signatures for agents. https://www.humansecurity.com/learn/blog/human-verified-ai-agent-open-source/
27. **A2A Project** (Linux Foundation) — https://github.com/a2aproject/A2A

### Research Papers & Industry Analysis

28. **OpenID Foundation** — "Identity Management for Agentic AI" whitepaper (October 2025). https://openid.net/wp-content/uploads/2025/10/Identity-Management-for-Agentic-AI.pdf
29. **Cloud Security Alliance** — "Agentic AI Identity Management Approach" (March 2025). https://cloudsecurityalliance.org/blog/2025/03/11/agentic-ai-identity-management-approach
30. **ISACA** — "The Looming Authorization Crisis: Why Traditional IAM Fails Agentic AI" (2025). https://www.isaca.org/resources/news-and-trends/industry-news/2025/the-looming-authorization-crisis-why-traditional-iam-fails-agentic-ai
31. **alphaXiv** — "Identity Management for Agentic AI: The new frontier" (2025). https://www.alphaxiv.org/overview/2510.25819v1
32. **arXiv** — "A Novel Zero-Trust Identity Framework for Agentic AI" (May 2025). https://arxiv.org/html/2505.19301v1
33. **NIST** — AI Agent Standards Initiative. https://www.joneswalker.com/en/insights/blogs/ai-law-blog/nists-ai-agent-standards-initiative
34. **HashiCorp** — "SPIFFE: Securing the identity of agentic AI" (2025). https://www.hashicorp.com/en/blog/spiffe-securing-the-identity-of-agentic-ai-and-non-human-actors

### Industry Analyst Reports

35. **Gartner** — "Top Cybersecurity Trends for 2026" (February 2026). IAM Adapts to AI Agents named as top trend.
36. **Gartner** — AI agents will reduce time to exploit account exposures by 50% by 2027 (March 2025).
37. **Gartner** — Guardian Agents will capture 10-15% of agentic AI market by 2030 (June 2025).
38. **Gartner** — "Top Predictions for IT Organizations 2025 and Beyond" (October 2024). 25% of enterprise breaches traced to AI agent abuse by 2028.
39. **Forrester** — IAM market forecast of $27.5B by 2029.
40. **Markets and Markets** — NHI access management market projected $18-39B by 2030-2036.
41. **Rubrik Zero Labs** — Non-human identities outnumber human identities 82-to-1.

### MCP Authorization Deep Dives

42. **Auth0** — "MCP Spec Updates from June 2025: All About Auth." https://auth0.com/blog/mcp-specs-update-all-about-auth/
43. **Aaron Parecki** — "Client Registration and Enterprise Management in the November 2025 MCP Authorization Spec." https://aaronparecki.com/2025/11/25/1/mcp-authorization-spec-update
44. **Aembit** — "MCP, OAuth 2.1, PKCE, and the Future of AI Authorization." https://aembit.io/blog/mcp-oauth-2-1-pkce-and-the-future-of-ai-authorization/
45. **Stytch** — "Agent-to-agent OAuth: a guide for secure AI agent connectivity with MCP." https://stytch.com/blog/agent-to-agent-oauth-guide/

### Security Incidents

46. **AppOmni** — "BodySnatcher (CVE-2025-12420): Broken Authentication in ServiceNow." https://appomni.com/ao-labs/bodysnatcher-agentic-ai-security-vulnerability-in-servicenow/
47. **Salesloft/Drift breach** (August 2025) — Single compromised AI chat agent exposed 700+ companies via stolen OAuth tokens.

### Linux Foundation Announcements

48. **Linux Foundation** — "AGNTCY Project welcomed to standardize open multi-agent system infrastructure" (July 2025). https://www.linuxfoundation.org/press/linux-foundation-welcomes-the-agntcy-project
49. **Linux Foundation** — "Agentic AI Foundation (AAIF) launched" (December 2025). Founding members: Anthropic, OpenAI, Block.
50. **Linux Foundation** — "A2A Protocol Project launched" (June 2025). https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **A2A** | Agent-to-Agent Protocol (Google/Linux Foundation) |
| **ABAC** | Attribute-Based Access Control |
| **AgentCard** | JSON metadata document describing an A2A agent's capabilities and auth requirements |
| **CIBA** | Client Initiated Backchannel Authentication (OAuth extension for async approval) |
| **DID** | Decentralized Identifier (W3C standard for self-sovereign identity) |
| **HITL** | Human-in-the-Loop |
| **MCP** | Model Context Protocol (Anthropic) |
| **mTLS** | Mutual TLS (both client and server authenticate) |
| **NHI** | Non-Human Identity |
| **OASF** | Open Agent Schema Framework (AGNTCY) |
| **OPA** | Open Policy Agent (CNCF graduated policy engine) |
| **PKCE** | Proof Key for Code Exchange (OAuth security extension) |
| **RBAC** | Role-Based Access Control |
| **ReBAC** | Relationship-Based Access Control |
| **SLIM** | Secure Low-Latency Interactive Messaging (AGNTCY) |
| **SPIFFE** | Secure Production Identity Framework For Everyone (CNCF graduated) |
| **SPIRE** | SPIFFE Runtime Environment |
| **SVID** | SPIFFE Verifiable Identity Document |
| **TxToken** | Transaction Token (IETF draft for agent delegation) |
| **VC** | Verifiable Credential (W3C standard) |
| **WIMSE** | Workload Identity in a Multi-System Environment (IETF WG) |
| **XAA** | Cross-App Access (Okta protocol for agent-to-app authorization) |

---

## Appendix B: Quick-Start Architecture Decision Records

### ADR-001: Keycloak as the Identity Hub
**Decision:** Use Keycloak (extended via SPI) as the central identity and authorization server.
**Rationale:** Keycloak 26.4+ already supports MCP authorization, SPIFFE SVID authentication, CIBA, and fine-grained authorization. Extending it is faster and more reliable than building from scratch. CNCF incubation ensures long-term viability. Zero licensing cost.
**Alternatives considered:** Custom-built IdP (too much effort), FusionAuth (less extensible), Ory Hydra (less feature-complete).

### ADR-002: SPIFFE/SPIRE for Workload Identity
**Decision:** Use SPIFFE/SPIRE for all agent workload identity.
**Rationale:** CNCF graduated, production-proven at massive scale (Uber, Netflix, Square). Provides zero-trust mTLS without shared secrets. Short-lived, auto-rotating credentials. Federation support for cross-org trust.
**Alternatives considered:** Kubernetes ServiceAccount tokens (insufficient for cross-cluster), custom PKI (maintenance burden).

### ADR-003: OPA as Primary Policy Engine
**Decision:** Use OPA (with Cedar as optional alternative) for fine-grained authorization.
**Rationale:** CNCF graduated, universal policy engine. Rego language is powerful for complex agent authorization rules. Sidecar deployment model. Extensive ecosystem integration.
**Alternatives considered:** Cedar (excellent but narrower ecosystem), Keycloak AuthZ Services only (insufficient for complex agent scenarios), Cerbos (less mature).

### ADR-004: OpenTelemetry for Observability
**Decision:** Use OpenTelemetry as the sole observability framework.
**Rationale:** CNCF graduated, vendor-neutral, supports traces + metrics + logs. Enables distributed tracing across agent delegation chains. Exports to any backend (Jaeger, Tempo, Splunk, Elastic).
**Alternatives considered:** Custom logging (fragmented), vendor-specific solutions (lock-in).

---

*This document is a living research artifact. Last updated: March 16, 2026.*
*Proposed license for AgentVault project: Apache 2.0*
*Contact: pavan (ppaei-opsec)*
