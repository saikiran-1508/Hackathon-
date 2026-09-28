import ConfidenceBadge from './ConfidenceBadge';

function Section({ title, children }) {
  return (
    <div className="border-b border-slate-800 py-4 last:border-0">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      {children}
    </div>
  );
}

function RatedSummary({ data }) {
  if (!data) return <p className="text-sm text-slate-500">No data.</p>;
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm text-slate-200">{data.summary}</p>
      <ConfidenceBadge level={data.confidence} />
    </div>
  );
}

function EvidenceList({ items }) {
  if (!items?.length) return <p className="text-sm text-slate-500">None identified yet.</p>;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it, i) => (
        <li key={i} className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-slate-200">{it.claim}</p>
            <ConfidenceBadge level={it.confidence} />
          </div>
          {it.evidence && <p className="mt-1 text-xs text-slate-400">Evidence: {it.evidence}</p>}
        </li>
      ))}
    </ul>
  );
}

export default function ScoutingBrief({ result }) {
  if (!result) return null;

  if (result.empty) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center">
        <p className="text-sm text-slate-400">
          No memories yet for this opponent. Log a few matches, then generate a brief — the report will explicitly say
          evidence is insufficient rather than guessing.
        </p>
      </div>
    );
  }

  const { brief, matchesAnalyzed } = result;

  if (brief?.parseError) {
    return <pre className="whitespace-pre-wrap text-sm text-slate-300">{brief.executiveSummary}</pre>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Scouting Brief</h2>
        <span className="text-xs text-slate-500">{matchesAnalyzed} match{matchesAnalyzed === 1 ? '' : 'es'} analyzed</span>
      </div>

      <Section title="Executive Summary">
        <p className="text-sm text-slate-200">{brief.executiveSummary}</p>
      </Section>

      <Section title="Landing / Drop Strategy">
        <RatedSummary data={brief.landing} />
      </Section>

      <Section title="Zone & Rotation Strategy">
        <RatedSummary data={brief.rotation} />
      </Section>

      <Section title="Aggression Profile">
        <RatedSummary data={brief.aggression} />
      </Section>

      <Section title="Combat Profile">
        <RatedSummary data={brief.combat} />
      </Section>

      {brief.playerRoles?.length > 0 && (
        <Section title="Player Roles & Tendencies">
          <ul className="flex flex-col gap-1">
            {brief.playerRoles.map((p, i) => (
              <li key={i} className="text-sm text-slate-300">
                <span className="font-medium text-slate-100">{p.name}</span>
                {p.role && <span className="text-slate-400"> — {p.role}</span>}
                {p.notes && <span className="text-slate-500">. {p.notes}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {brief.teamFightStructure && (
        <Section title="Team Fight Structure">
          <p className="text-sm text-slate-200">{brief.teamFightStructure}</p>
        </Section>
      )}

      <Section title="Strengths">
        <EvidenceList items={brief.strengths} />
      </Section>

      <Section title="Potential Weaknesses">
        <EvidenceList items={brief.weaknesses} />
      </Section>

      <Section title="Recent Adaptation">
        <div className="rounded-md border border-sky-500/30 bg-sky-500/10 p-3">
          <p className="text-sm text-sky-100">{brief.recentAdaptation}</p>
        </div>
      </Section>

      <Section title="Recommended Approach">
        <ul className="list-inside list-disc text-sm text-slate-200">
          {(brief.recommendedApproach || []).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="What To Avoid">
        <ul className="list-inside list-disc text-sm text-slate-200">
          {(brief.whatToAvoid || []).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
