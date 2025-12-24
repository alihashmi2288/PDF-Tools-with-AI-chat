export interface FontDefinition {
    name: string;
    value: string;
    type: 'standard' | 'custom';
    regularUrl?: string;
    boldUrl?: string;
    italicUrl?: string;
    boldItalicUrl?: string;
}

export const AVAILABLE_FONTS: FontDefinition[] = [
    // Standard PDF fonts
    {
        name: 'Helvetica',
        value: 'Helvetica',
        type: 'standard'
    },
    {
        name: 'Times Roman',
        value: 'Times-Roman',
        type: 'standard'
    },
    {
        name: 'Courier',
        value: 'Courier',
        type: 'standard'
    },
    // Google Fonts
    {
        name: 'Open Sans',
        value: 'Open Sans',
        type: 'custom',
        regularUrl: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.woff2',
        boldUrl: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1x4gaVc.woff2',
        italicUrl: 'https://fonts.gstatic.com/s/opensans/v40/memQYaGs126MiZpBA-UFUIcVXSCEkx2cmqvXlWq8tWZ0Pw86hd0Rk8ZkWVAexQ.woff2',
        boldItalicUrl: 'https://fonts.gstatic.com/s/opensans/v40/memQYaGs126MiZpBA-UFUIcVXSCEkx2cmqvXlWq8tWZ0Pw86hd0RkxZkWVAexQ.woff2'
    },
    {
        name: 'Roboto',
        value: 'Roboto',
        type: 'custom',
        regularUrl: 'https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
        boldUrl: 'https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2',
        italicUrl: 'https://fonts.gstatic.com/s/roboto/v32/KFOkCnqEu92Fr1Mu51xIIzIXKMny.woff2',
        boldItalicUrl: 'https://fonts.gstatic.com/s/roboto/v32/KFOiCnqEu92Fr1Mu51xIIzc-1w.woff2'
    }
];