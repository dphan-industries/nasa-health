import {
  readRecords,
  saveRecord,
  type Astronaut,
} from "./storage";

const initialCrew = [
  {
    id: "viet-phan",
    name: "Viet Phan",
    role: "Commander",
    initials: "VP",
    bio: "Computer science graduate with 6+ years of software engineering experience, specializing in frontend development. Leads application engineering and interface implementation.",
  },
  {
    id: "edsel-ong",
    name: "Edsel Ong",
    role: "Systems Engineer",
    initials: "EO",
    bio: "Computer science student contributing to application development and engineering.",
  },
  {
    id: "vicki-leow",
    name: "Vicki Leow",
    role: "Habitat Designer",
    initials: "VL",
    bio: "Art diploma graduate from Singapore. Leads artwork and visual design, with a focus on making the crew environment feel welcoming and comfortable.",
  },
];

export async function loadAstronauts(): Promise<Astronaut[]> {
  const existing = await readRecords<Astronaut>("astronauts");
  const profiles: Astronaut[] = [];

  for (const member of initialCrew) {
    const saved = existing.find((p) => p.id === member.id);

    if (saved) {
      profiles.push(saved);
    } else {
      const profile: Astronaut = {
        ...member,
        createdAt: new Date().toISOString(),
      };

      await saveRecord("astronauts", profile);
      profiles.push(profile);
    }
  }

  return [
    ...profiles,
    ...existing.filter(
      (p) => !initialCrew.some((member) => member.id === p.id),
    ),
  ];
}