'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { StateWithMetrics } from '@/types';

// ── Static mappings ──────────────────────────────────────────────────────────

const NAME_TO_SLUG: Record<string, string> = {
  'Andhra Pradesh':          'andhra-pradesh',
  'Arunachal Pradesh':       'arunachal-pradesh',
  'Assam':                   'assam',
  'Bihar':                   'bihar',
  'Chhattisgarh':            'chhattisgarh',
  'Goa':                     'goa',
  'Gujarat':                 'gujarat',
  'Haryana':                 'haryana',
  'Himachal Pradesh':        'himachal-pradesh',
  'Jharkhand':               'jharkhand',
  'Karnataka':               'karnataka',
  'Kerala':                  'kerala',
  'Madhya Pradesh':          'madhya-pradesh',
  'Maharashtra':             'maharashtra',
  'Manipur':                 'manipur',
  'Meghalaya':               'meghalaya',
  'Mizoram':                 'mizoram',
  'Nagaland':                'nagaland',
  'Orissa':                  'odisha',
  'Punjab':                  'punjab',
  'Rajasthan':               'rajasthan',
  'Sikkim':                  'sikkim',
  'Tamil Nadu':              'tamil-nadu',
  'Tripura':                 'tripura',
  'Uttar Pradesh':           'uttar-pradesh',
  'Uttaranchal':             'uttarakhand',
  'West Bengal':             'west-bengal',
  'Delhi':                   'delhi',
  'Jammu and Kashmir':       'jammu-kashmir',
  'Andaman and Nicobar':     '',
  'Chandigarh':              '',
  'Dadra and Nagar Haveli':  '',
  'Daman and Diu':           '',
  'Lakshadweep':             '',
  'Puducherry':              '',
};

// Standard ISO 3166-2:IN two-letter state codes
const NAME_TO_CODE: Record<string, string> = {
  'Andhra Pradesh':          'AP',
  'Arunachal Pradesh':       'AR',
  'Assam':                   'AS',
  'Bihar':                   'BR',
  'Chhattisgarh':            'CG',
  'Goa':                     'GA',
  'Gujarat':                 'GJ',
  'Haryana':                 'HR',
  'Himachal Pradesh':        'HP',
  'Jharkhand':               'JH',
  'Karnataka':               'KA',
  'Kerala':                  'KL',
  'Madhya Pradesh':          'MP',
  'Maharashtra':             'MH',
  'Manipur':                 'MN',
  'Meghalaya':               'ML',
  'Mizoram':                 'MZ',
  'Nagaland':                'NL',
  'Orissa':                  'OD',
  'Punjab':                  'PB',
  'Rajasthan':               'RJ',
  'Sikkim':                  'SK',
  'Tamil Nadu':              'TN',
  'Tripura':                 'TR',
  'Uttar Pradesh':           'UP',
  'Uttaranchal':             'UK',
  'West Bengal':             'WB',
  'Delhi':                   'DL',
  'Jammu and Kashmir':       'JK',
  'Andaman and Nicobar':     'AN',
  'Chandigarh':              'CH',
  'Dadra and Nagar Haveli':  'DN',
  'Daman and Diu':           'DD',
  'Lakshadweep':             'LD',
  'Puducherry':              'PY',
};

const CHOROPLETH_RANGE = ['#0D0A2A', '#1E1260', '#2A1A7A', '#3D2090', '#5530B0', '#7040C8', '#FF9933'] as const;

export const LAYER_SCALES: Record<string, d3.ScaleThreshold<number, string>> = {
  penetration: d3.scaleThreshold<number, string>().domain([10, 15, 20, 25, 30, 35]).range([...CHOROPLETH_RANGE]),
  settlement:  d3.scaleThreshold<number, string>().domain([65, 70, 75, 80, 85, 90]).range([...CHOROPLETH_RANGE]),
  premium:     d3.scaleThreshold<number, string>().domain([10, 15, 20, 25, 30, 35]).range([...CHOROPLETH_RANGE]),
  claim_ratio: d3.scaleThreshold<number, string>().domain([10, 15, 20, 25, 30, 35]).range([...CHOROPLETH_RANGE]),
};

// ── Types ────────────────────────────────────────────────────────────────────

export type ColorLayer = 'penetration' | 'premium' | 'claim_ratio' | 'settlement';

export interface TooltipState {
  x: number;
  y: number;
  slug: string;
  name: string;
}

export interface IndiaMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
}

interface Props {
  statesData: StateWithMetrics[];
  selectedSlug: string | null;
  colorLayer: ColorLayer;
  onStateSelect: (slug: string) => void;
  onTooltipChange: (t: TooltipState | null) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const LAYER_MAX: Record<ColorLayer, number> = {
  penetration: 100,
  premium:     200000,
  claim_ratio: 100,
  settlement:  100,
};

export function getLayerValue(state: StateWithMetrics, layer: ColorLayer): number {
  const m = state.metrics;
  if (!m) return 0;
  switch (layer) {
    case 'penetration': return m.penetration_pct;
    case 'premium':     return Math.min((m.premium_cr / LAYER_MAX.premium) * 35, 35);
    case 'claim_ratio': return m.claim_ratio_pct;
    case 'settlement':  return m.settlement_ratio_pct;
  }
}

const PADDING = 28;
const BASE_LABEL_SIZE = 9; // px at zoom k=1

// ── Component ────────────────────────────────────────────────────────────────

const IndiaMap = forwardRef<IndiaMapHandle, Props>(function IndiaMap(
  { statesData, selectedSlug, colorLayer, onStateSelect, onTooltipChange },
  ref,
) {
  const svgRef              = useRef<SVGSVGElement>(null);
  const containerRef        = useRef<HTMLDivElement>(null);
  const collectionRef       = useRef<unknown>(null);
  const zoomBehaviorRef     = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const selectedSlugRef     = useRef<string | null>(selectedSlug);
  const onStateSelectRef    = useRef(onStateSelect);
  const colorLayerRef       = useRef<ColorLayer>(colorLayer);
  selectedSlugRef.current   = selectedSlug;
  onStateSelectRef.current  = onStateSelect;
  colorLayerRef.current     = colorLayer;

  // ── Zoom handle exposed to parent ──────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (!svgRef.current || !zoomBehaviorRef.current) return;
      d3.select(svgRef.current)
        .transition().duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.6);
    },
    zoomOut: () => {
      if (!svgRef.current || !zoomBehaviorRef.current) return;
      d3.select(svgRef.current)
        .transition().duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1 / 1.6);
    },
    zoomReset: () => {
      if (!svgRef.current || !zoomBehaviorRef.current) return;
      d3.select(svgRef.current)
        .transition().duration(400)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    },
  }));

  // ── Value lookup ───────────────────────────────────────────────────────────

  const getValueBySlug = useCallback(
    (slug: string) => {
      const s = statesData.find((x) => x.slug === slug);
      return s ? getLayerValue(s, colorLayer) : 0;
    },
    [statesData, colorLayer],
  );

  // ── Full draw (geometry + colours + labels + zoom) ─────────────────────────

  const drawMap = useCallback(
    (collection: unknown, width: number, height: number) => {
      if (!svgRef.current) return;
      const svg = d3.select(svgRef.current);

      svg.attr('width', width).attr('height', height);

      // Remove previous content
      svg.selectAll('*').remove();

      // Projection auto-fits entire India to the container
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projection = d3.geoMercator().fitExtent(
        [[PADDING, PADDING], [width - PADDING, height - PADDING]],
        collection as d3.GeoPermissibleObjects,
      );
      const path = d3.geoPath(projection);

      // <g> wrapper — zoom transforms this element
      const g = svg.append('g').attr('class', 'map-g');

      // ── Paths ──────────────────────────────────────────────────────────────
      g.selectAll<SVGPathElement, unknown>('.state-path')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .data((collection as any).features)
        .join('path')
        .attr('class', 'state-path')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr('d', path as any)
        .each(function (d: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const name: string = (d as any).properties?.name ?? '';
          const slug = NAME_TO_SLUG[name] ?? '';
          (this as SVGPathElement).dataset.slug = slug;
          (this as SVGPathElement).dataset.name = name;
        })
        .attr('fill', function () {
          const slug = (this as SVGPathElement).dataset.slug ?? '';
          return slug ? LAYER_SCALES[colorLayerRef.current](getValueBySlug(slug)) : '#0A0818';
        })
        .attr('stroke', function () {
          const slug = (this as SVGPathElement).dataset.slug ?? '';
          return slug === selectedSlugRef.current
            ? 'rgba(255,153,51,0.90)'
            : 'rgba(255,153,51,0.18)';
        })
        .attr('stroke-width', function () {
          const slug = (this as SVGPathElement).dataset.slug ?? '';
          return slug === selectedSlugRef.current ? 2 : 0.4;
        })
        .attr('cursor', function () {
          return (this as SVGPathElement).dataset.slug ? 'pointer' : 'default';
        })
        .attr('tabIndex', function () {
          return (this as SVGPathElement).dataset.slug ? '0' : '-1';
        })
        .attr('aria-label', function () {
          const slug = (this as SVGPathElement).dataset.slug ?? '';
          const name = (this as SVGPathElement).dataset.name ?? '';
          return slug ? `${name} — ${getValueBySlug(slug).toFixed(1)}%` : name;
        })
        .on('mouseover', function (event) {
          const slug = (this as SVGPathElement).dataset.slug ?? '';
          if (!slug) return;
          d3.select(this)
            .raise()
            .transition().duration(80)
            .attr('stroke', 'rgba(255,153,51,0.75)')
            .attr('stroke-width', 1.5)
            .style('filter', 'brightness(1.3)');
          const [mx, my] = d3.pointer(event, svgRef.current);
          onTooltipChange({ x: mx, y: my, slug, name: (this as SVGPathElement).dataset.name ?? '' });
        })
        .on('mousemove', function (event) {
          const slug = (this as SVGPathElement).dataset.slug ?? '';
          if (!slug) return;
          const [mx, my] = d3.pointer(event, svgRef.current);
          onTooltipChange({ x: mx, y: my, slug, name: (this as SVGPathElement).dataset.name ?? '' });
        })
        .on('mouseout', function () {
          const slug = (this as SVGPathElement).dataset.slug ?? '';
          const isSelected = slug === selectedSlugRef.current;
          d3.select(this)
            .transition().duration(80)
            .attr('stroke', isSelected ? 'rgba(255,153,51,0.90)' : 'rgba(255,153,51,0.18)')
            .attr('stroke-width', isSelected ? 2 : 0.4)
            .style('filter', 'brightness(1)');
          onTooltipChange(null);
        })
        .on('click', function () {
          const slug = (this as SVGPathElement).dataset.slug ?? '';
          if (slug) onStateSelectRef.current(slug);
        })
        .on('keydown', function (event: KeyboardEvent) {
          const slug = (this as SVGPathElement).dataset.slug ?? '';
          if (!slug) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onStateSelectRef.current(slug);
          }
        });

      // ── State code labels ──────────────────────────────────────────────────
      g.selectAll<SVGTextElement, unknown>('.state-label')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .data((collection as any).features.filter((f: any) => NAME_TO_CODE[f.properties?.name]))
        .join('text')
        .attr('class', 'state-label')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr('x', (d: any) => path.centroid(d)[0])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr('y', (d: any) => path.centroid(d)[1])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .text((d: any) => NAME_TO_CODE[d.properties?.name] ?? '')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', 'rgba(255,255,255,0.55)')
        .attr('font-size', `${BASE_LABEL_SIZE}px`)
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '500')
        .attr('letter-spacing', '0.5px')
        .attr('pointer-events', 'none')
        .attr('user-select', 'none');

      // ── Zoom behaviour ─────────────────────────────────────────────────────
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 10])
        .translateExtent([[0, 0], [width, height]])
        // Disable wheel zoom — user controls zoom via buttons
        .filter((event) => {
          if (event.type === 'wheel') return false;
          return !event.button;
        })
        .on('zoom', (event) => {
          const k = event.transform.k;
          g.attr('transform', event.transform);
          // Keep labels visually constant size across zoom levels
          g.selectAll('.state-label').attr('font-size', `${BASE_LABEL_SIZE / k}px`);
        });

      zoomBehaviorRef.current = zoomBehavior;
      d3.select(svgRef.current).call(zoomBehavior);
    },
    [getValueBySlug, onStateSelect, onTooltipChange],
  );

  // ── Mount: fetch + draw + ResizeObserver ───────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let ro: ResizeObserver | null = null;

    const init = (topology: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topo = topology as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const collection = topojson.feature(topo, topo.objects.ind) as any;
      collectionRef.current = collection;

      const { width, height } = container.getBoundingClientRect();
      drawMap(collection, width, height);

      ro = new ResizeObserver((entries) => {
        const { width: w, height: h } = entries[0].contentRect;
        if (w > 0 && h > 0) drawMap(collectionRef.current, w, h);
      });
      ro.observe(container);
    };

    if (collectionRef.current) {
      const { width, height } = container.getBoundingClientRect();
      drawMap(collectionRef.current, width, height);
    } else {
      d3.json('/india-states.json').then(init).catch(console.error);
    }

    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Debug: verify penetration data flow ───────────────────────────────────

  useEffect(() => {
    console.log('[IndiaMap] statesData first 3:', statesData.slice(0, 3).map(s => ({
      slug: s.slug,
      penetration_pct: s.metrics?.penetration_pct,
    })));
  }, [statesData]);

  // ── Re-colour on data / layer change ──────────────────────────────────────

  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll<SVGPathElement, unknown>('.state-path')
      .transition().duration(400).ease(d3.easeQuadInOut)
      .attr('fill', function () {
        const slug = (this as SVGPathElement).dataset.slug ?? '';
        return slug ? LAYER_SCALES[colorLayer](getValueBySlug(slug)) : '#0A0818';
      });
  }, [getValueBySlug, colorLayer]);

  // ── Update selected stroke ─────────────────────────────────────────────────

  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll<SVGPathElement, unknown>('.state-path')
      .attr('stroke', function () {
        const slug = (this as SVGPathElement).dataset.slug ?? '';
        return slug === selectedSlug ? 'rgba(255,153,51,0.90)' : 'rgba(255,153,51,0.18)';
      })
      .attr('stroke-width', function () {
        const slug = (this as SVGPathElement).dataset.slug ?? '';
        return slug === selectedSlug ? 2 : 0.4;
      });
  }, [selectedSlug]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-label="Interactive India insurance map"
        role="img"
      />
    </div>
  );
});

export default IndiaMap;
