interface VsCodeApi {
  postMessage(message: any): void;
  getState(): any;
  setState(newState: any): void;
}

interface ToolLogic {
  [action: string]: (...args: any[]) => void;
}

declare global {
  // Declare the Monaco editor instances that are created in the main script.
  const inputEditor: any;
  const outputEditor: any;

  // Declare the vscode object provided by acquireVsCodeApi().
  const vscode: VsCodeApi;

  // Add our custom toolLogic object to the global window interface.
  interface Window {
    toolLogic: ToolLogic;
  }
}

export {};