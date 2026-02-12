/* eslint-disable @typescript-eslint/no-explicit-any */

export interface StrapiAdapter {
  log: {
    info(msg: string, ...args: any[]): void;
    warn(msg: string, ...args: any[]): void;
    error(msg: string, ...args: any[]): void;
  };
  db: {
    query(uid: string): {
      findOne(params: any): Promise<any>;
      findMany(params?: any): Promise<any[]>;
    };
  };
  getModel(uid: string): { info: { displayName: string } };
  fetchContext?(uid: string, documentId: string): Promise<any>;
}

export interface LLMCoreConfig {
  contentTypes: {
    prompt: string;
    zone: string;
    entity: string;
    item: string;
    blueprint?: string;
    // Add others if needed
  };
}
