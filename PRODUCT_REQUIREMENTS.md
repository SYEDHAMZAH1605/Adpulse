# AdPulse — Product Requirements

## Business objective

Demonstrate how a unified campaign workspace can help advertisers and agencies monitor cross-channel performance, understand return on ad spend, and make more informed budget-allocation decisions. The prototype should communicate its calculations and planning assumptions rather than imply predictive certainty.

## User problem

Advertisers often review spend, clicks, conversions, and revenue in separate platform reports. This makes cross-channel comparisons slow and makes it harder to prioritize budget changes. Teams need a clear summary, ways to investigate campaign-level results, and transparent signals about possible optimization opportunities.

## Functional requirements

### Navigation and overview

- Provide working navigation for Overview, Campaigns, Analytics, Budget Planner, and Insights.
- Show account totals for spend, impressions, clicks, conversions, CTR, CPC, and ROAS.
- Derive totals and ratios from the local campaign records; do not hard-code aggregate values.
- Display spend/revenue and conversion trend visualizations.

### Campaign management and reporting

- Include at least eight campaigns across Google Ads, Meta Ads, and Display.
- Show budget, spend, impressions, clicks, conversions, revenue, CTR, CPC, ROAS, and status.
- Support campaign-name/platform search, platform and status filters, and sorting on table columns.
- Open a details view with campaign metrics and monthly budget.
- Export the currently filtered campaign records as CSV.
- Show a useful empty state when no campaigns match.

### Analytics

- Visualize campaign spend compared with revenue.
- Visualize the channel share of spending.
- Visualize monthly conversions.
- Reflect the selected campaign filters in analytics where applicable.

### Budget planning

- Let the user adjust each campaign’s proposed monthly budget.
- Show the original allocation, proposed allocation, total allocated, and remaining amount relative to the original budget envelope.
- Clearly show when the plan exceeds the original envelope.
- Compare current attributed revenue with a proposed revenue estimate.
- Explain the estimate method and label all projections as illustrative, not actual or guaranteed results.
- Let the user restore original budget allocations.

### Insights

- Identify campaigns with ROAS below 1.5x.
- Flag campaigns with CPC above $0.45.
- Flag campaigns spending at least 70% of budget while producing fewer than 300 conversions.
- Highlight campaigns with ROAS of at least 4x.
- Explain each rule-based signal and link it to the relevant campaign.
- Do not describe the signals as output from a trained AI model.

### Product experience

- Use responsive layouts, clear typography, consistent spacing, and accessible control labels.
- Keep interactions local; paid APIs and a backend are out of MVP scope.
- Make visible actions functional and provide feedback for exports and notifications.

## Non-functional requirements

- **Correctness:** campaign metrics use consistent formulas: CTR = clicks / impressions; CPC = spend / clicks; ROAS = revenue / spend. Aggregated CTR and CPC are calculated from aggregate clicks, impressions, and spend.
- **Clarity:** currency, units, status, and estimate limitations are visible in context.
- **Responsiveness:** core navigation, filters, tables, charts, and budget controls remain usable on narrow screens.
- **Maintainability:** use reusable React components and keep sample data separate from UI rendering.
- **Privacy and cost:** no user data leaves the browser; no paid services or API credentials are required.
- **Reliability:** all primary navigation and controls work with the included local dataset and build without errors.

## Main user journey

1. Open Overview to understand current account-level results and review top campaigns.
2. Navigate to Campaigns, search or filter by platform/status, sort the relevant metrics, and open campaign details.
3. Review Analytics to compare campaign spend/revenue, channel investment, and conversion trends for the visible campaign set.
4. Open Budget Planner, adjust monthly allocations, compare original and proposed amounts, and review the clearly labeled estimate and remaining envelope.
5. Review Insights to prioritize campaigns for investigation, using the displayed rule and supporting metric.
6. Export filtered campaign data when a shareable spreadsheet is useful.

## Success metrics

For a future instrumented product, evaluate:

- Time to locate the highest- and lowest-return campaigns
- Percentage of users who inspect campaign details after applying a filter
- Budget-plan creation and reset rates, plus the number of allocation changes explored
- CSV export completion rate
- User understanding of the estimate assumptions and distinction between actuals and projections
- Task completion and usability feedback across desktop and mobile layouts

These are proposed product success measures; this local prototype does not collect usage analytics.

## MoSCoW prioritization

### Must have

- Overview with derived account metrics
- Local records for at least eight campaigns across three channel types
- Campaign search, platform/status filtering, sorting, detail view, and CSV export
- Spend/revenue, channel spending, and conversion-trend charts
- Interactive budget allocation with envelope totals, reset, and transparent estimated projections
- Rule-based recommendations with understandable explanations
- Working navigation and responsive core screens

### Should have

- Empty states for filters and charts
- Filter-aware analytics
- Mobile navigation and accessible labels
- Product documentation and clearly stated sample-data limitations

### Could have

- Saved allocation scenarios and side-by-side scenario comparisons
- Customizable insight thresholds and reporting periods
- Additional breakdowns by audience, creative, region, or conversion type
- Notifications for configurable campaign anomalies

### Won’t have in this MVP

- Live platform integrations or a backend
- Automated bidding or budget changes on advertising platforms
- Forecasting presented as guaranteed outcome
- Authentication, agency/client permissions, and team collaboration
- Trained AI recommendations
