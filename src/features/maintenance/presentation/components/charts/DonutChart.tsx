'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export interface DonutSlice {
  label: string
  value: number
}

interface DonutChartProps {
  data: DonutSlice[]
  colors?: string[]
  size?: number
  innerRadius?: number
}

const DEFAULT_COLORS = ['#4ae183', '#fc8f34', '#ffb59d', '#008001', '#663100', '#2ecc71']

export function DonutChart({ data, colors = DEFAULT_COLORS, size = 220, innerRadius = 70 }: DonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data?.length) return
    const el = svgRef.current
    d3.select(el).selectAll('*').remove()

    const radius = size / 2
    const pie = d3.pie<DonutSlice>().value((d) => d.value).sort(null)
    const arc = d3.arc<d3.PieArcDatum<DonutSlice>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 10)
      .cornerRadius(4)
      .padAngle(0.03)

    const arcHover = d3.arc<d3.PieArcDatum<DonutSlice>>()
      .innerRadius(innerRadius - 4)
      .outerRadius(radius - 6)
      .cornerRadius(4)
      .padAngle(0.03)

    const svg = d3.select(el)
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('width', size)
      .attr('height', size)
      .append('g')
      .attr('transform', `translate(${radius},${radius})`)

    const total = d3.sum(data, (d) => d.value)

    const slices = svg.selectAll('path')
      .data(pie(data))
      .join('path')
      .attr('d', arc)
      .attr('fill', (_, i) => colors[i % colors.length])
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .style('transition', 'opacity 0.2s')

    slices
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('d', arcHover(d) as string).attr('opacity', 1)
        // show tooltip
        tooltip
          .style('opacity', 1)
          .html(`<span style="font-weight:600">${d.data.label}</span><br/>${d.data.value.toLocaleString('es-MX')} (${((d.data.value / total) * 100).toFixed(1)}%)`)
      })
      .on('mousemove', function (event) {
        const [mx, my] = d3.pointer(event, el)
        tooltip.style('left', `${mx + 10}px`).style('top', `${my - 28}px`)
      })
      .on('mouseleave', function (event, d) {
        d3.select(this).attr('d', arc(d) as string).attr('opacity', 0.9)
        tooltip.style('opacity', 0)
      })

    // Center text
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('font-size', '13px')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6)
      .text('Total')

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', '18px')
      .attr('font-weight', '700')
      .attr('fill', 'currentColor')
      .text(total.toLocaleString('es-MX'))

    // Tooltip div
    const tooltip = d3.select(el.parentElement!)
      .selectAll('.d3-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(26, 31, 43, 0.95)')
      .style('color', '#e4e8f0')
      .style('padding', '6px 10px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '100')
      .style('white-space', 'nowrap')
  }, [data, colors, size, innerRadius])

  return <svg ref={svgRef} />
}
