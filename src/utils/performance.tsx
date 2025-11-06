/**
 * Performance Monitoring Utility
 * Tracks app performance metrics and provides optimization insights
 */

import { Platform } from 'react-native';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
  timestamp: number;
}

interface RenderMetrics {
  componentName: string;
  startTime: number;
  endTime?: number;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private renderMetrics: Map<string, RenderMetrics> = new Map();
  private isMonitoring = false;
  private maxMetrics = 500; // Reduced from 1000 to 500 for better memory usage

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    this.isMonitoring = true;
    console.log('🚀 Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Measure component render time
   */
  public measureRender(componentName: string): () => void {
    if (!this.isMonitoring) return () => {};

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      this.recordRenderMetric(componentName, renderTime);
      this.addMetric({
        renderTime,
        componentName,
        timestamp: Date.now(),
      });

      // Warn if render takes too long
      if (renderTime > 16) {
        // > 60fps threshold
        console.warn(
          `🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(
            2,
          )}ms`,
        );
      }
    };
  }

  /**
   * Record render metric for averaging
   */
  private recordRenderMetric(componentName: string, renderTime: number): void {
    const existing = this.renderMetrics.get(componentName);

    if (existing) {
      existing.renderCount++;
      existing.totalRenderTime += renderTime;
      existing.averageRenderTime =
        existing.totalRenderTime / existing.renderCount;
    } else {
      this.renderMetrics.set(componentName, {
        componentName,
        startTime: 0,
        endTime: 0,
        renderCount: 1,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime,
      });
    }
  }

  /**
   * Add performance metric
   */
  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get performance report
   */
  public getPerformanceReport(): {
    summary: any;
    slowComponents: any[];
    recommendations: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        summary: { totalRenders: 0, averageRenderTime: 0 },
        slowComponents: [],
        recommendations: ['Start monitoring to see performance data'],
      };
    }

    const totalRenders = this.metrics.length;
    const totalRenderTime = this.metrics.reduce(
      (sum, m) => sum + m.renderTime,
      0,
    );
    const averageRenderTime = totalRenderTime / totalRenders;

    // Find slow components
    const componentStats = Array.from(this.renderMetrics.entries()).map(
      ([name, stats]) => ({
        name,
        renderCount: stats.renderCount,
        totalRenderTime: stats.totalRenderTime,
        averageRenderTime: stats.averageRenderTime,
      }),
    );

    const slowComponents = componentStats
      .filter(c => c.averageRenderTime > 16)
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, 5);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      componentStats,
      averageRenderTime,
    );

    return {
      summary: {
        totalRenders,
        averageRenderTime: averageRenderTime.toFixed(2),
        slowestRender: Math.max(...this.metrics.map(m => m.renderTime)).toFixed(
          2,
        ),
        fastestRender: Math.min(...this.metrics.map(m => m.renderTime)).toFixed(
          2,
        ),
      },
      slowComponents,
      recommendations,
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    componentStats: any[],
    averageRenderTime: number,
  ): string[] {
    const recommendations: string[] = [];

    if (averageRenderTime > 16) {
      recommendations.push('⚠️ Average render time is above 60fps threshold');
    }

    const slowComponents = componentStats.filter(c => c.averageRenderTime > 16);
    if (slowComponents.length > 0) {
      recommendations.push(
        `🐌 ${slowComponents.length} components have slow renders`,
      );
      recommendations.push('💡 Consider using React.memo for slow components');
      recommendations.push('💡 Implement useMemo for expensive calculations');
    }

    const highFrequencyComponents = componentStats.filter(
      c => c.renderCount > 100,
    );
    if (highFrequencyComponents.length > 0) {
      recommendations.push(
        `🔄 ${highFrequencyComponents.length} components render frequently`,
      );
      recommendations.push(
        '💡 Consider optimizing re-renders with useCallback',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance looks good!');
    }

    return recommendations;
  }

  /**
   * Log performance report to console
   */
  public logPerformanceReport(): void {
    const report = this.getPerformanceReport();

    console.group('📊 Performance Report');
    console.log('📈 Summary:', report.summary);

    if (report.slowComponents.length > 0) {
      console.log('🐌 Slow Components:', report.slowComponents);
    }

    console.log('💡 Recommendations:', report.recommendations);
    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.renderMetrics.clear();
    console.log('🧹 Performance metrics cleared');
  }

  /**
   * Get memory usage (if available)
   */
  public async getMemoryUsage(): Promise<any> {
    if (Platform.OS === 'web') {
      return {
        used: (performance as any).memory?.usedJSHeapSize || 0,
        total: (performance as any).memory?.totalJSHeapSize || 0,
        limit: (performance as any).memory?.jsHeapSizeLimit || 0,
      };
    }

    // React Native doesn't provide direct memory access
    // This would require native modules or third-party libraries
    return {
      used: 0,
      total: 0,
      limit: 0,
      note: 'Memory monitoring not available on React Native',
    };
  }

  /**
   * Monitor component with HOC
   */
  public withPerformanceMonitoring<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName?: string,
  ): React.ComponentType<P> {
    const name =
      componentName ||
      WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Unknown';

    return function PerformanceWrappedComponent(props: P) {
      const endMeasure = PerformanceMonitor.getInstance().measureRender(name);

      React.useEffect(() => {
        endMeasure();
      });

      return <WrappedComponent {...props} />;
    };
  }
}

/**
 * Hook for performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    const endMeasure = monitor.measureRender(componentName);
    return endMeasure;
  }, [componentName, monitor]);
}

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string,
) {
  return PerformanceMonitor.getInstance().withPerformanceMonitoring(
    WrappedComponent,
    componentName,
  );
}

// Export singleton instance
export default PerformanceMonitor.getInstance();
