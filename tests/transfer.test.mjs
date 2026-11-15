import { test } from "node:test";
import assert from "node:assert/strict";
import { IDBFactory } from "fake-indexeddb";
import { parseTransfer, importTransfer } from "../lib/transfer.ts";
import { readRecords, openDatabase, saveRecord } from "../lib/storage.ts";
const report = {
  schema: 1,
  readings: [
    {
      id: "r1",
      kind: "Heart rate",
      value: "72",
      unit: "bpm",
      timestamp: "2026-11-04T10:00:00Z",
      source: "Manual entry",
      note: "",
    },
  ],
  incidents: [],
  wellness: [],
};
test("report validation rejects malformed or misleading readings", () => {
  assert.equal(parseTransfer(JSON.stringify(report)).readings.length, 1);
  assert.throws(
    () => parseTransfer(JSON.stringify({ ...report, schema: 9 })),
    /schema/,
  );
  assert.throws(
    () =>
      parseTransfer(
        JSON.stringify({
          ...report,
          readings: [{ ...report.readings[0], source: "Apple Watch verified" }],
        }),
      ),
    /Invalid/,
  );
  assert.throws(
    () =>
      parseTransfer(
        JSON.stringify({
          ...report,
          readings: [{ ...report.readings[0], value: "72 / 80" }],
        }),
      ),
    /Invalid/,
  );
});
test("user initiated import merges atomically and preserves existing IDs", async () => {
  globalThis.indexedDB = new IDBFactory();
  await importTransfer(report);
  await importTransfer({
    ...report,
    readings: [{ ...report.readings[0], value: "90" }],
  });
  assert.equal((await readRecords("readings"))[0].value, "72");
  await saveRecord("wellness", {
    id: "w",
    timestamp: "2026-11-04T11:00:00Z",
    sleep: "8",
    mood: "Good",
    bodyArea: "No area",
    note: "",
  });
  assert.equal((await readRecords("wellness")).length, 1);
});
test("version 1 database migrates without losing saved readings", async () => {
  globalThis.indexedDB = new IDBFactory();
  await new Promise((resolve, reject) => {
    const req = indexedDB.open("crew-health", 1);
    req.onupgradeneeded = () => {
      req.result
        .createObjectStore("readings", { keyPath: "id" })
        .put(report.readings[0]);
      req.result.createObjectStore("incidents", { keyPath: "id" });
    };
    req.onsuccess = () => {
      req.result.close();
      resolve();
    };
    req.onerror = reject;
  });
  const db = await openDatabase();
  assert.equal(db.version, 3);
  assert.ok(db.objectStoreNames.contains("resources"));
  db.close();
  assert.equal((await readRecords("readings"))[0].id, "r1");
});
const profile = {
  id: "test-astronaut",
  name: "Test Astronaut",
  role: "Flight Engineer",
  initials: "TA",
  bio: "Fictional test profile",
  createdAt: "2026-11-16T01:00:00Z",
};

const profileReport = {
  schema: 2,
  astronauts: [profile],
  readings: [
    {
      ...report.readings[0],
      id: "profile-reading",
      astronautId: profile.id,
    },
  ],
  incidents: [],
  wellness: [],
};

test("schema 2 imports astronaut profiles and owned readings", async () => {
  globalThis.indexedDB = new IDBFactory();

  const validated = parseTransfer(
    JSON.stringify(profileReport),
  );

  await importTransfer(validated);

  const profiles = await readRecords("astronauts");
  const readings = await readRecords("readings");

  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].id, profile.id);
  assert.equal(profiles[0].name, profile.name);

  assert.equal(readings.length, 1);
  assert.equal(readings[0].astronautId, profile.id);
});

test("schema 2 rejects records with missing astronaut profiles", () => {
  assert.throws(
    () =>
      parseTransfer(
        JSON.stringify({
          ...profileReport,
          astronauts: [],
        }),
      ),
    /Invalid reading/,
  );
});

test("backup import preserves existing astronaut profiles", async () => {
  globalThis.indexedDB = new IDBFactory();

  await saveRecord("astronauts", {
    ...profile,
    name: "Existing Astronaut",
  });

  await importTransfer(profileReport);

  const profiles = await readRecords("astronauts");

  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].name, "Existing Astronaut");
});

test("legacy imports reject unknown astronaut ownership without partial writes", async () => {
  globalThis.indexedDB = new IDBFactory();

  const legacyReport = {
    ...report,
    readings: [
      report.readings[0],
      {
        ...report.readings[0],
        id: "unknown-owner-reading",
        astronautId: "unknown-astronaut",
      },
    ],
  };

  await assert.rejects(
    importTransfer(legacyReport),
    /Unknown astronaut profile/,
  );

  assert.equal(
    (await readRecords("readings")).length,
    0,
  );
});
test("historical inconsistent BP readings remain importable", async () => {
  globalThis.indexedDB = new IDBFactory();

  const legacyReport = {
    ...report,
    readings: [
      {
        ...report.readings[0],
        id: "legacy-bp",
        kind: "Blood pressure",
        value: "60 / 70",
        unit: "mmHg",
      },
    ],
  };

  const validated = parseTransfer(
    JSON.stringify(legacyReport),
  );

  await importTransfer(validated);

  const readings = await readRecords("readings");

  assert.equal(readings.length, 1);
  assert.equal(readings[0].value, "60 / 70");
});