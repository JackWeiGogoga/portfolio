export type RuntimeArea = {
  id: string;
  name: string;
  stored: string;
  ownership: string;
  notes: string[];
  scopeTag: string;
};

export type DetailTab = {
  id: string;
  label: string;
  items?: string[];
  diagram?: string[];
};

export type PageTab = {
  id: string;
  label: string;
  description?: string;
};

export type ClassLoadingStep = {
  id: string;
  title: string;
  summary: string;
  items: string[];
};

export type DelegationDemoLoader = {
  id: string;
  title: string;
  desc: string;
};

export type DelegationDemoStep = {
  loaderId: string;
  direction: "up" | "down" | "load";
  action: string;
  result: string;
};

export type DelegationDemoScenario = {
  id: string;
  label: string;
  className: string;
  desc: string;
  steps: DelegationDemoStep[];
};

export type ClassFileInfo = {
  table: {
    headers: string[];
    rows: string[][];
  };
  constantPool: string[];
};

export type ResolutionInfo = {
  constantTypes: string[];
  deferred: string[];
  note?: string;
};

export type GcSection = {
  id: string;
  title: string;
  items: string[];
};

export type GcDetail = {
  title: string;
  summary: string;
  items: string[];
  legend?: { label: string; color: string }[];
};

export type RuntimeAreaDetail = {
  summary: string;
  tabs: DetailTab[];
};
