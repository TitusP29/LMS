import { LMSState } from '../types/lms';

export const HERO_SLIDES = [
  {
    id: 'slide-1',
    kicker: 'Enterprise Engineering Curriculum',
    headline: 'A feeling of possibilities in modern systems mastery.',
    subheadline:
      'Structured engineering tracks in cloud infrastructure, distributed architecture, and enterprise security — built for working practitioners.',
    image: '/src/assets/images/hero_engineering_studio_1794948454992.jpg',
    imageAlt: 'Software architects reviewing distributed system diagrams in a glass studio',
    metricLabel: 'Cohort Completion',
    metricValue: '91.4%',
  },
  {
    id: 'slide-2',
    kicker: 'Deep-Focus Study Workspace',
    headline: 'Precision tooling for deliberate technical practice.',
    subheadline:
      'Sequential chapter pacing, synchronized private study notes, and rigorous knowledge checks that convert study hours into verified capability.',
    image: '/src/assets/images/hero_focused_coding_1794948454938.jpg',
    imageAlt: 'Systems engineer analyzing topology and terminal logs at dual monitors',
    metricLabel: 'Verified Credentials',
    metricValue: '4,280+',
  },
  {
    id: 'slide-3',
    kicker: 'Production Cloud Architecture',
    headline: 'Bridge foundational theory and resilient infrastructure.',
    subheadline:
      'Authoritative reference labs, architectural decision records, and verifiable Certificates of Attendance recognized across engineering teams.',
    image: '/src/assets/images/hero_cloud_architecture_1794948455288.jpg',
    imageAlt: 'Modern enterprise cloud operations and brushed aluminum server infrastructure center',
    metricLabel: 'Core Modules',
    metricValue: '24 Tracks',
  },
];

export const DEFAULT_AVATAR_URL =
  '/src/assets/images/avatar_learner_portrait_1794948455258.jpg';

export const MODULE_THUMBNAILS: Record<string, string> = {
  'Cloud & DevOps': '/src/assets/images/hero_cloud_architecture_1794948455288.jpg',
  'Systems Engineering': '/src/assets/images/hero_focused_coding_1794948454938.jpg',
  Cybersecurity: '/src/assets/images/hero_engineering_studio_1794948454992.jpg',
  'Data Architecture': '/src/assets/images/hero_cloud_architecture_1794948455288.jpg',
};

export const SEED_STATE: LMSState = {
  currentUserId: null,
  cohorts: [
    {
      id: 'cohort-2026-q4',
      name: 'Cohort 14 — Autumn Systems',
      track: 'Cloud Infrastructure & Systems',
      startDate: '2026-10-05',
      status: 'Active',
    },
    {
      id: 'cohort-2026-sec',
      name: 'Cohort 15 — Security Engineering',
      track: 'Enterprise Cybersecurity',
      startDate: '2026-11-02',
      status: 'Active',
    },
    {
      id: 'cohort-2027-q1',
      name: 'Cohort 16 — Winter Architecture',
      track: 'Applied Data Architecture',
      startDate: '2027-01-12',
      status: 'Upcoming',
    },
  ],
  users: [
    {
      id: 'user-maya',
      name: 'Maya Lin',
      email: 'maya.lin@intergrid.it',
      password: 'password123',
      role: 'learner',
      headline: 'Senior Infrastructure Engineer · Platform Reliability',
      avatarUrl: DEFAULT_AVATAR_URL,
      streakDays: 12,
      cohortId: 'cohort-2026-q4',
      joinedAt: '2026-09-14',
      weeklyGoalHours: 8,
      emailDigestEnabled: true,
      autoAdvanceChapters: true,
    },
    {
      id: 'user-marcus',
      name: 'Marcus Vance',
      email: 'marcus.vance@intergrid.it',
      password: 'password123',
      role: 'learner',
      headline: 'Full-Stack Systems Developer',
      avatarUrl: '',
      streakDays: 7,
      cohortId: 'cohort-2026-q4',
      joinedAt: '2026-10-01',
      weeklyGoalHours: 6,
      emailDigestEnabled: true,
    },
    {
      id: 'user-elena',
      name: 'Elena Rostova',
      email: 'elena.rostova@intergrid.it',
      password: 'password123',
      role: 'learner',
      headline: 'Principal Security Architect',
      avatarUrl: '',
      streakDays: 19,
      cohortId: 'cohort-2026-sec',
      joinedAt: '2026-08-20',
      weeklyGoalHours: 10,
      emailDigestEnabled: false,
    },
    {
      id: 'user-david',
      name: 'David Okafor',
      email: 'david.okafor@intergrid.it',
      password: 'password123',
      role: 'learner',
      headline: 'Data Platform Engineer',
      avatarUrl: '',
      streakDays: 4,
      cohortId: 'cohort-2026-sec',
      joinedAt: '2026-10-18',
      weeklyGoalHours: 5,
      emailDigestEnabled: true,
    },
    {
      id: 'user-admin',
      name: 'Claire Sterling',
      email: 'admin@intergrid.it',
      password: 'admin123',
      role: 'admin',
      headline: 'Director of Engineering Curriculum · Intergrid IT',
      avatarUrl: '',
      streakDays: 24,
      joinedAt: '2025-01-10',
      weeklyGoalHours: 10,
      emailDigestEnabled: true,
    },
  ],
  modules: [
    {
      id: 'mod-cloud-devops',
      code: 'IG-101',
      title: 'Cloud Infrastructure & DevOps',
      category: 'Cloud & DevOps',
      difficulty: 'Intermediate',
      status: 'Published',
      instructor: 'Henrik Lindqvist, Principal SRE',
      description:
        'Design deterministic container orchestration topologies, zero-downtime deployment pipelines, and declarative infrastructure-as-code across multi-region clusters.',
      outcomes: [
        'Provision reproducible VPC and Kubernetes control planes with Terraform modules',
        'Implement blue/green and canary traffic shifting with automated rollback gates',
        'Diagnose pod scheduling bottlenecks, CNI routing faults, and resource starvation',
      ],
      quizPassingScore: 75,
      chapters: [
        {
          id: 'ch-cd-1',
          order: 1,
          title: 'Declarative Infrastructure & State Locking',
          durationMinutes: 35,
          summary:
            'Understanding idempotent execution plans, remote state backends, and drift detection in multi-engineer environments.',
          sections: [
            {
              heading: 'Why Imperative Provisioning Breaks at Scale',
              body: 'Imperative provisioning scripts encode order-dependent steps without tracking live resource topology. When a script halts mid-execution due to an API rate limit or IAM permission mismatch, operators are left with partial state. Declarative infrastructure engines resolve this by computing a directed acyclic graph (DAG) between desired specification and observed remote state.',
            },
            {
              heading: 'Remote State Locking & Blast Radius Isolation',
              body: 'Always partition Terraform state by failure domain (networking, identity, compute, data) rather than maintaining a monolithic state file. Enforce lease-based state locking via DynamoDB or GCS object preconditions to eliminate concurrent write corruption.',
              codeBlock: {
                language: 'hcl',
                code: `terraform {
  backend "s3" {
    bucket         = "intergrid-tf-state-prod"
    key            = "core-network/eu-central-1/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "intergrid-state-locks"
    encrypt        = true
  }
}`,
              },
            },
          ],
          keyTakeaways: [
            'Separate state files by lifecycle cadence and blast radius.',
            'Enable server-side encryption and strict state locking before CI/CD execution.',
            'Run automated drift detection on a daily read-only schedule.',
          ],
          studyMaterials: [
            {
              id: 'res-cd-1',
              title: 'Terraform State Partitioning Blueprint',
              type: 'Document',
              sizeLabel: '18 KB · Markdown',
              urlOrContent:
                '# State Partitioning Blueprint\n\n1. Layer 0: Identity & Organization Policies\n2. Layer 1: Transit VPC & Subnet Topology\n3. Layer 2: EKS/GKE Control Planes\n4. Layer 3: Stateful Managed Databases',
              uploadedAt: '2026-10-01',
              uploadedBy: 'Claire Sterling',
            },
          ],
        },
        {
          id: 'ch-cd-2',
          order: 2,
          title: 'Container Scheduling & CNI Networking',
          durationMinutes: 45,
          summary:
            'Deep dive into Kubernetes control plane reconciliation loops, kube-scheduler predicates, and eBPF packet forwarding.',
          sections: [
            {
              heading: 'Reconciliation Loops & Informer Caches',
              body: 'Every Kubernetes controller watches the API server using list-watch streams backed by etcd resource versions. Rather than polling, controllers react to delta events via local workqueues with exponential backoff, guaranteeing eventual consistency even across transient control-plane partitions.',
            },
            {
              heading: 'Resource Requests, Limits, and QoS Classes',
              body: 'Setting memory requests equal to memory limits places workloads in the Guaranteed QoS class, shielding critical control services from OOM eviction during node pressure.',
              codeBlock: {
                language: 'yaml',
                code: `resources:
  requests:
    cpu: "500m"
    memory: "512Mi"
  limits:
    cpu: "1000m"
    memory: "512Mi"`,
              },
            },
          ],
          keyTakeaways: [
            'Memory is incompressible; match requests and limits for critical services.',
            'Prefer eBPF-based CNI plugins to eliminate iptables O(n) rule traversal overhead.',
            'Configure PodDisruptionBudgets before enabling automated node upgrades.',
          ],
          studyMaterials: [
            {
              id: 'res-cd-2',
              title: 'Scheduler Predicates & QoS Matrix',
              type: 'Cheat Sheet',
              sizeLabel: '12 KB · Reference',
              urlOrContent:
                'Guaranteed: requests == limits for CPU & Memory\nBurstable: requests < limits\nBestEffort: no requests or limits defined',
              uploadedAt: '2026-10-02',
              uploadedBy: 'Claire Sterling',
            },
          ],
        },
        {
          id: 'ch-cd-3',
          order: 3,
          title: 'Progressive Delivery & Automated Rollbacks',
          durationMinutes: 50,
          summary:
            'Implementing weighted canary routing, SLO burn-rate gates, and deterministic artifact promotion across environments.',
          sections: [
            {
              heading: 'Decoupling Deployment from Release',
              body: 'Deploying a binary to production should never immediately expose 100% of customer traffic. By combining immutable OCI digests with progressive traffic weights (5% -> 25% -> 50% -> 100%), engineering teams contain defect blast radius while collecting statistically valid latency and error telemetry.',
            },
            {
              heading: 'Automated Metric Verification Gates',
              body: 'Define strict abort criteria using p99 request latency and HTTP 5xx error ratios evaluated over sliding 3-minute windows. If any threshold breaches, the ingress controller shifts 100% of traffic back to the baseline ReplicaSet automatically.',
            },
          ],
          keyTakeaways: [
            'Pin container deployments strictly by immutable SHA-256 digest.',
            'Tie canary promotion to objective SLO error budget burn rates.',
            'Maintain backward-compatible database migrations across two release cycles.',
          ],
          studyMaterials: [],
        },
        {
          id: 'ch-cd-4',
          order: 4,
          title: 'Immutable Build Pipelines & Supply Chain Signing',
          durationMinutes: 40,
          summary:
            'Hardening CI runners, generating SLSA provenance attestations, and enforcing admission signature checks.',
          sections: [
            {
              heading: 'Hermetic Builds & Provenance',
              body: 'Every production artifact should be reproducible from a pinned Git commit SHA. Using ephemeral build containers and Sigstore keyless signing binds the resulting container digest to a verified OIDC workload identity.',
            },
          ],
          keyTakeaways: [
            'Never mount long-lived cloud IAM keys inside CI runners; use OIDC federation.',
            'Verify cryptographic image signatures at cluster admission time.',
          ],
          studyMaterials: [],
        },
      ],
      additionalMaterials: [
        {
          id: 'add-cd-1',
          title: 'Production Incident Runbook Template',
          type: 'Reference PDF',
          sizeLabel: '42 KB · Runbook Spec',
          urlOrContent:
            'Intergrid IT Incident Runbook: Triage -> Mitigate -> Communicate -> Postmortem within 48h.',
          uploadedAt: '2026-10-04',
          uploadedBy: 'Claire Sterling',
        },
        {
          id: 'add-cd-2',
          title: 'Kubernetes NetworkPolicy Lab Exercises',
          type: 'Code Lab',
          sizeLabel: '24 KB · YAML Bundle',
          urlOrContent:
            'Default-deny ingress/egress policy lab with DNS allowance on UDP/TCP 53.',
          uploadedAt: '2026-10-06',
          uploadedBy: 'Claire Sterling',
        },
      ],
      quiz: [
        {
          id: 'q-cd-1',
          prompt:
            'Why should Terraform state files be partitioned by infrastructure failure domain rather than stored in a single monolithic state?',
          options: [
            'To reduce blast radius, minimize state lock contention, and speed up plan evaluations',
            'Because Terraform cannot manage more than 50 resources in one state file',
            'To bypass the need for remote state locking entirely',
            'Because S3 buckets limit JSON object sizes to 1 MB',
          ],
          correctIndex: 0,
          explanation:
            'Partitioning state isolates blast radius, reduces lock contention across teams, and keeps plan graph traversal fast.',
        },
        {
          id: 'q-cd-2',
          prompt:
            'Which Kubernetes QoS class is assigned when CPU and memory requests equal their corresponding limits on every container in a Pod?',
          options: ['Burstable', 'Guaranteed', 'BestEffort', 'CriticalPinned'],
          correctIndex: 1,
          explanation:
            'When both CPU and memory requests match their limits across all containers, Kubernetes assigns the Guaranteed QoS class.',
        },
        {
          id: 'q-cd-3',
          prompt:
            'What is the primary advantage of deploying container images by SHA-256 digest instead of mutable tags like :latest?',
          options: [
            'Faster layer compression during docker push',
            'Cryptographic immutability ensuring every node runs the exact verified build',
            'Automatic horizontal pod autoscaling',
            'Eliminates the need for readiness probes',
          ],
          correctIndex: 1,
          explanation:
            'Mutable tags can be overwritten silently; pinning by SHA-256 digest guarantees deterministic, immutable deployments.',
        },
        {
          id: 'q-cd-4',
          prompt:
            'In progressive canary delivery, what should trigger an immediate automated rollback?',
          options: [
            'Any log line at INFO level',
            'A breach of predefined SLO latency or 5xx error thresholds over the evaluation window',
            'CPU utilization dropping below 20%',
            'Manual approval timeout after 10 seconds',
          ],
          correctIndex: 1,
          explanation:
            'Automated canary gates compare canary telemetry against baseline SLO error and latency budgets to halt bad releases immediately.',
        },
      ],
    },
    {
      id: 'mod-fullstack-systems',
      code: 'IG-204',
      title: 'Full-Stack Systems Engineering',
      category: 'Systems Engineering',
      difficulty: 'Advanced',
      status: 'Published',
      instructor: 'Dr. Soren Kael, Staff Systems Architect',
      description:
        'Architect low-latency APIs, resilient state machines, optimistic UI synchronization, and transactional outbox patterns for high-throughput web platforms.',
      outcomes: [
        'Eliminate dual-write race conditions using transactional outbox queues',
        'Design idempotent REST & RPC endpoints backed by deterministic idempotency keys',
        'Profile frontend rendering bottlenecks and state normalization boundaries',
      ],
      quizPassingScore: 75,
      chapters: [
        {
          id: 'ch-fs-1',
          order: 1,
          title: 'Idempotency Keys & Distributed Request Safety',
          durationMinutes: 40,
          summary:
            'Preventing duplicate mutations across flaky mobile networks and automatic client retries.',
          sections: [
            {
              heading: 'The At-Least-Once Network Reality',
              body: 'Clients can never distinguish between a request that failed before reaching the server and a response lost after the database committed. Every state-mutating API must accept a client-generated Idempotency-Key header stored atomically alongside the transaction outcome.',
              codeBlock: {
                language: 'typescript',
                code: `async function handleMutation(key: string, payload: OrderInput) {
  return db.transaction(async (tx) => {
    const existing = await tx.findIdempotencyRecord(key);
    if (existing) return existing.cachedResponse;
    const result = await tx.createOrder(payload);
    await tx.saveIdempotencyRecord(key, result);
    return result;
  });
}`,
              },
            },
          ],
          keyTakeaways: [
            'Store idempotency records inside the same ACID database transaction as the business write.',
            'Reject mismatched payloads reusing an existing idempotency key with HTTP 422.',
          ],
          studyMaterials: [],
        },
        {
          id: 'ch-fs-2',
          order: 2,
          title: 'Transactional Outbox & Eventual Consistency',
          durationMinutes: 55,
          summary:
            'Coordinating database commits with message broker publication without distributed two-phase locks.',
          sections: [
            {
              heading: 'Solving the Dual-Write Problem',
              body: 'Writing to PostgreSQL and publishing to Kafka as two separate network calls creates silent split-brain failures whenever one call fails. By appending domain events to an outbox table inside the same local transaction and tailing the WAL (Write-Ahead Log), systems guarantee at-least-once event delivery.',
            },
          ],
          keyTakeaways: [
            'Never perform external broker RPCs inside an open SQL transaction.',
            'Consumers must remain idempotent to handle duplicate WAL relay deliveries.',
          ],
          studyMaterials: [],
        },
        {
          id: 'ch-fs-3',
          order: 3,
          title: 'Client State Synchronization & Optimistic Rollback',
          durationMinutes: 35,
          summary:
            'Designing deterministic client caches that reconcile server authority with sub-16ms UI responsiveness.',
          sections: [
            {
              heading: 'Bounded Optimistic Mutations',
              body: 'Optimistic updates apply predicted state immediately while retaining an immutable snapshot of prior cache entries. Upon server rejection or version conflict, the client restores the snapshot cleanly and surfaces an actionable conflict resolution prompt.',
            },
          ],
          keyTakeaways: [
            'Use monotonic version numbers or ETags to detect stale client writes.',
            'Keep optimistic transitions limited to reversible, high-confidence user actions.',
          ],
          studyMaterials: [],
        },
      ],
      additionalMaterials: [
        {
          id: 'add-fs-1',
          title: 'Outbox Relay Reference Implementation',
          type: 'Code Lab',
          sizeLabel: '31 KB · TypeScript',
          urlOrContent: 'Transactional outbox worker with Debezium CDC schema.',
          uploadedAt: '2026-10-09',
          uploadedBy: 'Claire Sterling',
        },
      ],
      quiz: [
        {
          id: 'q-fs-1',
          prompt: 'What problem does the Transactional Outbox pattern solve?',
          options: [
            'CSS layout shift during hydration',
            'Dual-write inconsistency between a primary database and an external message broker',
            'TLS certificate rotation inside load balancers',
            'SQL injection in ORM query builders',
          ],
          correctIndex: 1,
          explanation:
            'The outbox table commits the event atomically with business state in a single local transaction before relaying it asynchronously.',
        },
        {
          id: 'q-fs-2',
          prompt:
            'Where should an API server persist an Idempotency-Key record to guarantee correctness under crash recovery?',
          options: [
            'In browser localStorage',
            'In the same atomic database transaction as the state mutation',
            'In an unsynchronized in-memory JavaScript Map',
            'Only inside application stdout logs',
          ],
          correctIndex: 1,
          explanation:
            'Persisting the idempotency record in the same ACID transaction ensures the business write and key lock succeed or roll back together.',
        },
        {
          id: 'q-fs-3',
          prompt:
            'If a client retries a POST mutation with an existing Idempotency-Key but a different request body, what should the server return?',
          options: [
            'Overwrite the original order silently',
            'Return HTTP 422 or 409 conflict error indicating parameter mismatch',
            'Return HTTP 200 with an empty body',
            'Restart the worker process',
          ],
          correctIndex: 1,
          explanation:
            'Comparing a canonical hash of the request payload prevents accidental misuse of an idempotency key across distinct operations.',
        },
      ],
    },
    {
      id: 'mod-cybersecurity',
      code: 'IG-302',
      title: 'Enterprise Cybersecurity & Zero Trust',
      category: 'Cybersecurity',
      difficulty: 'Intermediate',
      status: 'Published',
      instructor: 'Nadia Al-Mansoor, CISO Advisor',
      description:
        'Implement cryptographic workload identity, mutual TLS service meshes, least-privilege IAM boundaries, and structured threat modeling for enterprise fleets.',
      outcomes: [
        'Replace static perimeter firewalls with SPIFFE/SPIRE mTLS workload attestation',
        'Conduct STRIDE threat modeling on authentication and token exchange flows',
        'Automate secret rotation and short-lived ephemeral credential issuance',
      ],
      quizPassingScore: 75,
      chapters: [
        {
          id: 'ch-sec-1',
          order: 1,
          title: 'Zero-Trust Identity & Mutual TLS (mTLS)',
          durationMinutes: 45,
          summary:
            'Moving trust away from IP subnets toward cryptographically verified workload identities.',
          sections: [
            {
              heading: 'Beyond Implicit Network Trust',
              body: 'Traditional castle-and-moat networks assume traffic inside a private subnet is benign. Zero Trust treats every network hop as hostile, requiring bidirectional X.509 certificate verification (mTLS) with short certificate lifetimes (typically 1 to 24 hours).',
            },
          ],
          keyTakeaways: [
            'Never rely solely on IP allowlists for service-to-service authorization.',
            'Automate X.509 rotation so manual certificate expiry outages cannot occur.',
          ],
          studyMaterials: [],
        },
        {
          id: 'ch-sec-2',
          order: 2,
          title: 'OAuth 2.1, PKCE & Short-Lived Session Architecture',
          durationMinutes: 50,
          summary:
            'Eliminating authorization code interception and securing browser-to-backend token boundaries.',
          sections: [
            {
              heading: 'Proof Key for Code Exchange (PKCE)',
              body: 'PKCE binds the authorization request to the token exchange using a cryptographic SHA-256 code challenge, preventing intercepted authorization codes from being redeemed by rogue clients.',
            },
          ],
          keyTakeaways: [
            'Enforce PKCE (S256) across all public and confidential OAuth clients.',
            'Store refresh tokens in HttpOnly, SameSite=Strict secure cookies or backend vaults.',
          ],
          studyMaterials: [],
        },
        {
          id: 'ch-sec-3',
          order: 3,
          title: 'Threat Modeling & Incident Containment',
          durationMinutes: 35,
          summary:
            'Applying STRIDE analysis and rapid credential revocation playbooks during active compromises.',
          sections: [
            {
              heading: 'Systematic STRIDE Evaluation',
              body: 'Evaluate each trust boundary across Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege before writing production code.',
            },
          ],
          keyTakeaways: [
            'Document trust boundaries visually in architecture design reviews.',
            'Test emergency token revocation paths quarterly.',
          ],
          studyMaterials: [],
        },
      ],
      additionalMaterials: [
        {
          id: 'add-sec-1',
          title: 'STRIDE Architecture Review Checklist',
          type: 'Cheat Sheet',
          sizeLabel: '15 KB · Checklist',
          urlOrContent: 'STRIDE boundary verification worksheet for APIs.',
          uploadedAt: '2026-10-12',
          uploadedBy: 'Claire Sterling',
        },
      ],
      quiz: [
        {
          id: 'q-sec-1',
          prompt: 'How does Zero Trust differ from perimeter-based network security?',
          options: [
            'It disables TLS inside private subnets for lower latency',
            'It authenticates and authorizes every request explicitly regardless of network location',
            'It relies exclusively on VPN IP ranges',
            'It stores static passwords in environment files',
          ],
          correctIndex: 1,
          explanation:
            'Zero Trust removes implicit trust based on network topology and enforces per-request cryptographic identity verification.',
        },
        {
          id: 'q-sec-2',
          prompt: 'What specific attack does PKCE (Proof Key for Code Exchange) mitigate?',
          options: [
            'BGP route hijacking',
            'Authorization code interception and replay by malicious third parties',
            'Memory buffer overflows in C binaries',
            'DNS cache poisoning',
          ],
          correctIndex: 1,
          explanation:
            'PKCE requires the client redeeming an authorization code to prove possession of the original code_verifier.',
        },
        {
          id: 'q-sec-3',
          prompt: 'Why are short-lived mTLS workload certificates (1–24h) preferred over multi-year certificates?',
          options: [
            'They limit the window of exposure if a private key is compromised and force automated rotation',
            'They use smaller RSA 512-bit keys',
            'They skip Certificate Authority verification',
            'They bypass TLS handshakes',
          ],
          correctIndex: 0,
          explanation:
            'Short certificate TTLs shrink compromise blast radius and eliminate reliance on fragile CRL/OCSP revocation lists.',
        },
      ],
    },
    {
      id: 'mod-data-arch',
      code: 'IG-401',
      title: 'Applied Data Architecture',
      category: 'Data Architecture',
      difficulty: 'Advanced',
      status: 'Published',
      instructor: 'Kenji Takahashi, Chief Data Architect',
      description:
        'Master columnar storage internals, lakehouse partitioning strategies, streaming CDC pipelines, and deterministic data quality contracts.',
      outcomes: [
        'Optimize Parquet row-group sizing and Z-order clustering for sub-second analytical scans',
        'Design schema-evolution-safe Avro/Protobuf contracts between operational and analytical tiers',
        'Implement idempotent lakehouse merge pipelines with time-travel auditability',
      ],
      quizPassingScore: 75,
      chapters: [
        {
          id: 'ch-da-1',
          order: 1,
          title: 'Columnar Storage & Predicate Pushdown',
          durationMinutes: 45,
          summary:
            'Understanding Parquet page encodings, min/max zone maps, and vectorization efficiency.',
          sections: [
            {
              heading: 'Minimizing I/O with Zone Maps',
              body: 'Columnar formats store homogeneous values contiguously, enabling dictionary and run-length encoding. Query engines skip entire row groups by inspecting min/max column statistics in the file footer before reading a single data page.',
            },
          ],
          keyTakeaways: [
            'Target 128 MB – 512 MB Parquet file sizes to avoid small-file metadata bottlenecks.',
            'Sort or Z-order by high-cardinality filter columns to maximize row-group pruning.',
          ],
          studyMaterials: [],
        },
        {
          id: 'ch-da-2',
          order: 2,
          title: 'Data Contracts & Backward Schema Evolution',
          durationMinutes: 40,
          summary:
            'Preventing upstream microservice schema changes from silently breaking analytical pipelines.',
          sections: [
            {
              heading: 'Enforcing Compatibility at CI Time',
              body: 'Register schemas in a central registry configured for BACKWARD or FULL compatibility. Additive nullable fields preserve downstream consumers while breaking renames fail CI before deployment.',
            },
          ],
          keyTakeaways: [
            'Treat analytical event schemas as public APIs with explicit ownership.',
            'Quarantine malformed records to a dead-letter topic rather than halting batch jobs.',
          ],
          studyMaterials: [],
        },
      ],
      additionalMaterials: [],
      quiz: [
        {
          id: 'q-da-1',
          prompt: 'How do Parquet zone maps (min/max statistics) accelerate analytical queries?',
          options: [
            'By encrypting every row with AES-256',
            'By allowing the query engine to skip row groups whose value bounds cannot satisfy the WHERE filter',
            'By converting SQL into GraphQL automatically',
            'By duplicating tables across every availability zone',
          ],
          correctIndex: 1,
          explanation:
            'Predicate pushdown inspects row-group min/max metadata to prune non-matching data blocks without disk I/O.',
        },
        {
          id: 'q-da-2',
          prompt: 'Why does the "small files problem" degrade distributed lakehouse query performance?',
          options: [
            'Metadata listing, file open overhead, and poor compression ratios dominate execution time',
            'Small files cannot store UTF-8 strings',
            'Object stores reject files under 10 MB',
            'SQL engines ignore files smaller than 1 MB',
          ],
          correctIndex: 0,
          explanation:
            'Thousands of tiny files force excessive object-store HEAD/GET requests and reduce columnar compression efficiency.',
        },
      ],
    },
    {
      id: 'mod-observability',
      code: 'IG-218',
      title: 'Distributed Observability & SRE',
      category: 'Cloud & DevOps',
      difficulty: 'Foundational',
      status: 'Published',
      instructor: 'Henrik Lindqvist, Principal SRE',
      description:
        'Unify OpenTelemetry traces, structured high-cardinality logs, and Prometheus error-budget alerting to isolate production regressions in minutes.',
      outcomes: [
        'Instrument W3C traceparent context propagation across async queues and HTTP boundaries',
        'Define meaningful SLIs and multi-window SLO burn-rate alerts',
        'Eliminate noisy threshold alerts in favor of user-impact signals',
      ],
      quizPassingScore: 75,
      chapters: [
        {
          id: 'ch-ob-1',
          order: 1,
          title: 'SLIs, SLOs & Error Budget Math',
          durationMinutes: 30,
          summary:
            'Translating user experience into quantifiable reliability targets and actionable release policies.',
          sections: [
            {
              heading: 'Why 100% Reliability Is the Wrong Target',
              body: 'Every extra nine of availability increases architectural complexity exponentially. An error budget (100% - SLO) aligns product velocity and reliability engineering around an explicit, measurable allowance for controlled risk.',
            },
          ],
          keyTakeaways: [
            'Measure SLIs as close to the user boundary as possible.',
            'Alert on multi-window error budget burn rates rather than raw CPU spikes.',
          ],
          studyMaterials: [],
        },
        {
          id: 'ch-ob-2',
          order: 2,
          title: 'OpenTelemetry Context Propagation',
          durationMinutes: 35,
          summary:
            'Correlating distributed spans across microservices, gRPC streams, and worker queues.',
          sections: [
            {
              heading: 'W3C Trace Context Standard',
              body: 'Propagating the traceparent header ensures every downstream service records spans under a unified Trace ID, exposing tail-latency bottlenecks across fan-out call graphs.',
            },
          ],
          keyTakeaways: [
            'Preserve trace context across message broker headers.',
            'Use tail-based sampling to retain 100% of error and high-latency traces.',
          ],
          studyMaterials: [],
        },
      ],
      additionalMaterials: [],
      quiz: [
        {
          id: 'q-ob-1',
          prompt: 'What does an Error Budget represent in Site Reliability Engineering?',
          options: [
            'Total cloud infrastructure spend per quarter',
            'The allowable unreliability (100% minus the SLO target) before feature releases pause for reliability work',
            'Number of syntax errors allowed in CI',
            'Maximum disk utilization threshold',
          ],
          correctIndex: 1,
          explanation:
            'An error budget quantifies acceptable downtime or failure rate to balance innovation speed with service stability.',
        },
        {
          id: 'q-ob-2',
          prompt: 'What is the benefit of tail-based trace sampling over head-based sampling?',
          options: [
            'It lowers browser bundle size',
            'It decides whether to keep a trace after observing whether an error or latency spike occurred',
            'It disables span attributes',
            'It eliminates the need for trace IDs',
          ],
          correctIndex: 1,
          explanation:
            'Tail-based sampling evaluates the complete trace outcome so rare failures and slow outliers are always retained.',
        },
      ],
    },
    {
      id: 'mod-network-protocols',
      code: 'IG-315',
      title: 'Network Protocol Design & QUIC',
      category: 'Systems Engineering',
      difficulty: 'Intermediate',
      status: 'Draft',
      instructor: 'Dr. Soren Kael, Staff Systems Architect',
      description:
        'Explore transport-layer multiplexing, QUIC 0-RTT handshakes, congestion control algorithms (BBR vs CUBIC), and head-of-line blocking mitigation.',
      outcomes: [
        'Compare TCP + TLS 1.3 handshake RTTs against QUIC encrypted transport',
        'Analyze BBR bottleneck bandwidth estimation under packet loss',
      ],
      quizPassingScore: 75,
      chapters: [
        {
          id: 'ch-np-1',
          order: 1,
          title: 'Eliminating Transport Head-of-Line Blocking',
          durationMinutes: 40,
          summary:
            'How QUIC independent streams over UDP solve HTTP/2 single-TCP-connection stalls.',
          sections: [
            {
              heading: 'Independent Stream Framing',
              body: 'In HTTP/2 over TCP, a single lost packet stalls every multiplexed stream until retransmission completes. QUIC runs encrypted streams directly over UDP, isolating packet loss strictly to the affected stream.',
            },
          ],
          keyTakeaways: [
            'QUIC integrates TLS 1.3 handshake directly into transport setup.',
            'Connection IDs allow seamless Wi-Fi to cellular IP migration.',
          ],
          studyMaterials: [],
        },
      ],
      additionalMaterials: [],
      quiz: [
        {
          id: 'q-np-1',
          prompt: 'Why does QUIC mitigate head-of-line blocking better than HTTP/2 over TCP?',
          options: [
            'QUIC disables encryption on multiplexed streams',
            'Lost packets only stall the specific QUIC stream carrying those frames, not unrelated streams',
            'QUIC doubles the Ethernet MTU',
            'QUIC removes flow control entirely',
          ],
          correctIndex: 1,
          explanation:
            'Because QUIC manages stream framing independently in user space over UDP, loss on one stream does not block others.',
        },
      ],
    },
  ],
  enrollments: [
    {
      id: 'enr-1',
      userId: 'user-maya',
      moduleId: 'mod-cloud-devops',
      cohortId: 'cohort-2026-q4',
      enrolledAt: '2026-10-06',
      completedChapterIds: ['ch-cd-1', 'ch-cd-2'],
      timeSpentMinutes: 145,
      lastAccessedChapterId: 'ch-cd-3',
      lastAccessedAt: '2026-11-16',
    },
    {
      id: 'enr-2',
      userId: 'user-maya',
      moduleId: 'mod-cybersecurity',
      cohortId: 'cohort-2026-sec',
      enrolledAt: '2026-10-14',
      completedChapterIds: ['ch-sec-1', 'ch-sec-2', 'ch-sec-3'],
      timeSpentMinutes: 165,
      lastAccessedChapterId: 'ch-sec-3',
      lastAccessedAt: '2026-11-12',
    },
    {
      id: 'enr-3',
      userId: 'user-maya',
      moduleId: 'mod-observability',
      cohortId: 'cohort-2026-q4',
      enrolledAt: '2026-11-01',
      completedChapterIds: ['ch-ob-1'],
      timeSpentMinutes: 42,
      lastAccessedChapterId: 'ch-ob-2',
      lastAccessedAt: '2026-11-15',
    },
    {
      id: 'enr-4',
      userId: 'user-marcus',
      moduleId: 'mod-fullstack-systems',
      cohortId: 'cohort-2026-q4',
      enrolledAt: '2026-10-08',
      completedChapterIds: ['ch-fs-1', 'ch-fs-2'],
      timeSpentMinutes: 120,
      lastAccessedChapterId: 'ch-fs-3',
      lastAccessedAt: '2026-11-14',
    },
    {
      id: 'enr-5',
      userId: 'user-elena',
      moduleId: 'mod-cybersecurity',
      cohortId: 'cohort-2026-sec',
      enrolledAt: '2026-09-20',
      completedChapterIds: ['ch-sec-1', 'ch-sec-2', 'ch-sec-3'],
      timeSpentMinutes: 180,
      lastAccessedChapterId: 'ch-sec-3',
      lastAccessedAt: '2026-11-10',
    },
    {
      id: 'enr-6',
      userId: 'user-david',
      moduleId: 'mod-data-arch',
      cohortId: 'cohort-2026-sec',
      enrolledAt: '2026-10-20',
      completedChapterIds: ['ch-da-1'],
      timeSpentMinutes: 50,
      lastAccessedChapterId: 'ch-da-2',
      lastAccessedAt: '2026-11-13',
    },
  ],
  notes: [
    {
      id: 'note-1',
      userId: 'user-maya',
      moduleId: 'mod-cloud-devops',
      chapterId: 'ch-cd-1',
      content:
        '## Terraform State Boundaries\n\n- Split state per blast radius: `network/`, `iam/`, `eks-core/`.\n- Verify DynamoDB LockID attribute is strictly string.\n- Schedule nightly `terraform plan -detailed-exitcode` in read-only CI.',
      updatedAt: '2026-11-15T18:20:00Z',
    },
    {
      id: 'note-2',
      userId: 'user-maya',
      moduleId: 'mod-cloud-devops',
      chapterId: 'ch-cd-2',
      content:
        '## Kubernetes QoS Notes\n\nFor stateful ingress & core control services, set `requests.memory == limits.memory` so the kubelet assigns **Guaranteed** QoS and avoids OOM preemption under node memory pressure.',
      updatedAt: '2026-11-16T09:10:00Z',
    },
    {
      id: 'note-3',
      userId: 'user-maya',
      moduleId: 'mod-cybersecurity',
      chapterId: 'ch-sec-1',
      content:
        '## mTLS Certificate Rotation\n\nTarget 12h X.509 SVID leaf lifetime with SPIRE agent rotation at 50% TTL.',
      updatedAt: '2026-11-11T14:40:00Z',
    },
  ],
  quizAttempts: [
    {
      id: 'qa-1',
      userId: 'user-maya',
      moduleId: 'mod-cybersecurity',
      scorePercent: 100,
      correctCount: 3,
      totalCount: 3,
      passed: true,
      selectedAnswers: { 'q-sec-1': 1, 'q-sec-2': 1, 'q-sec-3': 0 },
      attemptedAt: '2026-11-12T16:30:00Z',
    },
    {
      id: 'qa-2',
      userId: 'user-elena',
      moduleId: 'mod-cybersecurity',
      scorePercent: 100,
      correctCount: 3,
      totalCount: 3,
      passed: true,
      selectedAnswers: { 'q-sec-1': 1, 'q-sec-2': 1, 'q-sec-3': 0 },
      attemptedAt: '2026-11-10T11:15:00Z',
    },
    {
      id: 'qa-3',
      userId: 'user-marcus',
      moduleId: 'mod-fullstack-systems',
      scorePercent: 67,
      correctCount: 2,
      totalCount: 3,
      passed: false,
      selectedAnswers: { 'q-fs-1': 1, 'q-fs-2': 1, 'q-fs-3': 0 },
      attemptedAt: '2026-11-14T19:05:00Z',
    },
  ],
  certificateTemplates: [
    {
      id: 'tpl-swiss-mono',
      name: 'Intergrid Executive Monochrome Standard',
      issuerTitle: 'Director of Engineering Curriculum',
      sealCode: 'IG-AUTH-2026',
      uploadedAt: '2026-09-01',
    },
  ],
  certificates: [
    {
      id: 'cert-1',
      credentialId: 'IG-2026-302-9841',
      userId: 'user-maya',
      userName: 'Maya Lin',
      moduleId: 'mod-cybersecurity',
      moduleTitle: 'Enterprise Cybersecurity & Zero Trust',
      moduleCode: 'IG-302',
      issuedAt: '2026-11-12',
      issuedBy: 'Claire Sterling',
      templateName: 'Intergrid Executive Monochrome Standard',
    },
    {
      id: 'cert-2',
      credentialId: 'IG-2026-302-7714',
      userId: 'user-elena',
      userName: 'Elena Rostova',
      moduleId: 'mod-cybersecurity',
      moduleTitle: 'Enterprise Cybersecurity & Zero Trust',
      moduleCode: 'IG-302',
      issuedAt: '2026-11-10',
      issuedBy: 'Claire Sterling',
      templateName: 'Intergrid Executive Monochrome Standard',
    },
  ],
  faqs: [
    {
      id: 'faq-1',
      question:
        'How are Certificates of Attendance verified by external employers or engineering managers?',
      answer:
        'Every Certificate of Attendance carries a unique deterministic Credential ID (e.g. IG-2026-302-9841), learner full name, module code, and issue timestamp. Learners can download high-resolution print sheets directly from their Certificates gallery.',
      authorName: 'Maya Lin',
      authorId: 'user-maya',
      moduleTitle: 'Platform & Credentials',
      status: 'Published',
      createdAt: '2026-10-15',
      answeredAt: '2026-10-16',
    },
    {
      id: 'faq-2',
      question:
        'Do I lose my private chapter notes if I retake a module Knowledge Check?',
      answer:
        'No. Private chapter notes are persisted independently per learner, module, and chapter. Retaking a Knowledge Check only logs a new attempt record while keeping your highest passing score intact.',
      authorName: 'Marcus Vance',
      authorId: 'user-marcus',
      moduleTitle: 'Full-Stack Systems Engineering',
      status: 'Published',
      createdAt: '2026-11-04',
      answeredAt: '2026-11-05',
    },
    {
      id: 'faq-3',
      question:
        'Will an upcoming lab cover Terraform state migration from local backends to S3 with DynamoDB locking?',
      answer: '',
      authorName: 'David Okafor',
      authorId: 'user-david',
      moduleTitle: 'Cloud Infrastructure & DevOps',
      status: 'Pending',
      createdAt: '2026-11-16',
    },
  ],
  scheduledSessions: [
    {
      id: 'ses-1',
      userId: 'user-maya',
      title: 'Progressive Delivery Lab Review',
      moduleId: 'mod-cloud-devops',
      dateISO: '2026-11-18',
      timeLabel: '18:30',
      kind: 'Study Session',
    },
    {
      id: 'ses-2',
      userId: 'user-maya',
      title: 'IG-101 Knowledge Check Target',
      moduleId: 'mod-cloud-devops',
      dateISO: '2026-11-21',
      timeLabel: '10:00',
      kind: 'Quiz Target',
    },
    {
      id: 'ses-3',
      userId: 'user-maya',
      title: 'OpenTelemetry Trace Context Lab',
      moduleId: 'mod-observability',
      dateISO: '2026-11-24',
      timeLabel: '19:00',
      kind: 'Study Session',
    },
  ],
  notifications: [
    {
      id: 'notif-1',
      userId: 'user-maya',
      title: 'Certificate Issued · IG-302',
      detail: 'Your Certificate of Attendance for Enterprise Cybersecurity & Zero Trust is ready.',
      createdAt: '2026-11-12',
      read: false,
      targetRoute: '/certificates',
    },
    {
      id: 'notif-2',
      userId: 'user-maya',
      title: 'New Additional Material · IG-101',
      detail: 'Kubernetes NetworkPolicy Lab Exercises was attached to Cloud Infrastructure & DevOps.',
      createdAt: '2026-11-14',
      read: true,
      targetRoute: '/module/mod-cloud-devops',
    },
  ],
};
