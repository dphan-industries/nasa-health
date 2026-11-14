"use client";
import { useState } from "react";
const crew = [
  {
    name: "Viet Phan",
    role: "Commander",
    bio: "Computer science graduate with 6+ years of software engineering experience, specializing in frontend development. Leads application engineering and interface implementation.",
    initials: "VP",
    pulse: 68,
    bp: "118 / 76",
    temperature: "36.7",
    glucose: 94,
    sleep: 7.5,
    mood: "Good",
    note: "Demo observation for interface testing. No personal health data has been entered.",
  },
  {
    name: "Edsel Ong",
    role: "Systems Engineer",
    bio: "Computer science student contributing to application development and engineering.",
    initials: "EO",
    pulse: 74,
    bp: "122 / 80",
    temperature: "36.8",
    glucose: 102,
    sleep: 6.5,
    mood: "Neutral",
    note: "Demo observation for interface testing. No personal health data has been entered.",
  },
  {
    name: "Vicki Leow",
    role: "Habitat Designer",
    bio: "Art diploma graduate from Singapore. Leads artwork and visual design, with a focus on making the crew environment feel welcoming and comfortable.",
    initials: "VL",
    pulse: 92,
    bp: "130 / 84",
    temperature: "37.0",
    glucose: 108,
    sleep: 7,
    mood: "Good",
    note: "Demo observation for interface testing. No personal health data has been entered.",
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
          <p>Team roster · sample health values for demonstration only.</p>
        </div>
        <button className="secondary" onClick={onHistory}>
          My saved history · {recordCount} readings
        </button>
      </div>
      <div className="crew-roster" aria-label="Team members">
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
              Demo · {member.pulse} bpm · {member.sleep} h sleep
            </small>
          </button>
        ))}
      </div>
      <div className="panel crew-detail" aria-live="polite">
        <div className="eyebrow">DEMO VALUES · NOT PERSONAL HEALTH DATA</div>
        <h2>{person.name}</h2>
        <p>{person.role}</p>
        <p>{person.bio}</p>
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
