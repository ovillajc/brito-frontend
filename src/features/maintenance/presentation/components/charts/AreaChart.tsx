'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export interface AreaPoint {
  date: string
  value: number
}

interface AreaChartProps {
  data: AreaPoint[]
  color?: string
  formatValue?: (v: number) => string
}

export function AreaChart({ data, color = '#4ae183', formatValue = (v) => v.toLocaleString('es-MX') }: AreaChartProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !data?.length) return
    const container = ref.current
    d3.select(container).selectAll('svg').remove()

    const margin = { top: 16, right: 24, bottom: 32, left: 64 }
    const w = container.clientWidth || 480
    const h = 200

    const parsed = data.map((d) => ({ ...d, date: new Date(d.date + '-01') }))

    const x = d3.scaleTime()
      .domain(d3.extent(parsed, (d) => d.date) as [Date, Date])
      .range([0, w - margin.left - margin.right])

    const y = d3.scaleLinear()
      .domain([0, (d3.max(parsed, (d) => d.value) || 1) * 1.15])
      .range([h - margin.top - margin.bottom, 0])
      .nice()

    const innerW = w - margin.left - margin.right
    const innerH = h - margin.top - margin.bottom

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', h)
      .attr('viewBox', `0 0 ${w} ${h}`)

    const defs = svg.append('defs')
    const grad = defs.append('linearGradient')
      .attr('id', `area-grad-${color.replace('#', '')}`)
      .attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1')
    grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.4)
    grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.02)

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Grid
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat(() => ''))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line')
        .attr('stroke', 'currentColor').attr('opacity', 0.07))

    // Area
    const area = d3.area<typeof parsed[0]>()
      .x((d) => x(d.date))
      .y0(innerH)
      .y1((d) => y(d.value))
      .curve(d3.curveCatmullRom)

    const line = d3.line<typeof parsed[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveCatmullRom)

    g.append('path')
      .datum(parsed)
      .attr('fill', `url(#area-grad-${color.replace('#', '')})`)
      .attr('d', area)

    g.append('path')
      .datum(parsed)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2.5)
      .attr('d', line)

    // Dots
    const tooltip = d3.select(container)
      .selectAll('.d3-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(26,31,43,0.95)')
      .style('color', '#e4e8f0')
      .style('padding', '6px 10px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '100')
      .style('white-space', 'nowrap')

    g.selectAll('circle')
      .data(parsed)
      .join('circle')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.value))
      .attr('r', 4)
      .attr('fill', color)
      .attr('stroke', 'var(--color-surface)')
      .attr('stroke-width', 2)
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('r', 6)
        const [mx, my] = d3.pointer(event, container)
        tooltip
          .style('opacity', 1)
          .style('left', `${mx + 10}px`)
          .style('top', `${my - 28}px`)
          .html(`<span style="font-weight:600">${d.date.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}</span><br/>${formatValue(d.value)}`)
      })
      .on('mouseleave', function () {
        d3.select(this).attr('r', 4)
        tooltip.style('opacity', 0)
      })

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat((d) =>
        d3.timeFormat('%b')(d as Date)
      ))
      .call((g) => g.select('.domain').attr('stroke', 'currentColor').attr('opacity', 0.15))
      .call((g) => g.selectAll('.tick line').remove())
      .call((g) => g.selectAll('text').attr('fill', 'currentColor').attr('opacity', 0.5).attr('font-size', '11px'))

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat((v) => {
        const n = v as number
        return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
      }))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').remove())
      .call((g) => g.selectAll('text').attr('fill', 'currentColor').attr('opacity', 0.5).attr('font-size', '11px'))
  }, [data, color, formatValue])

  return <div ref={ref} className="w-full relative" />
}
