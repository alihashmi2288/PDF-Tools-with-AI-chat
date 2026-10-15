import { 
    PDFDocument, 
    PDFTextField, 
    PDFCheckBox, 
    PDFDropdown, 
    PDFRadioGroup, 
    PDFOptionList 
} from 'pdf-lib';

export interface FormFieldMetadata {
    name: string;
    type: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'unknown';
    value: string | boolean;
    options?: string[];
    isReadOnly?: boolean;
}

export async function inspectAcroFormFields(pdfBytes: Uint8Array): Promise<{
    hasForm: boolean;
    fields: FormFieldMetadata[];
}> {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    if (!fields || fields.length === 0) {
        return { hasForm: false, fields: [] };
    }

    const fieldMetadataList: FormFieldMetadata[] = [];

    for (const field of fields) {
        const name = field.getName();
        const isReadOnly = field.isReadOnly();

        if (field instanceof PDFTextField) {
            fieldMetadataList.push({
                name,
                type: 'text',
                value: field.getText() || '',
                isReadOnly,
            });
        } else if (field instanceof PDFCheckBox) {
            fieldMetadataList.push({
                name,
                type: 'checkbox',
                value: field.isChecked(),
                isReadOnly,
            });
        } else if (field instanceof PDFDropdown) {
            fieldMetadataList.push({
                name,
                type: 'dropdown',
                value: field.getSelected()[0] || '',
                options: field.getOptions(),
                isReadOnly,
            });
        } else if (field instanceof PDFRadioGroup) {
            fieldMetadataList.push({
                name,
                type: 'radio',
                value: field.getSelected() || '',
                options: field.getOptions(),
                isReadOnly,
            });
        } else if (field instanceof PDFOptionList) {
            fieldMetadataList.push({
                name,
                type: 'dropdown',
                value: field.getSelected()[0] || '',
                options: field.getOptions(),
                isReadOnly,
            });
        } else {
            fieldMetadataList.push({
                name,
                type: 'unknown',
                value: '',
                isReadOnly,
            });
        }
    }

    return {
        hasForm: fieldMetadataList.length > 0,
        fields: fieldMetadataList,
    };
}

export async function fillAcroForm(
    pdfBytes: Uint8Array,
    fieldValues: Record<string, string | boolean>,
    flatten: boolean = false
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    for (const field of fields) {
        const name = field.getName();
        const value = fieldValues[name];
        if (value === undefined) continue;

        try {
            if (field instanceof PDFTextField && typeof value === 'string') {
                field.setText(value);
            } else if (field instanceof PDFCheckBox) {
                if (Boolean(value)) {
                    field.check();
                } else {
                    field.uncheck();
                }
            } else if (field instanceof PDFDropdown && typeof value === 'string') {
                field.select(value);
            } else if (field instanceof PDFRadioGroup && typeof value === 'string') {
                field.select(value);
            }
        } catch (err) {
            console.warn(`Could not set value for field "${name}":`, err);
        }
    }

    if (flatten) {
        form.flatten();
    }

    return await pdfDoc.save();
}

/**
 * Creates a standard interactive AcroForm sample (Job/Rental Application Form)
 * so users can test the form filler immediately without searching for a government PDF!
 */
export async function createSampleAcroForm(): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const form = pdfDoc.getForm();

    const { width, height } = page.getSize();
    
    // Draw Title Header
    page.drawText('STANDARD VERIFICATION & APPLICATION FORM', {
        x: 50,
        y: height - 60,
        size: 16,
    });
    page.drawText('Official Interactive PDF Form • Please complete all required fields', {
        x: 50,
        y: height - 80,
        size: 10,
    });

    // 1. Full Name
    page.drawText('Full Legal Name:', { x: 50, y: height - 120, size: 10 });
    const nameField = form.createTextField('fullName');
    nameField.setText('Jane Doe');
    nameField.addToPage(page, { x: 50, y: height - 150, width: 230, height: 24 });

    // 2. Email Address
    page.drawText('Email Address:', { x: 310, y: height - 120, size: 10 });
    const emailField = form.createTextField('email');
    emailField.setText('jane.doe@example.com');
    emailField.addToPage(page, { x: 310, y: height - 150, width: 230, height: 24 });

    // 3. Phone Number
    page.drawText('Phone Number:', { x: 50, y: height - 190, size: 10 });
    const phoneField = form.createTextField('phoneNumber');
    phoneField.setText('+1 (555) 234-5678');
    phoneField.addToPage(page, { x: 50, y: height - 220, width: 230, height: 24 });

    // 4. Position Applied / Category (Dropdown)
    page.drawText('Department / Role:', { x: 310, y: height - 190, size: 10 });
    const roleDropdown = form.createDropdown('department');
    roleDropdown.addOptions(['Engineering', 'Product Design', 'Finance & Legal', 'Operations']);
    roleDropdown.select('Engineering');
    roleDropdown.addToPage(page, { x: 310, y: height - 220, width: 230, height: 24 });

    // 5. Monthly Income / Budget
    page.drawText('Expected Annual Compensation ($):', { x: 50, y: height - 260, size: 10 });
    const salaryField = form.createTextField('salary');
    salaryField.setText('120000');
    salaryField.addToPage(page, { x: 50, y: height - 290, width: 230, height: 24 });

    // 6. Start Date
    page.drawText('Earliest Available Start Date:', { x: 310, y: height - 260, size: 10 });
    const dateField = form.createTextField('startDate');
    dateField.setText('2026-11-01');
    dateField.addToPage(page, { x: 310, y: height - 290, width: 230, height: 24 });

    // 7. Checkboxes
    page.drawText('Legal Declarations:', { x: 50, y: height - 340, size: 11 });

    const citizenCheck = form.createCheckBox('authorizedToWork');
    citizenCheck.check();
    citizenCheck.addToPage(page, { x: 50, y: height - 370, width: 16, height: 16 });
    page.drawText('I am legally authorized to work in this jurisdiction without sponsorship', {
        x: 75,
        y: height - 367,
        size: 9.5,
    });

    const backgroundCheck = form.createCheckBox('consentBackgroundCheck');
    backgroundCheck.check();
    backgroundCheck.addToPage(page, { x: 50, y: height - 400, width: 16, height: 16 });
    page.drawText('I consent to standard professional reference and background verification', {
        x: 75,
        y: height - 397,
        size: 9.5,
    });

    // 8. Notes / Cover Statement
    page.drawText('Summary of Experience & Additional Notes:', { x: 50, y: height - 440, size: 10 });
    const notesField = form.createTextField('additionalNotes');
    notesField.enableMultiline();
    notesField.setText('Over 6 years of software development and system architecture experience.');
    notesField.addToPage(page, { x: 50, y: height - 520, width: 490, height: 70 });

    return await pdfDoc.save();
}
