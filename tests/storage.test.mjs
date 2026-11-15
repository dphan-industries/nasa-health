import { test } from "node:test";
import assert from "node:assert/strict";
import { IDBFactory } from "fake-indexeddb";
import {
  validateReading,
  openDatabase,
  saveRecord,
  readRecords,
  readRecordsForAstronaut,
  
} from "../lib/storage.ts";
test("validation accepts formats without clinical interpretation", () => {
  assert.equal(validateReading("Heart rate", "68", ""), "");
  assert.equal(validateReading("Blood pressure", "118", "76"), "");
  assert.equal(validateReading("Heart rate", "999", ""), "");
  for (const value of ["", "0", "-1", "1.5", "1000", "abc"])
    assert.ok(validateReading("Heart rate", value, ""));
  assert.ok(validateReading("Blood pressure", "118", ""));
});
test("versioned database persists readings and incidents across connections", async () => {
  globalThis.indexedDB = new IDBFactory();
  const db = await openDatabase();
  assert.equal(db.version, 3);
  assert.deepEqual(
  [...db.objectStoreNames],
  ["astronauts", "incidents", "preferences",
    "readings", "resources", "wellness"],
);
  db.close();
  const reading = {
    id: "fictional",
    kind: "Heart rate",
    value: "72",
    unit: "bpm",
    timestamp: "2026-11-04T10:00:00Z",
    note: "Test",
    source: "Manual entry",
  };
  await saveRecord("readings", reading);
  await saveRecord("incidents", {
    id: "scenario",
    timestamp: reading.timestamp,
    notes: "Fictional observation",
  });
  assert.deepEqual(await readRecords("readings"), [reading]);
  assert.equal(
    (await readRecords("incidents"))[0].notes,
    "Fictional observation",
  );
});
test("database failures reject without claiming a successful save", async () => {
  globalThis.indexedDB = {
    open() {
      const req = {};
      queueMicrotask(() => req.onerror());
      return req;
    },
  };
  await assert.rejects(
    saveRecord("readings", { id: "failed" }),
    /Local database unavailable/,
  );
});
import { IDBDatabase } from "fake-indexeddb";
test("aborted write transactions do not persist or report success", async () => {
  globalThis.indexedDB = new IDBFactory();
  const db = await openDatabase();
  db.close();
  const original = IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction = function (...args) {
    const tx = original.apply(this, args);
    if (args[1] === "readwrite") queueMicrotask(() => tx.abort());
    return tx;
  };
  try {
    await assert.rejects(
      saveRecord("readings", {
        id: "aborted",
        kind: "Heart rate",
        value: "72",
        unit: "bpm",
        timestamp: "2026-11-04T10:00:00Z",
        note: "",
        source: "Manual entry",
      }),
      /failed|aborted/,
    );
  } finally {
    IDBDatabase.prototype.transaction = original;
  }
  assert.deepEqual(await readRecords("readings"), []);
});

test("astronaut readings remain isolated", async () => {
  globalThis.indexedDB = new IDBFactory();

  const base = {
    kind: "Heart rate",
    unit: "bpm",
    timestamp: "2026-11-15T10:00:00Z",
    note: "",
    source: "Manual entry",
  };

  await saveRecord("readings", {
    ...base,
    id: "reading-1",
    astronautId: "edsel-ong",
    value: "85",
  });

  await saveRecord("readings", {
    ...base,
    id: "reading-2",
    astronautId: "viet-phan",
    value: "72",
  });

  await saveRecord("readings", {
    ...base,
    id: "legacy-reading",
    value: "68",
  });

  const edsel = await readRecordsForAstronaut(
    "readings",
    "edsel-ong",
  );

  const viet = await readRecordsForAstronaut(
    "readings",
    "viet-phan",
  );

  const legacy = await readRecordsForAstronaut(
    "readings",
    null,
  );

  assert.equal(edsel.length, 1);
  assert.equal(edsel[0].value, "85");

  assert.equal(viet.length, 1);
  assert.equal(viet[0].value, "72");

  assert.equal(legacy.length, 1);
  assert.equal(legacy[0].value, "68");
});

test("astronaut wellbeing records remain isolated", async () => {
  globalThis.indexedDB = new IDBFactory();

  const base = {
    timestamp: "2026-11-15T10:00:00Z",
    bodyArea: "No area",
    note: "",
  };

  await saveRecord("wellness", {
    ...base,
    id: "wellness-edsel",
    astronautId: "edsel-ong",
    sleep: "7.5",
    mood: "Good",
  });

  await saveRecord("wellness", {
    ...base,
    id: "wellness-viet",
    astronautId: "viet-phan",
    sleep: "5",
    mood: "Low",
  });

  await saveRecord("wellness", {
    ...base,
    id: "wellness-legacy",
    sleep: "8",
    mood: "Neutral",
  });

  const edsel = await readRecordsForAstronaut(
    "wellness",
    "edsel-ong",
  );

  const viet = await readRecordsForAstronaut(
    "wellness",
    "viet-phan",
  );

  const legacy = await readRecordsForAstronaut(
    "wellness",
    null,
  );

  assert.equal(edsel.length, 1);
  assert.equal(edsel[0].sleep, "7.5");
  assert.equal(edsel[0].mood, "Good");

  assert.equal(viet.length, 1);
  assert.equal(viet[0].sleep, "5");
  assert.equal(viet[0].mood, "Low");

  assert.equal(legacy.length, 1);
  assert.equal(legacy[0].sleep, "8");
});
test("astronaut medical follow-ups remain isolated", async () => {
  globalThis.indexedDB = new IDBFactory();

  const timestamp = "2026-11-16T01:00:00Z";

  await saveRecord("incidents", {
    id: "followup-edsel",
    astronautId: "edsel-ong",
    timestamp,
    notes: "Edsel fictional follow-up",
  });

  await saveRecord("incidents", {
    id: "followup-viet",
    astronautId: "viet-phan",
    timestamp,
    notes: "Viet fictional follow-up",
  });

  await saveRecord("incidents", {
    id: "followup-legacy",
    timestamp,
    notes: "Unassigned legacy incident",
  });

  const edsel = await readRecordsForAstronaut(
    "incidents",
    "edsel-ong",
  );

  const viet = await readRecordsForAstronaut(
    "incidents",
    "viet-phan",
  );

  const legacy = await readRecordsForAstronaut(
    "incidents",
    null,
  );

  assert.equal(edsel.length, 1);
  assert.equal(edsel[0].notes, "Edsel fictional follow-up");

  assert.equal(viet.length, 1);
  assert.equal(viet[0].notes, "Viet fictional follow-up");

  assert.equal(legacy.length, 1);
  assert.equal(legacy[0].notes, "Unassigned legacy incident");
});