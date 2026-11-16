"use client";

import type {
  Astronaut,
  Reading,
  Wellness,
} from "../../lib/storage";

function latestReading(
  records: Reading[],
  astronautId: string | null,
  kind: Reading["kind"],
) {
  return records
    .filter(
      (r) =>
        (r.astronautId ?? null) === astronautId &&
        r.kind === kind,
    )
    .sort(
      (a, b) =>
        Date.parse(b.timestamp) - Date.parse(a.timestamp),
    )[0];
}

export default function CrewOverview({
  astronauts,
  activeAstronautId,
  records,
  wellness,
  onSelect,
  onHistory,
  onMeasure,
}: {
  astronauts: Astronaut[];
  activeAstronautId: string | null;
  records: Reading[];
  wellness: Wellness[];
  onSelect: (id: string | null) => void;
  onHistory: () => void;
  onMeasure: () => void;
}) {
  const person = astronauts.find(
    (p) => p.id === activeAstronautId,
  );

  const personalRecords = records.filter(
    (r) =>
      (r.astronautId ?? null) === activeAstronautId,
  );

  const latestWellness = wellness
  .filter(
    (r) =>
      (r.astronautId ?? null) === activeAstronautId,
  )
  .sort(
    (a, b) =>
      Date.parse(b.timestamp) - Date.parse(a.timestamp),
  )[0];

  const metrics: Reading["kind"][] = [
    "Heart rate",
    "Blood pressure",
    "Body temperature",
    "Blood glucose",
  ];

  return (
    <section className="crew-overview">
      <div className="crew-overview-heading">
        <div>
          <h2>Crew health records</h2>
          <p>
            Select an astronaut to view their saved
            health measurements.
          </p>
        </div>

        <button
          className="secondary"
          onClick={onHistory}
        >
          Saved history · {personalRecords.length} readings
        </button>
      </div>

      <div
        className="crew-roster"
        aria-label="Team members"
      >
        {astronauts.map((member) => {
          const pulse = latestReading(
            records,
            member.id,
            "Heart rate",
          );

          return (
            <button
              key={member.id}
              className={
                activeAstronautId === member.id
                  ? "crew-person selected"
                  : "crew-person"
              }
              aria-pressed={
                activeAstronautId === member.id
              }
              onClick={() => onSelect(member.id)}
            >
              <span
                className="crew-initials"
                aria-hidden="true"
              >
                {member.initials}
              </span>

              <strong>{member.name}</strong>
              <span>{member.role}</span>

              <small>
                {pulse
                  ? `${pulse.value} ${pulse.unit} · ${pulse.source}`
                  : "No heart rate recorded"}
              </small>
            </button>
          );
        })}
      </div>

      <button
        className="secondary"
        aria-pressed={activeAstronautId === null}
        onClick={() => onSelect(null)}
      >
        View unassigned records
      </button>

      <div
        className="panel crew-detail"
        aria-live="polite"
      >
        <div className="eyebrow">
          DEVICE-LOCAL HEALTH RECORDS
        </div>

        <h2>{person?.name ?? "Unassigned records"}</h2>

        <p>{person?.role}</p>
        <p>
          {person?.bio ??
            "Records without an assigned astronaut are kept here."}
        </p>

        <dl className="crew-vitals">
          {metrics.map((kind) => {
            const reading = latestReading(
              records,
              activeAstronautId,
              kind,
            );

            return (
              <div key={kind}>
                <dt>{kind}</dt>
                <dd>
                  {reading
                    ? `${reading.value} ${reading.unit}`
                    : "Not recorded"}
                </dd>

                {reading && (
                  <small>{reading.source}</small>
                )}
              </div>
            );
          })}
          <div>
  <dt>Sleep</dt>
  <dd>
    {latestWellness
      ? `${latestWellness.sleep} hours`
      : "Not recorded"}
  </dd>
</div>

<div>
  <dt>Mood</dt>
  <dd>
    {latestWellness
      ? latestWellness.mood
      : "Not recorded"}
  </dd>
</div>
        </dl>

        <div className="actions">
          <button
            className="primary"
            onClick={onMeasure}
          >
            Record vitals
          </button>

          <button
            className="secondary"
            onClick={onHistory}
          >
            View health history
          </button>
        </div>

        <p className="fine-print">
          Measurements are stored on this device.
          Missing values remain unknown. Recorded values
          do not establish medical fitness or safety.
        </p>
      </div>
    </section>
  );
}
