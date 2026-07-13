import os from "node:os";

export interface SystemMetrics {
  uptime: number;
  memory: {
    free: number;
    total: number;
    usagePercent: number;
    process: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
  };
  cpu: {
    cores: number;
    loadAverage: number[];
    models: string;
  };
}

export function getSystemMetrics(): SystemMetrics {
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const processMemory = process.memoryUsage();

  return {
    uptime: process.uptime(),
    memory: {
      free: freeMem,
      total: totalMem,
      usagePercent: Number(((totalMem - freeMem) / totalMem * 100).toFixed(2)),
      process: {
        rss: processMemory.rss,
        heapTotal: processMemory.heapTotal,
        heapUsed: processMemory.heapUsed,
        external: processMemory.external,
      },
    },
    cpu: {
      cores: os.cpus().length,
      loadAverage: os.loadavg(), // yields [1, 5, 15] minute load averages
      models: os.cpus()[0]?.model || "Unknown",
    },
  };
}

export default getSystemMetrics;
