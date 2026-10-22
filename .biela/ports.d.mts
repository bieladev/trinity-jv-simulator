/**
 * Biela Enterprise — types for ./ports.mjs. Managed by the platform; do not edit.
 */
export interface BielaPorts {
  /** Front-end dev-server port for this tree. */
  web: number;
  /** This tree's own API port — unique per tree, never shared. */
  api: number;
  /** `http://127.0.0.1:<web>` */
  webUrl: string;
  /** `http://127.0.0.1:<api>` — use as a vite proxy target. */
  apiUrl: string;
  /** Every service resolved: the ones with defaults plus any the manifest adds. */
  services: Record<string, number>;
  /** `http://127.0.0.1:<port>` per service. */
  urls: Record<string, string>;
  /** Where each value came from, for debugging. */
  sources: Record<string, 'manifest' | 'env' | 'default'>;
}

export declare function readPorts(): BielaPorts;
export default readPorts;
