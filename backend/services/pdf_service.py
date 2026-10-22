import io
import logging
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

logger = logging.getLogger("PDFService")

def generate_plan_pdf(plan_data: dict) -> bytes:
    """Generates a formatted PDF report for the project plan."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=6
    )
    
    heading2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155')
    )

    story = []

    req = plan_data.get('requirements', {})
    arch = plan_data.get('architecture', {})
    tech = plan_data.get('technology_stack', {}) or plan_data.get('technology', {})
    tasks_dict = plan_data.get('tasks', {})
    exec_plan = plan_data.get('execution_plan', {})

    # Title & Banner
    proj_title = req.get('project_title', 'Software Project Plan')
    story.append(Paragraph(proj_title, title_style))
    story.append(Paragraph(f"<b>Project Idea:</b> {plan_data.get('project_idea', '')}", body_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceAfter=12))

    # 1. Objective & Features
    story.append(Paragraph("1. Project Objective & Requirements", heading2_style))
    story.append(Paragraph(f"<b>Objective:</b> {req.get('objective', '')}", body_style))
    story.append(Spacer(1, 4))

    if req.get('key_features'):
        story.append(Paragraph("<b>Key Features:</b>", body_style))
        for feat in req.get('key_features', []):
            story.append(Paragraph(f"• {feat}", body_style))
        story.append(Spacer(1, 6))

    # 2. Architecture
    story.append(Spacer(1, 6))
    story.append(Paragraph("2. System Architecture", heading2_style))
    story.append(Paragraph(f"<b>Architecture Pattern:</b> {arch.get('architecture_style', '')}", body_style))
    if arch.get('architecture_description'):
        story.append(Paragraph(arch.get('architecture_description'), body_style))
    story.append(Spacer(1, 6))

    # 3. Technology Stack Table
    story.append(Spacer(1, 6))
    story.append(Paragraph("3. Recommended Technology Stack", heading2_style))
    tech_data = [["Component", "Technology Choice", "Rationale"]]
    if tech.get('frontend'):
        tech_data.append(["Frontend", tech['frontend'].get('technology', ''), tech['frontend'].get('reason', '')])
    if tech.get('backend'):
        tech_data.append(["Backend", tech['backend'].get('technology', ''), tech['backend'].get('reason', '')])
    if tech.get('database'):
        tech_data.append(["Database", tech['database'].get('technology', ''), tech['database'].get('reason', '')])
    if tech.get('ai_ml'):
        tech_data.append(["AI / ML", tech['ai_ml'].get('technology', ''), tech['ai_ml'].get('reason', '')])

    if len(tech_data) > 1:
        t = Table(tech_data, colWidths=[80, 140, 320])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0f172a')),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ]))
        story.append(t)

    # 4. Tasks Breakdown
    story.append(Spacer(1, 10))
    story.append(Paragraph("4. Actionable Development Tasks", heading2_style))
    task_list = tasks_dict.get('tasks', [])
    task_table_data = [["ID", "Task Title", "Priority", "Phase"]]
    for task in task_list:
        task_table_data.append([
            task.get('id', ''),
            task.get('title', ''),
            task.get('priority', ''),
            task.get('phase', '')
        ])

    if len(task_table_data) > 1:
        tt = Table(task_table_data, colWidths=[40, 240, 60, 200])
        tt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('FONTSIZE', (0,0), (-1,-1), 8),
        ]))
        story.append(tt)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
