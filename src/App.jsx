import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  Eye,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Menu,
  MousePointer2,
  Search,
  Target,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import campaignSeed from './data/campaigns.json'
import './App.css'

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campaigns', icon: Target, count: '08' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'budget', label: 'Budget planner', icon: Wallet },
  { id: 'insights', label: 'Insights', icon: Lightbulb, count: '4' },
]

const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
const channelColors = { 'Google Ads': '#6e78ef', 'Meta Ads': '#39aa91', Display: '#e5a84d' }
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const number = new Intl.NumberFormat('en-US')

function metricsFor(campaigns) {
  const totals = campaigns.reduce((result, campaign) => ({
    spend: result.spend + campaign.spend,
    impressions: result.impressions + campaign.impressions,
    clicks: result.clicks + campaign.clicks,
    conversions: result.conversions + campaign.conversions,
    revenue: result.revenue + campaign.revenue,
  }), { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 })

  return {
    ...totals,
    ctr: totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0,
    cpc: totals.clicks ? totals.spend / totals.clicks : 0,
    roas: totals.spend ? totals.revenue / totals.spend : 0,
  }
}

function getCampaignMetrics(campaign) {
  return {
    ...campaign,
    ctr: campaign.impressions ? (campaign.clicks / campaign.impressions) * 100 : 0,
    cpc: campaign.clicks ? campaign.spend / campaign.clicks : 0,
    roas: campaign.spend ? campaign.revenue / campaign.spend : 0,
  }
}

function App() {
  const [campaigns, setCampaigns] = useState(campaignSeed)
  const [activePage, setActivePage] = useState('overview')
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('All platforms')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [sort, setSort] = useState({ key: 'spend', direction: 'desc' })
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [notice, setNotice] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase()
    return campaigns
      .filter((campaign) => platformFilter === 'All platforms' || campaign.platform === platformFilter)
      .filter((campaign) => statusFilter === 'All statuses' || campaign.status === statusFilter)
      .filter((campaign) => !query || `${campaign.name} ${campaign.platform}`.toLowerCase().includes(query))
      .sort((a, b) => {
        const first = getCampaignMetrics(a)[sort.key]
        const second = getCampaignMetrics(b)[sort.key]
        const comparison = typeof first === 'string' ? first.localeCompare(second) : first - second
        return sort.direction === 'asc' ? comparison : -comparison
      })
  }, [campaigns, platformFilter, statusFilter, search, sort])

  const allMetrics = useMemo(() => metricsFor(campaigns), [campaigns])
  const filteredMetrics = useMemo(() => metricsFor(filteredCampaigns), [filteredCampaigns])
  const insightCount = useMemo(() => buildInsights(campaigns).length, [campaigns])
  const pageTitle = navigation.find((item) => item.id === activePage)?.label ?? 'Overview'

  function showNotice(message) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2800)
  }

  function updateCampaignBudget(id, budget) {
    setCampaigns((current) => current.map((campaign) => (
      campaign.id === id ? { ...campaign, budget: Number(budget) } : campaign
    )))
  }

  function resetBudgets() {
    setCampaigns((current) => current.map((campaign, index) => ({
      ...campaign,
      budget: campaignSeed[index].budget,
    })))
    showNotice('Campaign budgets restored to the original plan.')
  }

  function exportCampaigns() {
    const headings = ['Campaign', 'Platform', 'Budget', 'Spend', 'Impressions', 'Clicks', 'Conversions', 'Revenue', 'CTR', 'CPC', 'ROAS', 'Status']
    const rows = filteredCampaigns.map((campaign) => {
      const metric = getCampaignMetrics(campaign)
      return [
        campaign.name, campaign.platform, campaign.budget, campaign.spend, campaign.impressions,
        campaign.clicks, campaign.conversions, campaign.revenue, metric.ctr.toFixed(2),
        metric.cpc.toFixed(2), metric.roas.toFixed(2), campaign.status,
      ]
    })
    const csv = [headings, ...rows].map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'adpulse-campaigns.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    showNotice('Campaign report downloaded.')
  }

  function changeSort(key) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Activity size={20} strokeWidth={2.6} /></div>
          <span>adpulse<span className="brand-period">.</span></span>
          <button className="icon-button mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-avatar">N</span>
          <span className="workspace-copy"><strong>Northstar Studio</strong><small>Agency workspace</small></span>
          <ChevronDown size={15} />
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              className={`nav-item ${activePage === id ? 'nav-item-active' : ''}`}
              onClick={() => { setActivePage(id); setMobileNavOpen(false) }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {count && <span className="nav-count">{id === 'insights' ? insightCount : count}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-promo">
            <div className="promo-icon"><Zap size={16} /></div>
            <strong>Make every dollar count.</strong>
            <p>Find your next growth opportunity with a smarter budget mix.</p>
            <button onClick={() => { setActivePage('budget'); setMobileNavOpen(false) }}>Explore planner <span>↗</span></button>
          </div>
          <button className="nav-item utility-nav" onClick={() => showNotice('You’re all set — this prototype uses local sample data.')}><CircleHelp size={18} /><span>Help & support</span></button>
          <div className="profile-button">
            <span className="profile-avatar">JD</span>
            <span className="profile-copy"><strong>Jordan Davis</strong><small>Growth lead</small></span>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
            <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{pageTitle}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="date-range"><CalendarDays size={15} /><span>Jun – Nov 2026</span></div>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => showNotice('You’re up to date — no new notifications.')}><Bell size={18} /><i /></button>
            <span className="topbar-divider" />
            <span className="topbar-user">JD</span>
          </div>
        </header>

        <div className="content">
          {activePage === 'overview' && (
            <Overview
              campaigns={campaigns}
              metrics={allMetrics}
              onViewCampaigns={() => setActivePage('campaigns')}
              onSelectCampaign={setSelectedCampaign}
              onOpenAnalytics={() => setActivePage('analytics')}
              onOpenBudget={() => setActivePage('budget')}
            />
          )}
          {activePage === 'campaigns' && (
            <CampaignsPage
              campaigns={filteredCampaigns}
              search={search}
              setSearch={setSearch}
              platformFilter={platformFilter}
              setPlatformFilter={setPlatformFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sort={sort}
              onSort={changeSort}
              onExport={exportCampaigns}
              onSelectCampaign={setSelectedCampaign}
              metrics={filteredMetrics}
            />
          )}
          {activePage === 'analytics' && <AnalyticsPage campaigns={filteredCampaigns} />}
          {activePage === 'budget' && <BudgetPlanner campaigns={campaigns} onBudgetChange={updateCampaignBudget} onReset={resetBudgets} />}
          {activePage === 'insights' && <InsightsPage campaigns={campaigns} onSelectCampaign={setSelectedCampaign} />}
        </div>
      </main>
      {mobileNavOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      {selectedCampaign && <CampaignModal campaign={campaigns.find((campaign) => campaign.id === selectedCampaign.id) ?? selectedCampaign} onClose={() => setSelectedCampaign(null)} />}
      {notice && <div role="status" className="toast"><Check size={16} />{notice}</div>}
    </div>
  )
}

function PageIntro({ eyebrow, title, description, action }) {
  return (
    <div className="page-intro">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

function MetricCard({ label, value, change, icon: Icon, tone = 'violet', footnote }) {
  const positive = !String(change).startsWith('-')
  return (
    <article className="metric-card">
      <div className="metric-topline">
        <span>{label}</span>
        <span className={`metric-icon ${tone}`}><Icon size={17} strokeWidth={1.8} /></span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-foot">
        {change && <span className={`metric-change ${positive ? 'positive' : 'negative'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}
        </span>}
        <span>{footnote ?? 'Calculated from sample data'}</span>
      </div>
    </article>
  )
}

function Overview({ campaigns, metrics, onViewCampaigns, onSelectCampaign, onOpenAnalytics, onOpenBudget }) {
  const chartData = campaigns.map((campaign) => ({
    name: campaign.name.replace(' — ', ' · '),
    spend: campaign.spend,
    revenue: campaign.revenue,
  }))
  const trendData = months.map((month, monthIndex) => ({
    month,
    conversions: campaigns.reduce((total, campaign) => total + campaign.monthlyConversions[monthIndex], 0),
  }))
  const previousMonth = trendData[trendData.length - 2]
  const currentMonth = trendData[trendData.length - 1]
  const trendChange = previousMonth?.conversions
    ? ((currentMonth.conversions - previousMonth.conversions) / previousMonth.conversions) * 100
    : 0
  const bestCampaign = campaigns.reduce((best, campaign) => (
    getCampaignMetrics(campaign).roas > getCampaignMetrics(best).roas ? campaign : best
  ), campaigns[0])

  return (
    <>
      <PageIntro
        eyebrow="SAMPLE REPORTING PERIOD · JUN–NOV 2026"
        title="Good morning, Jordan"
        description="Here’s how your campaigns are performing across channels."
        action={<button className="button button-secondary" onClick={onViewCampaigns}><Eye size={16} /> View campaigns</button>}
      />
      <section className="metric-grid" aria-label="Account performance summary">
        <MetricCard label="Total ad spend" value={currency.format(metrics.spend)} icon={Wallet} tone="violet" footnote="Across all campaigns" />
        <MetricCard label="Impressions" value={compactNumber.format(metrics.impressions)} icon={Eye} tone="blue" footnote="Across all campaigns" />
        <MetricCard label="Clicks" value={compactNumber.format(metrics.clicks)} icon={MousePointer2} tone="green" footnote="Across all campaigns" />
        <MetricCard label="Conversions" value={number.format(metrics.conversions)} icon={Target} tone="orange" footnote="Across all campaigns" />
        <MetricCard label="Average CTR" value={`${metrics.ctr.toFixed(2)}%`} icon={Gauge} tone="pink" footnote="Weighted by impressions" />
        <MetricCard label="Average CPC" value={`$${metrics.cpc.toFixed(2)}`} icon={MousePointer2} tone="teal" footnote="Spend per click" />
        <MetricCard label="Overall ROAS" value={`${metrics.roas.toFixed(2)}x`} change="+0.6x" icon={BarChart3} tone="violet" footnote="revenue per $1 spent" />
      </section>

      <section className="chart-grid overview-charts">
        <article className="panel trend-panel">
          <PanelHeading title="Spend & revenue" subtitle="Campaign-level performance" action={<button className="text-button" onClick={onOpenAnalytics}>View analytics <span>→</span></button>} />
          <div className="chart-legend"><span><i className="legend-dot spend-dot" />Spend</span><span><i className="legend-dot revenue-dot" />Revenue</span></div>
          <div className="chart-wrap chart-tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={5} margin={{ top: 10, right: 6, left: -12, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke="#edf0f4" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8a92a2' }} tickLine={false} axisLine={false} interval={0} angle={-16} textAnchor="end" height={52} />
                <YAxis tickFormatter={(value) => `$${compactNumber.format(value)}`} tick={{ fontSize: 10, fill: '#8a92a2' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CurrencyTooltip />} cursor={{ fill: '#f7f8fb' }} />
                <Bar dataKey="spend" name="Spend" fill="#c6cafa" radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Bar dataKey="revenue" name="Revenue" fill="#5261df" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="panel conversions-panel">
          <PanelHeading title="Conversion trend" subtitle="Conversions by month" action={<span className="period-chip">6 months <ChevronDown size={12} /></span>} />
          <div className="trend-total"><strong>{number.format(metrics.conversions)}</strong><span>total conversions</span></div>
          <div className="chart-wrap chart-trend">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 2, left: -22, bottom: 0 }}>
                <defs><linearGradient id="conversionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#727df0" stopOpacity={0.24} /><stop offset="100%" stopColor="#727df0" stopOpacity={0.01} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#edf0f4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a92a2' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8a92a2' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CountTooltip />} />
                <Area type="monotone" dataKey="conversions" stroke="#6672eb" strokeWidth={2.5} fill="url(#conversionFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="trend-summary"><span className={`trend-indicator ${trendChange < 0 ? 'trend-down' : ''}`}>{trendChange < 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{Math.abs(trendChange).toFixed(1)}%</span><span>vs. {previousMonth?.month ?? 'previous month'}</span></div>
        </article>
      </section>

      <section className="panel table-panel overview-table">
        <PanelHeading title="Top performing campaigns" subtitle="Ranked by return on ad spend" action={<button className="text-button" onClick={onViewCampaigns}>All campaigns <span>→</span></button>} />
        <CampaignTable campaigns={[...campaigns].sort((a, b) => getCampaignMetrics(b).roas - getCampaignMetrics(a).roas).slice(0, 4)} onSelectCampaign={onSelectCampaign} compact />
      </section>

      <section className="bottom-callout">
        <div className="callout-graphic"><Zap size={19} /></div>
        <div><strong>There’s room to grow your best-performing campaigns.</strong><p>{bestCampaign.name} is returning {getCampaignMetrics(bestCampaign).roas.toFixed(1)}x on spend. Explore a smarter budget split.</p></div>
        <button className="button button-dark" onClick={onOpenBudget}>Open budget planner <span>→</span></button>
      </section>
    </>
  )
}

function PanelHeading({ title, subtitle, action }) {
  return <div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>
}

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><strong>{label}</strong>{payload.map((item) => <div key={item.dataKey}><i style={{ backgroundColor: item.color }} />{item.name}: {currency.format(item.value)}</div>)}</div>
}

function CountTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><strong>{label}</strong><div><i className="tooltip-purple" />Conversions: {number.format(payload[0].value)}</div></div>
}

function CampaignsPage({ campaigns, search, setSearch, platformFilter, setPlatformFilter, statusFilter, setStatusFilter, sort, onSort, onExport, onSelectCampaign, metrics }) {
  const selectOptions = [
    { value: platformFilter, onChange: setPlatformFilter, options: ['All platforms', 'Google Ads', 'Meta Ads', 'Display'] },
    { value: statusFilter, onChange: setStatusFilter, options: ['All statuses', 'Active', 'Paused', 'Completed'] },
  ]
  return (
    <>
      <PageIntro eyebrow="PERFORMANCE" title="Campaigns" description="Monitor, compare, and fine-tune your campaigns." action={<button className="button button-primary" onClick={onExport}><Download size={16} /> Export report</button>} />
      <div className="campaign-summary-strip">
        <span><strong>{campaigns.length}</strong> campaigns</span><i />
        <span><strong>{currency.format(metrics.spend)}</strong> spend in view</span><i />
        <span><strong>{metrics.roas.toFixed(2)}x</strong> average ROAS</span>
      </div>
      <section className="panel table-panel full-campaigns-panel">
        <div className="table-toolbar">
          <div><h2>All campaigns</h2><p>Performance across your paid media channels</p></div>
          <div className="table-controls">
            <label className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search campaigns" aria-label="Search campaigns" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</label>
            {selectOptions.map(({ value, onChange, options }) => <label className="select-wrap" key={options[0]}><select value={value} onChange={(event) => onChange(event.target.value)} aria-label={options[0]}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label>)}
          </div>
        </div>
        <CampaignTable campaigns={campaigns} onSelectCampaign={onSelectCampaign} sort={sort} onSort={onSort} />
        <div className="table-footer"><span>Showing <strong>{campaigns.length ? 1 : 0}–{campaigns.length}</strong> of <strong>{campaigns.length}</strong> campaigns</span><span>All figures in USD</span></div>
      </section>
      {campaigns.length === 0 && <div className="empty-state"><div><Search size={20} /></div><strong>No campaigns match those filters</strong><p>Try a different search or clear one of your filters.</p></div>}
    </>
  )
}

function CampaignTable({ campaigns, onSelectCampaign, sort, onSort, compact = false }) {
  const columns = [
    { key: 'name', label: 'Campaign' },
    { key: 'platform', label: 'Platform' },
    { key: 'budget', label: 'Budget' },
    { key: 'spend', label: 'Spend' },
    { key: 'impressions', label: 'Impressions' },
    { key: 'clicks', label: 'Clicks' },
    { key: 'conversions', label: 'Conv.' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'ctr', label: 'CTR' },
    { key: 'cpc', label: 'CPC' },
    { key: 'roas', label: 'ROAS' },
    { key: 'status', label: 'Status' },
  ]
  const visibleColumns = compact ? columns.filter(({ key }) => ['name', 'platform', 'spend', 'conversions', 'roas', 'status'].includes(key)) : columns
  return (
    <div className="table-scroll">
      <table className={`campaign-table ${compact ? 'compact-table' : ''}`}>
        <thead><tr>{visibleColumns.map(({ key, label }) => (
          <th key={key} className={['name', 'platform', 'status'].includes(key) ? 'align-left' : ''}>
            {onSort ? <button className="sort-button" onClick={() => onSort(key)}>{label}{sort.key === key && <span>{sort.direction === 'asc' ? ' ↑' : ' ↓'}</span>}</button> : label}
          </th>
        ))}</tr></thead>
        <tbody>
          {campaigns.map((campaign) => {
            const metric = getCampaignMetrics(campaign)
            return (
              <tr key={campaign.id} onClick={() => onSelectCampaign(campaign)} className="clickable-row">
                {visibleColumns.map(({ key }) => {
                  if (key === 'name') return <td key={key}><div className="campaign-name-cell"><span className={`platform-logo ${platformSlug(campaign.platform)}`}>{platformInitial(campaign.platform)}</span><span className="campaign-name-copy"><strong>{campaign.name}</strong><small>{campaign.id.toUpperCase()}</small></span></div></td>
                  if (key === 'platform') return <td key={key}><span className="platform-label"><i style={{ background: channelColors[campaign.platform] }} />{campaign.platform}</span></td>
                  if (key === 'budget') return <td key={key}>{currency.format(campaign.budget)}</td>
                  if (key === 'spend') return <td key={key}><strong className="table-primary-value">{currency.format(campaign.spend)}</strong></td>
                  if (key === 'impressions') return <td key={key}>{number.format(campaign.impressions)}</td>
                  if (key === 'clicks') return <td key={key}>{number.format(campaign.clicks)}</td>
                  if (key === 'conversions') return <td key={key}>{number.format(campaign.conversions)}</td>
                  if (key === 'revenue') return <td key={key}>{currency.format(campaign.revenue)}</td>
                  if (key === 'ctr') return <td key={key}>{metric.ctr.toFixed(2)}%</td>
                  if (key === 'cpc') return <td key={key}>${metric.cpc.toFixed(2)}</td>
                  if (key === 'roas') return <td key={key}><strong className={`roas-value ${metric.roas >= 3 ? 'roas-good' : metric.roas < 1.5 ? 'roas-low' : ''}`}>{metric.roas.toFixed(2)}x</strong></td>
                  if (key === 'status') return <td key={key}><span className={`status-pill status-${campaign.status.toLowerCase()}`}><i />{campaign.status}</span></td>
                  return null
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function platformInitial(platform) {
  return platform === 'Google Ads' ? 'G' : platform === 'Meta Ads' ? 'f' : 'D'
}

function platformSlug(platform) {
  return platform === 'Google Ads' ? 'google' : platform === 'Meta Ads' ? 'meta' : 'display'
}

function AnalyticsPage({ campaigns }) {
  const channelData = ['Google Ads', 'Meta Ads', 'Display'].map((platform) => {
    const group = campaigns.filter((campaign) => campaign.platform === platform)
    return {
      name: platform.replace(' Ads', ''),
      platform,
      spend: group.reduce((sum, campaign) => sum + campaign.spend, 0),
      revenue: group.reduce((sum, campaign) => sum + campaign.revenue, 0),
      conversions: group.reduce((sum, campaign) => sum + campaign.conversions, 0),
    }
  }).filter((channel) => channel.spend > 0)
  const trend = months.map((month, index) => ({
    month,
    conversions: campaigns.reduce((sum, campaign) => sum + campaign.monthlyConversions[index], 0),
  }))
  const metrics = metricsFor(campaigns)
  return (
    <>
      <PageIntro eyebrow="PERFORMANCE" title="Analytics" description="A closer look at how your channels and campaigns drive results." action={<div className="date-range content-date"><CalendarDays size={15} /><span>Jun – Nov 2026</span></div>} />
      <div className="analytics-kpis">
        <div><span>Total revenue</span><strong>{currency.format(metrics.revenue)}</strong><small>Across visible campaigns</small></div>
        <div><span>Return on ad spend</span><strong>{metrics.roas.toFixed(2)}x</strong><small>Revenue ÷ ad spend</small></div>
        <div><span>Cost per conversion</span><strong>{metrics.conversions ? currency.format(metrics.spend / metrics.conversions) : '$0'}</strong><small>Ad spend ÷ conversions</small></div>
      </div>
      <section className="chart-grid analytics-chart-grid">
        <article className="panel analytics-wide">
          <PanelHeading title="Spend vs. revenue" subtitle="Revenue generated for each dollar invested" action={<span className="chart-note">USD</span>} />
          <div className="chart-legend"><span><i className="legend-dot spend-dot" />Spend</span><span><i className="legend-dot revenue-dot" />Revenue</span></div>
          <div className="chart-wrap analytics-bar">
            {campaigns.length ? <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={campaigns.map((campaign) => ({ name: campaign.name.replace(' — ', ' · '), spend: campaign.spend, revenue: campaign.revenue }))} margin={{ top: 12, right: 8, left: 0, bottom: 45 }}>
                <CartesianGrid vertical={false} stroke="#edf0f4" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8a92a2' }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" interval={0} />
                <YAxis tickFormatter={(value) => `$${compactNumber.format(value)}`} tick={{ fontSize: 10, fill: '#8a92a2' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CurrencyTooltip />} />
                <Bar dataKey="spend" name="Spend" fill="#c6cafa" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Line dataKey="revenue" name="Revenue" stroke="#5261df" strokeWidth={2.5} dot={{ fill: '#5261df', r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer> : <ChartEmpty />}
          </div>
        </article>
        <article className="panel channel-panel">
          <PanelHeading title="Channel spending" subtitle="Share of total spend" />
          {channelData.length ? <>
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={channelData} dataKey="spend" nameKey="platform" innerRadius={66} outerRadius={91} paddingAngle={4} stroke="none">
                  {channelData.map((entry) => <Cell key={entry.platform} fill={channelColors[entry.platform]} />)}
                </Pie><Tooltip formatter={(value) => currency.format(value)} /></PieChart>
              </ResponsiveContainer>
              <div className="donut-center"><strong>{currency.format(metrics.spend)}</strong><span>Total spend</span></div>
            </div>
            <div className="channel-legend">{channelData.map((channel) => <div key={channel.platform}><span><i style={{ background: channelColors[channel.platform] }} />{channel.platform}</span><strong>{metrics.spend ? `${(channel.spend / metrics.spend * 100).toFixed(0)}%` : '0%'}</strong></div>)}</div>
          </> : <ChartEmpty />}
        </article>
        <article className="panel analytics-wide conversion-analytics">
          <PanelHeading title="Conversion trends" subtitle="Monthly conversions across the selected campaigns" action={<span className="period-chip">Jun – Nov 2026</span>} />
          <div className="chart-wrap analytics-trend">
            {campaigns.length ? <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 12, right: 8, left: -14, bottom: 0 }}>
                <defs><linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#727df0" stopOpacity={0.24} /><stop offset="100%" stopColor="#727df0" stopOpacity={0.01} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#edf0f4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a92a2' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8a92a2' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CountTooltip />} />
                <Area type="monotone" dataKey="conversions" stroke="#6672eb" strokeWidth={2.5} fill="url(#analyticsFill)" />
              </AreaChart>
            </ResponsiveContainer> : <ChartEmpty />}
          </div>
        </article>
      </section>
    </>
  )
}

function ChartEmpty() {
  return <div className="chart-empty"><BarChart3 size={22} /><strong>No data to display</strong><span>Adjust your filters to see campaign analytics.</span></div>
}

function BudgetPlanner({ campaigns, onBudgetChange, onReset }) {
  const baseAllocation = campaignSeed.reduce((sum, campaign) => sum + campaign.budget, 0)
  const allocated = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0)
  const currentSpend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0)
  const currentRevenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0)
  const projectedRevenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue * (campaign.budget / campaignSeed.find((seed) => seed.id === campaign.id).budget), 0)
  const projectedDelta = projectedRevenue - currentRevenue
  const remaining = baseAllocation - allocated
  const isDefault = campaigns.every((campaign, index) => campaign.budget === campaignSeed[index].budget)
  return (
    <>
      <PageIntro eyebrow="PLANNING TOOLS" title="Budget planner" description="Shift your investment with a clear view of the trade-offs." action={<button className="button button-secondary" onClick={onReset} disabled={isDefault}>Reset to original</button>} />
      <div className="estimate-banner"><span><Zap size={16} /></span><div><strong>Planning estimates, not actual results</strong><p>Projections apply each campaign’s historical revenue-to-budget ratio to its proposed budget. Actual performance may vary.</p></div></div>
      <section className="budget-summary-grid">
        <article className="budget-summary-card budget-allocated"><span>Total allocated budget</span><strong>{currency.format(allocated)}</strong><small>of {currency.format(baseAllocation)} planning envelope</small><div className="budget-progress"><i style={{ width: `${Math.min(100, Math.max(0, allocated / baseAllocation * 100))}%` }} /></div></article>
        <article className="budget-summary-card"><span>Remaining budget</span><strong className={remaining < 0 ? 'over-budget' : ''}>{currency.format(Math.abs(remaining))}{remaining < 0 ? ' over' : ''}</strong><small>{remaining < 0 ? 'Above your original envelope' : 'Available to allocate'}</small></article>
        <article className="budget-summary-card"><span>Current attributed revenue</span><strong>{currency.format(currentRevenue)}</strong><small>At {currentSpend ? (currentRevenue / currentSpend).toFixed(2) : '0.00'}x historical ROAS</small></article>
        <article className="budget-summary-card projection-card"><span>Projected revenue <em>ESTIMATE</em></span><strong>{currency.format(projectedRevenue)}</strong><small className={projectedDelta >= 0 ? 'projection-up' : 'projection-down'}>{projectedDelta >= 0 ? '+' : '−'}{currency.format(Math.abs(projectedDelta))} vs. current revenue</small></article>
      </section>
      <section className="panel planner-panel">
        <PanelHeading title="Campaign allocations" subtitle="Adjust a monthly budget to compare proposed investment." action={<span className="table-hint">Changes update instantly</span>} />
        <div className="planner-column-labels"><span>CAMPAIGN</span><span>CURRENT</span><span>PROPOSED MONTHLY BUDGET</span><span>EST. REVENUE*</span></div>
        {campaigns.map((campaign) => {
          const original = campaignSeed.find((seed) => seed.id === campaign.id).budget
          const projected = campaign.revenue * (campaign.budget / original)
          const delta = campaign.budget - original
          return (
            <div className="planner-row" key={campaign.id}>
              <div className="planner-campaign"><span className={`platform-logo ${platformSlug(campaign.platform)}`}>{platformInitial(campaign.platform)}</span><span><strong>{campaign.name}</strong><small>{campaign.platform} · {getCampaignMetrics(campaign).roas.toFixed(2)}x historical ROAS</small></span></div>
              <div className="planner-current"><strong>{currency.format(original)}</strong>{delta !== 0 && <small className={delta > 0 ? 'delta-up' : 'delta-down'}>{delta > 0 ? '+' : '−'}{currency.format(Math.abs(delta))}</small>}</div>
              <div className="planner-control"><div className="planner-value"><strong>{currency.format(campaign.budget)}</strong><span>{Math.round(campaign.budget / Math.max(original, 1) * 100)}% of current</span></div><input aria-label={`Proposed monthly budget for ${campaign.name}`} type="range" min="0" max={original * 2} step="250" value={campaign.budget} style={{ '--range-progress': `${campaign.budget / (original * 2) * 100}%` }} onChange={(event) => onBudgetChange(campaign.id, event.target.value)} /></div>
              <div className="planner-projection"><strong>{currency.format(projected)}</strong><small>estimate</small></div>
            </div>
          )
        })}
        <div className="planner-footnote">* Illustrative estimate assumes historical revenue scales linearly with budget. This is not a forecast or guarantee of results.</div>
      </section>
      <div className="planner-bottom-note"><Lightbulb size={17} /><span>Keep an eye on delivery: budget is a spending limit, not a guarantee of campaign spend.</span></div>
    </>
  )
}

function buildInsights(campaigns) {
  const insights = []
  campaigns.forEach((campaign) => {
    const metric = getCampaignMetrics(campaign)
    if (metric.roas < 1.5) insights.push({
      id: `${campaign.id}-roas`, type: 'warning', title: 'Below target ROAS', campaign,
      detail: `${metric.roas.toFixed(2)}x return is below the 1.5x benchmark. Review targeting and creative before increasing spend.`,
      tag: `${metric.roas.toFixed(2)}x ROAS`,
    })
    if (metric.cpc > 0.45) insights.push({
      id: `${campaign.id}-cpc`, type: 'caution', title: 'Higher cost per click', campaign,
      detail: `$${metric.cpc.toFixed(2)} CPC is among the highest in this account. Check placements, bids, and audience overlap.`,
      tag: `$${metric.cpc.toFixed(2)} CPC`,
    })
    if (campaign.spend / campaign.budget >= 0.7 && campaign.conversions < 300) insights.push({
      id: `${campaign.id}-conversion`, type: 'warning', title: 'Spend without enough conversions', campaign,
      detail: `${Math.round(campaign.spend / campaign.budget * 100)}% of its budget is spent for ${number.format(campaign.conversions)} conversions. Review the landing page and conversion tracking.`,
      tag: `${number.format(campaign.conversions)} conversions`,
    })
    if (metric.roas >= 4) insights.push({
      id: `${campaign.id}-strong`, type: 'success', title: 'Strong return opportunity', campaign,
      detail: `This campaign is returning ${metric.roas.toFixed(2)}x on spend. Consider a measured budget increase and monitor efficiency.`,
      tag: `${metric.roas.toFixed(2)}x ROAS`,
    })
  })
  return insights
}

function InsightsPage({ campaigns, onSelectCampaign }) {
  const insights = buildInsights(campaigns)
  const counts = {
    opportunity: insights.filter((item) => item.type === 'success').length,
    review: insights.filter((item) => item.type !== 'success').length,
  }
  return (
    <>
      <PageIntro eyebrow="RECOMMENDED ACTIONS" title="Insights" description="Simple, rule-based signals to help prioritize your next move." action={<span className="rules-badge"><Activity size={14} /> Rule-based analysis</span>} />
      <div className="insights-summary">
        <div><span className="insight-summary-icon success-summary"><ArrowUpRight size={16} /></span><span><strong>{counts.opportunity} opportunities</strong><small>Campaigns performing above 4x ROAS</small></span></div>
        <div><span className="insight-summary-icon warning-summary"><Lightbulb size={16} /></span><span><strong>{counts.review} items to review</strong><small>Based on account performance rules</small></span></div>
      </div>
      <div className="insights-list">
        {insights.map((insight) => (
          <article className={`insight-card insight-${insight.type}`} key={insight.id}>
            <span className="insight-icon">{insight.type === 'success' ? <ArrowUpRight size={18} /> : insight.type === 'caution' ? <Gauge size={18} /> : <Lightbulb size={18} />}</span>
            <div className="insight-content"><div className="insight-heading"><h2>{insight.title}</h2><span className={`insight-tag ${insight.type}`}>{insight.tag}</span></div><p>{insight.detail}</p><button className="insight-campaign-link" onClick={() => onSelectCampaign(insight.campaign)}><span className={`platform-logo mini-logo ${platformSlug(insight.campaign.platform)}`}>{platformInitial(insight.campaign.platform)}</span>{insight.campaign.name}<span>→</span></button></div>
          </article>
        ))}
        {insights.length === 0 && <div className="empty-state"><div><Check size={20} /></div><strong>No new signals</strong><p>Current campaign results don’t match any of the review rules.</p></div>}
      </div>
      <p className="insights-disclaimer">These suggestions use transparent thresholds on local sample data. They are not generated by a trained AI model and do not replace campaign-level judgment.</p>
    </>
  )
}

function CampaignModal({ campaign, onClose }) {
  const metric = getCampaignMetrics(campaign)
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="campaign-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-top"><span className={`platform-logo ${platformSlug(campaign.platform)}`}>{platformInitial(campaign.platform)}</span><button className="icon-button" onClick={onClose} aria-label="Close details"><X size={18} /></button></div>
        <div className="modal-campaign-platform">{campaign.platform} <span>·</span> {campaign.id.toUpperCase()}</div>
        <h2 id="modal-title">{campaign.name}</h2>
        <span className={`status-pill status-${campaign.status.toLowerCase()}`}><i />{campaign.status}</span>
        <div className="modal-metrics">
          <div><span>Ad spend</span><strong>{currency.format(campaign.spend)}</strong></div>
          <div><span>Revenue</span><strong>{currency.format(campaign.revenue)}</strong></div>
          <div><span>Conversions</span><strong>{number.format(campaign.conversions)}</strong></div>
          <div><span>ROAS</span><strong>{metric.roas.toFixed(2)}x</strong></div>
          <div><span>Impressions</span><strong>{number.format(campaign.impressions)}</strong></div>
          <div><span>Clicks</span><strong>{number.format(campaign.clicks)}</strong></div>
          <div><span>Click-through rate</span><strong>{metric.ctr.toFixed(2)}%</strong></div>
          <div><span>Cost per click</span><strong>${metric.cpc.toFixed(2)}</strong></div>
        </div>
        <div className="modal-budget-row"><span>Monthly budget</span><strong>{currency.format(campaign.budget)}</strong></div>
        <button className="button button-primary modal-done" onClick={onClose}>Done</button>
      </section>
    </div>
  )
}

export default App
