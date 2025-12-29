import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
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
        // Custom Template - Enhanced Format
        const completedTasks = reportTasks.filter(t => t.status === 'COMPLETED');
        const inProgressTasks = reportTasks.filter(t => t.status === 'IN PROGRESS');
        const todoTasks = reportTasks.filter(t => t.status === 'TO DO');

        documentChildren = [
            new Paragraph({
                text: "ACCOMPLISHMENT REPORT",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            }),
            new Paragraph({
                text: "(Enhanced Format)",
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            }),
            new Paragraph({
                text: "EMPLOYEE INFORMATION",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 200, after: 200 },
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
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Reporting Period: ", bold: true }),
                    new TextRun(`${format(parseISO(formData.dateFrom), 'MMMM dd, yyyy')} - ${format(parseISO(formData.dateTo), 'MMMM dd, yyyy')}`),
                ],
                spacing: { after: 400 },
            }),
            new Paragraph({
                text: "SUMMARY",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 200, after: 200 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Total Tasks: ", bold: true }),
                    new TextRun(`${reportTasks.length}`),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Completed: ", bold: true }),
                    new TextRun(`${completedTasks.length}`),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "In Progress: ", bold: true }),
                    new TextRun(`${inProgressTasks.length}`),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "To Do: ", bold: true }),
                    new TextRun(`${todoTasks.length}`),
                ],
                spacing: { after: 400 },
            }),
            ...(completedTasks.length > 0 ? [
                new Paragraph({
                    text: "COMPLETED TASKS",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 200 },
                }),
                ...completedTasks.flatMap((t, idx) => [
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${idx + 1}. ${t.name}`, bold: true }),
                        ],
                    }),
                    ...(t.dueDate ? [new Paragraph({
                        children: [
                            new TextRun({ text: "Due Date: ", bold: true, italics: true }),
                            new TextRun({ text: format(parseISO(t.dueDate), 'MMMM dd, yyyy'), italics: true }),
                        ],
                        indent: { left: 720 },
                    })] : []),
                    ...(t.priority ? [new Paragraph({
                        children: [
                            new TextRun({ text: "Priority: ", bold: true, italics: true }),
                            new TextRun({ text: t.priority, italics: true }),
                        ],
                        indent: { left: 720 },
                    })] : []),
                    ...(t.description ? [new Paragraph({
                        text: t.description,
                        indent: { left: 720 },
                        spacing: { after: 200 },
                    })] : [new Paragraph({ text: "", spacing: { after: 200 } })])
                ])
            ] : []),
            ...(inProgressTasks.length > 0 ? [
                new Paragraph({
                    text: "IN PROGRESS TASKS",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 200 },
                }),
                ...inProgressTasks.flatMap((t, idx) => [
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${idx + 1}. ${t.name}`, bold: true }),
                        ],
                    }),
                    ...(t.dueDate ? [new Paragraph({
                        children: [
                            new TextRun({ text: "Due Date: ", bold: true, italics: true }),
                            new TextRun({ text: format(parseISO(t.dueDate), 'MMMM dd, yyyy'), italics: true }),
                        ],
                        indent: { left: 720 },
                    })] : []),
                    ...(t.priority ? [new Paragraph({
                        children: [
                            new TextRun({ text: "Priority: ", bold: true, italics: true }),
                            new TextRun({ text: t.priority, italics: true }),
                        ],
                        indent: { left: 720 },
                    })] : []),
                    ...(t.description ? [new Paragraph({
                        text: t.description,
                        indent: { left: 720 },
                        spacing: { after: 200 },
                    })] : [new Paragraph({ text: "", spacing: { after: 200 } })])
                ])
            ] : []),
            ...(todoTasks.length > 0 ? [
                new Paragraph({
                    text: "TO DO TASKS",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 200 },
                }),
                ...todoTasks.flatMap((t, idx) => [
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${idx + 1}. ${t.name}`, bold: true }),
                        ],
                    }),
                    ...(t.dueDate ? [new Paragraph({
                        children: [
                            new TextRun({ text: "Due Date: ", bold: true, italics: true }),
                            new TextRun({ text: format(parseISO(t.dueDate), 'MMMM dd, yyyy'), italics: true }),
                        ],
                        indent: { left: 720 },
                    })] : []),
                    ...(t.priority ? [new Paragraph({
                        children: [
                            new TextRun({ text: "Priority: ", bold: true, italics: true }),
                            new TextRun({ text: t.priority, italics: true }),
                        ],
                        indent: { left: 720 },
                    })] : []),
                    ...(t.description ? [new Paragraph({
                        text: t.description,
                        indent: { left: 720 },
                        spacing: { after: 200 },
                    })] : [new Paragraph({ text: "", spacing: { after: 200 } })])
                ])
            ] : []),
            new Paragraph({
                text: "",
                spacing: { after: 400 },
            }),
            new Paragraph({
                text: "SIGNATURES:",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
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
    }

    return new Document({
        sections: [{
            properties: {},
            children: documentChildren,
        }],
    });
};
