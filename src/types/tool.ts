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
    description?: string;
    category: ToolCategory;
    template: string;
    icon: string;
    isNew?: boolean;
    editor?: EditorConfig[];
}

interface EditorConfig {
    id: string;
    label: string;
    language?: string;
    readOnly?: boolean;
    content?: string;
    placeholder?: string;
}