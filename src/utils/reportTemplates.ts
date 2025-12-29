import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { format, parseISO } from 'date-fns';
import type { Task } from '../types';

interface ReportData {
    template: string;
    name: string;
    position: string;
    office: string;
    year: number;
    month: number;
    period: string;
    dateFrom: string;
    dateTo: string;
    reviewedBy: string;
    verifiedBy: string;
    approvedBy: string;
}

export const generateReportDocument = (reportTasks: Task[], formData: ReportData): Document => {
    let documentChildren;

    if (formData.template === 'general') {
        // General Template - Standard Format
        documentChildren = [
            new Paragraph({
                text: "INDIVIDUAL ACCOMPLISHMENT REPORT",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Name: ", bold: true }),
                    new TextRun(formData.name),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Position: ", bold: true }),
                    new TextRun(formData.position),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Office: ", bold: true }),
                    new TextRun(formData.office),
                ],
                spacing: { after: 400 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Period: ", bold: true }),
                    new TextRun(`${formData.month}/${formData.year} (${formData.period === '1' ? '1st Half' : '2nd Half'})`),
                ],
                spacing: { after: 400 },
            }),
            new Paragraph({
                text: "ACCOMPLISHMENTS:",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 200 },
            }),
            ...reportTasks.flatMap(t => [
                new Paragraph({
                    children: [
                        new TextRun({ text: `[${t.status}] ${t.name}`, bold: true }),
                    ],
                    bullet: { level: 0 }
                }),
                ...(t.description ? [new Paragraph({
                    text: t.description,
                    indent: { left: 720 },
                })] : [])
            ]),
            new Paragraph({
                text: "",
                spacing: { after: 400 },
            }),
            new Paragraph({
                text: "SIGNATURES:",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 200 },
            }),
            ...(formData.reviewedBy ? [new Paragraph({
                children: [
                    new TextRun({ text: "Reviewed by: ", bold: true }),
                    new TextRun(formData.reviewedBy),
                ],
                spacing: { before: 200 }
            })] : []),
            ...(formData.verifiedBy ? [new Paragraph({
                children: [
                    new TextRun({ text: "Verified by: ", bold: true }),
                    new TextRun(formData.verifiedBy),
                ],
                spacing: { before: 200 }
            })] : []),
            ...(formData.approvedBy ? [new Paragraph({
                children: [
                    new TextRun({ text: "Approved by: ", bold: true }),
                    new TextRun(formData.approvedBy),
                ],
                spacing: { before: 200 }
            })] : [])
        ];
    } else {
        // Custom Template - Table Format matching accomplishment_generator.py
        const start = parseISO(formData.dateFrom);
        const end = parseISO(formData.dateTo);

        // Calculate weekly periods (Monday-Friday, working days only)
        const weeks: Array<{ start: Date; end: Date }> = [];
        let currentStart = new Date(start);

        while (currentStart <= end) {
            // Skip weekends at start
            while (currentStart <= end && (currentStart.getDay() === 0 || currentStart.getDay() === 6)) {
                currentStart.setDate(currentStart.getDate() + 1);
            }

            if (currentStart > end) break;

            let weekEnd = new Date(currentStart);
            let workingDays = 0;

            // Count up to 5 working days
            while (workingDays < 5 && weekEnd <= end) {
                if (weekEnd.getDay() !== 0 && weekEnd.getDay() !== 6) {
                    workingDays++;
                }
                if (workingDays < 5) {
                    weekEnd.setDate(weekEnd.getDate() + 1);
                }
            }

            // Make sure weekEnd doesn't go beyond period end
            if (weekEnd > end) weekEnd = new Date(end);

            weeks.push({ start: new Date(currentStart), end: new Date(weekEnd) });

            currentStart = new Date(weekEnd);
            currentStart.setDate(currentStart.getDate() + 1);
        }

        // Distribute tasks evenly across weeks
        const tasksPerWeek = Math.floor(reportTasks.length / weeks.length);
        const remainder = reportTasks.length % weeks.length;

        // Create table rows
        const tableRows: TableRow[] = [];

        // Header row
        tableRows.push(new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: "PERIOD/ WEEK", bold: true })],
                    })],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: "ACCOMPLISHMENT / OUTPUT", bold: true })],
                    })],
                    width: { size: 80, type: WidthType.PERCENTAGE },
                }),
            ],
        }));

        // Add week rows
        let taskIndex = 0;
        for (let i = 0; i < weeks.length; i++) {
            const week = weeks[i];
            const numTasks = tasksPerWeek + (i < remainder ? 1 : 0);
            const weekTasks = reportTasks.slice(taskIndex, taskIndex + numTasks);
            taskIndex += numTasks;

            if (weekTasks.length > 0) {
                const weekStart = week.start;
                const weekEnd = week.end;
                const weekLabel = weekStart.getMonth() === weekEnd.getMonth()
                    ? `${format(weekStart, 'MMMM dd')}-${format(weekEnd, 'dd, yyyy')}`
                    : `${format(weekStart, 'MMMM dd')}-${format(weekEnd, 'MMMM dd, yyyy')}`;

                tableRows.push(new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph(weekLabel)],
                            width: { size: 20, type: WidthType.PERCENTAGE },
                        }),
                        new TableCell({
                            children: weekTasks.map(task =>
                                new Paragraph({
                                    text: task.name,
                                    bullet: { level: 0 },
                                })
                            ),
                            width: { size: 80, type: WidthType.PERCENTAGE },
                        }),
                    ],
                }));
            }
        }

        // Create the table with black borders
        const accomplishmentTable = new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
                insideVertical: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            },
        });

        documentChildren = [
            new Paragraph({
                text: "INDIVIDUAL ACCOMPLISHMENT REPORT",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            }),
            new Paragraph({ text: "", spacing: { after: 200 } }),
            new Paragraph({
                children: [
                    new TextRun({ text: "NAME: ", bold: true }),
                    new TextRun(formData.name),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "POSITION: ", bold: true }),
                    new TextRun(formData.position),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "OFFICE: ", bold: true }),
                    new TextRun(formData.office),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "DATE: ", bold: true }),
                    new TextRun(start.getMonth() === end.getMonth()
                        ? `${format(start, 'MMMM dd')}-${format(end, 'dd, yyyy')}`
                        : `${format(start, 'MMMM dd')}-${format(end, 'MMMM dd, yyyy')}`),
                ],
                spacing: { after: 200 },
            }),
            new Paragraph({ text: "", spacing: { after: 200 } }),
            accomplishmentTable,
            new Paragraph({ text: "", spacing: { after: 400 } }),
            new Paragraph({ text: "", spacing: { after: 200 } }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Prepared by:", bold: true, size: 18 }),
                ],
            }),
            new Paragraph({ text: "", spacing: { after: 100 } }),
            new Paragraph({ text: "", spacing: { after: 100 } }),
            new Paragraph({
                children: [
                    new TextRun({ text: formData.name, bold: true, size: 20 }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: formData.position, size: 16 }),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: formData.office, size: 16 }),
                ],
                spacing: { after: 400 },
            })
        ];

        if (formData.verifiedBy) {
            documentChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: "Verified by:", bold: true, size: 18 }),
                    ],
                }),
                new Paragraph({ text: "", spacing: { after: 100 } }),
                new Paragraph({ text: "", spacing: { after: 100 } }),
                new Paragraph({
                    children: [
                        new TextRun({ text: formData.verifiedBy, bold: true, size: 20 }),
                    ],
                    spacing: { after: 400 },
                })
            );
        }

        if (formData.reviewedBy) {
            documentChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: "Reviewed by:", bold: true, size: 18 }),
                    ],
                }),
                new Paragraph({ text: "", spacing: { after: 100 } }),
                new Paragraph({ text: "", spacing: { after: 100 } }),
                new Paragraph({
                    children: [
                        new TextRun({ text: formData.reviewedBy, bold: true, size: 20 }),
                    ],
                    spacing: { after: 400 },
                })
            );
        }

        if (formData.approvedBy) {
            documentChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: "Approved by:", bold: true, size: 18 }),
                    ],
                }),
                new Paragraph({ text: "", spacing: { after: 100 } }),
                new Paragraph({ text: "", spacing: { after: 100 } }),
                new Paragraph({
                    children: [
                        new TextRun({ text: formData.approvedBy, bold: true, size: 20 }),
                    ],
                    spacing: { after: 200 },
                })
            );
        }
    }

    return new Document({
        sections: [{
            properties: {},
            children: documentChildren,
        }],
    });
};
