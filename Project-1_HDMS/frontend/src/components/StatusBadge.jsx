export default function StatusBadge({ value, type = 'status' }) {
  const key = value?.toLowerCase().replace(' ', '')
  const cls = type === 'priority' ? `badge badge-${key}` : `badge badge-${key}`
  return <span className={cls}>{value}</span>
}
