import { useState, useEffect, useRef } from 'react'
import { runETL, uploadAndRunETL, getETLRuns, getETLStatus } from '../services/api'
import styles from './ETLPipeline.module.css'

const STATUS_COLORS = { success: '#22c55e', failed: '#dc2626', running: '#3b82f6' }

function StatusBadge({ status }) {
  return (
    <span className={styles.badge} style={{ background: STATUS_COLORS[status] + '20', color: STATUS_COLORS[status] }}>
      {status === 'running' && <span className={styles.pulse} />}
      {status}
    </span>
  )
}

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function ETLPipeline() {
  const [runs, setRuns] = useState([])
  const [lastRun, setLastRun] = useState(null)
  const [running, setRunning] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const loadRuns = async () => {
    try {
      const r = await getETLRuns(20)
      setRuns(r.data)
    } catch { /* table may be empty */ }
    try {
      const s = await getETLStatus()
      setLastRun(s.data)
    } catch { /* no runs yet */ }
  }

  useEffect(() => { loadRuns() }, [])

  const handleRunETL = async () => {
    setRunning(true)
    setError('')
    setSuccess('')
    try {
      const r = await runETL({ clear_existing: true })
      setSuccess(
        `ETL completed successfully! Extracted: ${r.data.records_extracted}, ` +
        `Loaded: ${r.data.records_loaded}, Duplicates removed: ${r.data.duplicates_removed}`
      )
      await loadRuns()
    } catch (e) {
      setError(e?.response?.data?.detail || 'ETL pipeline failed. Check backend logs.')
    } finally {
      setRunning(false)
    }
  }

  const handleFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are accepted.')
      return
    }
    setUploading(true)
    setError('')
    setSuccess('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('clear_existing', 'true')
    try {
      const r = await uploadAndRunETL(fd)
      setSuccess(
        `Upload & ETL done! Source: ${r.data.source_file}, ` +
        `Extracted: ${r.data.records_extracted}, Loaded: ${r.data.records_loaded}`
      )
      await loadRuns()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Upload failed. Check file format.')
    } finally {
      setUploading(false)
    }
  }

  const onFilePick = (e) => handleFile(e.target.files[0])
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>ETL Pipeline</h1>
          <p className={styles.subtitle}>Extract → Transform → Load historical ticket data into the reporting database</p>
        </div>
      </div>

      {error && (
        <div className={styles.alertError}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          {error}
        </div>
      )}
      {success && (
        <div className={styles.alertSuccess}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
          {success}
        </div>
      )}

      <div className={styles.panelGrid}>
        {/* Run Built-in Dataset */}
        <div className={styles.panel}>
          <div className={styles.panelIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e30613" strokeWidth="1.8">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
          </div>
          <h2 className={styles.panelTitle}>Run Built-in Dataset</h2>
          <p className={styles.panelDesc}>
            Process the pre-loaded <strong>historical_tickets.csv</strong> dataset (222 records spanning
            2024–2025). This will clean duplicates, normalize fields, and populate the reporting database.
          </p>
          <ul className={styles.stepList}>
            <li><span className={styles.stepNum}>1</span> Extract 222 raw ticket records from CSV</li>
            <li><span className={styles.stepNum}>2</span> Transform: normalize priorities, statuses, categories &amp; compute resolution times</li>
            <li><span className={styles.stepNum}>3</span> Remove duplicate entries (same employee + category + date)</li>
            <li><span className={styles.stepNum}>4</span> Load cleaned records into reporting database</li>
          </ul>
          <button
            className={styles.runBtn}
            onClick={handleRunETL}
            disabled={running || uploading}
          >
            {running ? (
              <><span className={styles.btnSpinner} /> Running ETL…</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
                Run ETL Pipeline
              </>
            )}
          </button>
        </div>

        {/* Upload Custom CSV */}
        <div className={styles.panel}>
          <div className={styles.panelIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <h2 className={styles.panelTitle}>Upload Custom CSV</h2>
          <p className={styles.panelDesc}>
            Upload your own CSV file to run the ETL pipeline. Required columns:
            <code className={styles.code}> employee_name, department, issue_category, description, priority, status, created_at</code>.
            Optional: <code className={styles.code}>resolved_at</code>.
          </p>
          <div
            className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={onFilePick} />
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <p className={styles.dropzoneText}>
              {dragOver ? 'Drop CSV here' : 'Drag & drop CSV or click to browse'}
            </p>
          </div>
          {uploading && (
            <div className={styles.uploadingMsg}>
              <span className={styles.btnSpinner} style={{ borderTopColor: '#3b82f6' }} /> Processing upload…
            </div>
          )}
        </div>
      </div>

      {/* Last Run Status */}
      {lastRun && (
        <div className={styles.lastRunCard}>
          <h2 className={styles.sectionTitle}>Last ETL Run</h2>
          <div className={styles.lastRunGrid}>
            <div className={styles.runMeta}><span>Status</span><StatusBadge status={lastRun.status} /></div>
            <div className={styles.runMeta}><span>Source</span><strong>{lastRun.source_file}</strong></div>
            <div className={styles.runMeta}><span>Extracted</span><strong>{lastRun.records_extracted ?? '—'}</strong></div>
            <div className={styles.runMeta}><span>Transformed</span><strong>{lastRun.records_transformed ?? '—'}</strong></div>
            <div className={styles.runMeta}><span>Loaded</span><strong>{lastRun.records_loaded ?? '—'}</strong></div>
            <div className={styles.runMeta}><span>Duplicates Removed</span><strong>{lastRun.duplicates_removed ?? '—'}</strong></div>
            <div className={styles.runMeta}><span>Started</span><strong>{fmt(lastRun.started_at)}</strong></div>
            <div className={styles.runMeta}><span>Completed</span><strong>{fmt(lastRun.completed_at)}</strong></div>
          </div>
          {lastRun.error_message && (
            <div className={styles.errorDetail}><strong>Error:</strong> {lastRun.error_message}</div>
          )}
        </div>
      )}

      {/* Run History */}
      {runs.length > 0 && (
        <div className={styles.historySection}>
          <h2 className={styles.sectionTitle}>ETL Run History</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Source File</th>
                  <th>Status</th>
                  <th>Extracted</th>
                  <th>Loaded</th>
                  <th>Dupes Removed</th>
                  <th>Started</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td className={styles.fileCell}>{r.source_file}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.records_extracted ?? '—'}</td>
                    <td>{r.records_loaded ?? '—'}</td>
                    <td>{r.duplicates_removed ?? '—'}</td>
                    <td>{fmt(r.started_at)}</td>
                    <td>{fmt(r.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
