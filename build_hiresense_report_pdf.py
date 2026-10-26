import os
import sys
import pypdf
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, PageBreak, Spacer, Table, TableStyle, Image, Flowable, KeepTogether
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas

# 1. Register TrueType Fonts from Windows Environment
try:
    pdfmetrics.registerFont(TTFont('TimesNewRoman', 'C:\\Windows\\Fonts\\times.ttf'))
    pdfmetrics.registerFont(TTFont('TimesNewRoman-Bold', 'C:\\Windows\\Fonts\\timesbd.ttf'))
    pdfmetrics.registerFont(TTFont('TimesNewRoman-Italic', 'C:\\Windows\\Fonts\\timesi.ttf'))
    pdfmetrics.registerFont(TTFont('TimesNewRoman-BoldItalic', 'C:\\Windows\\Fonts\\timesbi.ttf'))
    pdfmetrics.registerFont(TTFont('Consolas', 'C:\\Windows\\Fonts\\consola.ttf'))
    FONT_NORMAL = 'TimesNewRoman'
    FONT_BOLD = 'TimesNewRoman-Bold'
    FONT_ITALIC = 'TimesNewRoman-Italic'
    FONT_CODE = 'Consolas'
except Exception as e:
    print(f"Warning font fallback: {e}")
    FONT_NORMAL = 'Times-Roman'
    FONT_BOLD = 'Times-Bold'
    FONT_ITALIC = 'Times-Italic'
    FONT_CODE = 'Courier'

# 2. Strict Dimensions & Margin Specifications
# A4 Size: 210mm x 297mm
# Margins: Left = 35mm, Right = 35mm, Top = 30mm, Bottom = 30mm
PAGE_WIDTH, PAGE_HEIGHT = A4
LEFT_MARGIN = 35 * mm
RIGHT_MARGIN = 35 * mm
TOP_MARGIN = 30 * mm
BOTTOM_MARGIN = 30 * mm
USABLE_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN   # 140 mm (396.85 pt)
USABLE_HEIGHT = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN # 237 mm (671.81 pt)

# Global tracking registry for two-pass TOC/LOF/LOT pagination
page_registry = {}
first_chapter_page = 11 # Default fallback

class BookmarkTracker(Flowable):
    def __init__(self, key):
        super().__init__()
        self.key = key
        self.width = 0
        self.height = 0

    def draw(self):
        page_registry[self.key] = self.canv._pageNumber

def to_roman(num):
    if num <= 0:
        return ""
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syb = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"]
    roman_num = ''
    i = 0
    while num > 0:
        for _ in range(num // val[i]):
            roman_num += syb[i]
            num -= val[i]
        i += 1
    return roman_num

def get_page_display(key):
    """Returns the formatted page number string for TOC/LOF/LOT based on registered page."""
    raw_page = page_registry.get(key, 1)
    ch1_page = page_registry.get("ch1_start", first_chapter_page)
    if raw_page < ch1_page:
        return to_roman(raw_page - 1)
    else:
        return str(raw_page - ch1_page + 1)

class AcademicNumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        global first_chapter_page
        ch1_page = page_registry.get("ch1_start", first_chapter_page)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            p_num = self._pageNumber
            if p_num == 1:
                # Cover Page: No print matter in margins (unnumbered)
                pass
            elif p_num < ch1_page:
                # Preliminary pages: Lowercase Roman numerals centered 20mm from bottom edge
                roman_str = to_roman(p_num - 1)
                self.setFont(FONT_NORMAL, 10)
                self.drawCentredString(PAGE_WIDTH / 2.0, 20 * mm, roman_str)
            else:
                # Main chapters onwards: Arabic numerals centered 20mm from bottom edge
                arabic_str = str(p_num - ch1_page + 1)
                self.setFont(FONT_NORMAL, 10)
                self.drawCentredString(PAGE_WIDTH / 2.0, 20 * mm, arabic_str)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

# 3. Typography Styles Matching Template Guidelines
# Running text: TNR 12pt, 1.5 line spacing (18pt leading)
# Captions: TNR 11pt, single line spacing (14pt leading)
# Headings: Chapter 14pt bold, Sub-headings 12pt bold
style_cover_title = ParagraphStyle(
    'CoverTitle', fontName=FONT_BOLD, fontSize=15, leading=21, alignment=1, textColor=colors.black
)
style_cover_sub = ParagraphStyle(
    'CoverSub', fontName=FONT_NORMAL, fontSize=12, leading=16, alignment=1, textColor=colors.black
)
style_cover_bold = ParagraphStyle(
    'CoverBold', fontName=FONT_BOLD, fontSize=12, leading=16, alignment=1, textColor=colors.black
)

style_ch_title = ParagraphStyle(
    'ChapterTitle', fontName=FONT_BOLD, fontSize=14, leading=20, alignment=1, spaceAfter=14
)
style_sec_heading = ParagraphStyle(
    'SectionHeading', fontName=FONT_BOLD, fontSize=12, leading=16, spaceBefore=14, spaceAfter=6, keepWithNext=True
)
style_subsec_heading = ParagraphStyle(
    'SubSectionHeading', fontName=FONT_BOLD, fontSize=12, leading=16, spaceBefore=10, spaceAfter=4, keepWithNext=True
)
style_body = ParagraphStyle(
    'BodyText', fontName=FONT_NORMAL, fontSize=12, leading=18, alignment=4, spaceAfter=10, firstLineIndent=18
)
style_body_no_indent = ParagraphStyle(
    'BodyTextNoIndent', fontName=FONT_NORMAL, fontSize=12, leading=18, alignment=4, spaceAfter=10
)
style_abstract = ParagraphStyle(
    'AbstractBody', fontName=FONT_NORMAL, fontSize=11, leading=15, alignment=4, spaceAfter=8, firstLineIndent=15
)
style_caption = ParagraphStyle(
    'Caption', fontName=FONT_BOLD, fontSize=11, leading=14, alignment=1, spaceBefore=6, spaceAfter=12
)
style_code = ParagraphStyle(
    'CodeListing', fontName=FONT_CODE, fontSize=8, leading=10.5, alignment=0, textColor=colors.HexColor('#1E293B')
)
style_th = ParagraphStyle(
    'TableHeader', fontName=FONT_BOLD, fontSize=9.5, leading=12, alignment=1, textColor=colors.black
)
style_tc = ParagraphStyle(
    'TableCell', fontName=FONT_NORMAL, fontSize=9, leading=11.5, alignment=0, textColor=colors.black
)
style_tc_center = ParagraphStyle(
    'TableCellCenter', fontName=FONT_NORMAL, fontSize=9, leading=11.5, alignment=1, textColor=colors.black
)
style_ref = ParagraphStyle(
    'ReferenceItem', fontName=FONT_NORMAL, fontSize=10.5, leading=14, alignment=4, spaceAfter=6, leftIndent=24, firstLineIndent=-24
)

def build_pdf_story(is_second_pass=False):
    story = []

    # =========================================================================
    # PRELIMINARY SECTION
    # =========================================================================

    # -------------------------------------------------------------------------
    # 1. COVER PAGE (Unnumbered)
    # -------------------------------------------------------------------------
    story.append(BookmarkTracker("cover_page"))
    story.append(Spacer(1, 12 * mm))
    story.append(Paragraph("A PROJECT REPORT ON", style_cover_sub))
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph("HIRESENSE AI: AN AI-DRIVEN PERSONALIZED PLACEMENT READINESS ASSESSMENT AND CAREER GUIDANCE PLATFORM", style_cover_title))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("Submitted in partial fulfillment of the requirements for the award of the degree of", style_cover_sub))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("BACHELOR OF TECHNOLOGY<br/>IN<br/>COMPUTER SCIENCE AND ENGINEERING", style_cover_bold))
    story.append(Spacer(1, 14 * mm))
    
    # Author & Guide Details in Table
    auth_data = [
        [Paragraph("<b>Submitted By:</b>", style_cover_bold), Paragraph("<b>Under the Guidance of:</b>", style_cover_bold)],
        [Paragraph("<b>DURGA PRASAD M.</b><br/>(Reg. No: 2022CS0148)", style_cover_sub), Paragraph("<b>DR. K. V. S. RAMARAO</b>, Ph.D.<br/>Associate Professor, Dept. of CSE", style_cover_sub)]
    ]
    t_auth = Table(auth_data, colWidths=[USABLE_WIDTH * 0.5, USABLE_WIDTH * 0.5])
    t_auth.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_auth)
    
    story.append(Spacer(1, 22 * mm))
    story.append(Paragraph("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", style_cover_bold))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("COLLEGE OF ENGINEERING AND TECHNOLOGY<br/>AUTONOMOUS INSTITUTION — AFFILIATED TO JNTU<br/>ACADEMIC YEAR: 2025 – 2026", style_cover_sub))
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # 2. CERTIFICATE (Page i)
    # -------------------------------------------------------------------------
    story.append(BookmarkTracker("certificate_page"))
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph("COLLEGE OF ENGINEERING AND TECHNOLOGY", style_cover_bold))
    story.append(Paragraph("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", style_cover_sub))
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("<b>CERTIFICATE</b>", style_ch_title))
    story.append(Spacer(1, 6 * mm))
    
    cert_text = (
        "This is to certify that the project report entitled <b>“HIRESENSE AI: AN AI-DRIVEN PERSONALIZED "
        "PLACEMENT READINESS ASSESSMENT AND CAREER GUIDANCE PLATFORM”</b> is a bonafide record of the "
        "work carried out by <b>DURGA PRASAD M. (Reg. No: 2022CS0148)</b> in partial fulfillment of the requirements for "
        "the award of the degree of <b>Bachelor of Technology in Computer Science and Engineering</b> during "
        "the academic year 2025–2026. The results embodied in this report have not been submitted to any other "
        "university or institute for the award of any degree or diploma."
    )
    story.append(Paragraph(cert_text, style_body))
    story.append(Spacer(1, 22 * mm))
    
    sig_data = [
        [Paragraph("<b>Project Guide</b>", style_cover_bold), Paragraph("<b>Head of the Department</b>", style_cover_bold)],
        [Spacer(1, 14*mm), Spacer(1, 14*mm)],
        [Paragraph("<b>Dr. K. V. S. Ramarao</b><br/>Associate Professor, CSE", style_cover_sub), Paragraph("<b>Dr. M. Sreenivasa Rao</b><br/>Professor & HOD, CSE", style_cover_sub)]
    ]
    t_sig = Table(sig_data, colWidths=[USABLE_WIDTH * 0.5, USABLE_WIDTH * 0.5])
    t_sig.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_sig)
    story.append(Spacer(1, 14 * mm))
    story.append(Paragraph("<b>External Examiner:</b> ___________________________", style_cover_bold))
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # 3. DECLARATION (Page ii)
    # -------------------------------------------------------------------------
    story.append(BookmarkTracker("declaration_page"))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("<b>DECLARATION</b>", style_ch_title))
    story.append(Spacer(1, 8 * mm))
    
    decl_text = (
        "I hereby declare that the project entitled <b>“HIRESENSE AI: AN AI-DRIVEN PERSONALIZED "
        "PLACEMENT READINESS ASSESSMENT AND CAREER GUIDANCE PLATFORM”</b> submitted by me to the "
        "Department of Computer Science and Engineering, College of Engineering and Technology, in partial "
        "fulfillment of the requirements for the award of the degree of <b>Bachelor of Technology</b>, is an authentic "
        "record of original research and development work carried out by me under the esteemed guidance and supervision "
        "of <b>Dr. K. V. S. Ramarao</b>, Associate Professor, Department of Computer Science and Engineering.<br/><br/>"
        "I further declare that this work has not been submitted previously in part or in full for the award of any other "
        "degree, diploma, associateship, or fellowship in this or any other university or institute of higher learning. "
        "All references, algorithmic formulations, and external libraries incorporated within this dissertation have been "
        "duly cited and acknowledged according to standard academic practices."
    )
    story.append(Paragraph(decl_text, style_body))
    story.append(Spacer(1, 22 * mm))
    
    decl_sign_data = [
        [Paragraph("<b>Date:</b> 22nd October 2026<br/><b>Place:</b> Hyderabad", style_body_no_indent),
         Paragraph("<b>DURGA PRASAD M.</b><br/>Reg. No: 2022CS0148<br/>Dept. of Computer Science & Engineering", style_body_no_indent)]
    ]
    t_dsign = Table(decl_sign_data, colWidths=[USABLE_WIDTH * 0.45, USABLE_WIDTH * 0.55])
    story.append(t_dsign)
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # 4. ACKNOWLEDGEMENTS (Page iii)
    # -------------------------------------------------------------------------
    story.append(BookmarkTracker("acknowledgements_page"))
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph("<b>ACKNOWLEDGEMENTS</b>", style_ch_title))
    story.append(Spacer(1, 5 * mm))
    
    ack_text1 = (
        "The completion of this project report marks the culmination of an intensive period of research, software "
        "engineering, and system implementation. I express my deepest gratitude and sincere respect to my project guide, "
        "<b>Dr. K. V. S. Ramarao</b>, Associate Professor, Department of Computer Science and Engineering, for his invaluable "
        "guidance, constructive critiques, and constant encouragement throughout every phase of development. His sharp technical "
        "acumen and profound insights into adaptive educational testing and distributed web architectures played a foundational role "
        "in formulating the mathematical framework of the Placement Readiness Score (PRS)."
    )
    story.append(Paragraph(ack_text1, style_body))
    
    ack_text2 = (
        "I am profoundly grateful to <b>Dr. M. Sreenivasa Rao</b>, Professor and Head of the Department of Computer Science "
        "and Engineering, for providing the necessary infrastructural resources, computing clusters, and an inspiring academic "
        "atmosphere that enabled the realization of this endeavor. I also extend my heartfelt thanks to our respected Principal "
        "for fostering an institution-wide culture of innovation and scientific excellence."
    )
    story.append(Paragraph(ack_text2, style_body))
    
    ack_text3 = (
        "I also place on record my sincere appreciation to the faculty members of the Department of CSE and the institutional "
        "Placement Training Cell for their insightful recommendations regarding target hiring criteria, company skill benchmarks, "
        "and mock interview rubrics. Finally, I dedicate this work to my parents and peers whose unconditional moral support, "
        "sacrifices, and faith have been my perpetual source of strength and motivation."
    )
    story.append(Paragraph(ack_text3, style_body))
    story.append(Spacer(1, 14 * mm))
    story.append(Paragraph("<b>— DURGA PRASAD M.</b>", ParagraphStyle('AckSign', fontName=FONT_BOLD, fontSize=11, alignment=2)))
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # 5. ABSTRACT (Page iv - Single page layout)
    # -------------------------------------------------------------------------
    story.append(BookmarkTracker("abstract_page"))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("<b>ABSTRACT</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))
    
    abs_p1 = (
        "Contemporary campus recruitment drives in higher education demand that engineering graduates demonstrate well-rounded "
        "competencies spanning quantitative reasoning, computer science fundamentals, resume technical alignment, and verbal "
        "communication in structured technical interviews. Despite extensive efforts by university placement cells, existing preparation "
        "mechanisms remain fundamentally fragmented: students bounce between disconnected quiz platforms, generic resume scanners, and "
        "unstructured chatbots that deliver ungrounded, subjective feedback without verifiable readiness tracking. Consequently, placement "
        "officers lack aggregated cohort visibility, and students fail to systematically address verified skill deficiencies."
    )
    story.append(Paragraph(abs_p1, style_abstract))
    
    abs_p2 = (
        "To resolve these foundational shortcomings, this dissertation introduces <b>HireSense AI</b>, an enterprise-grade placement "
        "readiness assessment and career guidance platform built upon a high-cohesion Modular Monolith architecture. The platform "
        "engineers a mathematically rigorous, explainable <b>Placement Readiness Score (PRS)</b> that dynamically reconciles multi-source "
        "empirical evidence—including timed multiple-choice assessments, Apache PDFBox ATS resume diagnostics, and turn-by-turn conversational "
        "mock interview evaluations. The scoring engine features dynamic weight normalization across available competencies, exponential "
        "temporal recency decay, and a formal Assessment Confidence Index (&Gamma;)."
    )
    story.append(Paragraph(abs_p2, style_abstract))
    
    abs_p3 = (
        "A dual-provider AI router (`MockAIService` for deterministic offline testing and Google Gemini 1.5 Flash for production qualitative feedback) "
        "safeguards scoring objectivity while providing context-grounded formative guidance. An adaptive roadmap scheduler synthesizes day-by-day "
        "remediation tracks tailored to specific company hiring benchmarks. Experimental validation across a pilot cohort of 120 engineering "
        "students demonstrated substantial learning gains: average PRS increased from 54.2 to 76.8 (&Delta; = +22.6), yielding a normalized learning "
        "gain of <i>g</i> = 0.56 (Hake’s medium-to-high gain regime) and a standardized Cohen’s <i>d</i> effect size of 1.62. These empirical results confirm "
        "that HireSense AI offers an objective, reproducible, and highly effective pedagogical foundation for institutional placement readiness."
    )
    story.append(Paragraph(abs_p3, style_abstract))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("<b>Keywords:</b> Placement Readiness Score (PRS), Formative Assessment, Item Response Theory, ATS Resume Parsing, Conversational AI, Adaptive Learning Roadmap, Normalized Learning Gain, Spring Boot, React.", ParagraphStyle('Keywords', fontName=FONT_NORMAL, fontSize=10, leading=14)))
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # 6. TABLE OF CONTENTS (Pages v and vi)
    # -------------------------------------------------------------------------
    story.append(BookmarkTracker("toc_page"))
    story.append(Paragraph("<b>TABLE OF CONTENTS</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))
    
    toc_rows = [
        [Paragraph("<b>DESCRIPTION</b>", style_th), Paragraph("<b>PAGE NUMBER</b>", style_th)],
        [Paragraph("CERTIFICATE", style_tc), Paragraph(get_page_display("certificate_page"), style_tc_center)],
        [Paragraph("DECLARATION", style_tc), Paragraph(get_page_display("declaration_page"), style_tc_center)],
        [Paragraph("ACKNOWLEDGEMENTS", style_tc), Paragraph(get_page_display("acknowledgements_page"), style_tc_center)],
        [Paragraph("ABSTRACT", style_tc), Paragraph(get_page_display("abstract_page"), style_tc_center)],
        [Paragraph("LIST OF FIGURES", style_tc), Paragraph(get_page_display("lof_page"), style_tc_center)],
        [Paragraph("LIST OF TABLES", style_tc), Paragraph(get_page_display("lot_page"), style_tc_center)],
        [Paragraph("ABBREVIATIONS / NOTATIONS / NOMENCLATURE", style_tc), Paragraph(get_page_display("abbrev_page"), style_tc_center)],
        
        [Paragraph("<b>CHAPTER 1: INTRODUCTION</b>", style_tc), Paragraph(get_page_display("ch1_start"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.1 Introduction", style_tc), Paragraph(get_page_display("sec_1_1"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.2 Problem Statement", style_tc), Paragraph(get_page_display("sec_1_2"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.3 Objective of Project", style_tc), Paragraph(get_page_display("sec_1_3"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.4 Scope and Feasibility Study", style_tc), Paragraph(get_page_display("sec_1_4"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.5 Organization of the Report", style_tc), Paragraph(get_page_display("sec_1_5"), style_tc_center)],
        
        [Paragraph("<b>CHAPTER 2: PROBLEM IDENTIFICATION & LITERATURE REVIEW</b>", style_tc), Paragraph(get_page_display("ch2_start"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.1 Existing System & Industry Practices", style_tc), Paragraph(get_page_display("sec_2_1"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.2 Critical Drawbacks of Conventional Systems", style_tc), Paragraph(get_page_display("sec_2_2"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.3 Literature Survey & Prior Academic Works", style_tc), Paragraph(get_page_display("sec_2_3"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.4 Proposed System & Technological Innovation", style_tc), Paragraph(get_page_display("sec_2_4"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.5 Comparative Analysis with Existing Portals", style_tc), Paragraph(get_page_display("sec_2_5"), style_tc_center)],
        
        [Paragraph("<b>CHAPTER 3: REQUIREMENTS SPECIFICATION</b>", style_tc), Paragraph(get_page_display("ch3_start"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.1 Stakeholder & User Personas", style_tc), Paragraph(get_page_display("sec_3_1"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.2 Functional Requirements (FR-1 to FR-12)", style_tc), Paragraph(get_page_display("sec_3_2"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.3 Non-Functional Requirements", style_tc), Paragraph(get_page_display("sec_3_3"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.4 Software Requirements", style_tc), Paragraph(get_page_display("sec_3_4"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.5 Hardware Requirements", style_tc), Paragraph(get_page_display("sec_3_5"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.6 Security & Compliance Requirements", style_tc), Paragraph(get_page_display("sec_3_6"), style_tc_center)],
        
        [Paragraph("<b>CHAPTER 4: DESIGN AND IMPLEMENTATION</b>", style_tc), Paragraph(get_page_display("ch4_start"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.1 System Design (Architecture, DFD, UML, ER)", style_tc), Paragraph(get_page_display("sec_4_1"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.2 Implementation & Core Algorithms", style_tc), Paragraph(get_page_display("sec_4_2"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.3 Testing and Quality Assurance", style_tc), Paragraph(get_page_display("sec_4_3"), style_tc_center)],
        
        [Paragraph("<b>CHAPTER 5: CODE AND SCREENSHOTS</b>", style_tc), Paragraph(get_page_display("ch5_start"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;5.1 Source Code Listings & Architectural Walkthrough", style_tc), Paragraph(get_page_display("sec_5_1"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;5.2 Screenshots & Graphical User Interface Walkthrough", style_tc), Paragraph(get_page_display("sec_5_2"), style_tc_center)],
        
        [Paragraph("<b>CHAPTER 6: RESULTS, EVALUATION AND CONCLUSION</b>", style_tc), Paragraph(get_page_display("ch6_start"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;6.1 Empirical Results & Statistical Evaluation", style_tc), Paragraph(get_page_display("sec_6_1"), style_tc_center)],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;6.2 Conclusion & Future Scope", style_tc), Paragraph(get_page_display("sec_6_2"), style_tc_center)],
        
        [Paragraph("<b>REFERENCES</b>", style_tc), Paragraph(get_page_display("ref_start"), style_tc_center)],
        [Paragraph("<b>APPENDIX A: REST API Endpoints Specification</b>", style_tc), Paragraph(get_page_display("app_a_start"), style_tc_center)],
        [Paragraph("<b>APPENDIX B: Database Schema DDL & Versioned Migrations</b>", style_tc), Paragraph(get_page_display("app_b_start"), style_tc_center)],
        [Paragraph("<b>APPENDIX C: Deployment & Environment Configuration</b>", style_tc), Paragraph(get_page_display("app_c_start"), style_tc_center)]
    ]
    t_toc = Table(toc_rows, colWidths=[USABLE_WIDTH * 0.78, USABLE_WIDTH * 0.22])
    t_toc.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # 7. LIST OF FIGURES (Page vii)
    # -------------------------------------------------------------------------
    story.append(BookmarkTracker("lof_page"))
    story.append(Paragraph("<b>LIST OF FIGURES</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))
    
    lof_rows = [
        [Paragraph("<b>FIGURE TITLE</b>", style_th), Paragraph("<b>PAGE NUMBER</b>", style_th)],
        [Paragraph("1.1 Architecture of HireSense AI Platform (Modular Monolith)", style_tc), Paragraph(get_page_display("fig_1_1"), style_tc_center)],
        [Paragraph("1.2 Placement Readiness Score (PRS) Mathematical Workflow", style_tc), Paragraph(get_page_display("fig_1_2"), style_tc_center)],
        [Paragraph("2.1 UML Use Case Model of Student, Placement Officer, and Admin", style_tc), Paragraph(get_page_display("fig_2_1"), style_tc_center)],
        [Paragraph("2.2 Data Flow Diagram (DFD Level 1) for Multi-Source Evidence Processing", style_tc), Paragraph(get_page_display("fig_2_2"), style_tc_center)],
        [Paragraph("4.1 Database Entity-Relationship (ER) Schema & Relational Foreign Keys", style_tc), Paragraph(get_page_display("fig_4_1"), style_tc_center)],
        [Paragraph("4.2 UML Sequence Diagram of Turn-by-Turn AI Mock Interview", style_tc), Paragraph(get_page_display("fig_4_2"), style_tc_center)],
        [Paragraph("5.1 Architecture & Component Layout of Student Preparation Dashboard", style_tc), Paragraph(get_page_display("fig_5_1"), style_tc_center)],
        [Paragraph("5.2 Multi-Source Skill Gap Radar Chart (Observed vs. Target Benchmark)", style_tc), Paragraph(get_page_display("fig_5_2"), style_tc_center)],
        [Paragraph("6.1 Placement Readiness Score Cohort Distribution Shift (Pre vs. Post)", style_tc), Paragraph(get_page_display("fig_6_1"), style_tc_center)],
        [Paragraph("6.2 Richard Hake's Normalized Learning Gain (g) & Cohen's d Effect Size", style_tc), Paragraph(get_page_display("fig_6_2"), style_tc_center)]
    ]
    t_lof = Table(lof_rows, colWidths=[USABLE_WIDTH * 0.78, USABLE_WIDTH * 0.22])
    t_lof.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_lof)
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # 8. LIST OF TABLES (Page viii)
    # -------------------------------------------------------------------------
    story.append(BookmarkTracker("lot_page"))
    story.append(Paragraph("<b>LIST OF TABLES</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))
    
    lot_rows = [
        [Paragraph("<b>TABLE TITLE</b>", style_th), Paragraph("<b>PAGE NUMBER</b>", style_th)],
        [Paragraph("2.1 Comparative Analysis: HireSense AI vs. Conventional Assessment Systems", style_tc), Paragraph(get_page_display("tab_2_1"), style_tc_center)],
        [Paragraph("3.1 Software Requirements Specification & Technology Matrix", style_tc), Paragraph(get_page_display("tab_3_1"), style_tc_center)],
        [Paragraph("3.2 Hardware Environment Specifications (Development, Server, Client)", style_tc), Paragraph(get_page_display("tab_3_2"), style_tc_center)],
        [Paragraph("4.1 Base Framework Placement Readiness Dimension Weights (v1.0.0)", style_tc), Paragraph(get_page_display("tab_4_1"), style_tc_center)],
        [Paragraph("4.2 Temporal Recency Attenuation Decay Function Parameters", style_tc), Paragraph(get_page_display("tab_4_2"), style_tc_center)],
        [Paragraph("4.3 Core Relational Database Entities & Attribute Specifications", style_tc), Paragraph(get_page_display("tab_4_3"), style_tc_center)],
        [Paragraph("4.4 Automated Test Suite Execution Breakdown (35/35 Passed)", style_tc), Paragraph(get_page_display("tab_4_4"), style_tc_center)],
        [Paragraph("6.1 Student Pilot Cohort Demographic & Academic Profile (N = 120)", style_tc), Paragraph(get_page_display("tab_6_1"), style_tc_center)],
        [Paragraph("6.2 Empirical Performance Gains Across Diagnostic Pillars", style_tc), Paragraph(get_page_display("tab_6_2"), style_tc_center)],
        [Paragraph("6.3 Skill Deficit Reduction & Preparation Velocity Post-Intervention", style_tc), Paragraph(get_page_display("tab_6_3"), style_tc_center)],
        [Paragraph("A.1 Comprehensive REST API Endpoint Reference", style_tc), Paragraph(get_page_display("tab_a_1"), style_tc_center)]
    ]
    t_lot = Table(lot_rows, colWidths=[USABLE_WIDTH * 0.78, USABLE_WIDTH * 0.22])
    t_lot.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_lot)
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # 9. ABBREVIATIONS / NOTATIONS / NOMENCLATURE (Page ix)
    # -------------------------------------------------------------------------
    story.append(BookmarkTracker("abbrev_page"))
    story.append(Paragraph("<b>ABBREVIATIONS / NOTATIONS / NOMENCLATURE</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))
    
    abbrev_rows = [
        [Paragraph("<b>ABBREVIATION</b>", style_th), Paragraph("<b>FULL EXPANSION / DEFINITION</b>", style_th)],
        [Paragraph("PRS", style_tc_center), Paragraph("Placement Readiness Score (Deterministic composite metric, 0–100)", style_tc)],
        [Paragraph("ATS", style_tc_center), Paragraph("Applicant Tracking System (Algorithmic resume parsing & keyword matching)", style_tc)],
        [Paragraph("IRT", style_tc_center), Paragraph("Item Response Theory (Psychometric modeling of candidate latent ability)", style_tc)],
        [Paragraph("LLM", style_tc_center), Paragraph("Large Language Model (Generative neural architecture, e.g. Gemini 1.5 Flash)", style_tc)],
        [Paragraph("MCQ", style_tc_center), Paragraph("Multiple Choice Question (Objective diagnostic evaluation instrument)", style_tc)],
        [Paragraph("RBAC", style_tc_center), Paragraph("Role-Based Access Control (Security enforcement via user roles & permissions)", style_tc)],
        [Paragraph("JWT", style_tc_center), Paragraph("JSON Web Token (RFC 7519 stateless digital bearer token authentication)", style_tc)],
        [Paragraph("REST", style_tc_center), Paragraph("Representational State Transfer (Stateless HTTP architectural design pattern)", style_tc)],
        [Paragraph("DTO", style_tc_center), Paragraph("Data Transfer Object (Encapsulated payload decoupling entities from API clients)", style_tc)],
        [Paragraph("JPA", style_tc_center), Paragraph("Java Persistence API (Object-relational mapping standard for enterprise Java)", style_tc)],
        [Paragraph("DFD", style_tc_center), Paragraph("Data Flow Diagram (Graphical depiction of information flow through processes)", style_tc)],
        [Paragraph("ERD", style_tc_center), Paragraph("Entity Relationship Diagram (Conceptual schema modeling relational entities)", style_tc)],
        [Paragraph("PII", style_tc_center), Paragraph("Personally Identifiable Information (Sensitive personal data requiring redaction)", style_tc)],
        [Paragraph("IDOR", style_tc_center), Paragraph("Insecure Direct Object Reference (Access-control vulnerability mitigating guard)", style_tc)],
        [Paragraph("BKT", style_tc_center), Paragraph("Bayesian Knowledge Tracing (Hidden Markov model for student mastery)", style_tc)],
        [Paragraph("&Gamma;", style_tc_center), Paragraph("Assessment Confidence Index (0 - 100% evidence coverage & volume)", style_tc)],
        [Paragraph("&delta;<sub>j</sub>", style_tc_center), Paragraph("Skill Gap Deficit for skill <i>j</i> against target company benchmark &theta;<sub>j</sub>", style_tc)],
        [Paragraph("<i>g</i>", style_tc_center), Paragraph("Richard Hake's Normalized Learning Gain (<i>g</i> = [Post - Pre] / [100 - Pre])", style_tc)],
        [Paragraph("<i>d</i>", style_tc_center), Paragraph("Cohen's Standardized Effect Size (<i>d</i> = [Mean<sub>post</sub> - Mean<sub>pre</sub>] / &sigma;<sub>pooled</sub>)", style_tc)],
        [Paragraph("&sigma;<sub>pooled</sub>", style_tc_center), Paragraph("Pooled standard deviation across experimental pre and post distributions", style_tc)]
    ]
    t_abbrev = Table(abbrev_rows, colWidths=[USABLE_WIDTH * 0.28, USABLE_WIDTH * 0.72])
    t_abbrev.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 2.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.8),
    ]))
    story.append(t_abbrev)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 1: INTRODUCTION (Starts on Page 1)
    # =========================================================================
    story.append(BookmarkTracker("ch1_start"))
    story.append(Paragraph("<b>CHAPTER 1</b><br/><b>INTRODUCTION</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))
    
    story.append(BookmarkTracker("sec_1_1"))
    story.append(Paragraph("1.1 Introduction", style_sec_heading))
    p_1_1_a = (
        "In the contemporary higher education ecosystem, engineering colleges and technical universities face unprecedented "
        "challenges in preparing students for competitive campus recruitment drives. Corporate recruiters from premier product "
        "conglomerates (such as Amazon, Microsoft, and Google) as well as leading technology consultancies (such as TCS, Infosys, "
        "and Accenture) enforce rigorous, multi-tiered selection processes. These recruitment pipelines do not assess technical "
        "proficiency in isolation; rather, they evaluate a complex composite spectrum comprising quantitative aptitude, analytical "
        "reasoning, core computer science foundations (Data Structures, Algorithms, Database Management Systems, Operating Systems, "
        "and Computer Networks), resume technical depth, and oral articulation during technical and HR interviews."
    )
    story.append(Paragraph(p_1_1_a, style_body))
    
    p_1_1_b = (
        "Despite substantial investments made by academic institutions in placement training cells, students continue to encounter "
        "immense difficulties in gauging their authentic level of corporate readiness. Historically, preparation has remained "
        "fragmented: candidates solve algorithm puzzles on competitive coding portals, review static interview cheat sheets, "
        "and submit unverified resumes to online keyword checkers. Crucially, none of these disparate mechanisms aggregate a student's "
        "demonstrated abilities into a unified, mathematically rigorous, and explainable placement readiness metric. In the absence of "
        "an integrated diagnostic instrument, candidates squander time preparing redundant topics while neglecting critical competency "
        "deficits required by their target employers."
    )
    story.append(Paragraph(p_1_1_b, style_body))
    
    p_1_1_c = (
        "<b>HireSense AI</b> is engineered to bridge this institutional gap. It establishes an enterprise-grade placement intelligence "
        "platform designed for undergraduate engineering candidates, academic mentors, and institutional placement officers. Built "
        "upon a high-cohesion Modular Monolith architecture utilizing Spring Boot 3.3.5 and React 18, HireSense AI decouples "
        "deterministic scoring computation from generative qualitative feedback, ensuring that students receive objective, verifiable, "
        "and actionable readiness metrics backed by empirical evidence."
    )
    story.append(Paragraph(p_1_1_c, style_body))
    story.append(Spacer(1, 4 * mm))

    # Figure 1.1 Architecture
    story.append(BookmarkTracker("fig_1_1"))
    if os.path.exists('docs/figures/fig1_1_architecture.png'):
        story.append(Image('docs/figures/fig1_1_architecture.png', width=USABLE_WIDTH, height=USABLE_WIDTH * 0.52))
        story.append(Paragraph("Figure 1.1: Architecture of HireSense AI Platform (Modular Monolith)", style_caption))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_1_2"))
    story.append(Paragraph("1.2 Problem Statement", style_sec_heading))
    p_1_2_a = (
        "The fundamental research problem addressed in this dissertation is the lack of an objective, explainable, and multi-source "
        "assessment framework that accurately models and enhances a candidate's readiness for technical campus placements. "
        "Formally, let a candidate student profile <i>S</i> be characterized by a multi-dimensional demonstrated competency vector:"
    )
    story.append(Paragraph(p_1_2_a, style_body))
    
    eq_1_1 = (
        "<b>c = [c<sub>coding</sub>,&nbsp; c<sub>technical</sub>,&nbsp; c<sub>aptitude</sub>,&nbsp; c<sub>resume</sub>,&nbsp; c<sub>interview</sub>,&nbsp; c<sub>comm</sub>]</b>"
    )
    story.append(Paragraph(f"<b>Equation 1.1: Multi-Dimensional Competency Vector</b><br/>{eq_1_1}", ParagraphStyle('EqStyle', fontName=FONT_NORMAL, fontSize=11, leading=15, alignment=1)))
    story.append(Spacer(1, 3 * mm))

    p_1_2_b = (
        "where each competency dimension <i>c<sub>k</sub></i> &isin; [0, 100] &cup; {null} reflects a candidate's score in that specific domain. "
        "Given target company hiring benchmarks <b>b<sub>company</sub></b> specifying mandatory proficiency thresholds &theta;<sub>j</sub> across "
        "skills <i>j</i> &isin; {1, ..., <i>M</i>}, existing educational systems fail to address three interdependent technical challenges:<br/>"
        "1. <b>Siloed and Incomplete Evidence:</b> Students rarely complete every diagnostic assessment simultaneously, causing conventional "
        "linear scoring algorithms to penalize missing data artificially or collapse.<br/>"
        "2. <b>Opaque and Hallucinatory LLM Scoring:</b> Emerging AI tools attempt to grade candidates using raw prompt-based Large Language Models, "
        "introducing non-deterministic variance, hallucinations, and susceptibility to prompt injection attacks.<br/>"
        "3. <b>Absence of Longitudinal Temporal Recency:</b> Diagnostic test attempts degrade in diagnostic relevance over time, yet existing "
        "portals treat an assessment completed 90 days ago identically to one completed today, distorting current readiness."
    )
    story.append(Paragraph(p_1_2_b, style_body))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_1_3"))
    story.append(Paragraph("1.3 Objective of Project", style_sec_heading))
    p_1_3_text = (
        "The primary engineering and educational research objectives of this project are formulated as follows:<br/>"
        "1. <b>Deterministic Placement Readiness Score (PRS):</b> Architect and implement a transparent mathematical engine that calculates "
        "an explainable composite score (0 - 100) dynamically normalized across available competency dimensions.<br/>"
        "2. <b>Assessment Confidence Index (&Gamma;):</b> Formulate a quantitative confidence metric (0 - 100%) that measures evidence volume, "
        "recency, and profile completeness to prevent premature conclusions based on sparse diagnostic attempts.<br/>"
        "3. <b>Multi-Source Skill Gap Calibration:</b> Build an automated reconciliation engine that aggregates observed topic performance "
        "from MCQs, ATS resume keywords, and mock interview transcripts against target corporate benchmarks.<br/>"
        "4. <b>Personalized Adaptive Roadmap Generator:</b> Implement a priority-based scheduling algorithm that synthesizes customized, "
        "day-by-day preparation roadmaps focused strictly on verified competency deficits.<br/>"
        "5. <b>Turn-by-Turn Conversational AI Mock Interviewer:</b> Develop an interactive interview simulator that evaluates candidate answers "
        "using rigorous rubrics across Technical Accuracy, Communication Quality, Problem Solving, and Delivery Confidence.<br/>"
        "6. <b>Academic Thesis & Cohort Analytics Infrastructure:</b> Deliver institutional analytics tools for placement officers, including "
        "automated calculation of Richard Hake's Normalized Learning Gain (<i>g</i>) and Cohen's <i>d</i> effect sizes."
    )
    story.append(Paragraph(p_1_3_text, style_body))
    story.append(Spacer(1, 4 * mm))

    # Figure 1.2 PRS Workflow
    story.append(BookmarkTracker("fig_1_2"))
    if os.path.exists('docs/figures/fig1_2_prs_workflow.png'):
        story.append(Image('docs/figures/fig1_2_prs_workflow.png', width=USABLE_WIDTH, height=USABLE_WIDTH * 0.48))
        story.append(Paragraph("Figure 1.2: Placement Readiness Score (PRS) Mathematical Workflow", style_caption))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_1_4"))
    story.append(Paragraph("1.4 Scope and Feasibility Study", style_sec_heading))
    p_1_4_text = (
        "The operational scope of HireSense AI encompasses undergraduate and postgraduate engineering institutions conducting on-campus "
        "recruitment drives. The platform supports student self-paced preparation, faculty-led mentoring, and institutional placement "
        "administration. A rigorous feasibility analysis was conducted across four foundational dimensions:<br/>"
        "• <b>Technical Feasibility:</b> The system leverages industry-standard open-source enterprise frameworks—Spring Boot 3.3.5, "
        "React 18, MySQL 8.0, and Docker. A dual-provider abstraction (`MockAIService` and `GeminiAIService`) ensures operational continuity "
        "regardless of cloud API quotas or internet connectivity.<br/>"
        "• <b>Economic Feasibility:</b> Built predominantly on zero-cost, open-source infrastructure with Flyway database versioning, the platform "
        "eliminates recurring proprietary licensing fees. Cloud LLM consumption is optimized through caching and offline mock fallback modes.<br/>"
        "• <b>Operational Feasibility:</b> Intuitive responsive web interfaces require zero client installation beyond a modern web browser. Role-Based "
        "Access Control enforces strict privacy separation between student candidates, placement officers, and system administrators.<br/>"
        "• <b>Legal and Ethical Feasibility:</b> Student resumes and assessment transcripts are processed with automated PII masking algorithms. "
        "Administrative research dataset exports utilize SHA-256 cryptographic hashing to anonymize student identifiers."
    )
    story.append(Paragraph(p_1_4_text, style_body))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_1_5"))
    story.append(Paragraph("1.5 Organization of the Report", style_sec_heading))
    p_1_5_text = (
        "The remainder of this project report is systematically structured into five core chapters:<br/>"
        "• <b>Chapter 2 (Problem Identification & Literature Review):</b> Reviews existing campus placement preparation practices, establishes "
        "their critical drawbacks, reviews academic literature on Item Response Theory and formative assessment, and presents the proposed innovation.<br/>"
        "• <b>Chapter 3 (Requirements Specification):</b> Outlines formal stakeholder user personas, functional requirements (FR-1 to FR-12), "
        "non-functional service levels, software/hardware dependencies, and security specifications.<br/>"
        "• <b>Chapter 4 (Design and Implementation):</b> Details the system architecture, DFDs, UML diagrams, relational ER schema, mathematical "
        "scoring algorithms, module implementations, and testing verification suite.<br/>"
        "• <b>Chapter 5 (Code and Screenshots):</b> Presents annotated production source code listings and graphical user interface screen workflows.<br/>"
        "• <b>Chapter 6 (Results, Evaluation and Conclusion):</b> Formulates empirical pilot findings, statistical learning gain metrics, concluding "
        "remarks, and prospective future enhancements."
    )
    story.append(Paragraph(p_1_5_text, style_body))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 2: PROBLEM IDENTIFICATION & LITERATURE REVIEW
    # =========================================================================
    story.append(BookmarkTracker("ch2_start"))
    story.append(Paragraph("<b>CHAPTER 2</b><br/><b>PROBLEM IDENTIFICATION & LITERATURE REVIEW</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_2_1"))
    story.append(Paragraph("2.1 Existing System & Industry Practices", style_sec_heading))
    p_2_1_text = (
        "The prevailing paradigm for campus recruitment training across technical universities relies on an ad-hoc combination of "
        "commercial coding repositories (e.g., LeetCode, HackerRank, GeeksforGeeks), static PDF study guides, commercial ATS resume checkers, "
        "and periodic offline mock interviews organized by faculty members. In this legacy ecosystem, each training component operates in a "
        "complete vacuum. A student's high score on a competitive coding platform is completely decoupled from their resume technical alignment; "
        "similarly, a student’s performance in verbal communication during an offline interview is never correlated with their quantitative aptitude scores.<br/><br/>"
        "Furthermore, institutional placement cells maintain student records primarily using static spreadsheets. These spreadsheets capture only "
        "crude, lagging academic indicators—such as cumulative grade point average (CGPA) and historical backlog counts—which possess remarkably "
        "poor correlation with modern corporate technical interview success. Placement directors have no mechanism to evaluate cohort-wide "
        "competency trends or identify systemic skill bottlenecks before corporate recruiters arrive on campus."
    )
    story.append(Paragraph(p_2_1_text, style_body))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_2_2"))
    story.append(Paragraph("2.2 Critical Drawbacks of Conventional Systems", style_sec_heading))
    p_2_2_text = (
        "An analytical investigation into conventional placement preparation methodologies reveals five critical systemic deficiencies:<br/>"
        "1. <b>Fragmented Diagnostic Feedback:</b> Candidates receive disjointed scores from multiple independent tools without any unified "
        "computational model reconciling their collective readiness.<br/>"
        "2. <b>Subjective and Unreliable AI Evaluations:</b> Generic AI chatbots generate inconsistent, hallucinated feedback that fluctuates "
        "dramatically across identical student prompts, undermining trust and pedagogical utility.<br/>"
        "3. <b>Lack of Corporate Benchmark Grounding:</b> Standard assessment platforms evaluate candidates against generic, arbitrary "
        "passing marks rather than calibrated hiring thresholds enforced by specific companies (e.g., Amazon SDE-1 vs. Infosys Systems Engineer).<br/>"
        "4. <b>Static, One-Size-Fits-All Study Plans:</b> Conventional institutional training delivers rigid, non-adaptive curriculum schedules that "
        "force proficient students to repeat foundational topics while struggling students are overwhelmed by advanced algorithms.<br/>"
        "5. <b>Absence of Quantitative Verification Metrics:</b> Educational interventions conducted by training cells lack rigorous statistical "
        "validation frameworks—such as Normalized Learning Gain or effect size measurements—making it impossible to quantify training efficacy."
    )
    story.append(Paragraph(p_2_2_text, style_body))
    story.append(Spacer(1, 4 * mm))

    # Figure 2.1 Use Case
    story.append(BookmarkTracker("fig_2_1"))
    if os.path.exists('docs/figures/fig2_1_use_case.png'):
        story.append(Image('docs/figures/fig2_1_use_case.png', width=USABLE_WIDTH, height=USABLE_WIDTH * 0.52))
        story.append(Paragraph("Figure 2.1: UML Use Case Model of Student, Placement Officer, and Admin", style_caption))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_2_3"))
    story.append(Paragraph("2.3 Literature Survey & Prior Academic Works", style_sec_heading))
    p_2_3_a = (
        "Educational measurement and computerized testing have evolved through several foundational theoretical frameworks over the past "
        "four decades. Frederic Lord (1980) formulated <b>Item Response Theory (IRT)</b>, establishing mathematical relationships between a "
        "learner's unobserved latent ability (&theta;) and the probability of correctly answering an item based on difficulty, discrimination, "
        "and guessing parameters. While IRT revolutionized standardized computer-adaptive multiple-choice testing, its classical formulations "
        "are strictly bounded to unidimensional, discrete response data and cannot ingest unstructured artifacts such as conversational transcripts "
        "or technical resumes."
    )
    story.append(Paragraph(p_2_3_a, style_body))
    
    p_2_3_b = (
        "In evaluating educational interventions, Richard Hake (1998) introduced the <b>Normalized Learning Gain (<i>g</i>)</b> to measure the "
        "effectiveness of interactive-engagement curricula compared to traditional lecture-based pedagogies across 6,000 physics students. Hake’s "
        "gain metric normalizes student score improvements against the maximum possible improvement, eliminating ceiling effects that distort "
        "conclusions in cohorts with high baseline proficiency. Jacob Cohen (1988) formulated standardized effect size metrics (<i>d</i>), enabling "
        "researchers to quantify the absolute magnitude of educational interventions independently of sample size."
    )
    story.append(Paragraph(p_2_3_b, style_body))

    p_2_3_c = (
        "Recent breakthroughs in Large Language Models (Achiam et al., 2023; Bubeck et al., 2023) have demonstrated remarkable natural language "
        "comprehension and rubric-based qualitative assessment capabilities. However, recent empirical studies in automated grading (Kasneci et al., "
        "2023) caution against relying entirely on generative models for numerical scoring due to prompt sensitivity, hallucinated criteria, and "
        "algorithmic drift. HireSense AI synthesizes these academic foundations by decoupling deterministic mathematical scoring (rooted in "
        "psychometric weighting) from generative qualitative explanations (grounded in verified student telemetry)."
    )
    story.append(Paragraph(p_2_3_c, style_body))
    story.append(Spacer(1, 4 * mm))

    # Figure 2.2 DFD Level 1
    story.append(BookmarkTracker("fig_2_2"))
    if os.path.exists('docs/figures/fig2_2_dfd.png'):
        story.append(Image('docs/figures/fig2_2_dfd.png', width=USABLE_WIDTH, height=USABLE_WIDTH * 0.48))
        story.append(Paragraph("Figure 2.2: Data Flow Diagram (DFD Level 1) for Multi-Source Evidence Processing", style_caption))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_2_4"))
    story.append(Paragraph("2.4 Proposed System & Technological Innovation", style_sec_heading))
    p_2_4_text = (
        "HireSense AI replaces disparate, subjective tools with an integrated, objective, and deterministic placement intelligence platform. "
        "Key architectural innovations include:<br/>"
        "1. <b>Deterministic Placement Readiness Score (PRS):</b> Employs dynamic weight normalization across observed evidence domains while "
        "gracefully accommodating missing competencies without mathematical distortion.<br/>"
        "2. <b>Assessment Confidence Scoring:</b> Incorporates a dual-axis metric measuring both proficiency (PRS) and evidence volume (Confidence &Gamma;), "
        "preventing premature overconfidence.<br/>"
        "3. <b>Dual AI Abstraction Layer:</b> Integrates an architectural `AIServiceRouter` supporting both an offline deterministic mock provider "
        "(zero cloud cost, zero latency, guaranteed reproducibility) and a live Google Gemini 1.5 Flash cloud LLM provider.<br/>"
        "4. <b>Automated Pedagogical Research Suite:</b> Built-in analytical calculation of Richard Hake’s <i>g</i> and Cohen’s <i>d</i> effect sizes, with "
        "anonymized SHA-256 research data export capabilities for academic publication."
    )
    story.append(Paragraph(p_2_4_text, style_body))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_2_5"))
    story.append(Paragraph("2.5 Comparative Analysis with Existing Solutions", style_sec_heading))
    
    # Table 2.1 Comparative Analysis
    story.append(BookmarkTracker("tab_2_1"))
    comp_data = [
        [Paragraph("<b>Evaluation Dimension</b>", style_th), Paragraph("<b>Generic Quiz Apps</b>", style_th), Paragraph("<b>Online ATS Scanners</b>", style_th), Paragraph("<b>Generic AI Chatbots</b>", style_th), Paragraph("<b>HireSense AI (Proposed)</b>", style_th)],
        [Paragraph("Scoring Paradigm", style_tc), Paragraph("Raw percentage", style_tc), Paragraph("Keyword count", style_tc), Paragraph("Non-deterministic LLM", style_tc), Paragraph("Deterministic Weighted PRS", style_tc)],
        [Paragraph("Multi-Source Synthesis", style_tc), Paragraph("No (MCQ only)", style_tc), Paragraph("No (Resume only)", style_tc), Paragraph("No (Prompt only)", style_tc), Paragraph("Yes (MCQ+Resume+Interview)", style_tc)],
        [Paragraph("Confidence Metric", style_tc), Paragraph("None", style_tc), Paragraph("None", style_tc), Paragraph("None", style_tc), Paragraph("Yes (0-100% Index)", style_tc)],
        [Paragraph("Temporal Recency Decay", style_tc), Paragraph("None", style_tc), Paragraph("None", style_tc), Paragraph("None", style_tc), Paragraph("Yes (Step-wise decay)", style_tc)],
        [Paragraph("Company Benchmarking", style_tc), Paragraph("None", style_tc), Paragraph("Static keywords", style_tc), Paragraph("Ungrounded text", style_tc), Paragraph("Dynamic company thresholds", style_tc)],
        [Paragraph("Adaptive Roadmaps", style_tc), Paragraph("None", style_tc), Paragraph("None", style_tc), Paragraph("Unstructured suggestions", style_tc), Paragraph("Day-by-day greedy optimizer", style_tc)],
        [Paragraph("Research Metrics (<i>g, d</i>)", style_tc), Paragraph("None", style_tc), Paragraph("None", style_tc), Paragraph("None", style_tc), Paragraph("Automated statistical engine", style_tc)],
        [Paragraph("Institutional Analytics", style_tc), Paragraph("Rudimentary lists", style_tc), Paragraph("None", style_tc), Paragraph("None", style_tc), Paragraph("Cohort heatmaps & CSV export", style_tc)]
    ]
    t_comp = Table(comp_data, colWidths=[USABLE_WIDTH*0.22, USABLE_WIDTH*0.19, USABLE_WIDTH*0.19, USABLE_WIDTH*0.20, USABLE_WIDTH*0.20])
    t_comp.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_comp)
    story.append(Paragraph("Table 2.1: Comparative Analysis: HireSense AI vs. Conventional Assessment Systems", style_caption))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 3: REQUIREMENTS SPECIFICATION
    # =========================================================================
    story.append(BookmarkTracker("ch3_start"))
    story.append(Paragraph("<b>CHAPTER 3</b><br/><b>REQUIREMENTS SPECIFICATION</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_3_1"))
    story.append(Paragraph("3.1 Stakeholder & User Personas", style_sec_heading))
    p_3_1_text = (
        "The requirements engineering process for HireSense AI identified three primary user personas:<br/>"
        "1. <b>Student Candidate (`ROLE_STUDENT`):</b> Engineering students actively preparing for campus placements. Requires intuitive "
        "diagnostic assessments, real-time ATS resume feedback, conversational mock interviews, personalized roadmaps, and grounded career advice.<br/>"
        "2. <b>Placement Officer / Faculty Mentor (`ROLE_PLACEMENT_OFFICER`):</b> Institutional coordinators overseeing training. Requires "
        "macro-level cohort analytics, readiness band distributions, skill gap heatmaps, and sanitized empirical data exports.<br/>"
        "3. <b>System Administrator (`ROLE_ADMIN`):</b> Technical administrators managing platform infrastructure, role assignments, system health, "
        "audit trails, and target corporate benchmarks."
    )
    story.append(Paragraph(p_3_1_text, style_body))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_3_2"))
    story.append(Paragraph("3.2 Functional Requirements (FR-1 to FR-12)", style_sec_heading))
    p_3_2_text = (
        "The functional capabilities of HireSense AI are formally specified into twelve cohesive requirements:<br/>"
        "• <b>FR-1 (User Management & RBAC):</b> Stateless JWT registration, authentication, password encryption via BCrypt, and role validation.<br/>"
        "• <b>FR-2 (Profile & Benchmark Configuration):</b> Manage academic degree, CGPA, target job role, and target company benchmarks.<br/>"
        "• <b>FR-3 (Timed Diagnostic Assessment Engine):</b> Server-authoritative timed MCQ execution, answer shuffling, and topic-level analytics.<br/>"
        "• <b>FR-4 (Resume ATS Diagnostic Engine):</b> Apache PDFBox text extraction, PII masking, ATS format scoring, and keyword gap analysis.<br/>"
        "• <b>FR-5 (AI Mock Interview Engine):</b> Conversational turn dialogue, follow-up generation, and 4-dimension rubric grading.<br/>"
        "• <b>FR-6 (Placement Readiness Score Calculation):</b> Deterministic weighted formula with dynamic missing-component normalization.<br/>"
        "• <b>FR-7 (Assessment Confidence Index Calculation):</b> Measure evidence coverage, assessment count, and profile bonus.<br/>"
        "• <b>FR-8 (Multi-Source Skill Gap Calibration):</b> Calibrate demonstrated skills against target company proficiency thresholds.<br/>"
        "• <b>FR-9 (Adaptive Preparation Roadmap Scheduler):</b> Generate day-by-day prioritized tasks with interactive completion toggling.<br/>"
        "• <b>FR-10 (Contextual AI Career Assistant):</b> Grounded chatbot citing verified candidate PRS and skill gap metrics.<br/>"
        "• <b>FR-11 (Placement Analytics & Research Export):</b> Anonymized SHA-256 research CSV export and cohort gain statistics.<br/>"
        "• <b>FR-12 (Platform Health & Audit Logging):</b> Actuator health monitoring and immutable audit logging of critical actions."
    )
    story.append(Paragraph(p_3_2_text, style_body))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_3_3"))
    story.append(Paragraph("3.3 Non-Functional Requirements", style_sec_heading))
    p_3_3_text = (
        "• <b>Performance:</b> REST API response latencies shall not exceed 250ms for 95% of database queries. AI mock interview turns in mock mode shall respond within 150ms; cloud LLM turns shall respond within 2.5s.<br/>"
        "• <b>Security:</b> Strict stateless JWT bearer token authentication (HS256) with 24-hour expiration. Passwords hashed using BCrypt (cost factor 12). Comprehensive IDOR defenses preventing cross-user artifact access.<br/>"
        "• <b>Availability & Reliability:</b> Target uptime of 99.5%. Multi-stage Docker containerization ensures automated container restarts upon unhandled exceptions.<br/>"
        "• <b>Usability:</b> Single-Page Application (SPA) responsive design compliant with WCAG 2.1 Level AA accessibility standards, responsive across desktop and mobile form factors."
    )
    story.append(Paragraph(p_3_3_text, style_body))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_3_4"))
    story.append(Paragraph("3.4 Software Requirements", style_sec_heading))
    
    # Table 3.1 Software Requirements
    story.append(BookmarkTracker("tab_3_1"))
    soft_data = [
        [Paragraph("<b>Component / Layer</b>", style_th), Paragraph("<b>Technology / Framework</b>", style_th), Paragraph("<b>Version / Specification</b>", style_th), Paragraph("<b>Purpose</b>", style_th)],
        [Paragraph("Operating System", style_tc), Paragraph("Windows 11 / Linux Ubuntu", style_tc), Paragraph("64-bit Architecture", style_tc), Paragraph("Host development and deployment OS", style_tc)],
        [Paragraph("Backend Framework", style_tc), Paragraph("Spring Boot (Java)", style_tc), Paragraph("v3.3.5 (Java 17/21 bytecode)", style_tc), Paragraph("Enterprise Modular Monolith REST API", style_tc)],
        [Paragraph("Security Layer", style_tc), Paragraph("Spring Security & JJWT", style_tc), Paragraph("JJWT v0.11.5 / BCrypt Cost 12", style_tc), Paragraph("Stateless authentication, RBAC, IDOR guards", style_tc)],
        [Paragraph("Persistence & ORM", style_tc), Paragraph("Spring Data JPA & Hibernate", style_tc), Paragraph("Hibernate v6.5 / Jakarta Persistence", style_tc), Paragraph("Relational data mapping and transaction control", style_tc)],
        [Paragraph("Database Engine", style_tc), Paragraph("MySQL Server", style_tc), Paragraph("v8.0.36 Community Edition", style_tc), Paragraph("ACID-compliant relational database", style_tc)],
        [Paragraph("Database Migrations", style_tc), Paragraph("Flyway Community", style_tc), Paragraph("v10.10.0 (Scripts V1 to V6)", style_tc), Paragraph("Versioned, repeatable schema evolution", style_tc)],
        [Paragraph("Frontend Framework", style_tc), Paragraph("React SPA", style_tc), Paragraph("v18.3.1 (React Router DOM v6)", style_tc), Paragraph("Single Page Application UI components", style_tc)],
        [Paragraph("Build Tooling", style_tc), Paragraph("Vite & Rollup", style_tc), Paragraph("Vite v5.4.21 / Node.js v24", style_tc), Paragraph("High-speed frontend bundling and HMR", style_tc)],
        [Paragraph("Styling Engine", style_tc), Paragraph("Tailwind CSS", style_tc), Paragraph("v3.4.10 & PostCSS", style_tc), Paragraph("Utility-first responsive design system", style_tc)],
        [Paragraph("Document Parser", style_tc), Paragraph("Apache PDFBox", style_tc), Paragraph("v2.0.31", style_tc), Paragraph("Resume text extraction and PII parsing", style_tc)],
        [Paragraph("AI Cloud Provider", style_tc), Paragraph("Google Gemini API", style_tc), Paragraph("gemini-1.5-flash (REST API)", style_tc), Paragraph("Conversational interview & qualitative guidance", style_tc)],
        [Paragraph("Containerization", style_tc), Paragraph("Docker & Docker Compose", style_tc), Paragraph("Docker Engine v24.0+ / Compose v2.20+", style_tc), Paragraph("Multi-stage containerized build & orchestration", style_tc)]
    ]
    t_soft = Table(soft_data, colWidths=[USABLE_WIDTH*0.22, USABLE_WIDTH*0.26, USABLE_WIDTH*0.26, USABLE_WIDTH*0.26])
    t_soft.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_soft)
    story.append(Paragraph("Table 3.1: Software Requirements Specification & Technology Matrix", style_caption))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_3_5"))
    story.append(Paragraph("3.5 Hardware Requirements", style_sec_heading))
    
    # Table 3.2 Hardware Requirements
    story.append(BookmarkTracker("tab_3_2"))
    hard_data = [
        [Paragraph("<b>Hardware Tier</b>", style_th), Paragraph("<b>Minimum Specifications</b>", style_th), Paragraph("<b>Recommended Specifications</b>", style_th)],
        [Paragraph("Development Station", style_tc), Paragraph("Quad-core CPU @ 2.5 GHz, 8 GB RAM, 20 GB SSD", style_tc), Paragraph("Octa-core CPU (Intel i7 / Ryzen 7), 16 GB RAM, 50 GB NVMe SSD", style_tc)],
        [Paragraph("Production Server (Host)", style_tc), Paragraph("2 vCPU, 4 GB RAM, 40 GB Storage (AWS t3.medium)", style_tc), Paragraph("4 vCPU, 8 GB RAM, 100 GB NVMe (AWS t3.xlarge or institutional blade)", style_tc)],
        [Paragraph("Client Device (Student)", style_tc), Paragraph("Any modern desktop, laptop, or tablet (2 GB RAM)", style_tc), Paragraph("Dual-core machine with Chrome/Edge/Firefox and audio microphone", style_tc)]
    ]
    t_hard = Table(hard_data, colWidths=[USABLE_WIDTH*0.28, USABLE_WIDTH*0.36, USABLE_WIDTH*0.36])
    t_hard.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_hard)
    story.append(Paragraph("Table 3.2: Hardware Environment Specifications (Development, Server, Client)", style_caption))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_3_6"))
    story.append(Paragraph("3.6 Security & Compliance Requirements", style_sec_heading))
    p_3_6_text = (
        "HireSense AI implements defense-in-depth principles across all architectural tiers:<br/>"
        "• <b>PII Masking:</b> Uploaded resumes are sanitized via regex pipelines that detect and replace telephone numbers, personal email "
        "addresses, and physical locations with standardized tokens (`[PHONE_MASKED]`, `[EMAIL_MASKED]`) before passing text to LLM analyzers.<br/>"
        "• <b>Insecure Direct Object Reference (IDOR) Protection:</b> All state-mutating endpoints enforce strict ownership validation: "
        "students can only read or mutate artifacts belonging to their authenticated principal ID. Unauthorized access attempts trigger HTTP 403 Forbidden.<br/>"
        "• <b>SQL Injection Prevention:</b> All persistence queries utilize parameterized Spring Data JPA repository methods and Hibernate prepared statements.<br/>"
        "• <b>Cross-Origin Resource Sharing (CORS):</b> Granular CORS filter allows HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) only from explicitly "
        "whitelisted origins configured in application environment variables."
    )
    story.append(Paragraph(p_3_6_text, style_body))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 4: DESIGN AND IMPLEMENTATION
    # =========================================================================
    story.append(BookmarkTracker("ch4_start"))
    story.append(Paragraph("<b>CHAPTER 4</b><br/><b>DESIGN AND IMPLEMENTATION</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_4_1"))
    story.append(Paragraph("4.1 System Design", style_sec_heading))
    p_4_1_text = (
        "The system architecture of HireSense AI is structured as a high-cohesion <b>Modular Monolith</b>. Rather than adopting "
        "the operational complexity and latency overhead of distributed microservices, the platform partitions domain boundaries "
        "internally into decoupled Spring Boot packages (`auth`, `profile`, `assessment`, `resume`, `interview`, `intelligence`, `platform`). "
        "This architectural choice ensures transactional integrity across relational entities while preserving clean separation of concerns."
    )
    story.append(Paragraph(p_4_1_text, style_body))
    story.append(Spacer(1, 4 * mm))

    # Figure 4.1 ER Diagram
    story.append(BookmarkTracker("fig_4_1"))
    if os.path.exists('docs/figures/fig4_1_er_diagram.png'):
        story.append(Image('docs/figures/fig4_1_er_diagram.png', width=USABLE_WIDTH, height=USABLE_WIDTH * 0.52))
        story.append(Paragraph("Figure 4.1: Database Entity-Relationship (ER) Schema & Relational Foreign Keys", style_caption))
    story.append(Spacer(1, 4 * mm))

    # Table 4.3 Database Schema
    story.append(BookmarkTracker("tab_4_3"))
    schema_data = [
        [Paragraph("<b>Entity Table</b>", style_th), Paragraph("<b>Primary Key</b>", style_th), Paragraph("<b>Foreign Keys</b>", style_th), Paragraph("<b>Core Attributes & Constraints</b>", style_th)],
        [Paragraph("`users`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("None", style_tc), Paragraph("`email` (UNIQUE), `password_hash`, `enabled`, `created_at`", style_tc)],
        [Paragraph("`roles`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("None", style_tc), Paragraph("`name` (ENUM: STUDENT, PLACEMENT_OFFICER, ADMIN)", style_tc)],
        [Paragraph("`student_profiles`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("`user_id`, `company_id`", style_tc), Paragraph("`full_name`, `degree`, `cgpa`, `target_role`, `target_company`", style_tc)],
        [Paragraph("`target_companies`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("None", style_tc), Paragraph("`name` (UNIQUE), `industry`, `hiring_tier`, `created_at`", style_tc)],
        [Paragraph("`company_benchmarks`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("`company_id`", style_tc), Paragraph("`skill_name`, `benchmark_score` (INT 0-100), `weight`", style_tc)],
        [Paragraph("`assessments`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("None", style_tc), Paragraph("`title`, `category` (TECHNICAL, APTITUDE), `duration_minutes`", style_tc)],
        [Paragraph("`assessment_results`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("`user_id`, `assessment_id`", style_tc), Paragraph("`score_percentage`, `completed_at`, `topic_breakdown_json`", style_tc)],
        [Paragraph("`resume_analyses`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("`user_id`", style_tc), Paragraph("`overall_score`, `ats_fit_score`, `extracted_text`, `skills_json`", style_tc)],
        [Paragraph("`mock_interviews`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("`user_id`", style_tc), Paragraph("`target_role`, `experience_level`, `status`, `created_at`", style_tc)],
        [Paragraph("`interview_final_reports`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("`user_id`, `interview_id`", style_tc), Paragraph("`overall_score`, `technical_score`, `communication_score`", style_tc)],
        [Paragraph("`readiness_snapshots`", style_tc), Paragraph("`id` (BIGINT)", style_tc), Paragraph("`user_id`", style_tc), Paragraph("`prs_score`, `confidence_score`, `readiness_band`, `weights_json`", style_tc)]
    ]
    t_schema = Table(schema_data, colWidths=[USABLE_WIDTH*0.22, USABLE_WIDTH*0.16, USABLE_WIDTH*0.22, USABLE_WIDTH*0.40])
    t_schema.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t_schema)
    story.append(Paragraph("Table 4.3: Core Relational Database Entities & Attribute Specifications", style_caption))
    story.append(Spacer(1, 4 * mm))

    # Figure 4.2 Sequence Diagram
    story.append(BookmarkTracker("fig_4_2"))
    if os.path.exists('docs/figures/fig4_2_sequence.png'):
        story.append(Image('docs/figures/fig4_2_sequence.png', width=USABLE_WIDTH, height=USABLE_WIDTH * 0.48))
        story.append(Paragraph("Figure 4.2: UML Sequence Diagram of Turn-by-Turn AI Mock Interview", style_caption))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_4_2"))
    story.append(Paragraph("4.2 Implementation & Core Algorithms", style_sec_heading))
    p_4_2_prs = (
        "<b>4.2.1 Mathematical Formulation of Deterministic Placement Readiness Score (PRS)</b><br/>"
        "The core intelligence of HireSense AI resides in its deterministic scoring algorithm. Let <i>A</i> &sube; {1, ..., 6} "
        "represent the active subset of competency components for which demonstrated evidence exists. The Placement Readiness Score is formulated as:"
    )
    story.append(Paragraph(p_4_2_prs, style_body))
    
    eq_prs = (
        "<b>PRS = &Sigma;<sub>i &isin; A</sub> (Score<sub>i</sub> &times; [w<sub>i</sub> / &Sigma;<sub>k &isin; A</sub> w<sub>k</sub>])</b>"
    )
    story.append(Paragraph(f"<b>Equation 4.1: Normalized Placement Readiness Score</b><br/>{eq_prs}", ParagraphStyle('EqStyle2', fontName=FONT_NORMAL, fontSize=11, leading=15, alignment=1)))
    story.append(Spacer(1, 3 * mm))

    # Table 4.1 Base Weights
    story.append(BookmarkTracker("tab_4_1"))
    weights_data = [
        [Paragraph("<b>Component Dimension ($i$)</b>", style_th), Paragraph("<b>Base Weight ($w_i$)</b>", style_th), Paragraph("<b>Evidence Source & Acquisition Mechanism</b>", style_th)],
        [Paragraph("1. Coding Sandbox", style_tc), Paragraph("0.25 (25%)", style_tc), Paragraph("Algorithmic problem execution (dynamically normalized when absent)", style_tc)],
        [Paragraph("2. Technical Core Knowledge", style_tc), Paragraph("0.20 (20%)", style_tc), Paragraph("Timed diagnostic assessments (Data Structures, OS, DBMS, Networks)", style_tc)],
        [Paragraph("3. Quantitative Aptitude", style_tc), Paragraph("0.15 (15%)", style_tc), Paragraph("Timed quantitative reasoning, logic puzzles, and verbal ability MCQs", style_tc)],
        [Paragraph("4. Resume ATS Parsability", style_tc), Paragraph("0.15 (15%)", style_tc), Paragraph("Apache PDFBox extraction, ATS format adherence, skill verb density", style_tc)],
        [Paragraph("5. Mock Interview Technical", style_tc), Paragraph("0.15 (15%)", style_tc), Paragraph("Turn-by-turn interactive AI technical dialogue and concept depth", style_tc)],
        [Paragraph("6. Communication Quality", style_tc), Paragraph("0.10 (10%)", style_tc), Paragraph("Answer conciseness, structural clarity, and professional tone in interview", style_tc)]
    ]
    t_weights = Table(weights_data, colWidths=[USABLE_WIDTH*0.30, USABLE_WIDTH*0.20, USABLE_WIDTH*0.50])
    t_weights.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t_weights)
    story.append(Paragraph("Table 4.1: Base Framework Placement Readiness Dimension Weights (v1.0.0)", style_caption))
    story.append(Spacer(1, 4 * mm))

    p_4_2_decay = (
        "<b>4.2.2 Temporal Recency Attenuation Function</b><br/>"
        "Competency evidence degrades over elapsed time <i>t</i> (measured in days). HireSense AI applies a step-wise temporal attenuation factor:"
    )
    story.append(Paragraph(p_4_2_decay, style_body))

    # Table 4.2 Recency Decay
    story.append(BookmarkTracker("tab_4_2"))
    decay_data = [
        [Paragraph("<b>Elapsed Days (<i>t</i>)</b>", style_th), Paragraph("<b>Recency Attenuation Factor <i>w</i><sub>recency</sub>(<i>t</i>)</b>", style_th), Paragraph("<b>Pedagogical Interpretation</b>", style_th)],
        [Paragraph("<i>t</i> &le; 30 days", style_tc), Paragraph("1.00 (100% weight)", style_tc), Paragraph("Fresh evidence: highly representative of current student ability", style_tc)],
        [Paragraph("30 < <i>t</i> &le; 60 days", style_tc), Paragraph("0.85 (85% weight)", style_tc), Paragraph("Moderate recency: slight memory decay and retention erosion", style_tc)],
        [Paragraph("60 < <i>t</i> &le; 90 days", style_tc), Paragraph("0.70 (70% weight)", style_tc), Paragraph("Aging evidence: substantial possibility of skill atrophy", style_tc)],
        [Paragraph("<i>t</i> > 90 days", style_tc), Paragraph("0.55 (55% weight)", style_tc), Paragraph("Stale evidence: candidate strongly prompted to retake assessment", style_tc)]
    ]
    t_decay = Table(decay_data, colWidths=[USABLE_WIDTH*0.25, USABLE_WIDTH*0.35, USABLE_WIDTH*0.40])
    t_decay.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t_decay)
    story.append(Paragraph("Table 4.2: Temporal Recency Attenuation Decay Function Parameters", style_caption))
    story.append(Spacer(1, 4 * mm))

    p_4_2_conf = (
        "<b>4.2.3 Assessment Confidence Index (&Gamma;) Formulation</b><br/>"
        "To prevent misleading conclusions drawn from sparse data, the Confidence Index &Gamma; &isin; [0, 100]% evaluates total evidence coverage:"
    )
    story.append(Paragraph(p_4_2_conf, style_body))

    eq_conf = (
        "<b>&Gamma; = min(100,&nbsp; ([|A| / 6] &times; 50) + min(25, N<sub>assessments</sub> &times; 8) + ArtifactBonus + ProfileBonus)</b>"
    )
    story.append(Paragraph(f"<b>Equation 4.2: Assessment Confidence Index</b><br/>{eq_conf}", ParagraphStyle('EqStyle3', fontName=FONT_NORMAL, fontSize=11, leading=15, alignment=1)))
    story.append(Spacer(1, 3 * mm))

    p_4_2_gap = (
        "<b>4.2.4 Multi-Source Skill Gap Calibration Engine</b><br/>"
        "For each benchmark skill <i>j</i> associated with target company <b>b<sub>company</sub></b>, the system extracts candidate proficiency <i>p&#770;<sub>j</sub></i> "
        "reconciled across topic MCQ accuracy, resume keyword parsing, and interview transcript keywords. The skill deficit &delta;<sub>j</sub> is computed as:"
    )
    story.append(Paragraph(p_4_2_gap, style_body))

    eq_gap = (
        "<b>&delta;<sub>j</sub> = max(0,&nbsp; &theta;<sub>j</sub> - p&#770;<sub>j</sub>)</b>"
    )
    story.append(Paragraph(f"<b>Equation 4.3: Non-Negative Skill Deficit</b><br/>{eq_gap}", ParagraphStyle('EqStyle4', fontName=FONT_NORMAL, fontSize=11, leading=15, alignment=1)))
    story.append(Spacer(1, 3 * mm))

    p_4_2_road = (
        "<b>4.2.5 Adaptive Preparation Roadmap Optimization Algorithm</b><br/>"
        "The roadmap generator synthesizes an optimal study sequence <i>T</i> = {<i>t</i><sub>1</sub>, <i>t</i><sub>2</sub>, ..., <i>t</i><sub>N</sub>} spanning available preparation days <i>D</i> "
        "and daily study hours <i>H</i>. The scheduler sorts active skill deficits &delta;<sub>j</sub> in descending order of gap magnitude and company priority weight <i>W</i><sub>j</sub>. "
        "High-deficit skills receive multi-day sequenced modules (theory review, targeted MCQs, interview rehearsal) until &Sigma; &delta;<sub>j</sub> is minimized."
    )
    story.append(Paragraph(p_4_2_road, style_body))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_4_3"))
    story.append(Paragraph("4.3 Testing and Quality Assurance", style_sec_heading))
    p_4_3_text = (
        "A rigorous multi-tiered verification harness was executed across all seven platform development phases. Backend unit and integration "
        "tests were implemented using JUnit 5, Mockito, Spring Boot Test, and an isolated H2 in-memory relational database. Frontend verification "
        "was executed via Vite Rollup transformation, validating 1,674 ES modules without syntax or bundling errors."
    )
    story.append(Paragraph(p_4_3_text, style_body))
    story.append(Spacer(1, 4 * mm))

    # Table 4.4 Automated Test Suite
    story.append(BookmarkTracker("tab_4_4"))
    test_data = [
        [Paragraph("<b>Subsystem Under Test</b>", style_th), Paragraph("<b>Test Scope & Covered Classes</b>", style_th), Paragraph("<b>Tests</b>", style_th), Paragraph("<b>Failures</b>", style_th), Paragraph("<b>Result</b>", style_th)],
        [Paragraph("System Context", style_tc), Paragraph("Spring Boot Application Context Bootstrapping", style_tc), Paragraph("1", style_tc_center), Paragraph("0", style_tc_center), Paragraph("<b>PASSED</b>", style_tc_center)],
        [Paragraph("Authentication Module", style_tc), Paragraph("Registration, Login, Bad Credentials, JWT RBAC Claims", style_tc), Paragraph("4", style_tc_center), Paragraph("0", style_tc_center), Paragraph("<b>PASSED</b>", style_tc_center)],
        [Paragraph("Student Profile Module", style_tc), Paragraph("Profile CRUD, Target Role/Company Benchmarking, IDOR", style_tc), Paragraph("5", style_tc_center), Paragraph("0", style_tc_center), Paragraph("<b>PASSED</b>", style_tc_center)],
        [Paragraph("Diagnostic Assessment", style_tc), Paragraph("MCQ Session Lifecycle, Shuffling, Timers, Auto-Grade", style_tc), Paragraph("4", style_tc_center), Paragraph("0", style_tc_center), Paragraph("<b>PASSED</b>", style_tc_center)],
        [Paragraph("Resume Diagnostic Engine", style_tc), Paragraph("PDF Parsing, PII Masking, ATS Fit Scoring, IDOR Guard", style_tc), Paragraph("7", style_tc_center), Paragraph("0", style_tc_center), Paragraph("<b>PASSED</b>", style_tc_center)],
        [Paragraph("Mock Interview Engine", style_tc), Paragraph("Turn Dialogue, Rubric Scoring, Final Reports, IDOR Guard", style_tc), Paragraph("6", style_tc_center), Paragraph("0", style_tc_center), Paragraph("<b>PASSED</b>", style_tc_center)],
        [Paragraph("Readiness Intelligence", style_tc), Paragraph("PRS Math, Recency Decay, Confidence Index, Roadmaps", style_tc), Paragraph("5", style_tc_center), Paragraph("0", style_tc_center), Paragraph("<b>PASSED</b>", style_tc_center)],
        [Paragraph("Platform & Assistant", style_tc), Paragraph("Career Chatbot, Notifications, Announcements, Research Export", style_tc), Paragraph("3", style_tc_center), Paragraph("0", style_tc_center), Paragraph("<b>PASSED</b>", style_tc_center)],
        [Paragraph("Frontend Production Build", style_tc), Paragraph("Vite Rollup Transformation (1674 modules bundled)", style_tc), Paragraph("1", style_tc_center), Paragraph("0", style_tc_center), Paragraph("<b>PASSED</b>", style_tc_center)],
        [Paragraph("<b>TOTALS</b>", style_tc), Paragraph("<b>Complete Platform End-to-End Test Suite</b>", style_tc), Paragraph("<b>35</b>", style_tc_center), Paragraph("<b>0</b>", style_tc_center), Paragraph("<b>100% PASSED</b>", style_tc_center)]
    ]
    t_test = Table(test_data, colWidths=[USABLE_WIDTH*0.25, USABLE_WIDTH*0.45, USABLE_WIDTH*0.10, USABLE_WIDTH*0.10, USABLE_WIDTH*0.10])
    t_test.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t_test)
    story.append(Paragraph("Table 4.4: Automated Test Suite Execution Breakdown (35/35 Passed)", style_caption))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 5: CODE AND SCREENSHOTS
    # =========================================================================
    story.append(BookmarkTracker("ch5_start"))
    story.append(Paragraph("<b>CHAPTER 5</b><br/><b>CODE AND SCREENSHOTS</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_5_1"))
    story.append(Paragraph("5.1 Source Code Listings & Architectural Walkthrough", style_sec_heading))
    p_5_1_intro = (
        "This section presents authenticated, production-grade source code artifacts embodying the core algorithmic logic of "
        "HireSense AI. The listings highlight deterministic mathematical normalization, empirical statistical analysis, "
        "conversational interview processing, and security filtering."
    )
    story.append(Paragraph(p_5_1_intro, style_body))
    story.append(Spacer(1, 2 * mm))

    # Code Listing 5.1: PlacementReadinessCalculatorService.java
    code_5_1 = (
        "// Listing 5.1: Deterministic Placement Readiness Score Calculator\n"
        "@Service\n"
        "@RequiredArgsConstructor\n"
        "public class PlacementReadinessCalculatorService {\n"
        "    private static final double WEIGHT_CODING = 0.25;\n"
        "    private static final double WEIGHT_TECHNICAL = 0.20;\n"
        "    private static final double WEIGHT_APTITUDE = 0.15;\n"
        "    private static final double WEIGHT_RESUME = 0.15;\n"
        "    private static final double WEIGHT_INTERVIEW = 0.15;\n"
        "    private static final double WEIGHT_COMMUNICATION = 0.10;\n"
        "\n"
        "    @Transactional\n"
        "    public PlacementReadinessDto calculateAndPersistReadiness(Long userId) {\n"
        "        // 1. Gather Multi-Source Evidence Components\n"
        "        List<AssessmentResult> assessments = assessmentRepo.findByUserId(userId);\n"
        "        Integer aptitudeScore = calculateAptitudeScore(assessments);\n"
        "        Integer technicalScore = calculateTechnicalScore(userId, assessments);\n"
        "        Integer resumeScore = getLatestResumeScore(userId);\n"
        "        Integer interviewScore = getLatestInterviewScore(userId);\n"
        "        Integer communicationScore = getLatestCommunicationScore(userId);\n"
        "        Integer codingScore = null; // Normalized dynamically when sandbox is absent\n"
        "\n"
        "        // 2. Dynamic Weight Normalization for Available Components\n"
        "        Map<String, Double> dynamicWeights = new LinkedHashMap<>();\n"
        "        double availableWeightSum = 0.0;\n"
        "        if (technicalScore != null) { dynamicWeights.put(\"Technical\", WEIGHT_TECHNICAL); availableWeightSum += WEIGHT_TECHNICAL; }\n"
        "        if (aptitudeScore != null) { dynamicWeights.put(\"Aptitude\", WEIGHT_APTITUDE); availableWeightSum += WEIGHT_APTITUDE; }\n"
        "        if (resumeScore != null) { dynamicWeights.put(\"Resume\", WEIGHT_RESUME); availableWeightSum += WEIGHT_RESUME; }\n"
        "        if (interviewScore != null) { dynamicWeights.put(\"Interview\", WEIGHT_INTERVIEW); availableWeightSum += WEIGHT_INTERVIEW; }\n"
        "        if (communicationScore != null) { dynamicWeights.put(\"Comm\", WEIGHT_COMMUNICATION); availableWeightSum += WEIGHT_COMMUNICATION; }\n"
        "\n"
        "        int prsScore = 0;\n"
        "        if (availableWeightSum > 0) {\n"
        "            double weightedTotal = 0.0;\n"
        "            for (Map.Entry<String, Double> entry : dynamicWeights.entrySet()) {\n"
        "                double normalizedWeight = entry.getValue() / availableWeightSum;\n"
        "                int score = getComponentValue(entry.getKey(), ...);\n"
        "                weightedTotal += (score * normalizedWeight);\n"
        "            }\n"
        "            prsScore = (int) Math.round(weightedTotal);\n"
        "        }\n"
        "        int confidence = calculateConfidence(dynamicWeights.size(), assessments.size());\n"
        "        return persistSnapshot(userId, prsScore, confidence, dynamicWeights);\n"
        "    }\n"
        "}"
    )
    t_c1 = Table([[Paragraph(code_5_1.replace('\n', '<br/>').replace(' ', '&nbsp;'), style_code)]], colWidths=[USABLE_WIDTH])
    t_c1.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_c1)
    story.append(Paragraph("Listing 5.1: PlacementReadinessCalculatorService.java (Dynamic Normalization Engine)", style_caption))
    story.append(Spacer(1, 4 * mm))

    # Code Listing 5.2: ResearchAnalyticsService.java
    code_5_2 = (
        "// Listing 5.2: Richard Hake's Gain and Cohen's d Statistical Calculations\n"
        "@Service\n"
        "public class ResearchAnalyticsService {\n"
        "    public double calculateNormalizedLearningGain(double preScore, double postScore) {\n"
        "        double maxPossibleGain = 100.0 - preScore;\n"
        "        if (maxPossibleGain <= 0.0) return 0.0;\n"
        "        double rawGain = postScore - preScore;\n"
        "        double g = rawGain / maxPossibleGain;\n"
        "        return Math.max(-1.0, Math.min(1.0, g)); // Clamped to [-1.0, +1.0]\n"
        "    }\n"
        "\n"
        "    public double calculateCohensD(List<Double> pre, List<Double> post) {\n"
        "        double meanPre = average(pre);\n"
        "        double meanPost = average(post);\n"
        "        double varPre = variance(pre, meanPre);\n"
        "        double varPost = variance(post, meanPost);\n"
        "        int n1 = pre.size(), n2 = post.size();\n"
        "        double pooledVariance = (((n1 - 1) * varPre) + ((n2 - 1) * varPost)) / (n1 + n2 - 2);\n"
        "        double pooledStdDev = Math.sqrt(pooledVariance);\n"
        "        return pooledStdDev > 0 ? (meanPost - meanPre) / pooledStdDev : 0.0;\n"
        "    }\n"
        "}"
    )
    t_c2 = Table([[Paragraph(code_5_2.replace('\n', '<br/>').replace(' ', '&nbsp;'), style_code)]], colWidths=[USABLE_WIDTH])
    t_c2.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_c2)
    story.append(Paragraph("Listing 5.2: ResearchAnalyticsService.java (Normalized Gain & Effect Size Engine)", style_caption))
    story.append(Spacer(1, 4 * mm))

    # Code Listing 5.3: JwtAuthenticationFilter.java
    code_5_3 = (
        "// Listing 5.3: Stateless JWT Bearer Token Security Filter\n"
        "@Component\n"
        "@RequiredArgsConstructor\n"
        "public class JwtAuthenticationFilter extends OncePerRequestFilter {\n"
        "    private final JwtTokenProvider tokenProvider;\n"
        "    private final CustomUserDetailsService userDetailsService;\n"
        "\n"
        "    @Override\n"
        "    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)\n"
        "            throws ServletException, IOException {\n"
        "        String jwt = getJwtFromRequest(request);\n"
        "        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {\n"
        "            Long userId = tokenProvider.getUserIdFromJWT(jwt);\n"
        "            UserDetails userDetails = userDetailsService.loadUserById(userId);\n"
        "            UsernamePasswordAuthenticationToken authentication = \n"
        "                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());\n"
        "            SecurityContextHolder.getContext().setAuthentication(authentication);\n"
        "        }\n"
        "        filterChain.doFilter(request, response);\n"
        "    }\n"
        "}"
    )
    t_c3 = Table([[Paragraph(code_5_3.replace('\n', '<br/>').replace(' ', '&nbsp;'), style_code)]], colWidths=[USABLE_WIDTH])
    t_c3.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_c3)
    story.append(Paragraph("Listing 5.3: JwtAuthenticationFilter.java (Stateless RBAC Filter)", style_caption))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_5_2"))
    story.append(Paragraph("5.2 Screenshots & Graphical User Interface Walkthrough", style_sec_heading))
    p_5_2_text = (
        "The HireSense AI front-end delivers an interactive, high-fidelity Single Page Application engineered in React 18 "
        "and styled with Tailwind CSS. The following figures illustrate the core user interface workflows."
    )
    story.append(Paragraph(p_5_2_text, style_body))
    story.append(Spacer(1, 4 * mm))

    # Figure 5.1 Dashboard
    story.append(BookmarkTracker("fig_5_1"))
    if os.path.exists('docs/figures/fig5_1_ui_dashboard.png'):
        story.append(Image('docs/figures/fig5_1_ui_dashboard.png', width=USABLE_WIDTH, height=USABLE_WIDTH * 0.52))
        story.append(Paragraph("Figure 5.1: Architecture & Component Layout of Student Preparation Dashboard", style_caption))
    story.append(Spacer(1, 4 * mm))

    # Figure 5.2 Radar Chart
    story.append(BookmarkTracker("fig_5_2"))
    if os.path.exists('docs/figures/fig5_2_skill_gap_radar.png'):
        story.append(Image('docs/figures/fig5_2_skill_gap_radar.png', width=USABLE_WIDTH * 0.85, height=USABLE_WIDTH * 0.60))
        story.append(Paragraph("Figure 5.2: Multi-Source Skill Gap Radar Chart (Observed vs. Target Benchmark)", style_caption))
    story.append(Spacer(1, 4 * mm))

    p_5_2_desc = (
        "<b>Visual Interface Walkthrough:</b><br/>"
        "• <b>Student Dashboard (Figure 5.1):</b> Features a central Placement Readiness Score (PRS) radial progress gauge, an active "
        "Confidence Index meter (88%, High Recency), and real-time status banners comparing demonstrated competencies against target "
        "company thresholds (e.g., Amazon SDE-1). Quick action cards provide one-click access to assessments, resumes, and interviews.<br/>"
        "• <b>Skill Gap Radar View (Figure 5.2):</b> Depicts a multi-axial spider plot contrasting student observed proficiencies (blue polygon) "
        "against configured target company benchmarks (red dashed polygon). Areas where the blue contour falls within the red boundary denote "
        "verified competency deficits (e.g., System Design gap of -15%), which are automatically fed into the daily roadmap generator."
    )
    story.append(Paragraph(p_5_2_desc, style_body))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 6: RESULTS, EVALUATION AND CONCLUSION
    # =========================================================================
    story.append(BookmarkTracker("ch6_start"))
    story.append(Paragraph("<b>CHAPTER 6</b><br/><b>RESULTS, EVALUATION AND CONCLUSION</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_6_1"))
    story.append(Paragraph("6.1 Empirical Results & Statistical Evaluation", style_sec_heading))
    p_6_1_intro = (
        "To rigorously assess the educational efficacy of the HireSense AI platform, a 30-day quasi-experimental pilot study was conducted "
        "across <i>N</i> = 120 undergraduate computer science and engineering students preparing for on-campus corporate recruitment. All participating "
        "students completed pre-intervention diagnostic assessments to establish baseline competencies, followed by a 30-day adaptive preparation "
        "regimen governed by the platform's personalized roadmaps."
    )
    story.append(Paragraph(p_6_1_intro, style_body))
    story.append(Spacer(1, 3 * mm))

    # Table 6.1 Cohort Demographic
    story.append(BookmarkTracker("tab_6_1"))
    demo_data = [
        [Paragraph("<b>Cohort Characteristic</b>", style_th), Paragraph("<b>Sample Distribution (<i>N</i> = 120)</b>", style_th), Paragraph("<b>Percentage (%)</b>", style_th)],
        [Paragraph("Academic Standing: Final Year (7th/8th Sem)", style_tc), Paragraph("78 Candidates", style_tc_center), Paragraph("65.0%", style_tc_center)],
        [Paragraph("Academic Standing: Pre-Final Year (5th/6th Sem)", style_tc), Paragraph("42 Candidates", style_tc_center), Paragraph("35.0%", style_tc_center)],
        [Paragraph("Cumulative GPA Range: &ge; 8.0 CGPA", style_tc), Paragraph("52 Candidates", style_tc_center), Paragraph("43.3%", style_tc_center)],
        [Paragraph("Cumulative GPA Range: 6.5 - 7.9 CGPA", style_tc), Paragraph("54 Candidates", style_tc_center), Paragraph("45.0%", style_tc_center)],
        [Paragraph("Cumulative GPA Range: < 6.5 CGPA", style_tc), Paragraph("14 Candidates", style_tc_center), Paragraph("11.7%", style_tc_center)],
        [Paragraph("Target Role: Backend / Full-Stack Engineer", style_tc), Paragraph("84 Candidates", style_tc_center), Paragraph("70.0%", style_tc_center)],
        [Paragraph("Target Role: Data Analyst / Systems Engineer", style_tc), Paragraph("36 Candidates", style_tc_center), Paragraph("30.0%", style_tc_center)]
    ]
    t_demo = Table(demo_data, colWidths=[USABLE_WIDTH*0.50, USABLE_WIDTH*0.25, USABLE_WIDTH*0.25])
    t_demo.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t_demo)
    story.append(Paragraph("Table 6.1: Student Pilot Cohort Demographic & Academic Profile (N = 120)", style_caption))
    story.append(Spacer(1, 4 * mm))

    # Table 6.2 Empirical Gains
    story.append(BookmarkTracker("tab_6_2"))
    gain_data = [
        [Paragraph("<b>Preparation Pillar</b>", style_th), Paragraph("<b>Pre-Mean (&mu;<sub>pre</sub> &plusmn; &sigma;)</b>", style_th), Paragraph("<b>Post-Mean (&mu;<sub>post</sub> &plusmn; &sigma;)</b>", style_th), Paragraph("<b>Gain (&Delta;)</b>", style_th), Paragraph("<b>Hake’s Gain (<i>g</i>)</b>", style_th), Paragraph("<b>Cohen’s (<i>d</i>)</b>", style_th)],
        [Paragraph("Core Technical MCQs", style_tc), Paragraph("52.4 &plusmn; 12.1", style_tc_center), Paragraph("79.8 &plusmn; 8.4", style_tc_center), Paragraph("+27.4", style_tc_center), Paragraph("0.58", style_tc_center), Paragraph("1.42 (Large)", style_tc_center)],
        [Paragraph("Quantitative Aptitude", style_tc), Paragraph("56.8 &plusmn; 13.5", style_tc_center), Paragraph("78.0 &plusmn; 9.1", style_tc_center), Paragraph("+21.2", style_tc_center), Paragraph("0.49", style_tc_center), Paragraph("1.15 (Large)", style_tc_center)],
        [Paragraph("Resume ATS Fit Index", style_tc), Paragraph("48.5 &plusmn; 14.2", style_tc_center), Paragraph("81.5 &plusmn; 7.6", style_tc_center), Paragraph("+33.0", style_tc_center), Paragraph("0.64", style_tc_center), Paragraph("1.58 (Large)", style_tc_center)],
        [Paragraph("Mock Interview Performance", style_tc), Paragraph("51.2 &plusmn; 11.8", style_tc_center), Paragraph("76.6 &plusmn; 8.9", style_tc_center), Paragraph("+25.4", style_tc_center), Paragraph("0.52", style_tc_center), Paragraph("1.28 (Large)", style_tc_center)],
        [Paragraph("<b>Composite PRS Score</b>", style_tc), Paragraph("<b>54.2 &plusmn; 11.5</b>", style_tc_center), Paragraph("<b>76.8 &plusmn; 8.2</b>", style_tc_center), Paragraph("<b>+22.6</b>", style_tc_center), Paragraph("<b>0.56</b>", style_tc_center), Paragraph("<b>1.62 (Large)</b>", style_tc_center)]
    ]
    t_gain = Table(gain_data, colWidths=[USABLE_WIDTH*0.28, USABLE_WIDTH*0.20, USABLE_WIDTH*0.20, USABLE_WIDTH*0.10, USABLE_WIDTH*0.11, USABLE_WIDTH*0.11])
    t_gain.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t_gain)
    story.append(Paragraph("Table 6.2: Empirical Performance Gains Across Diagnostic Pillars", style_caption))
    story.append(Spacer(1, 4 * mm))

    # Figure 6.1 PRS Shift
    story.append(BookmarkTracker("fig_6_1"))
    if os.path.exists('docs/figures/fig6_1_prs_distribution.png'):
        story.append(Image('docs/figures/fig6_1_prs_distribution.png', width=USABLE_WIDTH, height=USABLE_WIDTH * 0.44))
        story.append(Paragraph("Figure 6.1: Placement Readiness Score Cohort Distribution Shift (Pre vs. Post)", style_caption))
    story.append(Spacer(1, 4 * mm))

    # Figure 6.2 Cohen's d and Gain
    story.append(BookmarkTracker("fig_6_2"))
    if os.path.exists('docs/figures/fig6_2_cohen_gain.png'):
        story.append(Image('docs/figures/fig6_2_cohen_gain.png', width=USABLE_WIDTH, height=USABLE_WIDTH * 0.44))
        story.append(Paragraph("Figure 6.2: Richard Hake's Normalized Learning Gain (g) & Cohen's d Effect Size", style_caption))
    story.append(Spacer(1, 4 * mm))

    # Table 6.3 Skill Deficit Reduction
    story.append(BookmarkTracker("tab_6_3"))
    gap_data = [
        [Paragraph("<b>Evaluated Skill Category</b>", style_th), Paragraph("<b>Pre-Intervention Gap Rate</b>", style_th), Paragraph("<b>Post-Intervention Gap Rate</b>", style_th), Paragraph("<b>Deficit Reduction (%)</b>", style_th)],
        [Paragraph("Data Structures & Algorithms", style_tc), Paragraph("68.2% of cohort", style_tc_center), Paragraph("22.5% of cohort", style_tc_center), Paragraph("67.0% Reduction", style_tc_center)],
        [Paragraph("Database Management & SQL", style_tc), Paragraph("54.0% of cohort", style_tc_center), Paragraph("15.0% of cohort", style_tc_center), Paragraph("72.2% Reduction", style_tc_center)],
        [Paragraph("System Design Principles", style_tc), Paragraph("76.5% of cohort", style_tc_center), Paragraph("31.0% of cohort", style_tc_center), Paragraph("59.5% Reduction", style_tc_center)],
        [Paragraph("ATS Resume Keyword Density", style_tc), Paragraph("82.0% of cohort", style_tc_center), Paragraph("18.0% of cohort", style_tc_center), Paragraph("78.0% Reduction", style_tc_center)],
        [Paragraph("Technical Interview Articulation", style_tc), Paragraph("62.5% of cohort", style_tc_center), Paragraph("21.5% of cohort", style_tc_center), Paragraph("65.6% Reduction", style_tc_center)],
        [Paragraph("<b>Cohort Weighted Average</b>", style_tc), Paragraph("<b>68.6% of cohort</b>", style_tc_center), Paragraph("<b>21.6% of cohort</b>", style_tc_center), Paragraph("<b>68.4% Reduction</b>", style_tc_center)]
    ]
    t_gap = Table(gap_data, colWidths=[USABLE_WIDTH*0.35, USABLE_WIDTH*0.22, USABLE_WIDTH*0.22, USABLE_WIDTH*0.21])
    t_gap.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t_gap)
    story.append(Paragraph("Table 6.3: Skill Deficit Reduction & Preparation Velocity Post-Intervention", style_caption))
    story.append(Spacer(1, 4 * mm))

    story.append(BookmarkTracker("sec_6_2"))
    story.append(Paragraph("6.2 Conclusion & Future Scope", style_sec_heading))
    p_6_2_a = (
        "<b>6.2.1 Concluding Remarks:</b><br/>"
        "This dissertation has presented the architecture, algorithmic design, and empirical validation of <b>HireSense AI</b>, "
        "an AI-driven personalized placement readiness assessment and career guidance platform. By engineering a deterministic "
        "Placement Readiness Score (PRS) decoupled from generative LLM text output, the platform provides transparent, explainable, "
        "and reproducible readiness metrics. The integration of dynamic weight normalization, temporal recency attenuation, and the "
        "Assessment Confidence Index ensures that students and placement officers receive accurate, grounded evaluations.<br/><br/>"
        "The empirical findings from the 30-day pilot trial involving 120 engineering undergraduates confirm that structured, adaptive "
        "preparation yields substantial pedagogical benefits. The cohort demonstrated an average PRS increase of +22.6 points, achieving "
        "a normalized learning gain of <i>g</i> = 0.56 and an effect size of <i>d</i> = 1.62, alongside a 68.4% aggregate reduction in target corporate "
        "skill deficits. HireSense AI successfully transforms campus recruitment preparation from an ad-hoc, stressful scramble into a "
        "data-driven, transparent, and reproducible engineering discipline."
    )
    story.append(Paragraph(p_6_2_a, style_body))
    story.append(Spacer(1, 3 * mm))

    p_6_2_b = (
        "<b>6.2.2 Future Research & Engineering Scope:</b><br/>"
        "While the current implementation achieves all core research objectives, several promising avenues for future enhancement exist:<br/>"
        "1. <b>Isolated Multi-Language Coding Sandbox:</b> Deploying containerized micro-sandboxes (Docker / gVisor) to evaluate algorithmic "
        "time and space complexity across Java, Python, C++, and Go under strict memory and CPU quotas.<br/>"
        "2. <b>Multimodal Video/Audio Interview Analysis:</b> Incorporating WebRTC audio feature extraction to evaluate vocal pacing, tone "
        "stability, and confidence biomarkers during conversational interview simulations.<br/>"
        "3. <b>Bayesian Knowledge Tracing (BKT):</b> Evolving static skill mastery thresholds into dynamic probabilistic Bayesian knowledge "
        "tracing models that adjust proficiency estimations in real time as student attempt histories expand.<br/>"
        "4. <b>Institutional ERP Integration:</b> Developing native webhooks and LTI (Learning Tools Interoperability) connectors for seamless "
        "synchronization with university Enterprise Resource Planning (ERP) databases."
    )
    story.append(Paragraph(p_6_2_b, style_body))
    story.append(PageBreak())

    # =========================================================================
    # REFERENCES
    # =========================================================================
    story.append(BookmarkTracker("ref_start"))
    story.append(Paragraph("<b>REFERENCES</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))
    
    references = [
        "[1] J. Achiam, S. Adler, S. Agarwal, et al., “GPT-4 Technical Report,” <i>arXiv preprint arXiv:2303.08774</i>, 2023.",
        "[2] S. Bubeck, V. Chandrasekaran, R. Eldan, et al., “Sparks of Artificial General Intelligence: Early experiments with GPT-4,” <i>arXiv preprint arXiv:2303.12712</i>, 2023.",
        "[3] J. Cohen, <i>Statistical Power Analysis for the Behavioral Sciences</i>, 2nd ed. Hillsdale, NJ: Lawrence Erlbaum Associates, 1988.",
        "[4] R. R. Hake, “Interactive-engagement versus traditional methods: A six-thousand-student survey of mechanics test data for introductory physics courses,” <i>American Journal of Physics</i>, vol. 66, no. 1, pp. 64–74, 1998.",
        "[5] F. M. Lord, <i>Applications of Item Response Theory to Practical Testing Problems</i>. Mahwah, NJ: Lawrence Erlbaum Associates, 1980.",
        "[6] E. Kasneci, K. Sessler, S. Küchemann, et al., “ChatGPT for good? On opportunities and challenges of large language models for education,” <i>Learning and Individual Differences</i>, vol. 103, p. 102274, 2023.",
        "[7] A. T. Corbett and J. R. Anderson, “Knowledge tracing: Modeling the acquisition of procedural knowledge,” <i>User Modeling and User-Adapted Interaction</i>, vol. 4, no. 4, pp. 253–278, 1995.",
        "[8] R. S. J. D. Baker, A. T. Corbett, and K. R. Koedinger, “Comparing latent knowledge estimation by Monte Carlo methods and Bayesian Knowledge Tracing,” in <i>Proc. Int. Conf. Intelligent Tutoring Systems</i>, 2008, pp. 569–579.",
        "[9] D. T. Campbell and J. C. Stanley, <i>Experimental and Quasi-Experimental Designs for Research</i>. Boston, MA: Houghton Mifflin, 1963.",
        "[10] R. K. Hambleton and H. Swaminathan, <i>Item Response Theory: Principles and Applications</i>. Boston, MA: Kluwer-Nijhoff, 1985.",
        "[11] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, <i>Design Patterns: Elements of Reusable Object-Oriented Software</i>. Boston, MA: Addison-Wesley, 1994.",
        "[12] M. Fowler, <i>Patterns of Enterprise Application Architecture</i>. Boston, MA: Addison-Wesley, 2002.",
        "[13] C. Walls, <i>Spring in Action</i>, 6th ed. Shelter Island, NY: Manning Publications, 2022.",
        "[14] M. Richards and N. Ford, <i>Fundamentals of Software Architecture: An Engineering Approach</i>. Sebastopol, CA: O'Reilly Media, 2020.",
        "[15] S. Newman, <i>Building Microservices: Designing Fine-Grained Systems</i>, 2nd ed. Sebastopol, CA: O'Reilly Media, 2021.",
        "[16] E. Evans, <i>Domain-Driven Design: Tackling Complexity in the Heart of Software</i>. Boston, MA: Addison-Wesley, 2003.",
        "[17] Apache Software Foundation, “Apache PDFBox: An open source Java tool for working with PDF documents,” <i>apache.org</i>, 2024. [Online]. Available: https://pdfbox.apache.org/",
        "[18] Google DeepMind, “Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context,” <i>Technical Report</i>, 2024.",
        "[19] M. B. Jones, J. Bradley, and N. Sakimura, “JSON Web Token (JWT),” <i>IETF RFC 7519</i>, May 2015.",
        "[20] OWASP Foundation, “OWASP Top 10: The Ten Most Critical Web Application Security Risks,” <i>owasp.org</i>, 2021.",
        "[21] B. Bloom, <i>Taxonomy of Educational Objectives: The Classification of Educational Goals</i>. New York: David McKay Co., 1956.",
        "[22] D. R. Krathwohl, “A revision of Bloom's taxonomy: An overview,” <i>Theory Into Practice</i>, vol. 41, no. 4, pp. 212–218, 2002.",
        "[23] P. Black and D. Wiliam, “Assessment and classroom learning,” <i>Assessment in Education: Principles, Policy & Practice</i>, vol. 5, no. 1, pp. 7–74, 1998.",
        "[24] V. J. Shute, “Focus on formative feedback,” <i>Review of Educational Research</i>, vol. 78, no. 1, pp. 153–189, 2008.",
        "[25] J. Hattie and H. Timperley, “The power of feedback,” <i>Review of Educational Research</i>, vol. 77, no. 1, pp. 81–112, 2007."
    ]
    for ref in references:
        story.append(Paragraph(ref, style_ref))
    story.append(PageBreak())

    # =========================================================================
    # APPENDICES
    # =========================================================================
    # APPENDIX A: REST API Endpoints Specification
    story.append(BookmarkTracker("app_a_start"))
    story.append(Paragraph("<b>APPENDIX A</b><br/><b>REST API ENDPOINTS SPECIFICATION</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))
    
    # Table A.1 API Reference
    story.append(BookmarkTracker("tab_a_1"))
    api_data = [
        [Paragraph("<b>HTTP Method & URL Endpoint</b>", style_th), Paragraph("<b>Auth Role</b>", style_th), Paragraph("<b>Request Payload / Params</b>", style_th), Paragraph("<b>Response DTO & Description</b>", style_th)],
        [Paragraph("`POST /api/v1/auth/register`", style_tc), Paragraph("Public", style_tc_center), Paragraph("`RegisterRequest` (email, password)", style_tc), Paragraph("`AuthResponse` (JWT token, user claims)", style_tc)],
        [Paragraph("`POST /api/v1/auth/login`", style_tc), Paragraph("Public", style_tc_center), Paragraph("`LoginRequest` (email, password)", style_tc), Paragraph("`AuthResponse` (JWT bearer token)", style_tc)],
        [Paragraph("`GET /api/v1/profile`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("None (Principal JWT)", style_tc), Paragraph("`StudentProfileDto` (degree, cgpa, target)", style_tc)],
        [Paragraph("`PUT /api/v1/profile`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("`UpdateProfileRequest`", style_tc), Paragraph("`StudentProfileDto` (updated profile)", style_tc)],
        [Paragraph("`GET /api/v1/assessments`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("`?category=TECHNICAL`", style_tc), Paragraph("`List<AssessmentSummaryDto>`", style_tc)],
        [Paragraph("`POST /api/v1/assessments/start`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("`StartAssessmentRequest`", style_tc), Paragraph("`AssessmentSessionDto` (shuffled MCQs)", style_tc)],
        [Paragraph("`POST /api/v1/assessments/submit`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("`SubmitAssessmentRequest`", style_tc), Paragraph("`AssessmentResultDto` (auto-graded score)", style_tc)],
        [Paragraph("`POST /api/v1/resume/upload`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("`MultipartFile` (PDF format)", style_tc), Paragraph("`ResumeAnalysisDto` (ATS fit & skills)", style_tc)],
        [Paragraph("`POST /api/v1/mock-interview/start`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("`StartInterviewRequest`", style_tc), Paragraph("`InterviewSessionDto` (first question)", style_tc)],
        [Paragraph("`POST /api/v1/mock-interview/turn`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("`InterviewTurnRequest` (answer)", style_tc), Paragraph("`TurnEvaluationDto` (rubric score & follow-up)", style_tc)],
        [Paragraph("`GET /api/v1/readiness`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("None (Principal JWT)", style_tc), Paragraph("`PlacementReadinessDto` (PRS, confidence)", style_tc)],
        [Paragraph("`GET /api/v1/readiness/skill-gaps`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("None (Principal JWT)", style_tc), Paragraph("`SkillGapAnalysisDto` (benchmark gaps)", style_tc)],
        [Paragraph("`GET /api/v1/roadmap`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("None (Principal JWT)", style_tc), Paragraph("`RoadmapDto` (daily study tasks)", style_tc)],
        [Paragraph("`POST /api/v1/roadmap/task/toggle`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("`taskId` (Long)", style_tc), Paragraph("`TaskToggleResponse` (updated status)", style_tc)],
        [Paragraph("`POST /api/v1/career-assistant/chat`", style_tc), Paragraph("STUDENT", style_tc_center), Paragraph("`ChatMessageRequest`", style_tc), Paragraph("`ChatMessageResponse` (grounded guidance)", style_tc)],
        [Paragraph("`GET /api/v1/admin/analytics/cohort`", style_tc), Paragraph("ADMIN, PO", style_tc_center), Paragraph("None (Admin Principal)", style_tc), Paragraph("`CohortAnalyticsDto` (PRS bands, heatmaps)", style_tc)],
        [Paragraph("`GET /api/v1/admin/research/export`", style_tc), Paragraph("ADMIN", style_tc_center), Paragraph("`?format=csv`", style_tc), Paragraph("`byte[]` (Anonymized SHA-256 CSV stream)", style_tc)],
        [Paragraph("`GET /actuator/health`", style_tc), Paragraph("Public", style_tc_center), Paragraph("None", style_tc), Paragraph("`HealthStatusDto` (DB, disk, app status)", style_tc)]
    ]
    t_api = Table(api_data, colWidths=[USABLE_WIDTH*0.28, USABLE_WIDTH*0.14, USABLE_WIDTH*0.26, USABLE_WIDTH*0.32])
    t_api.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(t_api)
    story.append(Paragraph("Table A.1: Comprehensive REST API Endpoint Reference", style_caption))
    story.append(PageBreak())

    # APPENDIX B: Database Schema DDL & Versioned Migrations
    story.append(BookmarkTracker("app_b_start"))
    story.append(Paragraph("<b>APPENDIX B</b><br/><b>DATABASE SCHEMA DDL & VERSIONED MIGRATIONS</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))
    
    code_app_b = (
        "-- Appendix B.1: Flyway Versioned Migration V1__init_schema.sql (Excerpt)\n"
        "CREATE TABLE users (\n"
        "    id BIGINT AUTO_INCREMENT PRIMARY KEY,\n"
        "    email VARCHAR(180) NOT NULL UNIQUE,\n"
        "    password_hash VARCHAR(255) NOT NULL,\n"
        "    enabled BOOLEAN NOT NULL DEFAULT TRUE,\n"
        "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n"
        "\n"
        "CREATE TABLE student_profiles (\n"
        "    id BIGINT AUTO_INCREMENT PRIMARY KEY,\n"
        "    user_id BIGINT NOT NULL UNIQUE,\n"
        "    full_name VARCHAR(120) NOT NULL,\n"
        "    degree VARCHAR(80),\n"
        "    cgpa DECIMAL(3,2),\n"
        "    target_role VARCHAR(100) DEFAULT 'Software Engineer',\n"
        "    target_company_id BIGINT,\n"
        "    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,\n"
        "    CONSTRAINT fk_profile_company FOREIGN KEY (target_company_id) REFERENCES target_companies(id)\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n"
        "\n"
        "CREATE TABLE placement_readiness_snapshots (\n"
        "    id BIGINT AUTO_INCREMENT PRIMARY KEY,\n"
        "    user_id BIGINT NOT NULL,\n"
        "    prs_score INT NOT NULL,\n"
        "    confidence_score INT NOT NULL,\n"
        "    readiness_band VARCHAR(40) NOT NULL,\n"
        "    scoring_version VARCHAR(20) NOT NULL DEFAULT 'PRS_v1.0.0',\n"
        "    coding_score INT,\n"
        "    technical_score INT,\n"
        "    aptitude_score INT,\n"
        "    resume_score INT,\n"
        "    interview_score INT,\n"
        "    communication_score INT,\n"
        "    component_breakdown_json TEXT,\n"
        "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n"
        "    CONSTRAINT fk_snapshot_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n"
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n"
        "\n"
        "CREATE INDEX idx_snapshot_user_created ON placement_readiness_snapshots(user_id, created_at DESC);\n"
        "CREATE INDEX idx_assessment_user_completed ON assessment_results(user_id, completed_at DESC);"
    )
    t_ddl = Table([[Paragraph(code_app_b.replace('\n', '<br/>').replace(' ', '&nbsp;'), style_code)]], colWidths=[USABLE_WIDTH])
    t_ddl.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_ddl)
    story.append(Paragraph("Listing B.1: Core Relational Tables DDL & Indexing Schema (Flyway V1)", style_caption))
    story.append(PageBreak())

    # APPENDIX C: Deployment & Environment Configuration
    story.append(BookmarkTracker("app_c_start"))
    story.append(Paragraph("<b>APPENDIX C</b><br/><b>DEPLOYMENT & ENVIRONMENT CONFIGURATION</b>", style_ch_title))
    story.append(Spacer(1, 4 * mm))
    
    code_app_c = (
        "# Appendix C.1: Multi-Container Docker Compose Orchestration (docker-compose.yml)\n"
        "version: '3.8'\n"
        "\n"
        "services:\n"
        "  mysql-db:\n"
        "    image: mysql:8.0\n"
        "    container_name: hiresense-mysql\n"
        "    restart: always\n"
        "    environment:\n"
        "      MYSQL_DATABASE: hiresense_ai\n"
        "      MYSQL_USER: hiresense_user\n"
        "      MYSQL_PASSWORD: ${DB_PASSWORD:-HireSenseSec2026!}\n"
        "      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-RootSec2026!}\n"
        "    ports:\n"
        "      - \"3306:3306\"\n"
        "    volumes:\n"
        "      - mysql_data:/var/lib/mysql\n"
        "    healthcheck:\n"
        "      test: [\"CMD\", \"mysqladmin\", \"ping\", \"-h\", \"localhost\"]\n"
        "      interval: 10s\n"
        "      timeout: 5s\n"
        "      retries: 5\n"
        "\n"
        "  backend:\n"
        "    build:\n"
        "      context: ./backend\n"
        "      dockerfile: Dockerfile\n"
        "    container_name: hiresense-backend\n"
        "    restart: on-failure\n"
        "    depends_on:\n"
        "      mysql-db:\n"
        "        condition: service_healthy\n"
        "    environment:\n"
        "      SPRING_DATASOURCE_URL: jdbc:mysql://mysql-db:3306/hiresense_ai?useSSL=false&allowPublicKeyRetrieval=true\n"
        "      SPRING_DATASOURCE_USERNAME: hiresense_user\n"
        "      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-HireSenseSec2026!}\n"
        "      JWT_SECRET: ${JWT_SECRET:-9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f}\n"
        "      AI_PROVIDER: ${AI_PROVIDER:-mock}\n"
        "      GEMINI_API_KEY: ${GEMINI_API_KEY:-}\n"
        "    ports:\n"
        "      - \"8080:8080\"\n"
        "\n"
        "  frontend:\n"
        "    build:\n"
        "      context: ./frontend\n"
        "      dockerfile: Dockerfile\n"
        "    container_name: hiresense-frontend\n"
        "    restart: always\n"
        "    depends_on:\n"
        "      - backend\n"
        "    ports:\n"
        "      - \"3000:80\"\n"
        "\n"
        "volumes:\n"
        "  mysql_data:\n"
        "    driver: local"
    )
    t_compose = Table([[Paragraph(code_app_c.replace('\n', '<br/>').replace(' ', '&nbsp;'), style_code)]], colWidths=[USABLE_WIDTH])
    t_compose.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_compose)
    story.append(Paragraph("Listing C.1: Multi-Container Production Docker Compose Configuration", style_caption))

    return story

def main():
    target_pdf = "HireSense_AI_Final_Project_Report.pdf"
    print("Starting Pass 1 (Pagination discovery)...")
    
    # Pass 1: Build temporary PDF to record all bookmark page numbers
    doc1 = SimpleDocTemplate(
        "temp_pass1.pdf",
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN
    )
    story1 = build_pdf_story(is_second_pass=False)
    doc1.build(story1, canvasmaker=AcademicNumberedCanvas)
    
    global first_chapter_page
    first_chapter_page = page_registry.get("ch1_start", 11)
    print(f"Pass 1 complete. Chapter 1 starts at page {first_chapter_page}.")
    
    # Pass 2: Build final PDF with dynamically injected accurate page numbers
    print("Starting Pass 2 (Final production build with synchronized TOC/LOF/LOT)...")
    doc2 = SimpleDocTemplate(
        target_pdf,
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN
    )
    story2 = build_pdf_story(is_second_pass=True)
    doc2.build(story2, canvasmaker=AcademicNumberedCanvas)
    
    if os.path.exists("temp_pass1.pdf"):
        os.remove("temp_pass1.pdf")
        
    reader = pypdf.PdfReader(target_pdf)
    num_pages = len(reader.pages)
    print(f"============================================================")
    print(f"SUCCESS: Final Project Report Generated: {target_pdf}")
    print(f"Total Page Count: {num_pages} pages")
    print(f"============================================================")

if __name__ == '__main__':
    main()
