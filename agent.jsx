import { useState } from "react";

const layers = [
  {
    id: "identity",
    name: "Identity Layer",
    subtitle: "Who is this agent?",
    color: "#0F766E",
    bgGradient: "linear-gradient(135deg, #0F766E 0%, #134E4A 100%)",
    components: [
      {
        name: "Agent Identity Registry",
        tech: "Keycloak + Custom SPI",
        desc: "First-class agent identity objects alongside human users. Each agent gets a unique identity with mandatory human sponsor, model version, provider attestation, and capability declarations. Extends Keycloak's entity model via a custom SPI (Service Provider Interface) to add agent-specific attributes: agent_type, agent_model, agent_provider, delegation_chain, and runtime_attestation.",
        oss: "Keycloak (CNCF)",
        icon: "🪪"
      },
      {
        name: "Workload Identity (SPIFFE/SPIRE)",
        tech: "SPIFFE SVIDs + mTLS",
        desc: "Every agent runtime gets a cryptographic SPIFFE ID (e.g., spiffe://org.example/agent/trading-bot/v2). SPIRE issues short-lived X.509 SVIDs with automatic rotation. Enables zero-trust mTLS between agents without shared secrets. Federation across organizational boundaries via SPIFFE trust bundles.",
        oss: "SPIFFE/SPIRE (CNCF Graduated)",
        icon: "🔐"
      },
      {
        name: "DID-based Portable Identity",
        tech: "W3C DIDs + Verifiable Credentials",
        desc: "For cross-organizational agent trust. Agents can carry portable, self-sovereign identities using did:web or did:key methods. Verifiable Credentials attest to capabilities, certifications, and authorization grants. Enables agent identity that survives provider switches.",
        oss: "AGNTCY Identity (Linux Foundation)",
        icon: "🌐"
      }
    ]
  },
  {
    id: "auth",
    name: "Authentication & Authorization Layer",
    subtitle: "What can this agent do?",
    color: "#7C3AED",
    bgGradient: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
    components: [
      {
        name: "OAuth 2.1 + MCP Auth Gateway",
        tech: "Keycloak as MCP Authorization Server",
        desc: "Keycloak 26.4+ natively serves OAuth 2.0 Server Metadata via RFC 8414, making it a direct MCP authorization server. Supports Client Credentials (M2M), Authorization Code + PKCE (human-in-the-loop), and SPIFFE SVID authentication. Step-up authorization for progressive scope escalation.",
        oss: "Keycloak 26.4+ (native MCP support)",
        icon: "🛡️"
      },
      {
        name: "Policy Engine (Fine-Grained AuthZ)",
        tech: "OPA / Cedar / Keycloak AuthZ Services",
        desc: "Context-aware authorization evaluating: agent identity, data sensitivity labels, time-of-day, target service classification, anomaly scores, and delegation depth. Policies as code in Rego (OPA) or Cedar. Supports ABAC, ReBAC, and task-based authorization. Example: 'Agent X can read sales data only during business hours, only if delegated by a VP-level sponsor, and only for the current quarter.'",
        oss: "OPA (CNCF Graduated) / Cedar (Apache 2.0)",
        icon: "📋"
      },
      {
        name: "Delegation Chain Manager",
        tech: "Transaction Tokens + Macaroons",
        desc: "Manages human→agent→sub-agent delegation with cryptographic proof chains. Implements IETF Transaction Tokens for Agents with actor/principal context. Supports scope attenuation (each delegation can only narrow permissions, never widen). Configurable max delegation depth. Automatic chain revocation propagation.",
        oss: "Custom (building on IETF drafts)",
        icon: "🔗"
      }
    ]
  },
  {
    id: "runtime",
    name: "Runtime Security Layer",
    subtitle: "Is this agent behaving correctly?",
    color: "#DC2626",
    bgGradient: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)",
    components: [
      {
        name: "Token Vault & Credential Injection",
        tech: "HashiCorp Vault + Custom Agent Plugin",
        desc: "Agents NEVER see or store credentials. The vault holds OAuth tokens for third-party services with automatic refresh. Credentials are injected at request time via a sidecar/SDK. Short-lived tokens (15-30 min) with automatic rotation. Supports 50+ service integrations via a pluggable connector framework. Open-source alternative to Auth0's proprietary Token Vault.",
        oss: "HashiCorp Vault (BSL) + Custom Plugin (Apache 2.0)",
        icon: "🏦"
      },
      {
        name: "Behavioral Anomaly Detection",
        tech: "OpenTelemetry + ML Scoring",
        desc: "Real-time monitoring of agent behavior against expected patterns. Tracks: API call frequency, data volume accessed, scope utilization, unusual service access patterns, and delegation chain anomalies. Feeds anomaly scores back into the Policy Engine for dynamic authorization decisions. Alerts on confused deputy patterns.",
        oss: "OpenTelemetry (CNCF) + Custom ML models",
        icon: "🔍"
      },
      {
        name: "Human-in-the-Loop Gateway",
        tech: "CIBA + WebSocket Notifications",
        desc: "Async authorization for sensitive operations. Implements OAuth 2.0 CIBA (Client Initiated Backchannel Authentication) for human approval of high-risk agent actions. Configurable policies: auto-approve low-risk, require human approval for financial transactions > $X, block operations on PII data without explicit consent. Notification via Slack, Teams, email, or custom webhooks.",
        oss: "Keycloak CIBA + Custom notification service",
        icon: "👤"
      }
    ]
  },
  {
    id: "interop",
    name: "Interoperability Layer",
    subtitle: "How do agents find and trust each other?",
    color: "#D97706",
    bgGradient: "linear-gradient(135deg, #D97706 0%, #92400E 100%)",
    components: [
      {
        name: "Agent Discovery & Registry",
        tech: "AGNTCY Directory + A2A AgentCards",
        desc: "DNS-like discovery for agents. Publishes A2A-compatible AgentCards at /.well-known/agent.json with signed capabilities using JWS. AGNTCY Directory integration for cross-framework discovery (LangGraph, CrewAI, AutoGen). OASF (Open Agent Schema Framework) for capability description.",
        oss: "AGNTCY Directory + A2A Protocol (Linux Foundation)",
        icon: "📡"
      },
      {
        name: "Cross-Org Trust Federation",
        tech: "SPIFFE Federation + OpenID Shared Signals",
        desc: "Federated trust between organizations without a central authority. SPIFFE trust bundle exchange for mTLS across org boundaries. OpenID Shared Signals Framework for real-time revocation propagation. Cross-App Access (XAA) protocol support for enterprise IdP-mediated agent authorization.",
        oss: "SPIFFE Federation + OpenID SSF (standards-based)",
        icon: "🤝"
      },
      {
        name: "Audit & Compliance Engine",
        tech: "OpenTelemetry + Immutable Log Store",
        desc: "Complete audit trail: who (human sponsor), what (agent identity), why (delegation chain), when (timestamp), how (which tools/APIs). GDPR right-to-erasure support with cryptographic log integrity. SOC 2 and HIPAA compliance report generation. Integration with SIEM tools via OpenTelemetry export.",
        oss: "OpenTelemetry (CNCF) + SigStore for log integrity",
        icon: "📊"
      }
    ]
  }
];

const techStack = [
  { category: "Identity Server", tool: "Keycloak 26.4+", license: "Apache 2.0", maturity: "Production", role: "OAuth 2.1 / OIDC / MCP AuthZ Server" },
  { category: "Workload Identity", tool: "SPIFFE / SPIRE", license: "Apache 2.0", maturity: "Production", role: "Zero-trust agent identity & mTLS" },
  { category: "Agent Identity", tool: "AGNTCY Identity", license: "Apache 2.0", maturity: "Early", role: "DID-based agent identity & discovery" },
  { category: "Secrets Mgmt", tool: "HashiCorp Vault", license: "BSL 1.1", maturity: "Production", role: "Token vault & credential injection" },
  { category: "Policy Engine", tool: "OPA / Cedar", license: "Apache 2.0", maturity: "Production", role: "Fine-grained authorization" },
  { category: "Observability", tool: "OpenTelemetry", license: "Apache 2.0", maturity: "Production", role: "Distributed tracing & audit" },
  { category: "Agent Protocol", tool: "A2A Protocol", license: "Apache 2.0", maturity: "Stable", role: "Agent-to-agent communication" },
  { category: "Tool Protocol", tool: "MCP", license: "Open Spec", maturity: "Stable", role: "Agent-to-tool connectivity" },
  { category: "Messaging", tool: "AGNTCY SLIM", license: "Apache 2.0", maturity: "Early", role: "Secure agent messaging layer" },
  { category: "Log Integrity", tool: "SigStore / Rekor", license: "Apache 2.0", maturity: "Production", role: "Tamper-proof audit logs" },
];

const flows = [
  {
    id: "delegated",
    title: "Delegated Access Flow",
    desc: "Human user delegates specific permissions to an agent",
    steps: [
      "Human authenticates via Keycloak (OIDC + MFA)",
      "Human selects agent & grants scoped permissions",
      "Keycloak issues delegation token with actor/principal claims",
      "Agent receives SPIFFE SVID for workload identity",
      "Agent requests resource with delegation token + SVID",
      "Policy Engine evaluates: identity + scope + context + anomaly score",
      "Token Vault injects downstream credentials (agent never sees them)",
      "Full audit trail recorded via OpenTelemetry"
    ]
  },
  {
    id: "a2a",
    title: "Agent-to-Agent Auth Flow",
    desc: "Two agents from different orgs authenticate to collaborate",
    steps: [
      "Agent A discovers Agent B via AGNTCY Directory / A2A AgentCard",
      "Agent A presents SPIFFE SVID; Agent B verifies via federated trust bundle",
      "Mutual TLS established between agent runtimes",
      "Agent A requests collaboration with delegation token showing human sponsor",
      "Agent B's Policy Engine evaluates: trust level + allowed operations + data classification",
      "Scoped session created with max delegation depth = 1",
      "Both agents' audit logs linked via distributed trace ID",
      "Shared Signals Framework propagates any revocation events in real-time"
    ]
  },
  {
    id: "mcp",
    title: "MCP Tool Access Flow",
    desc: "Agent authenticates to access an MCP server (e.g., database, API)",
    steps: [
      "Agent discovers MCP server capabilities via /.well-known/oauth-protected-resource",
      "Agent presents identity to Keycloak MCP Authorization Server",
      "Keycloak validates SPIFFE SVID + checks delegation chain",
      "Step-up authorization if tool requires elevated permissions",
      "Human-in-the-loop approval triggered for sensitive tools (CIBA flow)",
      "Keycloak issues scoped access token with Resource Indicators (RFC 8707)",
      "Token Vault injects MCP server credentials; agent calls tool",
      "Behavioral monitor checks if tool usage matches expected patterns"
    ]
  }
];

export default function AgentVaultArchitecture() {
  const [activeLayer, setActiveLayer] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);
  const [activeTab, setActiveTab] = useState("architecture");
  const [activeFlow, setActiveFlow] = useState("delegated");

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      background: "#0A0A0F",
      color: "#E2E8F0",
      minHeight: "100vh",
      padding: 0,
      margin: 0,
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #0F172A 0%, #0A0A0F 100%)",
        borderBottom: "1px solid #1E293B",
        padding: "32px 40px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 48, height: 48,
            background: "linear-gradient(135deg, #0F766E, #7C3AED)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
            fontWeight: 900,
            color: "white",
            letterSpacing: -2,
          }}>AV</div>
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(90deg, #5EEAD4, #A78BFA, #FCD34D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}>
              AgentVault
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Open-Source Identity & Access Management for AI Agents
            </p>
          </div>
        </div>
        <p style={{
          fontSize: 14, color: "#94A3B8", margin: "16px 0 20px", lineHeight: 1.6, maxWidth: 800,
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}>
          A composable, standards-based IAM stack purpose-built for AI agent ecosystems.
          Built entirely on open-source foundations: Keycloak, SPIFFE/SPIRE, OPA, AGNTCY, and OpenTelemetry.
          Zero vendor lock-in. Enterprise-grade security at zero licensing cost.
        </p>

        {/* Tab Nav */}
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "architecture", label: "Architecture" },
            { id: "stack", label: "Tech Stack" },
            { id: "flows", label: "Auth Flows" },
            { id: "comparison", label: "vs. Commercial" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 20px",
                borderRadius: "8px 8px 0 0",
                border: "1px solid",
                borderBottom: "none",
                borderColor: activeTab === tab.id ? "#334155" : "transparent",
                background: activeTab === tab.id ? "#1E293B" : "transparent",
                color: activeTab === tab.id ? "#E2E8F0" : "#64748B",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 40px 40px" }}>

        {/* Architecture Tab */}
        {activeTab === "architecture" && (
          <div>
            {layers.map((layer, li) => (
              <div key={layer.id} style={{ marginBottom: 24 }}>
                <div
                  onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                  style={{
                    background: activeLayer === layer.id ? layer.bgGradient : "#111827",
                    border: `1px solid ${activeLayer === layer.id ? layer.color : "#1E293B"}`,
                    borderRadius: 12,
                    padding: "16px 24px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: activeLayer === layer.id ? "#FFF" : layer.color,
                        background: activeLayer === layer.id ? "rgba(255,255,255,0.15)" : `${layer.color}22`,
                        padding: "2px 10px",
                        borderRadius: 4,
                        letterSpacing: "0.1em",
                      }}>
                        LAYER {li + 1}
                      </span>
                      <span style={{
                        fontSize: 18, fontWeight: 700,
                        color: activeLayer === layer.id ? "#FFF" : "#E2E8F0",
                      }}>
                        {layer.name}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 13, color: activeLayer === layer.id ? "rgba(255,255,255,0.7)" : "#64748B",
                      margin: "4px 0 0", fontFamily: "'Inter', sans-serif",
                    }}>
                      {layer.subtitle}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 20,
                    transform: activeLayer === layer.id ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.3s",
                    color: activeLayer === layer.id ? "#FFF" : "#475569",
                  }}>▼</span>
                </div>

                {activeLayer === layer.id && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    marginTop: 12,
                  }}>
                    {layer.components.map((comp, ci) => (
                      <div
                        key={ci}
                        onClick={() => setActiveComponent(activeComponent === `${layer.id}-${ci}` ? null : `${layer.id}-${ci}`)}
                        style={{
                          background: activeComponent === `${layer.id}-${ci}` ? "#1E293B" : "#111827",
                          border: `1px solid ${activeComponent === `${layer.id}-${ci}` ? layer.color : "#1E293B"}`,
                          borderRadius: 10,
                          padding: 20,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ fontSize: 28, marginBottom: 10 }}>{comp.icon}</div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", color: "#F1F5F9" }}>
                          {comp.name}
                        </h3>
                        <div style={{
                          fontSize: 11, color: layer.color, fontWeight: 600,
                          marginBottom: 10,
                        }}>
                          {comp.tech}
                        </div>

                        {activeComponent === `${layer.id}-${ci}` && (
                          <div style={{ marginTop: 8 }}>
                            <p style={{
                              fontSize: 12.5, color: "#94A3B8", lineHeight: 1.7, margin: "0 0 12px",
                              fontFamily: "'Inter', sans-serif",
                            }}>
                              {comp.desc}
                            </p>
                            <div style={{
                              fontSize: 11, color: "#5EEAD4",
                              background: "rgba(94,234,212,0.08)",
                              padding: "6px 10px",
                              borderRadius: 6,
                              display: "inline-block",
                            }}>
                              OSS: {comp.oss}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tech Stack Tab */}
        {activeTab === "stack" && (
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 2,
              background: "#1E293B",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #1E293B",
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "140px 160px 90px 90px 1fr",
                background: "#0F172A",
                padding: "12px 20px",
                fontSize: 11,
                fontWeight: 700,
                color: "#64748B",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                <span>Category</span>
                <span>Tool</span>
                <span>License</span>
                <span>Maturity</span>
                <span>Role in AgentVault</span>
              </div>
              {techStack.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 160px 90px 90px 1fr",
                    background: i % 2 === 0 ? "#0D1117" : "#111827",
                    padding: "14px 20px",
                    fontSize: 12.5,
                    alignItems: "center",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <span style={{ color: "#94A3B8", fontWeight: 600 }}>{row.category}</span>
                  <span style={{ color: "#E2E8F0", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{row.tool}</span>
                  <span style={{
                    color: row.license === "Apache 2.0" ? "#5EEAD4" : row.license === "Open Spec" ? "#A78BFA" : "#FCD34D",
                    fontSize: 11, fontWeight: 600,
                  }}>{row.license}</span>
                  <span style={{
                    color: row.maturity === "Production" ? "#4ADE80" : row.maturity === "Stable" ? "#60A5FA" : "#FBBF24",
                    fontSize: 11, fontWeight: 600,
                  }}>{row.maturity}</span>
                  <span style={{ color: "#94A3B8" }}>{row.role}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}>
              {[
                { label: "Total License Cost", value: "$0", sub: "100% open-source or open-spec foundations", color: "#5EEAD4" },
                { label: "CNCF Graduated Projects", value: "3", sub: "SPIFFE/SPIRE, OPA, OpenTelemetry", color: "#A78BFA" },
                { label: "Linux Foundation Projects", value: "2", sub: "A2A Protocol, AGNTCY", color: "#FCD34D" },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: "#111827",
                  border: "1px solid #1E293B",
                  borderRadius: 12,
                  padding: 24,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginTop: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auth Flows Tab */}
        {activeTab === "flows" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {flows.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFlow(f.id)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: `1px solid ${activeFlow === f.id ? "#7C3AED" : "#1E293B"}`,
                    background: activeFlow === f.id ? "#7C3AED22" : "#111827",
                    color: activeFlow === f.id ? "#A78BFA" : "#94A3B8",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  {f.title}
                </button>
              ))}
            </div>

            {flows.filter(f => f.id === activeFlow).map(flow => (
              <div key={flow.id}>
                <p style={{
                  fontSize: 14, color: "#94A3B8", margin: "0 0 20px",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {flow.desc}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {flow.steps.map((step, si) => (
                    <div key={si} style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
                      {/* Timeline */}
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", width: 40,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: si === 0 ? "#0F766E" : si === flow.steps.length - 1 ? "#D97706" : "#1E293B",
                          border: `2px solid ${si === 0 ? "#5EEAD4" : si === flow.steps.length - 1 ? "#FCD34D" : "#334155"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700, color: "#E2E8F0",
                          flexShrink: 0,
                        }}>
                          {si + 1}
                        </div>
                        {si < flow.steps.length - 1 && (
                          <div style={{
                            width: 2, flex: 1, minHeight: 16,
                            background: "linear-gradient(180deg, #334155, #1E293B)",
                          }} />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{
                        background: "#111827",
                        border: "1px solid #1E293B",
                        borderRadius: 8,
                        padding: "12px 16px",
                        marginBottom: 8,
                        flex: 1,
                        fontSize: 13,
                        color: "#CBD5E1",
                        lineHeight: 1.5,
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === "comparison" && (
          <div>
            <div style={{
              background: "#111827",
              border: "1px solid #1E293B",
              borderRadius: 12,
              overflow: "hidden",
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "200px repeat(4, 1fr)",
                background: "#0F172A",
                padding: "14px 20px",
                fontSize: 11,
                fontWeight: 700,
                color: "#64748B",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderBottom: "1px solid #1E293B",
              }}>
                <span>Capability</span>
                <span style={{ color: "#5EEAD4" }}>AgentVault (OSS)</span>
                <span>Microsoft Entra Agent ID</span>
                <span>Auth0 for AI Agents</span>
                <span>AWS AgentCore Identity</span>
              </div>
              {[
                { cap: "License Cost", av: "Free forever", ms: "$6-36/user/mo", auth0: "$23-240/mo base", aws: "Pay per use" },
                { cap: "Agent as First-Class Identity", av: "✅ Keycloak SPI", ms: "✅ Native", auth0: "⚠️ Client-based", aws: "✅ Workload ID" },
                { cap: "MCP Authorization", av: "✅ Keycloak 26.4+", ms: "⚠️ Indirect", auth0: "✅ Native", aws: "✅ Native" },
                { cap: "A2A Protocol Support", av: "✅ AGNTCY + A2A", ms: "⚠️ Copilot Studio", auth0: "❌ Not yet", aws: "⚠️ Partial" },
                { cap: "SPIFFE/Zero-Trust mTLS", av: "✅ SPIRE native", ms: "❌", auth0: "❌", aws: "⚠️ IAM Roles" },
                { cap: "Token Vault", av: "✅ Vault + plugin", ms: "⚠️ Key Vault", auth0: "✅ 35+ services", aws: "✅ Native" },
                { cap: "Fine-Grained AuthZ", av: "✅ OPA/Cedar", ms: "✅ Conditional Access", auth0: "✅ FGA/OpenFGA", aws: "✅ Cedar" },
                { cap: "Human-in-the-Loop", av: "✅ CIBA flow", ms: "✅ Approval workflows", auth0: "✅ CIBA", aws: "⚠️ Step Functions" },
                { cap: "Cross-Org Federation", av: "✅ SPIFFE + SSF", ms: "⚠️ Entra B2B", auth0: "⚠️ Organizations", aws: "⚠️ Cross-account" },
                { cap: "Delegation Chains", av: "✅ TxTokens", ms: "⚠️ Sponsor model", auth0: "⚠️ Token exchange", aws: "⚠️ STS" },
                { cap: "Behavioral Monitoring", av: "✅ OTel + ML", ms: "✅ Identity Protection", auth0: "⚠️ Logs only", aws: "✅ CloudTrail" },
                { cap: "Self-Hosted Option", av: "✅ Always", ms: "❌ Cloud only", auth0: "❌ Cloud only", aws: "❌ Cloud only" },
                { cap: "Vendor Lock-in", av: "None", ms: "High (Azure)", auth0: "Medium", aws: "High (AWS)" },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px repeat(4, 1fr)",
                    padding: "12px 20px",
                    fontSize: 12,
                    borderBottom: "1px solid #1E293B",
                    background: i % 2 === 0 ? "#0D1117" : "#111827",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <span style={{ color: "#94A3B8", fontWeight: 600, fontSize: 12 }}>{row.cap}</span>
                  <span style={{ color: "#5EEAD4", fontWeight: 600 }}>{row.av}</span>
                  <span style={{ color: "#94A3B8" }}>{row.ms}</span>
                  <span style={{ color: "#94A3B8" }}>{row.auth0}</span>
                  <span style={{ color: "#94A3B8" }}>{row.aws}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 24,
              background: "linear-gradient(135deg, #0F766E11, #7C3AED11)",
              border: "1px solid #1E293B",
              borderRadius: 12,
              padding: 24,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0", margin: "0 0 12px" }}>
                Why Open Source Wins for Agent IAM
              </h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                fontFamily: "'Inter', sans-serif",
              }}>
                {[
                  {
                    title: "Cost at Agent Scale",
                    body: "Commercial IAM charges per identity. At 10,000 agents, Okta costs ~$360K/yr. AgentVault: $0 in licensing, only infrastructure costs (~$2-5K/mo for a mid-size deployment on Kubernetes).",
                  },
                  {
                    title: "Auditability & Trust",
                    body: "Security infrastructure must be inspectable. With open source, you can verify there are no backdoors, understand exactly how tokens are issued, and customize policies to your compliance framework.",
                  },
                  {
                    title: "Composability & No Lock-in",
                    body: "Swap any component without rewriting. Replace OPA with Cedar, swap Vault with Infisical, use any SPIFFE-compatible runtime. Standards-based protocols (OAuth 2.1, SPIFFE, A2A) ensure portability.",
                  },
                ].map((card, i) => (
                  <div key={i} style={{
                    background: "#111827",
                    borderRadius: 8,
                    padding: 16,
                  }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#FCD34D", margin: "0 0 8px" }}>{card.title}</h4>
                    <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
