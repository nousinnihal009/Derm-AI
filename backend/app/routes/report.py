"""
report.py — PDF Report Generation API
Generates a professional AI Skin Health Report as a downloadable PDF.
"""

import io
import base64
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image as RLImage, HRFlowable, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

router = APIRouter(prefix="/api", tags=["report"])


class ReportRequest(BaseModel):
    prediction: Dict[str, Any]
    top3: List[Dict[str, Any]]
    risk_assessment: Dict[str, Any]
    condition_info: Dict[str, Any]
    treatments: Dict[str, Any]
    gradcam_heatmap: Optional[str] = None
    confidence_distribution: Optional[Dict[str, float]] = None
    urgent_warning: Optional[str] = None
    disclaimer: Optional[str] = None
    uploaded_image: Optional[str] = None  # base64 encoded


def _build_styles():
    """Create custom paragraph styles for the report."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        'ReportTitle',
        parent=styles['Title'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a2e'),
        spaceAfter=6,
        fontName='Helvetica-Bold',
    ))
    styles.add(ParagraphStyle(
        'ReportSubtitle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#5c5c7a'),
        spaceAfter=20,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#4f46e5'),
        spaceBefore=16,
        spaceAfter=8,
        fontName='Helvetica-Bold',
        borderPadding=(0, 0, 4, 0),
    ))
    styles.add(ParagraphStyle(
        'SubSection',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#1a1a2e'),
        spaceBefore=8,
        spaceAfter=4,
        fontName='Helvetica-Bold',
    ))
    styles.add(ParagraphStyle(
        'BodyText2',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333'),
        leading=14,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        'WarningText',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#dc2626'),
        fontName='Helvetica-Bold',
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#888'),
        leading=11,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        'RiskHigh',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.white,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
    ))
    return styles


def _risk_color(level: str) -> colors.Color:
    """Map risk level to a color."""
    level = level.lower()
    if level in ('critical', 'high'):
        return colors.HexColor('#ef4444')
    elif level == 'moderate':
        return colors.HexColor('#f59e0b')
    else:
        return colors.HexColor('#10b981')


@router.post("/report/pdf")
async def generate_pdf_report(data: ReportRequest):
    """Generate a professional PDF skin health report."""
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
            leftMargin=20 * mm,
            rightMargin=20 * mm,
        )

        styles = _build_styles()
        story = []

        # ── Header ──────────────────────────────────────────
        story.append(Paragraph("🔬 DermAI — AI Skin Health Report", styles['ReportTitle']))
        story.append(Paragraph(
            f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            styles['ReportSubtitle']
        ))
        story.append(HRFlowable(
            width="100%", thickness=2,
            color=colors.HexColor('#4f46e5'),
            spaceAfter=16
        ))

        # ── Urgent Warning ──────────────────────────────────
        if data.urgent_warning:
            story.append(Paragraph(f"⚠️ {data.urgent_warning}", styles['WarningText']))
            story.append(Spacer(1, 8))

        # ── Primary Diagnosis ───────────────────────────────
        story.append(Paragraph("Primary Diagnosis", styles['SectionHeader']))

        pred = data.prediction
        risk = data.risk_assessment
        confidence_pct = round(pred.get('confidence', 0) * 100, 1)

        # Diagnosis summary table
        risk_level = risk.get('label', 'Unknown')
        risk_bg = _risk_color(risk.get('level', 'low'))

        diag_data = [
            ['Detected Condition', pred.get('display_name', 'Unknown')],
            ['Category', pred.get('category', 'N/A')],
            ['Confidence Score', f"{confidence_pct}%"],
            ['Risk Level', risk_level],
            ['Severity', data.condition_info.get('severity', 'N/A').capitalize()],
            ['Urgency', risk.get('urgency', 'routine').capitalize()],
        ]

        diag_table = Table(diag_data, colWidths=[140, 330])
        diag_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0ff')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#4f46e5')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e0e0e0')),
            ('ROWBACKGROUNDS', (1, 0), (1, -1), [colors.white, colors.HexColor('#fafafa')]),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(diag_table)
        story.append(Spacer(1, 12))

        # ── Top-3 Differential Diagnoses ────────────────────
        story.append(Paragraph("Differential Diagnoses (Top 3)", styles['SectionHeader']))

        top3_data = [['Rank', 'Condition', 'Category', 'Confidence']]
        for i, p in enumerate(data.top3[:3]):
            top3_data.append([
                f"#{i+1}",
                p.get('display_name', 'Unknown'),
                p.get('category', 'N/A'),
                f"{round(p.get('confidence', 0) * 100, 1)}%",
            ])

        top3_table = Table(top3_data, colWidths=[50, 200, 120, 100])
        top3_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4f46e5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e0e0e0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fafafa')]),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(top3_table)
        story.append(Spacer(1, 12))

        # ── Medical Information ─────────────────────────────
        story.append(Paragraph("Medical Information", styles['SectionHeader']))

        cond = data.condition_info
        if cond.get('description'):
            story.append(Paragraph("Description", styles['SubSection']))
            story.append(Paragraph(cond['description'], styles['BodyText2']))

        if cond.get('medical_explanation'):
            story.append(Paragraph("Medical Explanation", styles['SubSection']))
            story.append(Paragraph(cond['medical_explanation'], styles['BodyText2']))

        if cond.get('causes'):
            story.append(Paragraph("Common Causes", styles['SubSection']))
            for cause in cond['causes'][:5]:
                story.append(Paragraph(f"• {cause}", styles['BodyText2']))

        if cond.get('symptoms'):
            story.append(Paragraph("Symptoms", styles['SubSection']))
            for symptom in cond['symptoms'][:5]:
                story.append(Paragraph(f"• {symptom}", styles['BodyText2']))

        # ── Treatment Recommendations ───────────────────────
        story.append(Paragraph("Treatment Recommendations", styles['SectionHeader']))

        treatments = data.treatments
        if treatments.get('otc'):
            story.append(Paragraph("Over-the-Counter", styles['SubSection']))
            for t in treatments['otc'][:5]:
                story.append(Paragraph(f"• {t}", styles['BodyText2']))

        if treatments.get('prescription'):
            story.append(Paragraph("Prescription (Consult Doctor)", styles['SubSection']))
            for t in treatments['prescription'][:5]:
                story.append(Paragraph(f"• {t}", styles['BodyText2']))

        if treatments.get('natural'):
            story.append(Paragraph("Natural Remedies", styles['SubSection']))
            for t in treatments['natural'][:5]:
                story.append(Paragraph(f"• {t}", styles['BodyText2']))

        # ── When to See a Doctor ────────────────────────────
        if cond.get('when_to_see_doctor'):
            story.append(Paragraph("When to See a Doctor", styles['SectionHeader']))
            story.append(Paragraph(cond['when_to_see_doctor'], styles['BodyText2']))

        # ── Risk Assessment Action ──────────────────────────
        if risk.get('action'):
            story.append(Paragraph("Recommended Action", styles['SectionHeader']))
            story.append(Paragraph(risk['action'], styles['BodyText2']))

        # ── Grad-CAM Heatmap ────────────────────────────────
        if data.gradcam_heatmap:
            try:
                story.append(PageBreak())
                story.append(Paragraph("Grad-CAM Attention Heatmap", styles['SectionHeader']))
                story.append(Paragraph(
                    "The heatmap below highlights the regions the AI model focused on when making its prediction. "
                    "Warmer colors (red/yellow) indicate higher attention areas.",
                    styles['BodyText2']
                ))
                img_data = base64.b64decode(data.gradcam_heatmap)
                img_buffer = io.BytesIO(img_data)
                img = RLImage(img_buffer, width=200, height=200)
                story.append(img)
                story.append(Spacer(1, 12))
            except Exception:
                pass

        # ── Disclaimer ──────────────────────────────────────
        story.append(Spacer(1, 24))
        story.append(HRFlowable(
            width="100%", thickness=1,
            color=colors.HexColor('#ddd'),
            spaceAfter=8
        ))
        disclaimer = data.disclaimer or (
            "This report is generated by an AI system and is NOT a medical diagnosis. "
            "It is intended for educational and informational purposes only. "
            "Please consult a qualified dermatologist for professional medical advice."
        )
        story.append(Paragraph(f"⚠️ DISCLAIMER: {disclaimer}", styles['DisclaimerText']))
        story.append(Paragraph(
            f"Report generated by DermAI Platform — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            styles['DisclaimerText']
        ))

        # Build PDF
        doc.build(story)
        buffer.seek(0)

        filename = f"DermAI_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")
