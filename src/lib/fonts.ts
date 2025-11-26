export interface FontDefinition {
    name: string;
    value: string; // CSS font-family value
    type: 'standard' | 'custom';
    regularUrl?: string;
    boldUrl?: string;
    italicUrl?: string;
    boldItalicUrl?: string;
}

const GOOGLE_FONTS_BASE = "https://cdn.jsdelivr.net/gh/google/fonts/ofl";

export const AVAILABLE_FONTS: FontDefinition[] = [
    // Standard Fonts (Built-in to PDF)
    { name: 'Helvetica', value: 'Helvetica', type: 'standard' },
    { name: 'Times New Roman', value: 'Times-Roman', type: 'standard' },
    { name: 'Courier', value: 'Courier', type: 'standard' },

    // Custom Google Fonts
    {
        name: 'Roboto',
        value: 'Roboto',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/roboto/Roboto-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/roboto/Roboto-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/roboto/Roboto-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/roboto/Roboto-BoldItalic.ttf`
    },
    {
        name: 'Open Sans',
        value: 'Open Sans',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/opensans/static/OpenSans-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/opensans/static/OpenSans-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/opensans/static/OpenSans-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/opensans/static/OpenSans-BoldItalic.ttf`
    },
    {
        name: 'Lato',
        value: 'Lato',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/lato/Lato-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/lato/Lato-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/lato/Lato-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/lato/Lato-BoldItalic.ttf`
    },
    {
        name: 'Montserrat',
        value: 'Montserrat',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/montserrat/static/Montserrat-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/montserrat/static/Montserrat-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/montserrat/static/Montserrat-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/montserrat/static/Montserrat-BoldItalic.ttf`
    },
    {
        name: 'Oswald',
        value: 'Oswald',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/oswald/static/Oswald-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/oswald/static/Oswald-Bold.ttf`,
        // Oswald is largely a display font, might not have italic
        italicUrl: `${GOOGLE_FONTS_BASE}/oswald/static/Oswald-Regular.ttf`, // Fallback
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/oswald/static/Oswald-Bold.ttf` // Fallback
    },
    {
        name: 'Raleway',
        value: 'Raleway',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/raleway/static/Raleway-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/raleway/static/Raleway-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/raleway/static/Raleway-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/raleway/static/Raleway-BoldItalic.ttf`
    },
    {
        name: 'Merriweather',
        value: 'Merriweather',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/merriweather/Merriweather-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/merriweather/Merriweather-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/merriweather/Merriweather-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/merriweather/Merriweather-BoldItalic.ttf`
    },
    {
        name: 'Noto Sans',
        value: 'Noto Sans',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/notosans/NotoSans-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/notosans/NotoSans-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/notosans/NotoSans-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/notosans/NotoSans-BoldItalic.ttf`
    },
    {
        name: 'Nunito',
        value: 'Nunito',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/nunito/static/Nunito-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/nunito/static/Nunito-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/nunito/static/Nunito-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/nunito/static/Nunito-BoldItalic.ttf`
    },
    {
        name: 'Playfair Display',
        value: 'Playfair Display',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/playfairdisplay/static/PlayfairDisplay-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/playfairdisplay/static/PlayfairDisplay-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/playfairdisplay/static/PlayfairDisplay-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/playfairdisplay/static/PlayfairDisplay-BoldItalic.ttf`
    },
    {
        name: 'Ubuntu',
        value: 'Ubuntu',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/ubuntu/Ubuntu-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/ubuntu/Ubuntu-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/ubuntu/Ubuntu-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/ubuntu/Ubuntu-BoldItalic.ttf`
    },
    {
        name: 'Rubik',
        value: 'Rubik',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/rubik/static/Rubik-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/rubik/static/Rubik-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/rubik/static/Rubik-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/rubik/static/Rubik-BoldItalic.ttf`
    },
    {
        name: 'Poppins',
        value: 'Poppins',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/poppins/Poppins-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/poppins/Poppins-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/poppins/Poppins-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/poppins/Poppins-BoldItalic.ttf`
    },
    {
        name: 'Fira Sans',
        value: 'Fira Sans',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/firasans/FiraSans-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/firasans/FiraSans-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/firasans/FiraSans-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/firasans/FiraSans-BoldItalic.ttf`
    },
    {
        name: 'Quicksand',
        value: 'Quicksand',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/quicksand/static/Quicksand-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/quicksand/static/Quicksand-Bold.ttf`,
        // Quicksand might not have italic in static
        italicUrl: `${GOOGLE_FONTS_BASE}/quicksand/static/Quicksand-Regular.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/quicksand/static/Quicksand-Bold.ttf`
    },
    {
        name: 'Inconsolata',
        value: 'Inconsolata',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/inconsolata/static/Inconsolata-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/inconsolata/static/Inconsolata-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/inconsolata/static/Inconsolata-Regular.ttf`, // Monospace often lacks italic
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/inconsolata/static/Inconsolata-Bold.ttf`
    },
    {
        name: 'Work Sans',
        value: 'Work Sans',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/worksans/static/WorkSans-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/worksans/static/WorkSans-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/worksans/static/WorkSans-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/worksans/static/WorkSans-BoldItalic.ttf`
    },
    {
        name: 'PT Sans',
        value: 'PT Sans',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/ptsans/PTSans-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/ptsans/PTSans-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/ptsans/PTSans-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/ptsans/PTSans-BoldItalic.ttf`
    },
    {
        name: 'Crimson Text',
        value: 'Crimson Text',
        type: 'custom',
        regularUrl: `${GOOGLE_FONTS_BASE}/crimsontext/CrimsonText-Regular.ttf`,
        boldUrl: `${GOOGLE_FONTS_BASE}/crimsontext/CrimsonText-Bold.ttf`,
        italicUrl: `${GOOGLE_FONTS_BASE}/crimsontext/CrimsonText-Italic.ttf`,
        boldItalicUrl: `${GOOGLE_FONTS_BASE}/crimsontext/CrimsonText-BoldItalic.ttf`
    }
];
