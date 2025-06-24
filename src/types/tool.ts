export enum ToolCategory {
    Text = "Text",
    Data = "Data",
    Encode = "Encode / Decode",
    Design = "UI Design",
    Util = "Utility",
    Cryptography = "Cryptography",
    Productivity = "Productivity",
}

export interface Tool {
    id: string;
    label: string;
    version?: string;
    category: ToolCategory;
    template: string;
    icon: string;
    isNew?: boolean;
    editor?: {
        viewType: 'code' | 'simple';
        editorLogicPath?: string;
    };
}