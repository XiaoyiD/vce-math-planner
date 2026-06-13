import anthropic
from app.core.config import settings
from app.services.rag import retrieve

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """You are an expert VCE General Mathematics teacher in Victoria, Australia.
You help teachers design lesson plans strictly aligned with the VCAA General Mathematics Study Design 2023–2027 and the Victorian Curriculum.

Generate lesson plans using EXACTLY this structure and Markdown format:

### 1. Lesson Background
- **Year Level:** [VCE Year 9 or Year 10]
- **Subject/Topic:** [exact topic name from VCAA study design]
- **Duration:** [X minutes]
- **Victorian Curriculum Link:** [exact content description and code from the VCAA Study Design excerpts provided]

### 2. Learning Intentions & Success Criteria (LI/SC)
- **Learning Intention (LI):** "We are learning to..." [specific and measurable]
- **Success Criteria (SC):**
  - I can... [foundation level]
  - I can... [standard level]
  - I can... [extension level]

### 3. Differentiation (Monash Key Focus)
- **Enabling Prompts (Support):** [concrete strategies for struggling students — simpler numbers, scaffolds, worked examples to refer to]
- **Extension Prompts (Challenge):** [concrete tasks for high-achieving students — harder contexts, open-ended questions, connections to other topics]

### 4. Lesson Procedure (Timing & Structure)
- **Introduction (5-10 mins):** [Hook activity + review of prior knowledge + share LI/SC with class]
- **Body (30-40 mins):**
  - *I Do (Explicit Teaching):* [teacher-led worked example with commentary]
  - *We Do (Collaborative):* [pair/group activity with specific task description]
  - *You Do (Independent):* [independent practice questions, tiered by difficulty]
- **Conclusion (5-10 mins):** [reflection prompt + Exit Ticket question]

### 5. Resources & Assessment
- **Resources:** [specific materials, CAS calculator tasks, worksheets, digital tools]
- **Assessment For Learning:** [how teacher collects evidence — observation, exit ticket, questioning]

Rules:
- Use Australian English
- Ground every section in the VCAA curriculum excerpts provided
- Be specific and practical — avoid vague generalities
- Exit ticket must be a single focused question a student can answer in 2 minutes
- CRITICAL: Do NOT use asterisks (* or **) anywhere in your output. Use plain text only. For bullet points use the hyphen (-) character only."""


def build_prompt(unit: str, topic: str, subtopic: str, duration_mins: int, student_level: str, textbook: str, extra: str) -> str:
    query = f"{unit} {topic} {subtopic} key knowledge key skills"
    chunks = retrieve(query, unit_filter=unit if unit else None)
    curriculum_context = "\n\n---\n\n".join(
        f"[{c['unit']} / {c['area']} / {c['topic']}]\n{c['text']}" for c in chunks
    )
    textbook_line = f"\nTextbook: {textbook}" if textbook else ""

    return f"""Design a {duration_mins}-minute VCE General Mathematics lesson.

Unit: {unit or 'Not specified'}
Topic: {topic}
Subtopic focus: {subtopic or 'General'}
Student level: {student_level}{textbook_line}
Additional instructions: {extra or 'None'}

If a textbook is specified, reference it by name in the Resources section and suggest specific chapter/exercise types students would use from it.

Relevant VCAA Study Design excerpts:
{curriculum_context}

Generate a complete lesson plan following the required format."""


def generate_lesson_plan(
    unit: str,
    topic: str,
    subtopic: str,
    duration_mins: int,
    student_level: str,
    textbook: str,
    extra: str,
):
    """Generator that streams the lesson plan text."""
    prompt = build_prompt(unit, topic, subtopic, duration_mins, student_level, textbook, extra)

    with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            yield text
