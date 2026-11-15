"use client";
import Image from "next/image";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  Reading,
  Incident,
  type Astronaut,
  type Wellness,
  readRecords,
  saveRecord,
  validateReading,
} from "../lib/storage";
import { loadAstronauts } from "../lib/astronauts";
import { monitorOffline } from "../lib/offline";
import Icon from "./components/console-icon";
import NumberControl from "./components/number-control";
import Trends, { ReadingInsight } from "./components/trends";
import Wearables, { type SensorReading } from "./components/wearables";
import MoveTheMoon from "./components/move-the-moon";
import CrewOverview from "./components/crew-overview";
import Wellbeing from "./components/wellbeing";
import Reminders from "./components/reminders";
import DataTransfer from "./components/data-transfer";
import InstallApp from "./components/install-app";
import MissionHealth from "./components/mission-health";
import EmergencyGuide from "./components/emergency-guide";
import MeasurementInstructions from "./components/measurement-instructions";
import { METRICS, UNITS, assessReading } from "../lib/health";
import { orderedReadings } from "../lib/insights";
import { guides } from "../lib/content";
type View =
  | "Dashboard"
  | "Measurements"
  | "Health history"
  | "Offline guides"
  | "Emergency assist"
  | "Wearables"
  | "Wellbeing"
  | "Move the Moon"
  | "Mission health"
  | "Device & data"
  | "Crew overview";
export default function Home() {
  const [view, setView] = useState<View>("Dashboard");
  const [historyPage, setHistoryPage] = useState(0);
  const [viewHistory, setViewHistory] = useState<View[]>([]);
  const [allRecords, setRecords] = useState<Reading[]>([]);
  const [allIncidents, setIncidents] = useState<Incident[]>([]);
  const [allWellness, setAllWellness] = useState<Wellness[]>([]);

  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);

  const [activeAstronautId, setActiveAstronautId] =
    useState<string | null>(null);

  const activeAstronaut = astronauts.find(
    (p) => p.id === activeAstronautId,
  );

  const records = useMemo(
    () =>
      allRecords.filter(
        (r) => (r.astronautId ?? null) === activeAstronautId,
      ),
    [allRecords, activeAstronautId],
  );

  const incidents = useMemo(
    () =>
      allIncidents.filter(
        (i) => (i.astronautId ?? null) === activeAstronautId,
      ),
    [allIncidents, activeAstronautId],
  );

  const wellness = useMemo(
    () =>
      allWellness.filter(
        (r) => (r.astronautId ?? null) === activeAstronautId,
      ),
    [allWellness, activeAstronautId],
  );

  const [cacheReady, setReady] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [offlineError, setOfflineError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [extraDirty, setExtraDirty] = useState(false);
  const [entrySource, setEntrySource] =
    useState<Reading["source"]>("Manual entry");
  const [entryTimestamp, setEntryTimestamp] = useState("");
  const [entryDevice, setEntryDevice] = useState("");
  const [kind, setKind] = useState<Reading["kind"]>("Heart rate");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [note, setNote] = useState("");
  const [measurementContext, setMeasurementContext] = useState("");
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [guide, setGuide] = useState<number | null>(null);
  const dirty = !!(first || second || note || measurementContext || extraDirty);
  const ready = cacheReady && storageReady;
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    queueMicrotask(() => {
      update();
    });
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    Promise.all([
  readRecords<Reading>("readings"),
  readRecords<Incident>("incidents"),
  loadAstronauts(),
  readRecords<Wellness>("wellness"),
])
  .then(([readings, savedIncidents, profiles, savedWellness]) => {
    setRecords(readings);
    setIncidents(savedIncidents);
    setAstronauts(profiles);
    setAllWellness(savedWellness);

    let savedProfile: string | null = null;

    try {
      savedProfile = localStorage.getItem(
        "active-astronaut",
      );
    } catch {
      // Profile selection will use the default.
    }

    setActiveAstronautId(
      savedProfile === "unassigned"
        ? null
        : profiles.find((p) => p.id === savedProfile)?.id
          ?? profiles[0]?.id
          ?? null,
    );

    setStorageReady(true);
  })
  .catch((e) => setStorageError(e.message));
    const stopOffline = monitorOffline(setReady, setOfflineError);
    return () => {
      stopOffline();
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [view]);
  function showView(next: View) {
    setView(next);
  }
  function selectAstronaut(id: string | null) {
  if (id !== null && !astronauts.some((p) => p.id === id))
    return;

  setActiveAstronautId(id);
  setHistoryPage(0);

  try {
    localStorage.setItem(
      "active-astronaut",
      id ?? "unassigned",
    );
  } catch {
    setNotice(
      "Profile switched, but selection could not be saved.",
    );
  }
}
  function navigate(next: View, track = true) {
    if (dirty && !window.confirm("Discard unsaved entries and notes?"))
      return false;
    setFirst("");
    setSecond("");
    setNote("");
    setMeasurementContext("");
    setReview(false);
    setStep(0);
    setEntrySource("Manual entry");
    setEntryTimestamp("");
    setEntryDevice("");
    setExtraDirty(false);
    if (track && next !== view)
      setViewHistory((previous) => [...previous, view]);
    showView(next);
    setError("");
    setNotice("");
    return true;
  }
  function goBack() {
    const previous = viewHistory.at(-1) ?? "Dashboard";
    if (navigate(previous, false))
      setViewHistory((history) => history.slice(0, -1));
  }
  async function save() {
    if (!astronauts.length) {
  setError("Crew profiles are not available yet.");
  return;
}
    setBusy(true);
    setError("");
    try {
      const record: Reading = {
        id: crypto.randomUUID(),
        astronautId: activeAstronautId ?? undefined,
        kind: kind as Reading["kind"],
        value: kind === "Blood pressure" ? `${first} / ${second}` : first,
        unit: UNITS[kind],
        timestamp: entryTimestamp || new Date().toISOString(),
        note: measurementContext
          ? `Context: ${measurementContext}\n${note}`
          : note,
        source: entrySource,
        ...(entryDevice ? { device: entryDevice } : {}),
      };
      await saveRecord("readings", record);
      setStorageReady(true);
      setStorageError("");
      setRecords((v) => [record, ...v]);
      setHistoryPage(0);
      setFirst("");
      setSecond("");
      setNote("");
      setMeasurementContext("");
      setReview(false);
      setViewHistory((previous) => [...previous, view]);
      showView("Health history");
      setNotice("Reading saved on this device.");
    } catch (e) {
      setError((e as Error).message);
      setStorageReady(false);
      setStorageError(
        "Local saving failed; the draft is retained. Retry before relying on local persistence.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function saveIncident() {
    if (!astronauts.length) {
      setError("Crew profiles are not available yet.");
      return;
    }
    setBusy(true);
    try {
      const incident = {
        id: crypto.randomUUID(),
        astronautId: activeAstronautId ?? undefined,
        timestamp: new Date().toISOString(),
        notes: note,
      };
      await saveRecord("incidents", incident);
      setStorageReady(true);
      setStorageError("");
      setIncidents((v) => [incident, ...v]);
      setNote("");
      setMeasurementContext("");
      setStep(3);
      setNotice("Simulation saved locally.");
    } catch (e) {
      setError((e as Error).message);
      setStorageReady(false);
      setStorageError(
        "Local saving failed; the draft is retained. Retry before relying on local persistence.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function exportData() {
    try {
      const wellness = await readRecords("wellness");
      const blob = new Blob(
        [
          JSON.stringify(
            {
              schema: 1,
              exportedAt: new Date().toISOString(),
              readings: allRecords,
              incidents: allIncidents,
              wellness,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "crew-health-report.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function reloadRecords() {
  const [r, i, w] = await Promise.all([
    readRecords<Reading>("readings"),
    readRecords<Incident>("incidents"),
    readRecords<Wellness>("wellness"),
  ]);

  setRecords(r);
  setIncidents(i);
  setAllWellness(w);
  setHistoryPage(0);
}
  function reviewSensor(r: SensorReading) {
    if (!navigate("Measurements")) return;
    setKind(r.kind);
    setFirst(r.first);
    setSecond(r.second);
    setEntrySource(r.source);
    setEntryTimestamp(r.timestamp);
    setEntryDevice(r.device);
    setReview(true);
  }
  const historyRows = useMemo(
  () =>
    [...records].sort(
      (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
    ),
  [records],
);
  const previousById = useMemo(() => {
    const result = new Map<string, Reading>();
    for (const k of METRICS) {
      const rows = orderedReadings(records, k);
      for (let i = 1; i < rows.length; i++) result.set(rows[i].id, rows[i - 1]);
    }
    return result;
  }, [records]);
  return (
    <div
      className={`app-shell touch-console ${view === "Dashboard" ? "console-home" : ""} ${view === "Emergency assist" ? "emergency-mode" : ""}`}
    >
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="workspace">
        <header className="console-bar">
          <button
            className="console-brand"
            onClick={() => navigate("Dashboard")}
            aria-label="Deep Space Health Systems main screen"
          >
            <Icon name="planet" size={30} />
            <span>
              DEEP SPACE<small>HEALTH SYSTEMS</small>
            </span>
          </button>
          <div className="console-bar-actions">
            <div className="space-apps-logo">
              <Image
                unoptimized
                src="/brand/space-apps-color-white.svg"
                alt="NASA Space Apps Challenge"
                width={561}
                height={221}
              />
            </div>
          </div>
        </header>
        <main id="main" className={view === "Dashboard" ? "main-home" : "feature-page"}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                DEEP SPACE <span> / </span> HEALTH SYSTEMS
              </div>
              <h1 ref={heading} tabIndex={-1}>
                {
                  {
                    Dashboard: "Mission home",
                    Measurements: "Record vitals",
                    "Mission health": "Health check",
                    Wearables: "Connect a device",
                    "Offline guides": "Field guide",
                    "Emergency assist": "Emergency training",
                    "Health history": "Saved history",
                    Wellbeing: "Wellbeing",
                    "Move the Moon": "Move the Moon",
                    "Device & data": "Device & data",
                    "Crew overview": "Crew overview",
                  }[view]
                }
              </h1>
              <p>{view === "Dashboard" ? "Choose what you need." : ""}</p>
            </div>
            
            {view !== "Dashboard" && (
              <button
                className="back console-back"
                onClick={goBack}
                aria-label="Back"
                title="Back"
              >
                <Icon name="back" size={26} />
              </button>
            )}
          </div>
          <div className="active-profile-bar">
            <span>
              Active astronaut:{" "}
              <strong>
                {activeAstronaut?.name ?? "Unassigned"}
              </strong>
            </span>

            {view !== "Crew overview" && (
              <button
                className="secondary"
                onClick={() => navigate("Crew overview")}
              >
                Switch profile
              </button>
            )}
          </div>
          {offlineError && (
            <div className="alert" role="alert">
              {offlineError}
            </div>
          )}
          {storageError && (
            <div className="alert" role="alert">
              {storageError} Local records are unavailable on this device.
            </div>
          )}
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              ✓ {notice}
            </div>
          )}
          {view === "Dashboard" && (
            <div className="home-workflows">
              <section aria-labelledby="daily-title" className="daily-workflow">
                <h2 id="daily-title">Daily check-in</h2>
                <button
                  className="primary-checkin"
                  onClick={() => navigate("Measurements")}
                >
                  <Icon name="Measurements" size={32} />
                  <span>
                    <strong>Record vitals</strong>
                    <small>
                      Heart rate, blood pressure, glucose or temperature
                    </small>
                  </span>
                  <span className="checkin-action">
                    Start check-in <Icon name="arrow" size={20} />
                  </span>
                </button>
              </section>
              {(
                [
                  {
                    title: "Review & follow up",
                    items: [
                      {
                        view: "Mission health",
                        label: "Health check",
                        hint: "Review readings and next steps",
                      },
                      {
                        view: "Crew overview",
                        label: "Crew overview",
                        hint: "Team profiles and saved history",
                      },
                      {
                        view: "Wellbeing",
                        label: "Wellbeing",
                        hint: "Sleep, mood and observations",
                      },
                    ],
                  },
                  {
                    title: "Tools & training",
                    items: [
                      {
                        view: "Wearables",
                        label: "Connect a device",
                        hint: "Bluetooth sensors",
                      },
                      {
                        view: "Offline guides",
                        label: "Field guide",
                        hint: "Measurement instructions",
                      },
                      {
                        view: "Device & data",
                        label: "Device & data",
                        hint: "Install, reminders and backups",
                      },
                      {
                        view: "Move the Moon",
                        label: "Move the Moon",
                        hint: "Recreation · offline game",
                      },
                      {
                        view: "Emergency assist",
                        label: "Emergency training",
                        hint: "Practice only · no help is dispatched",
                      },
                    ],
                  },
                ] as const
              ).map((group) => (
                <section className="home-tool-section" key={group.title}>
                  <h2>{group.title}</h2>
                  <nav className="workflow-grid" aria-label={group.title}>
                    {group.items.map((item) => (
                      <button
                        className="workflow-link"
                        key={item.view}
                        onClick={() => navigate(item.view)}
                      >
                        <Icon name={item.view} size={24} />
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.hint}</small>
                        </span>
                      </button>
                    ))}
                  </nav>
                </section>
              ))}
            </div>
          )}
          {view === "Crew overview" && (
            <CrewOverview
              astronauts={astronauts}
              activeAstronautId={activeAstronautId}
              records={allRecords}
               wellness={allWellness}
              onSelect={selectAstronaut}
              onHistory={() => navigate("Health history")}
              onMeasure={() => navigate("Measurements")}
            />
          )}
          {view === "Device & data" && (
            <section
              className="console-settings"
              aria-label="Device settings and data"
            >
              <div className="device-cache-status" role="status">
                <strong>Offline availability</strong>
                <p>
                  {ready
                    ? "Ready for offline use on this device."
                    : online
                      ? "Connected. Keep the app open until local resources finish downloading."
                      : "Offline. Cached resources have not been verified."}
                </p>
              </div>
              <InstallApp ready={ready} />
              <Reminders />
              <button className="primary" onClick={exportData}>
                Export health report
              </button>
              <DataTransfer onImported={reloadRecords} />
              <p className="fine-print">
                Records stay in this browser on this device. Export a backup
                before changing devices or clearing browser storage.
              </p>
            </section>
          )}
          {view === "Measurements" && (
            <section className="panel form-panel">
              <div className="eyebrow">
                {entrySource.toUpperCase()} ·{" "}
                {review ? "02 / REVIEW" : "01 / MEASURE"}
              </div>
              {review && <h2>Review reading</h2>}
              {!review ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const message = validateReading(kind, first, second);
                    setError(message);
                    if (!message) setReview(true);
                  }}
                >
                  <label>
                    Measurement
                    <select
                      value={kind}
                      onChange={(e) => {
                        if (
                          dirty &&
                          !window.confirm(
                            "Discard unsaved entries before changing measurement?",
                          )
                        )
                          return;
                        setKind(e.target.value as Reading["kind"]);
                        setFirst("");
                        setSecond("");
                        setNote("");
                        setMeasurementContext("");
                      }}
                    >
                      <option>Heart rate</option>
                      <option>Blood pressure</option>
                      <option>Blood glucose</option>
                      <option>Body temperature</option>
                    </select>
                  </label>
                  <p className="measurement-safety">
                    Use the approved measurement device and mission procedure.
                    Urgent symptoms take priority; do not delay the approved
                    emergency response to enter a reading.
                  </p>
                  <div className="input-row">
                    <NumberControl
                      label={kind === "Blood pressure" ? "Systolic" : kind}
                      decimal={kind === "Body temperature"}
                      unit={UNITS[kind]}
                      value={first}
                      onChange={(v) => {
                        setFirst(v);
                        setEntrySource("Manual entry");
                        setEntryTimestamp("");
                        setEntryDevice("");
                      }}
                    />
                    {kind === "Blood pressure" && (
                      <NumberControl
                        label="Diastolic"
                        unit="mmHg"
                        value={second}
                        onChange={(v) => {
                          setSecond(v);
                          setEntrySource("Manual entry");
                          setEntryTimestamp("");
                          setEntryDevice("");
                        }}
                      />
                    )}
                  </div>
                  <label>
                    Measurement context
                    <select
                      value={measurementContext}
                      onChange={(e) => setMeasurementContext(e.target.value)}
                    >
                      <option value="">
                        Choose context (unknown if omitted)
                      </option>
                      {(kind === "Body temperature"
                        ? [
                            "Oral thermometer",
                            "Ear thermometer",
                            "Skin / contactless",
                            "Other method",
                          ]
                        : kind === "Blood glucose"
                          ? ["Fasting", "After meal", "Timing unknown"]
                          : [
                              "Resting",
                              "After exertion",
                              "Recovering",
                              "Activity unknown",
                            ]
                      ).map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <MeasurementInstructions kind={kind} />
                  <label>
                    Observation <span>(optional · fictional data only)</span>
                    <textarea
                      maxLength={10000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add context to this reading…"
                    />
                  </label>
                  <p className="fine-print">
                    Format validation only. No medical thresholds or diagnoses.
                  </p>
                  <button className="primary" type="submit">
                    Review reading <Icon name="arrow" size={18} />
                  </button>
                </form>
              ) : (
                <>
                  <div className="review-reading">
                    {first}
                    {kind === "Blood pressure" ? ` / ${second}` : ""}
                    <small>{UNITS[kind]}</small>
                  </div>
                  <p>
                    {kind} · {entrySource} ·{" "}
                    {entryTimestamp
                      ? new Date(entryTimestamp).toLocaleString()
                      : "timestamp assigned when saved"}{" "}
                    {entryDevice && " · " + entryDevice}
                  </p>
                  <ReadingInsight
                    resting={measurementContext === "Resting"}
                    reading={{
                      kind: kind as Reading["kind"],
                      value:
                        kind === "Blood pressure"
                          ? first + " / " + second
                          : first,
                    }}
                    previous={orderedReadings(
                      records,
                      kind as Reading["kind"],
                    ).at(-1)}
                  />
                  <p>
                    {measurementContext && `Context: ${measurementContext}. `}
                    {note || "No observation added."}
                  </p>
                  <div className="actions">
                    <button
                      className="secondary"
                      onClick={() => setReview(false)}
                    >
                      Edit reading
                    </button>
                    <button className="primary" onClick={save} disabled={busy}>
                      {busy ? "Saving…" : "Save to this device"}
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
          {view === "Health history" && (
            <>
              <Trends records={records} />
              <section className="panel">
                <div className="section-heading">
                  <h2>Saved health readings</h2>
                  <button onClick={exportData}>Export JSON ↗</button>
                </div>
                <p>
                  Entries and source labels on this device. Exported files may
                  contain sensitive notes; handle them carefully.
                </p>
                {!storageReady && !storageError && (
                  <p role="status">Loading local records…</p>
                )}
                <div className="history-table">
                  <table>
                    <caption>
                      Prototype readings · samples fictional · local time ·
                      sensor receipt timestamps
                    </caption>
                    <thead>
                      <tr>
                        <th>Measurement</th>
                        <th>Reading</th>
                        <th>Date / time</th>
                        <th>Source / observation</th>
                        <th>Explained demo flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows
                        .slice(historyPage * 50, (historyPage + 1) * 50)
                        .map((r) => (
                          <tr key={r.id}>
                            <td>{r.kind}</td>
                            <td className="table-value">
                              {r.value} <small>{r.unit}</small>
                            </td>
                            <td>{new Date(r.timestamp).toLocaleString()}</td>
                            <td>
                              {r.id.startsWith("sample") ? "Sample · " : ""}
                              {r.source}
                              {r.device && (
                                <small className="block">{r.device}</small>
                              )}
                              <small className="block">{r.note}</small>
                            </td>
                            <td>
                              <details>
                                <summary>{assessReading(r).title}</summary>
                                <ReadingInsight
                                  reading={r}
                                  previous={previousById.get(r.id)}
                                />
                              </details>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  <button
                    className="secondary"
                    disabled={historyPage === 0}
                    onClick={() => setHistoryPage((p) => p - 1)}
                  >
                    Previous records
                  </button>
                  <span>
                    Page {historyPage + 1} of{" "}
                    {Math.max(1, Math.ceil(historyRows.length / 50))} ·{" "}
                    {historyRows.length} records
                  </span>
                  <button
                    className="secondary"
                    disabled={(historyPage + 1) * 50 >= historyRows.length}
                    onClick={() => setHistoryPage((p) => p + 1)}
                  >
                    Next records
                  </button>
                </div>
                <p className="fine-print">
                  Flags use arbitrary exhibition change rules, never clinical
                  thresholds. A missing flag does not mean a reading is
                  medically safe. Browser storage can be cleared or evicted.
                </p>
                {incidents.length > 0 && (
                  <>
                    <h3>Saved incidents and follow-up logs</h3>
                    {incidents.map((i) => (
                      <div className="incident" key={i.id}>
                        <time>{new Date(i.timestamp).toLocaleString()}</time>
                        <p>{i.notes || "No observations recorded."}</p>
                      </div>
                    ))}
                  </>
                )}
              </section>
              <DataTransfer onImported={reloadRecords} />
            </>
          )}
          {view === "Offline guides" && (
            <section className="panel">
              <div className="section-heading">
                <h2>Measurement guides</h2>
                <span className="tag">BUNDLED IN APP SHELL</span>
              </div>
              <p>
                {ready
                  ? "Essential resources verified in this browser cache."
                  : "First visit requires a connection. Wait for verified offline readiness before disconnecting."}{" "}
                Installation is optional.
              </p>
              <div className="assessment-grid">
                {(["Blood glucose", "Body temperature"] as const).map(
                  (metric) => (
                    <details className="assessment context" key={metric}>
                      <summary>{metric}: how, why, and next steps</summary>
                      <MeasurementInstructions kind={metric} />
                    </details>
                  ),
                )}
              </div>
              <div className="guides-grid">
                {guides.map((g, i) => (
                  <button
                    className={`guide-card ${guide === i ? "selected" : ""}`}
                    key={g.title}
                    onClick={() => setGuide(guide === i ? null : i)}
                    aria-expanded={guide === i}
                  >
                    <Icon name="Offline guides" size={30} />
                    <small>{g.category}</small>
                    <h3>{g.title}</h3>
                    <span>
                      {guide === i ? "Close guide −" : "Read guide →"}
                    </span>
                    {guide === i && (
                      <div>
                        <p>{g.text}</p>
                        <p>{g.why}</p>
                        <ol className="guide-steps">
                          {g.steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                        {g.source && (
                          <span className="fine-print">
                            Educational source: American Heart Association ·
                            Earth-based reference. Mission procedures require
                            medical review.
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}
          {view === "Emergency assist" && (
            <section className="panel emergency-panel">
              <div className="eyebrow">
                TRAINING ENVIRONMENT · SIMULATION ONLY
              </div>
              <h2>
                {
                  [
                    "Emergency training",
                    "Guided emergency rehearsal",
                    "Record your observations",
                    "Incident summary",
                  ][step]
                }
              </h2>
              <div className="alert">
                Educational emergency rehearsal. Earth reference guidance does
                not replace trained, approved mission procedures. This app does
                not call for help.
              </div>
              {step === 0 ? (
                <>
                  <p>
                    Practice navigating a disconnected mission workflow with
                    fictional observations. This simulation provides no
                    diagnosis or medication dosing. Practice response priorities
                    and record actions.
                  </p>
                  <button className="emergency" onClick={() => setStep(1)}>
                    Open fictional scenario →
                  </button>
                </>
              ) : step === 1 ? (
                <>
                  <EmergencyGuide onSummary={setNote} />
                  <button className="primary" onClick={() => setStep(2)}>
                    Continue to observation log →
                  </button>
                </>
              ) : step === 2 ? (
                <>
                  <label>
                    Fictional observations
                    <textarea
                      maxLength={10000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Record simulation observations…"
                    />
                  </label>
                  <p>Timestamp will be recorded when the incident is saved.</p>
                  <button
                    className="primary"
                    onClick={saveIncident}
                    disabled={busy}
                  >
                    {busy ? "Saving…" : "Save simulation & view summary"}
                  </button>
                </>
              ) : (
                <>
                  <p>
                    Rehearsal recorded. Review observations and follow-up with
                    the crew medical officer.
                  </p>
                  <time>
                    {incidents[0] &&
                      new Date(incidents[0].timestamp).toLocaleString()}
                  </time>
                  <p className="protocol">
                    {incidents[0]?.notes || "No observations recorded."}
                  </p>
                  <button
                    className="secondary"
                    onClick={() => navigate("Health history")}
                  >
                    View saved incident
                  </button>
                </>
              )}
            </section>
          )}
          <div hidden={view !== "Wearables"}>
            <Wearables onReview={reviewSensor} />
          </div>
          {view === "Mission health" && (
            <MissionHealth
              records={records}
              onMeasure={() => navigate("Measurements")}
              onEmergency={() => navigate("Emergency assist")}
              onSaved={reloadRecords}
              onDirty={setExtraDirty}
            />
          )}
          {view === "Wellbeing" && (
              storageReady ? (
                <Wellbeing
                  key={activeAstronautId ?? "unassigned"}
                  astronautId={activeAstronautId}
                  astronautName={activeAstronaut?.name ?? "Unassigned"}
                  records={wellness}
                  vitals={records}
                  onDirty={setExtraDirty}
                  onSaved={(record) =>
                    setAllWellness((previous) => [record, ...previous])
                  }
                />
              ) : (
                <p>Local health records are not available yet.</p>
              )
            )}
          {view === "Move the Moon" && <MoveTheMoon />}
          <footer>
            <span>
              <Icon name="shield" size={14} />{" "}
              {ready
                ? "ESSENTIAL RESOURCES CACHED"
                : "FIRST VISIT REQUIRES CONNECTION"}{" "}
              <b>·</b> DEVICE-LOCAL STORAGE
            </span>
            <span>
              SPACE APPS 2026 <b>/</b> SAMPLES FICTIONAL · NOT MEDICAL SOFTWARE
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
