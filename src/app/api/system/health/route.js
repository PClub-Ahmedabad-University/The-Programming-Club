import { NextRequest, NextResponse } from "next/server";
import os from "os";

function bytesToGB(bytes) {
  return (bytes / (1024 ** 3)).toFixed(2) + " GB";
}

function bytesToMB(bytes) {
  return (bytes / (1024 ** 2)).toFixed(2) + " MB";
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export const GET = async (req) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const loadAverage = os.loadavg();
    const platform = process.platform;
    const nodeVersion = process.version;
    const cpuInfo = os.cpus();
    const cpuCount = cpuInfo.length;
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const hostname = os.hostname();
    const networkInterfaces = os.networkInterfaces();
    const arch = os.arch();
    const release = os.release();

    return NextResponse.json({
      status: "OK",
      message: "System is healthy",
      timestamp: new Date().toISOString(),

      system: {
        hostname,
        platform,
        arch,
        osRelease: release,
        uptime: {
          seconds: uptime,
          formatted: formatUptime(uptime),
        },
        loadAverage: {
          "1min": loadAverage[0],
          "5min": loadAverage[1],
          "15min": loadAverage[2],
        },
        cpu: {
          count: cpuCount,
          details: cpuInfo.map((cpu, i) => ({
            id: i,
            model: cpu.model,
            speedMHz: cpu.speed,
          })),
        },
      },

      memory: {
        total: {
          bytes: totalMemory,
          readable: bytesToGB(totalMemory),
        },
        free: {
          bytes: freeMemory,
          readable: bytesToGB(freeMemory),
        },
        used: {
          bytes: totalMemory - freeMemory,
          readable: bytesToGB(totalMemory - freeMemory),
        },
        processUsage: {
          rss: {
            bytes: memoryUsage.rss,
            readable: bytesToMB(memoryUsage.rss),
          },
          heapTotal: {
            bytes: memoryUsage.heapTotal,
            readable: bytesToMB(memoryUsage.heapTotal),
          },
          heapUsed: {
            bytes: memoryUsage.heapUsed,
            readable: bytesToMB(memoryUsage.heapUsed),
          },
          external: {
            bytes: memoryUsage.external,
            readable: bytesToMB(memoryUsage.external),
          },
          arrayBuffers: {
            bytes: memoryUsage.arrayBuffers,
            readable: bytesToMB(memoryUsage.arrayBuffers),
          },
        },
      },

      environment: {
        nodeVersion,
        environment: process.env.NODE_ENV,
        pid: process.pid,
        title: process.title,
        execPath: process.execPath,
        cwd: process.cwd(),
      },

      network: {
        interfaces: networkInterfaces,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Health check failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};
