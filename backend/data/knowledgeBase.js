/**
 * NovaTech Solutions – Sample Knowledge Base
 *
 * ⚠️  ALL COMPANY INFORMATION, PRODUCTS, PRICING, AND DATA IN THIS FILE ARE
 *     ENTIRELY FICTIONAL AND CREATED FOR DEMONSTRATION PURPOSES ONLY.
 *     This is not a real company or real product offering.
 *
 * This data is loaded by ragService.js, chunked, and retrieved via
 * keyword-based similarity search (TF-IDF fallback).
 * Production upgrade: replace with vector embeddings via Gemini Embedding API.
 */

const knowledgeDocuments = [
  {
    id: "kb-001",
    category: "company",
    title: "NovaTech Solutions – Company Overview",
    content: `NovaTech Solutions is a B2B SaaS company founded in 2019, headquartered in Bangalore, India.
We specialize in business automation software and AI-powered customer engagement solutions for small and mid-size enterprises (SMEs).
Our mission is to make enterprise-grade automation accessible to every business, regardless of size.
We serve over 500 businesses across India, Southeast Asia, and the Middle East.
Our team of 120 professionals includes engineers, data scientists, and sales experts.
NovaTech is backed by Series A funding of ₹25 crore and is profitability-focused.
Our offices are in Bangalore (HQ), Mumbai, and Delhi.
Contact: support@novatech-solutions.in | Sales: sales@novatech-solutions.in | Phone: +91-80-4567-8900`,
  },
  {
    id: "kb-002",
    category: "products",
    title: "NovaTech AutoFlow – Business Process Automation",
    content: `NovaTech AutoFlow is our flagship business process automation platform.
It enables companies to automate repetitive workflows without writing code using a drag-and-drop visual builder.
Key features:
- Visual workflow builder with 200+ pre-built templates
- Integration with 150+ tools including Salesforce, Zoho CRM, Tally, QuickBooks, WhatsApp Business, Gmail, and Slack
- Intelligent document processing with OCR and data extraction
- Approval workflows with multi-level hierarchy support
- Real-time monitoring dashboard and audit logs
- Role-based access control for teams of any size
- Mobile app for approvals and notifications (iOS and Android)
- API access for custom integrations
Ideal for: HR processes, finance approvals, inventory management, customer onboarding, and compliance workflows.
Supported industries: Real estate, manufacturing, education, healthcare, retail, and logistics.`,
  },
  {
    id: "kb-003",
    category: "products",
    title: "NovaTech EngageAI – AI Customer Engagement Platform",
    content: `NovaTech EngageAI is our AI-powered customer engagement and sales automation solution.
It helps businesses communicate with customers through intelligent chatbots, voice agents, and automated follow-up sequences.
Key features:
- Multilingual AI chatbot supporting English, Hindi, Tamil, Telugu, Marathi, and Kannada
- Voice AI agent for inbound and outbound sales calls
- WhatsApp, SMS, and email automation
- Lead capture and intelligent qualification
- Sentiment analysis and intent detection
- CRM integration with automatic lead scoring
- Real-time conversation analytics
- Customizable sales scripts and objection handling
- Appointment scheduling with calendar sync
- Detailed performance reports
Ideal for: Sales teams, customer support, lead generation, and customer retention campaigns.`,
  },
  {
    id: "kb-004",
    category: "products",
    title: "NovaTech DataInsight – Business Intelligence Dashboard",
    content: `NovaTech DataInsight is a business intelligence and reporting platform that connects to your existing data sources.
Key features:
- Connect to MySQL, PostgreSQL, MongoDB, Google Sheets, Excel, and 50+ data sources
- Drag-and-drop dashboard builder
- 40+ chart types including bar, line, pie, heatmap, funnel, and geo maps
- Automated report scheduling and email delivery
- Role-based data access and row-level security
- Natural language query ("Show me last month's sales by region")
- Anomaly detection and smart alerts
- Export to PDF, Excel, and CSV
Ideal for: Business owners, operations managers, finance teams, and marketing teams who need data-driven decisions without a data science background.`,
  },
  {
    id: "kb-005",
    category: "pricing",
    title: "NovaTech AutoFlow Pricing",
    content: `NovaTech AutoFlow is available in three plans. All prices are in Indian Rupees per month, billed annually.
Starter Plan – ₹4,999/month
  - Up to 5 users
  - 50 active workflows
  - 10,000 workflow runs/month
  - 50 integrations
  - Email support (48-hour response)
  - 5 GB document storage
  
Professional Plan – ₹14,999/month (most popular)
  - Up to 25 users
  - Unlimited workflows
  - 1,00,000 workflow runs/month
  - All 150+ integrations
  - Priority support (8-hour response)
  - 50 GB storage
  - Custom branding
  - Advanced analytics
  
Enterprise Plan – Custom pricing
  - Unlimited users
  - Unlimited workflows and runs
  - Dedicated account manager
  - Custom SLA (99.9% uptime guarantee)
  - On-premise deployment option
  - Custom integrations
  - Staff training included
  - Contact sales for a custom quote

All plans include a 14-day free trial. No credit card required.
Annual billing saves 20% compared to monthly billing.`,
  },
  {
    id: "kb-006",
    category: "pricing",
    title: "NovaTech EngageAI Pricing",
    content: `NovaTech EngageAI pricing (per month, billed annually):

Starter – ₹6,999/month
  - 1 AI chatbot
  - Up to 1,000 conversations/month
  - English and Hindi support
  - Basic lead qualification
  - WhatsApp and website widget
  - Standard reports

Growth – ₹19,999/month
  - 3 AI agents (chatbot + voice)
  - Up to 10,000 conversations/month
  - 6 Indian languages
  - Advanced lead scoring
  - CRM integration (Zoho, HubSpot, Salesforce)
  - Sentiment analysis
  - Appointment scheduling
  - Priority support

Enterprise – Custom pricing
  - Unlimited AI agents
  - Unlimited conversations
  - Custom AI training on your business data
  - Dedicated infrastructure
  - Full API access
  - On-premise or private cloud deployment

Free trial: 14 days, 100 conversations included.`,
  },
  {
    id: "kb-007",
    category: "pricing",
    title: "NovaTech DataInsight Pricing",
    content: `NovaTech DataInsight pricing (per month, billed annually):

Basic – ₹2,999/month
  - 3 users
  - 5 dashboards
  - 10 data source connections
  - Standard charts
  - Weekly report scheduling

Professional – ₹8,999/month
  - 10 users
  - Unlimited dashboards
  - 50 data source connections
  - All chart types
  - Daily scheduling and alerts
  - Natural language queries (beta)

Enterprise – Custom
  - Unlimited users and dashboards
  - Custom data connectors
  - Row-level security
  - Dedicated support

All plans: 14-day free trial.`,
  },
  {
    id: "kb-008",
    category: "faq",
    title: "Frequently Asked Questions – General",
    content: `Q: Do you offer a free trial?
A: Yes. All NovaTech products come with a 14-day free trial. No credit card is required to start.

Q: Can I upgrade or downgrade my plan?
A: Yes. You can change your plan at any time. Upgrades take effect immediately. Downgrades apply at the next billing cycle.

Q: Is my data secure?
A: NovaTech follows ISO 27001 practices. Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Servers are hosted in India (AWS Mumbai region) to comply with data localization requirements.

Q: Do you support integration with Indian accounting software like Tally?
A: Yes. AutoFlow integrates natively with Tally ERP 9 and Tally Prime for invoice, payment, and purchase order automation.

Q: What is your uptime guarantee?
A: Our standard SLA is 99.5% uptime. Enterprise plans include a 99.9% uptime guarantee with financial credits.

Q: Do you offer onboarding support?
A: Yes. All paid plans include onboarding assistance. Professional and Enterprise plans include dedicated onboarding sessions.

Q: Can I export my data?
A: Yes. You can export your data at any time in CSV, JSON, or Excel format. We do not hold your data hostage.

Q: What payment methods do you accept?
A: We accept UPI, net banking, credit/debit cards, and corporate purchase orders for annual Enterprise contracts.`,
  },
  {
    id: "kb-009",
    category: "faq",
    title: "Frequently Asked Questions – Technical",
    content: `Q: Is technical knowledge required to use AutoFlow?
A: No. AutoFlow is designed for non-technical business users. The drag-and-drop builder requires no coding.

Q: Can AutoFlow integrate with our custom internal software?
A: Yes, using our REST API and webhook support. Custom integrations are available on Professional and Enterprise plans.

Q: Does EngageAI work on WhatsApp?
A: Yes. EngageAI supports WhatsApp Business API for automated conversations, lead capture, and appointment scheduling.

Q: How is the AI trained on our business information?
A: On standard plans, you configure the AI by providing your product and policy information through our admin panel. On Enterprise plans, we train a custom AI model on your historical customer conversations and business documents.

Q: Can multiple team members use the same account?
A: Yes. User management with role-based access is included on all paid plans.

Q: What languages does EngageAI support?
A: English, Hindi, Tamil, Telugu, Marathi, and Kannada. Additional languages are available on Enterprise plans.

Q: How long does implementation take?
A: AutoFlow can be set up within 1 to 3 days for standard use cases. EngageAI takes 3 to 5 days including AI configuration and testing. Complex Enterprise implementations typically take 2 to 4 weeks.`,
  },
  {
    id: "kb-010",
    category: "sales-policy",
    title: "Sales and Refund Policy",
    content: `NovaTech Solutions Sales Policy:

Free Trial: Every new customer receives a 14-day free trial with full product access. No payment is required.

Pricing: All prices are in Indian Rupees (INR) and exclude GST (18%). Final invoice includes GST.

Contracts: Monthly and annual contracts are available. Annual contracts save 20%.

Refunds: We offer a 30-day money-back guarantee on annual plans if you are not satisfied. Monthly plans are non-refundable but can be cancelled anytime.

Cancellation: You can cancel your subscription at any time from your account settings. No cancellation fee.

Data after cancellation: Your data is retained for 60 days after cancellation to allow export. After 60 days, data is permanently deleted per our privacy policy.

Custom contracts: Enterprise customers may negotiate custom payment terms, SLAs, and contractual requirements.

Discounts: We offer special pricing for NGOs (30% discount), educational institutions (25% discount), and startups registered under DPIIT (20% discount). Contact sales for verification.

Volume discounts: Organizations purchasing 10 or more seats receive a 10% additional discount. 25 or more seats receive 15%.`,
  },
  {
    id: "kb-011",
    category: "support",
    title: "Customer Support and Contact Information",
    content: `NovaTech Solutions Support Options:

Help Center: docs.novatech-solutions.in – Articles, tutorials, and video guides.

Email Support:
  - General: support@novatech-solutions.in (response within 48 hours on Starter)
  - Priority: support@novatech-solutions.in (response within 8 hours on Professional)
  - Emergency: enterprise@novatech-solutions.in (1-hour response on Enterprise)

Phone: +91-80-4567-8900 (Monday to Friday, 9 AM to 6 PM IST)

WhatsApp Support: +91-98765-43210

Live Chat: Available on our website 9 AM to 9 PM IST.

Onboarding: Schedule a free onboarding call at novatech-solutions.in/onboarding

Sales Team:
  Email: sales@novatech-solutions.in
  Phone: +91-80-4567-8901

Office Address:
  NovaTech Solutions Private Limited
  WeWork Galaxy, 43, Residency Road,
  Bangalore, Karnataka 560025, India
  
  (This is a fictional address for demonstration purposes.)`,
  },
  {
    id: "kb-012",
    category: "use-cases",
    title: "Use Cases by Industry",
    content: `Real Estate:
  AutoFlow: Automate property inquiry responses, document collection (KYC, agreements), payment reminders, and agent performance tracking.
  EngageAI: AI agent handles initial property inquiries, qualifies buyer interest (budget, location, type), and schedules site visits automatically.

Education and Coaching:
  AutoFlow: Automate student enrollment, fee collection reminders, assignment tracking, and certificate generation.
  EngageAI: AI counselor answers course inquiries, qualifies student interest, and books demo classes.

Manufacturing and Logistics:
  AutoFlow: Purchase order automation, supplier communication, inventory reorder triggers, and compliance reporting.
  DataInsight: Real-time production dashboards, delivery tracking, and quality metrics.

Healthcare:
  AutoFlow: Patient appointment workflows, prescription reminders, billing, and insurance claim tracking.
  EngageAI: AI receptionist for appointment scheduling and FAQ handling (non-diagnostic use only).

Retail and E-commerce:
  AutoFlow: Order processing, return management, supplier invoicing, and promotion workflows.
  EngageAI: Personalized product recommendations, cart recovery, and post-purchase follow-up.

Financial Services:
  AutoFlow: Loan application processing, document collection, compliance workflows, and audit reports.
  EngageAI: AI agent for initial product inquiries, lead qualification, and appointment booking with advisors.`,
  },
];

module.exports = { knowledgeDocuments };
