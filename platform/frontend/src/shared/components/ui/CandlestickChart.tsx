'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Dynamically import react-apexcharts to avoid SSR 'window is not defined' issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface CandlestickData {
    time: number | string; // Unix timestamp in milliseconds or seconds, or string date
    open: number;
    high: number;
    low: number;
    close: number;
}

export function CandlestickChart({
    data,
    height = 300,
}: {
    data: CandlestickData[];
    height?: number;
}) {
    // ApexCharts expects data in the format: { x: Date|string|number, y: [Open, High, Low, Close] }
    const seriesData = (data || []).map(d => {
        // Handle both seconds and milliseconds timestamps
        let ts = typeof d.time === 'number' ? (d.time < 10000000000 ? d.time * 1000 : d.time) : new Date(d.time).getTime();
        return {
            x: ts,
            y: [d.open, d.high, d.low, d.close]
        };
    });

    const options: ApexOptions = {
        chart: {
            type: 'candlestick',
            background: 'transparent',
            toolbar: { show: false },
            animations: { enabled: false }, 
            parentHeightOffset: 0,
        },
        theme: {
            mode: 'dark',
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#10b981',
                    downward: '#ef4444'
                },
                wick: {
                    useFillColor: true
                }
            }
        },
        grid: {
            borderColor: 'rgba(255,255,255,0.06)',
            strokeDashArray: 3,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: { colors: '#5b6472', fontSize: '11px' },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            tooltip: { enabled: true },
            labels: {
                style: { colors: '#5b6472', fontSize: '11px' },
                formatter: (value) => value ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : '',
            },
        },
        tooltip: {
            theme: 'dark',
            custom: function({ seriesIndex, dataPointIndex, w }: any) {
                const data = w.globals.initialSeries[seriesIndex]?.data?.[dataPointIndex];
                if (!data) return '';
                const [open, high, low, close] = data.y;
                const date = new Date(data.x);
                const dateStr = date.toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                }) + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                const fmt = (n: number) => n != null ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
                const isUp = close >= open;
                const color = isUp ? '#10b981' : '#ef4444';
                return `
                    <div style="background:#0d1520;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 14px;font-size:12px;color:#e2e8f0;min-width:160px">
                        <div style="color:#5b6472;margin-bottom:6px;font-size:11px">${dateStr}</div>
                        <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:2px"><span style="color:#5b6472">O</span><span style="color:${color};font-weight:700">${fmt(open)}</span></div>
                        <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:2px"><span style="color:#5b6472">H</span><span style="color:#10b981;font-weight:700">${fmt(high)}</span></div>
                        <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:2px"><span style="color:#5b6472">L</span><span style="color:#ef4444;font-weight:700">${fmt(low)}</span></div>
                        <div style="display:flex;justify-content:space-between;gap:16px"><span style="color:#5b6472">C</span><span style="color:${color};font-weight:700">${fmt(close)}</span></div>
                    </div>
                `;
            }
        }
    };

    if (!data || data.length === 0) {
        return (
            <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                    <span className="animate-pulse h-2 w-2 rounded-full bg-primary inline-block"></span>
                    Loading chart...
                </span>
            </div>
        );
    }

    return (
        <div style={{ background: '#0d1520', borderRadius: 16, overflow: 'hidden', padding: '8px 4px 4px' }}>
            <div style={{ width: '100%', height: `${height}px` }}>
                <Chart options={options} series={[{ data: seriesData }]} type="candlestick" height="100%" width="100%" />
            </div>
        </div>
    );
}
