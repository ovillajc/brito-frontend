'use client'

/**
 * @fileoverview Panel de representación impresa del CFDI con Complemento Carta Porte 3.1.
 * Diseño premium con los colores de marca de Transportes Brito.
 * Colores: Naranja #e07020 | Verde #1a5c3a | Fondo claro stone.
 */

import React from 'react'
import { FileText, Printer, Download, QrCode } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Wizard } from '@/src/core/presentation/components/organisms/wizard'
import type { BillingRecord } from '@/src/features/billing/domain/entities/billing-entity'
import type { CompanyProfileEntity } from '@/src/features/company-profile/domain/entities'

interface InvoicePreviewPanelProps {
  isOpen?: boolean
  record: BillingRecord | null
  companyProfile: CompanyProfileEntity | null
  onClose: () => void
  onMarkAsInvoiced: (record: BillingRecord) => void
}

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' })
const shortDateFmt = new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

function numberToWords(n: number): string {
  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE']
  const tens = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
  const hundreds = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS']
  if (n === 0) return 'CERO'
  if (n < 20) return units[n]
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' Y ' + units[n % 10] : '')
  if (n < 1000) return hundreds[Math.floor(n / 100)] + (n % 100 !== 0 ? ' ' + numberToWords(n % 100) : '')
  if (n < 1000000) {
    const t = Math.floor(n / 1000)
    return (t === 1 ? 'MIL' : numberToWords(t) + ' MIL') + (n % 1000 !== 0 ? ' ' + numberToWords(n % 1000) : '')
  }
  return n.toString()
}
function totalToLetters(total: number): string {
  const int = Math.floor(total)
  const cents = Math.round((total - int) * 100)
  return `${numberToWords(int)} PESOS ${String(cents).padStart(2, '0')}/100 M.N.`
}

export function InvoicePreviewPanel({ isOpen = false, record, companyProfile, onClose, onMarkAsInvoiced }: InvoicePreviewPanelProps) {
  if (!record) return null

  const handlePrint = () => { window.print() }

  const generateCartaPorteXML = () => {
    const now = new Date()
    const fechaHora = now.toISOString().replace('.000Z', '')
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte31" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/CartaPorte31 http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte/CartaPorte31.xsd" Version="4.0" Serie="CP" Folio="${record.folio ?? record.tripId.slice(0, 8).toUpperCase()}" Fecha="${fechaHora}" FormaPago="99" NoCertificado="[NO_CERTIFICADO]" Certificado="[CERTIFICADO]" Sello="[SELLO]" SubTotal="${record.totalIncome.toFixed(2)}" Moneda="MXN" Total="${(record.totalIncome * 1.12).toFixed(2)}" TipoDeComprobante="I" MetodoPago="PPD" LugarExpedicion="${companyProfile?.zipCode ?? '00000'}">
  <cfdi:Emisor Rfc="${companyProfile?.rfc ?? 'XAXX010101000'}" Nombre="${companyProfile?.legalName ?? 'EMPRESA'}" RegimenFiscal="${companyProfile?.taxRegime ?? '601'}" />
  <cfdi:Receptor Rfc="${record.clientRfc ?? 'XAXX010101000'}" Nombre="${record.clientName ?? 'CLIENTE'}" DomicilioFiscalReceptor="${record.clientTaxDomicile ?? '00000'}" RegimenFiscalReceptor="${record.clientTaxRegime ?? '616'}" UsoCFDI="S01" />
</cfdi:Comprobante>`
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CCP31_${record.folio ?? record.tripId.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  const subtotal = record.totalIncome
  const iva = subtotal * 0.16
  const retencion = subtotal * 0.04
  const total = subtotal + iva - retencion

  const ccpId = record.invoiceUUID ?? '00000000-0000-0000-0000-000000000000'
  const folio = record.invoiceFolio ?? record.folio ?? `INT-${record.tripId.slice(0, 8).toUpperCase()}`
  const fechaEmision = record.invoiceDate ? dateFmt.format(record.invoiceDate) : dateFmt.format(new Date())
  const fechaSalida = record.departureDate ? shortDateFmt.format(record.departureDate) : 'N/D'
  const fechaLlegada = record.arrivalDateActual ? shortDateFmt.format(record.arrivalDateActual) : 'N/D'
  const emisorAddr = [companyProfile?.street, companyProfile?.exteriorNum, companyProfile?.neighborhood, companyProfile?.city, companyProfile?.state].filter(Boolean).join(', ')

  /* ─── colores de marca para estilos inline (necesarios para @media print) ─── */
  const C_ORANGE = '#e07020'
  const C_GREEN  = '#1a5c3a'
  const C_DARK   = '#1a1a1a'
  const C_MUTED  = '#6b7280'
  const C_BORDER = '#e7e5e4'  // stone-200

  const sectionHeader: React.CSSProperties = {
    background: C_GREEN,
    color: 'white',
    padding: '3px 8px',
    fontSize: '7px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderRadius: '4px 4px 0 0',
  }

  const cell: React.CSSProperties = {
    padding: '2px 6px',
    fontSize: '7.5px',
    color: C_DARK,
    verticalAlign: 'top',
  }

  const label: React.CSSProperties = { fontWeight: 700, color: C_MUTED }
  const mono: React.CSSProperties  = { fontFamily: 'monospace' }

  return (
    <Wizard
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Vista Previa CFDI"
      description={`Folio: ${folio}`}
      icon={<FileText className="size-5" />}
      showFooter={false}
      activeStep={0}
      steps={[{
        id: 'preview',
        title: 'Facturación',
        content: (
          <>
            <div className="flex flex-col relative h-full">

              {/* Estilos para impresión */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  @page { size: letter portrait; margin: 6mm 8mm; }
                  body * { visibility: hidden !important; }
                  .print-area, .print-area * { visibility: visible !important; }
                  .print-area {
                    position: fixed !important; left: 0; top: 0;
                    width: 100%; height: auto;
                    background: white !important;
                    font-family: 'Helvetica Neue', Arial, sans-serif !important;
                  }
                  .print-hidden { display: none !important; }
                  .no-break { page-break-inside: avoid; }
                }
              `}} />

              {/* ── Scroll area ── */}
              <div className="flex-1 overflow-y-auto bg-stone-100 dark:bg-zinc-950 p-4 sm:p-6 print:p-0 rounded-xl border border-stone-200 dark:border-zinc-800">
                <div
                  className="print-area mx-auto max-w-[760px] bg-white mb-6"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12)', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
                >

                  {/* ══════════════════════════════════════════════════
                      1. BANDA SUPERIOR DE COLOR
                  ══════════════════════════════════════════════════ */}
                  <div style={{ background: `linear-gradient(135deg, ${C_GREEN} 0%, #2d7a52 100%)`, padding: '10px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Logo + nombre */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/images/logo.png"
                        alt="Transportes Brito"
                        style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', objectFit: 'contain', padding: 3, flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ color: 'white', fontWeight: 900, fontSize: 13, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                          Transportes <span style={{ color: C_ORANGE }}>Brito</span>
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 7, fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 2 }}>
                          Barita de la Chontalpa
                        </div>
                      </div>
                    </div>

                    {/* Tipo + folio */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ background: C_ORANGE, color: 'white', fontWeight: 900, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 10px', borderRadius: 4, marginBottom: 4 }}>
                        Carta Porte 3.1 — Ingreso
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 8, fontWeight: 700 }}>
                        Serie: <span style={{ color: C_ORANGE }}>CP</span>&nbsp;&nbsp;Folio: <span style={{ color: 'white', fontWeight: 900 }}>{folio}</span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 7, marginTop: 1 }}>
                        CFDI 4.0 &nbsp;|&nbsp; {fechaEmision}
                      </div>
                    </div>
                  </div>

                  {/* ══════════════════════════════════════════════════
                      CUERPO DEL DOCUMENTO
                  ══════════════════════════════════════════════════ */}
                  <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>

                    {/* ── 2. EMISOR + RECEPTOR (dos columnas) ── */}
                    <div className="no-break" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {/* Emisor */}
                      <div>
                        <div style={sectionHeader}>Datos del Emisor</div>
                        <div style={{ border: `1px solid ${C_BORDER}`, borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '6px 8px' }}>
                          <div style={{ borderLeft: `3px solid ${C_GREEN}`, paddingLeft: 6, marginBottom: 4 }}>
                            <div style={{ fontWeight: 900, fontSize: 8.5, color: C_GREEN, textTransform: 'uppercase' }}>
                              {companyProfile?.legalName ?? 'TRANSPORTES BRITO SA DE CV'}
                            </div>
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                              {[
                                ['RFC:', companyProfile?.rfc ?? 'N/D', true],
                                ['Régimen Fiscal:', companyProfile?.taxRegime ?? '601 - General de Ley PM'],
                                ['Domicilio:', emisorAddr || 'N/D'],
                                ['CP de Expedición:', companyProfile?.zipCode ?? '00000'],
                                ['País:', companyProfile?.country ?? 'MEX'],
                              ].map(([k, v, isMono], i) => (
                                <tr key={i}>
                                  <td style={{ ...cell, ...label, width: '38%', paddingTop: i === 0 ? 4 : 1.5, paddingBottom: 1.5, whiteSpace: 'nowrap' }}>{k}</td>
                                  <td style={{ ...cell, ...(isMono ? mono : {}), paddingTop: i === 0 ? 4 : 1.5, paddingBottom: 1.5 }}>{v as string}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Receptor */}
                      <div>
                        <div style={sectionHeader}>Datos del Receptor</div>
                        <div style={{ border: `1px solid ${C_BORDER}`, borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '6px 8px' }}>
                          <div style={{ borderLeft: `3px solid ${C_ORANGE}`, paddingLeft: 6, marginBottom: 4 }}>
                            <div style={{ fontWeight: 900, fontSize: 8.5, color: C_DARK, textTransform: 'uppercase' }}>
                              {record.clientName ?? 'PÚBLICO EN GENERAL'}
                            </div>
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                              {[
                                ['RFC:', record.clientRfc ?? 'XAXX010101000', true],
                                ['Régimen Fiscal:', record.clientTaxRegime ?? '616 - Sin obligaciones'],
                                ['Domicilio Fiscal (CP):', record.clientTaxDomicile ?? '00000'],
                                ['Uso CFDI:', 'S01 - Sin efectos fiscales'],
                              ].map(([k, v, isMono], i) => (
                                <tr key={i}>
                                  <td style={{ ...cell, ...label, width: '45%', paddingTop: i === 0 ? 4 : 1.5, paddingBottom: 1.5, whiteSpace: 'nowrap' }}>{k}</td>
                                  <td style={{ ...cell, ...(isMono ? mono : {}), paddingTop: i === 0 ? 4 : 1.5, paddingBottom: 1.5 }}>{v as string}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* ── 3. DATOS DEL COMPROBANTE ── */}
                    <div className="no-break">
                      <div style={sectionHeader}>Datos del Comprobante</div>
                      <div style={{ border: `1px solid ${C_BORDER}`, borderTop: 'none', borderRadius: '0 0 4px 4px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
                          {[
                            ['Tipo Comprobante', 'I - Ingreso'],
                            ['Método de Pago', 'PPD - Parcialidades'],
                            ['Forma de Pago', '99 - Por definir'],
                            ['Moneda', 'MXN - Peso Mexicano'],
                            ['Tipo de Cambio', '1.00'],
                            ['Lugar Expedición', companyProfile?.zipCode ?? '00000'],
                            ['Transp. Internacional', 'No'],
                            ['Versión CCP', '3.1'],
                          ].map(([k, v], i) => (
                            <div key={i} style={{ padding: '4px 8px', borderRight: i % 4 !== 3 ? `1px solid ${C_BORDER}` : 'none', borderBottom: i < 4 ? `1px solid ${C_BORDER}` : 'none' }}>
                              <div style={{ fontSize: 6.5, color: C_MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>{k}</div>
                              <div style={{ fontSize: 7.5, fontWeight: 700, color: C_DARK }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ── 4. CONCEPTOS ── */}
                    <div className="no-break">
                      <div style={sectionHeader}>Conceptos</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C_BORDER}`, borderTop: 'none' }}>
                        <thead>
                          <tr style={{ background: '#f5f5f4' }}>
                            {['Clave SAT', 'Cant.', 'Unidad', 'Descripción', 'V. Unitario', 'Importe', 'Obj. Imp.'].map((h, i) => (
                              <th key={i} style={{ ...cell, fontWeight: 700, color: C_MUTED, fontSize: 6.5, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C_BORDER}`, textAlign: i === 0 || i === 3 ? 'left' : 'center', padding: '4px 6px' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ ...cell, ...mono, color: C_GREEN, fontWeight: 700 }}>78101802</td>
                            <td style={{ ...cell, textAlign: 'center' }}>1</td>
                            <td style={{ ...cell, textAlign: 'center', ...mono }}>E48</td>
                            <td style={{ ...cell }}>
                              <div style={{ fontWeight: 700 }}>Servicio de Autotransporte Federal de Carga</div>
                              <div style={{ color: C_MUTED, fontSize: 7 }}>Ruta: {record.origin ?? 'N/D'} → {record.destination ?? 'N/D'} &nbsp;|&nbsp; Viaje: {folio}</div>
                            </td>
                            <td style={{ ...cell, textAlign: 'right', ...mono, fontWeight: 600 }}>{money.format(subtotal)}</td>
                            <td style={{ ...cell, textAlign: 'right', ...mono, fontWeight: 600 }}>{money.format(subtotal)}</td>
                            <td style={{ ...cell, textAlign: 'center' }}>02</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Totales */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6, padding: '0 2px' }}>
                        {/* Importe con letra */}
                        <div style={{ maxWidth: '55%', padding: '6px 8px', background: '#fafaf9', border: `1px solid ${C_BORDER}`, borderRadius: 4 }}>
                          <div style={{ fontSize: 6.5, fontWeight: 700, color: C_MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Importe con letra</div>
                          <div style={{ fontSize: 7.5, fontWeight: 600, color: C_DARK }}>{totalToLetters(total)}</div>
                        </div>
                        {/* Desglose */}
                        <div style={{ width: 200 }}>
                          {[
                            ['Subtotal', money.format(subtotal), false],
                            ['IVA Trasladado (16%)', money.format(iva), false],
                            ['Retención IVA (4%)', `-${money.format(retencion)}`, true],
                          ].map(([k, v, isRed], i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: `1px solid ${C_BORDER}`, fontSize: 7.5 }}>
                              <span style={{ color: C_MUTED }}>{k as string}</span>
                              <span style={{ ...mono, fontWeight: 600, color: isRed ? '#dc2626' : C_DARK }}>{v as string}</span>
                            </div>
                          ))}
                          {/* Total */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', marginTop: 2, background: C_GREEN, borderRadius: 4 }}>
                            <span style={{ color: 'white', fontWeight: 900, fontSize: 8.5 }}>TOTAL</span>
                            <span style={{ ...mono, color: 'white', fontWeight: 900, fontSize: 9 }}>{money.format(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── 5. AUTOTRANSPORTE FEDERAL ── */}
                    <div className="no-break">
                      <div style={sectionHeader}>Autotransporte Federal</div>
                      <div style={{ border: `1px solid ${C_BORDER}`, borderTop: 'none', borderRadius: '0 0 4px 4px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                        {[
                          {
                            title: '🚛 Tracto',
                            rows: [
                              ['No. Económico', record.unitEconomicNumber ?? 'N/D'],
                              ['Placa', record.truckPlates ?? '[PLACA]'],
                              ['Marca / Modelo', `${record.truckBrand ?? '[MARCA]'} ${record.truckModel ?? '[MODELO]'}`],
                              ['Año', record.truckYear?.toString() ?? '[AÑO]'],
                              ['Póliza Seguro', record.truckInsurancePolicy ?? '[POLIZA]'],
                            ],
                          },
                          {
                            title: '🔗 Remolque / Permiso',
                            rows: [
                              ['No. Económico', record.trailerEconomicNumber ?? 'N/D'],
                              ['Placa Remolque', record.trailerPlates ?? '[PLACA_REM]'],
                              ['Tipo Permiso SCT', 'TPAF01'],
                              ['Núm. Permiso', '[NUM_PERMISO]'],
                              ['Config. Vehicular', '[CONFIG_VEH]'],
                            ],
                          },
                          {
                            title: '🛡️ Seguros / Ruta',
                            rows: [
                              ['Aseguradora RC', '[ASEGURADORA]'],
                              ['Póliza RC', '[POLIZA_RC]'],
                              ['Aseg. Medio Ambiente', '[ASEG_MA]'],
                              ['Distancia Recorrida', `${record.preinvoiceKm ?? 0} km`],
                            ],
                          },
                        ].map((col, ci) => (
                          <div key={ci} style={{ borderRight: ci < 2 ? `1px solid ${C_BORDER}` : 'none', padding: '6px 8px' }}>
                            <div style={{ fontSize: 7, fontWeight: 700, color: C_GREEN, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, borderBottom: `1px solid ${C_BORDER}`, paddingBottom: 2 }}>{col.title}</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <tbody>
                                {col.rows.map(([k, v], ri) => (
                                  <tr key={ri}>
                                    <td style={{ ...cell, ...label, padding: '1.5px 0', whiteSpace: 'nowrap', width: '50%' }}>{k}:</td>
                                    <td style={{ ...cell, padding: '1.5px 4px', ...mono }}>{v}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── 6. UBICACIONES ── */}
                    <div className="no-break">
                      <div style={sectionHeader}>Ubicaciones — Origen / Destino</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C_BORDER}`, borderTop: 'none' }}>
                        <thead>
                          <tr style={{ background: '#f5f5f4' }}>
                            {['Tipo', 'RFC', 'Nombre', 'Domicilio', 'Fecha'].map((h, i) => (
                              <th key={i} style={{ ...cell, fontWeight: 700, color: C_MUTED, fontSize: 6.5, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C_BORDER}`, textAlign: 'left', padding: '3px 6px' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: `1px solid ${C_BORDER}` }}>
                            <td style={{ ...cell, padding: '4px 6px' }}>
                              <span style={{ background: '#dcfce7', color: C_GREEN, fontWeight: 700, fontSize: 7, padding: '1px 5px', borderRadius: 3 }}>Origen</span>
                            </td>
                            <td style={{ ...cell, ...mono, padding: '4px 6px' }}>{companyProfile?.rfc ?? 'N/D'}</td>
                            <td style={{ ...cell, fontWeight: 700, padding: '4px 6px' }}>{companyProfile?.legalName ?? 'N/D'}</td>
                            <td style={{ ...cell, padding: '4px 6px', color: C_MUTED }}>
                              {emisorAddr}{companyProfile?.zipCode ? ` CP:${companyProfile.zipCode}` : ''} | {companyProfile?.country ?? 'MEX'}
                            </td>
                            <td style={{ ...cell, ...mono, padding: '4px 6px', whiteSpace: 'nowrap' }}>{fechaSalida}</td>
                          </tr>
                          <tr>
                            <td style={{ ...cell, padding: '4px 6px' }}>
                              <span style={{ background: '#fff7ed', color: C_ORANGE, fontWeight: 700, fontSize: 7, padding: '1px 5px', borderRadius: 3, border: `1px solid ${C_ORANGE}33` }}>Destino</span>
                            </td>
                            <td style={{ ...cell, ...mono, padding: '4px 6px' }}>{record.clientRfc ?? 'N/D'}</td>
                            <td style={{ ...cell, fontWeight: 700, padding: '4px 6px' }}>{record.clientName ?? 'N/D'}</td>
                            <td style={{ ...cell, padding: '4px 6px', color: C_MUTED }}>
                              {record.destination ?? 'N/D'}{record.clientTaxDomicile ? ` | CP: ${record.clientTaxDomicile}` : ''}
                            </td>
                            <td style={{ ...cell, ...mono, padding: '4px 6px', whiteSpace: 'nowrap' }}>{fechaLlegada}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* ── 7. MERCANCÍAS + FIGURA (lado a lado) ── */}
                    <div className="no-break" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 8 }}>
                      {/* Mercancías */}
                      <div>
                        <div style={sectionHeader}>Mercancías</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C_BORDER}`, borderTop: 'none' }}>
                          <thead>
                            <tr style={{ background: '#f5f5f4' }}>
                              {['BienesTransp (SAT)', 'Descripción', 'Cant.', 'Unidad', 'Peso (KG)', 'Mat. Pel.'].map((h, i) => (
                                <th key={i} style={{ ...cell, fontWeight: 700, color: C_MUTED, fontSize: 6.5, borderBottom: `1px solid ${C_BORDER}`, textAlign: 'left', padding: '3px 6px' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ ...cell, ...mono, color: C_GREEN, fontWeight: 700, padding: '4px 6px' }}>[CLAVE_SAT]</td>
                              <td style={{ ...cell, padding: '4px 6px' }}>[DESCRIPCION]</td>
                              <td style={{ ...cell, textAlign: 'center', padding: '4px 6px' }}>1</td>
                              <td style={{ ...cell, ...mono, padding: '4px 6px' }}>XBX</td>
                              <td style={{ ...cell, textAlign: 'center', padding: '4px 6px' }}>1,000</td>
                              <td style={{ ...cell, textAlign: 'center', padding: '4px 6px' }}>No</td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr style={{ background: '#f5f5f4', borderTop: `1px solid ${C_BORDER}` }}>
                              <td colSpan={4} style={{ ...cell, fontWeight: 700, textAlign: 'right', padding: '3px 6px', color: C_MUTED }}>Peso Bruto Total:</td>
                              <td style={{ ...cell, fontWeight: 700, textAlign: 'center', padding: '3px 6px' }}>1,000 KGM</td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Figuras de Transporte */}
                      <div>
                        <div style={sectionHeader}>Figuras de Transporte</div>
                        <div style={{ border: `1px solid ${C_BORDER}`, borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '6px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: C_GREEN, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, flexShrink: 0 }}>01</div>
                            <div style={{ fontWeight: 900, fontSize: 8, color: C_DARK }}>{record.operatorName ?? '[NOMBRE_OPERADOR]'}</div>
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                              {[
                                ['Tipo Figura', '01 - Operador'],
                                ['RFC', record.operatorRfc ?? '[RFC_OPERADOR]'],
                                ['Núm. Licencia', record.operatorLicenseNumber ?? '[LICENCIA]'],
                              ].map(([k, v], i) => (
                                <tr key={i}>
                                  <td style={{ ...cell, ...label, padding: '2px 0', whiteSpace: 'nowrap', width: '45%' }}>{k}:</td>
                                  <td style={{ ...cell, ...mono, padding: '2px 4px' }}>{v}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* ── 8. TIMBRE FISCAL ── */}
                    <div className="no-break" style={{ borderTop: `2px solid ${C_BORDER}`, paddingTop: 8, display: 'grid', gridTemplateColumns: '72px 1fr', gap: 10 }}>
                      {/* QR */}
                      <div style={{ width: 72, height: 72, border: `1px solid ${C_BORDER}`, borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafaf9', flexShrink: 0 }}>
                        <QrCode style={{ width: 36, height: 36, color: C_GREEN, marginBottom: 2 }} />
                        <span style={{ fontSize: 6, textTransform: 'uppercase', color: C_MUTED, letterSpacing: '0.05em' }}>Código QR</span>
                      </div>

                      {/* Datos del timbre */}
                      <div style={{ fontSize: 7, fontFamily: 'monospace', color: C_MUTED, wordBreak: 'break-all', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div>
                          <span style={{ fontFamily: 'sans-serif', fontWeight: 700, color: C_DARK, marginRight: 4 }}>Folio Fiscal (UUID):</span>
                          {ccpId}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <span style={{ fontFamily: 'sans-serif', fontWeight: 700, color: C_DARK }}>No. Serie Cert. SAT:</span><br />
                            00001000000500000000
                          </div>
                          <div>
                            <span style={{ fontFamily: 'sans-serif', fontWeight: 700, color: C_DARK }}>No. Serie Cert. Emisor:</span><br />
                            00001000000500000000
                          </div>
                        </div>
                        <div>
                          <span style={{ fontFamily: 'sans-serif', fontWeight: 700, color: C_DARK }}>Sello Digital del CFDI:</span><br />
                          [SELLO_CFDI_BASE64...]
                        </div>
                        <div>
                          <span style={{ fontFamily: 'sans-serif', fontWeight: 700, color: C_DARK }}>Sello del SAT:</span><br />
                          [SELLO_SAT_BASE64...]
                        </div>
                        <div>
                          <span style={{ fontFamily: 'sans-serif', fontWeight: 700, color: C_DARK }}>Cadena Original:</span><br />
                          {`||1.1|${ccpId}|${fechaEmision}|SAT970701NN3|[SELLO_SAT]||`}
                        </div>
                      </div>
                    </div>

                    {/* ── Footer legal ── */}
                    <div style={{ marginTop: 6, borderTop: `1px solid ${C_BORDER}`, paddingTop: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 6.5, color: C_MUTED }}>
                        Este documento es una representación impresa de un CFDI
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/assets/images/logo.png" alt="Brito" style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'contain' }} />
                        <span style={{ fontSize: 6.5, fontWeight: 700, color: C_GREEN }}>
                          Transportes <span style={{ color: C_ORANGE }}>Brito</span> &nbsp;|&nbsp; CCP 3.1 &nbsp;|&nbsp; CFDI 4.0 &nbsp;|&nbsp; ClaveProdServ: 78101802
                        </span>
                      </div>
                    </div>

                  </div>{/* /body */}
                </div>{/* /print-area */}
              </div>{/* /scroll area */}

              {/* ── Footer de Acciones ── */}
              <div className="print-hidden shrink-0 flex flex-col gap-2 pt-4 mt-3 border-t border-stone-200 dark:border-zinc-800">
                {record.billingStatus === 'pending' && (
                  <Button
                    onClick={() => onMarkAsInvoiced(record)}
                    className="w-full bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white font-bold h-10 rounded-xl"
                  >
                    <FileText className="size-4 mr-2" />
                    Marcar como Facturado
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="h-9 text-xs rounded-xl border-stone-200 dark:border-zinc-700 gap-1.5 bg-white text-stone-800 hover:bg-stone-100"
                  >
                    <Printer className="size-3.5" />
                    Imprimir PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generateCartaPorteXML}
                    className="h-9 text-xs rounded-xl border-[#e07020]/30 text-[#e07020] hover:bg-[#e07020]/5 gap-1.5 bg-white"
                  >
                    <Download className="size-3.5" />
                    XML Carta Porte 3.1
                  </Button>
                </div>
              </div>

            </div>
          </>
        ),
      }]}
    />
  )
}
