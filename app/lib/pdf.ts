import { jsPDF } from 'jspdf'

export const exportScanHistoryPdf = (scans: any[]) => {
  const doc = new jsPDF({ unit: 'pt' })
  doc.setFontSize(18)
  doc.text('FraudGuard Scan History', 40, 40)
  doc.setFontSize(11)
  let y = 70

  scans.forEach((scan, index) => {
    const content = typeof scan.content === 'string' ? scan.content : ''
    const details = typeof scan.details === 'string' ? scan.details : 'N/A'

    if (y > 740) {
      doc.addPage()
      y = 40
    }
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${scan.type} scan - ${scan.result}`, 40, y)
    y += 18
    doc.setFont('helvetica', 'normal')
    doc.text(`Content: ${content.slice(0, 120)}${content.length > 120 ? '...' : ''}`, 40, y)
    y += 16
    doc.text(`Confidence: ${scan.confidence}%`, 40, y)
    y += 16
    doc.text(`Details: ${details}`, 40, y)
    y += 26
  })

  const fileName = `fraudguard-scan-history-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export const exportReportPdf = (reportData: any) => {
  const doc = new jsPDF({ unit: 'pt' })
  doc.setFontSize(18)
  doc.text('FraudGuard Security Report', 40, 40)
  doc.setFontSize(12)
  let y = 70

  const entries = [
    ['Total Scans', reportData.totalScans],
    ['Fraud Detected', reportData.fraudScans],
    ['Safe Content', reportData.safeScans],
    ['Suspicious Content', reportData.suspiciousScans],
    ['Email Scans', reportData.emailScans],
    ['SMS Scans', reportData.smsScans],
    ['Link Scans', reportData.linkScans],
    ['Recent Scans (7d)', reportData.recentScans],
    ['Accuracy', `${reportData.accuracy}%`],
    ['Fraud Rate', `${reportData.fraudRate}%`],
    ['Average Confidence', `${reportData.averageConfidence}%`]
  ]

  entries.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 40, y)
    y += 18
  })

  const fileName = `fraudguard-report-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

export const exportScanDetailsPdf = (scan: any) => {
  const doc = new jsPDF({ unit: 'pt' })
  doc.setFontSize(18)
  doc.text('FraudGuard Scan Details', 40, 40)
  doc.setFontSize(12)
  let y = 70
  const lines = [
    `Scan ID: ${scan.scanId || scan.id || 'N/A'}`,
    `Type: ${scan.type}`,
    `Result: ${scan.result}`,
    `Confidence: ${scan.confidence}%`,
    `Risk Level: ${scan.riskLevel || 'Unknown'}`,
    `Content: ${scan.content}`,
    `Details: ${scan.details || 'No details available'}`
  ]

  lines.forEach((line) => {
    const split = doc.splitTextToSize(line, 520)
    doc.text(split, 40, y)
    y += split.length * 14 + 8
    if (y > 740) {
      doc.addPage()
      y = 40
    }
  })

  const fileName = `fraudguard-scan-${scan.scanId || scan.id || 'details'}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
