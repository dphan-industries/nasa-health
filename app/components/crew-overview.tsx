"use client";
import { useState } from "react";
const crew = [
  {
    name: "Alex Chen",
    role: "Commander",
    initials: "AC",
    pulse: 68,
    bp: "118 / 76",
    temperature: "36.7",
    glucose: 94,
    sleep: 7.5,
    mood: "Good",
    note: "Resting check-in after breakfast. No discomfort reported.",
  },
  {
    name: "Maya Patel",
    role: "Flight surgeon",
    initials: "MP",
    pulse: 74,
    bp: "122 / 80",
    temperature: "36.8",
    glucose: 102,
    sleep: 6.5,
    mood: "Neutral",
    note: "Shorter sleep after overnight duty. Rest period planned.",
  },
  {
    name: "Leo Rivera",
    role: "Pilot",
    initials: "LR",
    pulse: 92,
    bp: "130 / 84",
    temperature: "37.0",
    glucose: 108,
    sleep: 7,
    mood: "Good",
    note: "Pulse recorded after exercise. A resting recheck is scheduled.",
  },
  {
    name: "Sora Kim",
    role: "Mission scientist",
    initials: "SK",
    pulse: 64,
    bp: "112 / 72",
    temperature: "36.5",
    glucose: 89,
    sleep: 8,
    mood: "Very good",
    note: "Completed resistance exercise and morning check-in.",
  },
  {
    name: "Amara Okafor",
    role: "Flight engineer",
    initials: "AO",
    pulse: 79,
    bp: "124 / 82",
    temperature: "36.9",
    glucose: 97,
    sleep: 5.5,
    mood: "Low",
    note: "Low mood and interrupted sleep reported. A private crew check-in is planned.",
  },
  {
    name: "Noah Phan",
    role: "Systems specialist",
    initials: "NP",
    pulse: 71,
    bp: "120 / 78",
    temperature: "36.6",
    glucose: 95,
    sleep: 7,
    mood: "Good",
    note: "Mild right shoulder discomfort after maintenance. Observation logged.",
  },
];
export default function CrewOverview({
  recordCount,
  onHistory,
}: {
  recordCount: number;
  onHistory: () => void;
}) {
  const [selected, setSelected] = useState(0);
  const person = crew[selected];
  return (
    <section className="crew-overview">
      <div className="crew-overview-heading">
        <div>
          <h2>Crew health records</h2>
          <p>
            Fictional training crew · illustrative check-ins, not live
            monitoring.
          </p>
        </div>
        <button className="secondary" onClick={onHistory}>
          My saved history · {recordCount} readings
        </button>
      </div>
      <div className="crew-roster" aria-label="Fictional crew members">
        {crew.map((member, index) => (
          <button
            key={member.name}
            className={
              selected === index ? "crew-person selected" : "crew-person"
            }
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span className="crew-initials" aria-hidden="true">
              {member.initials}
            </span>
            <strong>{member.name}</strong>
            <span>{member.role}</span>
            <small>
              {member.pulse} bpm · {member.sleep} h sleep
            </small>
          </button>
        ))}
      </div>
      <div className="panel crew-detail" aria-live="polite">
        <div className="eyebrow">DEMO RECORD · NOT A CONNECTED CREW MEMBER</div>
        <h2>{person.name}</h2>
        <p>{person.role} · fictional morning check-in</p>
        <dl className="crew-vitals">
          {[
            ["Heart rate", `${person.pulse} bpm`],
            ["Blood pressure", `${person.bp} mmHg`],
            ["Temperature", `${person.temperature} °C`],
            ["Blood glucose", `${person.glucose} mg/dL`],
            ["Sleep", `${person.sleep} hours`],
            ["Mood", person.mood],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <h3>Check-in note</h3>
        <p>{person.note}</p>
        <small>
          These values do not establish fitness or safety. Your saved readings
          stay separate in My saved history. This prototype does not connect or
          synchronize multiple crew devices.
        </small>
      </div>
    </section>
  );
}
