export enum ToolCategory {
    Text = "Text",
    Data = "Data",
    Encode = "Encode / Decode",
    Datetime = "Date & Time",
    Asset = "Asset",
    Utils = "Utilities",
    Cryptography = "Cryptography",
    Productivity = "Productivity",
    Misc = "Misc"
}

export interface Tool {
    id: string;
    label: string;
    description?: string;
    category: ToolCategory;
    template: string;
}