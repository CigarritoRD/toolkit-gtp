import type { MetricExportData, ResourceMetricSummary } from '@/lib/api/admin'
import { getCountryLabel } from '@/lib/constants/countries'

type ExportOptions = {
  period: string
  periodLabel: string
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  open: 'Vista',
  download: 'Descarga',
  open_external: 'Apertura externa',
}

function formatDate(iso: string | null): string {
  if (!iso) return '\u2014'
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPeriodLabel(period: string): string {
  switch (period) {
    case '7d': return '7 d\u00edas'
    case '30d': return '30 d\u00edas'
    case '90d': return '90 d\u00edas'
    case 'all': return 'Todo el historial'
    default: return period
  }
}

function formatEventType(type: string): string {
  return EVENT_TYPE_LABELS[type] ?? type
}

export async function exportMetricsToExcel(
  data: MetricExportData,
  options: ExportOptions,
): Promise<void> {
  const XLSX = await import('xlsx')

  const periodLabel = formatPeriodLabel(options.period)
  const safePeriod = options.period === 'all' ? 'todo' : options.period
  const dateStr = new Date().toISOString().split('T')[0]
  const fileName = `metricas-${safePeriod}-${dateStr}.xlsx`

  const wb = XLSX.utils.book_new()

  const summaryWs = buildSummarySheet(XLSX, data.summary, periodLabel, data.generated_at)
  const resourcesWs = buildResourcesSheet(XLSX, data.resources)
  const eventsWs = buildEventsSheet(XLSX, data.events)
  const countriesWs = buildCountriesSheet(XLSX, data.countries)

  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen')
  XLSX.utils.book_append_sheet(wb, resourcesWs, 'Recursos')
  XLSX.utils.book_append_sheet(wb, eventsWs, 'Eventos')
  XLSX.utils.book_append_sheet(wb, countriesWs, 'Pa\u00edses')

  XLSX.writeFile(wb, fileName)
}

function buildSummarySheet(
  XLSX: typeof import('xlsx'),
  summary: ResourceMetricSummary,
  periodLabel: string,
  generatedAt: string,
) {
  const rows: Array<Array<string | number>> = [
    ['M\u00c9TRICAS GENERALES', ''],
    ['', ''],
    ['Per\u00edodo seleccionado:', periodLabel],
    ['', ''],
    ['Vistas totales:', summary.total_views],
    ['Descargas totales:', summary.total_downloads],
    ['Usuarios \u00fanicos:', summary.unique_users],
    ['Recursos activos:', summary.active_resources],
    ['Tasa de conversi\u00f3n:', `${summary.conversion_rate}%`],
    ['', ''],
    ['Fecha de generaci\u00f3n:', formatDate(generatedAt)],
    ['', ''],
    ['NOTAS', ''],
    ['- Las vistas cuentan cada apertura de recurso.', ''],
    ['- Las descargas incluyen aperturas externas y descargas directas.', ''],
    ['- La tasa de conversi\u00f3n = (descargas / vistas) \u00d7 100.', ''],
    ['- Usuarios \u00fanicos se cuentan por ID de usuario distintas.', ''],
    ['- La hoja Eventos contiene el detalle por usuario con su pa\u00eds.', ''],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 30 }, { wch: 20 }]
  return ws
}

function buildResourcesSheet(
  XLSX: typeof import('xlsx'),
  resources: MetricExportData['resources'],
) {
  const headers: Array<Array<string | number>> = [
    ['#', 'Recurso', 'Slug', 'Vistas', 'Descargas', 'Usuarios \u00fanicos', 'Conversi\u00f3n (%)', '\u00daltima vista', '\u00daltima descarga'],
  ]

  const rows = resources.map((r, i) => [
    i + 1,
    r.title,
    `@${r.slug}`,
    r.total_views,
    r.total_downloads,
    r.unique_users,
    r.conversion_rate,
    formatDate(r.last_view_at),
    formatDate(r.last_download_at),
  ])

  const data = [...headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [
    { wch: 5 }, { wch: 40 }, { wch: 25 }, { wch: 10 },
    { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 18 },
  ]
  return ws
}

function buildEventsSheet(
  XLSX: typeof import('xlsx'),
  events: MetricExportData['events'],
) {
  const headers: Array<Array<string | number>> = [
    ['#', 'Fecha', 'Tipo de evento', 'Recurso', 'Usuario', 'Email', 'Pa\u00eds', 'C\u00f3digo pa\u00eds'],
  ]

  const rows = (events ?? []).map((e, i) => [
    i + 1,
    formatDate(e.created_at),
    formatEventType(e.event_type),
    e.resource_title ?? '',
    e.user_full_name || e.user_email || 'An\u00f3nimo',
    e.user_email || '',
    getCountryLabel(e.country) || e.country || 'Desconocido',
    e.country || '',
  ])

  const data = [...headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [
    { wch: 5 }, { wch: 20 }, { wch: 16 }, { wch: 30 },
    { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 12 },
  ]
  return ws
}

function buildCountriesSheet(
  XLSX: typeof import('xlsx'),
  countries: MetricExportData['countries'],
) {
  const headers: Array<Array<string | number>> = [
    ['#', 'Pa\u00eds', 'C\u00f3digo', 'Total de eventos', 'Vistas', 'Descargas', 'Usuarios \u00fanicos'],
  ]

  const rows = countries.map((c, i) => [
    i + 1,
    getCountryLabel(c.country) || c.country || 'Desconocido',
    c.country || '\u2014',
    c.total,
    c.views,
    c.downloads,
    c.unique_users,
  ])

  const data = [...headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [
    { wch: 5 }, { wch: 25 }, { wch: 10 }, { wch: 18 },
    { wch: 10 }, { wch: 12 }, { wch: 16 },
  ]
  return ws
}