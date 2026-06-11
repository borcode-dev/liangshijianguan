'use client';

import { useEffect, useState } from 'react';

type ChartComponentType = 'Pie' | 'Bar' | 'Line' | 'Doughnut';

interface ChartModule {
  Pie: any;
  Bar: any;
  Line: any;
  Doughnut: any;
}

let chartModules: ChartModule | null = null;
let chartPromise: Promise<ChartModule> | null = null;

async function loadChartModules(): Promise<ChartModule> {
  if (chartModules) return chartModules;
  if (chartPromise) return chartPromise;

  chartPromise = (async () => {
    const [chartJs, reactChartjs2] = await Promise.all([
      import('chart.js'),
      import('react-chartjs-2'),
    ]);

    const {
      Chart,
      ArcElement,
      BarElement,
      LineElement,
      PointElement,
      CategoryScale,
      LinearScale,
      Filler,
      Tooltip,
      Legend,
      Title,
    } = chartJs;

    Chart.register(
      ArcElement,
      BarElement,
      LineElement,
      PointElement,
      CategoryScale,
      LinearScale,
      Filler,
      Tooltip,
      Legend,
      Title,
    );

    chartModules = {
      Pie: reactChartjs2.Pie,
      Bar: reactChartjs2.Bar,
      Line: reactChartjs2.Line,
      Doughnut: reactChartjs2.Doughnut,
    };

    return chartModules;
  })();

  return chartPromise;
}

export function useChartComponent(type: ChartComponentType) {
  const [Component, setComponent] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    loadChartModules().then((mods) => {
      if (mounted) setComponent(mods[type]);
    });
    return () => {
      mounted = false;
    };
  }, [type]);

  return Component;
}

export function ChartPie(props: any) {
  const Pie = useChartComponent('Pie');
  if (!Pie) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        图表加载中...
      </div>
    );
  }
  return <Pie {...props} />;
}

export function ChartBar(props: any) {
  const Bar = useChartComponent('Bar');
  if (!Bar) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        图表加载中...
      </div>
    );
  }
  return <Bar {...props} />;
}

export function ChartLine(props: any) {
  const Line = useChartComponent('Line');
  if (!Line) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        图表加载中...
      </div>
    );
  }
  return <Line {...props} />;
}

export function ChartDoughnut(props: any) {
  const Doughnut = useChartComponent('Doughnut');
  if (!Doughnut) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        图表加载中...
      </div>
    );
  }
  return <Doughnut {...props} />;
}
