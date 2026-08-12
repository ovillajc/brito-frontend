'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export interface BarItem {
  label: string
  value: number
}

interface HorizontalBarChartProps {
  data: BarItem[]
  color?: string
  formatValue?: (v: number) => string
  maxBars?: number
}

export function HorizontalBarChart({
  data,
  color = '#4ae183',
  formatValue = (v) => v.toLocaleString('es-MX'),
  maxBars = 10,
}: HorizontalBarChartProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !data?.length) return
    const container = ref.current
    d3.select(container).selectAll('svg').remove()

    const items = data.slice(0, maxBars)
    const margin = { top: 8, right: 80, bottom: 8, left: 110 }
    const w = container.clientWidth || 400
    const barHeight = 28
    const height = items.length * (barHeight + 8) + margin.top + margin.bottom

    const x = d3.scaleLinear()
      .domain([0, d3.max(items, (d) => d.value) || 1])
      .range([0, w - margin.left - margin.right])
      .nice()

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${w} ${height}`)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
    const innerW = w - margin.left - margin.right

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisTop(x)
          .ticks(4)
          .tickSize(-(items.length * (barHeight + 8)))
          .tickFormat(() => '')
      )
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line')
        .attr('stroke', 'currentColor')
        .attr('opacity', 0.08))

    const row = g.selectAll('.row')
      .data(items)
      .join('g')
      .attr('class', 'row')
      .attr('transform', (_, i) => `translate(0, ${i * (barHeight + 8)})`)

    // Background track
    row.append('rect')
      .attr('width', innerW)
      .attr('height', barHeight)
      .attr('rx', 4)
      .attr('fill', 'currentColor')
      .attr('opacity', 0.05)

    // Bar fill
    row.append('rect')
      .attr('height', barHeight)
      .attr('rx', 4)
      .attr('fill', color)
      .attr('opacity', 0.85)
      .attr('width', 0)
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('width', (d) => x(d.value))

    // Label left
    row.append('text')
      .attr('x', -8)
      .attr('y', barHeight / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.8)
      .text((d) => d.label.length > 14 ? d.label.slice(0, 14) + '…' : d.label)

    // Value right
    row.append('text')
      .attr('x', (d) => x(d.value) + 6)
      .attr('y', barHeight / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', color)
      .text((d) => formatValue(d.value))
  }, [data, color, formatValue, maxBars])

  return <div ref={ref} className="w-full" />
}
